"""
Distributed Cache & Lock Manager
Implements Cache-Aside pattern and TTL-based stock reservation locks.
Supports both Redis (for distributed microservices) and In-Memory (for local fallback).
"""
import time
import json
import logging
import redis
from shared.config_base import settings

logger = logging.getLogger("CacheManager")

class CacheManager:
    def __init__(self):
        # Initialize Redis connection
        try:
            self.redis_client = redis.from_url(settings.REDIS_URI, decode_responses=True)
            self.redis_client.ping()
            self.use_redis = True
            logger.info("🚀 CacheManager: Connected to Redis. Distributed mode enabled.")
        except Exception as e:
            logger.warning(f"⚠️ CacheManager: Redis not available ({e}). Falling back to Local In-Memory mode.")
            self.use_redis = False
            self._memory_cache = {}
            self._reservation_locks = {}

        self._metrics = {
            "hits": 0,
            "misses": 0,
            "invalidations": 0,
            "reservations_created": 0,
            "reservations_released": 0,
            "reservations_expired": 0
        }

    def get_cached(self, key):
        """Retrieve item from cache if not expired"""
        if self.use_redis:
            val = self.redis_client.get(key)
            if val:
                self._metrics["hits"] += 1
                return json.loads(val)
        else:
            if key in self._memory_cache:
                val, expires_at = self._memory_cache[key]
                if expires_at > time.time():
                    self._metrics["hits"] += 1
                    return val
                del self._memory_cache[key]

        self._metrics["misses"] += 1
        return None

    def set_cached(self, key, value, ttl_seconds=settings.CACHE_DEFAULT_TTL_SECONDS):
        """Store item in cache with TTL"""
        if self.use_redis:
            self.redis_client.setex(key, ttl_seconds, json.dumps(value))
        else:
            self._memory_cache[key] = (value, time.time() + ttl_seconds)

    def invalidate_cache(self, key_prefix=""):
        """Invalidate cache items matching prefix"""
        if self.use_redis:
            # In Redis, we find keys matching pattern and delete them
            keys = self.redis_client.keys(f"{key_prefix}*")
            if keys:
                self.redis_client.delete(*keys)
                self._metrics["invalidations"] += len(keys)
                return len(keys)
            return 0
        else:
            keys_to_del = [k for k in self._memory_cache if k.startswith(key_prefix)]
            for k in keys_to_del:
                del self._memory_cache[k]
            self._metrics["invalidations"] += len(keys_to_del)
            return len(keys_to_del)

    # ==========================================
    # Stock Reservation Locks (Distributed)
    # ==========================================

    def acquire_stock_reservation(self, product_id, warehouse_id, user_id, quantity, ttl_seconds=settings.RESERVATION_TTL_SECONDS):
        """
        Acquires a reservation lock for a user during checkout.
        Key pattern: stock:{product_id}:{user_id}
        """
        lock_key = f"stock:{product_id}:{user_id}"
        lock_data = {
            "lock_key": lock_key,
            "product_id": product_id,
            "warehouse_id": warehouse_id,
            "user_id": user_id,
            "quantity": quantity,
            "created_at": time.time(),
            "expires_at": time.time() + ttl_seconds
        }

        if self.use_redis:
            # Use Redis SET with NX (Not Exists) and EX (Expiry) for atomic lock
            success = self.redis_client.set(lock_key, json.dumps(lock_data), nx=True, ex=ttl_seconds)
            if success:
                self._metrics["reservations_created"] += 1
                return lock_key
            return None
        else:
            # In-memory fallback
            self._reservation_locks[lock_key] = lock_data
            self._metrics["reservations_created"] += 1
            return lock_key

    def release_stock_reservation(self, product_id, user_id):
        """Releases an existing stock reservation lock"""
        lock_key = f"stock:{product_id}:{user_id}"
        if self.use_redis:
            result = self.redis_client.delete(lock_key)
            if result:
                self._metrics["reservations_released"] += 1
                return True
            return False
        else:
            if lock_key in self._reservation_locks:
                del self._reservation_locks[lock_key]
                self._metrics["reservations_released"] += 1
                return True
            return False

    def get_active_reservations(self, product_id=None):
        """Get all active reservations"""
        if self.use_redis:
            # Search for keys matching stock:*
            keys = self.redis_client.keys("stock:*")
            res_list = []
            for k in keys:
                data = json.loads(self.redis_client.get(k))
                if not product_id or data["product_id"] == product_id:
                    res_list.append(data)
            return res_list
        else:
            # In-memory logic
            now = time.time()
            res_list = []
            expired = []
            for k, lock in self._reservation_locks.items():
                if lock["expires_at"] <= now:
                    expired.append(k)
                elif not product_id or lock["product_id"] == product_id:
                    item = dict(lock)
                    item["ttl_remaining_seconds"] = max(0, int(lock["expires_at"] - now))
                    res_list.append(item)

            for k in expired:
                del self._reservation_locks[k]
                self._metrics["reservations_expired"] += 1
            return res_list

    def get_cache_status(self):
        """Returns detailed cache telemetry"""
        total_ops = self._metrics["hits"] + self._metrics["misses"]
        hit_rate = f"{((self._metrics['hits'] / total_ops) * 100):.1f}%" if total_ops > 0 else "0.0%"

        return {
            "engine": "Redis Distributed Cache" if self.use_redis else "Local In-Memory Fallback",
            "metrics": {
                "cache_hits": self._metrics["hits"],
                "cache_misses": self._metrics["misses"],
                "cache_hit_rate": hit_rate,
                "invalidations": self._metrics["invalidations"],
                "reservations_created": self._metrics["reservations_created"],
                "reservations_released": self._metrics["reservations_released"],
                "reservations_expired": self._metrics["reservations_expired"]
            }
        }

# Global singleton instance
cache_manager = CacheManager()
