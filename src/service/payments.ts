import { API_BASE_URL } from './api';
import { Order, PaymentInfo } from '../types';

// Payment layer ng store. Ito ang nag-iisang daan papunta sa backend payment
// endpoints. Walang sensitive na data (card number, OTP, atbp.) na pine-pass
// o ni-lo-log dito — tanging method, status, at reference.
//
// Sa kasalukuyan ang backend ay nasa 'mock' mode (dev simulator). Ang mga
// decision endpoint ay naka-403 kapag may real gateway na na-configure, kaya
// ang structure na ito ay hindi na kailangang palitan kapag nag-integrate na.

export type PaymentAction = 'pay' | 'confirmed' | 'failed' | 'cancelled' | 'refunded';

export interface PaymentResult {
  success: boolean;
  payment?: PaymentInfo | null;
  order?: Order | null;
  changed?: boolean;
  gatewayAvailable?: boolean | string;
  idempotent?: boolean;
  reason?: string;
  error?: string;
}

const request = async (url: string, init: RequestInit): Promise<PaymentResult> => {
  try {
    const response = await fetch(url, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    });
    const data = await response.json().catch(() => ({}));
    return { ...data, success: response.ok };
  } catch (error) {
    console.warn('⚠️ Payment request error:', error);
    return { success: false, error: 'NETWORK_ERROR' };
  }
};

// Magbukas ng payment para sa isang order (idempotent sa backend).
// Ang idempotencyKey ay naka-base sa orderId + method para hindi makalikha
// ng duplicate payment ang paulit-ulit na pag-click.
export const initiatePayment = (
  orderId: string,
  method: string,
  amount: number,
  idempotencyKey?: string
): Promise<PaymentResult> =>
  request(`${API_BASE_URL}/payments`, {
    method: 'POST',
    body: JSON.stringify({ orderId, method, amount, idempotencyKey }),
  });

// Mock-only decision (dev simulator ng kinalabasan ng gateway). Kapag may
// real gateway na, ito ay disabled sa backend at ito ay HINDI nangyayari sa
// frontend — ang paid state ay manggagaling sa webhook ng provider.
export const sendPaymentDecision = (
  paymentId: string,
  action: PaymentAction,
  reason?: string
): Promise<PaymentResult> =>
  request(`${API_BASE_URL}/payments/${paymentId}/decision`, {
    method: 'POST',
    body: JSON.stringify({ action, reason }),
  });

// Retry sa backend (Failed/Cancelled -> Pending, attempts+1). Mock-only.
export const retryPayment = (paymentId: string): Promise<PaymentResult> =>
  request(`${API_BASE_URL}/payments/${paymentId}/retry`, {
    method: 'POST',
    body: JSON.stringify({}),
  });

// Online payments = hindi COD.
export const isOnlinePayment = (method?: string): boolean => {
  if (!method) return false;
  const m = method.trim().toLowerCase();
  return m !== 'cash on delivery' && !m.includes('cod');
};