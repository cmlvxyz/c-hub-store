import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { PageType, GenderType } from '../types';
import { PRODUCTS_CONFIG, CategoryData } from '../data/products';
import { ProductVisual } from './ProductVisual';
import { Search, Menu, X, ChevronLeft, ChevronRight, ShoppingBag, ShoppingCart } from 'lucide-react';

/* --- Hex color helpers: kukulayan ng background ayon sa damit pala --- */
const hexToRgb = (hex: string) => {
  let m = hex.replace('#', '');
  if (m.length === 3) m = m.split('').map(c => c + c).join('');
  const num = parseInt(m, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
};

// Luminance: kung light ang background, dark na text ang gagamitin (at vice versa).
const LUM = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};
const isLightBg = (hex: string) => LUM(hex) > 0.62;

// Label para sa bawat sub-category (type ng damit).
const SUB_LABELS: Record<string, string> = {
  tshirt: 'T-Shirt',
  hoodie: 'Hoodie',
  sweatshirt: 'Sweatshirt',
  top: 'Top',
  dress: 'Dress',
  polo: 'Polo',
  poloshirt: 'Polo Shirt',
  jeans: 'Jeans',
  sneakers: 'Sneakers',
  boots: 'Boots',
  sandals: 'Sandals',
  bags: 'Bag',
  hats: 'Hat',
  socks: 'Socks',
};
const subLabelOf = (sub: string) => SUB_LABELS[sub] || sub;

interface CategoryItem {
  id: PageType;
  title: string;
  desc: string;
  bgColor: string;
  icon: React.ReactNode;
}

/* ============================================================
   MOBILE SHOP HELPERS
   ============================================================ */

// Same 12 category tiles used by the (completed) Home page.
// Reused here ONLY to drive the mobile Shop hamburger menu —
// Home itself is not modified.
interface ShopTile {
  label: string;
  category: PageType;
  menSub: string;
  womenSub: string;
  boysSub: string;
  girlsSub: string;
}

const shopTiles: ShopTile[] = [
  { label: 'T-Shirts', category: 'clothes', menSub: 'tshirt', womenSub: 'tshirt', boysSub: 'tshirt', girlsSub: 'tshirt' },
  { label: 'Sweatshirts', category: 'clothes', menSub: 'sweatshirt', womenSub: 'top', boysSub: 'polo', girlsSub: 'top' },
  { label: 'Hoodie', category: 'clothes', menSub: 'hoodie', womenSub: 'dress', boysSub: 'poloshirt', girlsSub: 'dress' },
  { label: 'Pants', category: 'pants', menSub: 'jeans', womenSub: 'jeans', boysSub: 'jeans', girlsSub: 'jeans' },
  { label: 'Jeans', category: 'pants', menSub: 'jeans', womenSub: 'jeans', boysSub: 'jeans', girlsSub: 'jeans' },
  { label: 'Slacks', category: 'pants', menSub: 'jeans', womenSub: 'jeans', boysSub: 'jeans', girlsSub: 'jeans' },
  { label: 'Shoes', category: 'shoes', menSub: 'sneakers', womenSub: 'sneakers', boysSub: 'sneakers', girlsSub: 'sneakers' },
  { label: 'Black Shoes', category: 'shoes', menSub: 'sneakers', womenSub: 'sneakers', boysSub: 'sneakers', girlsSub: 'sneakers' },
  { label: 'Boots', category: 'shoes', menSub: 'boots', womenSub: 'sandals', boysSub: 'boots', girlsSub: 'boots' },
  { label: 'Accessories', category: 'accessories', menSub: 'bags', womenSub: 'bags', boysSub: 'bags', girlsSub: 'bags' },
  { label: 'Bags', category: 'accessories', menSub: 'bags', womenSub: 'bags', boysSub: 'bags', girlsSub: 'bags' },
  { label: 'Caps', category: 'accessories', menSub: 'hats', womenSub: 'hats', boysSub: 'hats', girlsSub: 'hats' },
];

const tileSubFor = (t: ShopTile, g: GenderType): string =>
  g === 'men' ? t.menSub
    : g === 'women' ? t.womenSub
    : g === 'boys' ? t.boysSub
    : t.girlsSub;

const CATEGORY_PAGES: PageType[] = ['clothes', 'shoes', 'pants', 'underwear', 'accessories'];

interface FlatProduct {
  key: string;
  name: string;
  colorName: string;
  image: string;
  bgColor: string;
  textColor: string;
  category: PageType;
  sub: string;
  price: number;
  original: number;
}

const buildList = (sel: ShopTile | 'all', g: GenderType): FlatProduct[] => {
  const out: FlatProduct[] = [];
  const pushCategory = (cat: PageType, subs: string[]) => {
    const cfg = PRODUCTS_CONFIG[cat]?.[g] as CategoryData | undefined;
    if (!cfg) return;
    subs.forEach((sub) => {
      const arr = cfg.products?.[sub] || [];
      arr.forEach((p, i) => {
        const bp = cfg.basePrices?.[sub] || { price: 0, original: 0 };
        out.push({
          key: `${cat}-${g}-${sub}-${i}`,
          name: p.name,
          colorName: p.colorName,
          image: p.image,
          bgColor: p.bgColor,
          textColor: p.textColor,
          category: cat,
          sub,
          price: bp.price,
          original: bp.original,
        });
      });
    });
  };

  if (sel === 'all') {
    CATEGORY_PAGES.forEach((cat) => {
      const cfg = PRODUCTS_CONFIG[cat]?.[g] as CategoryData | undefined;
      pushCategory(cat, cfg ? Object.keys(cfg.products || {}) : []);
    });
  } else {
    pushCategory(sel.category, [tileSubFor(sel, g)]);
  }
  return out;
};

/* ============================================================
   MOBILE SHOP COMPONENT (mobile only, md:hidden)
   ============================================================ */
const MobileShop: React.FC = () => {
  const { gender, setGender, setPage, addToCart, user, showToast, searchQuery, setShopBgColor } = useStore();
  const genderOptions: GenderType[] = ['men', 'women', 'boys', 'girls'];

  const [mobileGender, setMobileGender] = useState<GenderType>(gender || 'men');
  const [sel, setSel] = useState<ShopTile | 'all'>('all');
  const [list, setList] = useState<FlatProduct[]>([]);
  const [idx, setIdx] = useState(0);
  const [size, setSize] = useState('S');
  const [menuOpen, setMenuOpen] = useState(false);
  const listRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    setList(buildList(sel, mobileGender));
    setIdx(0);
    setSize('S');
  }, [sel, mobileGender]);

  const active = list[idx] || list[0];

  const categoryConfig = active ? (PRODUCTS_CONFIG[active.category]?.[mobileGender] as CategoryData | undefined) : undefined;
  const sizes = (active && categoryConfig?.sizes?.[active.sub]) || ['S', 'M', 'L', 'XL'];
  const desc = (active && categoryConfig?.headlines?.[active.sub]?.desc) || active?.name || '';

  useEffect(() => {
    if (sizes.length && !sizes.includes(size)) setSize(sizes[0]);
  }, [active?.sub, sizes]);

  useEffect(() => {
    const el = listRefs.current[idx];
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [idx]);

  useEffect(() => { setIdx(0); }, [searchQuery]);

  const filteredList = useMemo(() => {
    const base = searchQuery.trim()
      ? list.filter((p) => `${p.name} ${p.colorName}`.toLowerCase().includes(searchQuery.toLowerCase()))
      : list;
    // Darkest product muna sa sidebar para visible vs light shop background.
    return [...base].sort((a, b) => LUM(a.bgColor) - LUM(b.bgColor));
  }, [list, searchQuery]);

  const shownActive = filteredList[idx] || filteredList[0] || active;

  // Buong shop: kulay ng napiling (main) product.
  const shopBg = shownActive?.bgColor || '#ffffff';
  const bgIsLight = isLightBg(shopBg);
  const textMain = bgIsLight ? 'text-stone-900' : 'text-white';
  const textSub = bgIsLight ? 'text-stone-600' : 'text-white/75';

  // Ibahagi ang kulay sa header (mobile pill) para kumulay rin ito.
  useEffect(() => { setShopBgColor(shopBg); }, [shopBg, setShopBgColor]);

  const switchGender = (g: GenderType) => {
    setMobileGender(g);
    setGender(g);
  };

  const pickTile = (t: ShopTile | 'all') => {
    setSel(t);
    setMenuOpen(false);
  };

  const next = () => { if (filteredList.length > 1) setIdx((idx + 1) % filteredList.length); };
  const prev = () => { if (filteredList.length > 1) setIdx((idx - 1 + filteredList.length) % filteredList.length); };

  const cartPayload = (p: FlatProduct) => ({
    id: `${p.category}-${mobileGender}-${p.sub}-${p.colorName}-${size}`,
    name: p.name,
    price: p.price,
    image: p.image,
    size,
    color: p.colorName,
    subCategory: p.sub,
    gender: mobileGender,
  });

  const handleAdd = (p: FlatProduct) => {
    addToCart(cartPayload(p), 1);
  };

  const handleBuy = (p: FlatProduct) => {
    if (!user.isLoggedIn) {
      showToast('Please login first to purchase.', 'warning');
      setPage('login');
      return;
    }
    addToCart(cartPayload(p), 1);
    setPage('checkout');
  };

  const currentLabel = sel === 'all' ? 'All Products' : sel.label;

  return (
    <div className="w-full transition-colors duration-500" style={{ backgroundColor: shopBg, minHeight: 'calc(100vh - 8rem)' }}>
      {/* Category tabs */}
      <div className={`flex items-center gap-1.5 px-4 pt-4 pb-2 overflow-x-auto no-scrollbar ${textMain}`}>
        <button
          onClick={() => setMenuOpen(true)}
          className={`shrink-0 w-9 h-9 rounded-full ${bgIsLight ? 'bg-white text-stone-700' : 'bg-white/15 text-white'} flex items-center justify-center cursor-pointer`}
          aria-label="Menu"
        >
          <Menu className="w-4 h-4" />
        </button>
        {genderOptions.map((g) => (
          <button
            key={g}
            onClick={() => switchGender(g)}
            className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
              mobileGender === g
                ? 'bg-indigo-600 text-white shadow'
                : bgIsLight
                ? 'bg-white/70 text-stone-700 border border-stone-200'
                : 'bg-white/15 text-white border border-white/20'
            }`}
          >
            {g}
          </button>
        ))}
        <span className={`ml-auto shrink-0 text-[11px] font-bold ${textSub}`}>{currentLabel}</span>
      </div>

      {/* Two-pane content */}
      {filteredList.length > 0 ? (
        <div className="grid grid-cols-[38%_62%] gap-3 px-4 pt-1 pb-4">
          {/* LEFT: product list (stretch sa screen, 4 visible na may gap, scroll ang 5+) */}
          <div
            className="no-scrollbar flex flex-col justify-between overflow-y-auto pr-1"
            style={{ scrollbarWidth: 'none', height: 'calc(100vh - 9rem)', maxHeight: 'calc(100vh - 9rem)' }}
          >
            {filteredList.map((p, i) => {
              const isActive = shownActive && p.key === shownActive.key;
              return (
                <button
                  key={p.key}
                  ref={(el) => { listRefs.current[i] = el; }}
                  onClick={() => setIdx(i)}
                  className={`w-full shrink-0 text-center cursor-pointer transition-transform active:scale-95 ${
                    isActive ? 'text-indigo-600' : textMain
                  }`}
                >
                  <div className="mx-auto w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center pointer-events-none select-none">
                    <ProductVisual
                      category={p.category}
                      subCategory={p.sub}
                      colorName={p.colorName}
                      bgColor={p.bgColor}
                      name={p.name}
                      image={p.image}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className={`text-[10px] font-bold leading-tight line-clamp-1 mt-1 ${isActive ? 'text-indigo-600' : textMain}`}>
                    {p.colorName} Plain
                  </p>
                  <p className={`text-[10px] leading-tight ${isActive ? 'text-indigo-500' : textSub}`}>{subLabelOf(p.sub)}</p>
                </button>
              );
            })}
          </div>

          {/* RIGHT: main product */}
          {shownActive && (
            <div className="space-y-3">
              <div className="text-center">
                <h3 className={`text-base font-black leading-tight ${textMain}`}>{subLabelOf(shownActive.sub).toUpperCase()}</h3>
              </div>

              {/* Large image (walang box) */}
              <div className="relative flex items-center justify-center aspect-square overflow-hidden">
                <ProductVisual
                  category={shownActive.category}
                  subCategory={shownActive.sub}
                  colorName={shownActive.colorName}
                  bgColor={shownActive.bgColor}
                  name={shownActive.name}
                  image={shownActive.image}
                  className="w-[70%] h-[70%] object-contain"
                />
              </div>

              {/* Arrows below the large image */}
              {filteredList.length > 1 && (
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={prev}
                    className="w-8 h-8 rounded-full bg-white border border-stone-200 shadow flex items-center justify-center text-stone-700 cursor-pointer active:scale-95 transition-all"
                    aria-label="Previous product"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className={`text-[11px] font-bold ${textSub}`}>{idx + 1} / {filteredList.length}</span>
                  <button
                    onClick={next}
                    className="w-8 h-8 rounded-full bg-white border border-stone-200 shadow flex items-center justify-center text-stone-700 cursor-pointer active:scale-95 transition-all"
                    aria-label="Next product"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Select Size */}
              <div>
                <p className={`text-[11px] font-bold mb-1.5 ${textMain}`}>Select Size</p>
                <div className="flex flex-wrap gap-1.5">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`w-9 h-9 rounded-full text-xs font-black transition-all cursor-pointer ${
                        size === s
                          ? 'bg-indigo-600 text-white shadow'
                          : bgIsLight
                          ? 'bg-white text-stone-700 border border-stone-200'
                          : 'bg-white/15 text-white border border-white/25'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <p className={`text-[12px] leading-snug line-clamp-3 ${textSub}`}>{desc || shownActive.name}</p>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className={`text-xl font-black ${textMain}`}>₱{shownActive.price.toLocaleString()}</span>
                <span className={`text-xs line-through ${textSub}`}>₱{shownActive.original.toLocaleString()}</span>
              </div>

              {/* Buttons */}
              {user.isLoggedIn ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleBuy(shownActive)}
                    className="py-2.5 rounded-full bg-indigo-600 text-white text-[12px] font-black flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Buy Now
                  </button>
                  <button
                    onClick={() => handleAdd(shownActive)}
                    className="py-2.5 rounded-full bg-stone-900 text-white text-[12px] font-black flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Cart
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setPage('login')}
                  className={`w-full py-2.5 rounded-full text-[12px] font-black flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all ${textMain} ${
                    bgIsLight ? 'border border-stone-300 bg-white/60' : 'border border-white/40 bg-black/10'
                  }`}
                >
                  Log in to Buy
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="px-4 py-16 text-center">
          <p className={`text-sm ${textSub}`}>No products found for "{searchQuery}".</p>
        </div>
      )}

      {/* Hamburger category menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl pb-28 px-5 pt-5 animate-fadeIn">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-black text-stone-900">Shop Categories</h2>
              <button onClick={() => setMenuOpen(false)} className="p-1 text-stone-500 cursor-pointer" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="no-scrollbar overflow-y-auto max-h-[46vh]" style={{ scrollbarWidth: 'none' }}>
              <button
                onClick={() => pickTile('all')}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold cursor-pointer transition-all ${
                  sel === 'all' ? 'bg-indigo-600 text-white' : 'text-stone-800 hover:bg-stone-50'
                }`}
              >
                All Products
              </button>
              {shopTiles.map((t) => (
                <button
                  key={t.label}
                  onClick={() => pickTile(t)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold cursor-pointer transition-all ${
                    sel !== 'all' && sel.label === t.label ? 'bg-indigo-600 text-white' : 'text-stone-800 hover:bg-stone-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================
   SHOP PAGE (exported) — mobile new layout + desktop unchanged
   ============================================================ */
export const ShopPage: React.FC = () => {
  const { gender, setPage } = useStore();
  const [search, setSearch] = useState('');

  const genderLabel = gender.charAt(0).toUpperCase() + gender.slice(1);

  const categoryCards: CategoryItem[] = [
    {
      id: 'clothes',
      title: 'Clothes',
      desc: 'T-Shirts, hoodies & sweatshirts',
      bgColor: 'bg-[#1a1716]', // Dark obsidian / charcoal
      icon: (
        <i className="fa-solid fa-shirt text-4xl md:text-5xl text-white drop-shadow-md transition-transform group-hover:scale-110 duration-200"></i>
      )
    },
    {
      id: 'shoes',
      title: 'Shoes',
      desc: 'Sneakers, boots & footwear',
      bgColor: 'bg-[#27345b]', // Navy blue
      icon: (
        /* Precise Shoe vector icon matching fa-solid fa-shoe style */
        <svg
          viewBox="0 0 512 512"
          className="w-20 h-20 sm:w-14 sm:h-14 fill-white drop-shadow-md transition-transform group-hover:scale-110 duration-200"
        >
          <path d="M499.7 348.6c-4.4-10.4-13.4-18.4-24.3-21.7l-97.4-29.2-34.9-76.7c-7.9-17.4-25.2-28.7-44.3-29l-92.4-1.3c-13.5-.2-26.3 5.4-35.3 15.3L123.6 258c-4.2 4.6-9.8 7.7-16 8.8l-72.3 12.8C15.8 283.1 0 300.2 0 320.6V384c0 35.3 14.3 64 64 64h384c35.3 0 64-28.7 64-64v-11.4c0-8.6-4.5-16.6-12.3-24zM304 256h-48l-24-48h56l16 48z" />
        </svg>
      )
    },
    {
      id: 'pants',
      title: 'Pants',
      desc: 'Denim jeans, joggers & trousers',
      bgColor: 'bg-[#3f3128]', // Espresso brown
      icon: (
        /* Precise Trousers/Pants vector icon matching fa-solid fa-pants style */
        <svg
          viewBox="0 0 512 512"
          className="w-20 h-20 sm:w-12 sm:h-12 fill-white drop-shadow-md transition-transform group-hover:scale-110 duration-200"
        >
          <path d="M96 32c-17.7 0-32 14.3-32 32v128c0 14.1 9.3 26.2 22.8 29.8L128 448c4.4 26.5 27.3 46 54.1 46h43.9c16.2 0 30.7-10.8 35.4-26.3l34.6-115.7 34.6 115.7c4.7 15.6 19.2 26.3 35.4 26.3H410c26.8 0 49.7-19.5 54.1-46l41.2-226.2c13.5-3.6 22.8-15.7 22.8-29.8V64c0-17.7-14.3-32-32-32H96zm128 64h64v32h-64V96z" />
        </svg>
      )
    },
    {
      id: 'underwear',
      title: 'Underwear',
      desc: 'Everyday boxers & briefs',
      bgColor: 'bg-[#432838]', // Deep plum / maroon
      icon: (
        /* Precise Underwear/Briefs vector icon matching fa-solid fa-briefs style */
        <svg
          viewBox="0 0 512 512"
          className="w-20 h-20 sm:w-14 sm:h-14 fill-white drop-shadow-md transition-transform group-hover:scale-110 duration-200"
        >
          <path d="M70 96c-17.7 0-32 14.3-32 32v64c0 35.3 14.3 69.1 39.5 93.8l70.1 68.7c15.6 15.3 36.8 23.5 58.4 23.5h112c21.6 0 42.8-8.2 58.4-23.5l70.1-68.7c25.2-24.7 39.5-58.5 39.5-93.8v-64c0-17.7-14.3-32-32-32H64zm160 64h64v32h-64v-32z" />
        </svg>
      )
    },
    {
      id: 'accessories',
      title: 'Accessories',
      desc: 'Bags, caps & essentials',
      bgColor: 'bg-[#264441]', // Forest teal green
      icon: (
        <i className="fa-solid fa-gem text-5xl sm:text-5xl text-white drop-shadow-md transition-transform group-hover:scale-110 duration-200"></i>
      )
    }
  ];

  const filteredCategories = categoryCards.filter((cat) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return cat.title.toLowerCase().includes(q) || cat.desc.toLowerCase().includes(q);
  });

  return (
    <div className="w-full">
      {/* ============ MOBILE SHOP (mobile only) ============ */}
      <div className="md:hidden">
        <MobileShop />
      </div>

      {/* ============ DESKTOP SHOP (unchanged) ============ */}
      <div className="hidden md:block w-full">
        <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-9 sm:space-y-11 animate-fadeIn">

          {/* Title, Subtitle, and Search Bar */}
          <div className="text-center max-w-2xl mx-auto space-y-3 sm:space-y-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold font-serif tracking-tight text-stone-900 dark:text-white">
              Shop by Category
            </h1>
            <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-[15px] leading-relaxed max-w-xl mx-auto">
              Pick a category to browse. Every piece is built on the same standard –
              quality materials, honest pricing, everyday comfort.
            </p>

            {/* Centered Search Pill */}
            <div className="relative max-w-md w-full mx-auto pt-3">
              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-5 pr-11 py-3 rounded-full bg-white dark:bg-indigo-900 border-[1px] border-indigo-500 dark:border-indigo-500 text-sm text-stone-900 dark:text-white placeholder-stone-400 shadow-sm transition-all"
              />
              <Search className="absolute right-4 top-[35px] -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
            </div>
          </div>

          {/* 5 Compact Category Cards in a row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 justify-center">
            {filteredCategories.map((cat) => (
              <button
                key={cat.id}
                id={`shopCat-${cat.id}`}
                onClick={() => setPage(cat.id)}
                className={`${cat.bgColor} text-white rounded-[1.75rem] p-5 sm:p-6 min-h-[260px] sm:min-h-[280px] flex flex-col items-center justify-between text-center transition-all duration-300 hover:scale-[1.04] hover:shadow-2xl active:scale-95 shadow-md group cursor-pointer overflow-hidden relative`}
              >
                {/* Top / Center Category Icon matching request */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
                  {cat.icon}
                </div>

                {/* Middle & Bottom Text */}
                <div className="space-y-1 pb-1 w-full z-10">
                  <h3 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-white">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-white/80 font-normal leading-tight px-1 line-clamp-2">
                    {cat.desc}
                  </p>
                  <span className="text-[11px] font-medium text-white/60 pt-1.5 block">
                    {genderLabel}
                  </span>
                </div>
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};
