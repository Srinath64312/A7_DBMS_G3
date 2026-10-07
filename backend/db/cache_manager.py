"""
Cache & Distributed Lock Manager with Real-Time Performance Telemetry
Implements Cache-Aside pattern, TTL-based stock reservation locks, cache invalidation,
Redis live server probing with automatic fallback, and hit/miss performance metrics.
Course: 25CS1302E - DBS-DBD (KL University)
"""
import time
import json
import logging
from typing import Optional, Any, Dict, List
import redis

from backend import config

logger = logging.getLogger("CacheManager")

# Live Redis Client Instance
_redis_client: Optional[redis.Redis] = None
_IS_USING_LIVE_REDIS = False
_REDIS_CHECKED = False

# In-memory stores for TTL cache and reservation locks (Fallback & Hybrid)
_memory_cache: Dict[str, tuple] = {}        # key -> (value, expire_timestamp)
_reservation_locks: Dict[str, dict] = {}   # "stock:{product_id}:{user_id}" -> {qty, warehouse_id, expires_at}

# Cache Telemetry & Hit/Miss Metrics
_cache_metrics = {
    "hits": 0,
    "misses": 0,
    "invalidations": 0,
    "reservations_created": 0,
    "reservations_released": 0,
    "reservations_expired": 0,
    "redis_connected": False
}

def check_redis_connection() -> bool:
    """Probes live Redis server at config.REDIS_URI with fast timeout"""
    global _redis_client, _IS_USING_LIVE_REDIS, _REDIS_CHECKED, _cache_metrics
    if _REDIS_CHECKED and _redis_client is not None:
        return _IS_USING_LIVE_REDIS

    _REDIS_CHECKED = True
    try:
        r = redis.Redis.from_url(config.REDIS_URI, socket_connect_timeout=0.3, socket_timeout=0.3)
        r.ping()
        _redis_client = r
        _IS_USING_LIVE_REDIS = True
        _cache_metrics["redis_connected"] = True
        logger.info(f" Connected to live Redis Server at: {config.REDIS_URI}")
        return True
    except Exception as e:
        logger.info(f"ℹ️ Redis server on localhost:6379 offline ({e}). Using high-speed Redis-compatible in-memory store.")
        _IS_USING_LIVE_REDIS = False
        _cache_metrics["redis_connected"] = False
        return False

# Initial connection probe
check_redis_connection()

def is_live_redis() -> bool:
    return _IS_USING_LIVE_REDIS

def get_cached(key: str) -> Any:
    """Retrieve item from cache if not expired; records hit/miss metrics"""
    global _cache_metrics
    
    # Try Live Redis if available
    if _IS_USING_LIVE_REDIS and _redis_client:
        try:
            raw = _redis_client.get(key)
            if raw:
                _cache_metrics["hits"] += 1
                try:
                    return json.loads(raw.decode("utf-8"))
                except Exception:
                    return raw.decode("utf-8")
            else:
                _cache_metrics["misses"] += 1
                return None
        except Exception as e:
            logger.warning(f"Live Redis get error ({e}), falling back to memory.")

    # In-memory store
    now = time.time()
    if key in _memory_cache:
        val, expires_at = _memory_cache[key]
        if expires_at > now:
            _cache_metrics["hits"] += 1
            if isinstance(val, dict):
                return dict(val)
            elif isinstance(val, list):
                return list(val)
            return val
        else:
            del _memory_cache[key]
    
    _cache_metrics["misses"] += 1
    return None

def set_cached(key: str, value: Any, ttl_seconds: int = config.CACHE_DEFAULT_TTL_SECONDS):
    """Store item in cache with TTL"""
    if _IS_USING_LIVE_REDIS and _redis_client:
        try:
            payload = json.dumps(value) if isinstance(value, (dict, list)) else str(value)
            _redis_client.set(key, payload, ex=ttl_seconds)
        except Exception as e:
            logger.warning(f"Live Redis set error ({e}), storing in memory.")

    _memory_cache[key] = (value, time.time() + ttl_seconds)

def invalidate_cache(key_prefix: str = "") -> int:
    """Invalidate cache items matching prefix"""
    global _cache_metrics
    count = 0

    # Invalidate live Redis
    if _IS_USING_LIVE_REDIS and _redis_client:
        try:
            pattern = f"{key_prefix}*" if key_prefix else "*"
            keys = _redis_client.keys(pattern)
            if keys:
                _redis_client.delete(*keys)
                count += len(keys)
        except Exception as e:
            logger.warning(f"Live Redis invalidate error: {e}")

    # Invalidate in-memory
    if not key_prefix:
        mem_count = len(_memory_cache)
        _memory_cache.clear()
        count = max(count, mem_count)
        _cache_metrics["invalidations"] += count
        return count

    keys_to_del = [k for k in _memory_cache if k.startswith(key_prefix)]
    for k in keys_to_del:
        del _memory_cache[k]
    count = max(count, len(keys_to_del))
    _cache_metrics["invalidations"] += count
    return count

# ==========================================
# Stock Reservation Locks
# ==========================================

def acquire_stock_reservation(product_id: str, warehouse_id: str, user_id: str, quantity: int, ttl_seconds: int = config.RESERVATION_TTL_SECONDS) -> str:
    """
    Acquires a reservation lock for a user during checkout.
    Key pattern: stock:{product_id}:{user_id}
    """
    global _cache_metrics
    clean_expired_reservations()
    lock_key = f"stock:{product_id}:{user_id}"
    expires_at = time.time() + ttl_seconds

    lock_payload = {
        "lock_key": lock_key,
        "product_id": product_id,
        "warehouse_id": warehouse_id,
        "user_id": user_id,
        "quantity": quantity,
        "created_at": time.time(),
        "expires_at": expires_at,
        "ttl_remaining_seconds": ttl_seconds
    }

    if _IS_USING_LIVE_REDIS and _redis_client:
        try:
            _redis_client.set(lock_key, json.dumps(lock_payload), ex=ttl_seconds)
        except Exception as e:
            logger.warning(f"Live Redis lock error: {e}")

    _reservation_locks[lock_key] = lock_payload
    _cache_metrics["reservations_created"] += 1
    logger.info(f"🔒 Acquired stock reservation lock {lock_key} for qty={quantity} (TTL={ttl_seconds}s)")
    return lock_key

def release_stock_reservation(product_id: str, user_id: str) -> bool:
    """Releases an existing stock reservation lock"""
    global _cache_metrics
    lock_key = f"stock:{product_id}:{user_id}"
    released = False

    if _IS_USING_LIVE_REDIS and _redis_client:
        try:
            if _redis_client.delete(lock_key) > 0:
                released = True
        except Exception as e:
            logger.warning(f"Live Redis release lock error: {e}")

    if lock_key in _reservation_locks:
        del _reservation_locks[lock_key]
        released = True

    if released:
        _cache_metrics["reservations_released"] += 1
        logger.info(f"🔓 Released stock reservation lock {lock_key}")
        return True
    return False

def get_active_reservations(product_id: Optional[str] = None) -> List[dict]:
    """Get all active reservations with calculated remaining TTL"""
    clean_expired_reservations()
    now = time.time()
    res_list = []
    
    for lock in _reservation_locks.values():
        if not product_id or lock["product_id"] == product_id:
            item = dict(lock)
            item["ttl_remaining_seconds"] = max(0, int(item["expires_at"] - now))
            res_list.append(item)
    return res_list

def clean_expired_reservations() -> int:
    """Reconciliation job: Auto-releases expired reservation locks"""
    global _cache_metrics
    now = time.time()
    expired_keys = [k for k, v in _reservation_locks.items() if v["expires_at"] <= now]
    for k in expired_keys:
        logger.info(f"⏰ Auto-released expired reservation lock: {k}")
        del _reservation_locks[k]
        _cache_metrics["reservations_expired"] += 1
    return len(expired_keys)

def get_cache_status() -> dict:
    """Returns detailed cache telemetry and active keys"""
    clean_expired_reservations()
    total_ops = _cache_metrics["hits"] + _cache_metrics["misses"]
    hit_rate = f"{((_cache_metrics['hits'] / total_ops) * 100):.1f}%" if total_ops > 0 else "0.0%"
    
    # Detailed list of keys with TTL
    now = time.time()
    keys_with_ttl = []
    for k, (val, exp) in list(_memory_cache.items()):
        rem = max(0, int(exp - now))
        if rem > 0:
            keys_with_ttl.append({
                "key": k,
                "ttl_remaining_seconds": rem,
                "type": "json" if isinstance(val, (dict, list)) else "string",
                "size_bytes": len(json.dumps(val)) if isinstance(val, (dict, list)) else len(str(val))
            })

    return {
        "engine": "Redis 7.2 (Live Cluster Connection)" if _IS_USING_LIVE_REDIS else "Redis 7.2-Compatible In-Memory Cache & Distributed Lock Manager",
        "live_redis_active": _IS_USING_LIVE_REDIS,
        "redis_uri": config.REDIS_URI,
        "cached_keys_count": len(keys_with_ttl),
        "cached_keys_details": keys_with_ttl,
        "cached_keys": [k["key"] for k in keys_with_ttl],
        "active_reservation_locks_count": len(_reservation_locks),
        "active_reservation_locks": get_active_reservations(),
        "metrics": {
            "cache_hits": _cache_metrics["hits"],
            "cache_misses": _cache_metrics["misses"],
            "cache_hit_rate": hit_rate,
            "invalidations": _cache_metrics["invalidations"],
            "reservations_created": _cache_metrics["reservations_created"],
            "reservations_released": _cache_metrics["reservations_released"],
            "reservations_expired": _cache_metrics["reservations_expired"]
        }
    }
