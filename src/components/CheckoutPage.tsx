import React, { useRef, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { CustomerDetails, Order, CartItem } from '../types';
import { ShieldCheck, Truck, ArrowLeft, Tag, Check, CreditCard, Banknote, Smartphone, AlertCircle, MapPin, Clock } from 'lucide-react';
import { ProductVisual } from './ProductVisual';
import { PRODUCTS_CONFIG } from '../data/products';
import { PaymentPanel } from './PaymentPanel';
import { validateVoucher } from '../service/api';

// Shipping methods na available sa checkout. Ang Standard ay sumusunod sa
// umiiral na rule (FREE kapag PHP 2,500+), habang ang Express ay flat rate.
const SHIPPING_METHODS = [
  { id: 'Standard', eta: '3–7 business days', desc: 'Doorstep delivery nationwide — FREE over ₱2,500' },
  { id: 'Express', eta: '1–3 business days', desc: 'Priority handling at a flat ₱249 rate' }
] as const;

// Availability check laban sa katalogo. Ang item ay itinuturing na unavailable
// kung wala na sa catalog o wala na ang napiling kulay/size doon.
const checkCatalogAvailability = (item: CartItem): { found: boolean; sizeOk: boolean } => {
  const gender = item.gender;
  const sub = item.subCategory || '';
  if (!gender || !sub) return { found: true, sizeOk: true };
  const color = (item.color || '').toLowerCase();
  for (const cat of Object.keys(PRODUCTS_CONFIG)) {
    const genderCfg = PRODUCTS_CONFIG[cat]?.[gender];
    if (!genderCfg) continue;
    const products = genderCfg.products?.[sub];
    const sizes = genderCfg.sizes?.[sub];
    if (!products) continue;
    const match = products.find(p => (p.colorName || '').toLowerCase() === color);
    if (match) {
      return { found: true, sizeOk: sizes ? sizes.includes(item.size || '') : true };
    }
  }
  return { found: false, sizeOk: false };
};

export const CheckoutPage: React.FC = () => {
  const { cart, createOrder, setPage, showToast, customerInfo, saveCustomerInfo, checkoutItems, getStock } = useStore();

  // Items na bibilhin: ang napili sa Cart (partial checkout), o ang buong cart.
  const items = checkoutItems.length > 0 ? checkoutItems : cart;

  const [customer, setCustomer] = useState<CustomerDetails>({
    name: customerInfo?.name || '',
    email: customerInfo?.email || '',
    phone: customerInfo?.phone || '',
    address: customerInfo?.address || ''
  });

  const [addressSource, setAddressSource] = useState<'saved' | 'new'>(customerInfo?.address ? 'saved' : 'new');

  const [discountCode, setDiscountCode] = useState('');
  const [appliedCode, setAppliedCode] = useState('');
  const [discountError, setDiscountError] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountInfo, setDiscountInfo] = useState('');
  const [discountLoading, setDiscountLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [shippingMethod, setShippingMethod] = useState<'Standard' | 'Express'>('Standard');
  const [isProcessing, setIsProcessing] = useState(false);
  const submittingRef = useRef(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const savedAddress = customerInfo?.address
    ? {
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        address: customerInfo.address,
      }
    : null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = shippingMethod === 'Express' ? 249 : subtotal > 2500 ? 0 : 150;
  const selectedEta = SHIPPING_METHODS.find(m => m.id === shippingMethod)?.eta || '3–7 business days';

  const total = Math.max(0, subtotal - discountAmount + shipping);

  // May voucher ba na ibinago ang subtotal? I-revalidate lang kung nagbago.
  const handleApplyDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = discountCode.trim().toUpperCase();
    if (!clean) return;
    if (discountLoading) return;

    setDiscountLoading(true);
    setDiscountError('');
    try {
      const result = await validateVoucher(clean, subtotal);
      if (result.valid && result.discountAmount && result.discountAmount > 0) {
        setAppliedCode(clean);
        setDiscountAmount(result.discountAmount);
        setDiscountInfo(result.description || `${result.value}${result.type === 'percent' ? '%' : ' PHP'} off`);
        showToast(`Voucher '${clean}' applied — save ₱${result.discountAmount}!`, 'success');
      } else {
        setDiscountError(result.error || 'This voucher cannot be applied to your order.');
      }
    } catch {
      setDiscountError('Could not check voucher. Please try again.');
    } finally {
      setDiscountLoading(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedCode('');
    setDiscountCode('');
    setDiscountError('');
    setDiscountAmount(0);
    setDiscountInfo('');
    showToast('Promo code removed', 'info');
  };

  const useSaved = () => {
    if (!savedAddress) return;
    setCustomer(savedAddress);
    setAddressSource('saved');
  };

  const useNew = () => {
    setAddressSource('new');
  };

  const paymentLabel = () => {
    const labels: Record<string, string> = {
      'Cash on Delivery': 'Cash on Delivery (COD)',
      'GCash': 'GCash e-Wallet',
      'Maya': 'Maya e-Wallet',
      'Credit / Debit Card': 'Credit / Debit Card',
    };
    return labels[paymentMethod] || paymentMethod;
  };

  // ✅ Validate bago mag-submit (walang fake na order)
  const validateCheckout = (): string | null => {
    if (items.length === 0) {
      return 'Your cart is empty. Add items before checking out.';
    }

    for (const item of items) {
      if (!Number.isInteger(item.qty) || item.qty < 1) {
        return `"${item.name}" has an invalid quantity. Review your cart before checking out.`;
      }
    }

    for (const item of items) {
      const availability = checkCatalogAvailability(item);
      if (!availability.found) {
        return `"${item.name}" is no longer available. Remove it and try again.`;
      }
      if (!availability.sizeOk) {
        return `The selected size (${item.size || 'Standard'}) for "${item.name}" is no longer available.`;
      }
      const stk = getStock(item.id);
      if (stk <= 0) {
        return `"${item.name}" is currently out of stock. Please remove it from your cart.`;
      }
      if (item.qty > stk) {
        return `Only ${stk} unit${stk === 1 ? '' : 's'} of "${item.name}" is available. Please reduce the quantity.`;
      }
    }

    if (!customer.name.trim()) {
      return 'Please enter your full name.';
    }
    if (!customer.email.trim() || !customer.email.includes('@')) {
      return 'Please enter a valid email address.';
    }
    if (!customer.phone.trim() || customer.phone.replace(/\D/g, '').length < 10) {
      return 'Please enter a valid mobile number.';
    }
    if (!customer.address.trim()) {
      return 'Please enter your complete delivery address.';
    }
    return null;
  };

  // ✅ FIX: Properly await the async createOrder function + unique-submit guard
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate submission mula sa repeated clicks habang nagse-save.
    if (submittingRef.current || isProcessing) return;

    const validationMessage = validateCheckout();
    if (validationMessage) {
      showToast(validationMessage, 'warning');
      return;
    }

    submittingRef.current = true;
    setIsProcessing(true);

    try {
      // ✅ AWAIT ang createOrder (ipapasa ang napiling items + shipping)
      const order = await createOrder(
        customer,
        appliedCode,
        paymentMethod,
        items,
        shippingMethod,
        shipping,
        selectedEta
      );

      if (order) {
        setCompletedOrder(order);
        showToast(`Order ${order.orderId} placed successfully!`, 'success');
        // ✅ Purhased items lang ang inaalis sa cart (partial checkout)
      } else {
        showToast('Failed to place order. Please try again.', 'warning');
      }
    } catch (error) {
      console.error('Order placement error:', error);
      showToast('An error occurred. Please try again.', 'warning');
    } finally {
      submittingRef.current = false;
      setIsProcessing(false);
    }
  };

  // Kong confirmed na ang order (sa totoong backend), ipakita ang confirmation.
  if (completedOrder) {
    const isCod = completedOrder.payment === 'Cash on Delivery';
    return (
      <div className="w-full max-w-[750px] mx-auto px-4 py-10 animate-fadeIn">
        <div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-6 sm:p-10 space-y-6">

          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center text-3xl">
              <Check className="w-8 h-8" />
            </div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600">
              Order Confirmed
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
              <span className="text-stone-500">Shipping:</span>
              <span className="font-bold text-stone-900 dark:text-white">
                {completedOrder.shippingMethod || 'Standard'}
                {completedOrder.eta ? ` • ${completedOrder.eta}` : ''}
              </span>
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

          {/* Honest payment status — hindi nagfa-claim ng bayad na hindi pa nangyayari */}
          {isCod ? (
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 text-xs">
              <p className="font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5 text-stone-500" /> Payment: Pay ₱{completedOrder.total.toLocaleString()} when your parcel arrives
              </p>
            </div>
          ) : (
            <PaymentPanel order={completedOrder} />
          )}

          {/* Purchased Items List */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-stone-500">Purchased Items</h4>
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {completedOrder.items.map((item, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-3 min-w-0">
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
                    <div className="min-w-0">
                      <p className="font-bold text-stone-900 dark:text-white truncate">{item.name}</p>
                      <p className="text-stone-400">
                        Size: {item.size || 'Standard'}
                        {item.color ? ` • ${item.color}` : ''} • Qty: {item.qty}
                      </p>
                    </div>
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
              <span>Order Total:</span>
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

  if (items.length === 0) {
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

  const inputCls = (disabled?: boolean) =>
    `w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900 dark:text-white ${
      disabled ? 'opacity-60 cursor-not-allowed' : ''
    }`;

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
          <span>Secure Checkout</span>
        </div>
      </div>

      {/* Grid: Details on Left, Order Summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Form: Delivery, Shipping and Payment */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-8">

          {/* Delivery Address Box */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-5">
            <h2 className="text-lg font-bold font-serif text-stone-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-stone-900 text-white dark:bg-indigo-500 dark:text-white text-xs font-bold flex items-center justify-center">1</span>
              Delivery Address
            </h2>

            {/* Select existing saved address OR add a new one */}
            {savedAddress && (
              <div className="space-y-2">
                <div
                  onClick={useSaved}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    addressSource === 'saved'
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 ring-1 ring-indigo-500'
                      : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="addressSource"
                    checked={addressSource === 'saved'}
                    onChange={useSaved}
                    className="mt-1 text-indigo-500 focus:ring-indigo-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" /> Use my saved address
                    </p>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-0.5">
                      {savedAddress.name} • {savedAddress.phone}
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                      {savedAddress.address}
                    </p>
                  </div>
                </div>

                <div
                  onClick={useNew}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    addressSource === 'new'
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 ring-1 ring-indigo-500'
                      : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="addressSource"
                    checked={addressSource === 'new'}
                    onChange={useNew}
                    className="mt-1 text-indigo-500 focus:ring-indigo-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-stone-900 dark:text-white">Deliver to a new address</p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                      Enter contact name, phone number, and the complete delivery address below.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  Contact Name *
                </label>
                <input
                  type="text"
                  required
                  disabled={addressSource === 'saved'}
                  placeholder="e.g. Juan Dela Cruz"
                  value={customer.name}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCustomer({ ...customer, name: v });
                    if (addressSource === 'new') saveCustomerInfo({ name: v });
                  }}
                  className={inputCls(addressSource === 'saved')}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  disabled={addressSource === 'saved'}
                  placeholder="juan@example.com"
                  value={customer.email}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCustomer({ ...customer, email: v });
                    if (addressSource === 'new') saveCustomerInfo({ email: v });
                  }}
                  className={inputCls(addressSource === 'saved')}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  disabled={addressSource === 'saved'}
                  placeholder="0917 123 4567"
                  value={customer.phone}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCustomer({ ...customer, phone: v });
                    if (addressSource === 'new') saveCustomerInfo({ phone: v });
                  }}
                  className={inputCls(addressSource === 'saved')}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  Complete Delivery Address *
                </label>
                <textarea
                  required
                  rows={3}
                  disabled={addressSource === 'saved'}
                  placeholder="House/Unit No., Street, Barangay, City, Province, Postal Code"
                  value={customer.address}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCustomer({ ...customer, address: v });
                    if (addressSource === 'new') saveCustomerInfo({ address: v });
                  }}
                  className={inputCls(addressSource === 'saved')}
                />
              </div>
            </div>
          </div>

          {/* Shipping Method Box */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <h2 className="text-lg font-bold font-serif text-stone-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-stone-900 text-white dark:bg-indigo-500 dark:text-white text-xs font-bold flex items-center justify-center">2</span>
              Shipping Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SHIPPING_METHODS.map((method) => {
                const isSelected = shippingMethod === method.id;
                const fee = method.id === 'Express' ? 249 : subtotal > 2500 ? 0 : 150;
                return (
                  <div
                    key={method.id}
                    onClick={() => setShippingMethod(method.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 ring-1 ring-indigo-500'
                        : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="shippingMethod"
                      checked={isSelected}
                      onChange={() => setShippingMethod(method.id)}
                      className="mt-1 text-indigo-500 focus:ring-indigo-500"
                    />
                    <div>
                      <p className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        {method.id} Delivery
                      </p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">{method.desc}</p>
                      <p className="text-[11px] font-bold text-stone-700 dark:text-stone-300 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> ETA: {method.eta}
                      </p>
                      <p className="text-[11px] font-black text-stone-900 dark:text-white mt-1">
                        {fee === 0 ? <b className="text-emerald-600 font-bold">FREE</b> : `₱${fee.toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Method Box */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <h2 className="text-lg font-bold font-serif text-stone-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-stone-900 text-white dark:bg-indigo-500 dark:text-white text-xs font-bold flex items-center justify-center">3</span>
              Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'Cash on Delivery', label: 'Cash on Delivery (COD)', icon: Banknote, desc: 'Pay cash when your parcel arrives' },
                { id: 'GCash', label: 'GCash e-Wallet', icon: Smartphone, desc: 'Wallet payment (settled around delivery)' },
                { id: 'Maya', label: 'Maya e-Wallet', icon: Smartphone, desc: 'Wallet payment (settled around delivery)' },
                { id: 'Credit / Debit Card', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Card payment (settled around delivery)' }
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

            {/* Honest note: walang online gateway na nakakonekta */}
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-stone-400" />
              <span>
                {paymentMethod === 'Cash on Delivery'
                  ? 'You pay cash when your parcel arrives. This checkout only records your order — it does not charge anything now.'
                  : `No online gateway is connected, so selecting ${paymentLabel()} only records your order — it will not charge your wallet or card. Payment is settled around delivery.`}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-black text-base uppercase tracking-wider rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Placing Order...
              </>
            ) : (
              `Place Order • ₱${total.toLocaleString()}`
            )}
          </button>

        </form>

        {/* Right Summary Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl space-y-6">

            <h2 className="text-lg font-bold font-serif text-stone-900 dark:text-white pb-3 border-b border-stone-200 dark:border-stone-800">
              Order Summary ({items.length} Items)
            </h2>

            {/* Items scroll area */}
            <div className="max-h-60 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800 pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-3 min-w-0">
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
                    <div className="min-w-0">
                      <p className="font-bold text-stone-900 dark:text-white truncate max-w-[160px]">{item.name}</p>
                      <p className="text-stone-400">
                        {item.size ? `Size: ${item.size}` : 'Standard'}
                        {item.color ? ` • ${item.color}` : ''} • Qty: {item.qty}
                      </p>
                      <p className="text-stone-400 mt-0.5">₱{item.price.toLocaleString()} each</p>
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
                      disabled={discountLoading}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:text-white rounded-xl text-xs font-bold transition-all shadow disabled:opacity-50"
                    >
                      {discountLoading ? 'Checking…' : 'Apply'}
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
                    <Check className="w-3 h-3" /> Applied {appliedCode}{discountInfo ? ` — ${discountInfo}` : ''} (save ₱{discountAmount.toLocaleString()})
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
                <span>{shippingMethod} Delivery {shippingMethod === 'Express' ? '(₱249)' : subtotal > 2500 ? '(FREE)' : '(₱150)'}</span>
                <span>{shipping === 0 ? <b className="text-emerald-500 uppercase font-bold">FREE</b> : `₱${shipping.toLocaleString()}`}</span>
              </div>

              <div className="flex justify-between text-[11px] text-stone-400">
                <span>Estimated delivery</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {selectedEta}</span>
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