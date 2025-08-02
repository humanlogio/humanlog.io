import { Span } from "api/js/types/v1/otel_tracing_pb";
import { Timestamp, Duration } from "@bufbuild/protobuf";
import type { SampleDataScenario } from "@/components/log-interface/query-output/traces/service-map/types";
import { makeSpan } from "@/lib/utils/spanFactories";
import { makeStrKV } from "@/lib/utils/kvFactories";

// Utility functions for creating spans
const createTimestamp = (seconds: number, nanos: number = 0): Timestamp => {
  return new Timestamp({ seconds: BigInt(seconds), nanos });
};

// Base timestamp for all samples (15 seconds ago)
const baseTime = Math.floor(Date.now() / 1000) - 15;

/**
 * Creates sample data for an e-commerce checkout process
 */
export function createECommerceScenario(): SampleDataScenario {
  const traceId = "trace-ecommerce-456";

  const spans = [
    // Root: User checkout process
    makeSpan(
      "checkout-root",
      traceId,
      "",
      "processCheckout",
      "web-frontend",
      createTimestamp(baseTime),
      3500,
      [makeStrKV("user_id", "user-789"), makeStrKV("cart_total", "$299.99")],
    ),

    // Frontend -> API Gateway
    makeSpan(
      "api-gateway-1",
      traceId,
      "checkout-root",
      "routeCheckoutRequest",
      "api-gateway",
      createTimestamp(baseTime + 1),
      3200,
      [makeStrKV("method", "POST"), makeStrKV("path", "/api/v1/checkout")],
    ),

    // API Gateway -> Order Service
    makeSpan(
      "order-service-1",
      traceId,
      "api-gateway-1",
      "createOrder",
      "order-service",
      createTimestamp(baseTime + 2),
      800,
      [makeStrKV("order_id", "ord-123456"), makeStrKV("items_count", "3")],
    ),

    // Order Service -> Inventory Service
    makeSpan(
      "inventory-check",
      traceId,
      "order-service-1",
      "checkInventory",
      "inventory-service",
      createTimestamp(baseTime + 3),
      300,
      [
        makeStrKV("products", "phone,case,charger"),
        makeStrKV("warehouse", "east-1"),
      ],
    ),

    // Inventory Service -> Database
    makeSpan(
      "inventory-db",
      traceId,
      "inventory-check",
      "queryStock",
      "postgres-db",
      createTimestamp(baseTime + 4),
      150,
      [makeStrKV("table", "inventory"), makeStrKV("operation", "SELECT")],
    ),

    // API Gateway -> Payment Service (parallel)
    makeSpan(
      "payment-service-1",
      traceId,
      "api-gateway-1",
      "processPayment",
      "payment-service",
      createTimestamp(baseTime + 2),
      2000,
      [
        makeStrKV("payment_method", "credit_card"),
        makeStrKV("amount", "299.99"),
      ],
    ),

    // Payment Service -> Stripe Gateway
    makeSpan(
      "stripe-charge",
      traceId,
      "payment-service-1",
      "chargeCard",
      "stripe-gateway",
      createTimestamp(baseTime + 3),
      1500,
      [makeStrKV("card_last4", "4242"), makeStrKV("currency", "USD")],
    ),

    // Payment Service -> Fraud Detection
    makeSpan(
      "fraud-check",
      traceId,
      "payment-service-1",
      "analyzeFraud",
      "fraud-detection",
      createTimestamp(baseTime + 4),
      400,
      [makeStrKV("risk_score", "0.12"), makeStrKV("model_version", "v2.1")],
    ),

    // API Gateway -> Notification Service
    makeSpan(
      "notification-1",
      traceId,
      "api-gateway-1",
      "sendConfirmation",
      "notification-service",
      createTimestamp(baseTime + 5),
      600,
      [makeStrKV("channel", "email"), makeStrKV("template", "order_confirmed")],
    ),

    // Notification -> Email Service
    makeSpan(
      "email-send",
      traceId,
      "notification-1",
      "sendEmail",
      "sendgrid-service",
      createTimestamp(baseTime + 6),
      350,
      [
        makeStrKV("recipient", "user@example.com"),
        makeStrKV("status", "delivered"),
      ],
    ),
  ];

  return {
    name: "E-Commerce Checkout",
    description: "Complex microservices architecture for payment processing",
    spans,
    serviceCount: 10,
    architecture: "Microservices with external payment gateway",
  };
}

/**
 * Creates sample data for IoT sensor data processing pipeline
 */
export function createIoTPipelineScenario(): SampleDataScenario {
  const traceId = "trace-iot-sensor-789";

  const spans = [
    // Root: IoT Gateway receives sensor data
    makeSpan(
      "iot-gateway-root",
      traceId,
      "",
      "processSensorData",
      "iot-gateway",
      createTimestamp(baseTime),
      2800,
      [
        makeStrKV("device_id", "temp-sensor-001"),
        makeStrKV("location", "factory-floor-2"),
      ],
    ),

    // IoT Gateway -> Data Validator
    makeSpan(
      "data-validation",
      traceId,
      "iot-gateway-root",
      "validateSensorReading",
      "data-validator",
      createTimestamp(baseTime + 1),
      250,
      [makeStrKV("sensor_type", "temperature"), makeStrKV("reading", "24.5°C")],
    ),

    // IoT Gateway -> Message Queue
    makeSpan(
      "queue-publish",
      traceId,
      "iot-gateway-root",
      "publishToKafka",
      "kafka-cluster",
      createTimestamp(baseTime + 1),
      180,
      [makeStrKV("topic", "sensor-readings"), makeStrKV("partition", "2")],
    ),

    // Kafka -> Stream Processor
    makeSpan(
      "stream-processing",
      traceId,
      "queue-publish",
      "processStream",
      "stream-processor",
      createTimestamp(baseTime + 2),
      1200,
      [makeStrKV("framework", "flink"), makeStrKV("window_size", "5min")],
    ),

    // Stream Processor -> Time Series DB
    makeSpan(
      "timeseries-write",
      traceId,
      "stream-processing",
      "writeTimeSeries",
      "influxdb",
      createTimestamp(baseTime + 3),
      400,
      [makeStrKV("measurement", "temperature"), makeStrKV("retention", "30d")],
    ),

    // Stream Processor -> Anomaly Detector
    makeSpan(
      "anomaly-detection",
      traceId,
      "stream-processing",
      "detectAnomalies",
      "ml-anomaly-detector",
      createTimestamp(baseTime + 3),
      600,
      [
        makeStrKV("algorithm", "isolation_forest"),
        makeStrKV("threshold", "0.1"),
      ],
    ),

    // Anomaly Detector -> Alert Manager
    makeSpan(
      "alert-manager",
      traceId,
      "anomaly-detection",
      "triggerAlert",
      "alert-manager",
      createTimestamp(baseTime + 4),
      300,
      [
        makeStrKV("severity", "warning"),
        makeStrKV("alert_type", "temperature_spike"),
      ],
    ),

    // Alert Manager -> Slack Notifier
    makeSpan(
      "slack-notification",
      traceId,
      "alert-manager",
      "sendSlackAlert",
      "slack-integration",
      createTimestamp(baseTime + 5),
      200,
      [makeStrKV("channel", "#operations"), makeStrKV("message_type", "alert")],
    ),

    // Stream Processor -> Data Lake
    makeSpan(
      "data-archival",
      traceId,
      "stream-processing",
      "archiveToS3",
      "s3-data-lake",
      createTimestamp(baseTime + 4),
      800,
      [makeStrKV("bucket", "iot-archive"), makeStrKV("format", "parquet")],
    ),
  ];

  return {
    name: "IoT Data Pipeline",
    description: "Real-time sensor data processing and anomaly detection",
    spans,
    serviceCount: 9,
    architecture: "Event-driven with stream processing",
  };
}

/**
 * Creates sample data for social media post creation and feed generation
 */
export function createSocialMediaScenario(): SampleDataScenario {
  const traceId = "trace-social-post-101";

  const spans = [
    // Root: User creates post
    makeSpan(
      "mobile-app-root",
      traceId,
      "",
      "createPost",
      "mobile-app",
      createTimestamp(baseTime),
      4200,
      [
        makeStrKV("user_id", "user-social-456"),
        makeStrKV("post_type", "photo_with_caption"),
      ],
    ),

    // Mobile App -> CDN (image upload)
    makeSpan(
      "image-upload",
      traceId,
      "mobile-app-root",
      "uploadImage",
      "cloudflare-cdn",
      createTimestamp(baseTime + 1),
      1200,
      [makeStrKV("file_size", "3.2MB"), makeStrKV("image_format", "jpg")],
    ),

    // Mobile App -> API Gateway
    makeSpan(
      "api-gateway-social",
      traceId,
      "mobile-app-root",
      "processPostCreation",
      "api-gateway",
      createTimestamp(baseTime + 1),
      3500,
      [makeStrKV("method", "POST"), makeStrKV("endpoint", "/api/v2/posts")],
    ),

    // API Gateway -> Content Moderation
    makeSpan(
      "content-moderation",
      traceId,
      "api-gateway-social",
      "moderateContent",
      "content-moderation",
      createTimestamp(baseTime + 2),
      800,
      [
        makeStrKV("ai_model", "safety-classifier-v3"),
        makeStrKV("safety_score", "0.98"),
      ],
    ),

    // Content Moderation -> ML Service
    makeSpan(
      "ml-inference",
      traceId,
      "content-moderation",
      "classifyContent",
      "ml-inference-service",
      createTimestamp(baseTime + 3),
      500,
      [
        makeStrKV("model", "content-safety-v3"),
        makeStrKV("confidence", "0.95"),
      ],
    ),

    // API Gateway -> Post Service
    makeSpan(
      "post-service",
      traceId,
      "api-gateway-social",
      "savePost",
      "post-service",
      createTimestamp(baseTime + 3),
      600,
      [
        makeStrKV("post_id", "post-abc123def"),
        makeStrKV("visibility", "public"),
      ],
    ),

    // Post Service -> MongoDB
    makeSpan(
      "post-db-write",
      traceId,
      "post-service",
      "insertPost",
      "mongodb",
      createTimestamp(baseTime + 4),
      200,
      [makeStrKV("collection", "posts"), makeStrKV("shard_key", "user_id")],
    ),

    // Post Service -> Search Indexer
    makeSpan(
      "search-indexing",
      traceId,
      "post-service",
      "indexPost",
      "elasticsearch",
      createTimestamp(baseTime + 4),
      300,
      [makeStrKV("index", "social_posts"), makeStrKV("doc_type", "post")],
    ),

    // API Gateway -> Feed Generator
    makeSpan(
      "feed-generation",
      traceId,
      "api-gateway-social",
      "updateFollowerFeeds",
      "feed-generator",
      createTimestamp(baseTime + 4),
      2000,
      [
        makeStrKV("algorithm", "relevance_score"),
        makeStrKV("followers", "2847"),
      ],
    ),

    // Feed Generator -> User Graph
    makeSpan(
      "user-graph-query",
      traceId,
      "feed-generation",
      "getFollowers",
      "neo4j-graph",
      createTimestamp(baseTime + 5),
      500,
      [makeStrKV("query_type", "followers"), makeStrKV("depth", "1")],
    ),

    // Feed Generator -> Recommendation Engine
    makeSpan(
      "recommendations",
      traceId,
      "feed-generation",
      "getRecommendations",
      "recommendation-engine",
      createTimestamp(baseTime + 5),
      800,
      [
        makeStrKV("algorithm", "collaborative_filtering"),
        makeStrKV("candidates", "100"),
      ],
    ),

    // Recommendation Engine -> Redis Cache
    makeSpan(
      "cache-update",
      traceId,
      "recommendations",
      "updateCache",
      "redis-cache",
      createTimestamp(baseTime + 6),
      150,
      [makeStrKV("cache_key", "rec:user:456"), makeStrKV("ttl", "1h")],
    ),

    // Feed Generator -> Push Notifications
    makeSpan(
      "push-notifications",
      traceId,
      "feed-generation",
      "sendPushNotifications",
      "notification-service",
      createTimestamp(baseTime + 6),
      700,
      [
        makeStrKV("notification_type", "new_post"),
        makeStrKV("devices", "1247"),
      ],
    ),

    // Notification Service -> FCM
    makeSpan(
      "fcm-delivery",
      traceId,
      "push-notifications",
      "sendToFirebase",
      "firebase-messaging",
      createTimestamp(baseTime + 7),
      400,
      [makeStrKV("platform", "android"), makeStrKV("success_rate", "98.5%")],
    ),

    // Notification Service -> APNS
    makeSpan(
      "apns-delivery",
      traceId,
      "push-notifications",
      "sendToApple",
      "apns-service",
      createTimestamp(baseTime + 7),
      380,
      [makeStrKV("platform", "ios"), makeStrKV("priority", "normal")],
    ),
  ];

  return {
    name: "Social Media Platform",
    description: "Post creation with content moderation and feed generation",
    spans,
    serviceCount: 15,
    architecture: "Microservices with ML inference and graph database",
  };
}

/**
 * Gets all available sample scenarios
 */
export function getAllSampleScenarios(): SampleDataScenario[] {
  return [
    createECommerceScenario(),
    createIoTPipelineScenario(),
    createSocialMediaScenario(),
  ];
}

/**
 * Gets a specific sample scenario by name
 */
export function getSampleScenarioByName(
  name: string,
): SampleDataScenario | null {
  const scenarios = getAllSampleScenarios();
  return scenarios.find((scenario) => scenario.name === name) || null;
}
