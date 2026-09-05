import React from 'react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { PageType, GenderType } from '../types';
import { ArrowRight, Shirt, Footprints, Tag, Glasses, CheckCircle2, Search, ShoppingBag } from 'lucide-react';
import { ProductVisual } from './ProductVisual';

export const HomePage: React.FC = () => {
  const { setPage, setGender, splashShown, gender } = useStore();

  const categories: { id: PageType; title: string; desc: string; icon: React.ReactNode; bg: string; defaultGender: GenderType }[] = [
    { id: 'clothes', title: 'Clothes', desc: 'Tees, hoodies & sweatshirts', icon: <Shirt className="w-7 h-7" />, bg: 'bg-[#1a1716]', defaultGender: 'men' },
    { id: 'shoes', title: 'Footwear', desc: 'Everyday street footwear', icon: <Footprints className="w-7 h-7" />, bg: 'bg-[#27345b]', defaultGender: 'men' },
    { id: 'pants', title: 'Pants', desc: 'Denim, joggers & cargo', icon: <Tag className="w-7 h-7" />, bg: 'bg-[#3f3128]', defaultGender: 'men' },
    { id: 'underwear', title: 'Underwear', desc: 'Everyday comfort basics', icon: <Shirt className="w-7 h-7" />, bg: 'bg-[#432838]', defaultGender: 'men' },
    { id: 'accessories', title: 'Accessories', desc: 'Finish your silhouette', icon: <Glasses className="w-7 h-7" />, bg: 'bg-[#264441]', defaultGender: 'men' }
  ];

  // Mobile-only state: search for the middle home content.
  const [mobileSearch, setMobileSearch] = React.useState('');

  interface GenderTile {
    label: string;
    category: PageType;
    menSub: string;
    womenSub: string;
    boysSub: string;
    girlsSub: string;
    visSub: string;
    womenLabel: string;
    girlsLabel: string;
    boysLabel: string;
    colorName: string;
    bgColor: string;
  }

  // 12 mobile categories, mapped to the nearest existing subcategory per gender.
  // For Women/Girls, clothes labels adapt: Sweatshirts -> Top, Hoodie -> Dress.
  const genderTiles: GenderTile[] = [
    { label: 'T-Shirts', category: 'clothes', menSub: 'tshirt', womenSub: 'tshirt', boysSub: 'tshirt', girlsSub: 'tshirt', visSub: 'tshirt', womenLabel: 'T-Shirts', girlsLabel: 'T-Shirts', boysLabel: 'T-shirts', colorName: 'White', bgColor: '#F5F5F5' },
    { label: 'Sweatshirts', category: 'clothes', menSub: 'sweatshirt', womenSub: 'top', boysSub: 'polo', girlsSub: 'top', visSub: 'sweatshirt', womenLabel: 'Top', girlsLabel: 'Top', boysLabel: 'Polo', colorName: 'White', bgColor: '#F5F4EF' },
    { label: 'Hoodie', category: 'clothes', menSub: 'hoodie', womenSub: 'dress', boysSub: 'poloshirt', girlsSub: 'dress', visSub: 'hoodie', womenLabel: 'Dress', girlsLabel: 'Dress', boysLabel: 'Polo-shirt', colorName: 'Beige', bgColor: '#CEB699' },
    { label: 'Pants', category: 'pants', menSub: 'jeans', womenSub: 'jeans', boysSub: 'jeans', girlsSub: 'jeans', visSub: 'jeans', womenLabel: 'Pants', girlsLabel: 'Pants', boysLabel: 'Pants', colorName: 'Light Stone', bgColor: '#D9D9D9' },
    { label: 'Jeans', category: 'pants', menSub: 'jeans', womenSub: 'jeans', boysSub: 'jeans', girlsSub: 'jeans', visSub: 'jeans', womenLabel: 'Jeans', girlsLabel: 'Jeans', boysLabel: 'Jeans', colorName: 'Light Stone', bgColor: '#D9D9D9' },
    { label: 'Slacks', category: 'pants', menSub: 'jeans', womenSub: 'jeans', boysSub: 'jeans', girlsSub: 'jeans', visSub: 'jeans', womenLabel: 'Slacks', girlsLabel: 'Slacks', boysLabel: 'Slacks', colorName: 'Light Stone', bgColor: '#D9D9D9' },
    { label: 'Footwear', category: 'shoes', menSub: 'sneakers', womenSub: 'sneakers', boysSub: 'sneakers', girlsSub: 'sneakers', visSub: 'sneakers', womenLabel: 'Footwear', girlsLabel: 'Footwear', boysLabel: 'Footwear', colorName: 'Chalk White', bgColor: '#F5F5F5' },
    { label: 'Black Footwear', category: 'shoes', menSub: 'sneakers', womenSub: 'sneakers', boysSub: 'sneakers', girlsSub: 'sneakers', visSub: 'sneakers', womenLabel: 'Black Footwear', girlsLabel: 'Black Footwear', boysLabel: 'Black Footwear', colorName: 'Stealth Charcoal', bgColor: '#4A4A4A' },
    { label: 'Boots', category: 'shoes', menSub: 'boots', womenSub: 'sandals', boysSub: 'boots', girlsSub: 'boots', visSub: 'boots', womenLabel: 'Boots', girlsLabel: 'Boots', boysLabel: 'Boots', colorName: 'Desert Tan', bgColor: '#CEB699' },
    { label: 'Accessories', category: 'accessories', menSub: 'bags', womenSub: 'bags', boysSub: 'bags', girlsSub: 'bags', visSub: 'bags', womenLabel: 'Accessories', girlsLabel: 'Accessories', boysLabel: 'Accessories', colorName: 'Stone', bgColor: '#F5F5F5' },
    { label: 'Bags', category: 'accessories', menSub: 'bags', womenSub: 'bags', boysSub: 'bags', girlsSub: 'bags', visSub: 'bags', womenLabel: 'Bags', girlsLabel: 'Bags', boysLabel: 'Bags', colorName: 'Stone', bgColor: '#F5F5F5' },
    { label: 'Caps', category: 'accessories', menSub: 'hats', womenSub: 'hats', boysSub: 'hats', girlsSub: 'hats', visSub: 'hats', womenLabel: 'Caps', girlsLabel: 'Caps', boysLabel: 'Caps', colorName: 'White', bgColor: '#F5F5F5' }
  ];

  const tileSubForGender = (t: GenderTile): string =>
    gender === 'men' ? t.menSub
      : gender === 'women' ? t.womenSub
      : gender === 'boys' ? t.boysSub
      : t.girlsSub;

  const tileLabelFor = (t: GenderTile): string =>
    gender === 'women' ? t.womenLabel
      : gender === 'girls' ? t.girlsLabel
      : gender === 'boys' ? t.boysLabel
      : t.label;

  const openCategoryTile = (t: GenderTile) => {
    setPage(t.category, tileSubForGender(t), gender);
  };

  // For Women/Girls, order the three clothes tiles as Top -> Dress -> T-Shirt.
  // For Boys, order them as Polo -> Polo-shirt -> T-shirts.
  const clothesOrder =
    gender === 'women' || gender === 'girls' || gender === 'boys'
      ? [1, 2, 0, 3, 4, 5, 6, 7, 8, 9, 10, 11]
      : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  const orderedGenderTiles = clothesOrder.map((i) => genderTiles[i]);

  const filteredGenderTiles = orderedGenderTiles.filter((t) =>
    t.label.toLowerCase().includes(mobileSearch.toLowerCase())
  );

  interface GenderProduct {
    id: string;
    name: string;
    color: string;
    category: PageType;
    sub: string;
    colorName: string;
    bgColor: string;
    price: number;
    original: number;
    image?: string;
  }

  // Curated per-gender representative mix, reusing existing C-HUB product data.
  const genderProducts: Record<GenderType, GenderProduct[]> = {
    men: [
      { id: 'm-tshirt', name: 'Premium T-Shirt', color: 'White', category: 'clothes', sub: 'tshirt', colorName: 'White', bgColor: '#F5F5F5', price: 1999, original: 2999, image: '/images/clothes/men/t-shirts/white.png' },
      { id: 'm-hoodie', name: 'Cozy Hoodie', color: 'Beige', category: 'clothes', sub: 'hoodie', colorName: 'Beige', bgColor: '#CEB699', price: 2499, original: 3499, image: '/images/clothes/men/hoodie/beige.png' },
      { id: 'm-sweat', name: 'Classic Sweatshirt', color: 'White', category: 'clothes', sub: 'sweatshirt', colorName: 'White', bgColor: '#F5F4EF', price: 2199, original: 3199, image: '/images/clothes/men/sweatshirts/white1.png' },
      { id: 'm-jeans', name: 'Classic Denim Jeans', color: 'Light Stone', category: 'pants', sub: 'jeans', colorName: 'Light Stone', bgColor: '#D9D9D9', price: 1799, original: 2499, image: '/images/pants/men/pants/pants5.png' },
      { id: 'm-sneak', name: 'Urban Sneakers', color: 'Chalk White', category: 'shoes', sub: 'sneakers', colorName: 'Chalk White', bgColor: '#F5F5F5', price: 2499, original: 3499 },
      { id: 'm-bag', name: 'Everyday Crossbody Bag', color: 'Stone', category: 'accessories', sub: 'bags', colorName: 'Stone', bgColor: '#F5F5F5', price: 1499, original: 2199 },
      { id: 'm-tshirt2', name: 'Premium T-Shirt', color: 'Black', category: 'clothes', sub: 'tshirt', colorName: 'Black', bgColor: '#4A4A4A', price: 1999, original: 2999, image: '/images/clothes/men/t-shirts/black.png' },
      { id: 'm-hoodie2', name: 'Cozy Hoodie', color: 'Sage', category: 'clothes', sub: 'hoodie', colorName: 'Sage', bgColor: '#648C7A', price: 2499, original: 3499, image: '/images/clothes/men/hoodie/sage.png' },
      { id: 'm-jeans2', name: 'Classic Denim Jeans', color: 'Washed Blue', category: 'pants', sub: 'jeans', colorName: 'Washed Blue', bgColor: '#8FA8C8', price: 1799, original: 2499, image: '/images/pants/men/pants/pants3.png' }
    ],
    women: [
      { id: 'w-top', name: 'Peplum Top', color: 'Cream', category: 'clothes', sub: 'top', colorName: 'Cream', bgColor: '#F3F0EA', price: 1799, original: 2799, image: '/images/clothes/women/top/top1.png' },
      { id: 'w-dress', name: 'Summer Halter Dress', color: 'Polka White', category: 'clothes', sub: 'dress', colorName: 'Polka White', bgColor: '#F4F2EE', price: 2999, original: 3999, image: '/images/clothes/women/dress/dress1.png' },
      { id: 'w-tshirt', name: 'Premium T-Shirt', color: 'White', category: 'clothes', sub: 'tshirt', colorName: 'White', bgColor: '#F5F5F5', price: 1599, original: 2599, image: '/images/clothes/men/t-shirts/white.png' },
      { id: 'w-jeans', name: 'Women Denim', color: 'Light Stone', category: 'pants', sub: 'jeans', colorName: 'Light Stone', bgColor: '#D9D9D9', price: 1799, original: 2499 },
      { id: 'w-sneak', name: 'Women Runner', color: 'Pure White', category: 'shoes', sub: 'sneakers', colorName: 'Pure White', bgColor: '#F5F5F5', price: 2499, original: 3499 },
      { id: 'w-bag', name: 'Women Tote & Crossbody', color: 'Stone', category: 'accessories', sub: 'bags', colorName: 'Stone', bgColor: '#F5F5F5', price: 1499, original: 2199 },
      { id: 'w-top2', name: 'Ruffle Camisole Top', color: 'Blush', category: 'clothes', sub: 'top', colorName: 'Blush', bgColor: '#F0D9D9', price: 1499, original: 2499 },
      { id: 'w-jacket', name: 'Oversized Denim Jacket', color: 'Faded', category: 'clothes', sub: 'top', colorName: 'Faded', bgColor: '#9FB2CE', price: 2399, original: 3299 },
      { id: 'w-dress2', name: 'Satin Slip Dress', color: 'Champagne', category: 'clothes', sub: 'dress', colorName: 'Champagne', bgColor: '#E8D9C0', price: 2999, original: 4199 }
    ],
    boys: [
      { id: 'b-polo', name: 'Boys Polo', color: 'Crisp White', category: 'clothes', sub: 'polo', colorName: 'White', bgColor: '#F5F5F5', price: 1299, original: 1999, image: '/images/clothes/boys/poloshirt/bpoloshirt1.png' },
      { id: 'b-poloshirt', name: 'Boys Polo Shirt', color: 'White', category: 'clothes', sub: 'poloshirt', colorName: 'White', bgColor: '#F0F0F0', price: 1499, original: 2299, image: '/images/clothes/boys/poloshirt/bpoloshirt1.png' },
      { id: 'b-tshirt', name: 'Premium T-Shirt', color: 'White', category: 'clothes', sub: 'tshirt', colorName: 'White', bgColor: '#F5F5F5', price: 999, original: 1599, image: '/images/clothes/men/t-shirts/white.png' },
      { id: 'b-jeans', name: 'Boys Classic Denim', color: 'Light Gray', category: 'pants', sub: 'jeans', colorName: 'Light Gray', bgColor: '#D9D9D9', price: 1499, original: 2099, image: '/images/pants/boys/pants/bpants1.png' },
      { id: 'b-sneak', name: 'Boys Kick', color: 'White', category: 'shoes', sub: 'sneakers', colorName: 'White', bgColor: '#F5F5F5', price: 1999, original: 2999 },
      { id: 'b-bag', name: 'Boys Daypack', color: 'White', category: 'accessories', sub: 'bags', colorName: 'White', bgColor: '#F5F5F5', price: 1299, original: 1899 },
      { id: 'b-tshirt2', name: 'Premium T-Shirt', color: 'Black', category: 'clothes', sub: 'tshirt', colorName: 'Black', bgColor: '#4A4A4A', price: 999, original: 1599, image: '/images/clothes/men/t-shirts/black.png' },
      { id: 'b-hoodie', name: 'Boys Zip Hoodie', color: 'Navy', category: 'clothes', sub: 'poloshirt', colorName: 'Navy', bgColor: '#2A3A5A', price: 1799, original: 2599 },
      { id: 'b-jeans2', name: 'Boys Classic Denim', color: 'Indigo', category: 'pants', sub: 'jeans', colorName: 'Indigo', bgColor: '#5A78A8', price: 1499, original: 2099, image: '/images/pants/boys/pants/bpants5.png' }
    ],
    girls: [
      { id: 'g-top', name: 'Peplum Top', color: 'Cream', category: 'clothes', sub: 'top', colorName: 'Cream', bgColor: '#F3F0EA', price: 1699, original: 2699, image: '/images/clothes/women/top/top1.png' },
      { id: 'g-dress', name: 'Summer Halter Dress', color: 'Polka White', category: 'clothes', sub: 'dress', colorName: 'Polka White', bgColor: '#F4F2EE', price: 2899, original: 3899, image: '/images/clothes/girls/dress/gdress1.png' },
      { id: 'g-tshirt', name: 'Premium T-Shirt', color: 'White', category: 'clothes', sub: 'tshirt', colorName: 'White', bgColor: '#F5F5F5', price: 1499, original: 2499, image: '/images/clothes/men/t-shirts/white.png' },
      { id: 'g-jeans', name: 'Girls Soft Denim', color: 'Mist', category: 'pants', sub: 'jeans', colorName: 'Mist', bgColor: '#D9D9D9', price: 1499, original: 2099 },
      { id: 'g-sneak', name: 'Girls Spark Sneaker', color: 'Cloud White', category: 'shoes', sub: 'sneakers', colorName: 'Cloud White', bgColor: '#F5F5F5', price: 1999, original: 2999 },
      { id: 'g-bag', name: 'Girls Mini Pack', color: 'White', category: 'accessories', sub: 'bags', colorName: 'White', bgColor: '#F5F5F5', price: 1299, original: 1899 },
      { id: 'g-top2', name: 'Ruffle Camisole Top', color: 'Blush', category: 'clothes', sub: 'top', colorName: 'Blush', bgColor: '#F0D9D9', price: 1399, original: 2299 },
      { id: 'g-dress2', name: 'Tulle Party Dress', color: 'Lavender', category: 'clothes', sub: 'dress', colorName: 'Lavender', bgColor: '#D8D0F0', price: 2799, original: 3899 },
      { id: 'g-redress', name: 'Gingham Swing Dress', color: 'Rose', category: 'clothes', sub: 'dress', colorName: 'Rose', bgColor: '#E8B8B8', price: 2299, original: 3299 }
    ]
  };

  const activeGenderProducts = genderProducts[gender].filter((p) =>
    `${p.name} ${p.color}`.toLowerCase().includes(mobileSearch.toLowerCase())
  );

  const openProduct = (p: GenderProduct) => {
    setPage(p.category, p.sub, gender);
  };

  // Real PNG paths for category tiles that have actual product images, per gender.
  // Tiles not listed here (Shoes, Boots, Accessories, etc.) fall back to ProductVisual SVG.
  const tileImageFor = (label: string, g: GenderType): string | null => {
    const map: Record<string, Record<GenderType, string | null>> = {
      'T-Shirts': { men: '/images/clothes/men/t-shirts/white.png', women: '/images/clothes/men/t-shirts/white.png', boys: '/images/clothes/men/t-shirts/white.png', girls: '/images/clothes/men/t-shirts/white.png' },
      Sweatshirts: { men: '/images/clothes/men/sweatshirts/white1.png', women: '/images/clothes/women/top/top1.png', boys: null, girls: '/images/clothes/women/top/top1.png' },
      Hoodie: { men: '/images/clothes/men/hoodie/beige.png', women: '/images/clothes/women/dress/dress1.png', boys: null, girls: '/images/clothes/women/dress/dress1.png' },
      Pants: { men: '/images/pants/men/pants/pants3.png', women: null, boys: '/images/pants/boys/pants/bpants1.png', girls: null },
      Jeans: { men: null, women: null, boys: '/images/pants/boys/pants/bpants5.png', girls: null },
      Slacks: { men: null, women: null, boys: '/images/pants/boys/pants/bpants1.png', girls: null }
    };
    return (map[label] && map[label][g]) || null;
  };

  const genderOptions: GenderType[] = ['men', 'women', 'boys', 'girls'];

  // Renders the real product image when available; falls back to ProductVisual SVG
  // only if the image actually fails to load.
  const TileVisual: React.FC<{ t: GenderTile; imgSrc: string | null; label: string }> = ({ t, imgSrc, label }) => {
    const [failed, setFailed] = React.useState(false);
    if (!imgSrc || failed) {
      return (
        <ProductVisual
          category={t.category}
          subCategory={tileSubForGender(t)}
          colorName={t.colorName}
          bgColor={t.bgColor}
          name={label}
          className="w-[60%] h-[60%] object-contain"
        />
      );
    }
    return (
      <img
        src={imgSrc}
        alt={label}
        className="w-[60%] h-[60%] object-contain"
        onError={() => setFailed(true)}
      />
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{
        opacity: splashShown ? 1 : 0,
        y: splashShown ? 0 : -50
      }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className="w-full space-y-12 sm:space-y-16 py-4 sm:py-6"
    >
      {/* WALA NA YUNG HEADER DITO. Nasa App.tsx na siya! */}

      {/* ============================================================
          MOBILE HOME (md:hidden) — middle content only.
          Order: Search bar -> Hero -> Categories -> Popular Products.
          ============================================================ */}
      <div className="md:hidden w-full px-4 space-y-8 pb-4">

        {/* Mobile Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={mobileSearch}
            onChange={(e) => setMobileSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-5 pr-11 py-3 rounded-full bg-white border border-indigo-200 text-sm text-stone-900 placeholder-stone-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 pointer-events-none" />
        </div>

        {/* Mobile Hero */}
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 text-white p-7">
          <div className="relative z-10 space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[10px] font-black uppercase tracking-widest border border-white/20">
              New Season • 2026
            </span>
            <h1 className="text-4xl font-black font-serif tracking-tight leading-[1.05] text-white">
              Wear the <span className="italic">story</span> you write.
            </h1>
            <p className="text-white/80 text-[13px] leading-relaxed font-medium">
              Premium streetwear cut for confidence — heavyweight cotton, honest pricing, everyday comfort.
            </p>
            <button
              onClick={() => setPage('shop')}
              className="inline-flex items-center gap-2 mt-1 px-6 py-3 bg-white text-indigo-700 font-bold rounded-full text-sm shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>SHOP</span>
            </button>
          </div>
        </section>

        {/* Mobile Categories — 4 columns × 3 rows, with gender filter */}
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Curated Lineup</span>
              <h2 className="text-xl font-black font-serif text-stone-900 mt-0.5">Categories</h2>
            </div>
            <button
              onClick={() => setPage('shop')}
              className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 flex items-center gap-1 cursor-pointer"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Gender filter for categories */}
          <div className="grid grid-cols-4 gap-1 rounded-full bg-stone-100 p-1">
            {genderOptions.map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`py-2 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
                  gender === g
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-stone-600'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {filteredGenderTiles.length > 0 ? (
            <div className="space-y-2 sm:space-y-2.5">
              {[0, 6].map((start) => (
                <div key={start} className="overflow-x-auto no-scrollbar -mx-4 px-4">
                  <div className="w-[150%] shrink-0 grid grid-cols-6 gap-2 sm:gap-2.5">
                    {filteredGenderTiles.slice(start, start + 6).map((t) => {
                      const imgSrc = tileImageFor(t.label, gender);
                      const label = tileLabelFor(t);
                      return (
                        <button
                          key={t.label}
                          onClick={() => openCategoryTile(t)}
                          className="flex flex-col items-center gap-1.5 text-center cursor-pointer"
                        >
                          <div className="relative w-full aspect-square rounded-2xl bg-white border border-stone-200/70 shadow-sm overflow-hidden flex items-center justify-center">
                            <TileVisual t={t} imgSrc={imgSrc} label={label} />
                          </div>
                          <span className="text-[11px] font-semibold text-stone-800 leading-tight">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-500 py-6 text-center">No categories found for "{mobileSearch}".</p>
          )}
        </section>

        {/* Mobile Popular Products — follows selected gender */}
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                {gender.charAt(0).toUpperCase() + gender.slice(1)} Picks
              </span>
              <h2 className="text-xl font-black font-serif text-stone-900 mt-0.5">Popular Products</h2>
            </div>
            <button
              onClick={() => setPage('shop')}
              className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 flex items-center gap-1 cursor-pointer"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeGenderProducts.length > 0 ? (
            <div className="grid grid-cols-3 gap-2.5">
              {activeGenderProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => openProduct(p)}
                  className="text-left rounded-2xl bg-white border border-stone-200/80 shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="relative aspect-square flex items-center justify-center p-2 bg-white">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-[85%] h-[85%] object-contain group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <ProductVisual
                        category={p.category}
                        subCategory={p.sub}
                        colorName={p.colorName}
                        bgColor={p.bgColor}
                        name={p.name}
                        className="w-[85%] h-[85%] object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <div className="p-2.5 space-y-0.5">
                    <p className="text-[13px] font-bold text-stone-900 leading-tight line-clamp-1">{p.name}</p>
                    <p className="text-[11px] text-stone-400">{p.color}</p>
                    <div className="flex items-baseline gap-1.5 pt-0.5">
                      <span className="text-sm font-black text-stone-900">₱{p.price.toLocaleString()}</span>
                      <span className="text-[10px] text-stone-400 line-through">₱{p.original.toLocaleString()}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-500 py-6 text-center">No products found for "{mobileSearch}".</p>
          )}
        </section>
      </div>

      {/* ============================================================
          DESKTOP HOME (hidden md:block) — unchanged approved design.
          ============================================================ */}
      <div className="hidden md:block w-full space-y-12 sm:space-y-16">

      {/* ===== HERO SECTION ===== */}
      <section className="max-w-[99%] mx-auto px-4 sm:px-8">
        <div className="relative rounded-[2.5rem] text-stone-900 overflow-hidden p-8 sm:p-12 lg:p-16 ">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Eyebrow / Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-100/80 text-indigo-700 text-[11px] font-black uppercase tracking-wider border border-indigo-200">
                <span>New Season Drop • 2026 Collection</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-serif tracking-tight leading-[1.08] text-stone-900">
                Wear the <br />
                <span className="text-indigo-600 italic">story</span> <br />
                you write.
              </h1>

              <p className="text-stone-600 text-sm sm:text-base max-w-md leading-relaxed font-medium">
                Premium streetwear crafted with heavyweight organic cotton, cut for confidence, and designed for how you actually move through your day.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <button
                  onClick={() => setPage('shop')}
                  className="px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full transition-all flex items-center gap-2 text-sm shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>Shop Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('aboutStorySection');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3.5 text-stone-800 hover:text-indigo-600 font-bold rounded-full transition-all bg-white hover:bg-stone-50 border border-stone-300 text-sm shadow-sm cursor-pointer"
                >
                  Our Philosophy
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-5 text-xs text-stone-500 font-semibold">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>100% Cotton & Preshrunk</span>
                </div>
              </div>

            </div>

            {/* Right Hero - Hang Tags & Featured Piece */}
            <div className="lg:col-span-5 flex items-center justify-center relative h-90 lg:-left-20">
              
              {/* Hang Tag 1 - Navy */}
              <motion.div 
                animate={{ rotate: [6, 8, 6], y: [0, -4, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-10 -right-10 w-52 bg-[#27345b] text-white shadow-2xl border border-white/10 rounded-2xl p-4 z-10"
              >
                <div className="w-4 h-4 rounded-full bg-white/20 mb-5" />
                <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-200">Material Standard</p>
                <p className="font-serif font-bold text-lg text-white">240 GSM Heavyweight</p>
              </motion.div>

              {/* Hang Tag 2 - Obsidian */}
              <motion.div 
                animate={{ rotate: [-6, -4, -6], y: [0, 4, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-6 -left-10 w-52 bg-[#1a1716] text-white shadow-2xl border border-white/10 rounded-2xl p-4 z-20"
              >
                <div className="w-4 h-4 rounded-full bg-white/20 mb-4" />
                <p className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Authentic Drop</p>
                <p className="font-serif font-bold text-lg text-white">C-HUB Studio 2026</p>
              </motion.div>

              {/* Center Interactive Showcase Trigger */}
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 2 }}
                onClick={() => setPage('clothes', 'tshirt', 'men')}
                className="relative w-56 h-56 rounded-3xl bg-white-50/50 flex flex-col items-center justify-center shadow-2xl group cursor-pointer overflow-hidden p-3"
              >
                <div className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  Featured
                </div>
                <img 
                  src="/images/clothes/men/t-shirts/white.png" 
                  alt="Featured Streetwear Tee"
                  className="w-44 h-44 object-contain group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%234f46e5"/%3E%3Ctext x="100" y="100" text-anchor="middle" dy=".3em" fill="white" font-size="16"%3EC-HUB TEE%3C/text%3E%3C/svg%3E';
                  }}
                />
                <p className="text-[11px] font-bold text-stone-800 uppercase tracking-wider mt-1 group-hover:text-indigo-600 transition-colors">
                  Explore T-Shirts →
                </p>
              </motion.div>

            </div>

          </div>
        </div>
      </section>

      {/* ===== STAT STRIP ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-3xl bg-white border border-stone-200/80 shadow-sm">
          <div className="p-4">
            <p className="text-3xl font-black text-stone-900 font-serif">15,000+</p>
            <p className="text-xs text-stone-500 font-medium mt-1">Wardrobes upgraded across the country</p>
          </div>

          <div className="p-4 border-y md:border-y-0 md:border-x border-stone-200">
            <p className="text-3xl font-black text-indigo-600 font-serif">5 Curated</p>
            <p className="text-xs text-stone-500 font-medium mt-1">Core categories, one uncompromising standard</p>
          </div>

          <div className="p-4">
            <p className="text-3xl font-black text-stone-900 font-serif">4.9 / 5.0</p>
            <p className="text-xs text-stone-500 font-medium mt-1">Verified buyer satisfaction rating</p>
          </div>
        </div>
      </section>

      {/* ===== SHOP BY CATEGORY ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600">Curated Lineup</span>
            <h2 className="text-3xl sm:text-4xl font-black font-serif text-stone-900 mt-1">
              Shop by Category
            </h2>
          </div>
          <button
            onClick={() => setPage('shop')}
            className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setGender(cat.defaultGender);
                setPage(cat.id);
              }}
              className={`${cat.bg} text-white rounded-3xl p-5 hover:scale-[1.03] hover:shadow-2xl transition-all duration-300 text-left group min-h-[10.6rem] flex flex-col justify-between cursor-pointer border border-white/10 relative overflow-hidden`}
            >
              <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-white/80 group-hover:text-white group-hover:bg-indigo-600 transition-all">
                {cat.icon}
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg font-serif">{cat.title}</h3>
                <p className="text-xs text-white/70 mt-0.5 line-clamp-1">{cat.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ===== OUR STORY SECTION ===== */}
      <section id="aboutStorySection" className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-stone-700 text-white space-y-4">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Our Heritage</span>
          <h2 className="text-3xl sm:text-4xl font-black font-serif text-white max-w-xl">
            Designed for durability, styled for individuality.
          </h2>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
            C-HUB was founded in 2024 with a clear mandate: clothing should feel effortless, fit impeccably, and hold its shape wash after wash. From our signature peplum tops and tailored cargo pants to cloud-soft fleece hoodies, every stitch represents our dedication to modern urban lifestyle.
          </p>
        </div>
      </section>

      </div>

    </motion.div>
  );
};