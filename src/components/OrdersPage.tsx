import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Package, Clock, ShoppingBag, ArrowRight, Truck, CheckCircle2, 
  Star, XCircle, MapPin, User, Calendar, ThumbsUp, MessageCircle,
  CreditCard, Shield, AlertCircle, Send, Edit2, Trash2
} from 'lucide-react';
import { ProductVisual } from './ProductVisual';
import { OrderStatus, Order, Review } from '../types';

// Order status config
type StatusConfig = {
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  step: number;
  description: string;
  nextStatus?: OrderStatus;
};

const statusConfigs: Record<OrderStatus, StatusConfig> = {
  'To Pay': {
    label: 'To Pay',
    icon: <CreditCard className="w-3.5 h-3.5" />,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-950/40',
    step: 1,
    description: 'Please complete your payment to proceed.',
    nextStatus: 'To Ship'
  },
  'To Ship': {
    label: 'To Ship',
    icon: <Package className="w-3.5 h-3.5" />,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-950/40',
    step: 2,
    description: 'Seller is preparing your order for shipment.',
    nextStatus: 'Shipped'
  },
  'Shipped': {
    label: 'Shipped',
    icon: <Truck className="w-3.5 h-3.5" />,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-950/40',
    step: 3,
    description: 'Your package has been picked up by the courier.',
    nextStatus: 'Out for Delivery'
  },
  'Out for Delivery': {
    label: 'Out for Delivery',
    icon: <MapPin className="w-3.5 h-3.5" />,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-950/40',
    step: 4,
    description: 'Your package is with the courier and on its way.',
    nextStatus: 'Delivered'
  },
  'Delivered': {
    label: 'Delivered',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-950/40',
    step: 5,
    description: 'Your package has been delivered! Please review your order.',
    nextStatus: 'To Review'
  },
  'To Review': {
    label: 'To Review ⭐',
    icon: <Star className="w-3.5 h-3.5" />,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-950/40',
    step: 6,
    description: 'Share your experience with this product!',
    nextStatus: 'Completed'
  },
  'Completed': {
    label: 'Completed ✓',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-950/40',
    step: 7,
    description: 'Thank you for your order and review!',
  },
  'Cancelled': {
    label: 'Cancelled',
    icon: <XCircle className="w-3.5 h-3.5" />,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-950/40',
    step: 0,
    description: 'This order has been cancelled.',
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

// ✅ Status Progress Bar Component
const StatusProgress: React.FC<{ currentStatus: OrderStatus | string }> = ({ currentStatus }) => {
  const steps: OrderStatus[] = ['To Pay', 'To Ship', 'Shipped', 'Out for Delivery', 'Delivered', 'To Review', 'Completed'];
  const config = getStatusConfig(currentStatus);
  const currentStep = config?.step || 0;
  
  if (currentStatus === 'Cancelled' || currentStatus === 'cancelled') {
    return (
      <div className="flex items-center gap-2 text-red-500">
        <XCircle className="w-4 h-4" />
        <span className="text-xs font-medium">Order Cancelled</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between gap-1">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum <= currentStep;
          const isCurrent = stepNum === currentStep;
          const stepConfig = getStatusConfig(step);
          
          return (
            <div key={step} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                    isActive 
                      ? isCurrent
                        ? 'bg-indigo-500 text-white ring-2 ring-indigo-300 ring-offset-1 scale-110'
                        : 'bg-indigo-500 text-white'
                      : 'bg-stone-200 dark:bg-stone-700 text-stone-400 dark:text-stone-500'
                  }`}
                >
                  {isActive ? (
                    isCurrent ? stepConfig.icon : <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    stepNum
                  )}
                </div>
                <span className={`text-[8px] mt-0.5 font-medium text-center truncate w-full ${
                  isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-stone-400 dark:text-stone-500'
                }`}>
                  {stepConfig.label.split(' ')[0]}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-0.5 ${
                  isActive ? 'bg-indigo-500' : 'bg-stone-200 dark:bg-stone-700'
                }`} />
              )}
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-stone-500 dark:text-stone-400 text-center">
        {config?.description || ''}
      </p>
    </div>
  );
};

// ✅ Review Modal Component
const ReviewModal: React.FC<{
  order: Order;
  onClose: () => void;
  onSubmit: (orderId: string, rating: number, comment: string) => void;
}> = ({ order, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (rating === 0) {
      alert('Please select a rating!');
      return;
    }
    onSubmit(order.orderId, rating, comment);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn p-4">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold font-serif text-stone-900 dark:text-white">
            Rate Your Order
          </h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
          How was your experience with <b>{order.orderId}</b>?
        </p>

        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="transition-all hover:scale-110"
            >
              <Star
                className={`w-10 h-10 ${
                  star <= (hoverRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-stone-300 dark:text-stone-600'
                } transition-colors`}
              />
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-stone-500 mb-4">
          {rating === 1 && '😞 Poor'}
          {rating === 2 && '😕 Fair'}
          {rating === 3 && '😐 Good'}
          {rating === 4 && '😊 Very Good'}
          {rating === 5 && '🌟 Excellent!'}
          {rating === 0 && 'Tap a star to rate'}
        </p>

        <textarea
          placeholder="Share your experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 text-stone-900 dark:text-white resize-none"
        />

        <button
          onClick={handleSubmit}
          className="w-full mt-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          Submit Review
        </button>
      </div>
    </div>
  );
};

export const OrdersPage: React.FC = () => {
  const { orders, user, setPage, showToast, updateOrderStatus, loadUserOrders, refreshOrders, isLoading, ordersUpdated, syncOrdersToServer } = useStore();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [reviewingOrder, setReviewingOrder] = useState<Order | null>(null);
  const [localOrders, setLocalOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletedOrderIds, setDeletedOrderIds] = useState<Set<string>>(new Set());

  // ✅ SSE connection para sa real-time updates
  useEffect(() => {
    let es: EventSource | null = null;
    const serverUrl = 'http://localhost:3013';
    
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
      
      // ✅ ORDER UPDATE EVENT - auto-update ng orders
      es.addEventListener('order_update', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📦 order_update received (OrdersPage):', data);
          
          const { orderId, status, order } = data;
          
          if (!orderId) return;
          if (!user.isLoggedIn || !user.username) return;
          
          // ✅ I-update ang local orders
          setLocalOrders(prev => {
            const exists = prev.some(o => o.orderId === orderId);
            
            if (order) {
              // Kung may full order object, gamitin ito
              if (!exists) {
                // Bago - idagdag
                const newOrders = [order, ...prev];
                // I-save sa localStorage
                const key = `chub_orders_${user.username.toLowerCase()}`;
                localStorage.setItem(key, JSON.stringify(newOrders));
                return newOrders;
              } else {
                // Existing - i-update
                const updatedOrders = prev.map(o =>
                  o.orderId === orderId ? { ...o, ...order } : o
                );
                const key = `chub_orders_${user.username.toLowerCase()}`;
                localStorage.setItem(key, JSON.stringify(updatedOrders));
                return updatedOrders;
              }
            }
            
            // Kung walang order object, status lang ang nagbago
            if (exists) {
              const updatedOrders = prev.map(o =>
                o.orderId === orderId ? { ...o, status: status as Order['status'] } : o
              );
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
      
      // ✅ NEW ORDER EVENT
      es.addEventListener('new_order', (event: MessageEvent) => {
        try {
          const newOrder = JSON.parse(event.data) as Order;
          console.log('📦 new_order received (OrdersPage):', newOrder);
          
          if (!user.isLoggedIn || !user.username) return;
          
          // ✅ I-check kung para sa user na ito
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
      
      // ✅ ORDER DELETED EVENT
      es.addEventListener('order_deleted', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          console.log('🗑️ order_deleted received (OrdersPage):', data);
          
          const { orderId } = data;
          if (!orderId) return;
          if (!user.isLoggedIn || !user.username) return;
          
          // ✅ Tanggalin ang order mula sa local state
          setLocalOrders(prev => {
            const filtered = prev.filter(o => o.orderId !== orderId);
            const key = `chub_orders_${user.username.toLowerCase()}`;
            localStorage.setItem(key, JSON.stringify(filtered));
            showToast(`Order ${orderId} has been deleted`, 'info');
            return filtered;
          });
          
          // ✅ Idagdag sa deleted set
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
      console.log('🔄 OrdersPage: Loading orders for:', user.username);
      
      try {
        const key = `chub_orders_${user.username.toLowerCase()}`;
        const saved = localStorage.getItem(key);
        console.log('📦 Raw data from localStorage:', saved);
        
        if (saved) {
          const parsed = JSON.parse(saved);
          const filtered = parsed.filter((o: Order) => !deletedOrderIds.has(o.orderId));
          console.log('📦 Filtered orders (deleted removed):', filtered.length);
          setLocalOrders(filtered);
        } else {
          console.log('❌ No orders found in localStorage');
          setLocalOrders([]);
        }
      } catch (e) {
        console.error('Failed to load orders:', e);
        setLocalOrders([]);
      }
      
      loadUserOrders();
    } else {
      console.log('👤 User not logged in');
      setLocalOrders([]);
    }
    setLoading(false);
  }, [user.isLoggedIn, user.username, ordersUpdated, deletedOrderIds]);

  // ✅ Use localOrders if available, otherwise use orders from store
  const displayOrders = (localOrders.length > 0 ? localOrders : orders)
    .filter((o: Order) => !deletedOrderIds.has(o.orderId));

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // ✅ Handle review submission
  const handleSubmitReview = (orderId: string, rating: number, comment: string) => {
    fetch('http://localhost:3013/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        rating,
        comment,
        customerName: displayOrders.find(o => o.orderId === orderId)?.customer?.name || user.username || '',
        date: new Date().toISOString()
      })
    })
    .then(res => res.json())
    .then(data => {
      console.log('✅ Review saved:', data);
      showToast('⭐ Thank you for your review!', 'success');
      updateOrderStatus(orderId, 'Completed');
      setReviewingOrder(null);
      // ✅ I-reload ang orders
      const key = `chub_orders_${user.username.toLowerCase()}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        setLocalOrders(parsed.filter((o: Order) => !deletedOrderIds.has(o.orderId)));
      }
    })
    .catch(err => {
      console.error('Failed to submit review:', err);
      showToast('Failed to submit review. Please try again.', 'warning');
    });
  };

  // ✅ Status badge component
  const getStatusBadge = (status: OrderStatus | string | undefined) => {
    const config = getStatusConfig(status);
    return (
      <span className={`px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1.5 ${config.bgColor} ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  // ✅ Handle Delete Order - WALANG CONFIRMATION at mag-sync sa server
  const handleDeleteOrder = async (orderId: string) => {
    try {
      // ✅ 1. I-add sa deleted set para hindi na bumalik
      setDeletedOrderIds(prev => new Set([...prev, orderId]));
      
      // ✅ 2. Tanggalin mula sa localStorage
      const key = `chub_orders_${user.username.toLowerCase()}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        const filtered = parsed.filter((o: Order) => o.orderId !== orderId);
        localStorage.setItem(key, JSON.stringify(filtered));
        console.log(`✅ Deleted order ${orderId} from localStorage`);
      }
      
      // ✅ 3. I-update ang local state
      setLocalOrders(prev => prev.filter((o: Order) => o.orderId !== orderId));
      
      // ✅ 4. I-delete sa server
      try {
        await fetch(`http://localhost:3013/api/orders/${orderId}`, {
          method: 'DELETE'
        });
        console.log(`✅ Deleted order ${orderId} from server`);
      } catch (err) {
        console.error('Failed to delete from server:', err);
      }
      
      showToast(`Order ${orderId} deleted`, 'success');
      
    } catch (err) {
      console.error('Failed to delete order:', err);
      showToast('Failed to delete order. Please try again.', 'warning');
      // ✅ Kung nag-fail, alisin sa deleted set
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

  // ✅ Show loading state
  if (loading || isLoading) {
    return (
      <div className="w-full max-w-200 mx-auto px-4 py-16 text-center space-y-4">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-stone-500 dark:text-stone-400">Loading your orders...</p>
      </div>
    );
  }

  // ✅ Show login prompt if not logged in
  if (!user.isLoggedIn) {
    return (
      <div className="w-full max-w-200 mx-auto px-4 py-16 text-center space-y-6 animate-fadeIn">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center text-3xl shadow-inner">
          <User className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold font-serif text-stone-900 dark:text-white">
            Please Login
          </h2>
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

  if (displayOrders.length === 0) {
    return (
      <div className="w-full max-w-200 mx-auto px-4 py-16 text-center space-y-6 animate-fadeIn">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center text-3xl shadow-inner">
          <Package className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold font-serif text-stone-900 dark:text-white">
            No Orders Yet
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
            You haven't placed any orders with C-HUB yet. Start exploring our collections to create your signature look.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setPage('shop')}
            className="px-8 py-3.5 bg-stone-900 hover:bg-stone-800 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all shadow-xl hover:scale-105"
          >
            Explore Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-stone-800">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-[0.25em] text-indigo-600 dark:text-indigo-400">
            Account History
          </span>
          <h1 className="text-3xl sm:text-4xl font-black font-serif text-stone-900 dark:text-white">
            Your Orders ({displayOrders.length})
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

      {/* Orders List */}
      <div className="space-y-6">
        {displayOrders.map((order) => {
          const status = order.status as OrderStatus;
          const statusConfig = getStatusConfig(status);
          const statusDisplay = getStatusDisplay(status);
          const isExpanded = expandedOrder === order.orderId;
          const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);
          const hasReview = !!order.review;
          const timeline = order.fulfillment?.timeline || [];

          return (
            <div
              key={order.orderId}
              className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm transition-all hover:shadow-md"
            >
              {/* Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
                <div className="space-y-1">
                  <p className="text-xs text-stone-500 font-medium">Order Number</p>
                  <p className="text-lg font-black font-mono text-stone-900 dark:text-indigo-400">{order.orderId}</p>
                </div>

                {/* ✅ DITO NA MAY DELETE ICON SA TABI NG STATUS */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-stone-500">{order.date}</span>
                  {getStatusBadge(status)}
                  
                  {/* Maliit na Delete Icon sa tabi ng status */}
                  <button
                    onClick={() => handleDeleteOrder(order.orderId)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    title="Delete Order"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ✅ Status Progress Bar */}
              <div className="py-4">
                <StatusProgress currentStatus={status} />
              </div>

              {/* ✅ STATUS INFO */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                <div className="flex items-center gap-3">
                  <span className={`${statusDisplay.color}`}>
                    {statusDisplay.icon}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-stone-900 dark:text-white">
                      {statusDisplay.label}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {statusDisplay.description}
                    </p>
                  </div>
                </div>
                {timeline.length > 0 && (
                  <span className="text-xs text-stone-400">
                    {timeline[timeline.length - 1]?.time || ''}
                  </span>
                )}
              </div>

              {/* ✅ Timeline Events */}
              {timeline.length > 0 && (
                <div className="mb-4 space-y-2 px-2">
                  <div className="space-y-2">
                    {timeline.slice().reverse().map((event: { status: string; time: string; note?: string }, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 text-xs">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                        <div>
                          <span className="font-medium text-stone-700 dark:text-stone-300">{event.status}</span>
                          <span className="text-stone-400 ml-2">{event.time}</span>
                          {event.note && (
                            <p className="text-stone-500 text-[11px]">{event.note}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Items Summary */}
              <div 
                className="flex items-center justify-between cursor-pointer py-2 mt-2"
                onClick={() => toggleOrderExpand(order.orderId)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center p-1 border-2 border-white dark:border-stone-900">
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
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-10 h-10 rounded-xl bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-xs font-bold text-stone-600 dark:text-stone-300 border-2 border-white dark:border-stone-900">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900 dark:text-white">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • {itemCount} {itemCount === 1 ? 'piece' : 'pieces'}
                    </p>
                    <p className="text-xs text-stone-500">
                      ₱{order.total.toLocaleString()} total
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400">
                    {isExpanded ? 'Hide details' : 'View details'}
                  </span>
                  <ArrowRight className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-4 animate-fadeIn">
                  
                  {/* All Items */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">Order Items</h4>
                    <div className="divide-y divide-stone-100 dark:divide-stone-800">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="py-2.5 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center p-1 shrink-0">
                              <ProductVisual
                                category="clothes"
                                subCategory={item.subCategory || 'tshirt'}
                                colorName={item.color || 'White'}
                                bgColor="#2A3459"
                                name={item.name}
                                image={item.image}
                                className="w-10 h-10 object-contain"
                              />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-stone-900 dark:text-white font-serif">{item.name}</p>
                              <p className="text-xs text-stone-400">Size: {item.size || 'M'} • Qty: {item.qty}</p>
                            </div>
                          </div>
                          <p className="font-bold text-sm text-stone-900 dark:text-white font-serif">
                            ₱{(item.price * item.qty).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery & Payment Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-4">
                    <div className="space-y-1">
                      <p className="text-stone-500 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        Recipient
                      </p>
                      <p className="font-bold text-stone-900 dark:text-white">{order.customer.name}</p>
                      <p className="text-stone-500">{order.customer.phone}</p>
                      <p className="text-stone-500 flex items-start gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{order.customer.address}</span>
                      </p>
                    </div>
                    <div className="space-y-1 text-right sm:text-left">
                      <p className="text-stone-500">Payment Method</p>
                      <p className="font-bold text-stone-900 dark:text-white">{order.payment}</p>
                      <p className="text-stone-500 mt-1">Order Status</p>
                      <p className={`font-bold ${statusConfig.color}`}>{statusConfig.label}</p>
                    </div>
                  </div>

                  {/* Pricing Summary */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                    <div className="space-y-0.5 text-xs text-stone-500">
                      <div className="flex gap-4">
                        <span>Subtotal: ₱{order.subtotal.toLocaleString()}</span>
                        <span>Shipping: {order.shipping === 0 ? 'FREE' : `₱${order.shipping.toLocaleString()}`}</span>
                      </div>
                      {order.discount > 0 && (
                        <p className="text-emerald-600 font-bold">Discount: -₱{order.discount.toLocaleString()}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-stone-500">Total Paid</p>
                      <p className="text-lg font-black text-stone-900 dark:text-indigo-400 font-serif">
                        ₱{order.total.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* ✅ REVIEW BUTTON */}
                  {(status === 'Delivered' || status === 'To Review' || (status === 'Completed' && !hasReview)) && (
                    <button
                      onClick={() => setReviewingOrder(order)}
                      className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Star className="w-4 h-4" />
                      <span>Rate & Review this Order</span>
                    </button>
                  )}

                  {/* Show review if exists */}
                  {hasReview && order.review && (
                    <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= (order.review?.rating || 0)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-stone-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-stone-500 ml-2">
                          {order.review?.date ? new Date(order.review.date).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className="text-sm text-stone-700 dark:text-stone-300 mt-1">
                        {order.review?.comment}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Review Modal */}
      {reviewingOrder && (
        <ReviewModal
          order={reviewingOrder}
          onClose={() => setReviewingOrder(null)}
          onSubmit={handleSubmitReview}
        />
      )}
    </div>
  );
};