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
  | 'contact'
  | 'faq'
  | 'shipping'
  | 'returns'
  | 'size-guide';

export type GenderType = 'men' | 'women' | 'boys' | 'girls';

export type OrderStatus = 
  | 'Order'
  | 'To Pay'
  | 'To Ship'
  | 'To Receive'
  | 'To Review'
  | 'Completed'
  | 'Cancelled';

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
  status: OrderStatus;
  statusHistory?: { status: OrderStatus; timestamp: string }[];
  review?: Review;
  updatedAt?: string;
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
}

export interface User {
  username: string;
  isLoggedIn: boolean;
}