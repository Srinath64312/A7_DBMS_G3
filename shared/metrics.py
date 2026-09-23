"""
Observability & Metrics Utility
Uses prometheus_client to track request counts, latencies, and system health.
"""
from prometheus_client import Counter, Histogram, Gauge, make_asgi_app
import time

# --- Metric Definitions ---
# Tracks total requests per endpoint and method
REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total number of HTTP requests",
    ["method", "endpoint", "http_status"]
)

# Tracks request latency (time taken)
REQUEST_LATENCY = Histogram(
    "http_request_duration_seconds",
    "HTTP request latency in seconds",
    ["method", "endpoint"]
)

# Tracks active users or current stock levels (example of a Gauge)
ACTIVE_SESSIONS = Gauge(
    "active_user_sessions",
    "Number of currently active user sessions"
)

def create_metrics_app():
    """
    Returns a Prometheus ASGI app that can be mounted
    into a FastAPI application.
    """
    return make_asgi_app()

def track_request(method, endpoint, status_code, duration):
    """
    Helper to record request metrics.
    """
    REQUEST_COUNT.labels(method=method, endpoint=endpoint, http_status=status_code).inc()
    REQUEST_LATENCY.labels(method=method, endpoint=endpoint).observe(duration)
