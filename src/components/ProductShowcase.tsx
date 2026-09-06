import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { PRODUCTS_CONFIG, CategoryData, withWhiteFirst } from '../data/products';
import { ProductVisual } from './ProductVisual';
import {
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  ShoppingBag, ShoppingCart, Menu, X, Check, Instagram,
  Facebook, Linkedin
} from 'lucide-react';
import { GenderType, PageType } from '../types';

/* ─── Hex color helpers (mobile background) ─── */
const hexToRgb = (hex: string) => {
  let m = hex.replace('#', '');
  if (m.length === 3) m = m.split('').map(c => c + c).join('');
  const num = parseInt(m, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
};
const LUM = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};
const isLightBg = (hex: string) => LUM(hex) > 0.62;

/* ─── Sub-category labels ─── */
const SUB_LABELS: Record<string, string> = {
  tshirt: 'T-Shirt', hoodie: 'Hoodie', sweatshirt: 'Sweatshirt',
  top: 'Top', dress: 'Dress', polo: 'Polo', poloshirt: 'Polo Shirt',
  jeans: 'Jeans', pants: 'Pants', joggers: 'Joggers', shorts: 'Short', jorts: 'Jorts',
  sneakers: 'Sneakers', boots: 'Boots',
  sandals: 'Sandals', bags: 'Bag', hats: 'Hat', socks: 'Socks',
};
const subLabelOf = (sub: string) => SUB_LABELS[sub] || sub;

/* ─── Mobile shop helpers ─── */
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

const buildList = (cat: string, sub: string, g: GenderType): FlatProduct[] => {
  const out: FlatProduct[] = [];
  const cfg = PRODUCTS_CONFIG[cat]?.[g] as CategoryData | undefined;
  if (!cfg) return out;
  const arr = cfg.products?.[sub] || [];
  arr.forEach((p, i) => {
    const bp = cfg.basePrices?.[sub] || { price: 0, original: 0 };
    out.push({
      key: `${cat}-${g}-${sub}-${i}`,
      name: p.name, colorName: p.colorName, image: p.image,
      bgColor: p.bgColor, textColor: p.textColor,
      category: cat as PageType, sub, price: bp.price, original: bp.original,
    });
  });
  return out;
};

const SLIDE_MS = 600;
const SLIDE_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const SIDEBAR_SLOT = '33.333%';
type SlideDir = 'next' | 'prev';

const slideVariants: Variants = {
  enter: (dir: number) => {
    if (dir > 0) return { x: 400, y: 300, scale: 0.3, opacity: 0, rotate: 10, zIndex: 30 };
    return { x: -400, y: -300, scale: 0.3, opacity: 0, rotate: -10, zIndex: 30 };
  },
  center: {
    x: 0, y: 0, opacity: 1, scale: 1, rotate: 0, zIndex: 20,
    transition: { duration: 2.5, ease: [0.22, 1, 0.36, 1] }
  },
  exit: (dir: number) => {
    if (dir > 0) return {
      x: -350, y: -250, opacity: 0, scale: 0.4, rotate: -12, zIndex: 10,
      transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] }
    };
    return {
      x: 350, y: 250, opacity: 0, scale: 0.4, rotate: 12, zIndex: 10,
      transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] }
    };
  }
};

const MobileProductVisual: React.FC<{ product: FlatProduct }> = ({ product }) => (
  <ProductVisual
    category={product.category}
    subCategory={product.sub}
    colorName={product.colorName}
    bgColor={product.bgColor}
    name={product.name}
    image={product.image}
    className="w-full h-full object-contain"
  />
);

/* ============================================================
   MOBILE LAYOUT (md:hidden)
   ============================================================ */
const MobileShowcase: React.FC<{ categoryKey: string }> = ({ categoryKey }) => {
  const { gender, setGender, subCategory, setSubCategory, setPage, addToCart, user, showToast, searchQuery, setShopBgColor, currentProductIndex, setCurrentProductIndex, getStock } = useStore();
  const genderOptions: GenderType[] = ['men', 'women', 'boys', 'girls'];

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const mobileCatConfig = PRODUCTS_CONFIG[categoryKey]?.[gender] as CategoryData | undefined;

  const [list, setList] = useState<FlatProduct[]>([]);
  const [idx, setIdx] = useState(0);
  const [size, setSize] = useState('S');
  const [menuOpen, setMenuOpen] = useState(false);
  const [anim, setAnim] = useState<{ fromIdx: number; toIdx: number; dir: SlideDir; phase: 'prep' | 'run' } | null>(null);
  const touchStartRef = useRef<number | null>(null);
  const touchXRef = useRef<number>(0);
  const touchYRef = useRef<number>(0);
  const animTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animRaf = useRef<number | null>(null);
  const dispatchGuardRef = useRef(false);
  const mainBoxRef = useRef<HTMLDivElement | null>(null);
  const hamburgerBtnRef = useRef<HTMLButtonElement | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const cancelAnim = () => {
    if (animTimer.current) { clearTimeout(animTimer.current); animTimer.current = null; }
    if (animRaf.current != null) { cancelAnimationFrame(animRaf.current); animRaf.current = null; }
    setAnim(null);
  };

  useEffect(() => {
    cancelAnim();
    setList(buildList(categoryKey, subCategory, gender));
    setIdx(0);
    setSize('S');
  }, [categoryKey, gender, subCategory]);

  const filteredList = useMemo(() => {
    const base = searchQuery.trim()
      ? list.filter((p) => `${p.name} ${p.colorName}`.toLowerCase().includes(searchQuery.toLowerCase()))
      : list;
    return withWhiteFirst(base);
  }, [list, searchQuery]);

  const orderedList = useMemo(() => withWhiteFirst(list), [list]);

  const shownActive = filteredList[idx] || filteredList[0] || list[0];
  const active = shownActive;

  const categoryConfig = active ? (PRODUCTS_CONFIG[active.category]?.[gender] as CategoryData | undefined) : undefined;
  const subLabels = mobileCatConfig?.subCategoryLabels || {};
  const catSubCategories = mobileCatConfig?.subCategories || [];
  const sizes = (active && categoryConfig?.sizes?.[active.sub]) || ['S', 'M', 'L', 'XL'];

  useEffect(() => {
    if (sizes.length && !sizes.includes(size)) setSize(sizes[0]);
  }, [active?.sub, sizes]);

  useEffect(() => {
    cancelAnim();
    setIdx(0);
  }, [searchQuery]);

  useEffect(() => {
    if (dispatchGuardRef.current) {
      dispatchGuardRef.current = false;
      return;
    }
    const activeKey = orderedList[currentProductIndex]?.key;
    const next = filteredList.findIndex((p) => p.key === activeKey);
    if (next >= 0 && next !== idx && filteredList.length > 1) {
      const len = filteredList.length;
      const fwd = ((next - idx) % len + len) % len;
      const dir: SlideDir = fwd <= len / 2 ? 'next' : 'prev';
      if (animTimer.current) { clearTimeout(animTimer.current); animTimer.current = null; }
      if (animRaf.current != null) { cancelAnimationFrame(animRaf.current); animRaf.current = null; }
      setAnim({ fromIdx: idx, toIdx: next, dir, phase: 'prep' });
    }
  }, [currentProductIndex, orderedList, filteredList, idx]);

  useEffect(() => {
    if (!anim) return;
    if (anim.phase === 'prep') {
      animRaf.current = requestAnimationFrame(() => {
        animRaf.current = requestAnimationFrame(() => {
          setAnim((a) => (a && a.phase === 'prep' ? { ...a, phase: 'run' } : a));
        });
      });
      return () => {
        if (animRaf.current != null) { cancelAnimationFrame(animRaf.current); animRaf.current = null; }
      };
    }
    animTimer.current = setTimeout(() => {
      setIdx(anim.toIdx);
      setAnim(null);
      animTimer.current = null;
    }, SLIDE_MS);
    return () => {
      if (animTimer.current) { clearTimeout(animTimer.current); animTimer.current = null; }
    };
  }, [anim]);

  const syncColor = anim
    ? (filteredList[anim.toIdx] || shownActive)?.bgColor
    : shownActive?.bgColor;
  const shopBg = syncColor || '#ffffff';
  const bgIsLight = isLightBg(shopBg);
  const textMain = bgIsLight ? 'text-stone-900' : 'text-white';
  const textSub = bgIsLight ? 'text-stone-600' : 'text-white/75';

  useEffect(() => { setShopBgColor(shopBg); }, [shopBg, setShopBgColor]);

  const switchGender = (g: GenderType) => {
    setGender(g);
  };

  const pickSub = (sub: string) => {
    cancelAnim();
    setSubCategory(sub);
    setMenuOpen(false);
  };

  const sidebarTrackStyle = (): React.CSSProperties => {
    const run = anim && anim.phase === 'run';
    const len = filteredList.length || 1;
    const restTop = len + ((idx + 1) % len);
    let topIdx = restTop;
    if (run) {
      topIdx = anim.dir === 'next' ? restTop + 1 : restTop - 1;
    }
    return {
      display: 'flex', flexDirection: 'column',
      transform: `translateY(calc(-${topIdx} * ${SIDEBAR_SLOT}))`,
      transition: run ? `transform ${SLIDE_MS}ms ${SLIDE_EASE}` : 'none',
      willChange: 'transform',
    };
  };

  const startSlide = (to: number, dir: SlideDir) => {
    if (filteredList.length < 2 || anim || to === idx) return;
    if (animTimer.current) { clearTimeout(animTimer.current); animTimer.current = null; }
    if (animRaf.current != null) { cancelAnimationFrame(animRaf.current); animRaf.current = null; }
    const targetKey = filteredList[to]?.key;
    const globalIdx = orderedList.findIndex((p) => p.key === targetKey);
    if (globalIdx >= 0 && globalIdx !== currentProductIndex) {
      dispatchGuardRef.current = true;
      setCurrentProductIndex(globalIdx);
    }
    setAnim({ fromIdx: idx, toIdx: to, dir, phase: 'prep' });
  };

  const next = () => {
    if (filteredList.length < 2) return;
    startSlide((idx + 1) % filteredList.length, 'next');
  };

  const prev = () => {
    if (filteredList.length < 2) return;
    startSlide((idx - 1 + filteredList.length) % filteredList.length, 'prev');
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    touchStartRef.current = Date.now();
    touchXRef.current = t.clientX;
    touchYRef.current = t.clientY;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartRef.current == null) return;
    const t = e.touches[0];
    if (!t) return;
    const dx = t.clientX - touchXRef.current;
    const dy = t.clientY - touchYRef.current;
    if (Math.abs(dx) > 24 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      e.preventDefault();
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current == null) return;
    const t = e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - touchXRef.current;
    const dy = t.clientY - touchYRef.current;
    const dt = Date.now() - touchStartRef.current;
    touchStartRef.current = null;
    if (Math.abs(dx) < 30 || Math.abs(dx) < Math.abs(dy) * 1.5 || dt > 600) return;
    if (dx < 0) next(); else prev();
  };

  const layerStyle = (role: 'out' | 'in'): React.CSSProperties => {
    const dir = anim?.dir ?? 'next';
    const goingNext = dir === 'next';
    const run = anim?.phase === 'run';
    let tx = '0%';
    let ty = '0%';
    if (role === 'out') {
      tx = run ? (goingNext ? '-100%' : '100%') : '0%';
      ty = run ? (goingNext ? '0%' : '-100%') : '0%';
    } else {
      tx = run ? '0%' : (goingNext ? '55%' : '-55%');
      ty = run ? '0%' : (goingNext ? '-25%' : '-25%');
    }
    return {
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transform: `translate3d(${tx}, ${ty}, 0)`,
      opacity: anim && role === 'out' && run ? 0 : 1,
      transition: run
        ? `transform ${SLIDE_MS}ms ${SLIDE_EASE}, opacity ${SLIDE_MS}ms ${SLIDE_EASE}`
        : 'none',
      willChange: 'transform',
      pointerEvents: 'none',
    };
  };

  const outgoingProduct = anim ? (filteredList[anim.fromIdx] || shownActive) : shownActive;
  const incomingProduct = anim ? (filteredList[anim.toIdx] || shownActive) : undefined;

  const cartPayload = (p: FlatProduct) => ({
    id: `${p.category}-${gender}-${p.sub}-${p.colorName}-${size}`,
    name: p.name, price: p.price, image: p.image,
    size, color: p.colorName, subCategory: p.sub, gender: gender,
  });

  const handleAdd = (p: FlatProduct) => {
    addToCart(cartPayload(p), 1);
  };

  return (
    <div
      className="w-full"
      style={{
        backgroundColor: shopBg,
        minHeight: 'calc(100vh - 8rem)',
        transition: `background-color ${SLIDE_MS}ms ${SLIDE_EASE}`
      }}
    >
      {/* Back button + Gender tabs + Hamburger */}
      <div className={`flex items-center gap-1.5 px-4 pt-4 pb-2 overflow-x-auto no-scrollbar ${textMain}`}>
        <button
          onClick={() => setPage('shop')}
          className={`shrink-0 w-9 h-9 rounded-full ${bgIsLight ? 'bg-white text-stone-700' : 'bg-white/15 text-white'} flex items-center justify-center cursor-pointer`}
          aria-label="Back to categories"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {genderOptions.map((g) => (
          <button
            key={g}
            onClick={() => switchGender(g)}
            className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
              gender === g
                ? 'bg-indigo-600 text-white shadow'
                : bgIsLight
                ? 'bg-white/70 text-stone-700 border border-stone-200'
                : 'bg-white/15 text-white border border-white/20'
            }`}
          >
            {g}
          </button>
        ))}
        <div className="flex-1" />
        <button
          ref={hamburgerBtnRef}
          onClick={() => {
            const rect = hamburgerBtnRef.current?.getBoundingClientRect();
            if (rect) setMenuPos({ top: rect.bottom + 6, left: rect.right - 200 });
            setMenuOpen(true);
          }}
          className={`shrink-0 w-9 h-9 rounded-full ${bgIsLight ? 'bg-white text-stone-700' : 'bg-white/15 text-white'} flex items-center justify-center cursor-pointer`}
          aria-label="Menu"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {filteredList.length > 0 ? (
        <>
          <div className="grid grid-cols-[62%_38%] gap-1 px-4 pt-1 pb-4">
            {/* RIGHT: product list */}
            <div className="relative overflow-hidden pl-1 order-2">
              <div className="absolute inset-0" style={sidebarTrackStyle()}>
                {[...filteredList, ...filteredList, ...filteredList].map((p, i) => {
                  return (
                    <button
                      key={`${p.key}-${i}`}
                      onClick={() => {
                        const target = i % filteredList.length;
                        if (target === idx) return;
                        const len = filteredList.length;
                        const fwd = ((target - idx) % len + len) % len;
                        startSlide(target, fwd <= len / 2 ? 'next' : 'prev');
                      }}
                      className={`w-full h-[33.333%] shrink-0 flex flex-col items-center justify-between text-center py-1 cursor-pointer transition-transform active:scale-95 ${textMain}`}
                    >
                      <div
                        className="mx-[25px] my-1.5 w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center pointer-events-none select-none"
                      >
                        <ProductVisual
                          category={p.category}
                          subCategory={p.sub}
                          colorName={p.colorName}
                          bgColor={p.bgColor}
                          name={p.name}
                          image={p.image}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className={`m-0 -mb-1 text-[10px] font-bold leading-none line-clamp-1 ${textMain}`}>
                        {p.colorName} Plain
                      </p>
                      <p className={`m-0 mb-8 text-[10px] leading-none ${textSub}`}>{subLabelOf(p.sub)}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* LEFT: main product */}
            {shownActive && (
              <div className="space-y-3 order-1">
                <div className="text-center">
                  <h3 className={`text-base font-black leading-tight ${textMain}`}>{subLabelOf(shownActive.sub).toUpperCase()}</h3>
                </div>

<div
                  ref={mainBoxRef}
                  className="relative aspect-square overflow-hidden touch-pan-y"
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  {outgoingProduct && (
                    <div key={outgoingProduct.key} style={layerStyle('out')}>
                      <div className="relative -top-5 w-[65%] h-[65%] flex items-center justify-center">
                        <MobileProductVisual product={outgoingProduct} />
                      </div>
                    </div>
                  )}
                  {incomingProduct && (
                    <div key={incomingProduct.key} style={layerStyle('in')}>
                      <div className="relative -top-5 w-[65%] h-[65%] flex items-center justify-center">
                        <MobileProductVisual product={incomingProduct} />
                      </div>
                    </div>
                  )}
                </div>

                {filteredList.length > 1 && (
                  <div className="relative -top-8 flex items-center justify-center gap-30">
                    <button
                      onClick={prev}
                      className="w-8 h-8 rounded-full bg-white border border-stone-200 shadow flex items-center justify-center text-stone-700 cursor-pointer active:scale-95 transition-all"
                      aria-label="Previous product"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
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
                  <p className={`text-[11px] relative -top-7 left-3 font-bold mb-1.5 ${textMain}`}>Select Size</p>
                  <div className="flex flex-wrap gap-1.5">
                    {sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        className={`w-9 h-9 relative -top-6 rounded-full text-xs font-black transition-all cursor-pointer ${
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

                {/* Price */}
                <div className="relative -top-6 left-3 flex items-baseline gap-2">
                  <span className={`text-xl font-black ${textMain}`}>₱{shownActive.price.toLocaleString()}</span>
                  <span className={`text-xs line-through ${textSub}`}>₱{shownActive.original.toLocaleString()}</span>
                </div>

                {/* Buttons */}
                {user.isLoggedIn ? (
                  <div className="relative -top-6">
                    <button
                      onClick={() => handleAdd(shownActive)}
                      className="w-full py-2.5 rounded-full bg-indigo-600 text-white text-[12px] font-black flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Cart
                    </button>
                  </div>
                ) : (
                  <div className="relative -top-6">
                    <button
                      onClick={() => setPage('login')}
                      className="w-full py-2.5 rounded-full bg-indigo-600 text-white text-[12px] font-black flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                    >
                      Log in to Buy
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="px-4 py-16 text-center">
          <p className={`text-sm ${textSub}`}>No products found.</p>
        </div>
      )}

      {/* Hamburger menu overlay */}
      {menuOpen && isMobile && createPortal(
        <div className="fixed inset-0 z-[9999]" onClick={() => setMenuOpen(false)}>
          <div className="absolute bg-white rounded-2xl shadow-2xl px-2 py-1 min-w-[200px] animate-fadeIn"
            style={{ top: menuPos.top, right: 16 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1 px-2 pt-1">
              <h2 className="text-xs font-black text-stone-900 capitalize">{categoryKey === 'pants' ? 'Bottom' : categoryKey}</h2>
              <button onClick={() => setMenuOpen(false)} className="p-0.5 text-stone-500 cursor-pointer" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="no-scrollbar overflow-y-auto max-h-[50vh]" style={{ scrollbarWidth: 'none' }}>
              {catSubCategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() => pickSub(sub)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    subCategory === sub ? 'bg-indigo-600 text-white' : 'text-stone-800 hover:bg-stone-100'
                  }`}
                >
                  {subLabels[sub] || sub}
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

/* ============================================================
   DESKTOP LAYOUT (hidden md:block)
   ============================================================ */
const DesktopShowcase: React.FC<{ categoryKey: string }> = ({ categoryKey }) => {
  const {
    page, gender, subCategory, currentProductIndex,
    setPage, setGender, setSubCategory, setCurrentProductIndex,
    addToCart, user, isDarkTheme, showToast, getStock
  } = useStore();

  const [activeTab, setActiveTab] = useState<string>(subCategory);
  const [selectedSize, setSelectedSize] = useState<string>('XL');
  const [direction, setDirection] = useState<number>(1);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);
  const lastIndexRef = useRef(currentProductIndex);

  const categoryConfig = PRODUCTS_CONFIG[categoryKey]?.[gender] || PRODUCTS_CONFIG['clothes']['men'];
  const currentSubCategory = categoryConfig.subCategories.includes(subCategory)
    ? subCategory
    : categoryConfig.defaultSubCategory;

  const currentProducts = withWhiteFirst(categoryConfig.products[currentSubCategory] || []);
  const activeProduct = currentProducts[currentProductIndex] || currentProducts[0];

  useEffect(() => {
    const prev = lastIndexRef.current;
    if (prev !== currentProductIndex) {
      const len = currentProducts.length || 1;
      const fwd = ((currentProductIndex - prev) % len + len) % len;
      setDirection(fwd <= len / 2 ? 1 : -1);
      lastIndexRef.current = currentProductIndex;
    }
  }, [currentProductIndex, currentProducts.length]);

  const defaultSizes = ['XL', '2XL', '3XL', '4XL'];
  const availableSizes = categoryConfig.sizes[currentSubCategory] || defaultSizes;
  const basePriceObj = categoryConfig.basePrices[currentSubCategory] || { price: 10000, original: 15000 };

  useEffect(() => {
    if (availableSizes.length > 0 && !availableSizes.includes(selectedSize)) {
      setSelectedSize(availableSizes[0]);
    }
  }, [currentSubCategory, availableSizes]);

  useEffect(() => {
    setActiveTab(currentSubCategory);
  }, [currentSubCategory]);

  const handleNextProduct = () => {
    if (currentProducts.length <= 1) return;
    setDirection(1);
    setCurrentProductIndex((currentProductIndex + 1) % currentProducts.length);
  };

  const handlePrevProduct = () => {
    if (currentProducts.length <= 1) return;
    setDirection(-1);
    setCurrentProductIndex((currentProductIndex - 1 + currentProducts.length) % currentProducts.length);
  };

  const handleNextSize = () => {
    const currentIndex = availableSizes.indexOf(selectedSize);
    if (currentIndex < availableSizes.length - 1) setSelectedSize(availableSizes[currentIndex + 1]);
    else setSelectedSize(availableSizes[0]);
  };

  const handlePrevSize = () => {
    const currentIndex = availableSizes.indexOf(selectedSize);
    if (currentIndex > 0) setSelectedSize(availableSizes[currentIndex - 1]);
    else setSelectedSize(availableSizes[availableSizes.length - 1]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNextProduct();
      if (e.key === 'ArrowLeft') handlePrevProduct();
      if (e.key === 'ArrowUp') handlePrevSize();
      if (e.key === 'ArrowDown') handleNextSize();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentProductIndex, currentProducts.length, selectedSize, availableSizes]);

  const nextIndex = (currentProductIndex + 1) % (currentProducts.length || 1);
  const nextProduct = currentProducts[nextIndex];

  const handleAddToCart = () => {
    if (!user.isLoggedIn) {
      showToast('Please log in first to purchase or add to cart.', 'warning');
      setPage('login');
      return;
    }
    if (!activeProduct) return;
    addToCart({
      id: `${categoryKey}-${gender}-${currentSubCategory}-${activeProduct.colorName}-${selectedSize}`,
      name: `${activeProduct.name || activeProduct.colorName}`,
      price: basePriceObj.price,
      image: activeProduct.image,
      size: selectedSize,
      color: activeProduct.colorName,
      subCategory: currentSubCategory,
      gender: gender
    });
    setAddedAnimation(true);
    showToast(`Added ${activeProduct.name || activeProduct.colorName} to cart!`, 'success');
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const textColorClass = isDarkTheme ? 'text-white' : 'text-stone-900';
  const subTextColorClass = isDarkTheme ? 'text-white/70' : 'text-stone-700';

  // LIVE STOCK para sa napiling product + size
  const currentProductId = activeProduct ? `${categoryKey}-${gender}-${currentSubCategory}-${activeProduct.colorName}-${selectedSize}` : '';
  const currentStock = currentProductId ? getStock(currentProductId) : 0;
  const isOutOfStock = currentStock <= 0;
  const isLowStock = !isOutOfStock && currentStock <= 10;

  return (
    <div className="w-full relative transition-colors duration-700 py-3 sm:py-6 px-4 sm:px-8">
      <div className="max-w-85rem mx-auto min-h-40rem flex flex-col justify-between">

        {/* Top Gender Tabs */}
        <div className="flex flex-wrap items-center justify-start gap-2 pb-3 border-black/5 dark:border-white/10 relative z-20 mt-6 ml-6 lg:ml-10">
          {(['men', 'women', 'boys', 'girls'] as GenderType[]).map((g) => {
            const isSelected = gender === g;
            return (
              <button
                key={g}
                onClick={() => { setDirection(1); setGender(g); }}
                className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs md:text-sm font-bold tracking-wide capitalize transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-500/80 backdrop-blur-sm text-white shadow-md shadow-indigo-500/25 border border-indigo-400/30 scale-105'
                    : isDarkTheme
                    ? 'bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/20 border border-white/5'
                    : 'bg-white/40 backdrop-blur-sm text-stone-700 hover:text-stone-900 hover:bg-white/60 border border-white/20'
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>

        {/* 3-Column Showcase Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 items-center relative py-4 flex-1">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-4 flex flex-col justify-center z-10">
            <div className="relative -top-20 left-10">
              <h1 className={`text-4xl sm:text-5xl lg:text-[40px] font-serif font-bold leading-[1.08] tracking-tight transition-colors duration-500 ${textColorClass}`}>
                Wear Confidence
              </h1>
            </div>
            <div className="relative -top-18 left-10">
              <h1 className={`text-4xl sm:text-5xl lg:text-[40px] font-serif font-bold leading-[1.08] tracking-tight transition-colors duration-500 ${textColorClass}`}>
                Define Your Style.
              </h1>
            </div>
            <div className="relative -top-10 left-10">
              <p className={`text-sm sm:text-base leading-relaxed ${subTextColorClass} max-w-sm font-normal transition-colors duration-500`}>
                Discover premium T-shirts, hoodies, and sweatshirts designed for comfort, quality, and everyday expression.
              </p>
            </div>

            {/* Sub category switcher */}
            <div className="relative left-6 lg:left-8 top-12 sm:top-16 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs font-semibold">
              {categoryConfig.subCategories.map((sub) => {
                const label = categoryConfig.subCategoryLabels[sub] || sub;
                const isSelected = activeTab === sub;
                return (
                  <button
                    key={sub}
                    onClick={() => {
                      const curIdx = categoryConfig.subCategories.indexOf(currentSubCategory);
                      const newIdx = categoryConfig.subCategories.indexOf(sub);
                      setDirection(newIdx >= curIdx ? 1 : -1);
                      setActiveTab(sub); setSubCategory(sub);
                    }}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold capitalize transition-all duration-300 ${
                      isSelected
                        ? 'bg-indigo-500/80 backdrop-blur-sm text-white shadow-md shadow-indigo-500/25 border border-indigo-400/30 scale-105'
                        : isDarkTheme
                        ? 'bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/20 border border-white/5'
                        : 'bg-white/40 backdrop-blur-sm text-stone-700 hover:text-stone-900 hover:bg-white/60 border border-white/20'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Back to Categories */}
            <div className="relative left-10 top-24 pt-2">
              <button
                onClick={() => setPage('shop')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur shadow-md border border-stone-200 dark:border-stone-700 text-sm font-semibold text-stone-700 dark:text-stone-200 hover:shadow-lg transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Categories
              </button>
            </div>

            {/* Social icons */}
            <div className={`relative left-10 top-28 pt-6 flex items-center gap-5 transition-colors duration-500 ${isDarkTheme ? 'text-white/80' : 'text-stone-700'}`}>
              <a href="#instagram" aria-label="Instagram" className="hover:opacity-100 opacity-80 transition-opacity">
                <Instagram className="w-5 h-5 stroke-[2]" />
              </a>
              <a href="#x" aria-label="X" className="font-bold text-base hover:opacity-100 opacity-80 transition-opacity">
                𝕏
              </a>
              <a href="#facebook" aria-label="Facebook" className="hover:opacity-100 opacity-80 transition-opacity">
                <Facebook className="w-5 h-5 stroke-[2]" />
              </a>
              <a href="#linkedin" aria-label="LinkedIn" className="hover:opacity-100 opacity-80 transition-opacity">
                <Linkedin className="w-5 h-5 stroke-[2]" />
              </a>
              <a href="#tiktok" aria-label="TikTok" className="hover:opacity-100 opacity-80 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 448 512" fill="currentColor">
                  <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* CENTER COLUMN: Product Image */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative py-2 lg:-top-10">
            <div className="relative w-full max-w-[380px] sm:max-w-[440px] flex flex-col items-center justify-center">
              <div className="relative w-full h-[360px] sm:h-[400px] flex items-center justify-center overflow-visible">
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                  {activeProduct && (
                    <motion.div
                      key={`${activeProduct.name}-${activeProduct.colorName}-${currentProductIndex}`}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="w-full h-full flex items-center justify-center select-none absolute inset-0"
                    >
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
                        className="w-full h-full flex items-center justify-center"
                      >
                        <ProductVisual
                          category={categoryKey}
                          subCategory={currentSubCategory}
                          colorName={activeProduct.colorName}
                          bgColor={activeProduct.bgColor}
                          name={activeProduct.name}
                          image={activeProduct.image}
                          className="w-full h-full object-contain filter drop-shadow-2xl"
                        />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Ground Shadow */}
              <motion.div
                animate={{ scale: [1, 0.94, 1], opacity: [0.35, 0.22, 0.35] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-52 sm:w-64 h-8 rounded-[100%] bg-stone-950 dark:bg-black blur-md mt-1 transition-all duration-300"
                style={{ filter: 'blur(7px)', transform: 'scaleY(0.55)' }}
              />

              {/* Slogan */}
              <div className="mt-6 text-center space-y-0.5 select-none transition-colors duration-500">
                <p className={`text-xl sm:text-2xl font-serif font-bold tracking-tight ${textColorClass}`}>Dress Better.</p>
                <p className={`text-xl sm:text-2xl font-serif font-bold tracking-tight ${textColorClass}`}>Feel Better.</p>
              </div>

              {/* Navigation Arrows */}
              {currentProducts.length > 1 && (
                <>
                  <button id="prevProductBtn" onClick={handlePrevProduct}
                    className="absolute left-[-12px] sm:left-[-24px] bottom-16 sm:bottom-20 w-12 h-12 rounded-full flex items-center justify-center transition-all bg-stone-700/80 hover:bg-stone-900 text-white shadow-xl hover:scale-110 active:scale-95 z-20 cursor-pointer border border-white/10">
                    <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                  </button>
                  <button id="nextProductBtn" onClick={handleNextProduct}
                    className="absolute right-[-12px] sm:right-[-24px] bottom-16 sm:bottom-20 w-12 h-12 rounded-full flex items-center justify-center transition-all bg-stone-700/80 hover:bg-stone-900 text-white shadow-xl hover:scale-110 active:scale-95 z-20 cursor-pointer border border-white/10">
                    <ChevronRight className="w-6 h-6 stroke-[2.5]" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Price & Size */}
          <div className="lg:col-span-3 space-y-7 flex flex-col justify-center lg:items-end text-left lg:text-right z-10">
            <div className="space-y-1 relative lg:right-15 lg:-top-40">
              <div className={`text-3xl sm:text-4xl lg:text-[40px] font-black tracking-tight font-mono transition-colors duration-500 ${textColorClass}`}>
                #{basePriceObj.price.toLocaleString()}
              </div>
              <div className={`text-xl sm:text-2xl font-bold line-through tracking-tight font-mono transition-colors duration-500 ${subTextColorClass} opacity-60`}>
                #{basePriceObj.original.toLocaleString()}
              </div>
            </div>

            <div className="space-y-3 relative lg:right-15 lg:-top-35">
              <p className={`text-xs font-bold tracking-tight capitalize transition-colors duration-500 ${textColorClass}`}>Choose your size</p>
              <div className="flex flex-wrap lg:justify-end items-center gap-2">
                {availableSizes.map((s) => {
                  const isSelected = selectedSize === s;
                  return (
                    <button key={s} id={`size-btn-${s}`} onClick={() => setSelectedSize(s)}
                      className={`w-11 h-11 rounded-full text-xs font-black transition-all flex items-center justify-center cursor-pointer ${
                        isSelected
                          ? 'bg-white text-stone-950 shadow-xl border-2 border-stone-900 scale-110 ring-2 ring-black/10'
                          : isDarkTheme ? 'bg-stone-800 text-white hover:bg-stone-700'
                          : 'bg-stone-200 text-stone-800 hover:bg-stone-300'
                      }`}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Floating Bottom-Right: Mini Thumbnail + Add to Cart */}
        <div id="productFloatCta" className="fixed sm:absolute bottom-5 right-5 sm:right-35 sm:bottom-20 flex flex-col items-end gap-2 z-30">
          {nextProduct && currentProducts.length > 1 && (
            <button id="nextItemCornerThumb" onClick={handleNextProduct}
              className="flex flex-col items-center justify-center p-1 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer group bg-transparent select-none"
              title={`Next: ${nextProduct.name || nextProduct.colorName}`}>
              <div className="w-16 sm:w-20 aspect-square relative flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`thumb-${nextProduct.name}-${nextProduct.colorName}-${nextIndex}`}
                    initial={{ scale: 0.6, opacity: 0, rotate: -6 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.6, opacity: 0, rotate: 6 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full h-full flex items-center justify-center">
                    <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-full h-full flex items-center justify-center">
                      <ProductVisual
                        category={categoryKey} subCategory={currentSubCategory}
                        colorName={nextProduct.colorName} bgColor={nextProduct.bgColor}
                        name={nextProduct.name} image={nextProduct.image}
                        className="w-full h-full object-contain filter drop-shadow-md group-hover:rotate-6 transition-transform"
                      />
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>
              <motion.div animate={{ scale: [1, 0.9, 1], opacity: [0.35, 0.2, 0.35] }}
                transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
                className="w-10 sm:w-12 h-2 rounded-[100%] bg-stone-950 dark:bg-black blur-[3px] -mt-1 transition-all"
                style={{ transform: 'scaleY(0.5)' }} />
            </button>
          )}

          {user.isLoggedIn && (
            <div className="flex flex-col items-end gap-1.5">
              {isOutOfStock ? (
                <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-600">
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-700">
                  Low Stock · {currentStock} left
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700">
                  In Stock · {currentStock} left
                </span>
              )}
              <button id="addToCartFloatingBtn" onClick={handleAddToCart} disabled={isOutOfStock}
                className={`px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all duration-300 shadow-lg cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${
                  addedAnimation ? 'bg-emerald-600 text-white scale-105'
                    : isDarkTheme ? 'bg-white text-stone-900 hover:bg-stone-100'
                    : 'bg-indigo-500 text-white hover:bg-stone-800'
                }`}>
                {addedAnimation ? (
                  <><Check className="w-3.5 h-3.5" /><span>Added</span></>
                ) : (
                  <><ShoppingBag className="w-3.5 h-3.5" /><span>{isOutOfStock ? 'Out of Stock' : 'Cart'}</span></>
                )}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

/* ============================================================
   PRODUCT SHOWCASE (exported)
   ============================================================ */
export const ProductShowcase: React.FC<{ categoryOverride?: string }> = ({ categoryOverride }) => {
  const { page } = useStore();

  const categoryKey = categoryOverride
    || (['clothes', 'shoes', 'pants', 'underwear', 'accessories'].includes(page) ? page : 'clothes');

  return (
    <>
      <div className="md:hidden">
        <MobileShowcase categoryKey={categoryKey} />
      </div>
      <div className="hidden md:block">
        <DesktopShowcase categoryKey={categoryKey} />
      </div>
    </>
  );
};
