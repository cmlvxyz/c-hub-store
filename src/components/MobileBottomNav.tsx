import React from 'react';
import { useStore } from '../context/StoreContext';
import { Home, ShoppingBag, ShoppingCart, Package, User } from 'lucide-react';
import { PageType } from '../types';

export const MobileBottomNav: React.FC = () => {
  const { page, setPage, cart } = useStore();

  const totalCartCount = cart.reduce((total, item) => total + item.qty, 0);

  const tabs: { id: PageType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'shop', label: 'Shop', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'cart', label: 'Cart', icon: <ShoppingCart className="w-5 h-5" />, badge: totalCartCount },
    { id: 'orders', label: 'Orders', icon: <Package className="w-5 h-5" /> },
    { id: 'login', label: 'Me', icon: <User className="w-5 h-5" /> },
  ];

  const isActive = (id: PageType) => {
    if (id === 'shop') {
      return ['clothes', 'shoes', 'pants', 'underwear', 'accessories'].includes(page) ||
        page === 'shop';
    }
    return page === id;
  };

  return (
    <nav
      id="mobileBottomNav"
      className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-40 flex items-stretch justify-around gap-1 w-[calc(100%-2rem)] max-w-xs rounded-full bg-white/50 dark:bg-stone-900/95 backdrop-blur-xl shadow-md px-2 py-0.2"
    >
      <div className="flex items-stretch justify-around flex-1 pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => {
          const active = isActive(tab.id);
          return (
            <button
              key={tab.id}
              id={`mobileNav-${tab.id}`}
              onClick={() => setPage(tab.id)}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 flex-1 cursor-pointer transition-colors ${
                active
                  ? 'text-indigo-600'
                  : 'text-stone-500 dark:text-stone-400'
              }`}
            >
              <span className="relative">
                {tab.icon}
                {tab.badge != null && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black rounded-full min-w-[16px] h-4 px-0.5 flex items-center justify-center shadow-md">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </span>
              <span className={`text-[10px] font-bold ${active ? 'text-indigo-600' : 'text-stone-500 dark:text-stone-400'}`}>
                {tab.label}
              </span>
              {active && <span className="absolute top-0 w-8 h-0.5 rounded-full bg-indigo-600" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
