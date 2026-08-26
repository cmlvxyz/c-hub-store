import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Package, Clock, ShoppingBag, ArrowRight, Truck, CheckCircle2, Star, XCircle, Calendar, MapPin, User } from 'lucide-react';
import { ProductVisual } from './ProductVisual';

// Order status types and their display config
type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'OutForDelivery' | 'Delivered' | 'ToReview' | 'Cancelled';

interface StatusConfig {
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  step: number;
  description: string;
}

const statusConfigs: Record<OrderStatus, StatusConfig> = {
  Pending: {
    label: 'Order Placed',
    icon: <Clock className="w-3.5 h-3.5" />,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-950/40',
    step: 1,
    description: 'Your order has been received and is waiting for processing.'
  },
  Processing: {
    label: 'To Ship',
    icon: <Package className="w-3.5 h-3.5" />,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-950/40',
    step: 2,
    description: 'Seller is preparing and packing your order for shipment.'
  },
  Shipped: {
    label: 'Shipped',
    icon: <Truck className="w-3.5 h-3.5" />,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-950/40',
    step: 3,
    description: 'Your package has been picked up by the courier and is in transit.'
  },
  OutForDelivery: {
    label: 'Out for Delivery',
    icon: <MapPin className="w-3.5 h-3.5" />,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-950/40',
    step: 4,
    description: 'Your package is with the local courier and on its way to you.'
  },
  Delivered: {
    label: 'Delivered',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-950/40',
    step: 5,
    description: 'Your package has been successfully delivered. Thank you for shopping with C-HUB!'
  },
  ToReview: {
    label: 'To Review ⭐',
    icon: <Star className="w-3.5 h-3.5" />,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-950/40',
    step: 6,
    description: 'Rate and review your purchase to help other shoppers!'
  },
  Cancelled: {
    label: 'Cancelled',
    icon: <XCircle className="w-3.5 h-3.5" />,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-950/40',
    step: 0,
    description: 'This order has been cancelled.'
  }
};

// Helper to get status config with fallback
const getStatusConfig = (status: string): StatusConfig => {
  return statusConfigs[status as OrderStatus] || statusConfigs.Pending;
};

// Status progress bar component
const StatusProgress: React.FC<{ currentStatus: OrderStatus }> = ({ currentStatus }) => {
  const steps = ['Pending', 'Processing', 'Shipped', 'OutForDelivery', 'Delivered', 'ToReview'];
  const currentStep = statusConfigs[currentStatus]?.step || 0;
  
  // If cancelled, show different view
  if (currentStatus === 'Cancelled') {
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
          const statusKey = step as OrderStatus;
          const config = statusConfigs[statusKey];
          
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
                    isCurrent ? config.icon : <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    stepNum
                  )}
                </div>
                <span className={`text-[8px] mt-0.5 font-medium text-center truncate w-full ${
                  isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-stone-400 dark:text-stone-500'
                }`}>
                  {config.label.split(' ')[0]}
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
        {statusConfigs[currentStatus]?.description || ''}
      </p>
    </div>
  );
};

export const OrdersPage: React.FC = () => {
  const { orders, setPage } = useStore();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (orders.length === 0) {
    return (
      <div className="w-full max-w-[800px] mx-auto px-4 py-16 text-center space-y-6 animate-fadeIn">
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
        <button
          onClick={() => setPage('shop')}
          className="px-8 py-3.5 bg-stone-900 hover:bg-stone-800 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all shadow-xl hover:scale-105"
        >
          Explore Shop
        </button>
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
            Your Orders ({orders.length})
          </h1>
        </div>
        <button
          onClick={() => setPage('shop')}
          className="px-5 py-2.5 bg-stone-900 text-white dark:bg-indigo-500 dark:text-white hover:bg-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Shop More</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {orders.map((order) => {
          const status = order.status as OrderStatus;
          const statusConfig = getStatusConfig(status);
          const isExpanded = expandedOrder === order.orderId;
          const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);

          return (
            <div
              key={order.orderId}
              className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm transition-all hover:shadow-md"
            >
              {/* Top Bar of Order */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
                <div className="space-y-1">
                  <p className="text-xs text-stone-500 font-medium">Order Number</p>
                  <p className="text-lg font-black font-mono text-stone-900 dark:text-indigo-400">{order.orderId}</p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <span className="text-stone-500">{order.date}</span>
                  <span className={`px-3 py-1 rounded-full font-bold flex items-center gap-1.5 ${statusConfig.bgColor} ${statusConfig.color}`}>
                    {statusConfig.icon}
                    {statusConfig.label}
                  </span>
                </div>
              </div>

              {/* Status Progress Bar */}
              <div className="py-4">
                <StatusProgress currentStatus={status} />
              </div>

              {/* Order Items Summary */}
              <div 
                className="flex items-center justify-between cursor-pointer py-2"
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

                  {/* Action Buttons for Delivered orders */}
                  {status === 'Delivered' && (
                    <button
                      onClick={() => {
                        // Update order status to 'ToReview'
                        // You can implement this in StoreContext
                        showToast('Review feature coming soon! ⭐', 'info');
                      }}
                      className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Star className="w-4 h-4" />
                      <span>Rate & Review this Order</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};