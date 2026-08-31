import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SplashScreen } from './components/SplashScreen';
import { ProductShowcase } from './components/ProductShowcase';
import { HomePage } from './components/HomePage';
import { ShopPage } from './components/ShopPage';
import { CartPage } from './components/CartPage';
import { CheckoutPage } from './components/CheckoutPage';
import { OrdersPage } from './components/OrdersPage';
import { LoginPage } from './components/LoginPage';
import { FAQPage, ShippingPage, ReturnsPage, SizeGuidePage, ContactPage } from './components/SupportPages';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { page, activeBgColor, isDarkTheme, toast, user, splashShown, setPage } = useStore();
  const [hasRenderedAfterSplash, setHasRenderedAfterSplash] = useState(false);
  const routedAfterSplash = useRef(false);

  useEffect(() => {
    if (splashShown) {
      setHasRenderedAfterSplash(true);
    } else {
      setHasRenderedAfterSplash(false);
    }
  }, [splashShown]);

  // Pagkatapos ng splash: kung hindi pa naka-login, i-land sa Login page (minsan lang).
  // Kung naka-login na, deretso sa Home.
  useEffect(() => {
    if (splashShown && !routedAfterSplash.current) {
      routedAfterSplash.current = true;
      if (!user.isLoggedIn) {
        setPage('login');
      }
    }
  }, [splashShown, user.isLoggedIn, setPage]);

  const isProductShowcase = ['clothes', 'shoes', 'pants', 'underwear', 'accessories'].includes(page);

  const containerBgStyle = isProductShowcase
    ? { backgroundColor: activeBgColor }
    : undefined;

  const renderActivePage = () => {
    if (!user.isLoggedIn && ['cart', 'checkout', 'orders'].includes(page)) {
      return <LoginPage />;
    }

    switch (page) {
      case 'home':
        return <HomePage />;
      case 'shop':
        return <ShopPage />;
      case 'clothes':
      case 'shoes':
      case 'pants':
      case 'underwear':
      case 'accessories':
        return <ProductShowcase />;
      case 'cart':
        return <CartPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'orders':
        return <OrdersPage />;
      case 'login':
        return <LoginPage />;
      case 'faq':
        return <FAQPage />;
      case 'shipping':
        return <ShippingPage />;
      case 'returns':
        return <ReturnsPage />;
      case 'size-guide':
        return <SizeGuidePage />;
      case 'contact':
        return <ContactPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-between overflow-x-hidden relative"
      style={{
        ...(containerBgStyle || { backgroundColor: '#ffffff' }),
        transition: 'background-color 0.65s cubic-bezier(0.4, 0, 0.2, 1), color 0.5s ease'
      }}
    >
      {/* Sliding c-hub.png background layer (slides down from top after splash, matching header+homepage) */}
      {!isProductShowcase && (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: `url('/c-hub.png')`,
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
            transition={{ type: 'spring', stiffness: 140, damping: 18, mass: 0.85, duration: 0.9 }}
            initial={{ y: '-100%' }}
            animate={splashShown ? { y: '0%' } : { y: '-100%' }}
          />
        </div>
      )}

      {/* Enhanced Animated White Splash Screen */}
      <SplashScreen />

      {/* Global Interactive Notification Toast */}
      {toast && (
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50 pointer-events-none"
        >
          <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-stone-900 text-white shadow-2xl border border-stone-700 text-xs font-bold pointer-events-auto">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-indigo-400 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </motion.div>
      )}

      {/* Main Content with Drop-Down Entrance from the Top after Splash Screen finishes */}
      {splashShown ? (
        <motion.div
          key="main-app-content-dropped"
          initial={{ y: -160, opacity: 0, filter: 'blur(6px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          transition={{
            type: 'spring',
            stiffness: 140,
            damping: 18,
            mass: 0.85,
            duration: 0.9
          }}
          className="relative z-10 flex flex-col flex-1 w-full justify-between"
        >
          <div className="flex flex-col flex-1">
            <Header />
            <main className="flex-1 w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={page}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  {renderActivePage()}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>

          <Footer />
        </motion.div>
      ) : (
        <div className="opacity-0 pointer-events-none h-screen" />
      )}
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainLayout />
    </StoreProvider>
  );
}