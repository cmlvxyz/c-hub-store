import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Heart,
  ChevronLeft,
  ShoppingBag,
  Trash2,
  PackageX,
  ShoppingCart,
  Minus,
} from 'lucide-react';
import { WishlistItem } from '../types';

/*
 * Wishlist screen — mga produktong naka-save ng nakal-log-in na user.
 *
 * - Per-user (hindi nakikita ang sa iba); local snapshot + backend sync kapag
 *   may totoong account token.
 * - Bawat card: image, name, price, stock status, Add to Cart, Remove.
 * - Kapag out of stock / inalis na ang product -> malinaw na state at bawal
 *   ang checkout galing sa unavailable na item.
 */
export const WishlistPage: React.FC = () => {
  const {
    user,
    setPage,
    wishlist,
    removeFromWishlist,
    refreshWishlist,
    addToCart,
    getStock,
    showToast,
  } = useStore();

  const [refreshing, setRefreshing] = useState(false);

  // I-refresh mula sa server para laging live ang stock/availability.
  useEffect(() => {
    let mounted = true;
    setRefreshing(true);
    refreshWishlist().finally(() => {
      if (mounted) setRefreshing(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user.isLoggedIn) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 md:px-10 pt-4 md:pt-8 pb-10 animate-fadeIn">
        <button
          onClick={() => setPage('me')}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Me
        </button>
        <div className="mt-6 bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800 px-6 py-12 flex flex-col items-center text-center">
          <Heart className="w-10 h-10 text-indigo-500" />
          <h2 className="mt-4 text-xl font-black text-stone-900 dark:text-white">Sign in required</h2>
          <p className="mt-2 max-w-sm text-sm text-stone-500 dark:text-stone-400">
            Sign in to save and view the products you love.
          </p>
          <button
            onClick={() => setPage('signin')}
            className="mt-6 py-3.5 px-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black uppercase tracking-wider shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = (entry: WishlistItem) => {
    const product = entry.product;
    if (!product) return;

    // Kailangan ng live stock para hindi ma-checkout ang unavailable item.
    const stock = Number.isFinite(getStock(entry.productId)) ? getStock(entry.productId) : Number(product.stock ?? 0);
    if (stock <= 0) {
      showToast('This item is out of stock and cannot be added to cart.', 'warning');
      return;
    }

    // Kunin ang size: galing sa productId (ang huling segment) o unang available.
    const tail = entry.productId;
    const parts = String(tail).split('-');
    let size: string | undefined;
    if (parts.length >= 2) {
      size = parts[parts.length - 1];
    }
    const sizes = Array.isArray(product.sizes) ? product.sizes : [];
    if (sizes.length && !sizes.includes(size as string)) {
      size = sizes[0];
    }
    if (Array.isArray(sizes) && sizes.length === 0) size = undefined;

    addToCart({
      id: entry.productId,
      name: product.name || entry.productId,
      price: Number(product.price ?? 0),
      image: product.image || '',
      size,
      color: product.color || product.colorName || undefined,
      subCategory: product.subCategory || undefined,
      gender: product.gender || undefined,
    });

    // Awtomatikong alisin sa wishlist kapag na-add na sa cart.
    removeFromWishlist(entry.productId);
  };

  const renderEntry = (entry: WishlistItem) => {
    const product = entry.product;
    const unavailable = !product;

    const stock =
      product && Number.isFinite(getStock(entry.productId))
        ? getStock(entry.productId)
        : Number(product?.stock ?? 0);
    const stockStatus = product?.stockStatus || (stock <= 0 ? 'Out of Stock' : 'In Stock');
    const isOutOfStock = stock <= 0;

    return (
      <div
        key={entry.productId}
        className="flex gap-4 p-4 rounded-2xl border border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm transition-colors"
      >
        {/* Image */}
        <div
          className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center"
          style={{ backgroundColor: product?.bgColor || '#f4f4f5' }}
        >
          {product?.image ? (
            <img
              src={product.image}
              alt={product.name || 'Product'}
              className="w-full h-full object-contain"
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
              }}
            />
          ) : unavailable ? (
            <PackageX className="w-8 h-8 text-stone-300 dark:text-stone-600" />
          ) : (
            <ShoppingBag className="w-8 h-8 text-stone-300 dark:text-stone-600" />
          )}
          {isOutOfStock && !unavailable && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="px-2 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider">
                Out of Stock
              </span>
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-bold text-stone-900 dark:text-white truncate">
                {product?.name || 'Unavailable product'}
              </p>
              {product?.subCategory ? (
                <p className="text-[11px] text-stone-400 mt-0.5 capitalize truncate">{product.subCategory}</p>
              ) : null}
            </div>
            <button
              onClick={() => removeFromWishlist(entry.productId)}
              className="shrink-0 p-2 rounded-full text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              aria-label="Remove from wishlist"
              title="Remove from wishlist"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Price */}
          <div className="mt-1 flex items-center gap-2">
            <span className="text-base font-black text-stone-900 dark:text-white">
              ₱{(Number(product?.price ?? 0)).toLocaleString()}
            </span>
            {product?.originalPrice ? (
              <span className="text-xs text-stone-400 line-through">
                ₱{Number(product.originalPrice).toLocaleString()}
              </span>
            ) : null}
          </div>

          {/* Stock status */}
          <div className="mt-1.5">
            {unavailable ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 text-[10px] font-black uppercase tracking-wider">
                <Minus className="w-3 h-3" /> No longer available
              </span>
            ) : stockStatus === 'In Stock' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                In Stock{stock > 0 ? ` · ${stock} left` : ''}
              </span>
            ) : stockStatus === 'Low Stock' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wider">
                Low Stock · {stock} left
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-wider">
                Out of Stock
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="mt-auto pt-3">
            <button
              onClick={() => handleAddToCart(entry)}
              disabled={isOutOfStock || unavailable}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-stone-200 disabled:text-stone-400 dark:disabled:bg-stone-800 dark:disabled:text-stone-500 text-white text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-indigo-600/25 disabled:shadow-none"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {unavailable ? 'Unavailable' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-10 pt-4 md:pt-8 pb-10 animate-fadeIn">
      <button
        onClick={() => setPage('me')}
        className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5" /> Back to Me
      </button>

      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Heart className="w-5 h-5 text-indigo-500" />
          <div>
            <h1 className="text-xl md:text-2xl font-black text-stone-900 dark:text-white">My Wishlist</h1>
            <p className="text-xs text-stone-400 mt-0.5">
              {wishlist.length} saved item{wishlist.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>
        {refreshing && (
          <span className="text-[11px] text-stone-400">Syncing…</span>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="mt-8 bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800 px-6 py-14 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center">
            <Heart className="w-7 h-7 text-indigo-500" />
          </div>
          <h2 className="mt-5 text-lg font-black text-stone-900 dark:text-white">Your wishlist is empty</h2>
          <p className="mt-2 max-w-sm text-sm text-stone-500 dark:text-stone-400">
            Start saving the products you love. Tap the heart on a product to add it here.
          </p>
          <button
            onClick={() => setPage('shop')}
            className="mt-7 inline-flex items-center gap-2 py-3.5 px-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black uppercase tracking-wider shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
          >
            <ShoppingBag className="w-4 h-4" /> Start Shopping
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {wishlist.map(renderEntry)}
        </div>
      )}
    </div>
  );
};