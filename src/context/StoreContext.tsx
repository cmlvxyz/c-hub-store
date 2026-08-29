import React, { createContext, useContext, useState, useEffect } from 'react';
import { PageType, GenderType, CartItem, Order, User, CustomerDetails } from '../types';
import { PRODUCTS_CONFIG } from '../data/products';
import { API_BASE_URL, API_SERVER_URL } from '../service/api';

interface StoreContextType {
  page: PageType;
  gender: GenderType;
  subCategory: string;
  currentProductIndex: number;
  cart: CartItem[];
  orders: Order[];
  user: User;
  splashShown: boolean;
  activeBgColor: string;
  activeTextColor: string;
  isDarkTheme: boolean;
  searchQuery: string;
  toast: { message: string; type?: 'info' | 'success' | 'warning' } | null;
  ordersUpdated: number;
  setPage: (page: PageType, subCategory?: string, gender?: GenderType) => void;
  setGender: (gender: GenderType) => void;
  setSubCategory: (sub: string) => void;
  setCurrentProductIndex: (idx: number) => void;
  setSearchQuery: (q: string) => void;
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
  createOrder: (customer: CustomerDetails, discountCode: string, paymentMethod: string) => Promise<Order | null>;
  login: (username: string) => void;
  logout: () => void;
  showToast: (message: string, type?: 'info' | 'success' | 'warning') => void;
  closeSplash: () => void;
  updateOrderStatus: (orderId: string, newStatus: string) => void;
  refreshOrders: () => Promise<void>;
  clearAllOrders: () => void;
  loadUserOrders: () => void;
  syncOrdersToServer: () => Promise<void>; 
  isLoading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const getCartStorageKey = (username: string) => {
  return `chub_cart_${username.toLowerCase()}`;
};

const getOrdersStorageKey = (username: string) => {
  return `chub_orders_${username.toLowerCase()}`;
};

const SYNC_URL = `${API_BASE_URL}/orders/sync`;

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [page, setPageState] = useState<PageType>('home');
  const [gender, setGenderState] = useState<GenderType>('men');
  const [subCategory, setSubCategoryState] = useState<string>('tshirt');
  const [currentProductIndex, setCurrentProductIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [user, setUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('chub_user');
      return saved ? JSON.parse(saved) : { username: '', isLoggedIn: false };
    } catch {
      return { username: '', isLoggedIn: false };
    }
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

  // ✅ ITO ANG TAMANG SETUP PARA LAGING LALABAS ANG SPLASH SA REFRESH
  const [splashShown, setSplashShown] = useState<boolean>(false);

  const [toast, setToast] = useState<{ message: string; type?: 'info' | 'success' | 'warning' } | null>(null);

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
        headers: { 'Content-Type': 'application/json' },
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
                setTimeout(() => syncOrdersToServer(), 500);
                return newOrders;
              }
              
              const updatedOrders = prev.map(o =>
                o.orderId === orderId ? { ...o, ...order } : o
              );
              const key = getOrdersStorageKey(user.username);
              localStorage.setItem(key, JSON.stringify(updatedOrders));
              showToast(`Order ${orderId} is now ${status}`, 'success');
              setTimeout(() => syncOrdersToServer(), 500);
              return updatedOrders;
            });
            return;
          }
          
          setOrders(prev => {
            const exists = prev.some(o => o.orderId === orderId);
            
            if (!exists) {
              fetch(`${serverUrl}/api/orders/${orderId}`)
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
              setTimeout(() => syncOrdersToServer(), 500);
              return updated;
            });
          }
        } catch (e) {
          console.error('❌ Bad new_order:', e);
        }
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
    setPageState(newPage);
    setCurrentProductIndex(0);

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
    if (catConfig) {
      if (!catConfig.subCategories.includes(subCategory)) {
        setSubCategoryState(catConfig.defaultSubCategory);
      }
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
        const copy = [...prev];
        copy[existingIdx].qty += qty;
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
    paymentMethod: string
  ): Promise<Order | null> => {
    console.log('🛒 Creating order...');
    
    if (cart.length === 0) {
      showToast('Cart is empty!', 'warning');
      return null;
    }

    if (!user.isLoggedIn) {
      showToast('Please login first', 'warning');
      return null;
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const shipping = subtotal > 2500 ? 0 : 150;

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
    const orderItems = cart.map(item => ({
      ...item,
      image: item.image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23e2e8f0"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%2394a3b8" font-size="12"%3EImage%3C/text%3E%3C/svg%3E'
    }));

    // ✅ Local status mirror ng backend logic: COD -> To Ship | Online -> To Pay
    const payMethod = (paymentMethod || '').toLowerCase();
    const localStatus: Order['status'] =
      payMethod.includes('cod') || payMethod.includes('cash on delivery')
        ? 'To Ship'
        : 'To Pay';

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
      status: localStatus
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
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json() as { success: boolean; order: Order };
      console.log('✅ Order saved:', data);
      const savedOrder = data.order || newOrder;

      if (user.isLoggedIn && user.username) {
        setOrders(prev => {
          const updated = [savedOrder, ...prev.filter(o => o.orderId !== savedOrder.orderId)];
          const key = getOrdersStorageKey(user.username);
          localStorage.setItem(key, JSON.stringify(updated));
          return updated;
        });
      }

      setTimeout(() => syncOrdersToServer(), 500);

      showToast(`Order ${savedOrder.orderId} placed successfully!`, 'success');
      return savedOrder;
      
    } catch (error) {
      console.error('❌ Failed to save order:', error);
      showToast('Failed to place order. Please try again.', 'warning');
      return null;
    }
  };

  const refreshOrders = async () => {
    if (!user.isLoggedIn || !user.username) {
      showToast('Please login first', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders`);
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
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    if (!response.ok) {
      console.warn('⚠️ Failed to update order status on server:', response.status);
      showToast('Failed to update status. Please try again.', 'warning');
      return;
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
  } catch (error) {
    console.error('❌ Failed to update order status:', error);
    showToast('Failed to update status. Please try again.', 'warning');
  }
};

  const login = (username: string) => {
    const formatted = username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();
    
    console.log('🔑 Logging in user:', formatted);
    
    setUser({ username: formatted, isLoggedIn: true });
    
    try {
      const ordersKey = `chub_orders_${formatted.toLowerCase()}`;
      const savedOrders = localStorage.getItem(ordersKey);
      console.log('📦 Orders key:', ordersKey);
      console.log('📦 Saved orders:', savedOrders);
      
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        setOrders(parsed);
        console.log(`✅ Loaded ${parsed.length} orders for ${formatted}`);
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
      const cartKey = `chub_cart_${formatted.toLowerCase()}`;
      const savedCart = localStorage.getItem(cartKey);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        setCart(parsed);
        console.log(`🛒 Loaded ${parsed.length} items for ${formatted}`);
      } else {
        setCart([]);
      }
    } catch (e) {
      console.error('Failed to load cart on login:', e);
      setCart([]);
    }
    
    setOrdersUpdated(prev => prev + 1);
    console.log('🔄 ordersUpdated set to:', ordersUpdated + 1);
    
    showToast(`Welcome back, ${formatted}!`, 'success');
  };

  const logout = () => {
    setCart([]);
    setOrders([]);
    setUser({ username: '', isLoggedIn: false });
    setOrdersUpdated(0);
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
        currentProductIndex,
        cart,
        orders,
        user,
        splashShown,
        activeBgColor,
        activeTextColor,
        isDarkTheme,
        searchQuery,
        toast,
        ordersUpdated,
        setPage,
        setGender,
        setSubCategory,
        setCurrentProductIndex,
        setSearchQuery,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        createOrder,
        login,
        logout,
        showToast,
        closeSplash,
        updateOrderStatus,
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