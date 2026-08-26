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
  status: 'Pending' | 'Completed' | 'Processing';
}

export interface User {
  username: string;
  isLoggedIn: boolean;
}
