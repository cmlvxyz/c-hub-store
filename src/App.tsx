import React from 'react';
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

// ✅ WALANG AdminDashboard import dito

const MainLayout: React.FC = () => {
  const { page, activeBgColor, isDarkTheme, toast, user } = useStore();

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
      // ✅ WALANG 'admin' case
      default:
        return <HomePage />;
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-between"
      style={{
        ...(containerBgStyle || { backgroundColor: 'white' }),
        transition: 'background-color 0.65s cubic-bezier(0.4, 0, 0.2, 1), color 0.5s ease'
      }}
    >
      <SplashScreen />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-stone-900 text-white shadow-2xl border border-stone-700 text-xs font-bold">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 w-full">
          {renderActivePage()}
        </main>
      </div>

      <Footer />
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