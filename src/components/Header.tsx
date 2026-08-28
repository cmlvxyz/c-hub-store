import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingCart, Bell, Menu, X, LogOut, Package, ChevronDown, Box, Sparkles } from 'lucide-react';
import { PageType } from '../types';

export const Header: React.FC = () => {
  const { page, setPage, cart, orders, user, logout, isDarkTheme } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const totalCartCount = cart.reduce((total, item) => total + item.qty, 0);

  const navLinks: { label: string; page: PageType }[] = [
    { label: 'Home', page: 'home' },
    { label: 'Shop', page: 'shop' },
    ...(user.isLoggedIn && orders.length > 0 ? [{ label: 'Orders', page: 'orders' as PageType }] : [])
  ];

  const handleNavClick = (targetPage: PageType) => {
    setPage(targetPage);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const navColorClass = isDarkTheme ? 'text-white' : 'text-stone-900';

  const isActive = (pageType: PageType) => {
    return page === pageType || 
      (pageType === 'shop' && ['clothes', 'shoes', 'pants', 'underwear', 'accessories'].includes(page));
  };

  return (
    <header className="w-full relative z-40 transition-colors duration-300 bg-transparent">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-8 py-5 flex items-center justify-between">
        
        {/* Brand Logo */}
        <button
          id="navBrandLogo"
          onClick={() => handleNavClick('home')}
          className={`flex items-center gap-2.5 font-black tracking-tight text-xl sm:text-2xl transition-transform hover:scale-105 select-none cursor-pointer ${navColorClass}`}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Box className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="font-extrabold tracking-tight font-serif">
            C<span className="text-indigo-600 font-sans">-</span>HUB
          </span>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-3 text-sm font-semibold p-1.5 rounded-full bg-stone-100/80 dark:bg-stone-900/60 backdrop-blur-md border border-stone-200/50 dark:border-stone-800/50 shadow-inner">
          {navLinks.map((link) => (
            <button
              key={link.page}
              id={`navLink-${link.page}`}
              onClick={() => handleNavClick(link.page)}
              className={`py-2 px-5 rounded-full transition-all duration-200 tracking-wide text-xs sm:text-sm font-bold cursor-pointer ${
                isActive(link.page)
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-102'
                  : isDarkTheme
                  ? 'text-white/80 hover:text-white hover:bg-white/10'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/60'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right Action Area */}
        <div className="flex items-center gap-3 sm:gap-5">

          {user.isLoggedIn ? (
            <div className="flex items-center gap-3 sm:gap-5">
              <div className="relative">
                <button
                  id="navUserMenuBtn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-bold tracking-tight transition-colors cursor-pointer border ${
                    isDarkTheme
                      ? 'border-white/20 text-white hover:bg-white/10'
                      : 'border-stone-200 bg-white text-stone-900 hover:border-indigo-300 shadow-sm'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{user.username || 'User'}</span>
                  <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white text-stone-800 rounded-2xl shadow-2xl border border-stone-100 py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2.5 border-b border-stone-100">
                      <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Signed in as</p>
                      <p className="font-bold text-sm text-stone-900 truncate">
                        {user.username || 'User'}
                      </p>
                    </div>
                    {orders.length > 0 && (
                      <button
                        onClick={() => {
                          handleNavClick('orders');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-stone-50 flex items-center justify-between text-stone-700"
                      >
                        <span className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-indigo-500" />
                          My Orders
                        </span>
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                          {orders.length}
                        </span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                        setPage('home');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-stone-50"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>

              <button
                id="navCartBtn"
                onClick={() => handleNavClick('cart')}
                className={`relative p-2 rounded-full transition-transform active:scale-95 cursor-pointer ${
                  page === 'cart'
                    ? 'text-indigo-600 bg-indigo-50'
                    : isDarkTheme
                    ? 'text-white hover:text-indigo-300'
                    : 'text-stone-900 hover:text-indigo-600 hover:bg-stone-100'
                }`}
              >
                <ShoppingCart className="w-5 h-5 stroke-[2.2]" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center shadow-md">
                    {totalCartCount}
                  </span>
                )}
              </button>

              <button
                id="navNotificationBtn"
                onClick={() => handleNavClick('shop')}
                className={`relative p-2 rounded-full transition-transform active:scale-95 cursor-pointer ${
                  isDarkTheme ? 'text-white hover:text-indigo-300' : 'text-stone-900 hover:text-indigo-600 hover:bg-stone-100'
                }`}
              >
                <Bell className="w-5 h-5 stroke-[2.2]" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                id="navLoginBtn"
                onClick={() => handleNavClick('login')}
                className={`py-2 px-5 rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  page === 'login'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : isDarkTheme
                    ? 'border border-white/40 text-white hover:bg-white/10'
                    : 'bg-stone-900 text-white hover:bg-stone-800 shadow-sm'
                }`}
              >
                Sign In
              </button>
            </div>
          )}

          <button
            id="navMobileToggleBtn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg ${navColorClass}`}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white text-stone-900 border-b border-stone-200 px-6 py-5 shadow-2xl space-y-4 animate-fadeIn">
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => handleNavClick(link.page)}
              className={`block w-full text-left py-2.5 text-base font-semibold border-b border-stone-100 ${
                isActive(link.page) ? 'text-indigo-600 font-bold' : 'text-stone-700'
              }`}
            >
              {link.label}
            </button>
          ))}

          {user.isLoggedIn ? (
            <div className="pt-2">
              <div className="flex items-center justify-between py-2 text-sm text-stone-600">
                <span>
                  Account: <b className="text-stone-900">{user.username || 'User'}</b>
                </span>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    setPage('home');
                  }}
                  className="text-red-500 font-bold text-xs flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Log Out
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => handleNavClick('login')}
              className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-center shadow-lg"
            >
              Sign In / Login
            </button>
          )}
        </div>
      )}
    </header>
  );
};
