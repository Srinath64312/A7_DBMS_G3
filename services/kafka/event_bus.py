"""
Apache Kafka Event Bus & Event-Driven Architecture (EDA) Service
Course: 25CS1302E - DBS-DBD (Department of CSE, KL University)

Topics:
- commerce.order.placed: Emitted upon ACID checkout initiation
- commerce.payment.completed: Emitted after Razorpay/UPI/Card confirmation
- commerce.inventory.deducted: Emitted after warehouse stock subtraction
- commerce.seller.onboarded: Emitted when a new verified seller registers
"""
import os
import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Callable, List

logger = logging.getLogger("KafkaEventBus")

# In-memory event audit log for transparent inspection during evaluation
EVENT_AUDIT_LOG: List[Dict[str, Any]] = []

KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
_KAFKA_PRODUCER = None

def get_kafka_producer():
    """Lazily initializes kafka-python or confluent-kafka producer if installed/running"""
    global _KAFKA_PRODUCER
    if _KAFKA_PRODUCER is not None:
        return _KAFKA_PRODUCER
    try:
        from kafka import KafkaProducer
        _KAFKA_PRODUCER = KafkaProducer(
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
            value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            request_timeout_ms=1500
        )
        logger.info(f"Connected to live Apache Kafka broker at {KAFKA_BOOTSTRAP_SERVERS}")
    except Exception as e:
        logger.info(f"Kafka live broker offline ({e}). Running in Event-Driven Simulator Mode.")
        _KAFKA_PRODUCER = False
    return _KAFKA_PRODUCER

def publish_event(topic: str, event_payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Publishes an asynchronous domain event to an Apache Kafka topic.
    Appends metadata (event_id, timestamp, schema_version).
    """
    envelope = {
        "event_id": f"evt_{os.urandom(6).hex()}",
        "topic": topic,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "schema_version": "2.0",
        "payload": event_payload
    }

    # Record in audit log
    EVENT_AUDIT_LOG.append(envelope)
    if len(EVENT_AUDIT_LOG) > 100:
        EVENT_AUDIT_LOG.pop(0)

    # Attempt publishing to real broker if available
    producer = get_kafka_producer()
    if producer:
        try:
            producer.send(topic, envelope)
            producer.flush()
            logger.info(f" [Kafka] Event dispatched to topic '{topic}' -> {envelope['event_id']}")
        except Exception as e:
            logger.warning(f" [Kafka] Broker send failed ({e}), saved to audit log.")
    else:
        logger.info(f"⚡ [EventBus Simulator] Event dispatched to topic '{topic}' -> {envelope['event_id']}")

    return envelope

def get_event_stream(topic: str = None, limit: int = 20) -> List[Dict[str, Any]]:
    """Returns the live stream of recent domain events for monitoring and viva defense"""
    if topic:
        filtered = [e for e in EVENT_AUDIT_LOG if e["topic"] == topic]
        return filtered[-limit:]
    return EVENT_AUDIT_LOG[-limit:]
