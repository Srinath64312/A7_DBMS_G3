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
