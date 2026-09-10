import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { PageType, GenderType, CartItem, Order, User, CustomerDetails, PaymentInfo, WishlistItem, SortOption } from '../types';
import { PRODUCTS_CONFIG } from '../data/products';
import { API_BASE_URL, API_SERVER_URL, registerAccount, signupAccount, fetchStoreProducts, setAuthToken, clearAuthToken, authHeaders, getAuthToken, fetchWishlist, addWishlistItem, removeWishlistItem, fetchUserNotifications, markAllNotificationsRead, markNotificationRead, deleteServerNotification, clearServerNotifications } from '../service/api';
import { setStoredPassword } from '../service/passwords';
import { initiatePayment, isOnlinePayment } from '../service/payments';

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours bago mag-expire ang session

export type OrderCreateResult =
  | { success: true; order: Order }
  | { success: false; error: string };

interface StoreContextType {
  page: PageType;
  gender: GenderType;
  subCategory: string;
  lastCategoryPage: PageType;
  currentProductIndex: number;
  cart: CartItem[];
  orders: Order[];
  user: User;
  splashShown: boolean;
  activeBgColor: string;
  activeTextColor: string;
  isDarkTheme: boolean;
  searchQuery: string;
  sortOption: SortOption;
  shopBgColor: string;
  setShopBgColor: (color: string) => void;
  toast: { message: string; type?: 'info' | 'success' | 'warning' } | null;
  ordersUpdated: number;
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (message: string, type?: 'info' | 'success' | 'warning', orderId?: string) => void;
  markNotificationsRead: () => void;
  syncNotificationsFromServer: () => Promise<void>;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setPage: (page: PageType, subCategory?: string, gender?: GenderType) => void;
  setGender: (gender: GenderType) => void;
  setSubCategory: (sub: string) => void;
  setCurrentProductIndex: (idx: number) => void;
  setSearchQuery: (q: string) => void;
  setSortOption: (opt: SortOption) => void;
  addToCart: (item: {
    id: string;
    name: string;
    price: number;
    image: string;
    size?: string;
    color?: string;
    subCategory?: string;
    gender?: GenderType;
  }, qty?: number) => void;
  updateCartQty: (id: string, size: string | undefined, delta: number) => void;
  removeFromCart: (id: string, size?: string) => void;
  clearCart: () => void;
  stockById: Record<string, number>;
  getStock: (id: string) => number;
  stockStatusOf: (id: string) => 'In Stock' | 'Low Stock' | 'Out of Stock';
  refreshStock: () => Promise<void>;
  wishlist: WishlistItem[];
  wishlistCount: number;
  isInWishlist: (id: string) => boolean;
  addToWishlist: (product: { id: string; name?: string; price?: number; originalPrice?: number; image?: string; bgColor?: string; textColor?: string; category?: string; subCategory?: string; gender?: string; sizes?: string[] }) => void;
  removeFromWishlist: (id: string) => void;
  refreshWishlist: () => Promise<void>;
  createOrder: (customer: CustomerDetails, discountCode: string, paymentMethod: string, items?: CartItem[], shippingMethod?: string, shippingFee?: number, eta?: string) => Promise<OrderCreateResult>;
  checkoutItems: CartItem[];
  setCheckoutItems: (items: CartItem[]) => void;
  login: (username: string) => void;
  completeAuth: (fullName: string, email: string, phone: string, address: string, username: string) => void;
  signup: (fullName: string, username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  customerInfo: CustomerDetails | null;
  saveCustomerInfo: (info: Partial<CustomerDetails>) => void;
  getProfile: (username: string) => CustomerDetails | null;
  showToast: (message: string, type?: 'info' | 'success' | 'warning') => void;
  closeSplash: () => void;
  updateOrderStatus: (orderId: string, newStatus: string) => Promise<Order | null>;
  reflectOrderUpdate: (order: Order) => void;
  cancelOrder: (orderId: string, reason?: string) => Promise<Order | null>;
  requestRefundOrder: (orderId: string, reason: string) => Promise<Order | null>;
  requestReturnOrder: (orderId: string, reason: string) => Promise<Order | null>;
  completeOrderAfterReview: (orderId: string) => Promise<Order | null>;
  refreshOrders: () => Promise<void>;
  clearAllOrders: () => void;
  loadUserOrders: () => void;
  syncOrdersToServer: () => Promise<void>; 
  isLoading: boolean;
}

interface NotificationItem {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  orderId?: string;
  timestamp: string;
  read: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const getCartStorageKey = (username: string) => {
  return `chub_cart_${username.toLowerCase()}`;
};

const getOrdersStorageKey = (username: string) => {
  return `chub_orders_${username.toLowerCase()}`;
};

const getProfileStorageKey = (username: string) => {
  return `chub_profile_${username.toLowerCase()}`;
};

const getWishlistStorageKey = (username: string) => {
  return `chub_wishlist_${username.toLowerCase()}`;
};

const SYNC_URL = `${API_BASE_URL}/orders/sync`;

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [page, setPageState] = useState<PageType>('home');
  const [gender, setGenderState] = useState<GenderType>('men');
  const [subCategory, setSubCategoryState] = useState<string>('tshirt');
  const [currentProductIndex, setCurrentProductIndex] = useState<number>(0);
  const [lastCategoryPage, setLastCategoryPage] = useState<PageType>('clothes');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [shopBgColor, setShopBgColor] = useState<string>('#ffffff');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [user, setUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('chub_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Haba ng session: kung walang loginAt o lampas na sa TTL, i-expire ang session
        // (hindi basta i-leave ang logged-in state).
        if (parsed.isLoggedIn && (!parsed.loginAt || Date.now() - parsed.loginAt > SESSION_TTL_MS)) {
          localStorage.removeItem('chub_user');
          return { username: '', isLoggedIn: false };
        }
        return parsed;
      }
    } catch {
      return { username: '', isLoggedIn: false };
    }
    return { username: '', isLoggedIn: false };
  });

  const [customerInfo, setCustomerInfo] = useState<CustomerDetails | null>(() => {
    try {
      const savedUser = localStorage.getItem('chub_user');
      const savedProfile = savedUser ? JSON.parse(savedUser) : null;
      if (savedProfile?.isLoggedIn && savedProfile.username) {
        const key = getProfileStorageKey(savedProfile.username);
        const profile = localStorage.getItem(key);
        if (profile) return JSON.parse(profile) as CustomerDetails;
      }
    } catch { /* ignore */ }
    return null;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      if (user.isLoggedIn && user.username) {
        const key = getCartStorageKey(user.username);
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          console.log(`🛒 Loaded cart for ${user.username}:`, parsed.length, 'items');
          return parsed;
        }
      }
      return [];
    } catch (e) {
      console.error('Failed to load cart:', e);
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      if (user.isLoggedIn && user.username) {
        const key = getOrdersStorageKey(user.username);
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          console.log(`📦 Loaded orders for ${user.username}:`, parsed.length);
          return parsed;
        }
      }
      return [];
    } catch (e) {
      console.error('Failed to load orders:', e);
      return [];
    }
  });

  const [ordersUpdated, setOrdersUpdated] = useState<number>(0);

  // ✅ WISHLIST (per-user). Local snapshot + backend sync kapag may token.
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    try {
      if (user.isLoggedIn && user.username) {
        const key = getWishlistStorageKey(user.username);
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            console.log(`❤️ Loaded wishlist for ${user.username}:`, parsed.length, 'items');
            return parsed;
          }
        }
      }
      return [];
    } catch (e) {
      console.error('Failed to load wishlist:', e);
      return [];
    }
  });

  // Transient na listahan ng items na pinili sa Cart para sa partial checkout.
  // Hindi ito nire-replace ang cart — ito lang ang "kung anong bibilhin" ngayon.
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);

  // ✅ LIVE STOCK (backend ang single source of truth). Id -> available stock.
  // Kapag walang entry ang isang id (hindi pa naka-fetch o hindi nahanap),
  // ito ay itinuturing na walang laman (0) hanggang sa ma-load mula sa server.
  const [stockById, setStockById] = useState<Record<string, number>>({});

  // I-fetch ang buong product catalog mula sa backend para sa live stock.
  const refreshStock = async () => {
    try {
      const products = await fetchStoreProducts();
      if (Array.isArray(products)) {
        const map: Record<string, number> = {};
        for (const p of products) {
          map[p.id] = Math.floor(Number(p.stock) || 0);
        }
        setStockById(map);
      }
    } catch (e) {
      console.error('❌ Failed to load stock:', e);
    }
  };

  const getStock = (id: string): number => (Number.isFinite(stockById[id]) ? stockById[id] : 0);

  const stockStatusOf = (id: string): 'In Stock' | 'Low Stock' | 'Out of Stock' => {
    const qty = getStock(id);
    if (qty <= 0) return 'Out of Stock';
    return 'In Stock';
  };


  // ✅ ITO ANG TAMANG SETUP PARA LAGING LALABAS ANG SPLASH SA REFRESH
  const [splashShown, setSplashShown] = useState<boolean>(false);

  const [toast, setToast] = useState<{ message: string; type?: 'info' | 'success' | 'warning' } | null>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Local snapshot para hindi mawala kahit offline o guest mode (walang token).
  const persistNotifications = (list: NotificationItem[]) => {
    try {
      const key = user.isLoggedIn && user.username ? `chub_notifs_${user.username.toLowerCase()}` : 'chub_notifs_guest';
      localStorage.setItem(key, JSON.stringify(list.slice(0, 50)));
    } catch { /* ignore */ }
  };

  // I-sync ang notifications mula sa backend (kapag may token). Ang server ang
  // source of truth — pinagsasama rito ang mga lokal lang na estado (SSE/guest).
  const syncNotificationsFromServer = async () => {
    if (!user.isLoggedIn || !getAuthToken()) return;
    try {
      const serverNotifs = await fetchUserNotifications();
      if (!Array.isArray(serverNotifs)) return;
      const serverIds = new Set(serverNotifs.map(s => s.id));
      setNotifications(prev => {
        // Panatilihin ang mga lokal na duplicate-free na SSE/order notifs.
        const localOnly = prev.filter(n => !serverIds.has(n.id) && !serverNotifs.some(s =>
          s.message === n.message && (s.orderId || undefined) === (n.orderId || undefined)
        ));
        const merged = [...serverNotifs, ...localOnly].slice(0, 30);
        persistNotifications(merged);
        return merged;
      });
    } catch (e) {
      console.warn('⚠️ Notification sync failed:', e);
    }
  };

  const addNotification = (message: string, type: 'info' | 'success' | 'warning' = 'info', orderId?: string) => {
    const notification: NotificationItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      message,
      type,
      orderId,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => {
      const next = [notification, ...prev].slice(0, 30);
      persistNotifications(next);
      return next;
    });
    // Isa ring visual toast para siguradong makita ng user
    showToast(message, type);
  };

  const markNotificationsRead = () => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }));
      persistNotifications(next);
      return next;
    });
    // Best-effort sync sa server (mark-all-read).
    if (getAuthToken()) markAllNotificationsRead().catch(() => {});
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => {
      const next = prev.filter(n => n.id !== id);
      persistNotifications(next);
      return next;
    });
    if (getAuthToken()) deleteServerNotification(id).catch(() => {});
  };

  const clearNotifications = () => {
    setNotifications([]);
    persistNotifications([]);
    if (getAuthToken()) clearServerNotifications().catch(() => {});
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const syncOrdersToServer = async () => {
    if (!user.isLoggedIn || !user.username) {
      console.log('⚠️ Cannot sync: User not logged in');
      return;
    }

    if (orders.length === 0) {
      console.log('⏭️ No orders to sync');
      return;
    }

    try {
      console.log(`🔄 Syncing ${orders.length} orders to server...`);
      const response = await fetch(SYNC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ orders })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Synced ${data.count || orders.length} orders to server`);
      } else {
        console.warn('⚠️ Failed to sync orders to server:', response.status);
      }
    } catch (error) {
      console.error('Failed to sync orders:', error);
    }
  };

  const loadUserOrders = () => {
    if (!user.isLoggedIn || !user.username) {
      console.log('⚠️ Cannot load orders: User not logged in');
      setOrders([]);
      return;
    }

    try {
      const key = getOrdersStorageKey(user.username);
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        setOrders(parsed);
        console.log(`📦 Loaded ${parsed.length} orders for ${user.username}`);
        setTimeout(() => syncOrdersToServer(), 500);
      } else {
        setOrders([]);
        console.log(`📦 No orders found for ${user.username}`);
      }
    } catch (e) {
      console.error('Failed to load user orders:', e);
      setOrders([]);
    }
  };

  useEffect(() => {
    if (user.isLoggedIn && user.username && orders.length > 0) {
      const timer = setTimeout(() => {
        syncOrdersToServer();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [orders, user.isLoggedIn, user.username]);

  // I-load agad ang live stock sa pag-mount ng app.
  useEffect(() => {
    refreshStock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      if (user.isLoggedIn && user.username) {
        const key = getCartStorageKey(user.username);
        localStorage.setItem(key, JSON.stringify(cart));
        console.log(`💾 Saved cart for ${user.username}:`, cart.length, 'items');
      }
    } catch (e) {
      console.error('Failed to sync cart:', e);
    }
  }, [cart, user]);

  useEffect(() => {
    try {
      if (user.isLoggedIn && user.username) {
        const key = getOrdersStorageKey(user.username);
        localStorage.setItem(key, JSON.stringify(orders));
        console.log(`💾 Saved orders for ${user.username}:`, orders.length);
      }
    } catch (e) {
      console.error('Failed to sync orders:', e);
    }
  }, [orders, user]);

  useEffect(() => {
    try {
      if (user.isLoggedIn && user.username) {
        const key = getWishlistStorageKey(user.username);
        localStorage.setItem(key, JSON.stringify(wishlist));
      }
    } catch (e) {
      console.error('Failed to sync wishlist:', e);
    }
  }, [wishlist, user]);

  // ✅ WISHLIST ACTIONS — server-side (totoong account) o local (offline/guest mode).
  // Ang wishlist ay laging naka-key sa username (hindi fake account-specific).
  const isInWishlist = (id: string) => wishlist.some(item => item.productId === id);

  const refreshWishlist = async () => {
    try {
      // Kapag may backend token, ang server ang source of truth.
      if (user.isLoggedIn && user.username && getAuthToken()) {
        const items = await fetchWishlist();
        const mapped: WishlistItem[] = items.map(srv => ({
          productId: srv.productId,
          addedAt: srv.addedAt,
          product: srv.product
            ? {
                ...srv.product,
                color: srv.product.color,
                colorName: srv.product.colorName || srv.product.color,
              } as WishlistItem['product']
            : null,
        })).filter((it): it is WishlistItem => !!it.productId);
        setWishlist(mapped);
        console.log(`❤️ Refreshed wishlist from server:`, mapped.length, 'items');
      }
    } catch (e: any) {
      // Offline/stale backend — mananatili ang local snapshot.
      console.warn('Wishlist server refresh failed (using local):', e?.message);
    }
  };

  const addToWishlist = (product: {
    id: string;
    name?: string;
    price?: number;
    originalPrice?: number;
    image?: string;
    bgColor?: string;
    textColor?: string;
    category?: string;
    subCategory?: string;
    gender?: string;
    sizes?: string[];
  }) => {
    if (!user.isLoggedIn) {
      showToast('Sign in to save items to your wishlist.', 'warning');
      setPage('signin');
      return;
    }
    if (!product?.id) return;

    // Prevent duplicate entries.
    if (isInWishlist(product.id)) {
      showToast('Already in your wishlist.', 'info');
      return;
    }

    const entry: WishlistItem = {
      productId: product.id,
      addedAt: new Date().toISOString(),
      product: {
        id: product.id,
        name: product.name || product.id,
        price: product.price || 0,
        originalPrice: product.originalPrice,
        image: product.image || '',
        bgColor: product.bgColor || '#f4f4f5',
        textColor: product.textColor || '#1c1917',
        category: (product.category as any) || 'clothes',
        subCategory: product.subCategory || '',
        gender: (product.gender as any) || 'men',
        sizes: product.sizes || [],
      } as any,
    };
    setWishlist(prev => [entry, ...prev]);

    // Best-effort server save (totoong account lang).
    if (getAuthToken()) {
      addWishlistItem(product.id).catch(async (e: any) => {
        // Na-delete na ang product sa server — alisin sa wishlist.
        console.warn('Wishlist add to server failed:', e?.message);
        if (String(e?.message || '').toLowerCase().includes('not found')) {
          setWishlist(prev => prev.filter(i => i.productId !== product.id));
          showToast('This product is no longer available.', 'warning');
        }
      });
    }
    showToast('Added to wishlist.', 'success');
  };

  const removeFromWishlist = (id: string) => {
    const before = wishlist.length;
    setWishlist(prev => prev.filter(item => item.productId !== id));
    if (before === wishlist.length) return;

    if (getAuthToken()) {
      removeWishlistItem(id).catch(() => {
        /* non-blocking - local state na ang tatanggalin */
      });
    }
    showToast('Removed from wishlist.', 'info');
  };

  useEffect(() => {
    if (user.isLoggedIn && user.username) {
      try {
        const notifKey = `chub_notifs_${user.username.toLowerCase()}`;
        const savedNotifs = localStorage.getItem(notifKey);
        if (savedNotifs) {
          const parsed = JSON.parse(savedNotifs);
          if (Array.isArray(parsed)) setNotifications(parsed);
        }
      } catch { /* ignore */ }
      // I-sync ang server-side notifications (kung may token) — dito kaya
      // hindi mawala ang bell kahit mag-refresh ang page.
      syncNotificationsFromServer();
      const syncTimer = setInterval(syncNotificationsFromServer, 45000);
      return () => clearInterval(syncTimer);
    } else {
      // Guest mode: i-restore ang guest snapshot.
      try {
        const saved = localStorage.getItem('chub_notifs_guest');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setNotifications(parsed);
        }
      } catch { /* ignore */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.isLoggedIn, user.username]);

  useEffect(() => {
    if (user.isLoggedIn && user.username) {
      try {
        const cartKey = getCartStorageKey(user.username);
        const savedCart = localStorage.getItem(cartKey);
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          setCart(parsed);
          console.log(`🛒 Loaded cart for ${user.username}:`, parsed.length, 'items');
        } else {
          setCart([]);
        }
      } catch (e) {
        console.error('Failed to load user cart:', e);
        setCart([]);
      }

      try {
        const ordersKey = getOrdersStorageKey(user.username);
        const savedOrders = localStorage.getItem(ordersKey);
        if (savedOrders) {
          const parsed = JSON.parse(savedOrders);
          setOrders(parsed);
          console.log(`📦 Loaded orders for ${user.username}:`, parsed.length);
          setTimeout(() => syncOrdersToServer(), 500);
        } else {
          setOrders([]);
          console.log(`📦 No orders found for ${user.username}`);
        }
      } catch (e) {
        console.error('Failed to load user orders:', e);
        setOrders([]);
      }
    } else {
      setCart([]);
      setOrders([]);
    }
  }, [user.isLoggedIn, user.username]);

  useEffect(() => {
    try {
      localStorage.setItem('chub_user', JSON.stringify(user));
    } catch (e) {
      console.error('Failed to sync user:', e);
    }
  }, [user]);

  // ── Cross-tab sync: iPhone simulator + MacBook tabs stay in lockstep ──
  // page/gender/subCategory/currentProductIndex are broadcast to localStorage;
  // every other tab of the same browser/origin listens for `storage` events and
  // adopts the new state.
  const CROSS_TAB_KEY = 'chub_cross_tab_session';
  const crossTabReadyRef = useRef(false);
  const crossTabApplyRef = useRef(false);

  useEffect(() => {
    if (crossTabApplyRef.current) {
      crossTabApplyRef.current = false;
      return;
    }
    // Skip the very first run so opening a tab doesn't override a live tab.
    if (!crossTabReadyRef.current) {
      crossTabReadyRef.current = true;
      return;
    }
    try {
      localStorage.setItem(CROSS_TAB_KEY, JSON.stringify({ page, gender, subCategory, currentProductIndex }));
    } catch (e) {
      console.error('Failed to broadcast cross-tab state:', e);
    }
  }, [page, gender, subCategory, currentProductIndex]);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== CROSS_TAB_KEY || !e.newValue) return;
      try {
        const data = JSON.parse(e.newValue);
        if (!data || typeof data.page !== 'string') return;
        const targetGender = data.gender && PRODUCTS_CONFIG[data.page]?.[data.gender]
          ? data.gender
          : gender;
        const cfg = PRODUCTS_CONFIG[data.page]?.[targetGender];
        const sub = cfg?.subCategories.includes(data.subCategory)
          ? data.subCategory
          : cfg?.defaultSubCategory;
        const pageChanged = data.page !== page;
        const idxChanged = typeof data.currentProductIndex === 'number' && data.currentProductIndex !== currentProductIndex;
        crossTabApplyRef.current = true;
        setPageState(data.page);
        if (data.gender && data.gender !== gender) setGenderState(data.gender);
        if (sub && sub !== subCategory) setSubCategoryState(sub);
        if (idxChanged) setCurrentProductIndex(data.currentProductIndex);
        if (pageChanged) window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e) {
        console.error('Failed to apply cross-tab state:', e);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [gender, subCategory, currentProductIndex, page]);

  useEffect(() => {
    let es: EventSource | null = null;
    const serverUrl = API_SERVER_URL;
    
    if (!user.isLoggedIn || !user.username) {
      console.log('⏭️ Skipping SSE - user not logged in');
      return;
    }
    
    try {
      console.log('🔌 Connecting to SSE for user:', user.username);
      es = new EventSource(`${serverUrl}/api/orders/stream/public`);
      
      es.onopen = () => {
        console.log('✅ SSE connected');
      };
      
      es.onerror = (error) => {
        console.warn('⚠️ SSE error:', error);
      };
      
      es.addEventListener('order-updated', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📦 order_update received:', data);
          
          const { orderId, status, order } = data;
          
          if (!orderId || !status) return;
          if (!user.isLoggedIn || !user.username) return;
          
          console.log(`📦 Order update received: ${orderId} -> ${status}`);
          
          if (order) {
            setOrders(prev => {
              const exists = prev.some(o => o.orderId === orderId);
              if (!exists) {
                const newOrders = [order, ...prev];
                const key = getOrdersStorageKey(user.username);
                localStorage.setItem(key, JSON.stringify(newOrders));
                showToast(`Order ${orderId} is now ${status}`, 'success');
                addNotification(`Order ${orderId} is now ${status}`, 'success', orderId);
                setTimeout(() => syncOrdersToServer(), 500);
                return newOrders;
              }
              
              const updatedOrders = prev.map(o =>
                o.orderId === orderId ? { ...o, ...order } : o
              );
              const key = getOrdersStorageKey(user.username);
              localStorage.setItem(key, JSON.stringify(updatedOrders));
              showToast(`Order ${orderId} is now ${status}`, 'success');
              addNotification(`Order ${orderId} is now ${status}`, 'success', orderId);
              setTimeout(() => syncOrdersToServer(), 500);
              return updatedOrders;
            });
            return;
          }
          
          setOrders(prev => {
            const exists = prev.some(o => o.orderId === orderId);
            
            if (!exists) {
              fetch(`${serverUrl}/api/orders/${orderId}`, { headers: authHeaders() })
                .then(res => res.json())
                .then((fullOrder: Order) => {
                  if (fullOrder && fullOrder.customer?.name?.toLowerCase() === user.username.toLowerCase()) {
                    setOrders(prevOrders => {
                      const newOrders = [fullOrder, ...prevOrders.filter(o => o.orderId !== orderId)];
                      const key = getOrdersStorageKey(user.username);
                      localStorage.setItem(key, JSON.stringify(newOrders));
                      setTimeout(() => syncOrdersToServer(), 500);
                      return newOrders;
                    });
                    showToast(`Order ${orderId} is now ${status}`, 'success');
                    addNotification(`Order ${orderId} is now ${status}`, 'success', orderId);
                  }
                })
                .catch(err => console.error('Failed to fetch order:', err));
              return prev;
            }
            
            const updatedOrders = prev.map(o =>
              o.orderId === orderId ? { ...o, status: status as Order['status'] } : o
            );
            const key = getOrdersStorageKey(user.username);
            localStorage.setItem(key, JSON.stringify(updatedOrders));
            showToast(`Order ${orderId} is now ${status}`, 'success');
            addNotification(`Order ${orderId} is now ${status}`, 'success', orderId);
            setTimeout(() => syncOrdersToServer(), 500);
            return updatedOrders;
          });
        } catch (e) {
          console.error('❌ Bad SSE payload:', e);
        }
      });
      
      es.addEventListener('new-order', (event: MessageEvent) => {
        try {
          const newOrder = JSON.parse(event.data) as Order;
          console.log('📦 new_order received:', newOrder);
          
          if (!user.isLoggedIn || !user.username) return;
          
          if (newOrder.customer?.name?.toLowerCase() === user.username.toLowerCase()) {
            setOrders(prev => {
              if (prev.some(o => o.orderId === newOrder.orderId)) return prev;
              const updated = [newOrder, ...prev];
              const key = getOrdersStorageKey(user.username);
              localStorage.setItem(key, JSON.stringify(updated));
              showToast(`Order ${newOrder.orderId} placed!`, 'success');
              addNotification(`New order ${newOrder.orderId} has been placed`, 'success', newOrder.orderId);
              setTimeout(() => syncOrdersToServer(), 500);
              return updated;
            });
          }
        } catch (e) {
          console.error('❌ Bad new_order:', e);
        }
      });

      es.addEventListener('order-deleted', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          console.log('🗑️ order-deleted received:', data);
          const { orderId } = data;
          if (!orderId) return;
          if (!user.isLoggedIn || !user.username) return;

          setOrders(prev => {
            const updatedOrders = prev.filter(o => o.orderId !== orderId);
            if (updatedOrders.length === prev.length) return prev;
            const key = getOrdersStorageKey(user.username);
            localStorage.setItem(key, JSON.stringify(updatedOrders));
            return updatedOrders;
          });
        } catch (e) {
          console.error('❌ Bad order-deleted payload:', e);
        }
      });

      // Server-side notification (order placed/status/review reply) —
      // i-refresh ang bell mula sa backend para laging naka-sync.
      es.addEventListener('notification', () => {
        syncNotificationsFromServer();
      });

    } catch (e) {
      console.error('❌ Failed to setup SSE:', e);
    }
    
    return () => {
      if (es) {
        es.close();
        console.log('🔌 SSE closed');
      }
    };
  }, [user.isLoggedIn, user.username]);

  const currentCategoryConfig = PRODUCTS_CONFIG[page]?.[gender];
  const currentProductList = currentCategoryConfig?.products?.[subCategory] || [];
  const activeProduct = currentProductList[currentProductIndex] || currentProductList[0];

  const activeBgColor = ['clothes', 'shoes', 'pants', 'underwear', 'accessories'].includes(page)
    ? (activeProduct?.bgColor || '#f3f4f6')
    : '#f4f4f4';

  const activeTextColor = ['clothes', 'shoes', 'pants', 'underwear', 'accessories'].includes(page)
    ? (activeProduct?.textColor || '#1d1a18')
    : '#1d1a18';

  const isDarkTheme = activeTextColor === '#FFFFFF' ||
    ['#5e0528', '#42322b', '#202022', '#4a4a4a', '#2a3459', '#d44545', '#2a8c5e', '#572a34', '#433630', '#28479d', '#6b432e', '#8b654e', '#3a3a3a', '#36395f', '#3a5a9a', '#7a5a3a', '#2a5a8a', '#c44a4a', '#3a7a4a', '#e88a3a', '#b44a4a', '#4a7a5a', '#2a3a5a', '#8a8a8a', '#223a67', '#4a3328', '#18181b', '#27272a', '#09090b'].includes((activeBgColor || '').toLowerCase());

  const showToast = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const setPage = (newPage: PageType, newSubCategory?: string, newGender?: GenderType) => {
    if (newGender) setGenderState(newGender);
    setCurrentProductIndex(0);

    setPageState(newPage);

    if (newSubCategory) {
      setSubCategoryState(newSubCategory);
    } else {
      const catConfig = PRODUCTS_CONFIG[newPage]?.[newGender || gender];
      if (catConfig?.defaultSubCategory) {
        setSubCategoryState(catConfig.defaultSubCategory);
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setGender = (newGender: GenderType) => {
    setGenderState(newGender);
    setCurrentProductIndex(0);
    const catConfig = PRODUCTS_CONFIG[page]?.[newGender];
    if (catConfig?.defaultSubCategory) {
      setSubCategoryState(catConfig.defaultSubCategory);
    }
  };

  const setSubCategory = (newSub: string) => {
    setSubCategoryState(newSub);
    setCurrentProductIndex(0);
  };

  const addToCart = (
    item: {
      id: string;
      name: string;
      price: number;
      image: string;
      size?: string;
      color?: string;
      subCategory?: string;
      gender?: GenderType;
    },
    qty = 1
  ) => {
    if (!user.isLoggedIn) {
      showToast('Please login first to add items to cart', 'warning');
      setPage('login');
      return;
    }

    setCart(prev => {
      const existingIdx = prev.findIndex(
        cartItem => cartItem.id === item.id && cartItem.size === item.size
      );
      if (existingIdx > -1) {
        const newQty = prev[existingIdx].qty + qty;
        const copy = [...prev];
        copy[existingIdx].qty = newQty;
        return copy;
      } else {
        // ✅ Siguraduhing may image ang item
        const imageToUse = item.image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23e2e8f0"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%2394a3b8" font-size="12"%3EImage%3C/text%3E%3C/svg%3E';
        return [...prev, { ...item, image: imageToUse, qty }];
      }
    });
    showToast(`Added ${item.name} to cart!`, 'success');
  };

  const updateCartQty = (id: string, size: string | undefined, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.id === id && item.size === size) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const removeFromCart = (id: string, size?: string) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.size === size)));
    showToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
    if (user.isLoggedIn && user.username) {
      const key = getCartStorageKey(user.username);
      localStorage.setItem(key, JSON.stringify([]));
    }
    showToast('Cart cleared', 'info');
  };

  const clearAllOrders = () => {
    if (user.isLoggedIn && user.username) {
      const key = getOrdersStorageKey(user.username);
      localStorage.removeItem(key);
      setOrders([]);
      showToast(`All orders for ${user.username} cleared!`, 'info');
      setTimeout(() => syncOrdersToServer(), 500);
    }
  };

  const createOrder = async (
    customer: CustomerDetails,
    discountCode: string,
    paymentMethod: string,
    items?: CartItem[],
    shippingMethod?: string,
    shippingFee?: number,
    eta?: string
  ): Promise<OrderCreateResult> => {
    console.log('🛒 Creating order...');

    if (!user.isLoggedIn) {
      showToast('Please login first', 'warning');
      return { success: false, error: 'Please login first.' };
    }

    // Items na bibilhin = explicit selection (partial checkout) o ang buong cart.
    const orderItemsRaw = items && items.length > 0 ? items : cart;
    if (orderItemsRaw.length === 0) {
      showToast('Cart is empty!', 'warning');
      return { success: false, error: 'Your cart is empty. Add items before checking out.' };
    }

    const subtotal = orderItemsRaw.reduce((sum, item) => sum + item.price * item.qty, 0);
    const shipping = typeof shippingFee === 'number' ? shippingFee : (subtotal > 2500 ? 0 : 150);

    let discountPercent = 0;
    const cleanCode = discountCode.trim().toUpperCase();
    if (cleanCode === 'PWD' || cleanCode === 'SENIOR') {
      discountPercent = 0.20;
    } else if (cleanCode === 'WELCOME10') {
      discountPercent = 0.10;
    }

    const discountAmount = Math.round(subtotal * discountPercent);
    const total = Math.max(0, subtotal - discountAmount + shipping);

    // ✅ Siguraduhing kasama ang image sa bawat item ng order
    const orderItems = orderItemsRaw.map(item => ({
      ...item,
      image: item.image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23e2e8f0"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%2394a3b8" font-size="12"%3EImage%3C/text%3E%3C/svg%3E'
    }));

    // ✅ All new orders start at 'Pending' (backlog initial status — source of truth)
    const localStatus: Order['status'] = 'Pending';

    const newOrder: Order = {
      orderId: 'CHUB-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      customer,
      items: orderItems,
      subtotal,
      shipping,
      discount: discountAmount,
      discountCode: cleanCode,
      total,
      payment: paymentMethod,
      status: localStatus,
      shippingMethod: shippingMethod || 'Standard',
      eta: eta || '',
      paymentInfo: { method: paymentMethod, status: 'Pending' as PaymentInfo['status'] },
    };

    try {
      console.log('📦 Sending order to backend...');
      console.log('📦 Order data:', JSON.stringify(newOrder, null, 2));

      // ✅ Backend ang source of truth ng status -> huwag magpadala ng status
      const { status: _omittedStatus, ...orderPayload } = newOrder;

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error response:', errorText);
        // Ipakita ang EXACT na dahilan (hindi generic toast):
        // - 409: kulang ang stock o wala sa catalog ang item
        // - 4xx/5xx: anumang detalye mula sa backend
        let parsed: any = null;
        try { parsed = JSON.parse(errorText); } catch { /* not json */ }
        const serverMessage = parsed?.error || `Server error ${response.status}: ${errorText.slice(0, 200)}`;
        if (response.status === 409 && parsed?.insufficientStock?.length) {
          const names = parsed.insufficientStock.map((s: any) => s.name || s.id).join(', ');
          const msg = `Insufficient stock for: ${names}`;
          showToast(msg, 'warning');
          return { success: false, error: msg };
        }
        showToast(serverMessage, 'warning');
        return { success: false, error: serverMessage };
      }
      
      const data = await response.json() as { success: boolean; order: Order };
      console.log('✅ Order saved:', data);
      const savedOrder = data.order || newOrder;

      // ✅ Payment wiring. Ang order ay na-re-record ng backend (hindi pambayad).
      // Para sa COD: paymentInfo = Pending hanggang delivery. Para sa online:
      // binubuksan ang payment record sa backend; ang order ay HINDI nagiging
      // 'Paid' dahil sa click — ang status ay nagbabago lamang kapag nag-
      // transition ang payment record sa backend (mock gateway sa dev).
      let finalOrder = savedOrder;
      try {
        if (isOnlinePayment(paymentMethod)) {
          const initRes = await initiatePayment(
            savedOrder.orderId,
            paymentMethod,
            savedOrder.total,
            `${savedOrder.orderId}:${paymentMethod}`
          );
          if (initRes.success && initRes.order) {
            finalOrder = initRes.order;
          } else if (initRes.payment?.paymentId) {
            finalOrder = { ...savedOrder, paymentInfo: { ...savedOrder.paymentInfo, ...initRes.payment as PaymentInfo } };
          } else {
            finalOrder = { ...savedOrder, paymentInfo: { method: paymentMethod, status: 'Pending' as PaymentInfo['status'] } };
          }
        } else {
          finalOrder = { ...savedOrder, paymentInfo: { method: paymentMethod, status: 'Pending' as PaymentInfo['status'], provider: 'cod' } };
        }
      } catch (payErr) {
        console.warn('⚠️ Payment initiation failed (order still recorded):', payErr);
      }

      if (user.isLoggedIn && user.username) {
        setOrders(prev => {
          const updated = [finalOrder, ...prev.filter(o => o.orderId !== savedOrder.orderId)];
          const key = getOrdersStorageKey(user.username);
          localStorage.setItem(key, JSON.stringify(updated));
          return updated;
        });
      }

      // ✅ Partial checkout: alisin LANG ang mga nabiling items sa cart.
      // Pananatilihin ang ibang cart items na hindi kasama sa order.
      if (items && items.length > 0) {
        const purchasedKeys = new Set(
          orderItemsRaw.map(it => `${it.id}|${it.size || ''}|${it.color || ''}`)
        );
        setCart(prev => prev.filter(it => !purchasedKeys.has(`${it.id}|${it.size || ''}|${it.color || ''}`)));
        setCheckoutItems([]);
      }

      setTimeout(() => syncOrdersToServer(), 500);

showToast(`Order ${savedOrder.orderId} placed successfully!`, 'success');
      addNotification(`Order ${savedOrder.orderId} placed successfully`, 'success', savedOrder.orderId);
      return { success: true, order: finalOrder };

    } catch (error) {
      console.error('❌ Failed to save order:', error);
      const detail = error instanceof Error ? error.message : String(error);
      const msg = /fetch|network|ECONN|connection/i.test(detail)
        ? 'Cannot reach the order server. Make sure the backend is running (c-hub start.bat, port 3006) and try again.'
        : detail || 'Failed to place order. Please try again.';
      showToast(msg, 'warning');
      return { success: false, error: msg };
    }
  };

  const refreshOrders = async () => {
    if (!user.isLoggedIn || !user.username) {
      showToast('Please login first', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, { headers: authHeaders() });
      if (response.ok) {
        const serverOrders = await response.json() as Order[];
        
        const usernameLower = user.username.toLowerCase().trim();
        const userOrders = serverOrders.filter((order: Order) => {
          const customerName = (order.customer?.name || '').toLowerCase().trim();
          const customerEmail = (order.customer?.email || '').toLowerCase().trim();
          const emailLocal = customerEmail.split('@')[0];
          return customerName === usernameLower ||
            customerName.includes(usernameLower) ||
            emailLocal.includes(usernameLower);
        });
        
        setOrders(prev => {
          const allOrders = [...userOrders];
          prev.forEach(localOrder => {
            if (!userOrders.some((so: Order) => so.orderId === localOrder.orderId)) {
              allOrders.push(localOrder);
            }
          });
          const key = getOrdersStorageKey(user.username);
          localStorage.setItem(key, JSON.stringify(allOrders));
          return allOrders;
        });
        setTimeout(() => syncOrdersToServer(), 500);
        showToast(`Orders refreshed! (${userOrders.length} orders)`, 'success');
      } else {
        showToast('Failed to refresh orders', 'warning');
      }
    } catch (error) {
      console.error('Failed to refresh orders:', error);
      showToast('Failed to refresh orders', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

const updateOrderStatus = async (orderId: string, newStatus: string) => {
    // ✅ DEPRECATED PATH: Hindi na ito ginagamit para sa arbitrary status.
    // Ang mga pagbabago ng status ay nanggagaling lang sa mga authorized action
    // sa ibaba (cancel / refund request / return request / complete) at sa
    // admin panel. Panatilihin ito bilang safe fallback na may validation sa
    // backend (ang backend ang siyang nagre-reject ng invalid transitions).
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        console.warn('⚠️ Failed to update order status on server:', response.status, errText);
        showToast('Status change not allowed for this order.', 'warning');
        return null;
      }

      const data = await response.json() as { success: boolean; order: Order };
      const serverStatus = (data.order?.status || newStatus) as Order['status'];

      if (user.isLoggedIn && user.username) {
        setOrders(prev => {
          const updated = prev.map(o =>
            o.orderId === orderId ? { ...o, ...data.order, status: serverStatus } : o
          );
          const key = getOrdersStorageKey(user.username);
          localStorage.setItem(key, JSON.stringify(updated));
          return updated;
        });
        showToast(`Order ${orderId} is now ${serverStatus}`, 'success');
      }
      return data.order || null;
    } catch (error) {
      console.error('❌ Failed to update order status:', error);
      showToast('Failed to update status. Please try again.', 'warning');
      return null;
    }
  };

  // I-reflect ang pinakabagong order (mula sa backend payment/lifecycle result)
  // sa local orders state + localStorage. Panatilihin ang server version.
  const reflectOrderUpdate = (updatedOrder: Order) => {
    if (!user.isLoggedIn || !user.username || !updatedOrder?.orderId) return;
    setOrders(prev => {
      const exists = prev.some(o => o.orderId === updatedOrder.orderId);
      const updated = exists
        ? prev.map(o => (o.orderId === updatedOrder.orderId ? { ...o, ...updatedOrder } : o))
        : [updatedOrder, ...prev];
      const key = getOrdersStorageKey(user.username);
      localStorage.setItem(key, JSON.stringify(updated));
      return updated;
    });
  };

  const applyOrderAction = async (
    orderId: string,
    path: string,
    body: Record<string, unknown>,
    label: string
  ): Promise<Order | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(body)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        showToast(result.error || `${label} failed. Please try again.`, 'warning');
        return null;
      }
      if (result.order) reflectOrderUpdate(result.order as Order);
      showToast(`${label} successful.`, 'success');
      return result.order as Order;
    } catch (error) {
      console.error(`❌ Order action (${label}) error:`, error);
      showToast('Network error. Please try again.', 'warning');
      return null;
    }
  };

  // Authorized customer actions — ito lang ang status changes na pwede sa
  // store frontend. Lahat ay naka-validate sa backend.
  const cancelOrder = (orderId: string, reason?: string) =>
    applyOrderAction(orderId, 'cancel', { reason: reason || '' }, 'Order cancellation');

  const requestRefundOrder = (orderId: string, reason: string) =>
    applyOrderAction(orderId, 'refund-request', { reason }, 'Refund request');

  const requestReturnOrder = (orderId: string, reason: string) =>
    applyOrderAction(orderId, 'return-request', { reason }, 'Return request');

  const completeOrderAfterReview = (orderId: string) =>
    applyOrderAction(orderId, 'complete', {}, 'Order completion');

  const login = (username: string) => {
    // Pwede mag-login gamit ang nickname O email address.
    // Kung email ang input, kunin ang prefix (bago ang @) bilang identity name.
    const identity = username.includes('@')
      ? username.split('@')[0]
      : username;

    const formatted = identity.charAt(0).toUpperCase() + identity.slice(1).toLowerCase();
    const displayName = formatted || 'User';

    console.log('🔑 Logging in user:', displayName);

    setUser({ username: displayName, isLoggedIn: true, loginAt: Date.now() });

    // I-load ang saved profile (name/email) para magamit sa checkout
    try {
      const profileKey = getProfileStorageKey(displayName);
      const savedProfile = localStorage.getItem(profileKey);
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile) as CustomerDetails;
        setCustomerInfo(parsed);
      } else {
        setCustomerInfo({ name: displayName, email: '', phone: '', address: '' });
      }
    } catch (e) {
      console.error('Failed to load profile:', e);
      setCustomerInfo({ name: displayName, email: '', phone: '', address: '' });
    }

    try {
      const ordersKey = `chub_orders_${displayName.toLowerCase()}`;
      const savedOrders = localStorage.getItem(ordersKey);
      console.log('📦 Orders key:', ordersKey);
      console.log('📦 Saved orders:', savedOrders);

      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        setOrders(parsed);
        console.log(`✅ Loaded ${parsed.length} orders for ${displayName}`);
        setTimeout(() => syncOrdersToServer(), 500);
      } else {
        setOrders([]);
        console.log('❌ No orders found in localStorage');
      }
    } catch (e) {
      console.error('Failed to load orders on login:', e);
      setOrders([]);
    }

    try {
      const cartKey = `chub_cart_${displayName.toLowerCase()}`;
      const savedCart = localStorage.getItem(cartKey);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        setCart(parsed);
        console.log(`🛒 Loaded ${parsed.length} items for ${displayName}`);
      } else {
        setCart([]);
      }
    } catch (e) {
      console.error('Failed to load cart on login:', e);
      setCart([]);
    }

    // I-load ang wishlist ng user (local snapshot muna, tapos server refresh).
    try {
      const wishlistKey = `chub_wishlist_${displayName.toLowerCase()}`;
      const savedWishlist = localStorage.getItem(wishlistKey);
      if (savedWishlist) {
        const parsed = JSON.parse(savedWishlist);
        setWishlist(Array.isArray(parsed) ? parsed : []);
        console.log(`❤️ Loaded ${parsed.length} wishlist items for ${displayName}`);
      } else {
        setWishlist([]);
      }
    } catch (e) {
      console.error('Failed to load wishlist on login:', e);
      setWishlist([]);
    }

    setOrdersUpdated(prev => prev + 1);
    console.log('🔄 ordersUpdated set to:', ordersUpdated + 1);

    showToast(`Welcome back, ${displayName}!`, 'success');

    // Deferred server refresh ng wishlist (kung may token mula sa backend).
    setTimeout(() => {
      refreshWishlist();
    }, 600);
  };

  const signup = async (fullName: string, username: string, email: string, password: string) => {
    // Basic validation - ibabalik ang false kung may error
    if (!fullName.trim()) {
      showToast('Please enter your full name', 'warning');
      return false;
    }
    if (!username.trim() || username.trim().length < 3) {
      showToast('Username must be at least 3 characters', 'warning');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      showToast('Please enter a valid email address', 'warning');
      return false;
    }
    if (password.length < 8) {
      showToast('Password must be at least 8 characters', 'warning');
      return false;
    }

    // Identity name = napiling username (ito ang magpapatuloy sa account —
    // cart at orders ay naka-key dito para ma-restore kapag nag-reopen).
    const usernameKey = username.trim().toLowerCase();
    const formattedName = fullName
      .trim()
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');

    // I-save muna ang account sa backend (totoong account).
    // Kapag offline ang backend, magpapatuloy bilang local account (fallback).
    try {
      const created = await signupAccount(formattedName, usernameKey, email.trim(), password);
      if (created?.token) setAuthToken(created.token);
    } catch (e: any) {
      const msg = String(e?.message || '').toLowerCase();
      if (msg.includes('taken') || msg.includes('exist')) {
        showToast('This username is already taken. Please choose another.', 'warning');
        return false;
      }
      console.error('Signup backend error (falling back to local):', e);
    }

    const profile: CustomerDetails = {
      name: formattedName,
      email: email.trim(),
      phone: '',
      address: '',
    };

    // I-save ang profile per-user (keyed sa username).
    try {
      localStorage.setItem(getProfileStorageKey(usernameKey), JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile:', e);
    }

    setCustomerInfo(profile);
    setUser({ username: usernameKey, isLoggedIn: true, loginAt: Date.now() });

    setOrders([]);
    setCart([]);
    setWishlist([]);

    // I-save ang local password verifier (PBKDF2) — offline fallback lang.
    try {
      await setStoredPassword(usernameKey, password);
    } catch (e) {
      console.error('Failed to save password verifier:', e);
    }

    // Best-effort: i-register din sa reset-account store para sa Forgot Password.
    try {
      await registerAccount(usernameKey, email.trim());
    } catch (e) {
      console.error('Failed to register reset account (non-blocking):', e);
    }

    showToast(`Account created. Welcome, ${formattedName}!`, 'success');
    return true;
  };

  const completeAuth = (fullName: string, email: string, phone: string, address: string, username: string) => {
    // I-save muna ang delivery info sa profile bago mag-login,
    // para siguradong naka-save ito under sa username ng user.
    const identity = username.includes('@') ? username.split('@')[0] : username;
    const displayName = identity.charAt(0).toUpperCase() + identity.slice(1).toLowerCase() || 'User';

    const profile: CustomerDetails = {
      name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
    };

    try {
      localStorage.setItem(getProfileStorageKey(displayName), JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile:', e);
    }

    setCustomerInfo(profile);
    login(displayName);
  };

  const saveCustomerInfo = (info: Partial<CustomerDetails>) => {
    setCustomerInfo(prev => {
      const updated = { ...(prev || { name: user.username || '', email: '', phone: '', address: '' }), ...info } as CustomerDetails;
      try {
        if (user.isLoggedIn && user.username) {
          localStorage.setItem(getProfileStorageKey(user.username), JSON.stringify(updated));
        }
      } catch (e) {
        console.error('Failed to save customer info:', e);
      }
      return updated;
    });
  };

  // Read-only na pagbasa ng profile ng isang user (ginagamit ng login flow para i-check ang MFA status).
  // Reuse ng EXISTING localStorage profile storage — walang ginagawang bagong auth system.
  const getProfile = (username: string): CustomerDetails | null => {
    try {
      const raw = localStorage.getItem(getProfileStorageKey(username));
      return raw ? JSON.parse(raw) as CustomerDetails : null;
    } catch {
      return null;
    }
  };

  const logout = () => {
    const lastUser = user.username || 'guest';
    clearAuthToken();
    setCart([]);
    setOrders([]);
    setWishlist([]);
    setUser({ username: '', isLoggedIn: false });
    setOrdersUpdated(0);
    setNotifications([]);
    try { localStorage.removeItem(`chub_notifs_${lastUser.toLowerCase()}`); } catch { /* ignore */ }
    showToast('Logged out successfully', 'info');
  };

  // ✅ ONLY ONE closeSplash (Walang sessionStorage) para laging lalabas sa refresh
  const closeSplash = () => {
    setSplashShown(true);
  };

  return (
    <StoreContext.Provider
      value={{
        page,
        gender,
        subCategory,
        lastCategoryPage,
        currentProductIndex,
        cart,
        orders,
        user,
        splashShown,
        activeBgColor,
        activeTextColor,
        isDarkTheme,
        searchQuery,
        shopBgColor,
        setShopBgColor,
        toast,
        ordersUpdated,
        notifications,
        unreadCount,
        addNotification,
        markNotificationsRead,
        syncNotificationsFromServer,
        removeNotification,
        clearNotifications,
        setPage,
        setGender,
        setSubCategory,
        setCurrentProductIndex,
        setSearchQuery,
        sortOption,
        setSortOption: (opt: SortOption) => setSortOption(opt),
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        stockById,
        getStock,
        stockStatusOf,
        refreshStock,
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        refreshWishlist,
        createOrder,
        checkoutItems,
        setCheckoutItems,
        login,
        completeAuth,
        signup,
        logout,
        customerInfo,
        saveCustomerInfo,
        getProfile,
        showToast,
        closeSplash,
        updateOrderStatus,
        reflectOrderUpdate,
        cancelOrder,
        requestRefundOrder,
        requestReturnOrder,
        completeOrderAfterReview,
        refreshOrders,
        clearAllOrders,
        loadUserOrders,
        syncOrdersToServer,
        isLoading,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};