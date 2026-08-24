export interface ProductImage {
  url: string;
  alt?: string;
  publicId?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  /** Preço em centavos. */
  price: number;
  stock: number;
  category: string;
  images: ProductImage[];
  active?: boolean;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export type OrderStatus = 'pending' | 'processing' | 'paid' | 'canceled' | 'expired';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  status: OrderStatus;
  customer: { name: string; email?: string };
  items: OrderItem[];
  subtotal: number;
  total: number;
  createdAt: string;
  paidAt?: string;
  thankYouEmailSent?: boolean;
  payment: {
    method: string;
    status: PaymentStatus;
    amount?: number;
    expiresAt?: string;
    pix?: { qrCodeImage?: string; copyPaste?: string };
  };
}

export interface CreateOrderPayload {
  customer: { name: string; email?: string };
  items: Array<{ productId: string; quantity: number }>;
  paymentMethod: 'pix';
}

export interface Dashboard {
  today: { totalSold: number; salesCount: number };
  lowStockThreshold: number;
  lowStockProducts: Array<{ id: string; name: string; stock: number }>;
  recentSales: Array<{
    id: string;
    customerName: string;
    total: number;
    itemsCount: number;
    paidAt?: string;
  }>;
}

export interface AdminSession {
  accessToken: string;
  admin: { id: string; name: string; email: string };
}
