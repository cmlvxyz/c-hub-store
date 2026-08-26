import React from 'react';
import { useStore } from '../context/StoreContext';
import { PageType, GenderType } from '../types';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Headphones, Sparkles, Star, ShoppingBag, Footprints, Tag, Shirt, Glasses } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { setPage, setGender } = useStore();

  const categories: { id: PageType; title: string; desc: string; icon: React.ReactNode; defaultGender: GenderType }[] = [
    { id: 'clothes', title: 'Clothes', desc: 'Tees, hoodies & sweatshirts', icon: <Shirt className="w-8 h-8" />, defaultGender: 'men' },
    { id: 'shoes', title: 'Shoes', desc: 'Everyday footwear', icon: <Footprints className="w-8 h-8" />, defaultGender: 'men' },
    { id: 'pants', title: 'Pants', desc: 'Denim, joggers & trousers', icon: <Tag className="w-8 h-8" />, defaultGender: 'men' },
    { id: 'underwear', title: 'Underwear', desc: 'Everyday basics', icon: <Shirt className="w-8 h-8" />, defaultGender: 'men' },
    { id: 'accessories', title: 'Accessories', desc: 'Finish the look', icon: <Glasses className="w-8 h-8" />, defaultGender: 'men' }
  ];

  return (
    <div className="w-full space-y-12 py-6 animate-fadeIn">
      
      {/* ===== HERO SECTION ===== */}
      <section className="max-w-[1300px] mx-auto px-4 sm:px-8">
        <div className="relative rounded-[2.5rem] bg-linear-to-br from-stone-500 via-stone-500 to-stone-550 text-white overflow-hidden p-8 sm:p-12 lg:p-16 shadow-2xl border border-stone-800">
          
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500 text-white rounded-full text-[10px] font-bold uppercase tracking-wider shadow">
                <Sparkles className="w-3.5 h-3.5" />
                New Season Drop
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-serif tracking-tight leading-[1.08]">
                Wear the story <br />
                <span className="text-indigo-400">you write.</span>
              </h1>

              <p className="text-stone-300 text-sm sm:text-base max-w-md leading-relaxed">
                Premium streetwear built for comfort, cut for confidence. Explore tees, hoodies, sweatshirts, and more — designed for the way you actually move through your day.
              </p>

              {/* Action Buttons */}
              <div className="pt-1 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setPage('shop')}
                  className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-full transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2 text-sm uppercase tracking-wider hover:scale-105 active:scale-95"
                >
                  <span>Shop the collection</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('aboutStorySection');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-full transition-all border border-white/20 text-sm"
                >
                  Our story
                </button>
              </div>

            </div>

            {/* Right Hero Image */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div 
                className="relative w-full max-w-[320px] aspect-square rounded-3xl bg-stone-800/60 border border-white/10 p-6 flex flex-col items-center justify-center shadow-2xl backdrop-blur-sm group cursor-pointer overflow-hidden"
                onClick={() => setPage('clothes', 'tshirt', 'men')}
              >
                <div className="absolute top-3 right-3 bg-indigo-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow z-10">
                  Featured
                </div>
                
                <img 
                  src="/images/clothes/men/t-shirts/white.png" 
                  alt="Featured Streetwear Tee"
                  className="w-40 h-40 object-contain group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%232A3459"/%3E%3Ctext x="100" y="100" text-anchor="middle" dy=".3em" fill="white" font-size="16"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
                
                <div className="text-center mt-1 z-10">
                  <p className="font-bold text-sm text-white font-serif">Signature Boxy Tee</p>
                  <p className="text-[10px] text-indigo-400 font-bold">₱1,999 • Tap to view</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===== STAT STRIP ===== */}
      <section className="max-w-[1300px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-sm border border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 flex items-center justify-center text-xl">
              <i className="fas fa-users"></i>
            </div>
            <div>
              <p className="text-2xl font-black text-stone-900 dark:text-white">10,000+</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">Customers dressed since launch</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center text-xl">
              <i className="fas fa-layer-group"></i>
            </div>
            <div>
              <p className="text-2xl font-black text-stone-900 dark:text-white">5</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">Categories, one shared standard of quality</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center text-xl">
              <Star className="w-6 h-6 fill-emerald-500 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-black text-stone-900 dark:text-white">4.8/5</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">Average rating across every collection</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SHOP BY CATEGORY ===== */}
      <section className="max-w-[1300px] mx-auto px-4 sm:px-8">
        <div className="space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-stone-900 dark:text-white">
            Shop by category
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setGender(cat.defaultGender);
                  setPage(cat.id);
                }}
                className="group p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:shadow-lg transition-all duration-300 text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  {cat.icon}
                </div>
                <h3 className="font-bold text-sm text-stone-900 dark:text-white">{cat.title}</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{cat.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== OUR STORY / ABOUT SECTION ===== */}
      <section id="aboutStorySection" className="max-w-[1300px] mx-auto px-4 sm:px-8">
        <div className="rounded-3xl bg-stone-900 text-white p-8 sm:p-12 border border-stone-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            <div className="space-y-5">
              <span className="text-xs uppercase font-extrabold tracking-[0.25em] text-indigo-400">
                Our Story
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-serif leading-tight">
                Crafted with intention. <br />
                Worn without limits.
              </h2>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                C-HUB started in 2024 with a simple idea: everyday clothing should feel as good as it looks. 
                What began as a small run of T-shirts has grown into a full lineup of streetwear built on the same standard – 
                quality materials, honest pricing, and timeless design for every body.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-stone-800">
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
              <div className="p-5 rounded-2xl bg-stone-800/60 border border-stone-700 space-y-2">
                <Truck className="w-7 h-7 text-indigo-400" />
                <h4 className="font-bold text-sm">Nationwide Delivery</h4>
                <p className="text-xs text-stone-400">Free shipping on orders over ₱2,500</p>
              </div>
              <div className="p-5 rounded-2xl bg-stone-800/60 border border-stone-700 space-y-2">
                <ShieldCheck className="w-7 h-7 text-indigo-400" />
                <h4 className="font-bold text-sm">Secure Transactions</h4>
                <p className="text-xs text-stone-400">GCash, Maya, COD & Credit Cards</p>
              </div>
              <div className="p-5 rounded-2xl bg-stone-800/60 border border-stone-700 space-y-2">
                <RefreshCw className="w-7 h-7 text-indigo-400" />
                <h4 className="font-bold text-sm">30-Day Returns</h4>
                <p className="text-xs text-stone-400">Hassle-free size swaps & exchanges</p>
              </div>
              <div className="p-5 rounded-2xl bg-stone-800/60 border border-stone-700 space-y-2">
                <Headphones className="w-7 h-7 text-indigo-400" />
                <h4 className="font-bold text-sm">Dedicated Support</h4>
                <p className="text-xs text-stone-400">24/7 customer care team</p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};