"""
Cache & Distributed Lock Manager with Real-Time Performance Telemetry
Implements Cache-Aside pattern, TTL-based stock reservation locks, cache invalidation,
and hit/miss performance metrics.
"""
import time
import json
import logging
from backend import config

logger = logging.getLogger("CacheManager")

# In-memory stores for TTL cache and reservation locks
_memory_cache = {}        # key -> (value, expire_timestamp)
_reservation_locks = {}   # "stock:{product_id}:{user_id}" -> {qty, warehouse_id, expires_at}

# Cache Telemetry & Hit/Miss Metrics
_cache_metrics = {
    "hits": 0,
    "misses": 0,
    "invalidations": 0,
    "reservations_created": 0,
    "reservations_released": 0,
    "reservations_expired": 0
}

def get_cached(key):
    """Retrieve item from cache if not expired; records hit/miss metrics"""
    global _cache_metrics
    now = time.time()
    if key in _memory_cache:
        val, expires_at = _memory_cache[key]
        if expires_at > now:
            _cache_metrics["hits"] += 1
            # Return a copy to avoid in-place mutation of cached object
            if isinstance(val, dict):
                return dict(val)
            elif isinstance(val, list):
                return list(val)
            return val
        else:
            del _memory_cache[key]
    
    _cache_metrics["misses"] += 1
    return None

def set_cached(key, value, ttl_seconds=config.CACHE_DEFAULT_TTL_SECONDS):
    """Store item in cache with TTL"""
    _memory_cache[key] = (value, time.time() + ttl_seconds)

def invalidate_cache(key_prefix=""):
    """Invalidate cache items matching prefix"""
    global _cache_metrics
    if not key_prefix:
        count = len(_memory_cache)
        _memory_cache.clear()
        _cache_metrics["invalidations"] += count
        return count

    keys_to_del = [k for k in _memory_cache if k.startswith(key_prefix)]
    for k in keys_to_del:
        del _memory_cache[k]
    _cache_metrics["invalidations"] += len(keys_to_del)
    return len(keys_to_del)

# ==========================================
# Stock Reservation Locks (Slide 4 & Slide 6)
# ==========================================

def acquire_stock_reservation(product_id, warehouse_id, user_id, quantity, ttl_seconds=config.RESERVATION_TTL_SECONDS):
    """
    Acquires a reservation lock for a user during checkout.
    Key pattern: stock:{product_id}:{user_id}
    """
    global _cache_metrics
    clean_expired_reservations()
    lock_key = f"stock:{product_id}:{user_id}"
    expires_at = time.time() + ttl_seconds
    _reservation_locks[lock_key] = {
        "lock_key": lock_key,
        "product_id": product_id,
        "warehouse_id": warehouse_id,
        "user_id": user_id,
        "quantity": quantity,
        "created_at": time.time(),
        "expires_at": expires_at,
        "ttl_remaining_seconds": ttl_seconds
    }
    _cache_metrics["reservations_created"] += 1
    logger.info(f"🔒 Acquired stock reservation lock {lock_key} for qty={quantity} (TTL={ttl_seconds}s)")
    return lock_key

def release_stock_reservation(product_id, user_id):
    """Releases an existing stock reservation lock"""
    global _cache_metrics
    lock_key = f"stock:{product_id}:{user_id}"
    if lock_key in _reservation_locks:
        del _reservation_locks[lock_key]
        _cache_metrics["reservations_released"] += 1
        logger.info(f"🔓 Released stock reservation lock {lock_key}")
        return True
    return False

def get_active_reservations(product_id=None):
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

def clean_expired_reservations():
    """Reconciliation job: Auto-releases expired reservation locks"""
    global _cache_metrics
    now = time.time()
    expired_keys = [k for k, v in _reservation_locks.items() if v["expires_at"] <= now]
    for k in expired_keys:
        logger.info(f"⏰ Auto-released expired reservation lock: {k}")
        del _reservation_locks[k]
        _cache_metrics["reservations_expired"] += 1
    return len(expired_keys)

def get_cache_status():
    """Returns detailed cache telemetry and active keys"""
    clean_expired_reservations()
    total_ops = _cache_metrics["hits"] + _cache_metrics["misses"]
    hit_rate = f"{((_cache_metrics['hits'] / total_ops) * 100):.1f}%" if total_ops > 0 else "0.0%"
    
    return {
        "engine": "Redis-Compatible In-Memory Cache & Distributed Lock Manager",
        "cached_keys_count": len(_memory_cache),
        "cached_keys": list(_memory_cache.keys()),
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
