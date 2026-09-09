// server/helpers.ts
// Shared business logic for the C-HUB backend: auth/sessions, RBAC, order
// lifecycle, inventory, vouchers, audit, notifications. All persistence goes
// through the shared Turso database (server/db.ts).

import crypto from 'crypto';
import {
  getDb, mapUserRow, mapProductRow, mapOrderRow, mapVoucherRow, mapReviewRow,
  safeParse, toJSON,
} from './db.js';

// ── Password helpers (scrypt, same scheme as the previous backend) ────────
export const hashPassword = (password: string, salt: string): string => {
  const derived = crypto.scryptSync(String(password), String(salt), 64);
  return derived.toString('hex');
};

export const createPasswordRecord = (password: string) => {
  const salt = crypto.randomBytes(16).toString('hex');
  return { salt, passwordHash: hashPassword(password, salt) };
};

export const verifyPassword = (password: string, salt: string | null, passwordHash: string | null): boolean => {
  if (!salt || !passwordHash) return false;
  try {
    return hashPassword(password, salt) === passwordHash;
  } catch {
    return false;
  }
};

// ── User / admin records ──────────────────────────────────────────────────
export async function findUserByEmail(email: string): Promise<any | null> {
  const db = getDb();
  const { rows } = await db.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [String(email || '').toLowerCase().trim()],
  });
  return rows[0] ? { ...rows[0] } : null;
}

export async function findUserByUsernameOrEmail(key: string): Promise<any | null> {
  const db = getDb();
  const k = String(key || '').toLowerCase().trim();
  const { rows } = await db.execute({
    sql: 'SELECT * FROM users WHERE username = ? OR email = ?',
    args: [k, k],
  });
  return rows[0] ? { ...rows[0] } : null;
}

export async function getAllUsers(): Promise<any[]> {
  const db = getDb();
  const { rows } = await db.execute('SELECT * FROM users');
  return rows;
}

export async function getAdminRecordForEmail(email: string): Promise<any | null> {
  const db = getDb();
  const em = String(email || '').toLowerCase().trim();
  if (!em) return null;
  const { rows } = await db.execute({
    sql: 'SELECT * FROM users WHERE email = ? AND is_admin = 1',
    args: [em],
  });
  return rows[0] ? { ...rows[0] } : null;
}

export const sanitizeAdmin = (u: any) => ({
  name: u.name || '',
  username: String(u.username || '').toLowerCase(),
  email: String(u.email || '').toLowerCase(),
  role: u.role || 'super_admin',
  active: u.active !== 0 && u.active !== false,
  createdAt: u.created_at || u.createdAt || null,
  updatedAt: u.updated_at || u.updatedAt || null,
});

// ── RBAC ──────────────────────────────────────────────────────────────────
export const ROLE_DEFS: Record<string, { label: string; description: string; permissions: string[] }> = {
  super_admin: { label: 'Super Admin', description: 'Full access — including team & role management.', permissions: ['*'] },
  operations: {
    label: 'Operations Manager',
    description: 'Order processing, refunds/returns, reviews, vouchers and payments.',
    permissions: ['dashboard.view', 'orders.view', 'orders.manage', 'refunds.manage', 'reviews.manage', 'vouchers.manage', 'gateways.view', 'gateways.manage', 'reports.view', 'audit.view'],
  },
  inventory: {
    label: 'Inventory Manager',
    description: 'Products, stock levels, adjustments and inventory reports.',
    permissions: ['dashboard.view', 'products.view', 'products.manage', 'inventory.view', 'inventory.manage', 'orders.view', 'reports.view'],
  },
  support: {
    label: 'Support Agent',
    description: 'Handle orders, refund/return decisions and review moderation.',
    permissions: ['dashboard.view', 'orders.view', 'refunds.manage', 'reviews.manage', 'gateways.view'],
  },
  viewer: {
    label: 'Viewer (Read-Only)',
    description: 'Read-only access to dashboards, orders, products and reports.',
    permissions: ['dashboard.view', 'orders.view', 'products.view', 'inventory.view', 'gateways.view', 'reports.view', 'audit.view'],
  },
};

export const VALID_ROLES = Object.keys(ROLE_DEFS);
export const DEFAULT_ADMIN_ROLE = 'super_admin';

export const getRolePermissions = (role: string): string[] => {
  const def = ROLE_DEFS[role];
  return def ? def.permissions : ROLE_DEFS[DEFAULT_ADMIN_ROLE].permissions;
};

export const hasPermission = (permissions: string[], perm: string): boolean =>
  Array.isArray(permissions) && (permissions.includes('*') || permissions.includes(perm));

// ── Sessions (persisted in shared Turso so tokens survive cold starts) ────
export async function createSession(account: any, role: string): Promise<string> {
  const db = getDb();
  const token = crypto.randomUUID();
  await db.execute({
    sql: 'INSERT INTO sessions (token, email, username, name, role, is_admin, created_at) VALUES (?,?,?,?,?,?,?)',
    args: [
      token,
      String(account.email || '').toLowerCase(),
      String(account.username || '').toLowerCase(),
      String(account.name || ''),
      role,
      account.isAdmin === true ? 1 : 0,
      new Date().toISOString(),
    ],
  });
  // Housekeeping: keep the sessions table bounded (stale TTL + per-email cap).
  try {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    await db.execute({ sql: 'DELETE FROM sessions WHERE created_at < ?', args: [cutoff] });
    await db.execute({
      sql: `DELETE FROM sessions WHERE email = ? AND token NOT IN (
        SELECT token FROM sessions WHERE email = ? ORDER BY created_at DESC LIMIT 10
      )`,
      args: [String(account.email || '').toLowerCase(), String(account.email || '').toLowerCase()],
    });
  } catch {
    /* non-fatal */
  }
  return token;
}

export async function deleteSession(token: string): Promise<void> {
  const db = getDb();
  await db.execute({ sql: 'DELETE FROM sessions WHERE token = ?', args: [token] });
}

export async function getSession(req: any): Promise<any | null> {
  const header = req.headers.authorization || '';
  let token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token && req.query?.token) token = String(req.query.token).trim();
  if (!token) return null;
  // Also allow ?token= query param for SSE (EventSource can't set headers).
  try {
    const db = getDb();
    const { rows } = await db.execute({ sql: 'SELECT * FROM sessions WHERE token = ?', args: [token] });
    if (!rows[0]) return null;
    const s = rows[0] as any;
    return {
      token,
      email: String(s.email || '').toLowerCase(),
      username: String(s.username || '').toLowerCase(),
      name: String(s.name || ''),
      role: s.role || 'customer',
      isAdmin: s.is_admin === 1,
      createdAt: s.created_at,
    };
  } catch {
    return null;
  }
}

export async function requireSession(req: any, res: any): Promise<any | null> {
  const session = await getSession(req);
  if (!session) {
    res.status(401).json({ error: 'Unauthorized. Please log in.' });
    return null;
  }
  return session;
}

export async function requireAdminSession(req: any, res: any, requiredPerms: string[] = []): Promise<any | null> {
  const session = await requireSession(req, res);
  if (!session) return null;
  const record = await getAdminRecordForEmail(session.email);
  if (!record?.is_admin) {
    res.status(403).json({ error: 'Admin access required.' });
    return null;
  }
  if (record.active === 0 || record.active === false) {
    res.status(403).json({ error: 'This admin account has been deactivated.' });
    return null;
  }
  const permissions = getRolePermissions(record.role || DEFAULT_ADMIN_ROLE);
  if (requiredPerms.length > 0 && !requiredPerms.some((p) => hasPermission(permissions, p))) {
    res.status(403).json({ error: `Access denied. Required permission: ${requiredPerms.join(' or ')}.` });
    return null;
  }
  return { ...session, permissions };
}

// ── Audit trail ───────────────────────────────────────────────────────────
export async function logAdminAction(by: any, action: string, target: string, summary: string, details: any = {}): Promise<void> {
  try {
    if (!by || !action) return;
    const db = getDb();
    const live = by.email ? await getAdminRecordForEmail(by.email) : null;
    await db.execute({
      sql: `INSERT INTO audit_log (id, timestamp, admin_email, admin_name, admin_role, action, target, summary, details)
            VALUES (?,?,?,?,?,?,?,?,?)`,
      args: [
        `audit-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        new Date().toISOString(),
        String(by.email || by.username || '').toLowerCase(),
        by.name || live?.name || by.email || by.username || 'Admin',
        live?.role || by.role || DEFAULT_ADMIN_ROLE,
        action,
        String(target || ''),
        String(summary || ''),
        toJSON(details),
      ],
    });
    // Keep audit log capped at the 2000 most recent entries.
    await db.execute(`
      DELETE FROM audit_log WHERE id NOT IN (
        SELECT id FROM audit_log ORDER BY timestamp DESC LIMIT 2000
      )
    `);
  } catch (e) {
    console.error('❌ Audit log error:', (e as Error).message);
  }
}

export async function readAuditLogs(): Promise<any[]> {
  const db = getDb();
  const { rows } = await db.execute('SELECT * FROM audit_log');
  return rows.map((r: any) => ({
    id: r.id,
    timestamp: r.timestamp,
    adminEmail: r.admin_email,
    adminName: r.admin_name,
    adminRole: r.admin_role,
    action: r.action,
    target: r.target,
    summary: r.summary,
    details: safeParse(r.details, {}),
  }));
}

// ── Order lifecycle (single source of truth) ──────────────────────────────
export const ORDER_STATUS_ALIASES: Record<string, string> = {
  'Order': 'Pending',
  'To Pay': 'Pending',
  'To Receive': 'Out for Delivery',
};

export const normalizeOrderStatus = (s: string) => ORDER_STATUS_ALIASES[s] || (s || 'Pending');

export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  'Pending': ['To Ship', 'Cancelled'],
  'To Ship': ['Shipped', 'Cancelled'],
  'Shipped': ['Out for Delivery'],
  'Out for Delivery': ['Delivered'],
  'Delivered': ['To Review', 'Refund Requested', 'Return Requested'],
  'To Review': ['Completed', 'Refund Requested', 'Return Requested'],
  'Completed': ['Refund Requested', 'Return Requested', 'Refunded'],
  'Refund Requested': ['Refunded', 'Completed'],
  'Return Requested': ['Returned', 'Completed'],
  'Cancelled': [],
  'Refunded': [],
  'Returned': [],
};

export const CUSTOMER_CANCELLABLE = ['Pending', 'To Ship'];
export const CUSTOMER_REFUNDABLE = ['Delivered', 'To Review', 'Completed'];

export const applyOrderTransition = (order: any, nextStatus: string, by: string, note?: string) => {
  const current = normalizeOrderStatus(order.status);
  const next = normalizeOrderStatus(nextStatus);
  if (current === next) return { ok: true, changed: false, order };
  const allowed = ALLOWED_TRANSITIONS[current] || [];
  if (!allowed.includes(next)) {
    return {
      ok: false,
      changed: false,
      error: `Invalid transition: ${current} cannot become ${next}. Allowed: ${allowed.length ? allowed.join(', ') : 'none'}`,
      allowed,
    };
  }
  const history = Array.isArray(order.statusHistory) ? order.statusHistory : [];
  const updated = {
    ...order,
    status: next,
    statusHistory: [...history, {
      status: next,
      timestamp: new Date().toISOString(),
      ...(by ? { by } : {}),
      ...(note ? { note } : {}),
    }],
    updatedAt: new Date().toISOString(),
  };
  return { ok: true, changed: true, order: updated };
};

export const ownsOrder = (order: any, session: any): boolean => {
  if (!order || !session) return false;
  const orderEmail = String(order.customer?.email || '').toLowerCase().trim();
  if (orderEmail && orderEmail === session.email) return true;
  const orderName = String(order.customer?.name || '').toLowerCase().trim();
  return !!orderName && orderName === String(session.name || '').toLowerCase().trim();
};

// ── Order / product reads ─────────────────────────────────────────────────
export async function getNormalizedOrders(): Promise<any[]> {
  const db = getDb();
  const { rows } = await db.execute('SELECT * FROM orders');
  const deleted = new Set(await readDeletedIds());
  return rows
    .filter((r: any) => !deleted.has(String(r.order_id)))
    .map((r) => {
      const norm = { ...mapOrderRow(r), status: normalizeOrderStatus(mapOrderRow(r).status) };
      if (!Array.isArray(norm.statusHistory)) norm.statusHistory = [];
      if (norm.statusHistory.length === 0) {
        norm.statusHistory.push({
          status: norm.status,
          timestamp: norm.createdAt || new Date().toISOString(),
          by: 'system',
          note: 'Initial order status',
        });
      }
      return norm;
    });
}

export async function saveOrders(orders: any[]): Promise<void> {
  const db = getDb();
  // Re-write only changed order rows efficiently by upsert each.
  for (const o of orders) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO orders (
        order_id, order_number, date, status, customer, items, subtotal, shipping,
        discount, discount_code, total, payment, payment_info, fulfillment, refund,
        return_request, return_ref, status_history, stock_restored, notes, tags,
        channel, created_at, updated_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        o.orderId,
        o.orderNumber || '',
        o.date || '',
        o.status || 'Pending',
        toJSON(o.customer || null),
        toJSON(o.items || []),
        Number(o.subtotal) || 0,
        Number(o.shipping) || 0,
        Number(o.discount) || 0,
        o.discountCode || '',
        Number(o.total) || 0,
        o.payment || 'Cash on Delivery',
        toJSON(o.paymentInfo || null),
        toJSON(o.fulfillment || null),
        toJSON(o.refund || null),
        toJSON(o.returnRequest || null),
        toJSON(o.returnRef || null),
        toJSON(Array.isArray(o.statusHistory) ? o.statusHistory : []),
        o.stockRestored === true ? 1 : 0,
        o.notes || null,
        toJSON(o.tags || null),
        o.channel || 'Online Store',
        o.createdAt || new Date().toISOString(),
        o.updatedAt || new Date().toISOString(),
      ],
    });
  }
}

export async function getProductsEnriched(): Promise<any[]> {
  const db = getDb();
  const { rows } = await db.execute('SELECT * FROM products');
  return rows.map((r) => enrichProduct(mapProductRow(r)));
}

export async function upsertProduct(p: any): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: `INSERT OR REPLACE INTO products (
      id, sku, barcode, name, category, sub_category, brand, price, original_price,
      cost_price, stock, reserved_stock, low_stock_threshold, reorder_point,
      reorder_qty, status, image, color_name, color, bg_color, text_color, sizes,
      colors, channel_sync, supplier, sales_velocity_7d, created_at, updated_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [
      p.id,
      p.sku || '',
      p.barcode || '',
      p.name || '',
      p.category || 'Apparel',
      p.subCategory || p.sub_category || '',
      p.brand || 'C-HUB Originals',
      Number(p.price) || 0,
      Number(p.originalPrice) || Number(p.price) || 0,
      Number(p.costPrice) || 0,
      Math.max(0, Math.round(Number(p.stock) || 0)),
      Math.max(0, Math.round(Number(p.reservedStock) || 0)),
      Number.isFinite(Number(p.lowStockThreshold)) ? Number(p.lowStockThreshold) : DEFAULT_LOW_STOCK_THRESHOLD,
      Math.max(0, Math.round(Number(p.reorderPoint) || 0)),
      Math.max(0, Math.round(Number(p.reorderQty) || 0)),
      p.status || '',
      p.image || '',
      p.colorName || '',
      p.color || '',
      p.bgColor || '',
      p.textColor || '',
      toJSON(Array.isArray(p.sizes) ? p.sizes : []),
      toJSON(Array.isArray(p.colors) ? p.colors : []),
      toJSON(p.channelSync || { web: true, shopee: false, lazada: false, tiktok: false }),
      toJSON(p.supplier || null),
      Number(p.salesVelocity7d) || 0,
      p.createdAt || new Date().toISOString(),
      p.updatedAt || new Date().toISOString(),
    ],
  });
}

export async function deleteProductById(id: string): Promise<void> {
  const db = getDb();
  await db.execute({ sql: 'DELETE FROM products WHERE id = ?', args: [id] });
}

export const DEFAULT_LOW_STOCK_THRESHOLD = 10;

export const stockStatusOf = (stock: number, threshold: number) => {
  const q = Number(stock) || 0;
  if (q <= 0) return 'Out of Stock';
  if (q <= (Number(threshold) || DEFAULT_LOW_STOCK_THRESHOLD)) return 'Low Stock';
  return 'In Stock';
};

export const enrichProduct = (p: any) => ({
  ...p,
  lowStockThreshold: Number.isFinite(Number(p.lowStockThreshold)) && Number(p.lowStockThreshold) >= 0
    ? Number(p.lowStockThreshold)
    : DEFAULT_LOW_STOCK_THRESHOLD,
  stockStatus: stockStatusOf(p.stock, p.lowStockThreshold),
});

// ── Inventory ─────────────────────────────────────────────────────────────
export async function logInventoryChange(entry: any): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: `INSERT INTO inventory_logs (id, product_id, sku, name, previous_qty, new_qty, adjustment, reason, user, timestamp)
          VALUES (?,?,?,?,?,?,?,?,?,?)`,
    args: [
      `inv-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      entry.productId || '',
      entry.sku || '',
      entry.name || '',
      Math.floor(Number(entry.previousQty) || 0),
      Math.floor(Number(entry.newQty) || 0),
      Math.floor(Number(entry.adjustment) || 0),
      entry.reason || 'Manual adjustment',
      entry.user || 'admin',
      new Date().toISOString(),
    ],
  });
}

export async function applyStockAdjustment(productId: string, delta: number, reason: string, user: string) {
  const products = await getProductsEnriched();
  const idx = products.findIndex((p) => p.id === productId);
  if (idx === -1) return { ok: false, error: 'Product not found' };
  const product = products[idx];
  const prev = Number(product.stock) || 0;
  const next = prev + (Number(delta) || 0);
  if (next < 0) {
    return { ok: false, error: `Insufficient stock: only ${Math.floor(prev)} unit(s) available.`, product };
  }
  product.stock = Math.round(next);
  product.updatedAt = new Date().toISOString();
  await upsertProduct(product);
  const updated = enrichProduct(product);
  await logInventoryChange({
    productId, sku: product.sku, name: product.name,
    previousQty: Math.floor(prev), newQty: updated.stock,
    adjustment: updated.stock - Math.floor(prev),
    reason: reason || 'Manual adjustment', user: user || 'admin',
  });
  return { ok: true, product: updated };
}

export async function setProductStock(productId: string, targetStock: number, reason: string, user: string) {
  const products = await getProductsEnriched();
  const idx = products.findIndex((p) => p.id === productId);
  if (idx === -1) return { ok: false, error: 'Product not found' };
  const product = products[idx];
  const prev = Math.floor(Number(product.stock) || 0);
  const next = Math.max(0, Math.round(Number(targetStock) || 0));
  product.stock = next;
  product.updatedAt = new Date().toISOString();
  await upsertProduct(product);
  const updated = enrichProduct(product);
  await logInventoryChange({
    productId, sku: product.sku, name: product.name,
    previousQty: prev, newQty: next, adjustment: next - prev,
    reason: reason || 'Stock level set', user: user || 'admin',
  });
  return { ok: true, product: updated };
}

export async function restoreOrderStock(order: any, reason: string, user: string) {
  if (order.stockRestored) return { ok: true, restored: false, order };
  const items = Array.isArray(order.items) ? order.items : [];
  const products = await getProductsEnriched();
  if (items.length === 0) {
    return { ok: true, restored: false, order: { ...order, stockRestored: true } };
  }
  let modified = false;
  for (const item of items) {
    const product = products.find((p) => p.id === (item.id || item.productId));
    if (!product) continue;
    const qty = Math.floor(Number(item.qty) || 1);
    const prev = Math.floor(Number(product.stock) || 0);
    product.stock = prev + qty;
    product.updatedAt = new Date().toISOString();
    modified = true;
    await upsertProduct(product);
    await logInventoryChange({
      productId: product.id, sku: product.sku, name: product.name,
      previousQty: prev, newQty: product.stock, adjustment: qty,
      reason: reason || 'Order cancelled/returned — stock restored', user: user || 'system',
    });
  }
  const updatedOrder = { ...order, stockRestored: true };
  return { ok: true, restored: modified, order: updatedOrder };
}

export async function readInventoryLogs(productId?: string, limit = 500): Promise<any[]> {
  const db = getDb();
  const { rows } = await db.execute(
    productId
      ? { sql: 'SELECT * FROM inventory_logs WHERE product_id = ? ORDER BY timestamp DESC LIMIT ?', args: [productId, limit] }
      : { sql: 'SELECT * FROM inventory_logs ORDER BY timestamp DESC LIMIT ?', args: [limit] }
  );
  return rows;
}

// ── Deleted order tombstones ──────────────────────────────────────────────
export async function readDeletedIds(): Promise<string[]> {
  const db = getDb();
  const { rows } = await db.execute('SELECT order_id FROM deleted_order_ids');
  return rows.map((r: any) => r.order_id);
}

export async function writeDeletedIds(ids: string[]): Promise<void> {
  const db = getDb();
  const uniq = [...new Set(ids)];
  if (uniq.length > 0) {
    // Tombstones are append-only; use a single batched (atomic) write since
    // raw BEGIN/COMMIT are not supported over the Turso HTTP client.
    await db.batch(uniq.map((id) => ({ sql: 'INSERT OR IGNORE INTO deleted_order_ids (order_id) VALUES (?)', args: [id] })));
  }
}

// ── Notifications ─────────────────────────────────────────────────────────
export async function createNotification({ email, username, message, type = 'info', orderId }: any): Promise<any> {
  if (!message) return null;
  const db = getDb();
  const n = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    email: String(email || '').toLowerCase(),
    username: String(username || '').toLowerCase(),
    message,
    type: ['info', 'success', 'warning'].includes(type) ? type : 'info',
    orderId: orderId || undefined,
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    read: 0,
  };
  await db.execute({
    sql: 'INSERT INTO notifications (id, email, username, message, type, order_id, timestamp, created_at, read) VALUES (?,?,?,?,?,?,?,?,0)',
    args: [n.id, n.email, n.username, n.message, n.type, n.orderId || null, n.timestamp, n.createdAt],
  });
  // Cap per-user notifications at the 50 newest (best-effort cleanup).
  await db.execute(`
    DELETE FROM notifications WHERE id NOT IN (
      SELECT id FROM notifications ORDER BY created_at DESC LIMIT 500
    )
  `);
  return n;
}

export async function notificationsForSession(session: any): Promise<any[]> {
  const db = getDb();
  const emailKey = String(session.email || '').toLowerCase();
  const userKey = String(session.username || '').toLowerCase();
  const { rows } = await db.execute({
    sql: `SELECT * FROM notifications
          WHERE (email = ? AND email != '') OR (username = ? AND username != '')
          ORDER BY created_at DESC LIMIT 50`,
    args: [emailKey, userKey],
  });
  return rows.map((r: any) => ({
    id: r.id,
    email: r.email,
    username: r.username,
    message: r.message,
    type: r.type,
    orderId: r.order_id,
    timestamp: r.timestamp,
    createdAt: r.created_at,
    read: r.read === 1,
  }));
}

export async function notifyOrderUpdate(order: any, statusLabel: string, note = ''): Promise<void> {
  if (!order) return;
  const isCancelled = /cancel|refund|return/i.test(statusLabel);
  await createNotification({
    email: order.customer?.email,
    message: note || `Your order ${order.orderId} is now ${statusLabel}.`,
    type: isCancelled ? 'warning' : 'success',
    orderId: order.orderId,
  });
}

// ── Vouchers ──────────────────────────────────────────────────────────────
export async function readVouchers(): Promise<any[]> {
  const db = getDb();
  const { rows } = await db.execute('SELECT * FROM vouchers');
  return rows.map((r) => mapVoucherRow(r));
}

export async function writeVouchers(list: any[]): Promise<void> {
  const db = getDb();
  for (const v of list) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO vouchers (
        id, code, type, value, min_subtotal, max_discount, usage_limit, used_count,
        per_user_limit, users, starts_at, expires_at, active, description, created_at, updated_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        v.id,
        String(v.code || '').toUpperCase(),
        v.type === 'fixed' ? 'fixed' : 'percent',
        Number(v.value) || 0,
        Number(v.minSubtotal) || 0,
        Number(v.maxDiscount) || 0,
        Math.floor(Number(v.usageLimit) || 0),
        Math.floor(Number(v.usedCount) || 0),
        Math.floor(Number(v.perUserLimit) || 0),
        toJSON(v.users || {}),
        v.startsAt || null,
        v.expiresAt || null,
        v.active === false || v.active === 0 ? 0 : 1,
        String(v.description || '').slice(0, 300),
        v.createdAt || new Date().toISOString(),
        v.updatedAt || new Date().toISOString(),
      ],
    });
  }
}

export async function findVoucherByCode(code: string): Promise<any | null> {
  const clean = String(code || '').trim().toUpperCase();
  if (!clean) return null;
  const db = getDb();
  const { rows } = await db.execute({ sql: 'SELECT * FROM vouchers WHERE code = ?', args: [clean] });
  return rows.length ? mapVoucherRow(rows[0]) : null;
}

export const voucherDiscountAmount = (voucher: any, subtotal: number) => {
  const base = subtotal >= voucher.minSubtotal
    ? (voucher.type === 'fixed' ? voucher.value : Math.round((subtotal * voucher.value) / 100))
    : 0;
  if (base <= 0) return 0;
  return voucher.maxDiscount > 0 ? Math.min(base, voucher.maxDiscount) : base;
};

export const validateVoucher = (voucher: any, subtotal: number, identityKey = '') => {
  if (!voucher) return { ok: false, reason: 'Voucher code not found.' };
  const now = Date.now();
  if (!voucher.active) return { ok: false, reason: 'This voucher is currently inactive.' };
  if (voucher.startsAt && now < new Date(voucher.startsAt).getTime()) return { ok: false, reason: 'This voucher is not active yet.' };
  if (voucher.expiresAt && now > new Date(voucher.expiresAt).getTime()) return { ok: false, reason: 'This voucher has expired.' };
  if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) return { ok: false, reason: 'This voucher has reached its usage limit.' };
  if (identityKey && voucher.perUserLimit > 0) {
    const used = Math.floor(Number(voucher.users[identityKey]) || 0);
    if (used >= voucher.perUserLimit) return { ok: false, reason: 'You have already used this voucher.' };
  }
  if (subtotal < voucher.minSubtotal) return { ok: false, reason: `Minimum subtotal of ₱${voucher.minSubtotal.toLocaleString()} required.` };
  const amount = voucherDiscountAmount(voucher, subtotal);
  if (amount <= 0) return { ok: false, reason: 'This voucher gives no discount on the current subtotal.' };
  return { ok: true, voucher, discountAmount: amount, info: `Voucher ${voucher.code} applied (${voucher.type === 'fixed' ? `₱${voucher.value}` : `${voucher.value}%`}).` };
};

export const recordVoucherUsage = (voucher: any, identityKey: string) => {
  if (!voucher) return voucher;
  return {
    ...voucher,
    usedCount: voucher.usedCount + 1,
    users: identityKey ? { ...(voucher.users || {}), [identityKey]: (Math.floor(Number(voucher.users?.[identityKey]) || 0)) + 1 } : voucher.users || {},
    updatedAt: new Date().toISOString(),
  };
};

// ── Reviews helpers ───────────────────────────────────────────────────────
export const sanitizeText = (input: any, maxLen = 1500): string => {
  const cleaned = String(input || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.length > maxLen ? cleaned.slice(0, maxLen) : cleaned;
};

export async function readReviews(): Promise<any[]> {
  const db = getDb();
  const { rows } = await db.execute('SELECT * FROM reviews');
  return rows.map((r) => mapReviewRow(r));
}

export async function writeReviews(list: any[]): Promise<void> {
  const db = getDb();
  for (const r of list) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO reviews (
        id, product_id, product_name, order_id, customer_name, customer_email,
        username, rating, comment, date, updated_at, verified_purchase, status,
        admin_reply, moderated_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        r.id, r.productId, r.productName || '', r.orderId || null,
        r.customerName || '', String(r.customerEmail || '').toLowerCase(),
        String(r.username || '').toLowerCase(), Number(r.rating) || 0,
        String(r.comment || ''), r.date || new Date().toISOString(),
        r.updatedAt || null, r.verifiedPurchase === true ? 1 : 0,
        r.status || 'published', toJSON(r.adminReply || null), r.moderatedAt || null,
      ],
    });
  }
}

// ── Default admin + voucher seeding (idempotent, runs at startup) ─────────
export async function seedDefaultAdmin(): Promise<void> {
  try {
    const db = getDb();
    const { rows } = await db.execute("SELECT * FROM users WHERE is_admin = 1 LIMIT 1");
    if (rows.length > 0) return;
    const rec = createPasswordRecord(process.env.ADMIN_PASSWORD || 'admin123');
    await db.execute({
      sql: `INSERT INTO users (name, username, email, salt, password_hash, is_admin, role, active, created_at, updated_at)
            VALUES (?,?,?,?,?,1,?,1,?,?)`,
      args: [
        'C-HUB Admin',
        'admin',
        String(process.env.ADMIN_EMAIL || 'admin@c-hub.ph').toLowerCase(),
        rec.salt, rec.passwordHash, DEFAULT_ADMIN_ROLE,
        new Date().toISOString(), new Date().toISOString(),
      ],
    });
    console.log('👑 Seeded default admin account.');
  } catch (e) {
    console.error('⚠️ Admin seed failed:', (e as Error).message);
  }
}

// ── Session count (for health endpoint) ───────────────────────────────────
export async function sessionCount(): Promise<number> {
  const db = getDb();
  const { rows } = await db.execute('SELECT COUNT(*) AS c FROM sessions');
  return Number(rows[0]?.c || 0);
}