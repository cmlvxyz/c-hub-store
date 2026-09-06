import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Order, PaymentInfo } from '../types';
import {
  CreditCard,
  Banknote,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCcw,
  ShieldCheck,
} from 'lucide-react';
import {
  PaymentAction,
  initiatePayment,
  sendPaymentDecision,
  retryPayment,
  isOnlinePayment,
} from '../service/payments';

// Visual metadata per payment status. Ang 'Paid' ay TANGI lamang nanggagaling
// sa backend payment record transition (mock gateway sa dev / real provider sa
// production) — HINDI mula sa button click dito sa frontend.
const STATUS_META: Record<string, { label: string; cls: string; box: string }> = {
  Pending: {
    label: 'Payment pending',
    cls: 'text-amber-600 dark:text-amber-400',
    box: 'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/25',
  },
  Processing: {
    label: 'Processing payment',
    cls: 'text-blue-600 dark:text-blue-400',
    box: 'border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/25',
  },
  Paid: {
    label: 'Payment received',
    cls: 'text-emerald-600 dark:text-emerald-400',
    box: 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/25',
  },
  Failed: {
    label: 'Payment failed',
    cls: 'text-red-600 dark:text-red-400',
    box: 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/25',
  },
  Cancelled: {
    label: 'Payment cancelled',
    cls: 'text-stone-500 dark:text-stone-400',
    box: 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40',
  },
  Refunded: {
    label: 'Payment refunded',
    cls: 'text-purple-600 dark:text-purple-400',
    box: 'border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/25',
  },
};

// Payment panel: ginagamit sa check-out confirmation at sa Orders (Pay Now).
// Ipinapakita ang totoong payment status na galing sa backend. Sa dev mode
// (mock gateway) ay may simulate buttons na nagbabago ng payment record sa
// backend — hindi ang UI. Kapag may real gateway na, ang panel na ito ay
// magpapakita lang ng status/instructions (disabled ang simulation).
export const PaymentPanel: React.FC<{ order: Order; onPaid?: () => void }> = ({ order, onPaid }) => {
  const { reflectOrderUpdate, showToast } = useStore();
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [unavailable, setUnavailable] = useState(false);

  const isOnline = isOnlinePayment(order.payment);
  const info: PaymentInfo = order.paymentInfo || {};
  const status = info.status || 'Pending';
  const meta = STATUS_META[status] || STATUS_META.Pending;
  const payStage = status === 'Processing' ? 1 : 0;

  // Kapag wala pang payment record sa backend para sa order (online),
  // buksan ito kapag nag-mount. Idempotent sa backend.
  useEffect(() => {
    if (!isOnline) return;
    if (status === 'Paid' || status === 'Refunded') return;
    if (!info.paymentId) {
      prepare();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  const prepare = async () => {
    setWorking(true);
    setError('');
    const res = await initiatePayment(
      order.orderId,
      order.payment,
      order.total,
      `${order.orderId}:${order.payment}`
    );
    setWorking(false);
    if (!res.success) {
      setError(res.error || 'Unable to prepare your payment. Please try again.');
      return;
    }
    if (res.gatewayAvailable === false) {
      setUnavailable(true);
      return;
    }
    if (res.order) reflectOrderUpdate(res.order as Order);
  };

  const runDecision = async (action: PaymentAction, successMsg: string, failMsg: string) => {
    if (!info.paymentId) return;
    setWorking(true);
    setError('');
    const res = await sendPaymentDecision(info.paymentId, action);
    setWorking(false);

    if (!res.success) {
      setError(res.error || 'Gateway simulation failed. Please try again.');
      showToast(res.error || failMsg, 'warning');
      return;
    }

    if (res.order) reflectOrderUpdate(res.order as Order);

    const newStatus = res.order?.paymentInfo?.status || res.payment?.status;
    if (newStatus === 'Paid') {
      showToast('Payment received — your order is now ready to ship.', 'success');
      onPaid?.();
    } else if (newStatus === 'Processing') {
      showToast(successMsg, 'info');
    } else if (newStatus === 'Failed') {
      showToast('Payment failed (simulated). You can retry.', 'warning');
    } else if (newStatus === 'Cancelled') {
      showToast('Payment cancelled (simulated). You can retry.', 'info');
    } else {
      showToast(successMsg, 'success');
    }
  };

  const handleRetry = async () => {
    if (!info.paymentId) return;
    setWorking(true);
    setError('');
    const res = await retryPayment(info.paymentId);
    setWorking(false);
    if (!res.success) {
      setError(res.error || 'Unable to retry payment. Please try again.');
      return;
    }
    if (res.order) reflectOrderUpdate(res.order as Order);
    showToast('Payment restarted (simulated).', 'info');
  };

  // ==== COD: hindi online, bayad sa pagdating ====
  if (!isOnline) {
    return (
      <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 text-xs">
        <p className="font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
          <Banknote className="w-3.5 h-3.5 text-stone-500" /> Payment: Pay ₱{order.total.toLocaleString()} when your parcel arrives
        </p>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-2xl border ${meta.box} text-xs space-y-3`}>
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className={`font-bold flex items-center gap-1.5 ${meta.cls}`}>
          <CreditCard className="w-3.5 h-3.5 shrink-0" /> {order.payment}: {meta.label}
        </p>
        {info.attempts != null && info.attempts > 1 && (
          <span className="text-[10px] text-stone-500">Attempt #{info.attempts}</span>
        )}
      </div>

      {/* Paid / Refunded / Unavailable terminal states */}
      {status === 'Paid' && (
        <div className="flex items-start gap-2 text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <p>
            We received your payment{info.paidAt ? ` on ${new Date(info.paidAt).toLocaleString()}` : ''}.
            Your order is now {order.status === 'To Ship' ? 'being prepared for shipment' : `in "${order.status}"`} status.
          </p>
        </div>
      )}

      {status === 'Refunded' && (
        <div className="flex items-start gap-2 text-purple-700 dark:text-purple-300">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <p>This payment has been refunded.</p>
        </div>
      )}

      {unavailable && (
        <div className="flex items-start gap-2 text-stone-600 dark:text-stone-300">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-stone-500" />
          <p>
            No online gateway is connected, so this checkout only recorded your order.
            Our team will coordinate your {order.payment} payment before dispatch.
          </p>
        </div>
      )}

      {/* Progress: Pending -> Processing -> Paid */}
      {(status === 'Pending' || status === 'Processing' || status === 'Failed' || status === 'Cancelled') && (
        <div className="flex items-center gap-1.5 mt-1">
          {['Pending', 'Processing', 'Paid'].map((step, idx) => {
            const done = idx <= payStage;
            const current = idx === payStage;
            return (
              <React.Fragment key={step}>
                {idx > 0 && <div className={`flex-1 h-0.5 rounded-full ${idx <= payStage ? 'bg-emerald-500' : 'bg-stone-200 dark:bg-stone-700'}`} />}
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0 ${
                    done
                      ? 'bg-emerald-500 text-white'
                      : current
                        ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                        : 'bg-stone-200 dark:bg-stone-700 text-stone-400'
                  }`}
                >
                  {done ? <CheckCircle2 className="w-2.5 h-2.5" /> : idx + 1}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Simulation controls (dev/mock gateway) */}
      {status === 'Pending' && info.paymentId && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => runDecision('pay', 'Payment authorized (simulated).', 'Payment step failed.')}
              disabled={working}
              className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
            >
              {working ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
              Simulate: Pay
            </button>
            <button
              onClick={() => runDecision('failed', 'Payment failed (simulated).', 'Payment step failed.')}
              disabled={working}
              className="flex-1 py-2 rounded-xl bg-white dark:bg-stone-800 border border-amber-200 dark:border-amber-800 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 disabled:opacity-50 font-bold text-xs uppercase tracking-wider transition-all"
            >
              Simulate: Fail
            </button>
          </div>
          <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-relaxed flex items-start gap-1">
            <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
            Development mode: simulated {order.payment} gateway. The order only becomes &quot;paid&quot; when the
            backend confirms — never from this screen. With a real gateway, this handshake happens elsewhere.
          </p>
        </div>
      )}

      {status === 'Processing' && info.paymentId && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => runDecision('confirmed', 'Payment confirmed — order ready to ship.', 'Payment confirmation failed.')}
              disabled={working}
              className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
            >
              {working ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Simulate: Confirm &amp; Get Paid
            </button>
            <button
              onClick={() => runDecision('cancelled', 'Payment cancelled (simulated).', 'Payment cancellation failed.')}
              disabled={working}
              className="flex-1 py-2 rounded-xl bg-white dark:bg-stone-800 border border-emerald-200 dark:border-emerald-800 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 disabled:opacity-50 font-bold text-xs uppercase tracking-wider transition-all"
            >
              Simulate: Cancel
            </button>
          </div>
          <p className="text-[10px] text-stone-500 dark:text-stone-400">
            Authorization received. Confirm the payment to record it as paid.
          </p>
        </div>
      )}

      {(status === 'Failed' || status === 'Cancelled') && info.paymentId && (
        <div className="space-y-2">
          {status === 'Failed' && info.failureReason && (
            <p className="text-[10px] text-red-600 dark:text-red-400">{info.failureReason}</p>
          )}
          <button
            onClick={handleRetry}
            disabled={working}
            className="w-full py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700/50 disabled:opacity-50 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
          >
            {working ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
            Retry Payment
          </button>
        </div>
      )}

      {error && (
        <p className="text-[11px] text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
};