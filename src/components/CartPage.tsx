import React from 'react';
import { useStore } from '../context/StoreContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, ShieldCheck } from 'lucide-react';
import { ProductVisual } from './ProductVisual';

export const CartPage: React.FC = () => {
  const { cart, updateCartQty, removeFromCart, clearCart, setPage } = useStore();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const freeShippingThreshold = 2500;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const shippingFee = cart.length === 0 ? 0 : isFreeShipping ? 0 : 150;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const total = subtotal + shippingFee;

  if (cart.length === 0) {
    return (
      <div className="w-full max-w-[800px] mx-auto px-4 py-16 text-center space-y-6 animate-fadeIn">
        <div className="w-24 h-24 mx-auto rounded-3xl bg-amber-100 text-amber-600 dark:bg-stone-800 dark:text-amber-400 flex items-center justify-center text-4xl shadow-inner">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold font-serif text-stone-900 dark:text-white">
            Your Cart is Empty
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
            Looks like you haven't added anything to your cart yet. Discover our latest collections and find your signature style.
          </p>
        </div>
        <button
          onClick={() => setPage('shop')}
          className="px-8 py-4 bg-stone-900 hover:bg-stone-800 text-white dark:bg-amber-400 dark:text-stone-950 font-bold text-sm uppercase tracking-wider rounded-full transition-all shadow-xl hover:scale-105"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-stone-800">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-[0.25em] text-amber-600">
            Review Bag
          </span>
          <h1 className="text-3xl sm:text-4xl font-black font-serif text-stone-900 dark:text-white">
            Shopping Cart ({cart.reduce((t, i) => t + i.qty, 0)} Items)
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Trash2 className="w-4 h-4" />
          Clear Entire Cart
        </button>
      </div>

      {/* Main Grid: Cart Items on Left, Summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Items Column */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Free Shipping Meter */}
          <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-2 text-stone-800 dark:text-stone-200">
                <Truck className="w-4 h-4 text-amber-500" />
                {isFreeShipping ? 'You unlocked FREE Nationwide Shipping!' : `Add ₱${amountToFreeShipping.toLocaleString()} more for FREE shipping`}
              </span>
              <span className="text-stone-500">{Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%</span>
            </div>
            <div className="w-full h-2 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-500"
                style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="space-y-4">
            {cart.map((item, idx) => (
              <div
                key={`${item.id}-${item.size}-${idx}`}
                className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition-all hover:shadow-md"
              >
                {/* Image & Info */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-20 h-20 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center p-2 shrink-0">
                    <ProductVisual
                      category={item.gender ? 'clothes' : 'clothes'}
                      subCategory={item.subCategory || 'tshirt'}
                      colorName={item.color || 'Standard'}
                      bgColor="#2A3459"
                      name={item.name}
                      image={item.image}
                      className="w-16 h-16 object-contain"
                    />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-extrabold text-base text-stone-900 dark:text-white font-serif">
                      {item.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                      {item.size && (
                        <span className="px-2.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 font-semibold text-stone-700 dark:text-stone-300">
                          Size: {item.size}
                        </span>
                      )}
                      {item.color && (
                        <span className="px-2.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 font-semibold text-stone-700 dark:text-stone-300">
                          {item.color}
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-sm text-stone-900 dark:text-white">
                      ₱{item.price.toLocaleString()} each
                    </p>
                  </div>
                </div>

                {/* Controls: Qty Buttons & Total Price */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-stone-100 dark:border-stone-800">
                  
                  {/* Qty +/- Buttons */}
                  <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 rounded-xl p-1">
                    <button
                      onClick={() => updateCartQty(item.id, item.size, -1)}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-stone-700 hover:bg-stone-200 text-stone-800 dark:text-white flex items-center justify-center transition-colors shadow-sm"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-black text-stone-900 dark:text-white">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateCartQty(item.id, item.size, 1)}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-stone-700 hover:bg-stone-200 text-stone-800 dark:text-white flex items-center justify-center transition-colors shadow-sm"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right min-w-[90px]">
                    <p className="text-xs text-stone-400">Total</p>
                    <p className="text-base font-black text-stone-900 dark:text-white font-serif">
                      ₱{(item.price * item.qty).toLocaleString()}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id, item.size)}
                    className="p-2 text-stone-400 hover:text-red-500 rounded-lg transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right Summary Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl space-y-6">
            
            <h2 className="text-xl font-bold font-serif text-stone-900 dark:text-white pb-4 border-b border-stone-200 dark:border-stone-800">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-stone-600 dark:text-stone-400">
                <span>Subtotal ({cart.reduce((t, i) => t + i.qty, 0)} items)</span>
                <span className="font-bold text-stone-900 dark:text-white">₱{subtotal.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-stone-600 dark:text-stone-400">
                <span>Standard Delivery</span>
                <span>{isFreeShipping ? <b className="text-emerald-500 font-bold uppercase text-xs">FREE</b> : `₱${shippingFee.toLocaleString()}`}</span>
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-baseline justify-between">
                <span className="text-base font-extrabold text-stone-900 dark:text-white">Estimated Total</span>
                <span className="text-2xl font-black font-serif text-stone-900 dark:text-amber-400">
                  ₱{total.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              id="proceedToCheckoutBtn"
              onClick={() => setPage('checkout')}
              className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-xl shadow-amber-400/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="space-y-3 pt-2 text-xs text-stone-500 dark:text-stone-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Protected SSL Checkout & Money-back Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-500" />
                <span>Dispatched within 24–48 hours across the Philippines</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
