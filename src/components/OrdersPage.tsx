import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Package, ShoppingBag, ArrowRight, Truck, CheckCircle2, 
  Star, XCircle, MapPin, User,
  CreditCard, AlertCircle, Send, Edit2, Trash2, Store, 
  RefreshCcw, Box, Banknote, Undo2, BadgeCheck,
  ChevronDown, Loader2, RefreshCw
} from 'lucide-react';
import { ProductVisual } from './ProductVisual';
import { PaymentPanel } from './PaymentPanel';
import { OrderStatus, Order } from '../types';
import { API_SERVER_URL, fetchOrderTracking, OrderTrackingEntry, authHeaders } from '../service/api';

const SERVER_URL = API_SERVER_URL;

// Order status config — buong order lifecycle
type StatusConfig = {
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  step: number;
  description: string;
};

const statusConfigs: Record<OrderStatus | 'All', StatusConfig> = {
  'All': {
    label: 'All',
    icon: <Box className="w-3.5 h-3.5" />,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-950/40',
    step: 1,
    description: 'All your orders.',
  },
  'Pending': {
    label: 'Pending',
    icon: <CreditCard className="w-3.5 h-3.5" />,
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-100 dark:bg-rose-950/40',
    step: 2,
    description: 'Awaiting payment (online) or store dispatch.',
  },
  'To Ship': {
    label: 'To Ship',
    icon: <Package className="w-3.5 h-3.5" />,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-950/40',
    step: 3,
    description: 'Seller is preparing your order for shipment.',
  },
  'Shipped': {
    label: 'Shipped',
    icon: <Truck className="w-3.5 h-3.5" />,
    color: 'text-sky-600 dark:text-sky-400',
    bgColor: 'bg-sky-100 dark:bg-sky-950/40',
    step: 4,
    description: 'Your package is with the courier.',
  },
  'Out for Delivery': {
    label: 'Out for Delivery',
    icon: <Truck className="w-3.5 h-3.5" />,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-950/40',
    step: 5,
    description: 'Your package is on its way. Get ready for delivery.',
  },
  'Delivered': {
    label: 'Delivered',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-100 dark:bg-teal-950/40',
    step: 6,
    description: 'Package delivered. You may review or request a refund/return.',
  },
  'To Review': {
    label: 'To Review ⭐',
    icon: <Star className="w-3.5 h-3.5" />,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-950/40',
    step: 7,
    description: 'Share your experience with this product!',
  },
  'Completed': {
    label: 'Completed ✓',
    icon: <BadgeCheck className="w-3.5 h-3.5" />,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-950/40',
    step: 8,
    description: 'Thank you for your order and review!',
  },
  'Cancelled': {
    label: 'Cancelled',
    icon: <XCircle className="w-3.5 h-3.5" />,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-950/40',
    step: 0,
    description: 'This order has been cancelled.',
  },
  'Refund Requested': {
    label: 'Refund Requested',
    icon: <RefreshCcw className="w-3.5 h-3.5" />,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-950/40',
    step: 0,
    description: 'Your refund request is awaiting approval.',
  },
  'Refunded': {
    label: 'Refunded',
    icon: <Banknote className="w-3.5 h-3.5" />,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-950/40',
    step: 0,
    description: 'Your payment has been returned.',
  },
  'Return Requested': {
    label: 'Return Requested',
    icon: <Undo2 className="w-3.5 h-3.5" />,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-950/40',
    step: 0,
    description: 'Your return request is awaiting approval.',
  },
  'Returned': {
    label: 'Returned',
    icon: <Undo2 className="w-3.5 h-3.5" />,
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    step: 0,
    description: 'The items in this order have been returned.',
  }
};

const getStatusConfig = (status: OrderStatus | string | undefined): StatusConfig => {
  if (!status) {
    return {
      label: 'Unknown',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      step: 0,
      description: 'Status unknown'
    };
  }
  return statusConfigs[status as OrderStatus] || {
    label: status as string,
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    step: 0,
    description: 'Unknown status'
  };
};

// ✅ Online vs COD payment detection
const isOnlinePayment = (payment?: string): boolean => {
  if (!payment) return false;
  const p = payment.trim().toLowerCase();
  return p !== 'cash on delivery' && !p.includes('cod');
};

// ✅ Status Progress Bar Component (read-only visualization ng lifecycle)
type ProgressStep = OrderStatus | 'All';

const FORWARD_CHAIN: OrderStatus[] = ['Pending', 'To Ship', 'Shipped', 'Out for Delivery', 'Delivered', 'To Review', 'Completed'];
const TERMINAL_STATUSES: OrderStatus[] = ['Cancelled', 'Refund Requested', 'Refunded', 'Return Requested', 'Returned'];

const StatusProgress: React.FC<{ currentStatus: OrderStatus | string; onStepClick?: (step: ProgressStep) => void }> = ({ currentStatus, onStepClick }) => {
  const steps: ProgressStep[] = ['All', 'Pending', 'To Ship', 'Shipped', 'Out for Delivery', 'Delivered', 'To Review'];
  const config = getStatusConfig(currentStatus);
  const currentStep = config?.step || 0;

  const stepAccents: Record<'All' | 'Pending' | 'To Ship' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'To Review', { circle: string; ring: string; text: string; line: string }> = {
    All: { circle: 'bg-indigo-500', ring: 'ring-indigo-300', text: 'text-indigo-600 dark:text-indigo-400', line: 'bg-indigo-500' },
    Pending: { circle: 'bg-rose-500', ring: 'ring-rose-300', text: 'text-rose-600 dark:text-rose-400', line: 'bg-rose-500' },
    'To Ship': { circle: 'bg-amber-500', ring: 'ring-amber-300', text: 'text-amber-600 dark:text-amber-400', line: 'bg-amber-500' },
    Shipped: { circle: 'bg-sky-500', ring: 'ring-sky-300', text: 'text-sky-600 dark:text-sky-400', line: 'bg-sky-500' },
    'Out for Delivery': { circle: 'bg-blue-500', ring: 'ring-blue-300', text: 'text-blue-600 dark:text-blue-400', line: 'bg-blue-500' },
    Delivered: { circle: 'bg-teal-500', ring: 'ring-teal-300', text: 'text-teal-600 dark:text-teal-400', line: 'bg-teal-500' },
    'To Review': { circle: 'bg-yellow-500', ring: 'ring-yellow-300', text: 'text-yellow-600 dark:text-yellow-400', line: 'bg-yellow-500' },
  };

  if (currentStatus && TERMINAL_STATUSES.includes(currentStatus as OrderStatus)) {
    const tConfig = getStatusConfig(currentStatus as OrderStatus);
    return (
      <div className="flex w-full overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 px-1">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${tConfig.bgColor} ${tConfig.color}`}>
            {tConfig.icon}
          </div>
          <div>
            <p className={`text-xs font-bold ${tConfig.color}`}>{tConfig.label}</p>
            <p className="text-[10px] text-stone-500 dark:text-stone-400">{tConfig.description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <div className="w-full overflow-x-auto no-scrollbar">
        <div className="flex items-center justify-between gap-1 min-w-[760px] sm:min-w-0">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum <= currentStep;
          const isCurrent = stepNum === currentStep;
          const stepConfig = getStatusConfig(step);
          const accent = stepAccents[step];

          return (
            <div key={step} className="flex-1 flex items-center">
              <button
                type="button"
                onClick={onStepClick ? () => onStepClick(step) : undefined}
                className={`flex flex-col items-center flex-1 ${onStepClick ? 'cursor-pointer' : ''}`}
              >
                <div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                    isActive 
                      ? isCurrent
                        ? `${accent.circle} text-white ring-2 ${accent.ring} ring-offset-1 scale-110`
                        : `${accent.circle} text-white`
                      : 'bg-stone-200 dark:bg-stone-700 text-stone-400 dark:text-stone-500'
                  }`}
                >
                  {isActive ? (
                    isCurrent ? stepConfig.icon : <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    stepNum
                  )}
                </div>
                <span className={`text-[9px] mt-1 font-semibold text-center whitespace-nowrap ${
                  isActive ? accent.text : 'text-stone-500 dark:text-stone-400'
                }`}>
                  {step === 'All' ? 'All' : step}
                </span>
              </button>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-0.5 rounded-full ${
                  isCurrent ? stepAccents[steps[idx + 1]].line : 'bg-stone-200 dark:bg-stone-700'
                }`} />
              )}
            </div>
          );
        })}
        </div>
      </div>
      <p className="text-[10px] text-stone-500 dark:text-stone-400 text-center">
        {config?.description || ''}
      </p>
    </div>
  );
};

// ✅ Delivery / Review Modal Component
const DeliveryModal: React.FC<{
  order: Order;
  onClose: () => void;
  onRate: (orderId: string, rating: number, comment: string) => void;
  onRequestRefund: (orderId: string) => void;
}> = ({ order, onClose, onRate, onRequestRefund }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) return;
    setSubmitting(true);
    onRate(order.orderId, rating, comment);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn p-4">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-stone-200 dark:border-stone-800">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <Truck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-900 dark:text-white">
                {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </p>
              <p className="text-xs text-emerald-600 font-semibold">Delivered</p>
            </div>
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400">Your Package has been delivered</p>
        </div>

        {/* Product Items */}
        <div className="p-5 space-y-3 border-b border-stone-100 dark:border-stone-800">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center p-1 shrink-0">
                <ProductVisual
                  category="clothes"
                  subCategory={item.subCategory || 'tshirt'}
                  colorName={item.color || 'White'}
                  bgColor="#2A3459"
                  name={item.name}
                  image={item.image}
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-stone-900 dark:text-white font-serif truncate">{item.name}</p>
                <p className="text-xs text-stone-400">{item.color || 'White'}, {item.size || 'M'} • x{item.qty}</p>
              </div>
              <p className="font-bold text-sm text-stone-900 dark:text-white font-serif shrink-0">
                ₱{(item.price * item.qty).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="px-5 py-3 flex items-center justify-between bg-stone-50 dark:bg-stone-800/50">
          <span className="text-sm font-medium text-stone-500">Total</span>
          <span className="text-lg font-black text-stone-900 dark:text-indigo-400 font-serif">₱{order.total.toLocaleString()}</span>
        </div>

        {/* Action Buttons */}
        <div className="p-5 space-y-3">
          <div className="flex gap-3">
            <button onClick={() => onRequestRefund(order.orderId)} className="flex-1 py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all text-center">
              <RefreshCcw className="w-3.5 h-3.5 inline mr-1" /> Request Refund
            </button>
            <button onClick={onClose} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all text-center">
              <Edit2 className="w-3.5 h-3.5 inline mr-1" /> Write Review
            </button>
          </div>

          {/* Quick Review */}
          <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900">
            <p className="text-xs font-bold text-stone-600 dark:text-stone-300 mb-2">Quick Review</p>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-all hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-stone-300 dark:text-stone-600'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-stone-500 mt-1">
              {rating === 0 && 'Tap a star to rate'}
              {rating === 1 && '😞 Poor'}
              {rating === 2 && '😕 Fair'}
              {rating === 3 && '😐 Good'}
              {rating === 4 && '😊 Very Good'}
              {rating === 5 && '🌟 Excellent!'}
            </p>
          </div>

          <textarea
            placeholder="Write your review..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 text-stone-900 dark:text-white resize-none"
          />

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Close
            </button>
            <button
              onClick={handleSubmit}
              disabled={rating === 0 || submitting}
              className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-600 disabled:bg-stone-300 dark:disabled:bg-stone-700 text-white disabled:text-stone-500 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ Tab definitions (uminom pa rin ng lumang pangalan ng tuwalina
// para mapanatili ang visual na istruktura; ang mga filter ay naka-map
// sa bagong lifecycle statuses)
type OrderTab = 'ALL' | 'TO PAY' | 'TO SHIP' | 'TO RECEIVE' | 'TO REVIEW' | 'COMPLETED';

export const OrdersPage: React.FC = () => {
  const { orders, user, setPage, showToast, cancelOrder, requestRefundOrder, requestReturnOrder, completeOrderAfterReview, loadUserOrders, refreshOrders, isLoading, ordersUpdated, syncOrdersToServer } = useStore();
  const [activeTab, setActiveTab] = useState<OrderTab>('ALL');
  const [reviewingOrder, setReviewingOrder] = useState<Order | null>(null);
  const [payingOrder, setPayingOrder] = useState<string | null>(null);
  const [localOrders, setLocalOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletedOrderIds, setDeletedOrderIds] = useState<Set<string>>(new Set());

  // ✅ Order tracking (expandable timeline) — live data mula sa backend.
  const [trackingOpenId, setTrackingOpenId] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<Record<string, any>>({});
  const [trackingLoading, setTrackingLoading] = useState<Record<string, boolean>>({});
  const [trackingError, setTrackingError] = useState<Record<string, string>>({});

  // ✅ Format ISO timestamp -> "Sep 4, 3:36 PM"
  const formatTimestamp = (iso?: string): string => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // ✅ Kino-convert ang `by` field sa madaling-maintindihang label.
  const actorLabel = (by?: string): string => {
    if (!by) return 'C-HUB Store';
    if (by === 'customer') return 'You';
    if (by === 'system' || by === 'admin') return 'C-HUB Store';
    return by;
  };

  // ✅ Kukunin ang live tracking ng isang order (may fallback sa last-synced data).
  const loadTracking = async (order: Order) => {
    const orderId = order.orderId;
    if (trackingLoading[orderId]) return;
    if (trackingData[orderId]) return;
    setTrackingLoading(prev => ({ ...prev, [orderId]: true }));
    setTrackingError(prev => ({ ...prev, [orderId]: '' }));
    try {
      const res = await fetchOrderTracking(orderId);
      setTrackingData(prev => ({ ...prev, [orderId]: res.order }));
    } catch (e: any) {
      // Fallback: gamitin ang last-synced status (hindi gumagawa ng fake data).
      setTrackingData(prev => ({
        ...prev,
        [orderId]: {
          orderId,
          status: order.status,
          statusHistory: (order.statusHistory || []).map(h => ({
            status: h.status,
            timestamp: h.timestamp || order.updatedAt || '',
          })),
          fulfillment: order.fulfillment,
          updatedAt: order.updatedAt,
        },
      }));
      setTrackingError(prev => ({ ...prev, [orderId]: 'Offline — showing last synced status.' }));
    } finally {
      setTrackingLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const toggleTracking = (order: Order) => {
    if (trackingOpenId === order.orderId) {
      setTrackingOpenId(null);
      return;
    }
    setTrackingOpenId(order.orderId);
    loadTracking(order);
  };

  // ✅ Handle stepper click: nagsisilbing order FILTER lang (hindi nagbabago
  // ng status — ang status ay binabago lamang ng backend/na-authorize na actions)
  const handleFilterClick = (step: ProgressStep) => {
    switch (step) {
      case 'All': setActiveTab('ALL'); break;
      case 'Pending': setActiveTab('TO PAY'); break;
      case 'To Ship': setActiveTab('TO SHIP'); break;
      case 'Shipped': setActiveTab('TO RECEIVE'); break;
      case 'Out for Delivery': setActiveTab('TO RECEIVE'); break;
      case 'Delivered': setActiveTab('TO RECEIVE'); break;
      case 'To Review': setActiveTab('TO REVIEW'); break;
      default: break;
    }
  };

  // ✅ SSE connection para sa real-time updates
  useEffect(() => {
    let es: EventSource | null = null;
    const serverUrl = SERVER_URL;
    
    if (!user.isLoggedIn || !user.username) {
      console.log('⏭️ Skipping SSE - user not logged in');
      return;
    }
    
    try {
      console.log('🔌 Connecting to SSE for OrdersPage...');
      es = new EventSource(`${serverUrl}/api/orders/stream/public`);
      
      es.onopen = () => {
        console.log('✅ SSE connected (OrdersPage)');
      };
      
      es.onerror = (error) => {
        console.warn('⚠️ SSE error (OrdersPage):', error);
      };
      
      es.addEventListener('order-updated', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          const { orderId, status, order } = data;
          if (!orderId) return;
          if (!user.isLoggedIn || !user.username) return;
          
          setLocalOrders(prev => {
            const exists = prev.some(o => o.orderId === orderId);
            if (order) {
              const key = `chub_orders_${user.username.toLowerCase()}`;
              if (!exists) {
                const newOrders = [order, ...prev];
                localStorage.setItem(key, JSON.stringify(newOrders));
                return newOrders;
              } else {
                const updatedOrders = prev.map(o => o.orderId === orderId ? { ...o, ...order } : o);
                localStorage.setItem(key, JSON.stringify(updatedOrders));
                return updatedOrders;
              }
            }
            if (exists) {
              const updatedOrders = prev.map(o => o.orderId === orderId ? { ...o, status: status as Order['status'] } : o);
              const key = `chub_orders_${user.username.toLowerCase()}`;
              localStorage.setItem(key, JSON.stringify(updatedOrders));
              showToast(`Order ${orderId} is now ${status}`, 'success');
              return updatedOrders;
            }
            return prev;
          });
        } catch (e) {
          console.error('❌ Bad SSE payload (OrdersPage):', e);
        }
      });
      
      es.addEventListener('new-order', (event: MessageEvent) => {
        try {
          const newOrder = JSON.parse(event.data) as Order;
          if (!user.isLoggedIn || !user.username) return;
          if (newOrder.customer?.name?.toLowerCase() === user.username.toLowerCase()) {
            setLocalOrders(prev => {
              if (prev.some(o => o.orderId === newOrder.orderId)) return prev;
              const updated = [newOrder, ...prev];
              const key = `chub_orders_${user.username.toLowerCase()}`;
              localStorage.setItem(key, JSON.stringify(updated));
              showToast(`New order ${newOrder.orderId} received!`, 'success');
              return updated;
            });
          }
        } catch (e) {
          console.error('❌ Bad new_order (OrdersPage):', e);
        }
      });
      
      es.addEventListener('order-deleted', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          const { orderId } = data;
          if (!orderId) return;
          if (!user.isLoggedIn || !user.username) return;
          setLocalOrders(prev => {
            const filtered = prev.filter(o => o.orderId !== orderId);
            const key = `chub_orders_${user.username.toLowerCase()}`;
            localStorage.setItem(key, JSON.stringify(filtered));
            return filtered;
          });
          setDeletedOrderIds(prev => new Set([...prev, orderId]));
        } catch (e) {
          console.error('❌ Bad order_deleted (OrdersPage):', e);
        }
      });
      
    } catch (e) {
      console.error('❌ Failed to setup SSE (OrdersPage):', e);
    }
    
    return () => {
      if (es) {
        es.close();
        console.log('🔌 SSE closed (OrdersPage)');
      }
    };
  }, [user.isLoggedIn, user.username]);

  // ✅ Load orders from localStorage
  useEffect(() => {
    if (user.isLoggedIn && user.username) {
      try {
        const key = `chub_orders_${user.username.toLowerCase()}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          const filtered = parsed.filter((o: Order) => !deletedOrderIds.has(o.orderId));
          setLocalOrders(filtered);
        } else {
          setLocalOrders([]);
        }
      } catch (e) {
        console.error('Failed to load orders:', e);
        setLocalOrders([]);
      }
      loadUserOrders();
    } else {
      setLocalOrders([]);
    }
    setLoading(false);
  }, [user.isLoggedIn, user.username, ordersUpdated, deletedOrderIds]);

  // ✅ Use localOrders if available, otherwise use orders from store
  const allOrders = (localOrders.length > 0 ? localOrders : orders)
    .filter((o: Order) => !deletedOrderIds.has(o.orderId));

  // ✅ Helper: is a given timestamp within the last 24 hours?
  const isWithin24h = (ts?: string): boolean => {
    if (!ts) return false;
    const t = new Date(ts).getTime();
    if (isNaN(t)) return false;
    return Date.now() - t <= 24 * 60 * 60 * 1000;
  };

  // ✅ Filter orders based on active tab (Progress Stepper)
  const filteredOrders = (() => {
    if (activeTab === 'ALL') return allOrders;
    if (activeTab === 'TO PAY') return allOrders.filter(o => o.status === 'Pending');
    if (activeTab === 'TO SHIP') return allOrders.filter(o => o.status === 'To Ship');
    if (activeTab === 'TO RECEIVE') return allOrders.filter(o =>
      o.status === 'Shipped' || o.status === 'Out for Delivery' || o.status === 'Delivered'
    );
    if (activeTab === 'TO REVIEW') {
      return allOrders.filter(o =>
        o.status === 'To Review' ||
        (o.status === 'Completed' && !o.review && isWithin24h(o.updatedAt))
      );
    }
    if (activeTab === 'COMPLETED') return allOrders.filter(o => o.status === 'Completed');
    return allOrders;
  })();

  // ✅ Progress Stepper reflects the first order in an active (non-terminal) state
  const navOrder = [...filteredOrders, ...allOrders].find(o =>
    o.status !== 'Cancelled' &&
    o.status !== 'Refund Requested' &&
    o.status !== 'Refunded' &&
    o.status !== 'Return Requested' &&
    o.status !== 'Returned'
  );
  const navStatus = (navOrder?.status || 'All') as OrderStatus;

  // ✅ Handle review submission (pagkatapos ng review -> authorized 'complete')
  const handleSubmitReview = (orderId: string, rating: number, comment: string) => {
    const order = allOrders.find(o => o.orderId === orderId);
    const productId = Array.isArray(order?.items) && order.items.length > 0
      ? (order!.items[0].id || '')
      : '';

    const req = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ productId, rating, comment }),
    };

    const finish = (ok: boolean, msg: string) => {
      if (ok) showToast(msg, 'success'); else showToast(msg, 'warning');
      completeOrderAfterReview(orderId);
      setReviewingOrder(null);
    };

    // Kung walang product id, direktang i-complete na lang ang order.
    if (!productId) {
      finish(true, '⭐ Order completed!');
      return;
    }

    fetch(`${SERVER_URL}/api/reviews`, req)
      .then(async res => ({ ok: res.ok, data: await res.json().catch(() => ({})) }))
      .then(({ ok, data }) => {
        if (ok) {
          console.log('✅ Review saved:', data);
          finish(true, '⭐ Thank you for your review!');
        } else {
          // Kung hindi ma-submit ang review (e.g. paulit-ulit), i-complete parin ang order.
          console.warn('Review skipped:', data?.error);
          finish(true, '⭐ Order completed!');
        }
      })
      .catch(err => {
        console.error('Failed to submit review:', err);
        finish(true, '⭐ Order completed!');
      });
  };

  // ✅ Handle Cancel Order (autorized customer action — backend-validated)
  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    await cancelOrder(orderId);
  };

  // ✅ Handle Refund Request (need bayad na ang order)
  const handleRefundRequest = async (orderId: string) => {
    const order = allOrders.find(o => o.orderId === orderId);
    if (!order) return;
    const payStatus = order.paymentInfo?.status ?? 'Pending';
    if (payStatus !== 'Paid' && payStatus !== 'Refunded') {
      showToast('Refunds are only available for paid orders, paid around delivery.', 'warning');
      return;
    }
    if (payStatus === 'Refunded') {
      showToast('This order has already been refunded.', 'info');
      return;
    }
    const reason = window.prompt('Reason for requesting a refund:', 'Item is defective');
    if (reason == null) return;
    await requestRefundOrder(orderId, reason.trim() || 'No reason provided');
  };

  // ✅ Handle Return Request (kaya ring sa Delivered/To Review/Completed)
  const handleReturnRequest = async (orderId: string) => {
    const reason = window.prompt('Reason for requesting a return:', 'Wrong size/color ordered');
    if (reason == null) return;
    await requestReturnOrder(orderId, reason.trim() || 'No reason provided');
  };

  // ✅ Handle Undo (retract) Pending action — pay panel toggle
  const togglePay = (orderId: string) => {
    setPayingOrder(prev => (prev === orderId ? null : orderId));
  };

  // ✅ Handle Delete Order
  const handleDeleteOrder = async (orderId: string) => {
    try {
      setDeletedOrderIds(prev => new Set([...prev, orderId]));
      const key = `chub_orders_${user.username.toLowerCase()}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        const filtered = parsed.filter((o: Order) => o.orderId !== orderId);
        localStorage.setItem(key, JSON.stringify(filtered));
      }
      setLocalOrders(prev => prev.filter((o: Order) => o.orderId !== orderId));
      try {
        await fetch(`${SERVER_URL}/api/orders/${orderId}`, { method: 'DELETE' });
      } catch (err) {
        console.error('Failed to delete from server:', err);
      }
      showToast(`Order ${orderId} deleted`, 'success');
    } catch (err) {
      console.error('Failed to delete order:', err);
      showToast('Failed to delete order. Please try again.', 'warning');
      setDeletedOrderIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  // ✅ Get status display info
  const getStatusDisplay = (status: OrderStatus) => {
    const config = getStatusConfig(status);
    return {
      description: config.description,
      icon: config.icon,
      color: config.color,
      bgColor: config.bgColor,
      label: config.label
    };
  };

  // ✅ Render all item rows
  const renderItemRows = (order: Order) => (
    <div className="space-y-3">
      {order.items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center p-1 shrink-0">
            <ProductVisual
              category="clothes"
              subCategory={item.subCategory || 'tshirt'}
              colorName={item.color || 'White'}
              bgColor="#2A3459"
              name={item.name}
              image={item.image}
              className="w-12 h-12 object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-stone-900 dark:text-white font-serif truncate">{item.name}</p>
            <p className="text-xs text-stone-400">
              {item.color ? `Color: ${item.color}` : ''}{item.color && item.size ? ' • ' : ''}{item.size ? `Size: ${item.size}` : ''} • x{item.qty}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-sm text-stone-900 dark:text-white font-serif">₱{(item.price * item.qty).toLocaleString()}</p>
            <p className="text-[10px] text-stone-400">₱{item.price.toLocaleString()} each</p>
          </div>
        </div>
      ))}
    </div>
  );

  // ✅ Render a single order card by tab context
  const renderOrderCard = (order: Order) => {
    const status = order.status as OrderStatus;
    const statusDisplay = getStatusDisplay(status);
    const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);
    const hasReview = !!order.review;
    // ✅ Completed order still within the 24-hour review window
    const inReviewWindow = status === 'Completed' && !hasReview && isWithin24h(order.updatedAt);

    // ✅ Tracking timeline data (live mula sa backend, fallback sa last-synced)
    const track = trackingData[order.orderId];
    const trackStatus = track?.status || status;
    const serverHistory: OrderTrackingEntry[] = Array.isArray(track?.statusHistory) ? track.statusHistory : [];
    const localHistory: OrderTrackingEntry[] = (order.statusHistory || []).map(h => ({
      status: h.status,
      timestamp: h.timestamp || order.updatedAt || '',
      by: (h as any).by,
      note: (h as any).note,
    }));
    const timeline = serverHistory.length ? serverHistory : localHistory;

    return (
      <div key={order.orderId} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm transition-all hover:shadow-md">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black font-serif text-stone-900 dark:text-white">C-HUB Store</p>
              <p className="text-xs text-stone-500">{order.orderId} • {order.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {statusDisplay.icon}
            <span className={`font-bold ${statusDisplay.color}`}>{statusDisplay.label}</span>
            <button
              onClick={() => handleDeleteOrder(order.orderId)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors ml-1"
              title="Delete Order"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Order Summary - always shown */}
        <div className="border border-stone-100 dark:border-stone-800 rounded-2xl p-4 space-y-3">
          {renderItemRows(order)}

          {/* Summary line */}
          <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
            <span className="text-xs text-stone-500">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
            <div className="text-right">
              <span className="text-xs text-stone-500 mr-2">Total</span>
              <span className="text-lg font-black text-stone-900 dark:text-indigo-400 font-serif">₱{order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Track Order — expandable live timeline (may loading/error states) */}
        <button
          type="button"
          onClick={() => toggleTracking(order)}
          className="mt-4 w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors group"
        >
          <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-stone-700 dark:text-stone-200">
            <Truck className="w-4 h-4 text-indigo-500" /> Track Order
          </span>
          <ChevronDown
            className={`w-4 h-4 text-stone-400 transition-transform ${trackingOpenId === order.orderId ? 'rotate-180' : ''}`}
          />
        </button>

        {trackingOpenId === order.orderId && (
          <div className="mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800 animate-fadeIn">
            {trackingLoading[order.orderId] ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                <p className="text-xs text-stone-500 dark:text-stone-400">Loading tracking...</p>
              </div>
            ) : (
              <>
                {trackingError[order.orderId] && (
                  <div className="mb-3 flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-900 text-[11px] text-stone-500 dark:text-stone-400">
                    <span>{trackingError[order.orderId]}</span>
                    <button
                      onClick={() => {
                        setTrackingData(prev => { const n = { ...prev }; delete n[order.orderId]; return n; });
                        loadTracking(order);
                      }}
                      className="shrink-0 flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-700"
                    >
                      <RefreshCw className="w-3 h-3" /> Retry
                    </button>
                  </div>
                )}

                {(track?.fulfillment?.carrier || track?.fulfillment?.trackingNumber || track?.fulfillment?.estimatedDelivery) && (
                  <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 text-xs">
                    {track.fulfillment.carrier && (
                      <div>
                        <p className="text-stone-400 dark:text-stone-500 text-[10px] uppercase font-bold">Courier</p>
                        <p className="font-bold text-stone-700 dark:text-stone-200">{track.fulfillment.carrier}</p>
                      </div>
                    )}
                    {track.fulfillment.trackingNumber && (
                      <div>
                        <p className="text-stone-400 dark:text-stone-500 text-[10px] uppercase font-bold">Tracking No.</p>
                        <p className="font-bold text-stone-700 dark:text-stone-200">{track.fulfillment.trackingNumber}</p>
                      </div>
                    )}
                    {track.fulfillment.estimatedDelivery && (
                      <div>
                        <p className="text-stone-400 dark:text-stone-500 text-[10px] uppercase font-bold">Est. Delivery</p>
                        <p className="font-bold text-stone-700 dark:text-stone-200">{track.fulfillment.estimatedDelivery}</p>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" /> Tracking Timeline
                </p>

                <ol className="relative">
                  {timeline.map((entry, idx) => {
                    const cfg = getStatusConfig(entry.status);
                    const isLast = idx === timeline.length - 1;
                    const isCurrent = String(entry.status).toLowerCase() === String(trackStatus).toLowerCase();
                    return (
                      <li key={idx} className="relative flex gap-3 pb-5 last:pb-0">
                        {!isLast && (
                          <span className="absolute left-[13px] top-7 bottom-0 w-px bg-stone-200 dark:bg-stone-700" />
                        )}
                        <span
                          className={`relative z-10 shrink-0 w-7 h-7 rounded-full flex items-center justify-center border ${
                            isCurrent
                              ? `${cfg.bgColor} ${cfg.color} border-transparent`
                              : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-400'
                          }`}
                        >
                          {cfg.icon}
                        </span>
                        <div className="min-w-0 pt-0.5">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span className={`text-sm font-bold ${isCurrent ? cfg.color : 'text-stone-700 dark:text-stone-200'}`}>
                              {cfg.label}
                            </span>
                            {entry.timestamp && (
                              <span className="text-[11px] text-stone-400">{formatTimestamp(entry.timestamp)}</span>
                            )}
                          </div>
                          {entry.note && (
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{entry.note}</p>
                          )}
                          <p className="text-[11px] text-stone-400">{actorLabel(entry.by)}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </>
            )}
          </div>
        )}

        {/* Context-specific sections — every status card is read-only in status;
            ang tanging customer actions ay ang mga naka-validate na buttons ito */}
        {(status === 'Pending') && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Payment Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <p className="text-stone-600 dark:text-stone-300"><span className="text-stone-400">Payment Method: </span>{order.payment}</p>
              <p className="text-stone-600 dark:text-stone-300"><span className="text-stone-400">Shipping: </span>{order.shipping === 0 ? 'FREE' : `₱${order.shipping.toLocaleString()}`}</p>
            </div>
            {isOnlinePayment(order.payment) ? (
              <>
                {payingOrder === order.orderId ? (
                  <div className="pt-1 space-y-2">
                    <PaymentPanel
                      order={order}
                      onPaid={() => setPayingOrder(null)}
                    />
                    <button
                      onClick={() => setPayingOrder(null)}
                      className="w-full py-2 bg-white dark:bg-stone-800 border border-rose-200 dark:border-rose-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                    >
                      Close payment
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => setPayingOrder(order.orderId)}
                      className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" /> Pay Now
                    </button>
                    <button
                      onClick={() => handleCancelOrder(order.orderId)}
                      className="flex-1 py-2.5 bg-white dark:bg-stone-800 border border-rose-200 dark:border-rose-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-between gap-3 rounded-xl bg-white dark:bg-stone-800 border border-rose-100 dark:border-rose-900 px-4 py-3">
                <div className="flex items-start gap-2.5">
                  <Banknote className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Cash on Delivery (COD)</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">Pay when you receive your order.</p>
                  </div>
                </div>
                <button
                  onClick={() => handleCancelOrder(order.orderId)}
                  className="shrink-0 py-2 px-4 bg-white dark:bg-stone-800 border border-rose-200 dark:border-rose-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  Cancel Order
                </button>
              </div>
            )}
          </div>
        )}

        {(status === 'To Ship') && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Shipment Info</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <p className="text-stone-600 dark:text-stone-300"><span className="text-stone-400">Payment Status: </span>
                {order.paymentInfo?.status === 'Paid'
                  ? <span className="text-emerald-600 font-bold">Paid</span>
                  : <span className="text-stone-500">{order.paymentInfo?.status || 'Pending'} • pay on delivery</span>}
              </p>
              <p className="text-stone-600 dark:text-stone-300"><span className="text-stone-400">Order Date: </span>{order.date}</p>
              <p className="text-stone-600 dark:text-stone-300 flex items-start gap-1 sm:col-span-2"><MapPin className="w-3 h-3 mt-0.5 text-stone-400 shrink-0" /> <span><span className="text-stone-400">Shipping Address: </span>{order.customer.address}</span></p>
              <p className="text-stone-600 dark:text-stone-300"><span className="text-stone-400">Seller: </span>C-HUB Store</p>
              <p className="text-stone-600 dark:text-stone-300"><span className="text-stone-400">Status: </span>Preparing to Ship</p>
            </div>
            <button
              onClick={() => handleCancelOrder(order.orderId)}
              className="w-full py-2.5 bg-white dark:bg-stone-800 border border-amber-200 dark:border-amber-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Cancel Order
            </button>
            <p className="text-[11px] text-stone-400 dark:text-stone-500 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              Your order can still be cancelled while it is being prepared for shipment.
            </p>
          </div>
        )}

        {(status === 'Shipped' || status === 'Out for Delivery' || status === 'Delivered') && (
          <div className="mt-4 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Tracking</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <p className="text-stone-600 dark:text-stone-300"><span className="text-stone-400">Courier: </span>{order.fulfillment?.carrier || 'J&T Express'}</p>
              <p className="text-stone-600 dark:text-stone-300"><span className="text-stone-400">Tracking #: </span>{order.fulfillment?.trackingNumber || 'N/A'}</p>
              <p className="text-stone-600 dark:text-stone-300 sm:col-span-2"><span className="text-stone-400">Estimated Delivery: </span>{order.fulfillment?.estimatedDelivery || 'Within 2-5 days'}</p>
              <p className="text-stone-600 dark:text-stone-300 sm:col-span-2"><span className="text-stone-400">Status: </span>
                {status === 'Shipped' ? 'Handed over to courier' : status === 'Out for Delivery' ? 'Out for delivery' : 'Delivered — confirmed by C-HUB'}
              </p>
            </div>
            {status === 'Delivered' && (
              <>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleRefundRequest(order.orderId)}
                    className="flex-1 py-2.5 bg-white dark:bg-stone-800 border border-blue-200 dark:border-blue-800 text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCcw className="w-4 h-4" /> Request Refund
                  </button>
                  <button
                    onClick={() => handleReturnRequest(order.orderId)}
                    className="flex-1 py-2.5 bg-white dark:bg-stone-800 border border-blue-200 dark:border-blue-800 text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Undo2 className="w-4 h-4" /> Request Return
                  </button>
                </div>
                <p className="text-[11px] text-stone-400 dark:text-stone-500">
                  Refunds &amp; returns can only be requested for paid orders after delivery.
                </p>
              </>
            )}
          </div>
        )}

        {(status === 'To Review') && (
          <div className="mt-4 p-4 rounded-2xl bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-100 dark:border-yellow-900 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-yellow-600 dark:text-yellow-400">Review This Order</p>
            <div className="flex items-center gap-3 text-xs">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-400 shrink-0" />
              <p className="text-stone-600 dark:text-stone-300">You've received your order. Share your experience!</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setReviewingOrder(order)}
                className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Star className="w-4 h-4" /> Write Review
              </button>
              <button
                onClick={() => handleRefundRequest(order.orderId)}
                className="flex-1 py-2.5 bg-white dark:bg-stone-800 border border-yellow-200 dark:border-yellow-800 text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/40 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <RefreshCcw className="w-4 h-4" /> Request Refund
              </button>
              <button
                onClick={() => handleReturnRequest(order.orderId)}
                className="flex-1 py-2.5 bg-white dark:bg-stone-800 border border-yellow-200 dark:border-yellow-800 text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Undo2 className="w-4 h-4" /> Request Return
              </button>
            </div>
          </div>
        )}

        {(status === 'Completed') && (
          <div className="mt-4 p-4 rounded-2xl bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <p className="text-xs font-bold text-green-700 dark:text-green-400">Order Completed</p>
            </div>

            {hasReview && order.review ? (
              <div className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-green-100 dark:border-green-900">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-3.5 h-3.5 ${star <= (order.review?.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-stone-300'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-stone-500">{order.review?.date ? new Date(order.review.date).toLocaleDateString() : ''}</span>
                </div>
                {order.review?.comment && <p className="text-xs text-stone-600 dark:text-stone-300">{order.review.comment}</p>}
              </div>
            ) : (
              <>
                {inReviewWindow ? (
                  <>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleRefundRequest(order.orderId)}
                        className="flex-1 py-2.5 bg-white dark:bg-stone-800 border border-green-200 dark:border-green-800 text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/40 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <RefreshCcw className="w-4 h-4" /> Request Refund
                      </button>
                      <button
                        onClick={() => handleReturnRequest(order.orderId)}
                        className="flex-1 py-2.5 bg-white dark:bg-stone-800 border border-green-200 dark:border-green-800 text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <Undo2 className="w-4 h-4" /> Request Return
                      </button>
                      <button
                        onClick={() => setReviewingOrder(order)}
                        className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <Star className="w-4 h-4" /> Write Review
                      </button>
                    </div>
                    <p className="text-[10px] text-stone-400 text-center">
                      Available for review within 24 hours of delivery.
                    </p>
                  </>
                ) : (
                  <button
                    onClick={() => setReviewingOrder(order)}
                    className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Star className="w-4 h-4" /> Write Review
                  </button>
                )}
              </>
            )}

            <button
              onClick={() => setPage('shop')}
              className="w-full py-2.5 bg-white dark:bg-stone-800 border border-green-200 dark:border-green-800 text-green-700 hover:bg-green-50 dark:hover:bg-green-950/40 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" /> Buy Again
            </button>
          </div>
        )}

        {(status === 'Cancelled') && (
          <div className="mt-4 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800 text-xs flex items-start gap-2">
            <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-stone-600 dark:text-stone-300">
              This order has been cancelled. No payment was collected.
            </p>
          </div>
        )}

        {(status === 'Refund Requested') && (
          <div className="mt-4 p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 text-xs flex items-start gap-2">
            <RefreshCcw className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-stone-600 dark:text-stone-300">
                Your refund request has been submitted and is awaiting approval by C-HUB.
              </p>
              {order.refundRequest?.reason && (
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                  Reason: <span className="italic">"{order.refundRequest.reason}"</span>
                </p>
              )}
            </div>
          </div>
        )}

        {(status === 'Refunded') && (
          <div className="mt-4 p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 text-xs flex items-start gap-2">
            <Banknote className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-stone-600 dark:text-stone-300">
                {order.refund?.amount
                  ? <>This order has been refunded <b>₱{order.refund.amount.toLocaleString()}</b> via {order.refund.method || 'your payment method'}.</>
                  : 'This order has been refunded. The amount will be returned via your payment method.'}
              </p>
              {order.refund?.note && (
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">Note: {order.refund.note}</p>
              )}
            </div>
          </div>
        )}

        {(status === 'Return Requested') && (
          <div className="mt-4 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900 text-xs flex items-start gap-2">
            <Undo2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-stone-600 dark:text-stone-300">
                Your return request has been submitted and is awaiting approval by C-HUB.
              </p>
              {order.returnRequest?.reason && (
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                  Reason: <span className="italic">"{order.returnRequest.reason}"</span>
                </p>
              )}
            </div>
          </div>
        )}

        {(status === 'Returned') && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs flex items-start gap-2">
            <Undo2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-stone-600 dark:text-stone-300">
                The items in this order have been returned.
              </p>
              {order.returnRef?.note && (
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">Note: {order.returnRef.note}</p>
              )}
            </div>
          </div>
        )}

        {/* Denied outcomes: status falls back to 'Completed' — ipakita ang denial note */}
        {status === 'Completed' && order.refund?.status === 'denied' && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-xs flex items-start gap-2">
            <RefreshCcw className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-stone-600 dark:text-stone-300">
                Your refund request was declined by C-HUB.
              </p>
              {order.refund.note && (
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">Reason: {order.refund.note}</p>
              )}
            </div>
          </div>
        )}

        {status === 'Completed' && order.returnRef?.status === 'denied' && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-xs flex items-start gap-2">
            <Undo2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-stone-600 dark:text-stone-300">
                Your return request was declined by C-HUB.
              </p>
              {order.returnRef.note && (
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">Reason: {order.returnRef.note}</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ✅ Show loading state
  if (loading || isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-stone-500 dark:text-stone-400">Loading your orders...</p>
      </div>
    );
  }

  // ✅ Show login prompt if not logged in
  if (!user.isLoggedIn) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-16 text-center space-y-6 animate-fadeIn">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center text-3xl shadow-inner">
          <User className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold font-serif text-stone-900 dark:text-white">Please Login</h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
            Login to view your order history and track your purchases.
          </p>
        </div>
        <button
          onClick={() => setPage('login')}
          className="px-8 py-3.5 bg-stone-900 hover:bg-stone-800 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all shadow-xl hover:scale-105"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-stone-800">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-[0.25em] text-indigo-600 dark:text-indigo-400">
            My Purchases
          </span>
          <h1 className="text-3xl sm:text-4xl font-black font-serif text-stone-900 dark:text-white">
            Your Orders
          </h1>
        </div>
        <button
          onClick={() => setPage('shop')}
          className="px-5 py-2.5 bg-stone-900 text-white dark:bg-indigo-500 dark:text-white hover:bg-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md hover:shadow-lg"
        >
          <span>Shop More</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress Stepper (always visible, clickable = order filter) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
        <StatusProgress
          currentStatus={navStatus}
          onStepClick={handleFilterClick}
        />
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="py-10 flex justify-center">
          <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-lg p-10 text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center">
              {activeTab === 'ALL' ? <ShoppingBag className="w-8 h-8" /> :
               activeTab === 'TO PAY' ? <CreditCard className="w-8 h-8" /> :
               activeTab === 'TO SHIP' ? <Package className="w-8 h-8" /> :
               activeTab === 'TO RECEIVE' ? <Truck className="w-8 h-8" /> :
               activeTab === 'TO REVIEW' ? <Star className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
            </div>
            <p className="text-stone-600 dark:text-stone-300 font-semibold">No related orders.</p>
            <button
              onClick={() => setPage('shop')}
              className="px-7 py-3 bg-stone-900 dark:bg-indigo-500 text-white hover:bg-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
            >
              Explore Shop
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map(renderOrderCard)}
        </div>
      )}

      {/* Delivery & Review Modal */}
      {reviewingOrder && (
        <DeliveryModal
          order={reviewingOrder}
          onClose={() => setReviewingOrder(null)}
          onRate={handleSubmitReview}
          onRequestRefund={handleRefundRequest}
        />
      )}
    </div>
  );
};
