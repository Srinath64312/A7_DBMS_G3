"""
Distributed Rate Limiter Service with Sliding Window Algorithm
Implements RFC 6585 (HTTP 429 Too Many Requests) and RFC 9110 rate limit headers.
Course: 25CS1302E - DBS-DBD (Department of CSE, KL University)
"""
import time
import functools
import logging
from datetime import datetime, timedelta, timezone
from typing import Tuple, Dict, List
from flask import request, jsonify, make_response

logger = logging.getLogger("RateLimiter")

# In-memory sliding window storage: key -> list of UTC timestamp floats
_request_windows: Dict[str, List[float]] = {}

# Global rate limiting telemetry
_limiter_metrics = {
    "total_checked": 0,
    "total_blocked": 0,
    "active_keys": 0
}

def clean_expired_timestamps(timestamps: List[float], cutoff: float) -> List[float]:
    """Prunes timestamps older than the sliding window threshold"""
    return [t for t in timestamps if t > cutoff]

def check_rate_limit(key: str, limit: int, window_seconds: int = 60) -> Tuple[bool, int, int]:
    """
    Evaluates request rate for a given key using the Sliding Window Log algorithm.
    Returns: (is_allowed: bool, remaining_requests: int, reset_epoch: int)
    """
    global _limiter_metrics
    now = time.time()
    cutoff = now - window_seconds
    reset_epoch = int(now + window_seconds)

    _limiter_metrics["total_checked"] += 1

    if key not in _request_windows:
        _request_windows[key] = [now]
        _limiter_metrics["active_keys"] = len(_request_windows)
        return True, limit - 1, reset_epoch

    # Filter out entries older than current sliding window
    timestamps = clean_expired_timestamps(_request_windows[key], cutoff)

    if len(timestamps) >= limit:
        # Rate limit exceeded
        _limiter_metrics["total_blocked"] += 1
        _request_windows[key] = timestamps
        oldest_in_window = timestamps[0]
        retry_reset = int(oldest_in_window + window_seconds)
        remaining = 0
        return False, remaining, max(retry_reset, int(now + 1))

    # Allow request and append timestamp
    timestamps.append(now)
    _request_windows[key] = timestamps
    _limiter_metrics["active_keys"] = len(_request_windows)
    remaining = max(0, limit - len(timestamps))
    return True, remaining, reset_epoch

def get_client_identifier() -> str:
    """Derives client identity from authenticated user ID or remote IP address"""
    # 1. Prefer authenticated user ID if already extracted
    current_user = getattr(request, "current_user", None)
    if current_user and isinstance(current_user, dict) and current_user.get("user_id"):
        return f"user:{current_user['user_id']}"

    # 2. Check X-Forwarded-For (reverse proxies)
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return f"ip:{forwarded.split(',')[0].strip()}"

    # 3. Fallback to direct client IP
    return f"ip:{request.remote_addr or '127.0.0.1'}"

def rate_limit(limit: int = 60, window_seconds: int = 60, key_prefix: str = ""):
    """
    Decorator to enforce rate limiting on Flask route endpoints.
    Returns HTTP 429 with standard headers when limit is exceeded.
    """
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            client_id = get_client_identifier()
            prefix = key_prefix or request.endpoint or "api"
            rate_key = f"ratelimit:{prefix}:{client_id}"

            allowed, remaining, reset_epoch = check_rate_limit(rate_key, limit, window_seconds)
            now = int(time.time())
            retry_after = max(1, reset_epoch - now)

            if not allowed:
                logger.warning(f"⚠️ Rate limit exceeded for {client_id} on {request.path} (Limit: {limit}/{window_seconds}s)")
                response = make_response(jsonify({
                    "error": "Too Many Requests",
                    "message": f"Rate limit exceeded: maximum {limit} requests per {window_seconds} seconds.",
                    "limit": limit,
                    "window_seconds": window_seconds,
                    "retry_after": retry_after
                }), 429)
                response.headers["Retry-After"] = str(retry_after)
                response.headers["X-RateLimit-Limit"] = str(limit)
                response.headers["X-RateLimit-Remaining"] = "0"
                response.headers["X-RateLimit-Reset"] = str(reset_epoch)
                return response

            # Execute underlying endpoint
            result = fn(*args, **kwargs)

            # Inject rate limit headers into successful response
            response = make_response(result)
            response.headers["X-RateLimit-Limit"] = str(limit)
            response.headers["X-RateLimit-Remaining"] = str(remaining)
            response.headers["X-RateLimit-Reset"] = str(reset_epoch)
            return response
        return wrapper
    return decorator

def get_rate_limit_stats() -> dict:
    """Returns real-time telemetry on rate limiting activity"""
    now = datetime.now(timezone.utc).isoformat()
    return {
        "timestamp": now,
        "total_requests_evaluated": _limiter_metrics["total_checked"],
        "total_requests_blocked": _limiter_metrics["total_blocked"],
        "active_tracked_keys": len(_request_windows)
    }

def reset_rate_limits():
    """Flushes active rate limit memory buffers (useful for automated testing)"""
    global _request_windows, _limiter_metrics
    _request_windows.clear()
    _limiter_metrics = {"total_checked": 0, "total_blocked": 0, "active_keys": 0}
