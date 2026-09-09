export type PageType =
  | 'home'
  | 'shop'
  | 'clothes'
  | 'shoes'
  | 'pants'
  | 'underwear'
  | 'accessories'
  | 'cart'
  | 'checkout'
  | 'orders'
  | 'login'
  | 'getstarted'
  | 'signin'
  | 'signup'
  | 'forgot'
  | 'reset'
  | 'me'
  | 'edit-profile'
  | 'security'
  | 'contact'
  | 'faq'
  | 'shipping'
  | 'returns'
  | 'size-guide'
  | 'wishlist';

export type GenderType = 'men' | 'women' | 'boys' | 'girls';

export type SortOption =
  | 'default'
  | 'price-asc'
  | 'price-desc'
  | 'name-asc'
  | 'name-desc';

export type OrderStatus = 
  | 'Pending'
  | 'To Ship'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'To Review'
  | 'Completed'
  | 'Cancelled'
  | 'Refund Requested'
  | 'Refunded'
  | 'Return Requested'
  | 'Returned';

export interface Review {
  orderId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  productName?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  image: string;
  bgColor: string;
  textColor: string;
  price: number;
  originalPrice: number;
  category: 'clothes' | 'shoes' | 'pants' | 'underwear' | 'accessories';
  subCategory: string;
  gender: GenderType;
  sizes: string[];
  sizePriceMap?: Record<string, { price: number; original: number }>;
}

// Isang naka-save na item sa Wishlist (product snapshot + stock live from backend).
export interface WishlistItem {
  productId: string;
  addedAt: string;
  product: (ProductItem & {
    stock?: number;
    stockStatus?: string;
    lowStockThreshold?: number;
    originalPrice?: number;
    image?: string;
    color?: string;
    colorName?: string;
  }) | null;
}

export interface SubCategoryHeadline {
  main: string;
  sub: string;
  desc: string;
  price?: number;
  original?: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
  size?: string;
  color?: string;
  subCategory?: string;
  gender?: GenderType;
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar?: string;
  mfaEnabled?: boolean;
}

// Payment status lifecycle. Ang 'Paid' ay tanging mula sa BACKEND payment
// record transition — hindi kailanman galing sa button click ng frontend.
export type PaymentStatus =
  | 'Pending'
  | 'Processing'
  | 'Paid'
  | 'Failed'
  | 'Cancelled'
  | 'Refunded';

// Structured payment info na naka-attach sa isang order. Hindi ito nagtataglay
// ng anumang sensitive na detalye (walang card number, OTP, atbp.) — tanging
// method, status, at reference.
export interface PaymentInfo {
  paymentId?: string;
  method?: string;
  status?: PaymentStatus;
  provider?: string;
  amount?: number;
  currency?: string;
  reference?: string;
  paidAt?: string;
  cancelledAt?: string;
  refundedAt?: string;
  failureReason?: string;
  attempts?: number;
  idempotencyKey?: string;
}

// c-hub-store/src/types.ts

export interface Order {
  orderId: string;
  date: string;
  customer: CustomerDetails;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  discountCode: string;
  total: number;
  payment: string;
  paymentInfo?: PaymentInfo;
  status: OrderStatus;
  statusHistory?: { status: OrderStatus; timestamp: string }[];
  review?: Review;
  updatedAt?: string;
  // ✅ Shipping selections na napili sa checkout
  shippingMethod?: string;
  eta?: string;
  // ✅ Add fulfillment and channel for timeline
  fulfillment?: {
    carrier?: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
    timeline?: Array<{
      status: string;
      time: string;
      location: string;
      note: string;
      completed: boolean;
    }>;
  };
  channel?: string;
  // ✅ Returns & Refunds (structured request + decision)
  refundRequest?: {
    reason: string;
    requestedAt: string;
    denied?: { note?: string; decidedAt?: string; by?: string };
    approved?: { note?: string; decidedAt?: string; by?: string };
  };
  returnRequest?: {
    reason: string;
    requestedAt: string;
    denied?: { note?: string; decidedAt?: string; by?: string };
    approved?: { note?: string; decidedAt?: string; by?: string };
  };
  refund?: {
    status: 'approved' | 'denied';
    amount?: number;
    method?: string;
    note?: string;
    decidedAt: string;
    by?: string;
  };
  returnRef?: {
    status: 'approved' | 'denied';
    note?: string;
    decidedAt: string;
    by?: string;
  };
  refundedAt?: string;
  returnedAt?: string;
}

export interface User {
  username: string;
  isLoggedIn: boolean;
  loginAt?: number;
}