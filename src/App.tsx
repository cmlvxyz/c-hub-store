import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { SplashScreen } from './components/SplashScreen';
import { GetStarted } from './components/GetStarted';
import { SignIn } from './components/SignIn';
import { SignUp } from './components/SignUp';
import { ProductShowcase } from './components/ProductShowcase';
import { HomePage } from './components/HomePage';
import { ShopPage } from './components/ShopPage';
import { CartPage } from './components/CartPage';
import { CheckoutPage } from './components/CheckoutPage';
import { OrdersPage } from './components/OrdersPage';
import { LoginPage } from './components/LoginPage';
import { ForgotPassword } from './components/ForgotPassword';
import { ResetPassword } from './components/ResetPassword';
import { Me } from './components/Me';
import { EditProfile } from './components/EditProfile';
import { SecuritySettings } from './components/SecuritySettings';
import { FAQPage, ShippingPage, ReturnsPage, SizeGuidePage, ContactPage } from './components/SupportPages';

const MainLayout: React.FC = () => {
  const { page, activeBgColor, user, splashShown, setPage, shopBgColor } = useStore();
  const [hasRenderedAfterSplash, setHasRenderedAfterSplash] = useState(false);
  const routedAfterSplash = useRef(false);

  useEffect(() => {
    if (splashShown) {
      setHasRenderedAfterSplash(true);
    } else {
      setHasRenderedAfterSplash(false);
    }
  }, [splashShown]);

  // Pagkatapos ng splash: guest -> Get Started (minsan lang), logged-in -> Home.
  useEffect(() => {
    if (splashShown && !routedAfterSplash.current) {
      routedAfterSplash.current = true;
      if (!user.isLoggedIn) {
        setPage('getstarted');
      }
    }
  }, [splashShown, user.isLoggedIn, setPage]);

  const isCategoryPage = ['clothes', 'shoes', 'pants', 'underwear', 'accessories'].includes(page);

  // Guest na humahawak sa cart/checkout/orders -> ilabas ang Login overlay.
  const showAuthBlock = !user.isLoggedIn && ['cart', 'checkout', 'orders'].includes(page);

  const containerBgStyle = isCategoryPage
    ? { backgroundColor: activeBgColor }
    : undefined;

  const renderActivePage = () => {
    if (showAuthBlock) {
      return null;
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
      case 'me':
        return <Me />;
      case 'edit-profile':
        return <EditProfile />;
      case 'security':
        return <SecuritySettings />;
      case 'login':
        return null;
      case 'forgot':
        return null;
      case 'reset':
        return null;
      case 'signin':
        return null;
      case 'signup':
        return null;
      case 'getstarted':
        return user.isLoggedIn ? <HomePage /> : null;
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
      className="relative flex flex-col justify-between h-dvh overflow-hidden md:h-auto md:min-h-screen md:overflow-x-hidden md:overflow-y-visible pt-20 md:pt-0"
      style={{
        ...(containerBgStyle || { backgroundColor: '#ffffff' }),
        transition: 'background-color 0.65s cubic-bezier(0.4, 0, 0.2, 1), color 0.5s ease'
      }}
    >
      {/* Sliding c-hub.png background layer (slides down from top after splash, matching header+homepage) */}
      {!isCategoryPage && (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(900px 520px at 50% -6%, rgba(99,102,241,0.14), transparent 62%),
                radial-gradient(760px 480px at 88% 22%, rgba(56,189,248,0.12), transparent 60%),
                radial-gradient(820px 560px at 8% 78%, rgba(129,140,248,0.10), transparent 60%),
                linear-gradient(180deg, #ffffff 0%, #f4f5fb 100%)
              `,
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

      {/* Mobile-only: buong screen ang kulay ng napiling product sa Category (desktop + shop untouched) */}
      {isCategoryPage && (
        <div
          className="fixed inset-0 z-0 pointer-events-none md:hidden"
          style={{ backgroundColor: shopBgColor, transition: 'background-color 420ms cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      )}

      {/* Enhanced Animated White Splash Screen */}
      <SplashScreen />

      {/* Mobile onboarding overlays (fixed, cover header/nav) — "then" sequence:
          magsasara muna ang lalabas (slide down), bago pumasok ang bago (slide up) */}
      <AnimatePresence mode="wait">
        {splashShown && page === 'getstarted' && <GetStarted key="getstarted" />}
        {splashShown && page === 'signin' && <SignIn key="signin" />}
        {splashShown && page === 'signup' && <SignUp key="signup" />}
        {splashShown && page === 'forgot' && <ForgotPassword key="forgot" />}
        {splashShown && page === 'reset' && <ResetPassword key="reset" />}
        {splashShown && (page === 'login' || showAuthBlock) && <LoginPage key="login" />}
      </AnimatePresence>

      {/* Mobile-fixed / desktop-in-flow header — rendered OUTSIDE the animated
          wrapper so `position: fixed` targets the viewport (no transformed/filtered
          ancestor). On desktop (md+) it stays in normal flow, unchanged. */}
      {splashShown && page !== 'getstarted' && page !== 'signin' && page !== 'signup' && page !== 'forgot' && page !== 'reset' && page !== 'login' && <Header />}

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
          className="relative z-10 flex flex-col flex-1 w-full min-h-0 justify-between overflow-y-auto overflow-x-hidden md:overflow-visible overscroll-contain"
        >
          <div className="flex flex-col flex-1 pb-16 md:pb-0">
            <main className="flex-1 w-full">
              <AnimatePresence>
                <motion.div
                  key={page}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  {renderActivePage()}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </motion.div>
      ) : (
        <div className="opacity-0 pointer-events-none h-screen" />
      )}

      {/* Mobile-only bottle nav — rendered OUTSIDE the animated wrapper so its
          `position: fixed` targets the viewport (no transformed/filtered ancestor) */}
      {splashShown && page !== 'getstarted' && page !== 'signin' && page !== 'signup' && page !== 'forgot' && page !== 'reset' && page !== 'login' && <MobileBottomNav />}
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