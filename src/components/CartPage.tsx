import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Trash2, Plus, Minus, ShoppingBag, Truck, ShieldCheck, ShoppingCart, Check, X, ArrowLeft } from 'lucide-react';
import { ProductVisual } from './ProductVisual';

export const CartPage: React.FC = () => {
  const { cart, updateCartQty, removeFromCart, clearCart, setPage, lastCategoryPage, subCategory, gender } = useStore();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const freeShippingThreshold = 2500;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const toggleSelectItem = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const selectAllItems = () => {
    if (selectedItems.size === cart.length) {
      setSelectedItems(new Set());
    } else {
      const allIds = new Set(cart.map((_, idx) => `item-${idx}`));
      setSelectedItems(allIds);
    }
  };

  const getSelectedItems = () => {
    return cart.filter((_, idx) => selectedItems.has(`item-${idx}`));
  };

  const selectedSubtotal = getSelectedItems().reduce((sum, item) => sum + item.price * item.qty, 0);
  const selectedShipping = selectedSubtotal > freeShippingThreshold ? 0 : 150;
  const selectedTotal = selectedSubtotal + selectedShipping;

  const handlePlaceOrder = () => {
    const selected = getSelectedItems();
    if (selected.length === 0) return;
    setPage('checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="w-full max-w-[800px] mx-auto px-4 py-16 text-center space-y-6 animate-fadeIn">
        <div className="w-24 h-24 mx-auto rounded-3xl bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-600 flex items-center justify-center text-4xl shadow-inner">
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
          className="px-8 py-4 bg-stone-900 hover:bg-stone-800 text-white dark:bg-white dark:text-stone-950 font-bold text-sm uppercase tracking-wider rounded-full transition-all shadow-xl hover:scale-105"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  const selectedCount = selectedItems.size;

  return (
    <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Back to Shopping */}
      <div>
        <button
          onClick={() => setPage(lastCategoryPage, subCategory, gender)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:scale-105 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </button>
      </div>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-stone-800">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-[0.25em] text-stone-500 dark:text-stone-400">
            Review Bag
          </span>
          <h1 className="text-3xl sm:text-4xl font-black font-serif text-stone-900 dark:text-white">
            Shopping Cart ({cart.reduce((t, i) => t + i.qty, 0)} Items)
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Select the items you want to order
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* ✅ SELECT ALL - May bg indigo at white text */}
          <button
            onClick={selectAllItems}
            className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-md shadow-indigo-600/20"
          >
            {selectedItems.size === cart.length ? 'Deselect All' : 'Select All'}
          </button>
          
          {/* ✅ TINANGGAL NA YUNG CLEAR CART DITO */}
        </div>
      </div>

      {/* Main Grid: Cart Items on Left, Summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Items Column */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Free Shipping Meter */}
          <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-2 text-stone-800 dark:text-stone-200">
                <Truck className="w-4 h-4 text-indigo-500" />
                {isFreeShipping ? 'You unlocked FREE Nationwide Shipping!' : `Add ₱${amountToFreeShipping.toLocaleString()} more for FREE shipping`}
              </span>
              <span className="text-stone-500">{Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%</span>
            </div>
            <div className="w-full h-2 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="space-y-3">
            {cart.map((item, idx) => {
              const itemId = `item-${idx}`;
              const isSelected = selectedItems.has(itemId);
              
              return (
                <div
                  key={itemId}
                  onClick={() => toggleSelectItem(itemId)}
                  className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer select-none ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20' 
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900'
                  }`}
                >
                  <div className="flex items-start gap-4 flex-wrap">
                    {/* Selection Checkbox */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSelectItem(itemId); }}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 mt-2 ${
                        isSelected 
                          ? 'bg-indigo-500 border-indigo-500 text-white' 
                          : 'border-stone-300 dark:border-stone-600 hover:border-indigo-400'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4" />}
                    </button>

                    {/* Image */}
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

                    {/* Info */}
                    <div className="flex-1 min-w-0">
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
                      <p className="font-bold text-sm text-stone-900 dark:text-white mt-1">
                        ₱{item.price.toLocaleString()} each
                      </p>
                    </div>

                    {/* Qty Controls */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 sm:gap-2 w-full sm:w-auto order-last">
                      <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 rounded-xl p-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); updateCartQty(item.id, item.size, -1); }}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-stone-700 hover:bg-stone-200 text-stone-800 dark:text-white flex items-center justify-center transition-colors shadow-sm"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-black text-stone-900 dark:text-white">
                          {item.qty}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); updateCartQty(item.id, item.size, 1); }}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-stone-700 hover:bg-stone-200 text-stone-800 dark:text-white flex items-center justify-center transition-colors shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-stone-400">Total</p>
                        <p className="text-sm font-black text-stone-900 dark:text-white font-serif">
                          ₱{(item.price * item.qty).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFromCart(item.id, item.size); }}
                        className="text-stone-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-stone-500 dark:text-stone-400 text-center">
            {selectedCount} of {cart.length} items selected
          </p>

        </div>

        {/* Right Summary Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl space-y-6 sticky top-24">
            
            <h2 className="text-xl font-bold font-serif text-stone-900 dark:text-white pb-4 border-b border-stone-200 dark:border-stone-800">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-stone-600 dark:text-stone-400">
                <span>Selected Items</span>
                <span className="font-bold text-stone-900 dark:text-white">{selectedCount} items</span>
              </div>
              <div className="flex items-center justify-between text-stone-600 dark:text-stone-400">
                <span>Subtotal</span>
                <span className="font-bold text-stone-900 dark:text-white">₱{selectedSubtotal.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-stone-600 dark:text-stone-400">
                <span>Standard Delivery</span>
                <span>{selectedSubtotal > freeShippingThreshold ? <b className="text-emerald-500 font-bold uppercase text-xs">FREE</b> : `₱150`}</span>
              </div>

              {selectedCount > 0 && (
                <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-baseline justify-between">
                  <span className="text-base font-extrabold text-stone-900 dark:text-white">Estimated Total</span>
                  <span className="text-2xl font-black font-serif text-indigo-500">
                    ₱{selectedTotal.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Place Order Button - Only enabled when items are selected */}
            <button
              id="placeOrderBtn"
              onClick={handlePlaceOrder}
              disabled={selectedCount === 0}
              className={`w-full py-4 font-black text-sm uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 ${
                selectedCount > 0
                  ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95'
                  : 'bg-stone-200 dark:bg-stone-700 text-stone-400 dark:text-stone-500 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Place Order ({selectedCount} items)</span>
            </button>

            {selectedCount === 0 && (
              <p className="text-xs text-amber-500 text-center">Select at least one item to place order</p>
            )}

            <div className="space-y-3 pt-2 text-xs text-stone-500 dark:text-stone-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Protected SSL Checkout & Money-back Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-500" />
                <span>Dispatched within 24–48 hours across the Philippines</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};