import React from 'react';
import { useStore } from '../context/StoreContext';
import { PageType, GenderType } from '../types';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Headphones, Sparkles, Star } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { setPage, setGender } = useStore();

  const categories: { id: PageType; title: string; desc: string; count: string; bg: string; defaultGender: GenderType }[] = [
    { id: 'clothes', title: 'Clothes', desc: 'Tops, Tees, Hoodies & Dresses', count: '18+ Styles', bg: 'from-indigo-100 to-indigo-200/50', defaultGender: 'men' },
    { id: 'shoes', title: 'Shoes', desc: 'Sneakers, Boots, Heels & Slides', count: '12+ Styles', bg: 'from-blue-100 to-blue-200/50', defaultGender: 'men' },
    { id: 'pants', title: 'Pants & Denim', desc: 'Jeans, Shorts, Trousers & Joggers', count: '10+ Fits', bg: 'from-stone-200 to-stone-300/50', defaultGender: 'men' },
    { id: 'underwear', title: 'Underwear', desc: 'Boxers, Briefs & Modern Trunks', count: '6+ Basics', bg: 'from-rose-100 to-rose-200/50', defaultGender: 'men' },
    { id: 'accessories', title: 'Accessories', desc: 'Crossbody Bags, Street Caps & Socks', count: '8+ Essentials', bg: 'from-emerald-100 to-emerald-200/50', defaultGender: 'men' }
  ];

  return (
    <div className="w-full space-y-16 py-6 animate-fadeIn">
      
      {/* Hero Section */}
      <section className="max-w-[1000px] mx-auto px-4 sm:px-8">
        <div className="relative rounded-[2.5rem] bg-linear-to-br from-stone-500 via-stone-500 to-stone-550 text-white overflow-hidden p-5 sm:p-8 lg:p-10 shadow-2xl border border-stone-800 max-w-[700px] mx-auto mt-10">
          
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-3">
              
              {/* Hang Tags / Badges */}
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                <span className="px-2.5 py-0.5 bg-indigo-500 text-white rounded-full flex items-center gap-1 shadow">
                  <Sparkles className="w-3 h-3" />
                  New Season Drop
                </span>
                <span className="px-2.5 py-0.5 bg-white/10 text-stone-300 rounded-full border border-white/10">
                  100% Combed Cotton
                </span>
                <span className="px-2.5 py-0.5 bg-white/10 text-stone-300 rounded-full border border-white/10">
                  Est. 2024
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-serif tracking-tight leading-[1.05]">
                Wear the story <br />
                <span className="text-indigo-400">you write.</span>
              </h1>

              <p className="text-stone-300 text-xs sm:text-sm max-w-md leading-relaxed font-light">
                Engineered streetwear tailored for elevated daily comfort. Discover high-density fabrics, modern cuts, and versatile essentials.
              </p>

              {/* Action Buttons */}
              <div className="pt-1 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setPage('shop')}
                  className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold rounded-full transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2 text-[10px] uppercase tracking-wider hover:scale-105 active:scale-95"
                >
                  <span>Shop Collection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('aboutStorySection');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full transition-all border border-white/20 text-[10px] uppercase tracking-wider"
                >
                  Our Story
                </button>
              </div>

            </div>

            {/* Right Hero Stage Showcase Visual */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div 
                className="relative w-full max-w-[200px] aspect-square rounded-2xl bg-stone-800/80 border border-white/10 p-3 flex flex-col items-center justify-center shadow-2xl backdrop-blur-sm group cursor-pointer overflow-hidden"
                onClick={() => setPage('clothes', 'tshirt', 'men')}
              >
                <div className="absolute top-2 right-2 bg-indigo-500 text-white font-black text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow z-10">
                  Featured
                </div>
                
                {/* Actual Product Image */}
                <img 
                  src="/images/clothes/men/t-shirts/white.png" 
                  alt="Featured Streetwear Tee"
                  className="w-28 h-28 object-contain group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%232A3459"/%3E%3Ctext x="100" y="100" text-anchor="middle" dy=".3em" fill="white" font-size="16"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
                
                <div className="text-center mt-0.5 z-10">
                  <p className="font-extrabold text-xs text-white font-serif">Signature Tee</p>
                  <p className="text-[8px] text-indigo-400 font-bold">₱1,999 • Tap</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Stat Strip */}
      <section className="max-w-[1300px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white dark:bg-stone-900 rounded-3xl p-8 shadow-sm border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 flex items-center justify-center font-bold text-xl">
              <i className="fas fa-users"></i>
            </div>
            <div>
              <p className="text-2xl font-black">10,000+</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">Customers dressed nationwide</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center font-bold text-xl">
              <i className="fas fa-layer-group"></i>
            </div>
            <div>
              <p className="text-2xl font-black">5 Categories</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">One shared standard of quality</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center font-bold text-xl">
              <Star className="w-6 h-6 fill-emerald-500 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-black">4.8 / 5.0</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">Average customer rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy / About Section */}
      <section id="aboutStorySection" className="max-w-[1300px] mx-auto px-4 sm:px-8 pt-6">
        <div className="rounded-3xl bg-stone-900 text-white p-8 sm:p-14 border border-stone-800 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <span className="text-xs uppercase font-extrabold tracking-[0.25em] text-indigo-400">
              The C-HUB Standard
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif leading-tight">
              Crafted with intention. <br />
              Worn without limits.
            </h2>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              Founded on the belief that everyday clothing should feel effortless yet distinctly bold, C-HUB fuses minimalist silhouettes with premium heavy-weight materials. Each garment undergoes strict quality assurance to withstand every season and every journey.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-800">
              <div>
                <p className="font-bold text-lg text-indigo-400">100% Authentic</p>
                <p className="text-xs text-stone-400">Original in-house design</p>
              </div>
              <div>
                <p className="font-bold text-lg text-indigo-400">Eco-Conscious</p>
                <p className="text-xs text-stone-400">Ethically sourced textiles</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-stone-500/80 border border-stone-700 space-y-2">
              <Truck className="w-8 h-8 text-indigo-400" />
              <h4 className="font-bold text-sm">Nationwide Delivery</h4>
              <p className="text-xs text-stone-400">Free shipping on orders over ₱2,500 across the Philippines.</p>
            </div>
            <div className="p-6 rounded-2xl bg-stone-800/80 border border-stone-700 space-y-2">
              <ShieldCheck className="w-8 h-8 text-indigo-400" />
              <h4 className="font-bold text-sm">Secure Transactions</h4>
              <p className="text-xs text-stone-400">Protected payment via GCash, Maya, COD, and Credit Cards.</p>
            </div>
            <div className="p-6 rounded-2xl bg-stone-800/80 border border-stone-700 space-y-2">
              <RefreshCw className="w-8 h-8 text-indigo-400" />
              <h4 className="font-bold text-sm">30-Day Returns</h4>
              <p className="text-xs text-stone-400">Hassle-free size swaps and exchanges within 30 days.</p>
            </div>
            <div className="p-6 rounded-2xl bg-stone-800/80 border border-stone-700 space-y-2">
              <Headphones className="w-8 h-8 text-indigo-400" />
              <h4 className="font-bold text-sm">Dedicated Support</h4>
              <p className="text-xs text-stone-400">24/7 customer care team ready to assist your orders.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};