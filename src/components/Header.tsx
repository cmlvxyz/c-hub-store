import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ShoppingCart, Bell, Menu, X, LogOut, Package, ChevronDown, Box } from 'lucide-react';
import { PageType } from '../types';

export const Header: React.FC = () => {
  const { page, setPage, cart, orders, user, logout, isDarkTheme } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const totalCartCount = cart.reduce((total, item) => total + item.qty, 0);

  const navLinks: { label: string; page: PageType; path: string }[] = [
    { label: 'Home', page: 'home', path: '/home' },
    { label: 'Shop', page: 'shop', path: '/shop' },
    ...(user.isLoggedIn && orders.length > 0 ? [{ label: 'Orders', page: 'orders' as PageType, path: '/orders' }] : [])
  ];

  const handleNavClick = (targetPage: PageType, path: string) => {
    setPage(targetPage);
    navigate(path);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  // Use isDarkTheme to determine text color, but keep header transparent
  const navColorClass = isDarkTheme ? 'text-white' : 'text-stone-900';

  const isActive = (pageType: PageType) => {
    return page === pageType || 
      (pageType === 'shop' && ['clothes', 'shoes', 'pants', 'underwear', 'accessories'].includes(page));
  };

  return (
    <header className="w-full relative top-7 z-40 transition-colors duration-300 bg-transparent">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-8 py-5 flex items-center justify-between">
        
        {/* Brand Logo */}
        <button
          id="navBrandLogo"
          onClick={() => handleNavClick('home', '/home')}
          className={`flex items-center gap-2 font-black tracking-tight text-xl sm:text-2xl transition-transform hover:scale-105 select-none ${navColorClass}`}
        >
          <Box className="w-7 h-7 stroke-[2.5] text-indigo-500" />
          <span className="font-extrabold tracking-tight border-b-2 border-current pb-0.5">
            C-HUB
          </span>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-[15px] font-semibold">
          {navLinks.map((link) => (
            <button
              key={link.page}
              id={`navLink-${link.page}`}
              onClick={() => handleNavClick(link.page, link.path)}
              className={`py-1.5 px-4 rounded-full transition-all duration-200 tracking-wide text-sm font-bold cursor-pointer ${
                isActive(link.page)
                  ? isDarkTheme
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'bg-stone-900 text-white shadow-sm'
                  : isDarkTheme
                  ? 'text-white/80 hover:text-white hover:bg-white/10'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right Action Area */}
        <div className="flex items-center gap-4 sm:gap-6">
          {user.isLoggedIn ? (
            <div className="flex items-center gap-3 sm:gap-5">
              <div className="relative">
                <button
                  id="navUserMenuBtn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-1.5 py-1 px-1 text-[16px] sm:text-[17px] font-bold tracking-tight transition-colors cursor-pointer ${
                    isDarkTheme
                      ? 'text-white hover:text-indigo-400'
                      : 'text-[#1e3a5f] hover:text-stone-900'
                  }`}
                >
                  <span>{user.username || 'Admin'}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-stone-800 rounded-2xl shadow-xl border border-stone-100 py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs text-stone-500">Signed in as</p>
                      <p className="font-bold text-sm text-stone-900 truncate">
                        {user.username || 'Admin'}
                      </p>
                    </div>
                    {orders.length > 0 && (
                      <button
                        onClick={() => {
                          handleNavClick('orders', '/orders');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-stone-50 flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-stone-500" />
                          My Orders
                        </span>
                        <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded-full">
                          {orders.length}
                        </span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                        navigate('/home');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>

              <button
                id="navCartBtn"
                onClick={() => handleNavClick('cart', '/cart')}
                className={`relative p-1.5 transition-transform active:scale-95 cursor-pointer ${
                  page === 'cart'
                    ? isDarkTheme
                      ? 'text-indigo-400'
                      : 'text-indigo-600'
                    : isDarkTheme
                    ? 'text-white hover:text-indigo-400'
                    : 'text-stone-900 hover:text-stone-700'
                }`}
              >
                <ShoppingCart className="w-6 h-6 stroke-[2.2]" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center shadow-md">
                    {totalCartCount}
                  </span>
                )}
              </button>

              <button
                id="navNotificationBtn"
                onClick={() => handleNavClick('shop', '/shop')}
                className={`relative p-1.5 transition-transform active:scale-95 cursor-pointer ${
                  isDarkTheme ? 'text-white hover:text-indigo-400' : 'text-stone-900 hover:text-stone-700'
                }`}
              >
                <Bell className="w-6 h-6 stroke-[2.2]" />
                <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-stone-900" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                id="navLoginBtn"
                onClick={() => handleNavClick('login', '/login')}
                className={`py-1.5 px-4 rounded-full font-bold text-sm transition-all ${
                  page === 'login'
                    ? 'bg-stone-900 text-white'
                    : `${
                        isDarkTheme
                          ? 'border border-white/40 text-white hover:bg-white/10'
                          : 'border border-stone-400 text-stone-900 hover:bg-stone-100'
                      }`
                }`}
              >
                Login
              </button>
            </div>
          )}

          <button
            id="navMobileToggleBtn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-1.5 rounded-lg ${navColorClass}`}
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
              onClick={() => handleNavClick(link.page, link.path)}
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
                  Account: <b className="text-stone-900">{user.username || 'Admin'}</b>
                </span>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/home');
                  }}
                  className="text-red-500 font-medium text-xs flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Log Out
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => handleNavClick('login', '/login')}
              className="w-full mt-2 py-3 bg-stone-900 text-white font-medium rounded-xl text-center"
            >
              Sign In / Login
            </button>
          )}
        </div>
      )}
    </header>
  );
};