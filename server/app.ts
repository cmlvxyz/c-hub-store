// server/app.ts
// C-HUB Express API — Store + Admin share this same Turso database.
// This app is the backend for BOTH the Store frontend and the Admin frontend.
// It is compatible with Vercel serverless functions (exported as `app`) and
// with a long-running Node server (see server/index.ts).

import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import {
  requireSession, requireAdminSession, ROLE_DEFS, VALID_ROLES, DEFAULT_ADMIN_ROLE,
  getRolePermissions, hasPermission, createSession, hashPassword,
  createPasswordRecord, verifyPassword, logAdminAction, readAuditLogs,
  getNormalizedOrders, saveOrders, getProductsEnriched, upsertProduct, deleteProductById,
  readInventoryLogs, applyStockAdjustment, setProductStock, restoreOrderStock,
  readDeletedIds, writeDeletedIds, createNotification, notificationsForSession,
  notifyOrderUpdate, readVouchers, writeVouchers, findVoucherByCode,
  validateVoucher, recordVoucherUsage, sanitizeText, readReviews, writeReviews,
  getAdminRecordForEmail, sanitizeAdmin, getAllUsers, findUserByEmail,
  findUserByUsernameOrEmail, seedDefaultAdmin, sessionCount,
  DEFAULT_LOW_STOCK_THRESHOLD, CUSTOMER_CANCELLABLE, CUSTOMER_REFUNDABLE,
  ALLOWED_TRANSITIONS, applyOrderTransition, normalizeOrderStatus,
} from './helpers.js';
import { safeParse, toJSON } from './db.js';

export const app = express();

// ── CORS: allow dev hosts + Vercel deployments, configured via env ────────
const corsOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (corsOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      return callback(null, true);
    }
    return callback(null, origin); // allow same-origin and preflight safely
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '5mb' }));

// ── SSE broadcast (per-process) ───────────────────────────────────────────
const sseClients: { id: number; res: express.Response }[] = [];

export function broadcastSSE(event: string, data: any) {
  sseClients.forEach((client) => {
    try {
      client.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    } catch {
      /* client disconnected */
    }
  });
}

// Convenience for route handlers
const broadcast = broadcastSSE;

// ── HEALTH ────────────────────────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  try {
    const products = await getProductsEnriched();
    const orders = await getNormalizedOrders();
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      orders: orders.length,
      products: products.length,
      sessions: await sessionCount(),
    });
  } catch (e) {
    res.status(500).json({ status: 'error', error: (e as Error).message });
  }
});

// ===========================================================================
// PRODUCTS
// ===========================================================================
app.get('/api/products', async (_req, res) => {
  try {
    res.json(await getProductsEnriched());
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const products = await getProductsEnriched();
    const product = products.find((p) => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// POST /api/products — create a new product (Admin)
app.post('/api/products', async (req, res) => {
  try {
    const session = await requireAdminSession(req, res, ['products.manage']);
    if (!session) return;
    const { id, sku, name, category, subCategory, price, stock } = req.body || {};
    if (!id || !name) return res.status(400).json({ error: 'id and name are required' });
    if (!Number.isFinite(Number(price)) || Number(price) < 0) return res.status(400).json({ error: 'Valid price is required' });

    const products = await getProductsEnriched();
    if (products.some((p) => p.id === id)) return res.status(409).json({ error: 'A product with this ID already exists' });
    if (products.some((p) => p.sku && p.sku === sku)) return res.status(409).json({ error: 'A product with this SKU already exists' });

    const now = new Date().toISOString();
    const product = {
      id,
      sku: sku || `CHUB-${String(id).toUpperCase().replace(/[^A-Z0-9]/g, '')}-${Date.now().toString().slice(-4)}`,
      name,
      category: category || 'Apparel',
      subCategory: subCategory || 'General',
      price: Number(price),
      originalPrice: Number(req.body?.originalPrice) || Number(price),
      costPrice: Number(req.body?.costPrice) || 0,
      brand: req.body?.brand || 'C-HUB Originals',
      image: req.body?.image || '',
      colorName: req.body?.colorName || '',
      color: req.body?.color || '',
      bgColor: req.body?.bgColor || '',
      textColor: req.body?.textColor || '',
      sizes: Array.isArray(req.body?.sizes) ? req.body.sizes : [],
      colors: Array.isArray(req.body?.colors) ? req.body.colors : [],
      stock: Math.max(0, Math.round(Number(stock) || 0)),
      reservedStock: Math.max(0, Math.round(Number(req.body?.reservedStock) || 0)),
      lowStockThreshold: Number.isFinite(Number(req.body?.lowStockThreshold)) ? Number(req.body?.lowStockThreshold) : DEFAULT_LOW_STOCK_THRESHOLD,
      reorderPoint: Math.max(0, Math.round(Number(req.body?.reorderPoint) || 0)),
      reorderQty: Math.max(0, Math.round(Number(req.body?.reorderQty) || 0)),
      status: req.body?.status || '',
      channelSync: req.body?.channelSync || { web: true, shopee: false, lazada: false, tiktok: false },
      supplier: req.body?.supplier || null,
      salesVelocity7d: Number(req.body?.salesVelocity7d) || 0,
      createdAt: now,
      updatedAt: now,
    };
    products.push(product);
    await upsertProduct(product);
    await broadcastSEEFlush('inventory-updated', product);
    if (session) await logAdminAction(session, 'product.create', product.id, `Product created: ${product.name}`, { price: product.price, stock: product.stock, sku: product.sku });
    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('❌ Create product error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Helper to keep SSE broadcast after DB flush
async function broadcastSEEFlush(event: string, data: any) {
  broadcastSSE(event, data);
}

// PATCH /api/products/:id — update product fields (Admin)
app.patch('/api/products/:id', async (req, res) => {
  try {
    const session = await requireAdminSession(req, res, ['products.manage']);
    if (!session) return;
    const products = await getProductsEnriched();
    const idx = products.findIndex((p) => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Product not found' });

    const { stock, lowStockThreshold, ...rest } = req.body || {};
    const product = products[idx];
    const prevStock = Math.floor(Number(product.stock) || 0);
    const nextStock = Number.isFinite(Number(stock)) ? Math.max(0, Math.round(Number(stock))) : prevStock;

    products[idx] = {
      ...product,
      ...rest,
      stock: nextStock,
      lowStockThreshold: Number.isFinite(Number(req.body?.lowStockThreshold)) ? Number(req.body?.lowStockThreshold) : product.lowStockThreshold,
      updatedAt: new Date().toISOString(),
    };
    await upsertProduct(products[idx]);
    if (nextStock !== prevStock) {
      await logInventoryChangeEntry({
        productId: products[idx].id, sku: products[idx].sku, name: products[idx].name,
        previousQty: prevStock, newQty: nextStock, adjustment: nextStock - prevStock,
        reason: 'Product stock updated', user: req.body?.user || 'admin',
      });
    }
    broadcastSSE('inventory-updated', products[idx]);
    await logAdminAction(session, 'product.update', products[idx].id, `Product updated: ${products[idx].name}${nextStock !== prevStock ? ` · stock ${prevStock} → ${nextStock}` : ''}`, { stock: nextStock, prevStock, fields: Object.keys(req.body || {}) });
    res.json({ success: true, product: products[idx] });
  } catch (error) {
    console.error('❌ Update product error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

import { logInventoryChange as logInventoryChangeEntry } from './helpers.js';

// POST /api/products/:id/adjust — adjust stock by N (Admin)
app.post('/api/products/:id/adjust', async (req, res) => {
  try {
    const session = await requireAdminSession(req, res, ['products.manage', 'inventory.manage']);
    if (!session) return;
    const delta = Number(req.body?.adjustment ?? req.body?.delta);
    if (!Number.isFinite(delta) || delta === 0) return res.status(400).json({ error: 'Adjustment must be a non-zero number' });
    const result = await applyStockAdjustment(req.params.id, delta, req.body?.reason || 'Manual adjustment', req.body?.user || 'admin');
    if (!result.ok) return res.status(400).json({ error: result.error });
    broadcastSSE('inventory-updated', result.product);
    await logAdminAction(session, 'inventory.adjust', req.params.id, `Stock adjusted by ${delta > 0 ? '+' : ''}${delta} (${req.body?.reason || 'Manual adjustment'})`, { adjustment: delta, reason: req.body?.reason || 'Manual adjustment', newQty: result.product.stock });
    res.json({ success: true, product: result.product });
  } catch (error) {
    console.error('❌ Adjust stock error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// DELETE /api/products/:id (Admin)
app.delete('/api/products/:id', async (req, res) => {
  try {
    const session = await requireAdminSession(req, res, ['products.manage']);
    if (!session) return;
    const products = await getProductsEnriched();
    const idx = products.findIndex((p) => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Product not found' });
    const [removed] = products.splice(idx, 1);
    await deleteProductById(removed.id);
    await logInventoryChangeEntry({
      productId: removed.id, sku: removed.sku, name: removed.name,
      previousQty: Number(removed.stock) || 0, newQty: 0,
      adjustment: -(Number(removed.stock) || 0), reason: 'Product deleted',
      user: req.body?.user || 'admin',
    });
    broadcastSSE('inventory-updated', { id: removed.id, deleted: true });
    await logAdminAction(session, 'product.delete', removed.id, `Product deleted: ${removed.name}`, { sku: removed.sku });
    res.json({ success: true, deleted: removed.id });
  } catch (error) {
    console.error('❌ Delete product error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/inventory/history (Admin)
app.get('/api/inventory/history', async (req, res) => {
  const session = await requireAdminSession(req, res, ['inventory.view']);
  if (!session) return;
  const logs = await readInventoryLogs(String(req.query.productId || ''), Number(req.query.limit) || 500);
  res.json(logs);
});

// ===========================================================================
// ORDERS
// ===========================================================================
app.get('/api/orders', async (req, res) => {
  const session = await requireSession(req, res);
  if (!session) return;
  const { status } = req.query;
  let orders = await getNormalizedOrders();
  if (!session.isAdmin) {
    orders = orders.filter((o) => o.customer?.email?.toLowerCase() === session.email || o.customer?.name?.toLowerCase() === session.name?.toLowerCase());
  }
  if (status && status !== 'ALL') {
    orders = orders.filter((o) => o.status?.toLowerCase() === String(status).toLowerCase());
  }
  res.json(orders);
});

app.get('/api/orders/:id', async (req, res) => {
  const session = await requireSession(req, res);
  if (!session) return;
  const orders = await getNormalizedOrders();
  const order = orders.find((o) => o.orderId === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (!session.isAdmin && !(order.customer?.email?.toLowerCase() === session.email || order.customer?.name?.toLowerCase() === session.name?.toLowerCase())) {
    return res.status(403).json({ error: 'You do not have access to this order.' });
  }
  res.json(order);
});

// GET /api/orders/:id/tracking
app.get('/api/orders/:id/tracking', async (req, res) => {
  const session = await requireSession(req, res);
  if (!session) return;
  const orders = await getNormalizedOrders();
  const order = orders.find((o) => o.orderId === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (!session.isAdmin && !(order.customer?.email?.toLowerCase() === session.email || order.customer?.name?.toLowerCase() === session.name?.toLowerCase())) {
    return res.status(403).json({ error: 'You do not have access to this order.' });
  }
  const history = Array.isArray(order.statusHistory) && order.statusHistory.length
    ? order.statusHistory
    : [{ status: order.status, timestamp: order.createdAt || new Date().toISOString(), by: 'system', note: 'Order received' }];
  res.json({
    success: true,
    order: {
      orderId: order.orderId,
      date: order.date,
      createdAt: order.createdAt,
      status: order.status,
      updatedAt: order.updatedAt,
      statusHistory: history,
      items: (order.items || []).map((i) => ({ name: i.name, qty: i.qty, price: i.price, image: i.image, size: i.size, color: i.color, id: i.id })),
      total: order.total,
      payment: order.payment,
      customer: { name: order.customer?.name, email: order.customer?.email, address: order.customer?.address },
      fulfillment: order.fulfillment || null,
      paymentInfo: { status: order.paymentInfo?.status, paidAt: order.paymentInfo?.paidAt, method: order.paymentInfo?.method || order.payment },
    },
  });
});

// POST /api/orders — create order (Store checkout)
app.post('/api/orders', async (req, res) => {
  try {
    const orders = await getNormalizedOrders();
    const products = await getProductsEnriched();
    const { customer, items, payment, subtotal, shipping, discount, discountCode, total } = req.body;

    if (!items || items.length === 0) return res.status(400).json({ error: 'No items in order' });

    const orderId = req.body.orderId || `CHUB-${Math.floor(100000 + Math.random() * 900000)}`;
    const existing = orders.find((o) => o.orderId === orderId);
    if (existing) return res.status(200).json({ success: true, order: existing, duplicate: true });

    // Deduct stock atomically per product (never negative)
    const stockErrors: any[] = [];
    const productsToSave = [...products];
    for (const orderItem of items) {
      const prodIndex = productsToSave.findIndex((p) => p.id === orderItem.id);
      if (prodIndex === -1) { stockErrors.push({ id: orderItem.id, error: 'Product not found in the catalog' }); continue; }
      const qty = Math.floor(Number(orderItem.qty) || 1);
      if (qty <= 0) { stockErrors.push({ id: orderItem.id, error: 'Quantity must be at least 1' }); continue; }
      const available = Math.floor(Number(productsToSave[prodIndex].stock) || 0);
      if (qty > available) stockErrors.push({ id: orderItem.id, name: productsToSave[prodIndex].name, requested: qty, available });
    }
    if (stockErrors.length > 0) {
      const insufficient = stockErrors.filter((e) => Number.isFinite(e.available) && e.available < e.requested);
      return res.status(409).json({
        success: false,
        error: insufficient.length ? 'Insufficient stock for some items.' : 'Unable to place order: some items are unavailable.',
        insufficientStock: insufficient,
      });
    }

    // Voucher validation (server-authoritative)
    const cleanDiscountCode = String(discountCode || '').trim().toUpperCase();
    let authorizedDiscount = Math.max(0, Number(discount) || 0);
    let voucherApplied: any = null;
    if (cleanDiscountCode) {
      const baseSubtotal = Math.max(0, Number(subtotal) || 0);
      const voucher = await findVoucherByCode(cleanDiscountCode);
      const identityKey = String(customer?.email || req.body.customerEmail || '').toLowerCase();
      const result = validateVoucher(voucher, baseSubtotal, identityKey);
      if (!result.ok) return res.status(400).json({ success: false, error: result.reason });
      authorizedDiscount = result.discountAmount;
      voucherApplied = { ...result.voucher, discountAmount: result.discountAmount };
    }

    // Deduct stock — persist only the affected products (NOT the whole catalog)
    for (const orderItem of items) {
      const prodIndex = productsToSave.findIndex((p) => p.id === orderItem.id);
      const product = productsToSave[prodIndex];
      const qty = Math.floor(Number(orderItem.qty) || 1);
      const prev = Math.floor(Number(product.stock) || 0);
      const next = prev - qty;
      productsToSave[prodIndex] = { ...product, stock: next, updatedAt: new Date().toISOString() };
      await upsertProduct(productsToSave[prodIndex]);
      await logInventoryChangeEntry({
        productId: product.id, sku: product.sku, name: product.name,
        previousQty: prev, newQty: next, adjustment: -qty,
        reason: `Order ${orderId} placed — stock deducted`, user: customer?.email || 'customer',
      });
    }

    const initialStatus = 'Pending';
    const newOrder: any = {
      orderId,
      date: req.body.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [{ status: initialStatus, timestamp: new Date().toISOString(), by: 'system', note: 'Order received' }],
      customer: customer || { name: req.body.customerName || 'Customer', email: req.body.customerEmail || '', phone: req.body.customerPhone || '', address: req.body.shippingAddress?.address || '' },
      items,
      subtotal: subtotal || 0,
      shipping: shipping || 0,
      discount: cleanDiscountCode ? authorizedDiscount : (discount || 0),
      discountCode: cleanDiscountCode ? cleanDiscountCode : (discountCode || ''),
      total: cleanDiscountCode ? Math.max(0, (subtotal || 0) - authorizedDiscount + (shipping || 0)) : (total || subtotal || 0),
      payment: payment || 'Cash on Delivery',
      status: initialStatus,
      paymentInfo: req.body.paymentInfo || { method: payment || 'Cash on Delivery', status: 'Pending', provider: 'cod' },
      channel: req.body.channel || 'Online Store',
    };

    orders.unshift(newOrder);
    await saveOrders(orders);

    if (voucherApplied) {
      const vouchers = await readVouchers();
      const vIdx = vouchers.findIndex((v) => v.id === voucherApplied.id);
      if (vIdx !== -1) {
        const identityKey = String(customer?.email || req.body.customerEmail || '').toLowerCase();
        vouchers[vIdx] = recordVoucherUsage(vouchers[vIdx], identityKey);
        await writeVouchers(vouchers);
        broadcastSSE('vouchers-updated', vouchers[vIdx]);
      }
    }

    broadcastSSE('new-order', newOrder);
    await createNotification({
      email: customer?.email || req.body.customerEmail || '',
      username: '',
      message: `Your order ${newOrder.orderId} has been placed successfully.`,
      type: 'success',
      orderId: newOrder.orderId,
    });
    res.status(201).json({ success: true, order: newOrder });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/orders/sync — sync localStorage orders (Store)
app.post('/api/orders/sync', async (req, res) => {
  try {
    const session = await requireSession(req, res);
    if (!session) return;
    const allIncoming = Array.isArray(req.body) ? req.body : (req.body?.orders || []);
    if (!Array.isArray(allIncoming) || allIncoming.length === 0) return res.status(400).json({ error: 'No orders to sync' });
    const incoming = session.isAdmin ? allIncoming : allIncoming.filter((o) => o.customer?.email?.toLowerCase() === session.email || o.customer?.name === session.name);
    if (incoming.length === 0) return res.json({ success: true, added: 0, updated: 0, skipped: allIncoming.length, total: 0 });

    const orders = await getNormalizedOrders();
    const deletedIds = await readDeletedIds();
    let added = 0, updated = 0, skipped = 0;

    for (const incomingOrder of incoming) {
      if (!incomingOrder?.orderId) continue;
      if (deletedIds.includes(incomingOrder.orderId)) { skipped++; continue; }
      const index = orders.findIndex((o) => o.orderId === incomingOrder.orderId);
      if (index !== -1) {
        const serverStatus = orders[index].status;
        const serverPaymentInfo = orders[index].paymentInfo || incomingOrder.paymentInfo;
        orders[index] = {
          ...orders[index], ...incomingOrder,
          status: serverStatus, paymentInfo: serverPaymentInfo,
          updatedAt: new Date().toISOString(),
        };
        updated++;
      } else {
        orders.unshift({
          ...incomingOrder,
          status: 'Pending',
          createdAt: incomingOrder.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          statusHistory: Array.isArray(incomingOrder.statusHistory) && incomingOrder.statusHistory.length
            ? incomingOrder.statusHistory
            : [{ status: 'Pending', timestamp: new Date().toISOString(), by: 'system', note: 'Order received' }],
          customer: incomingOrder.customer || { name: incomingOrder.customerName || 'Customer', email: incomingOrder.customerEmail || '', phone: incomingOrder.customerPhone || '', address: incomingOrder.shippingAddress?.address || '' },
        });
        added++;
        broadcastSSE('new-order', orders[0]);
      }
    }
    await saveOrders(orders);
    res.json({ success: true, added, updated, skipped, total: orders.length });
  } catch (error) {
    console.error('❌ Error syncing orders:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// PATCH /api/orders/:id — admin status update (validated transitions)
app.patch('/api/orders/:id', async (req, res) => {
  try {
    const session = await requireAdminSession(req, res, ['orders.manage']);
    if (!session) return;
    const { id } = req.params;
    const orders = await getNormalizedOrders();
    const index = orders.findIndex((o) => o.orderId === id);
    if (index === -1) return res.status(404).json({ error: 'Order not found' });
    const prevStatus = orders[index].status;

    if (req.body?.status) {
      const result = applyOrderTransition(orders[index], req.body.status, 'admin', (req.body.note || `Status updated to ${req.body.status}`));
      if (!result.ok) return res.status(400).json({ error: result.error, allowed: result.allowed });
      orders[index] = {
        ...orders[index],
        status: result.order.status,
        ...(req.body.note ? { note: req.body.note } : {}),
        ...(req.body.fulfillment ? { fulfillment: { ...(orders[index].fulfillment || {}), ...req.body.fulfillment } } : {}),
        statusHistory: result.order.statusHistory,
        updatedAt: result.order.updatedAt,
      };
    } else {
      orders[index] = { ...orders[index], ...req.body, updatedAt: new Date().toISOString() };
    }

    await saveOrders(orders);

    if (orders[index].status === 'Cancelled' || orders[index].status === 'Returned') {
      const restored = await restoreOrderStock(orders[index], `Order ${orders[index].status.toLowerCase()} — stock restored`, 'admin');
      orders[index] = restored.order;
      await saveOrders(orders);
    }

    broadcastSSE('order-updated', orders[index]);
    if (req.body?.status) await notifyOrderUpdate(orders[index], orders[index].status);
    await logAdminAction(
      session, 'order.update', id,
      req.body?.status ? `Order status: ${prevStatus} → ${orders[index].status}` : 'Order details updated',
      { fromStatus: prevStatus, toStatus: orders[index].status, note: req.body.note || '', fields: Object.keys(req.body || {}) },
    );
    res.json({ success: true, order: orders[index], changed: true });
  } catch (error) {
    console.error('❌ Error updating order:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST Order customer actions: cancel / refund-request / return-request / complete
app.post('/api/orders/:id/cancel', async (req, res) => {
  try {
    const session = await requireSession(req, res);
    if (!session) return;
    const orders = await getNormalizedOrders();
    const index = orders.findIndex((o) => o.orderId === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Order not found' });
    if (!(orders[index].customer?.email?.toLowerCase() === session.email || orders[index].customer?.name === session.name)) return res.status(403).json({ error: 'You do not have access to this order.' });
    const current = normalizeOrderStatus(orders[index].status);
    if (!CUSTOMER_CANCELLABLE.includes(current)) return res.status(400).json({ error: `Order can only be cancelled while ${CUSTOMER_CANCELLABLE.join(' / ')} (current: ${current})` });
    const result = applyOrderTransition(orders[index], 'Cancelled', 'customer', (req.body?.reason || 'Cancelled by customer').trim());
    orders[index] = result.order;
    if (result.changed) {
      const restored = await restoreOrderStock(orders[index], 'Order cancelled by customer — stock restored', req.body?.email || 'customer');
      orders[index] = restored.order;
    }
    await saveOrders(orders);
    broadcastSSE('order-updated', orders[index]);
    await notifyOrderUpdate(orders[index], 'Cancelled', `Your order ${orders[index].orderId} has been cancelled.`);
    res.json({ success: true, order: orders[index] });
  } catch (error) {
    console.error('❌ Error cancelling order:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/orders/:id/refund-request', async (req, res) => {
  try {
    const session = await requireSession(req, res);
    if (!session) return;
    const orders = await getNormalizedOrders();
    const index = orders.findIndex((o) => o.orderId === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Order not found' });
    if (!(orders[index].customer?.email?.toLowerCase() === session.email || orders[index].customer?.name === session.name)) return res.status(403).json({ error: 'You do not have access to this order.' });
    const current = normalizeOrderStatus(orders[index].status);
    if (!CUSTOMER_REFUNDABLE.includes(current)) return res.status(400).json({ error: `Refund can only be requested while ${CUSTOMER_REFUNDABLE.join(' / ')} (current: ${current})` });
    if (orders[index].paymentInfo?.status !== 'Paid' && orders[index].paymentInfo?.status !== 'Refunded') return res.status(400).json({ error: 'Refund request requires a paid order. The payment was not yet received.' });
    if (orders[index].paymentInfo?.status === 'Refunded') return res.status(400).json({ error: 'This order has already been refunded.' });
    const reason = String(req.body?.reason || '').trim();
    if (reason.length < 5) return res.status(400).json({ error: 'Please provide a reason for your refund request (at least 5 characters).' });
    const result = applyOrderTransition(orders[index], 'Refund Requested', 'customer', reason);
    orders[index] = { ...result.order, refundRequest: { reason, requestedAt: new Date().toISOString() } };
    await saveOrders(orders);
    broadcastSSE('order-updated', orders[index]);
    res.json({ success: true, order: orders[index] });
  } catch (error) {
    console.error('❌ Error requesting refund:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/orders/:id/return-request', async (req, res) => {
  try {
    const session = await requireSession(req, res);
    if (!session) return;
    const orders = await getNormalizedOrders();
    const index = orders.findIndex((o) => o.orderId === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Order not found' });
    if (!(orders[index].customer?.email?.toLowerCase() === session.email || orders[index].customer?.name === session.name)) return res.status(403).json({ error: 'You do not have access to this order.' });
    const current = normalizeOrderStatus(orders[index].status);
    if (!CUSTOMER_REFUNDABLE.includes(current)) return res.status(400).json({ error: `Return can only be requested while ${CUSTOMER_REFUNDABLE.join(' / ')} (current: ${current})` });
    const reason = String(req.body?.reason || '').trim();
    if (reason.length < 5) return res.status(400).json({ error: 'Please provide a reason for your return request (at least 5 characters).' });
    const result = applyOrderTransition(orders[index], 'Return Requested', 'customer', reason);
    orders[index] = { ...result.order, returnRequest: { reason, requestedAt: new Date().toISOString() } };
    await saveOrders(orders);
    broadcastSSE('order-updated', orders[index]);
    res.json({ success: true, order: orders[index] });
  } catch (error) {
    console.error('❌ Error requesting return:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/orders/:id/complete', async (req, res) => {
  try {
    const session = await requireSession(req, res);
    if (!session) return;
    const orders = await getNormalizedOrders();
    const index = orders.findIndex((o) => o.orderId === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Order not found' });
    if (!(orders[index].customer?.email?.toLowerCase() === session.email || orders[index].customer?.name === session.name)) return res.status(403).json({ error: 'You do not have access to this order.' });
    const current = normalizeOrderStatus(orders[index].status);
    if (current !== 'To Review') return res.status(400).json({ error: `Order can only be completed from To Review (current: ${current})` });
    const result = applyOrderTransition(orders[index], 'Completed', 'customer', 'Order completed after review');
    orders[index] = result.order;
    await saveOrders(orders);
    broadcastSSE('order-updated', orders[index]);
    await notifyOrderUpdate(orders[index], 'Completed', `Order ${orders[index].orderId} has been completed.`);
    res.json({ success: true, order: orders[index] });
  } catch (error) {
    console.error('❌ Error completing order:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/admin/orders/:id/refund-decision — Admin
app.post('/api/admin/orders/:id/refund-decision', async (req, res) => {
  try {
    const session = await requireAdminSession(req, res, ['refunds.manage']);
    if (!session) return;
    const orders = await getNormalizedOrders();
    const index = orders.findIndex((o) => o.orderId === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Order not found' });
    const current = normalizeOrderStatus(orders[index].status);
    if (current !== 'Refund Requested') return res.status(400).json({ error: `Refund decision requires a 'Refund Requested' order (current: ${current})` });
    const approve = req.body?.approve === true;
    const note = String(req.body?.note || '').trim();
    const decidedAt = new Date().toISOString();
    const by = session.email || session.username || 'admin';

    if (approve) {
      const amount = Math.max(0, Number(req.body?.amount) || Number(orders[index].total) || 0);
      const method = String(req.body?.method || 'Original payment method').trim();
      const result = applyOrderTransition(orders[index], 'Refunded', 'admin', note || `Refund of ₱${amount} issued via ${method}`);
      if (!result.ok) return res.status(400).json({ error: result.error });
      orders[index] = {
        ...result.order,
        paymentInfo: { ...(result.order.paymentInfo || {}), status: 'Refunded', refundStatus: 'Refunded' },
        refund: { status: 'approved', amount, method, note, decidedAt, by },
        refundedAt: decidedAt,
      };
      await createNotification({ email: orders[index].customer?.email, username: orders[index].customer?.name, message: `Your refund for ${orders[index].orderId} of ₱${amount.toLocaleString()} has been approved and issued via ${method}.`, type: 'success', orderId: orders[index].orderId });
    } else {
      const result = applyOrderTransition(orders[index], 'Completed', 'admin', note || 'Refund request declined by C-HUB');
      if (!result.ok) return res.status(400).json({ error: result.error });
      orders[index] = {
        ...result.order,
        refundRequest: { ...(orders[index].refundRequest || {}), denied: { note, decidedAt, by } },
        refund: { status: 'denied', note, decidedAt, by },
      };
      await createNotification({ email: orders[index].customer?.email, username: orders[index].customer?.name, message: `Your refund request for ${orders[index].orderId} was declined${note ? `: ${note}` : ''}.`, type: 'warning', orderId: orders[index].orderId });
    }
    await saveOrders(orders);
    broadcastSSE('order-updated', orders[index]);
    await logAdminAction(session, 'refund.decision', orders[index].orderId, approve ? `Refund approved · ₱${Number(orders[index].refund.amount || 0).toLocaleString()} via ${orders[index].refund.method || 'Original payment method'}` : 'Refund request denied', { approve, amount: approve ? Number(orders[index].refund.amount || 0) : 0, method: approve ? orders[index].refund.method : undefined, note: note || undefined });
    res.json({ success: true, order: orders[index] });
  } catch (error) {
    console.error('❌ Error processing refund decision:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/admin/orders/:id/return-decision — Admin
app.post('/api/admin/orders/:id/return-decision', async (req, res) => {
  try {
    const session = await requireAdminSession(req, res, ['refunds.manage']);
    if (!session) return;
    const orders = await getNormalizedOrders();
    const index = orders.findIndex((o) => o.orderId === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Order not found' });
    const current = normalizeOrderStatus(orders[index].status);
    if (current !== 'Return Requested') return res.status(400).json({ error: `Return decision requires a 'Return Requested' order (current: ${current})` });
    const approve = req.body?.approve === true;
    const note = String(req.body?.note || '').trim();
    const decidedAt = new Date().toISOString();
    const by = session.email || session.username || 'admin';

    if (approve) {
      const result = applyOrderTransition(orders[index], 'Returned', 'admin', note || 'Return approved by C-HUB');
      if (!result.ok) return res.status(400).json({ error: result.error });
      let orderItem = result.order;
      const restocked = await restoreOrderStock(orderItem, 'Order returned — stock restored', by);
      orderItem = restocked.order;
      orders[index] = {
        ...orderItem,
        returnRequest: { ...(orders[index].returnRequest || {}), approved: { note, decidedAt, by } },
        returnRef: { status: 'approved', note, decidedAt, by },
        returnedAt: decidedAt,
      };
      await createNotification({ email: orders[index].customer?.email, username: orders[index].customer?.name, message: `Your return for ${orders[index].orderId} has been approved.${note ? ` Note: ${note}` : ''}`, type: 'success', orderId: orders[index].orderId });
    } else {
      const result = applyOrderTransition(orders[index], 'Completed', 'admin', note || 'Return request declined by C-HUB');
      if (!result.ok) return res.status(400).json({ error: result.error });
      orders[index] = {
        ...result.order,
        returnRequest: { ...(orders[index].returnRequest || {}), denied: { note, decidedAt, by } },
        returnRef: { status: 'denied', note, decidedAt, by },
      };
      await createNotification({ email: orders[index].customer?.email, username: orders[index].customer?.name, message: `Your return request for ${orders[index].orderId} was declined${note ? `: ${note}` : ''}.`, type: 'warning', orderId: orders[index].orderId });
    }
    await saveOrders(orders);
    broadcastSSE('order-updated', orders[index]);
    await logAdminAction(session, 'return.decision', orders[index].orderId, approve ? 'Return approved · stock restored' : 'Return request denied', { approve, note: note || undefined });
    res.json({ success: true, order: orders[index] });
  } catch (error) {
    console.error('❌ Error processing return decision:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// DELETE /api/orders/:id — admin only, tombstone to prevent /sync resurrection
app.delete('/api/orders/:id', async (req, res) => {
  try {
    const session = await requireAdminSession(req, res, ['orders.manage']);
    if (!session) return;
    const { id } = req.params;
    const orders = await getNormalizedOrders();
    const filtered = orders.filter((o) => o.orderId !== id);
    if (filtered.length === orders.length) return res.status(404).json({ error: 'Order not found' });
    await saveOrders(filtered);
    const deletedIds = await readDeletedIds();
    if (!deletedIds.includes(id)) deletedIds.push(id);
    await writeDeletedIds(deletedIds);
    await logAdminAction(session, 'order.delete', id, `Order ${id} deleted`);
    broadcastSSE('order-deleted', { orderId: id });
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting order:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// ===========================================================================
// PAYMENTS (mock gateway — same behavior as the previous provider)
// ===========================================================================
const paymentMode = process.env.PAYMENT_PROVIDER && process.env.NODE_ENV !== 'production' ? process.env.PAYMENT_PROVIDER : 'mock';

const payments: any[] = [];

function findPayment(paymentId: string) {
  return payments.find((p) => p.paymentId === paymentId) || null;
}

function transitionPayment(paymentId: string, action: string, reason?: string) {
  const payment = findPayment(paymentId);
  if (!payment) return { error: 'Payment not found', payment: null };
  const allowed = ['pay', 'confirmed', 'failed', 'cancelled', 'refunded'];
  if (!allowed.includes(action)) return { error: `Invalid action. Allowed: ${allowed.join(', ')}`, payment };
  const now = new Date().toISOString();
  switch (action) {
    case 'pay': payment.status = 'Processing'; break;
    case 'confirmed': payment.status = 'Paid'; payment.paidAt = now; break;
    case 'failed': payment.status = 'Failed'; payment.failureReason = reason || 'Payment failed'; break;
    case 'cancelled': payment.status = 'Cancelled'; payment.cancelledAt = now; break;
    case 'refunded': payment.status = 'Refunded'; payment.refundedAt = now; break;
  }
  payment.attempts = Number(payment.attempts || 0) + 1;
  return { payment, changed: true, error: null };
}

function retryPayment(paymentId: string) {
  const payment = findPayment(paymentId);
  if (!payment) return { error: 'Payment not found' };
  payment.status = 'Pending';
  payment.attempts = Number(payment.attempts || 0) + 1;
  return { payment };
}

app.post('/api/payments', async (req, res) => {
  try {
    const { orderId, method, amount, idempotencyKey } = req.body || {};
    if (!orderId) return res.status(400).json({ error: 'orderId is required' });
    const orders = await getNormalizedOrders();
    const idx = orders.findIndex((o) => o.orderId === orderId);
    if (idx === -1) return res.status(404).json({ error: 'Order not found' });
    const order = orders[idx];
    if (order.status === 'Cancelled') return res.status(409).json({ error: 'Order is cancelled' });
    if (order.paymentInfo?.status === 'Paid' || order.paymentInfo?.status === 'Refunded') {
      return res.json({ success: true, payment: order.paymentInfo, order, gatewayAvailable: 'mock', idempotent: true });
    }
    const existing = payments.find((p) => p.orderId === orderId && (!idempotencyKey || p.idempotencyKey === idempotencyKey));
    if (existing) {
      return res.json({ success: true, payment: existing, order, gatewayAvailable: 'mock', idempotent: true });
    }
    const payment = {
      paymentId: `pay-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      orderId,
      method: method || order.payment || 'Cash on Delivery',
      amount: typeof amount === 'number' ? amount : Number(order.total) || 0,
      status: 'Pending',
      provider: 'mock',
      currency: 'PHP',
      attempts: 0,
      idempotencyKey: idempotencyKey || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    payments.push(payment);
    const updatedOrder = { ...order, paymentInfo: { ...(order.paymentInfo || {}), paymentId: payment.paymentId, method: payment.method, status: payment.status, provider: payment.provider, amount: payment.amount, currency: payment.currency, attempts: payment.attempts } };
    orders[idx] = updatedOrder;
    await saveOrders(orders);
    broadcastSSE('order-updated', updatedOrder);
    res.status(201).json({ success: true, payment, order: updatedOrder, gatewayAvailable: 'mock', idempotent: false });
  } catch (error) {
    console.error('❌ Error initiating payment:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/payments/:paymentId/decision', async (req, res) => {
  try {
    if (paymentMode !== 'mock') return res.status(403).json({ error: 'Mock decision endpoint is disabled when a real payment gateway is configured.' });
    const { paymentId } = req.params;
    const { action, reason } = req.body || {};
    const result = transitionPayment(paymentId, action, reason);
    if (result.error || !result.payment) return res.status(400).json({ error: result.error, payment: result.payment, changed: false });
    const payment = result.payment;
    let updated: any = null;
    if (payment.orderId) {
      const orders = await getNormalizedOrders();
      const idx = orders.findIndex((o) => o.orderId === payment.orderId);
      if (idx !== -1) {
        const pInfo = { ...(orders[idx].paymentInfo || {}), paymentId: payment.paymentId, method: payment.method, status: payment.status, provider: payment.provider, amount: payment.amount, currency: payment.currency, attempts: payment.attempts, paidAt: payment.paidAt, failureReason: payment.failureReason, cancelledAt: payment.cancelledAt, refundedAt: payment.refundedAt };
        let oStatus = orders[idx].status;
        let history = Array.isArray(orders[idx].statusHistory) ? orders[idx].statusHistory : [];
        if (payment.status === 'Paid' && oStatus !== 'To Ship') {
          oStatus = 'To Ship';
          history = [...history, { status: 'To Ship', timestamp: new Date().toISOString(), by: 'system', note: 'Payment confirmed' }];
        }
        if (payment.status === 'Failed' || payment.status === 'Cancelled') oStatus = 'Pending';
        orders[idx] = { ...orders[idx], status: oStatus, paymentInfo: pInfo, statusHistory: history, updatedAt: new Date().toISOString() };
        await saveOrders(orders);
        updated = orders[idx];
        broadcastSSE('order-updated', updated);
      }
    }
    res.json({ success: true, payment, changed: result.changed, order: updated });
  } catch (error) {
    console.error('❌ Error processing payment decision:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/payments/:paymentId/retry', async (req, res) => {
  try {
    if (paymentMode !== 'mock') return res.status(403).json({ error: 'Mock retry endpoint is disabled when a real payment gateway is configured.' });
    const result = retryPayment(req.params.paymentId);
    if (result.error) return res.status(400).json({ error: result.error });
    const payment = result.payment;
    let updated: any = null;
    if (payment.orderId) {
      const orders = await getNormalizedOrders();
      const idx = orders.findIndex((o) => o.orderId === payment.orderId);
      if (idx !== -1) {
        orders[idx] = { ...orders[idx], paymentInfo: { ...(orders[idx].paymentInfo || {}), status: payment.status, attempts: payment.attempts }, status: 'Pending', updatedAt: new Date().toISOString() };
        await saveOrders(orders);
        updated = orders[idx];
        broadcastSSE('order-updated', updated);
      }
    }
    res.json({ success: true, payment, order: updated });
  } catch (error) {
    console.error('❌ Error retrying payment:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// ===========================================================================
// VOUCHERS
// ===========================================================================
app.get('/api/vouchers', async (req, res) => {
  try {
    const s = await requireAdminSession(req, res, ['vouchers.manage']);
    if (!s) return;
    res.json(await readVouchers());
  } catch (e) {
    console.error('❌ Error listing vouchers:', e);
    res.status(500).json({ error: (e as Error).message });
  }
});

app.get('/api/vouchers/:code', async (req, res) => {
  try {
    const code = String(req.params.code || '').trim().toUpperCase();
    const voucher = await findVoucherByCode(code);
    if (!voucher) return res.status(404).json({ valid: false, error: 'Voucher code not found.' });
    const subtotal = Math.max(0, Number(req.query.subtotal) || 0);
    const result = validateVoucher(voucher, subtotal);
    if (!result.ok) return res.status(400).json({ valid: false, error: result.reason });
    res.json({ valid: true, code: voucher.code, type: voucher.type, value: voucher.value, minSubtotal: voucher.minSubtotal, maxDiscount: voucher.maxDiscount, discountAmount: result.discountAmount, description: voucher.description, expiresAt: voucher.expiresAt });
  } catch (e) {
    console.error('❌ Error validating voucher:', e);
    res.status(500).json({ error: (e as Error).message });
  }
});

app.post('/api/vouchers', async (req, res) => {
  try {
    const session = await requireAdminSession(req, res, ['vouchers.manage']);
    if (!session) return;
    const code = String(req.body?.code || '').trim().toUpperCase();
    if (!code) return res.status(400).json({ error: 'Voucher code is required.' });
    if (await findVoucherByCode(code)) return res.status(409).json({ error: `Voucher code ${code} already exists.` });
    const now = new Date().toISOString();
    const voucher = {
      id: req.body?.id || `voucher-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      code, type: req.body?.type === 'fixed' ? 'fixed' : 'percent',
      value: Math.max(0, Number(req.body?.value) || 0),
      minSubtotal: Math.max(0, Number(req.body?.minSubtotal) || 0),
      maxDiscount: Math.max(0, Number(req.body?.maxDiscount) || 0),
      usageLimit: Math.max(0, Math.floor(Number(req.body?.usageLimit) || 0)),
      usedCount: Math.max(0, Math.floor(Number(req.body?.usedCount) || 0)),
      perUserLimit: Math.max(0, Math.floor(Number(req.body?.perUserLimit) || 0)),
      users: req.body?.users && typeof req.body.users === 'object' ? req.body.users : {},
      startsAt: req.body?.startsAt || now,
      expiresAt: req.body?.expiresAt || null,
      active: req.body?.active !== false,
      description: String(req.body?.description || '').trim().slice(0, 300),
      createdAt: now, updatedAt: now,
    };
    await writeVouchers([voucher, ...(await readVouchers())]);
    broadcastSSE('vouchers-updated', voucher);
    await logAdminAction(session, 'voucher.create', voucher.code, `Voucher created: ${voucher.code}`, { type: voucher.type, value: voucher.value, active: voucher.active });
    res.status(201).json({ success: true, voucher });
  } catch (e) {
    console.error('❌ Error creating voucher:', e);
    res.status(500).json({ error: (e as Error).message });
  }
});

app.patch('/api/vouchers/:code', async (req, res) => {
  try {
    const session = await requireAdminSession(req, res, ['vouchers.manage']);
    if (!session) return;
    const code = String(req.params.code || '').trim().toUpperCase();
    const readings = await readVouchers();
    const idx = readings.findIndex((v) => String(v.code || '').trim().toUpperCase() === code);
    if (idx === -1) return res.status(404).json({ error: 'Voucher not found.' });
    const current = readings[idx];
    const patch: any = {};
    if (req.body?.code !== undefined) {
      const newCode = String(req.body.code || '').trim().toUpperCase();
      if (!newCode) return res.status(400).json({ error: 'Voucher code is required.' });
      const dup = readings.find((v) => String(v.code || '').trim().toUpperCase() === newCode && v.id !== current.id);
      if (dup) return res.status(409).json({ error: `Voucher code ${newCode} already exists.` });
      patch.code = newCode;
    }
    ['type', 'value', 'minSubtotal', 'maxDiscount', 'usageLimit', 'perUserLimit', 'active', 'expiresAt', 'startsAt', 'description'].forEach((k) => {
      if (req.body?.[k] !== undefined) patch[k] = req.body[k];
    });
    const updated = {
      ...current, ...patch, code: patch.code || current.code,
      type: (patch.type ?? current.type) === 'fixed' ? 'fixed' : 'percent',
      active: patch.active !== undefined ? !!patch.active : current.active,
      updatedAt: new Date().toISOString(),
    };
    readings[idx] = updated;
    await writeVouchers(readings);
    broadcastSSE('vouchers-updated', updated);
    await logAdminAction(session, 'voucher.update', updated.code, `Voucher updated: ${current.code}${patch.code && patch.code !== current.code ? ` → ${patch.code}` : ''}`, { fields: Object.keys(patch) });
    res.json({ success: true, voucher: updated });
  } catch (e) {
    console.error('❌ Error updating voucher:', e);
    res.status(500).json({ error: (e as Error).message });
  }
});

app.delete('/api/vouchers/:code', async (req, res) => {
  try {
    const session = await requireAdminSession(req, res, ['vouchers.manage']);
    if (!session) return;
    const code = String(req.params.code || '').trim().toUpperCase();
    const readings = await readVouchers();
    const idx = readings.findIndex((v) => String(v.code || '').trim().toUpperCase() === code);
    if (idx === -1) return res.status(404).json({ error: 'Voucher not found.' });
    readings.splice(idx, 1);
    await writeVouchers(readings);
    broadcastSSE('vouchers-updated', { code, deleted: true });
    await logAdminAction(session, 'voucher.delete', code, `Voucher deleted: ${code}`);
    res.json({ success: true });
  } catch (e) {
    console.error('❌ Error deleting voucher:', e);
    res.status(500).json({ error: (e as Error).message });
  }
});

// ===========================================================================
// ADMIN TEAM & ROLES (RBAC)
// ===========================================================================
app.get('/api/admin/roles', async (req, res) => {
  const session = await requireAdminSession(req, res, ['admins.manage']);
  if (!session) return;
  const roles = Object.entries(ROLE_DEFS).map(([key, def]) => ({ key, label: def.label, description: def.description, permissions: def.permissions, isSuper: key === 'super_admin' }));
  res.json({ roles, defaultRole: DEFAULT_ADMIN_ROLE });
});

app.get('/api/admin/admins', async (req, res) => {
  const session = await requireAdminSession(req, res, ['admins.manage']);
  if (!session) return;
  const users = await getAllUsers();
  res.json(users.filter((u) => u.is_admin === 1).map(sanitizeAdmin));
});

app.post('/api/admin/admins', async (req, res) => {
  try {
    const session = await requireAdminSession(req, res, ['admins.manage']);
    if (!session) return;
    const { name, username, email, password, role } = req.body || {};
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanUsername = String(username || '').trim().toLowerCase();
    const cleanName = String(name || '').trim();
    const pwd = String(password || '');
    if (!cleanEmail || !cleanEmail.includes('@')) return res.status(400).json({ error: 'A valid email is required.' });
    if (!cleanName) return res.status(400).json({ error: 'Admin name is required.' });
    if (pwd.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    if (!VALID_ROLES.includes(role)) return res.status(400).json({ error: `Invalid role. Allowed: ${VALID_ROLES.join(', ')}` });
    const users = await getAllUsers();
    if (users.some((u) => String(u.email || '').toLowerCase() === cleanEmail)) return res.status(409).json({ error: 'An account with this email already exists.' });
    if (users.some((u) => u.is_admin === 1 && String(u.username || '').toLowerCase() === cleanUsername)) return res.status(409).json({ error: 'An admin with this username already exists.' });
    const now = new Date().toISOString();
    const rec = createPasswordRecord(pwd);
    const db = (await import('./db.js')).getDb();
    await db.execute({
      sql: `INSERT INTO users (name, username, email, salt, password_hash, is_admin, role, active, created_at, updated_at) VALUES (?,?,?,?,?,1,?,1,?,?)`,
      args: [cleanName, cleanUsername || cleanEmail, cleanEmail, rec.salt, rec.passwordHash, role, now, now],
    });
    const created = { ...(await findUserByEmail(cleanEmail)) };
    await logAdminAction(session, 'admin.create', cleanEmail, `Admin created: ${cleanName}`, { role });
    res.status(201).json({ success: true, admin: sanitizeAdmin(created) });
  } catch (error) {
    console.error('❌ Create admin error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.patch('/api/admin/admins/:email', async (req, res) => {
  try {
    const session = await requireAdminSession(req, res, ['admins.manage']);
    if (!session) return;
    const emailKey = String(req.params.email || '').toLowerCase();
    const users = await getAllUsers();
    const idx = users.findIndex((u) => u.is_admin === 1 && String(u.email || '').toLowerCase() === emailKey);
    if (idx === -1) return res.status(404).json({ error: 'Admin account not found.' });
    const target = users[idx];
    const fromBody = req.body || {};

    if (String(session.email || '').toLowerCase() === emailKey) {
      if (fromBody.active === false) return res.status(400).json({ error: 'You cannot deactivate your own account.' });
      if (fromBody.role && fromBody.role !== (target.role || DEFAULT_ADMIN_ROLE)) return res.status(400).json({ error: 'You cannot change your own role.' });
    }
    const activeSuperCount = users.filter((u) => u.is_admin === 1 && u.active !== 0 && (u.role || DEFAULT_ADMIN_ROLE) === 'super_admin').length;
    const wasActiveSuper = target.active !== 0 && (target.role || DEFAULT_ADMIN_ROLE) === 'super_admin';
    const willBeActive = fromBody.active === undefined ? target.active !== 0 : fromBody.active === true;
    const willRole = fromBody.role && VALID_ROLES.includes(fromBody.role) ? fromBody.role : (target.role || DEFAULT_ADMIN_ROLE);
    if (!VALID_ROLES.includes(willRole)) return res.status(400).json({ error: `Invalid role. Allowed: ${VALID_ROLES.join(', ')}` });
    if (wasActiveSuper && !willBeActive && activeSuperCount <= 1) return res.status(400).json({ error: 'Cannot deactivate the last active Super Admin.' });
    if (wasActiveSuper && willRole !== 'super_admin' && activeSuperCount <= 1) return res.status(400).json({ error: 'Cannot demote the last active Super Admin.' });

    let name = target.name, username = target.username;
    if (fromBody.name !== undefined) name = String(fromBody.name).trim() || target.name;
    if (fromBody.username !== undefined) {
      const un = String(fromBody.username).trim().toLowerCase();
      const clash = users.some((u) => u.is_admin === 1 && String(u.username || '').toLowerCase() === un && String(u.email || '').toLowerCase() !== emailKey);
      if (clash) return res.status(409).json({ error: 'An admin with this username already exists.' });
      username = un || target.username;
    }
    const role = fromBody.role !== undefined ? willRole : (target.role || DEFAULT_ADMIN_ROLE);
    const active = fromBody.active !== undefined ? (fromBody.active === true ? 1 : 0) : target.active;
    let salt = target.salt, passwordHash = target.password_hash;
    if (fromBody.password !== undefined && String(fromBody.password).length > 0) {
      if (String(fromBody.password).length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
      const rec = createPasswordRecord(String(fromBody.password));
      salt = rec.salt; passwordHash = rec.passwordHash;
    }
    const db = (await import('./db.js')).getDb();
    await db.execute({
      sql: `UPDATE users SET name=?, username=?, role=?, active=?, salt=?, password_hash=?, updated_at=? WHERE email=?`,
      args: [name, username, role, active, salt, passwordHash, new Date().toISOString(), emailKey],
    });
    const updated = await findUserByEmail(emailKey);
    await logAdminAction(session, 'admin.update', emailKey, `Admin updated: ${updated?.email || emailKey}`, { role, active: active === 1, passwordUpdated: !!(fromBody.password && String(fromBody.password).length > 0), fieldsChanged: Object.keys(fromBody) });
    res.json({ success: true, admin: sanitizeAdmin(updated) });
  } catch (error) {
    console.error('❌ Update admin error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.delete('/api/admin/admins/:email', async (req, res) => {
  try {
    const session = await requireAdminSession(req, res, ['admins.manage']);
    if (!session) return;
    const emailKey = String(req.params.email || '').toLowerCase();
    if (String(session.email || '').toLowerCase() === emailKey) return res.status(400).json({ error: 'You cannot deactivate your own account.' });
    const users = await getAllUsers();
    const idx = users.findIndex((u) => u.is_admin === 1 && String(u.email || '').toLowerCase() === emailKey);
    if (idx === -1) return res.status(404).json({ error: 'Admin account not found.' });
    const target = users[idx];
    const activeSuperCount = users.filter((u) => u.is_admin === 1 && u.active !== 0 && (u.role || DEFAULT_ADMIN_ROLE) === 'super_admin').length;
    if (target.active !== 0 && (target.role || DEFAULT_ADMIN_ROLE) === 'super_admin' && activeSuperCount <= 1) return res.status(400).json({ error: 'Cannot deactivate the last active Super Admin.' });
    const db = (await import('./db.js')).getDb();
    await db.execute({ sql: 'UPDATE users SET active = 0, updated_at = ? WHERE email = ?', args: [new Date().toISOString(), emailKey] });
    const updated = await findUserByEmail(emailKey);
    await logAdminAction(session, 'admin.delete', emailKey, `Admin deactivated: ${updated?.email || emailKey}`, { active: false });
    res.json({ success: true, admin: sanitizeAdmin(updated) });
  } catch (error) {
    console.error('❌ Delete admin error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/admin/audit
app.get('/api/admin/audit', async (req, res) => {
  try {
    const session = await requireAdminSession(req, res, ['audit.view']);
    if (!session) return;
    let logs = await readAuditLogs();
    const actionQ = String(req.query.action || '').trim().toLowerCase();
    if (actionQ) logs = logs.filter((l) => String(l.action || '').toLowerCase().includes(actionQ));
    const adminQ = String(req.query.admin || '').trim().toLowerCase();
    if (adminQ) logs = logs.filter((l) => String(l.adminEmail || '').toLowerCase().includes(adminQ));
    const q = String(req.query.q || '').trim().toLowerCase();
    if (q) logs = logs.filter((l) => String(l.target || '').toLowerCase().includes(q) || String(l.summary || '').toLowerCase().includes(q));
    const from = req.query.from ? new Date(String(req.query.from)) : null;
    const to = req.query.to ? new Date(String(req.query.to)) : null;
    if (from && !isNaN(from.getTime())) logs = logs.filter((l) => new Date(l.timestamp) >= from);
    if (to && !isNaN(to.getTime())) logs = logs.filter((l) => new Date(l.timestamp) <= to);
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const total = logs.length;
    const limit = Math.max(1, Math.min(Number(req.query.limit) || 200, 500));
    const page = Math.max(1, Math.floor(Number(req.query.page) || 1));
    const paged = logs.slice((page - 1) * limit, page * limit);
    const actions = [...new Set(logs.map((l) => l.action).filter(Boolean))].sort();
    res.json({ success: true, logs: paged, total, page, limit, actions });
  } catch (error) {
    console.error('❌ Audit listing error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// ===========================================================================
// NOTIFICATIONS
// ===========================================================================
app.get('/api/notifications', async (req, res) => {
  const session = await requireSession(req, res);
  if (!session) return;
  res.json(await notificationsForSession(session));
});

app.get('/api/notifications/unread-count', async (req, res) => {
  const session = await requireSession(req, res);
  if (!session) return;
  const all = await notificationsForSession(session);
  res.json({ unread: all.filter((n) => !n.read).length });
});

app.patch('/api/notifications/read-all', async (req, res) => {
  try {
    const session = await requireSession(req, res);
    if (!session) return;
    const db = (await import('./db.js')).getDb();
    const emailKey = String(session.email || '').toLowerCase();
    const userKey = String(session.username || '').toLowerCase();
    await db.execute({
      sql: `UPDATE notifications SET read = 1, read_at = ? WHERE read = 0 AND ((email = ? AND email != '') OR (username = ? AND username != ''))`,
      args: [new Date().toISOString(), emailKey, userKey],
    });
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error marking notifications read:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.patch('/api/notifications/:id/read', async (req, res) => {
  try {
    const session = await requireSession(req, res);
    if (!session) return;
    const db = (await import('./db.js')).getDb();
    const emailKey = String(session.email || '').toLowerCase();
    const userKey = String(session.username || '').toLowerCase();
    const { rows } = await db.execute({ sql: 'SELECT * FROM notifications WHERE id = ?', args: [req.params.id] });
    if (!rows[0]) return res.status(404).json({ error: 'Notification not found' });
    const n = rows[0] as any;
    const mine = (n.email && String(n.email).toLowerCase() === emailKey) || (n.username && String(n.username).toLowerCase() === userKey);
    if (!mine) return res.status(403).json({ error: 'You do not own this notification.' });
    await db.execute({ sql: 'UPDATE notifications SET read = 1, read_at = ? WHERE id = ?', args: [new Date().toISOString(), req.params.id] });
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error updating notification:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.delete('/api/notifications/:id', async (req, res) => {
  try {
    const session = await requireSession(req, res);
    if (!session) return;
    const db = (await import('./db.js')).getDb();
    const emailKey = String(session.email || '').toLowerCase();
    const userKey = String(session.username || '').toLowerCase();
    const { rows } = await db.execute({ sql: 'SELECT * FROM notifications WHERE id = ?', args: [req.params.id] });
    if (!rows[0]) return res.status(404).json({ error: 'Notification not found' });
    const n = rows[0] as any;
    const mine = (n.email && String(n.email).toLowerCase() === emailKey) || (n.username && String(n.username).toLowerCase() === userKey);
    if (!mine) return res.status(403).json({ error: 'You do not own this notification.' });
    await db.execute({ sql: 'DELETE FROM notifications WHERE id = ?', args: [req.params.id] });
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.delete('/api/notifications', async (req, res) => {
  try {
    const session = await requireSession(req, res);
    if (!session) return;
    const db = (await import('./db.js')).getDb();
    const emailKey = String(session.email || '').toLowerCase();
    const userKey = String(session.username || '').toLowerCase();
    await db.execute({
      sql: `DELETE FROM notifications WHERE (email = ? AND email != '') OR (username = ? AND username != '')`,
      args: [emailKey, userKey],
    });
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error clearing notifications:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// ===========================================================================
// REVIEWS
// ===========================================================================
const REVIEW_STATUSES = ['pending', 'published', 'hidden', 'rejected'];

const isVerifiedFor = (order: any, session: any, productId: string): boolean => {
  if (!order || !session) return false;
  const owns = order.customer?.email?.toLowerCase() === session.email || order.customer?.name?.toLowerCase() === session.name?.toLowerCase();
  if (!owns) return false;
  const st = normalizeOrderStatus(order.status);
  const purchasedStates = ['Delivered', 'To Review', 'Completed'];
  if (!purchasedStates.includes(st)) return false;
  const items = Array.isArray(order.items) ? order.items : [];
  return items.some((i) => String(i?.id || i?.productId || '') === String(productId));
};

app.get('/api/reviews', async (req, res) => {
  const { productId } = req.query;
  const reviews = await readReviews();
  if (productId) {
    const filtered = reviews.filter((r) => String(r.productId) === String(productId) && r.status === 'published');
    const count = filtered.length;
    const avg = count > 0 ? Math.round((filtered.reduce((s, r) => s + Number(r.rating || 0), 0) / count) * 10) / 10 : 0;
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    filtered.forEach((r) => { const rv = Number(r.rating) || 0; if (rv >= 1 && rv <= 5) distribution[rv] += 1; });
    return res.json({ success: true, productId: String(productId), averageRating: avg, ratingCount: count, distribution, reviews: filtered.map((r) => ({ id: r.id, productId: r.productId, customerName: r.customerName, rating: r.rating, comment: r.comment, date: r.date, verifiedPurchase: r.verifiedPurchase === true, adminReply: r.adminReply || null, productName: r.productName })) });
  }
  res.json(reviews.filter((r) => r.status === 'published'));
});

app.post('/api/reviews', async (req, res) => {
  try {
    const session = await requireSession(req, res);
    if (!session) return;
    const productId = String(req.body?.productId || '').trim();
    if (!productId) return res.status(400).json({ error: 'productId is required' });
    const rating = Number(req.body?.rating);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5 stars.' });
    const comment = sanitizeText(req.body?.comment || '', 1500);
    const orders = await getNormalizedOrders();
    const verifiedOrder = orders.find((o) => isVerifiedFor(o, session, productId));
    if (!verifiedOrder) return res.status(403).json({ error: 'You can only review products you purchased and received.' });
    const reviews = await readReviews();
    const key = String(session.username || session.email || '').toLowerCase();
    if (reviews.some((r) => String(r.productId) === String(productId) && (String(r.customerEmail || '').toLowerCase() === key || String(r.username || '').toLowerCase() === key))) {
      return res.status(409).json({ error: 'You have already reviewed this product.' });
    }
    const products = await getProductsEnriched();
    const newReview = {
      id: `review-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      productId,
      productName: products.find((p) => p.id === productId)?.name || '',
      orderId: verifiedOrder.orderId,
      customerName: sanitizeText(session.name || verifiedOrder.customer?.name || session.username || 'Customer', 120),
      customerEmail: String(session.email || '').toLowerCase(),
      username: key,
      rating, comment,
      date: new Date().toISOString(),
      verifiedPurchase: true,
      status: 'published',
    };
    reviews.unshift(newReview);
    await writeReviews(reviews);
    res.status(201).json({ success: true, review: newReview });
  } catch (error) {
    console.error('❌ Review submit error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.patch('/api/reviews/:id', async (req, res) => {
  try {
    const session = await requireSession(req, res);
    if (!session) return;
    const reviews = await readReviews();
    const idx = reviews.findIndex((r) => r.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Review not found' });
    const mine = String(reviews[idx].customerEmail || '').toLowerCase() === String(session.email || '').toLowerCase() || String(reviews[idx].username || '').toLowerCase() === String(session.username || '').toLowerCase();
    if (!mine) return res.status(403).json({ error: 'You can only edit your own review.' });
    const patch: any = {};
    if (req.body?.rating !== undefined) {
      const rating = Number(req.body.rating);
      if (!Number.isFinite(rating) || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5 stars.' });
      patch.rating = rating;
    }
    if (req.body?.comment !== undefined) patch.comment = sanitizeText(req.body.comment, 1500);
    patch.updatedAt = new Date().toISOString();
    reviews[idx] = { ...reviews[idx], ...patch };
    await writeReviews(reviews);
    res.json({ success: true, review: reviews[idx] });
  } catch (error) {
    console.error('❌ Review edit error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.delete('/api/reviews/:id', async (req, res) => {
  try {
    const session = await requireSession(req, res);
    if (!session) return;
    const reviews = await readReviews();
    const idx = reviews.findIndex((r) => r.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Review not found' });
    const mine = String(reviews[idx].customerEmail || '').toLowerCase() === String(session.email || '').toLowerCase() || String(reviews[idx].username || '').toLowerCase() === String(session.username || '').toLowerCase();
    if (!mine) return res.status(403).json({ error: 'You can only delete your own review.' });
    reviews.splice(idx, 1);
    await writeReviews(reviews);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Review delete error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/admin/reviews', async (req, res) => {
  const session = await requireAdminSession(req, res, ['reviews.manage']);
  if (!session) return;
  res.json(await readReviews());
});

app.patch('/api/admin/reviews/:id', async (req, res) => {
  try {
    const session = await requireAdminSession(req, res, ['reviews.manage']);
    if (!session) return;
    const reviews = await readReviews();
    const idx = reviews.findIndex((r) => r.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Review not found' });
    const patch: any = {};
    if (req.body?.status !== undefined) {
      const st = String(req.body.status).toLowerCase();
      if (!REVIEW_STATUSES.includes(st)) return res.status(400).json({ error: `Invalid status. Allowed: ${REVIEW_STATUSES.join(', ')}` });
      patch.status = st;
    }
    if (req.body?.adminReply !== undefined) {
      if (req.body.adminReply === null) {
        patch.adminReply = null;
      } else {
        const text = sanitizeText(req.body.adminReply.comment || req.body.adminReply, 1500);
        patch.adminReply = { comment: text, date: new Date().toISOString() };
        await createNotification({ email: reviews[idx].customerEmail, username: reviews[idx].username, message: `The C-HUB team replied to your review of ${reviews[idx].productName || 'your product'}.`, type: 'info' });
      }
    }
    patch.moderatedAt = new Date().toISOString();
    reviews[idx] = { ...reviews[idx], ...patch };
    await writeReviews(reviews);
    await logAdminAction(session, 'review.moderate', reviews[idx].id, patch.status ? `Review status → ${patch.status}` : 'Admin replied to review', { status: patch.status || null, replied: !!patch.adminReply });
    res.json({ success: true, review: reviews[idx] });
  } catch (error) {
    console.error('❌ Review moderation error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.delete('/api/admin/reviews/:id', async (req, res) => {
  try {
    const session = await requireAdminSession(req, res, ['reviews.manage']);
    if (!session) return;
    const reviews = await readReviews();
    const remaining = reviews.filter((r) => r.id !== req.params.id);
    await writeReviews(remaining);
    await logAdminAction(session, 'review.delete', req.params.id, 'Review deleted');
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Admin review delete error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// ===========================================================================
// WISHLIST
// ===========================================================================
app.get('/api/wishlist', async (req, res) => {
  const session = await requireSession(req, res);
  if (!session) return;
  const db = (await import('./db.js')).getDb();
  const key = String(session.username || session.email || '').toLowerCase();
  const { rows } = await db.execute({ sql: 'SELECT * FROM wishlist WHERE username = ? ORDER BY added_at DESC', args: [key] });
  const products = await getProductsEnriched();
  res.json({ success: true, items: rows.map((r: any) => ({ productId: r.product_id, addedAt: r.added_at, product: products.find((p) => p.id === r.product_id) || null })) });
});

app.post('/api/wishlist', async (req, res) => {
  try {
    const session = await requireSession(req, res);
    if (!session) return;
    const productId = String(req.body?.productId || '').trim();
    if (!productId) return res.status(400).json({ error: 'productId is required' });
    const products = await getProductsEnriched();
    if (!products.find((p) => p.id === productId)) return res.status(404).json({ error: 'Product not found.' });
    const db = (await import('./db.js')).getDb();
    const key = String(session.username || session.email || '').toLowerCase();
    const { rows } = await db.execute({ sql: 'SELECT * FROM wishlist WHERE username = ? AND product_id = ?', args: [key, productId] });
    if (rows[0]) return res.json({ success: true, alreadyInWishlist: true, item: { productId, addedAt: rows[0].added_at } });
    const addedAt = new Date().toISOString();
    await db.execute({ sql: 'INSERT INTO wishlist (username, product_id, added_at) VALUES (?,?,?)', args: [key, productId, addedAt] });
    res.status(201).json({ success: true, alreadyInWishlist: false, item: { productId, addedAt } });
  } catch (error) {
    console.error('❌ Wishlist add error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.delete('/api/wishlist/:productId', async (req, res) => {
  try {
    const session = await requireSession(req, res);
    if (!session) return;
    const db = (await import('./db.js')).getDb();
    const key = String(session.username || session.email || '').toLowerCase();
    const productId = String(req.params.productId || '').trim();
    await db.execute({ sql: 'DELETE FROM wishlist WHERE username = ? AND product_id = ?', args: [key, productId] });
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Wishlist remove error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// ===========================================================================
// AUTH
// ===========================================================================
app.post('/api/auth/admin/login', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const adminAccount = await getAdminRecordForEmail(email);
    if (adminAccount) {
      if (!verifyPassword(password, adminAccount.salt, adminAccount.password_hash)) return res.status(401).json({ success: false, error: 'Invalid email or password' });
      if (adminAccount.active === 0) return res.status(403).json({ success: false, error: 'This admin account has been deactivated. Contact your administrator.' });
      const role = adminAccount.role || DEFAULT_ADMIN_ROLE;
      const userId = String(adminAccount.email || '').toLowerCase();
      const token = await createSession({ email, username: adminAccount.username, name: adminAccount.name, isAdmin: true }, role);
      const permissions = getRolePermissions(role);
      const user = { name: adminAccount.name, username: adminAccount.username, email: adminAccount.email, isAdmin: true, role, active: true, permissions };
      await logAdminAction({ email, name: adminAccount.name, role }, 'login', email, 'Admin signed in');
      return res.json({ success: true, email, token, user, role, permissions, adminId: userId });
    }
    const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@c-hub.ph').toLowerCase();
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) return res.status(401).json({ success: false, error: 'Invalid email or password' });
    const role = DEFAULT_ADMIN_ROLE;
    const token = await createSession({ name: 'Admin', username: 'admin', email: ADMIN_EMAIL, isAdmin: true }, role);
    await logAdminAction({ email: ADMIN_EMAIL, name: 'Admin', role }, 'login', ADMIN_EMAIL, 'Admin signed in');
    res.json({ success: true, email, token, role, permissions: getRolePermissions(role), user: { name: 'Admin', username: 'admin', email: ADMIN_EMAIL, isAdmin: true, role, active: true, permissions: getRolePermissions(role) } });
  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    const username = String(req.body?.username || '').trim().toLowerCase();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (!name) return res.status(400).json({ error: 'Full name is required' });
    if (!username) return res.status(400).json({ error: 'Username is required' });
    if (!email || !email.includes('@')) return res.status(400).json({ error: 'Valid email is required' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    const users = await getAllUsers();
    if (users.some((u) => u.username && String(u.username).toLowerCase() === username)) return res.status(409).json({ error: 'Username is already taken. Use a different one.' });
    const rec = createPasswordRecord(password);
    const db = (await import('./db.js')).getDb();
    await db.execute({
      sql: `INSERT INTO users (name, username, email, salt, password_hash, is_admin, role, active, created_at, updated_at) VALUES (?,?,?,?,?,0,'customer',1,?,?)`,
      args: [name, username, email, rec.salt, rec.passwordHash, new Date().toISOString(), new Date().toISOString()],
    });
    const token = await createSession({ name, username, email, isAdmin: false }, 'customer');
    res.status(201).json({ success: true, user: { name, username, email }, token });
  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const identifier = String(req.body?.identifier || '').trim();
    const password = String(req.body?.password || '');
    if (!identifier || !password) return res.status(400).json({ error: 'Enter your username/email and password' });
    const db = (await import('./db.js')).getDb();
    const key = identifier.toLowerCase();
    const { rows } = await db.execute({
      sql: 'SELECT * FROM users WHERE username = ? OR email = ?',
      args: [key, key],
    });
    if (rows.length === 0) return res.status(401).json({ success: false, error: 'Invalid username/email or password' });
    const account = rows.find((u: any) => verifyPassword(password, u.salt, u.password_hash));
    if (!account) return res.status(401).json({ success: false, error: 'Invalid username/email or password' });
    const token = await createSession({ name: account.name, username: account.username, email: account.email, isAdmin: account.is_admin === 1 }, 'customer');
    res.json({ success: true, user: { name: account.name, username: account.username, email: account.email }, token });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/auth/account — register username + email for password reset
app.post('/api/auth/account', async (req, res) => {
  try {
    const username = String(req.body?.username || '').trim().toLowerCase();
    if (!username) return res.status(400).json({ error: 'Username is required' });
    const email = String(req.body?.email || '').trim().toLowerCase();
    const existing = await findUserByUsernameOrEmail(username);
    if (existing) return res.status(409).json({ error: 'Account already exists' });
    const db = (await import('./db.js')).getDb();
    const now = new Date().toISOString();
    await db.execute({
      sql: 'INSERT OR IGNORE INTO users (name, username, email, is_admin, role, active, created_at, updated_at) VALUES (?,?,?,0,?,1,?,?)',
      args: [username, username, email || undefined, 'customer', now, now],
    });
    res.status(201).json({ success: true, username });
  } catch (error) {
    console.error('❌ Account register error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

const RESET_TTL_MS = 15 * 60 * 1000;

app.post('/api/auth/reset/request', async (req, res) => {
  try {
    const identifier = String(req.body?.identifier || '').trim();
    if (!identifier) return res.status(400).json({ error: 'Enter your username or email' });
    const key = identifier.toLowerCase();
    const account = await findUserByUsernameOrEmail(key);
    if (account) {
      const token = crypto.randomBytes(32).toString('hex');
      const db = (await import('./db.js')).getDb();
      await db.execute({
        sql: 'UPDATE users SET reset_token_hash = ?, reset_expires_at = ? WHERE username = ?',
        args: [crypto.createHash('sha256').update(token).digest('hex'), Date.now() + RESET_TTL_MS, account.username],
      });
      const devResetToken = process.env.NODE_ENV !== 'production' ? token : undefined;
      return res.json({ success: true, message: 'If an account matches, a reset link was sent to your registered email.', ...(devResetToken ? { devResetToken: token } : {}) });
    }
    res.json({ success: true, message: 'If an account matches, a reset link was sent to your registered email.' });
  } catch (error) {
    console.error('❌ Reset request error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/auth/reset/apply', async (req, res) => {
  try {
    const token = String(req.body?.token || '').trim();
    if (!token) return res.status(400).json({ error: 'Reset token is required' });
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const db = (await import('./db.js')).getDb();
    const { rows } = await db.execute({ sql: 'SELECT * FROM users WHERE reset_token_hash = ?', args: [tokenHash] });
    const row = rows[0] as any;
    if (!row || !row.reset_expires_at || Number(row.reset_expires_at) < Date.now()) return res.status(400).json({ error: 'Invalid or expired reset token' });
    const { newPassword } = req.body || {};
    if (newPassword) {
      if (String(newPassword).length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
      const rec = createPasswordRecord(String(newPassword));
      await db.execute({
        sql: 'UPDATE users SET salt = ?, password_hash = ?, reset_token_hash = NULL, reset_expires_at = NULL, updated_at = ? WHERE username = ?',
        args: [rec.salt, rec.passwordHash, new Date().toISOString(), row.username],
      });
    } else {
      await db.execute({ sql: 'UPDATE users SET reset_token_hash = NULL, reset_expires_at = NULL WHERE username = ?', args: [row.username] });
    }
    res.json({ success: true, username: row.username });
  } catch (error) {
    console.error('❌ Reset apply error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// ===========================================================================
// SSE — real-time stream (used by Store + Admin frontends)
// ===========================================================================
app.get('/api/orders/stream/public', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);
  res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', clientId })}\n\n`);
  const interval = setInterval(() => { try { res.write(`: ping\n\n`); } catch { /* noop */ } }, 15000);
  req.on('close', () => {
    clearInterval(interval);
    const idx = sseClients.findIndex((c) => c.id === clientId);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// Admin bootstrap auto-login (used by the Admin frontend to attach a token
// without a login screen). Works because the seeded default admin exists.
// Enable/disable via ADMIN_AUTO_LOGIN env ('true' = enabled, default enabled
// in non-production).
app.post('/api/auth/admin/bootstrap', async (req, res) => {
  try {
    const autoLogin = String(process.env.ADMIN_AUTO_LOGIN || 'true').toLowerCase() === 'true';
    if (!autoLogin && process.env.NODE_ENV === 'production') {
      return res.status(403).json({ success: false, error: 'Admin auto-login is disabled in production.' });
    }
    let admin = await getAdminRecordForEmail(String(process.env.ADMIN_EMAIL || 'admin@c-hub.ph').toLowerCase());
    if (!admin) {
      // Last resort: find any active admin
      const users = await getAllUsers();
      admin = users.find((u) => u.is_admin === 1 && u.active !== 0) || null;
    }
    if (!admin) return res.status(404).json({ success: false, error: 'No admin account found.' });
    const token = await createSession({ email: admin.email, username: admin.username, name: admin.name, isAdmin: true }, admin.role || DEFAULT_ADMIN_ROLE);
    res.json({ success: true, token, role: admin.role || DEFAULT_ADMIN_ROLE, user: sanitizeAdmin(admin) });
  } catch (error) {
    console.error('❌ Admin bootstrap error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// 404 for unknown API routes
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

export default app;