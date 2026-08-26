import React from 'react';
import { useStore } from '../context/StoreContext';
import { Package, Clock, CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import { ProductVisual } from './ProductVisual';

export const OrdersPage: React.FC = () => {
  const { orders, setPage } = useStore();

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
          className="px-8 py-3.5 bg-stone-900 hover:bg-stone-800 text-white dark:bg-amber-400 dark:text-stone-950 font-bold text-xs uppercase tracking-wider rounded-full transition-all shadow-xl hover:scale-105"
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
          <span className="text-xs uppercase font-extrabold tracking-[0.25em] text-amber-600">
            Account History
          </span>
          <h1 className="text-3xl sm:text-4xl font-black font-serif text-stone-900 dark:text-white">
            Your Orders ({orders.length})
          </h1>
        </div>
        <button
          onClick={() => setPage('shop')}
          className="px-5 py-2.5 bg-stone-900 text-white dark:bg-stone-800 dark:text-white hover:bg-amber-400 hover:text-stone-950 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Shop More</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.orderId}
            className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6 transition-all hover:shadow-md"
          >
            {/* Top Bar of Order */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
              <div className="space-y-1">
                <p className="text-xs text-stone-500 font-medium">Order Number</p>
                <p className="text-lg font-black font-mono text-stone-900 dark:text-amber-400">{order.orderId}</p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <span className="text-stone-500">{order.date}</span>
                <span className="px-3 py-1 rounded-full font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {order.status}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
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
                      <p className="text-xs text-stone-400">Size: {item.size || 'M'} • Quantity: {item.qty}</p>
                    </div>
                  </div>
                  <p className="font-bold text-sm text-stone-900 dark:text-white font-serif">
                    ₱{(item.price * item.qty).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom Summary Details */}
            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1 text-stone-500">
                <p>Delivery to: <b className="text-stone-900 dark:text-white">{order.customer.name}</b> ({order.customer.phone})</p>
                <p>Payment: <b className="text-stone-900 dark:text-white">{order.payment}</b></p>
              </div>

              <div className="text-right space-y-0.5">
                {order.discount > 0 && (
                  <p className="text-emerald-600 font-bold">Discount: -₱{order.discount.toLocaleString()}</p>
                )}
                <p className="text-base font-black text-stone-900 dark:text-amber-400 font-serif">
                  Total Paid: ₱{order.total.toLocaleString()}
                </p>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
