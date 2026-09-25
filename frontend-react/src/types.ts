export type Role = 'CUSTOMER' | 'WAREHOUSE_MANAGER' | 'ADMIN';

export interface User {
  user_id: string;
  name: string;
  email: string;
  role: Role;
  token?: string;
  access_token?: string;
}

export interface Category {
  category_id: string;
  name: string;
  description?: string;
}

export interface Warehouse {
  warehouse_id: string;
  name: string;
  city: string;
  state?: string;
  capacity?: number;
  active_stock?: number;
}

export interface Product {
  product_id: string;
  name: string;
  sku: string;
  category_id: string;
  category_name?: string;
  price: number;
  description: string;
  image_url?: string;
  tags?: string[];
  attributes?: Record<string, string>;
  total_stock?: number;
  warehouse_stock?: Record<string, number>;
  similarity_score?: number;
}

export interface Review {
  review_id: string;
  product_id: string;
  user_id: string;
  user_name?: string;
  rating: number;
  comment: string;
  created_at?: string;
}

export interface WishlistItem {
  wishlist_id?: string;
  product_id: string;
  name: string;
  price: number;
  sku?: string;
  image_url?: string;
  product?: Product;
  created_at?: string;
}

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  warehouse_id: string;
  warehouse_name: string;
  quantity: number;
  image_url?: string;
}

export interface OrderItem {
  product_id: string;
  name?: string;
  price?: number;
  warehouse_id: string;
  quantity: number;
  line_total?: number;
}

export interface Order {
  order_id: string;
  user_id: string;
  total_amount: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  shipping_address: string;
  created_at: string;
  items?: OrderItem[];
  tracking?: {
    carrier: string;
    tracking_number: string;
    estimated_delivery: string;
    status: string;
  };
}

export interface Address {
  id: string;
  label: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  isDefault?: boolean;
}

export interface TestResultItem {
  name: string;
  description: string;
  status: 'PASS' | 'FAIL' | 'ERROR';
  details?: string;
  duration_ms?: number;
}

export interface TestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  results: TestResultItem[];
}

export interface SqlLabQuestion {
  id: number;
  category: string;
  question: string;
  sql: string;
}

export interface TableColumnMeta {
  name: string;
  type: string;
  nullable: boolean;
  is_pk: boolean;
  is_fk: boolean;
  foreign_key?: {
    column: string;
    foreign_table: string;
    foreign_column: string;
  } | null;
}

export interface TableMeta {
  table_name: string;
  row_count: number;
  columns: TableColumnMeta[];
  primary_keys: string[];
  foreign_keys: {
    column: string;
    foreign_table: string;
    foreign_column: string;
  }[];
}

export interface MongoCollectionMeta {
  collection_name: string;
  document_count: number;
  sample_document?: any;
}

export interface AcidTimelineStep {
  step: number;
  name: string;
  description: string;
  sql: string;
  status: string;
  timestamp: number;
  meta?: any;
}

export interface AcidSimulationResult {
  success: boolean;
  scenario: string;
  title: string;
  result_status: string;
  acid_guarantees?: Record<string, string>;
  timeline?: AcidTimelineStep[];
  matrix?: Array<{
    level: string;
    dirty_reads: string;
    non_repeatable_reads: string;
    phantom_reads: string;
    pg_implementation: string;
  }>;
  total_latency_ms: number;
}

export interface SystemTelemetryData {
  timestamp: string;
  postgres: {
    status: string;
    database_name: string;
    host: string;
    port: number;
    version: string;
    pool_pre_ping: boolean;
    vector_search_ready: boolean;
    database_size?: string;
    active_connections?: number;
    transactions_committed?: number;
    transactions_rolled_back?: number;
    stats_notice?: string;
  };
  mongo: {
    status: string;
    database_name: string;
    uri: string;
    storage_engine: string;
    collections_count?: number;
    objects_count?: number;
    data_size_kb?: number;
    stats_notice?: string;
  };
  redis: {
    status: string;
    ttl_lock_window_seconds: number;
    keyspace_eviction: string;
    stats?: {
      engine: string;
      cached_keys_count: number;
      cached_keys: string[];
      active_reservation_locks_count: number;
      active_reservation_locks: any[];
      metrics: {
        cache_hits: number;
        cache_misses: number;
        cache_hit_rate: string;
        invalidations: number;
        reservations_created: number;
        reservations_released: number;
        reservations_expired: number;
      };
    };
  };
  polyglot_nodes: Array<{
    id: string;
    name: string;
    type: string;
    role: string;
    status: string;
  }>;
}

export interface AuditRecord {
  txn_id: string;
  txn_type: string;
  product_name?: string;
  warehouse_name?: string;
  delta: number;
  reference_order_id?: string;
  performed_by?: string;
  created_at?: string;
}

export interface VivaGuideData {
  course: string;
  department: string;
  team: Array<{
    id: string;
    name: string;
    role: string;
    focus: string;
  }>;
  demo_flow_steps: Array<{
    step: number;
    title: string;
    desc: string;
  }>;
  literature_comparison: Array<{
    study: string;
    tech: string;
    feature: string;
    advantage: string;
    limitation: string;
  }>;
  viva_faq: Array<{
    question: string;
    answer: string;
  }>;
}
