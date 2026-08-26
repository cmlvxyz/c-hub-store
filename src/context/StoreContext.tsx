import React, { createContext, useContext, useState, useEffect } from 'react';
import { PageType, GenderType, CartItem, Order, User, CustomerDetails } from '../types';
import { PRODUCTS_CONFIG } from '../data/products';

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
  createOrder: (customer: CustomerDetails, discountCode: string, paymentMethod: string) => Order | null;
  login: (username: string) => void;
  logout: () => void;
  showToast: (message: string, type?: 'info' | 'success' | 'warning') => void;
  closeSplash: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation State
  const [page, setPageState] = useState<PageType>('home');
  const [gender, setGenderState] = useState<GenderType>('men');
  const [subCategory, setSubCategoryState] = useState<string>('tshirt');
  const [currentProductIndex, setCurrentProductIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cart State from localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('chub_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Orders State from localStorage
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('chub_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // User Auth State from localStorage
  const [user, setUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('chub_user');
      return saved ? JSON.parse(saved) : { username: '', isLoggedIn: false };
    } catch {
      return { username: '', isLoggedIn: false };
    }
  });

  // Splash State from sessionStorage
  const [splashShown, setSplashShown] = useState<boolean>(() => {
    return sessionStorage.getItem('splash_shown') === 'true';
  });

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type?: 'info' | 'success' | 'warning' } | null>(null);

  // Sync Cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('chub_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to sync cart to localStorage', e);
    }
  }, [cart]);

  // Sync Orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('chub_orders', JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to sync orders to localStorage', e);
    }
  }, [orders]);

  // Sync User to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('chub_user', JSON.stringify(user));
    } catch (e) {
      console.error('Failed to sync user to localStorage', e);
    }
  }, [user]);

  // Compute Active Product Background Color & Text Color
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
      // Pick default subCategory for that category & gender
      const catConfig = PRODUCTS_CONFIG[newPage]?.[newGender || gender];
      if (catConfig?.defaultSubCategory) {
        setSubCategoryState(catConfig.defaultSubCategory);
      }
    }

    // Scroll to top
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
    setCart(prev => {
      const existingIdx = prev.findIndex(
        cartItem => cartItem.id === item.id && cartItem.size === item.size
      );
      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].qty += qty;
        return copy;
      } else {
        return [...prev, { ...item, qty }];
      }
    });
    showToast(`Added ${item.name} (${item.size || 'Standard'}) to cart!`, 'success');
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
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (id: string, size?: string) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.size === size)));
    showToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
    showToast('Cart cleared', 'info');
  };

  // StoreContext.tsx - I-update ang createOrder function

  const createOrder = (
    customer: CustomerDetails,
    discountCode: string,
    paymentMethod: string
  ): Order | null => {
    if (cart.length === 0) return null;

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

    const newOrder: Order = {
      orderId: 'CHUB-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      customer,
      items: [...cart],
      subtotal,
      shipping,
      discount: discountAmount,
      discountCode: cleanCode,
      total,
      payment: paymentMethod,
      status: 'Pending'
    };

    setOrders(prev => [newOrder, ...prev]);
    
    // ✅ HUWAG I-CLEAR ANG CART PARA PEDE MAG-ORDER ULIT
    // setCart([]); // REMOVED
    
    return newOrder;
  };

  const login = (username: string) => {
    const formatted = username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();
    setUser({ username: formatted, isLoggedIn: true });
    showToast(`Welcome back, ${formatted}!`, 'success');
  };

  const logout = () => {
    setUser({ username: '', isLoggedIn: false });
    showToast('Logged out successfully', 'info');
  };

  const closeSplash = () => {
    sessionStorage.setItem('splash_shown', 'true');
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
        closeSplash
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
