import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { CustomerDetails, Order } from '../types';
import { ShieldCheck, Truck, ArrowLeft, Tag, Check, CreditCard, Banknote, Smartphone, AlertCircle } from 'lucide-react';
import { ProductVisual } from './ProductVisual';

export const CheckoutPage: React.FC = () => {
  const { cart, createOrder, setPage, showToast } = useStore();

  const [customer, setCustomer] = useState<CustomerDetails>({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const [discountCode, setDiscountCode] = useState('');
  const [appliedCode, setAppliedCode] = useState('');
  const [discountError, setDiscountError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal > 2500 ? 0 : 150;

  // Discount calculation
  let discountPercent = 0;
  if (appliedCode === 'PWD' || appliedCode === 'SENIOR') {
    discountPercent = 0.20;
  } else if (appliedCode === 'WELCOME10') {
    discountPercent = 0.10;
  }

  const discountAmount = Math.round(subtotal * discountPercent);
  const total = Math.max(0, subtotal - discountAmount + shipping);

  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = discountCode.trim().toUpperCase();
    if (!clean) return;

    if (clean === 'PWD' || clean === 'SENIOR' || clean === 'WELCOME10') {
      setAppliedCode(clean);
      setDiscountError('');
      showToast(`Promo code '${clean}' applied successfully!`, 'success');
    } else {
      setDiscountError('Invalid promo code. Try PWD, SENIOR, or WELCOME10.');
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedCode('');
    setDiscountCode('');
    setDiscountError('');
    showToast('Promo code removed', 'info');
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customer.name.trim()) {
      showToast('Please enter your full name', 'warning');
      return;
    }
    if (!customer.email.trim() || !customer.email.includes('@')) {
      showToast('Please enter a valid email address', 'warning');
      return;
    }
    if (!customer.phone.trim() || customer.phone.length < 8) {
      showToast('Please enter a valid contact number', 'warning');
      return;
    }
    if (!customer.address.trim()) {
      showToast('Please enter your complete delivery address', 'warning');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const order = createOrder(customer, appliedCode, paymentMethod);
      setIsProcessing(false);
      if (order) {
        setCompletedOrder(order);
        showToast(`Order ${order.orderId} placed successfully!`, 'success');
        // ✅ Hindi na nag-c-clear ang cart
      }
    }, 800);
  };

  // If order was just placed, show the beautiful instant receipt confirmation
  if (completedOrder) {
    return (
      <div className="w-full max-w-[750px] mx-auto px-4 py-10 animate-fadeIn">
        <div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-6 sm:p-10 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center text-3xl">
              <Check className="w-8 h-8" />
            </div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600">
              Payment Confirmed
            </span>
            <h2 className="text-3xl font-black font-serif text-stone-900 dark:text-white">
              Thank You for Your Order!
            </h2>
            <p className="text-xs text-stone-500">
              Order Ref: <b className="text-stone-900 dark:text-indigo-400 font-mono text-sm">{completedOrder.orderId}</b>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-stone-500">Recipient:</span>
              <span className="font-bold text-stone-900 dark:text-white">{completedOrder.customer.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Delivery Address:</span>
              <span className="font-bold text-stone-900 dark:text-white text-right max-w-xs truncate">{completedOrder.customer.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Payment Method:</span>
              <span className="font-bold text-stone-900 dark:text-white">{completedOrder.payment}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Date:</span>
              <span className="font-bold text-stone-900 dark:text-white">{completedOrder.date}</span>
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-stone-500">Purchased Items</h4>
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {completedOrder.items.map((item, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-stone-900 dark:text-white">{item.name}</p>
                    <p className="text-stone-400">Size: {item.size || 'Standard'} • Qty: {item.qty}</p>
                  </div>
                  <p className="font-bold text-stone-900 dark:text-white font-serif">₱{(item.price * item.qty).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Totals */}
          <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-1.5 text-xs">
            <div className="flex justify-between text-stone-500">
              <span>Subtotal:</span>
              <span>₱{completedOrder.subtotal.toLocaleString()}</span>
            </div>
            {completedOrder.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount ({completedOrder.discountCode}):</span>
                <span>-₱{completedOrder.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-500">
              <span>Shipping:</span>
              <span>{completedOrder.shipping === 0 ? 'FREE' : `₱${completedOrder.shipping.toLocaleString()}`}</span>
            </div>
            <div className="flex justify-between text-base font-black text-stone-900 dark:text-indigo-500 pt-2 border-t border-stone-200 dark:border-stone-800">
              <span>Total Paid:</span>
              <span>₱{completedOrder.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setPage('orders')}
              className="flex-1 py-3 bg-stone-900 hover:bg-stone-800 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all text-center"
            >
              View in My Orders
            </button>
            <button
              onClick={() => setPage('shop')}
              className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all text-center"
            >
              Continue Shopping
            </button>
          </div>

        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-[700px] mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold">No items in your cart to checkout</h2>
        <button
          onClick={() => setPage('shop')}
          className="px-6 py-3 bg-stone-900 text-white rounded-full font-bold text-sm"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-stone-200 dark:border-stone-800">
        <div className="space-y-1">
          <button
            onClick={() => setPage('cart')}
            className="text-xs font-bold text-stone-500 hover:text-stone-900 dark:hover:text-white flex items-center gap-1 mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
          </button>
          <h1 className="text-3xl sm:text-4xl font-black font-serif text-stone-900 dark:text-white">
            Secure Checkout
          </h1>
        </div>
        <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="w-4 h-4" />
          <span>Encrypted Transaction</span>
        </div>
      </div>

      {/* Grid: Details on Left, Order Summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form: Delivery and Payment */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-8">
          
          {/* Customer Details Box */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-5">
            <h2 className="text-lg font-bold font-serif text-stone-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-stone-900 text-white dark:bg-indigo-500 dark:text-white text-xs font-bold flex items-center justify-center">1</span>
              Delivery Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Juan Dela Cruz"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="juan@example.com"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0917 123 4567"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  Complete Delivery Address *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="House/Unit No., Street, Barangay, City, Province, Postal Code"
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Box */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <h2 className="text-lg font-bold font-serif text-stone-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-stone-900 text-white dark:bg-indigo-500 dark:text-white text-xs font-bold flex items-center justify-center">2</span>
              Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'Cash on Delivery', label: 'Cash on Delivery (COD)', icon: Banknote, desc: 'Pay cash when your parcel arrives' },
                { id: 'GCash', label: 'GCash e-Wallet', icon: Smartphone, desc: 'Instant QR / Mobile Wallet' },
                { id: 'Maya', label: 'Maya e-Wallet', icon: Smartphone, desc: 'Direct wallet payment' },
                { id: 'Credit / Debit Card', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa & Mastercard supported' }
              ].map((method) => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.id;
                return (
                  <div
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 ring-1 ring-indigo-500'
                        : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={isSelected}
                      onChange={() => setPaymentMethod(method.id)}
                      className="mt-1 text-indigo-500 focus:ring-indigo-500"
                    />
                    <div>
                      <p className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        {method.label}
                      </p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">{method.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-black text-base uppercase tracking-wider rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95"
          >
            {isProcessing ? 'Processing Transaction...' : `Place Order • ₱${total.toLocaleString()}`}
          </button>

        </form>

        {/* Right Summary Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl space-y-6">
            
            <h2 className="text-lg font-bold font-serif text-stone-900 dark:text-white pb-3 border-b border-stone-200 dark:border-stone-800">
              Order Breakdown ({cart.length} Items)
            </h2>

            {/* Items scroll area */}
            <div className="max-h-60 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800 pr-1">
              {cart.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center p-1 shrink-0">
                      <ProductVisual
                        category="clothes"
                        subCategory={item.subCategory || 'tshirt'}
                        colorName={item.color || 'White'}
                        bgColor="#2A3459"
                        name={item.name}
                        image={item.image}
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-stone-900 dark:text-white truncate max-w-[170px]">{item.name}</p>
                      <p className="text-stone-400">Qty: {item.qty} • Size: {item.size || 'M'}</p>
                    </div>
                  </div>
                  <span className="font-bold text-stone-900 dark:text-white font-serif">₱{(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Promo Code Box */}
            <div className="pt-2">
              <form onSubmit={handleApplyDiscount} className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> Promo / Discount Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. PWD, SENIOR, WELCOME10"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    disabled={!!appliedCode}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900 dark:text-white"
                  />
                  {appliedCode ? (
                    <button
                      type="button"
                      onClick={handleRemoveDiscount}
                      className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-xs font-bold"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:text-white rounded-xl text-xs font-bold transition-all shadow"
                    >
                      Apply
                    </button>
                  )}
                </div>
                {discountError && (
                  <p className="text-[11px] text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {discountError}
                  </p>
                )}
                {appliedCode && (
                  <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Applied {appliedCode} ({discountPercent * 100}% Discount)
                  </p>
                )}
              </form>
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600 dark:text-stone-400">
                <span>Subtotal</span>
                <span className="font-bold text-stone-900 dark:text-white">₱{subtotal.toLocaleString()}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount ({appliedCode})</span>
                  <span>-₱{discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600 dark:text-stone-400">
                <span>Shipping Delivery</span>
                <span>{shipping === 0 ? <b className="text-emerald-500 uppercase font-bold">FREE</b> : `₱${shipping.toLocaleString()}`}</span>
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-between items-baseline">
                <span className="text-base font-extrabold text-stone-900 dark:text-white">Total Amount</span>
                <span className="text-2xl font-black font-serif text-indigo-500">
                  ₱{total.toLocaleString()}
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};