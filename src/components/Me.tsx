import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  User,
  Package,
  Heart,
  HelpCircle,
  Settings,
  ChevronRight,
  MapPin,
  CreditCard,
  Truck,
  Bell,
  LogOut,
  PencilLine,
  Phone,
  Info,
} from 'lucide-react';

/*
 * "Me" screen (mobile + desktop account dashboard).
 *
 * MOBILE : iisang column (guest welcome + Quick Access, o logged-in sections).
 * DESKTOP: nakakalat para punan ang screen —
 *          - GUEST  : welcome panel (kaliwa) + Quick Access (kanan).
 *          - LOGGED : malapad na profile card + MY ACCOUNT / MY ORDERS / SETTINGS
 *                      sa responsive grid (1col mobile, 3col desktop) + Log Out.
 *
 * Gumagamit ng EXISTING auth (useStore): user / customerInfo / logout.
 * Hindi gumagawa ng bagong auth at hindi binabago ang ibang screens.
 */
export const Me: React.FC = () => {
  const { user, customerInfo, setPage, logout } = useStore();

  // Local "coming soon" toast — dito lang sa Me, hindi global.
  const [meToast, setMeToast] = useState<{ message: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const isLoggedIn = user.isLoggedIn;
  const displayName = customerInfo?.name || user.username || 'C-Hub User';
  const displayEmail = customerInfo?.email || `${user.username || 'user'}@c-hub.ph`;

  const Row: React.FC<{
    icon: React.ReactNode;
    label: string;
    subtitle?: string;
    onClick: () => void;
  }> = ({ icon, label, subtitle, onClick }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors active:bg-stone-50 dark:active:bg-stone-800/60 hover:bg-stone-50 dark:hover:bg-stone-800/60"
    >
      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-stone-900 dark:text-white truncate">{label}</p>
        {subtitle && <p className="text-[11px] text-stone-400 mt-0.5 truncate">{subtitle}</p>}
      </div>
      <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600 shrink-0" />
    </button>
  );

  const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div
      className={`bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800 divide-y divide-stone-100 dark:divide-stone-800 overflow-hidden ${
        className || ''
      }`}
    >
      {children}
    </div>
  );

  const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p className="px-1 text-[11px] font-black tracking-[0.2em] uppercase text-stone-400 dark:text-stone-500">
      {children}
    </p>
  );

  const Avatar: React.FC<{ size?: string }> = ({ size = 'w-20 h-20' }) =>
    avatar ? (
      <div
        className={`${size} rounded-full overflow-hidden border-2 border-indigo-200 dark:border-indigo-500/30 shadow-md shrink-0`}
      >
        <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
      </div>
    ) : (
      <div
        className={`${size} rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 border-2 border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center shrink-0`}
      >
        <User className="w-1/2 h-1/2 text-indigo-500" />
      </div>
    );

  const avatar = customerInfo?.avatar || '';

  const goSignIn = () => setPage('signin');
  const comingSoon = () => {
    setMeToast({ message: 'This feature is coming soon.' });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setMeToast(null), 2500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-10 pt-4 md:pt-8 pb-10 animate-fadeIn">
      {!isLoggedIn ? (
        /* ============ STATE A — LOGGED OUT ============ */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-stretch">
          {/* Welcome panel */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800 px-6 py-10 md:py-14 flex flex-col items-center justify-center text-center">
            <Avatar size="w-24 h-24 md:w-28 md:h-28" />
            <h1 className="mt-5 text-xl md:text-3xl font-black text-stone-900 dark:text-white">
              Welcome to C-Hub
            </h1>
            <p className="mt-2 max-w-[300px] md:max-w-sm text-[13px] md:text-base leading-relaxed text-stone-500 dark:text-stone-400">
              Sign in to access your account and orders.
            </p>
            <button
              onClick={goSignIn}
              className="mt-7 md:mt-9 w-full max-w-[220px] md:max-w-[260px] py-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm md:text-base font-black uppercase tracking-wider shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
            >
              Sign In
            </button>
          </div>

          {/* Quick Access */}
          <div className="space-y-3">
            <SectionTitle>Quick Access</SectionTitle>
            <Card className="md:grid md:grid-cols-2 md:divide-y-0">
              <Row
                icon={<Package className="w-5 h-5 text-indigo-500" />}
                label="My Orders"
                subtitle="Sign in to view your orders"
                onClick={goSignIn}
              />
              <Row
                icon={<Heart className="w-5 h-5 text-indigo-500" />}
                label="Wishlist"
                subtitle="Sign in to view your wishlist"
                onClick={goSignIn}
              />
              <Row
                icon={<HelpCircle className="w-5 h-5 text-indigo-500" />}
                label="Help & Support"
                subtitle="FAQs, shipping and returns"
                onClick={() => setPage('faq')}
              />
              <Row
                icon={<Settings className="w-5 h-5 text-indigo-500" />}
                label="Settings"
                subtitle="App preferences"
                onClick={comingSoon}
              />
            </Card>
          </div>
        </div>
      ) : (
        /* ============ STATE B — LOGGED IN ============ */
        <>
          {/* Profile section */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800 px-5 md:px-8 py-6 md:py-8">
            <div className="flex items-center gap-5 md:gap-6">
              <Avatar size="w-20 h-20 md:w-28 md:h-28" />
              <div className="flex-1 min-w-0">
                <p className="text-lg md:text-3xl font-black text-stone-900 dark:text-white truncate">
                  {displayName}
                </p>
                <p className="mt-0.5 text-xs md:text-sm text-stone-500 dark:text-stone-400 truncate">
                  {displayEmail}
                </p>

                {(customerInfo?.phone || customerInfo?.address) && (
                  <div className="hidden md:flex flex-wrap items-center gap-3 mt-3 text-[13px] text-stone-500 dark:text-stone-400">
                    {customerInfo.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-indigo-500" />
                        {customerInfo.phone}
                      </span>
                    )}
                    {customerInfo.address && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-indigo-500" />
                        <span className="truncate max-w-[420px]">{customerInfo.address}</span>
                      </span>
                    )}
                  </div>
                )}

                <button
                  onClick={() => setPage('edit-profile')}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs md:text-sm font-bold text-indigo-600 hover:underline underline-offset-2"
                >
                  <PencilLine className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* MY ACCOUNT / MY ORDERS / SETTINGS — responsive grid */}
          <div className="mt-6 md:mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
            <div className="space-y-3">
              <SectionTitle>My Account</SectionTitle>
              <Card>
                <Row
                  icon={<User className="w-5 h-5 text-indigo-500" />}
                  label="Personal Information"
                  subtitle="Name, email and contact details"
                  onClick={comingSoon}
                />
                <Row
                  icon={<MapPin className="w-5 h-5 text-indigo-500" />}
                  label="Addresses"
                  subtitle="Manage your delivery addresses"
                  onClick={comingSoon}
                />
                <Row
                  icon={<CreditCard className="w-5 h-5 text-indigo-500" />}
                  label="Payment Methods"
                  subtitle="Cards and payment options"
                  onClick={comingSoon}
                />
              </Card>
            </div>

            <div className="space-y-3">
              <SectionTitle>My Orders</SectionTitle>
              <Card>
                <Row
                  icon={<Package className="w-5 h-5 text-indigo-500" />}
                  label="My Orders"
                  subtitle="View your order history"
                  onClick={() => setPage('orders')}
                />
                <Row
                  icon={<Truck className="w-5 h-5 text-indigo-500" />}
                  label="Track Order"
                  subtitle="Track your current orders"
                  onClick={() => setPage('orders')}
                />
              </Card>
            </div>

            <div className="space-y-3">
              <SectionTitle>Settings</SectionTitle>
              <Card>
                <Row
                  icon={<Bell className="w-5 h-5 text-indigo-500" />}
                  label="Notifications"
                  subtitle="Order and promo alerts"
                  onClick={comingSoon}
                />
                <Row
                  icon={<Settings className="w-5 h-5 text-indigo-500" />}
                  label="Settings"
                  subtitle="App preferences"
                  onClick={comingSoon}
                />
                <Row
                  icon={<HelpCircle className="w-5 h-5 text-indigo-500" />}
                  label="Help & Support"
                  subtitle="FAQs, shipping and returns"
                  onClick={() => setPage('faq')}
                />
              </Card>
            </div>
          </div>

          {/* Log Out */}
          <button
            onClick={logout}
            className="mt-8 md:mt-12 w-full md:w-auto min-w-0 md:min-w-[260px] flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-200 dark:border-red-500/30 text-red-500 text-sm font-black tracking-wider hover:bg-red-50 dark:hover:bg-red-950/20 active:scale-95 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </>
      )}

      {/* Local "coming soon" toast */}
      {meToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-stone-900 text-white shadow-2xl border border-stone-700 text-xs font-bold">
            <Info className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{meToast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};