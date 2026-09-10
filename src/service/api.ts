// c-hub-store/src/services/api.ts

const env: Record<string, any> = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};
const processEnv: Record<string, any> = typeof process !== 'undefined' && process.env ? process.env : {};

export const API_BASE_URL = (
  env.VITE_API_URL ||
  processEnv.NEXT_PUBLIC_API_URL ||
  '/api'
).replace(/\/+$/, '');

export const API_SERVER_URL = API_BASE_URL.replace(/\/api$/, '');

// ── Auth token (session) helpers ─────────────────────────────────────────
// Ang token ay inilalabas ng backend sa login/signup. Ginagamit ito para sa
// order ownership (ang customer ay makikita lang ang KANYANG mga order).
// Naka-store sa localStorage — pareho ng ginawa sa admin (chub_admin_session).
const TOKEN_KEY = 'chub_token';

export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setAuthToken = (token: string) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage unavailable */
  }
};

export const clearAuthToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
};

// Headers para sa mga request na nangangailangan ng naka-log-in na session.
export const authHeaders = (): Record<string, string> => {
  const t = getAuthToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

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

// ✅ 3. GET - Kunin ang sariling Orders ng Customer gamit ang Email.
// Ang backend ay nagbabalik lang ng mga order na pagmamay-ari ng session.
export const fetchMyOrders = async (email: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders?email=${encodeURIComponent(email)}`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch my orders');
    return await response.json();
  } catch (error) {
    console.error('❌ My Orders Fetch Error:', error);
    return [];
  }
};

// ✅ 3b. GET - Kunin ang live tracking + status history ng isang order.
// Ang backend ay nagbabalik lang nito sa may-ari ng order (ownership check).
export interface OrderTrackingItem {
  name: string;
  qty?: number;
  price?: number;
  image?: string;
  size?: string;
  color?: string;
}

export interface OrderTrackingEntry {
  status: string;
  timestamp: string;
  by?: string;
  note?: string;
}

export interface OrderTrackingResponse {
  success: boolean;
  order: {
    orderId: string;
    date: string;
    createdAt?: string;
    status: string;
    updatedAt?: string;
    statusHistory: OrderTrackingEntry[];
    items?: OrderTrackingItem[];
    total?: number;
    payment?: string;
    customer?: { name?: string; email?: string; address?: string };
    fulfillment?: {
      carrier?: string;
      trackingNumber?: string;
      estimatedDelivery?: string;
    };
    paymentInfo?: { status?: string; paidAt?: string; method?: string };
  };
}

export const fetchOrderTracking = async (orderId: string): Promise<OrderTrackingResponse> => {
  const response = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}/tracking`, {
    headers: authHeaders(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || 'Could not load tracking info.');
  }
  return data as OrderTrackingResponse;
};

// —— Wishlist (per-user, backend-persisted) —————————————————————————————
// Bawat request ay may authHeaders() — ang backend ay nagbabalik lang ng
// wishlist na pagmamay-ari ng session (hindi nakikita ang sa ibang user).

export interface WishlistServerItem {
  productId: string;
  addedAt: string;
  product: (Record<string, any> & { stock?: number; stockStatus?: string }) | null;
}

// ✅ 3c. GET - Ang buong wishlist ng kasalukuyang user.
export const fetchWishlist = async (): Promise<WishlistServerItem[]> => {
  const response = await fetch(`${API_BASE_URL}/wishlist`, { headers: authHeaders() });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || 'Could not load wishlist.');
  return (data?.items || []) as WishlistServerItem[];
};

// ✅ 3d. POST - Idagdag ang isang product (dedup - hindi madodoble).
export const addWishlistItem = async (productId: string) => {
  const response = await fetch(`${API_BASE_URL}/wishlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ productId }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || 'Could not add to wishlist.');
  return data as { success: boolean; alreadyInWishlist?: boolean; item?: { productId: string; addedAt: string } };
};

// ✅ 3e. DELETE - Alisin ang isang product sa wishlist.
export const removeWishlistItem = async (productId: string) => {
  const response = await fetch(`${API_BASE_URL}/wishlist/${encodeURIComponent(productId)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || 'Could not remove from wishlist.');
  return data as { success: boolean };
};

// ✅ 4. Product Reviews & Ratings
export interface ProductReview {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
  adminReply?: { comment: string; date: string } | null;
}

export interface ProductReviewAggregate {
  success: boolean;
  productId: string;
  averageRating: number;
  ratingCount: number;
  distribution: Record<number, number>;
  reviews: ProductReview[];
}

// GET - Kunin ang mga reviews + aggregate ng isang product (public).
export const fetchProductReviews = async (productId: string): Promise<ProductReviewAggregate> => {
  const response = await fetch(`${API_BASE_URL}/reviews?productId=${encodeURIComponent(productId)}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || 'Could not load reviews.');
  return data as ProductReviewAggregate;
};

// POST - Mag-submit (verified buyer lang). May auth token.
export const submitProductReview = async (reviewData: {
  productId: string;
  rating: number;
  comment: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(reviewData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || 'Could not submit review.');
  return data as { success: boolean; review: ProductReview };
};

// PATCH - I-edit ang sariling review.
export const updateProductReview = async (reviewId: string, patch: { rating?: number; comment?: string }) => {
  const response = await fetch(`${API_BASE_URL}/reviews/${encodeURIComponent(reviewId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(patch),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || 'Could not update review.');
  return data as { success: boolean; review: ProductReview };
};

// DELETE - I-delete ang sariling review.
export const deleteProductReview = async (reviewId: string) => {
  const response = await fetch(`${API_BASE_URL}/reviews/${encodeURIComponent(reviewId)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || 'Could not delete review.');
  return data as { success: boolean };
};

// ✅ 4b. Notifications API (server-synced bell)
export interface ServerNotification {
  id: string;
  email: string;
  username: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  orderId?: string;
  timestamp: string;
  createdAt: string;
  read: boolean;
}

// ✅ Voucher validation response (GET /vouchers/:code).
export interface VoucherValidation {
  valid: boolean;
  code?: string;
  type?: 'percent' | 'fixed';
  value?: number;
  minSubtotal?: number;
  maxDiscount?: number;
  discountAmount?: number;
  description?: string;
  expiresAt?: string | null;
  error?: string;
}

// GET - I-validate ang voucher code para sa checkout preview (walang usage bump).
export const validateVoucher = async (code: string, subtotal: number): Promise<VoucherValidation> => {
  const clean = String(code || '').trim().toUpperCase();
  if (!clean) return { valid: false, error: 'Enter a voucher code.' };
  try {
    const response = await fetch(`${API_BASE_URL}/vouchers/${encodeURIComponent(clean)}?subtotal=${Math.max(0, Math.round(subtotal))}`);
    let payload: any = null;
    try { payload = await response.json(); } catch { /* ignore */ }
    if (!response.ok) {
      const serverMsg = payload?.error || `Could not check voucher (server error ${response.status}). Please try again.`;
      return { valid: false, error: serverMsg };
    }
    if (!payload || typeof payload.valid !== 'boolean') {
      return { valid: false, error: 'Invalid voucher response from server. Please try again.' };
    }
    return payload as VoucherValidation;
  } catch {
    return { valid: false, error: 'Cannot reach the order server. Make sure the backend is running and try again.' };
  }
};

// GET - Kunin ang mga notifications ng user (token required).
export const fetchUserNotifications = async (): Promise<ServerNotification[]> => {
  const response = await fetch(`${API_BASE_URL}/notifications`, { headers: authHeaders() });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || 'Could not load notifications.');
  return Array.isArray(data) ? data : [];
};

// PATCH - Mark lahat bilang basa.
export const markAllNotificationsRead = async (): Promise<boolean> => {
  const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  return response.ok;
};

// PATCH - Mark ang isang notification.
export const markNotificationRead = async (id: string): Promise<boolean> => {
  const response = await fetch(`${API_BASE_URL}/notifications/${encodeURIComponent(id)}/read`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  return response.ok;
};

// DELETE - I-delete ang isang notification.
export const deleteServerNotification = async (id: string): Promise<boolean> => {
  const response = await fetch(`${API_BASE_URL}/notifications/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return response.ok;
};

// DELETE - I-clear lahat ng notifications.
export const clearServerNotifications = async (): Promise<boolean> => {
  const response = await fetch(`${API_BASE_URL}/notifications`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return response.ok;
};


// ✅ 5. POST - Mag-sign up (name + username + email + password).
// Totoong account na naka-save sa backend (data/users.json).
export const signupAccount = async (name: string, username: string, email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, username, email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Could not create account');
  }
  return data as {
    success: boolean;
    user: { name: string; username: string; email: string };
    token?: string;
  };
};

// ✅ 6. POST - Mag-login (username O email + password). Walang MFA na.
export const loginAccount = async (identifier: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Invalid username/email or password');
  }
  return data as {
    success: boolean;
    user: { name: string; username: string; email: string };
    token?: string;
  };
};

// ✅ 7. POST - I-register ang username + email para sa password reset (Forgot Password).
export const registerAccount = async (username: string, email: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/account`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Could not register account');
  }
  return data as { success: boolean; username: string };
};

// ✅ 8. POST - Hingi ng reset token (generic na response, anti-enumeration).
// Sa local/dev (NODE_ENV !== 'production'), kasama sa response ang
// 'devResetToken' para ma-test ang buong flow nang walang email service.
export const requestPasswordReset = async (identifier: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/reset/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Could not request a password reset');
  }
  return data as {
    success: boolean;
    message: string;
    devResetToken?: string;
  };
};

// ✅ 9. POST - I-apply ang reset token (hash match, expiry, single-use).
// Maaaring lagyan ng bagong password para ma-login muli.
export const applyPasswordReset = async (token: string, newPassword?: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/reset/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: token.trim(), newPassword }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Could not reset the password');
  }
  return data as { success: boolean; username: string };
};