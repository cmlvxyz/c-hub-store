// c-hub-store/src/services/api.ts

const env: Record<string, any> = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};
const processEnv: Record<string, any> = typeof process !== 'undefined' && process.env ? process.env : {};

export const API_BASE_URL = (
  env.VITE_API_URL ||
  processEnv.NEXT_PUBLIC_API_URL ||
  'https://c-hub-backend-ijy4.onrender.com/api'
).replace(/\/+$/, '');

export const API_SERVER_URL = API_BASE_URL.replace(/\/api$/, '');

export interface CustomerShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province?: string;
  postalCode?: string;
}

export interface StoreCartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
  subCategory?: string;
  gender?: string;
}

export interface OrderPayload {
  orderId?: string;
  date?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city?: string;
    province?: string;
    postalCode?: string;
  };
  items: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
    size?: string;
    color?: string;
    subCategory?: string;
    gender?: string;
    qty: number;
  }>;
  subtotal: number;
  shipping: number;
  discount: number;
  discountCode?: string;
  total: number;
  payment: string; // 'Cash on Delivery', 'GCash', 'Maya', etc.
  status?: string;
}

// ✅ 1. POST - Gumawa ng bagong Order (Checkout)
export const createStoreOrder = async (orderPayload: OrderPayload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Failed to submit order');
    }

    return data;
  } catch (error: any) {
    console.error('❌ Order Placement Error:', error);
    throw error;
  }
};

// ✅ 2. GET - Kunin ang mga Products mula sa Backend
export const fetchStoreProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return await response.json();
  } catch (error) {
    console.error('❌ Products Fetch Error:', error);
    return [];
  }
};

// ✅ 3. GET - Kunin ang sariling Orders ng Customer gamit ang Email
export const fetchMyOrders = async (email: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders?email=${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error('Failed to fetch my orders');
    return await response.json();
  } catch (error) {
    console.error('❌ My Orders Fetch Error:', error);
    return [];
  }
};

// ✅ 4. POST - Mag-submit ng Customer Review
export const submitStoreReview = async (reviewData: {
  orderId: string;
  customerName: string;
  rating: number;
  comment: string;
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });
    return await response.json();
  } catch (error) {
    console.error('❌ Review Error:', error);
  }
};