// server/db.ts
// C-HUB shared Turso database access + schema (single source of truth).
// BOTH the Store backend and the Admin backend use this exact same module /
// schema so they read and write the SAME database.

import { createClient, type Client } from '@libsql/client';
import productsSeeds from './seeds/products.seed.json';
import ordersSeeds from './seeds/orders.seed.json';
import usersSeeds from './seeds/users.seed.json';
import reviewsSeeds from './seeds/reviews.seed.json';
import vouchersSeeds from './seeds/vouchers.seed.json';

export const DATABASE_URL =
  process.env.DATABASE_URL ||
  'libsql://c-hub-aegix2025.aws-ap-northeast-1.turso.io';

export const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || '';

// ──────────────────────────────────────────────────────────────────────────
// SINGLE SHARED TURSO DATABASE
// The auth token must stay SERVER-SIDE only. It is NEVER exposed to the
// browser (do not put it in VITE_* env vars).
// ──────────────────────────────────────────────────────────────────────────
export function createTursoClient(): Client {
  const client = createClient({
    url: DATABASE_URL,
    authToken: TURSO_AUTH_TOKEN || undefined,
  });
  return client;
}

let db: Client | null = null;
export function getDb(): Client {
  if (!db) db = createTursoClient();
  return db;
}

// ──────────────────────────────────────────────────────────────────────────
// SCHEMA — shared by C-Hub Store and C-Hub Admin.
// The same table names/columns are created on first startup (IF NOT EXISTS),
// so whichever app boots first provisions the schema; the other reuses it.
// ──────────────────────────────────────────────────────────────────────────
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  username TEXT,
  email TEXT,
  salt TEXT,
  password_hash TEXT,
  is_admin INTEGER DEFAULT 0,
  role TEXT,
  active INTEGER DEFAULT 1,
  reset_token_hash TEXT,
  reset_expires_at INTEGER,
  created_at TEXT,
  updated_at TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  sku TEXT,
  barcode TEXT,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Apparel',
  sub_category TEXT,
  brand TEXT,
  price REAL DEFAULT 0,
  original_price REAL DEFAULT 0,
  cost_price REAL DEFAULT 0,
  stock INTEGER DEFAULT 0,
  reserved_stock INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  reorder_point INTEGER DEFAULT 0,
  reorder_qty INTEGER DEFAULT 0,
  status TEXT,
  image TEXT,
  color_name TEXT,
  color TEXT,
  bg_color TEXT,
  text_color TEXT,
  sizes TEXT,
  colors TEXT,
  channel_sync TEXT,
  supplier TEXT,
  sales_velocity_7d REAL DEFAULT 0,
  created_at TEXT,
  updated_at TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

CREATE TABLE IF NOT EXISTS orders (
  order_id TEXT PRIMARY KEY,
  order_number TEXT,
  date TEXT,
  status TEXT DEFAULT 'Pending',
  customer TEXT,
  items TEXT,
  subtotal REAL DEFAULT 0,
  shipping REAL DEFAULT 0,
  discount REAL DEFAULT 0,
  discount_code TEXT,
  total REAL DEFAULT 0,
  payment TEXT,
  payment_info TEXT,
  fulfillment TEXT,
  refund TEXT,
  return_request TEXT,
  return_ref TEXT,
  status_history TEXT,
  stock_restored INTEGER DEFAULT 0,
  notes TEXT,
  tags TEXT,
  channel TEXT DEFAULT 'Online Store',
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT,
  product_name TEXT,
  order_id TEXT,
  customer_name TEXT,
  customer_email TEXT,
  username TEXT,
  rating INTEGER DEFAULT 0,
  comment TEXT,
  date TEXT,
  updated_at TEXT,
  verified_purchase INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  admin_reply TEXT,
  moderated_at TEXT
);

CREATE TABLE IF NOT EXISTS wishlist (
  username TEXT NOT NULL,
  product_id TEXT NOT NULL,
  added_at TEXT,
  PRIMARY KEY (username, product_id)
);

CREATE TABLE IF NOT EXISTS vouchers (
  id TEXT PRIMARY KEY,
  code TEXT,
  type TEXT DEFAULT 'percent',
  value REAL DEFAULT 0,
  min_subtotal REAL DEFAULT 0,
  max_discount REAL DEFAULT 0,
  usage_limit INTEGER DEFAULT 0,
  used_count INTEGER DEFAULT 0,
  per_user_limit INTEGER DEFAULT 0,
  users TEXT,
  starts_at TEXT,
  expires_at TEXT,
  active INTEGER DEFAULT 1,
  description TEXT,
  created_at TEXT,
  updated_at TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers(code);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  email TEXT,
  username TEXT,
  message TEXT,
  type TEXT DEFAULT 'info',
  order_id TEXT,
  timestamp TEXT,
  created_at TEXT,
  read INTEGER DEFAULT 0,
  read_at TEXT
);

CREATE TABLE IF NOT EXISTS inventory_logs (
  id TEXT PRIMARY KEY,
  product_id TEXT,
  sku TEXT,
  name TEXT,
  previous_qty INTEGER DEFAULT 0,
  new_qty INTEGER DEFAULT 0,
  adjustment INTEGER DEFAULT 0,
  reason TEXT,
  user TEXT,
  timestamp TEXT
);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  timestamp TEXT,
  admin_email TEXT,
  admin_name TEXT,
  admin_role TEXT,
  action TEXT,
  target TEXT,
  summary TEXT,
  details TEXT
);

CREATE TABLE IF NOT EXISTS deleted_order_ids (
  order_id TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  email TEXT,
  username TEXT,
  name TEXT,
  role TEXT,
  is_admin INTEGER DEFAULT 0,
  created_at TEXT
);
`;

export async function ensureSchema(): Promise<void> {
  const client = getDb();
  await client.executeMultiple(SCHEMA_SQL);
}

// ──────────────────────────────────────────────────────────────────────────
// Row mapping helpers  (DB snake_case <=> API camelCase)
// ──────────────────────────────────────────────────────────────────────────
export function mapProductRow(r: any): any {
  return {
    id: r.id,
    sku: r.sku || '',
    barcode: r.barcode || '',
    name: r.name || '',
    category: r.category || 'Apparel',
    subCategory: r.sub_category || r.subCategory || '',
    brand: r.brand || '',
    price: Number(r.price) || 0,
    originalPrice: Number(r.original_price) || Number(r.price) || 0,
    costPrice: Number(r.cost_price) || 0,
    stock: Number(r.stock) || 0,
    reservedStock: Number(r.reserved_stock) || 0,
    lowStockThreshold: Number(r.low_stock_threshold) || 10,
    reorderPoint: Number(r.reorder_point) || 0,
    reorderQty: Number(r.reorder_qty) || 0,
    status: r.status || '',
    image: r.image || '',
    colorName: r.color_name || r.colorName || '',
    color: r.color || r.colorName || '',
    bgColor: r.bg_color || r.bgColor || '',
    textColor: r.text_color || r.textColor || '',
    sizes: safeParse(r.sizes, []),
    colors: safeParse(r.colors, []),
    channelSync: safeParse(r.channel_sync, { web: true, shopee: false, lazada: false, tiktok: false }),
    supplier: safeParse(r.supplier, null),
    salesVelocity7d: Number(r.sales_velocity_7d) || 0,
    createdAt: r.created_at || null,
    updatedAt: r.updated_at || null,
  };
}

export function mapOrderRow(r: any): any {
  return {
    orderId: r.order_id,
    orderNumber: r.order_number || '',
    date: r.date || '',
    status: r.status || 'Pending',
    customer: safeParse(r.customer, null),
    items: safeParse(r.items, []),
    subtotal: Number(r.subtotal) || 0,
    shipping: Number(r.shipping) || 0,
    discount: Number(r.discount) || 0,
    discountCode: r.discount_code || '',
    total: Number(r.total) || 0,
    payment: r.payment || 'Cash on Delivery',
    paymentInfo: safeParse(r.payment_info, null),
    fulfillment: safeParse(r.fulfillment, null),
    refund: safeParse(r.refund, null),
    returnRequest: safeParse(r.return_request, null),
    returnRef: safeParse(r.return_ref, null),
    statusHistory: safeParse(r.status_history, []),
    stockRestored: r.stock_restored === 1,
    notes: r.notes || null,
    tags: safeParse(r.tags, null),
    channel: r.channel || 'Online Store',
    createdAt: r.created_at || null,
    updatedAt: r.updated_at || null,
  };
}

export function mapUserRow(r: any): any {
  return {
    name: r.name || '',
    username: r.username || '',
    email: (r.email || '').toLowerCase(),
    role: r.role || (r.is_admin ? 'super_admin' : 'customer'),
    isAdmin: r.is_admin === 1,
    active: r.active !== 0,
    createdAt: r.created_at || null,
    updatedAt: r.updated_at || null,
  };
}

export function mapVoucherRow(r: any): any {
  return {
    id: r.id,
    code: r.code || '',
    type: r.type || 'percent',
    value: Number(r.value) || 0,
    minSubtotal: Number(r.min_subtotal) || 0,
    maxDiscount: Number(r.max_discount) || 0,
    usageLimit: Number(r.usage_limit) || 0,
    usedCount: Number(r.used_count) || 0,
    perUserLimit: Number(r.per_user_limit) || 0,
    users: safeParse(r.users, {}),
    startsAt: r.starts_at || null,
    expiresAt: r.expires_at || null,
    active: r.active !== 0,
    description: r.description || '',
    createdAt: r.created_at || null,
    updatedAt: r.updated_at || null,
  };
}

export function mapReviewRow(r: any): any {
  return {
    id: r.id,
    productId: r.product_id,
    productName: r.product_name || '',
    orderId: r.order_id || null,
    customerName: r.customer_name || '',
    customerEmail: (r.customer_email || '').toLowerCase(),
    username: (r.username || '').toLowerCase(),
    rating: Number(r.rating) || 0,
    comment: r.comment || '',
    date: r.date || null,
    updatedAt: r.updated_at || null,
    verifiedPurchase: r.verified_purchase === 1,
    status: r.status || 'published',
    adminReply: safeParse(r.admin_reply, null),
    moderatedAt: r.moderated_at || null,
  };
}

export function safeParse<T>(value: string | null | undefined, fallback: T): T {
  if (value == null || value === '') return fallback;
  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    return fallback;
  }
}

// Reusable JSON stringify for DB columns
export const toJSON = (v: any) => (v == null ? null : JSON.stringify(v));

// ──────────────────────────────────────────────────────────────────────────
// Seeding — populate shared tables once (idempotent).
// Source: server/seeds/*.seed.json (generated from the old backend data).
// ──────────────────────────────────────────────────────────────────────────
// SEEDS — imported as JSON modules so they are BUNDLED into the serverless
// function (Vercel). Seeding is idempotent: it skips when data already exists.
// ──────────────────────────────────────────────────────────────────────────

export async function seedProducts(): Promise<number> {
  const client = getDb();
  const seed = productsSeeds as any[];
  if (!Array.isArray(seed) || seed.length === 0) return 0;
  const { rows } = await client.execute('SELECT COUNT(*) AS c FROM products');
  const count = Number(rows[0]?.c || 0);
  if (count > 0) return 0;

  const insertSql = `INSERT OR IGNORE INTO products (
      id, sku, barcode, name, category, sub_category, brand, price, original_price,
      cost_price, stock, reserved_stock, low_stock_threshold, reorder_point,
      reorder_qty, status, image, color_name, color, bg_color, text_color, sizes,
      colors, channel_sync, supplier, sales_velocity_7d, created_at, updated_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  // Use a batched transaction for speed
  await client.batch(
    seed.map((p) => ({
      sql: insertSql,
      args: [
        String(p.id || ''),
        String(p.sku || ''),
        String(p.barcode || ''),
        String(p.name || ''),
        String(p.category || 'Apparel'),
        String(p.subCategory || p.sub_category || ''),
        String(p.brand || ''),
        Number(p.price) || 0,
        Number(p.originalPrice) || Number(p.price) || 0,
        Number(p.costPrice) || 0,
        Math.max(0, Math.round(Number(p.stock) || 0)),
        Math.max(0, Math.round(Number(p.reservedStock) || 0)),
        Number.isFinite(Number(p.lowStockThreshold)) ? Number(p.lowStockThreshold) : 10,
        Math.max(0, Math.round(Number(p.reorderPoint) || 0)),
        Math.max(0, Math.round(Number(p.reorderQty) || 0)),
        String(p.status || ''),
        String(p.image || ''),
        String(p.colorName || ''),
        String(p.color || ''),
        String(p.bgColor || ''),
        String(p.textColor || ''),
        toJSON(p.sizes || []),
        toJSON(p.colors || []),
        toJSON(p.channelSync || { web: true, shopee: false, lazada: false, tiktok: false }),
        toJSON(p.supplier || null),
        Number(p.salesVelocity7d) || 0,
        String(p.createdAt || new Date().toISOString()),
        String(p.updatedAt || new Date().toISOString()),
      ],
    }))
  );
  console.log(`🌱 Seeded ${seed.length} products into shared Turso database.`);
  return seed.length;
}

export async function seedOrders(): Promise<number> {
  const client = getDb();
  const seed = ordersSeeds as any[];
  if (!Array.isArray(seed) || seed.length === 0) return 0;
  const { rows } = await client.execute('SELECT COUNT(*) AS c FROM orders');
  if (Number(rows[0]?.c || 0) > 0) return 0;
  await client.batch(
    seed.map((o) => ({
      sql: `INSERT OR IGNORE INTO orders (
        order_id, order_number, date, status, customer, items, subtotal, shipping,
        discount, discount_code, total, payment, payment_info, fulfillment, refund,
        return_request, return_ref, status_history, stock_restored, notes, tags,
        channel, created_at, updated_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        String(o.orderId || ''),
        String(o.orderNumber || ''),
        String(o.date || ''),
        String(o.status || 'Pending'),
        toJSON(o.customer || null),
        toJSON(o.items || []),
        Number(o.subtotal) || 0,
        Number(o.shipping) || 0,
        Number(o.discount) || 0,
        String(o.discountCode || ''),
        Number(o.total) || 0,
        String(o.payment || 'Cash on Delivery'),
        toJSON(o.paymentInfo || null),
        toJSON(o.fulfillment || null),
        toJSON(o.refund || null),
        toJSON(o.returnRequest || null),
        toJSON(o.returnRef || null),
        toJSON(Array.isArray(o.statusHistory) ? o.statusHistory : []),
        o.stockRestored === true || o.stockRestored === 1 ? 1 : 0,
        o.notes || null,
        toJSON(o.tags || null),
        String(o.channel || 'Online Store'),
        String(o.createdAt || new Date().toISOString()),
        String(o.updatedAt || new Date().toISOString()),
      ],
    }))
  );
  console.log(`🌱 Seeded ${seed.length} orders into shared Turso database.`);
  return seed.length;
}

export async function seedUsers(): Promise<number> {
  const client = getDb();
  const seed = usersSeeds as any[];
  if (!Array.isArray(seed) || seed.length === 0) return 0;
  const { rows } = await client.execute("SELECT COUNT(*) AS c FROM users WHERE username IS NOT NULL AND username != ''");
  if (Number(rows[0]?.c || 0) > 0) return 0;
  await client.batch(
    seed
      .filter((u) => u.username)
      .map((u) => ({
        sql: `INSERT OR IGNORE INTO users (
          name, username, email, salt, password_hash, is_admin, role, active,
          reset_token_hash, reset_expires_at, created_at, updated_at
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        args: [
          String(u.name || ''),
          String(u.username || '').toLowerCase(),
          String(u.email || '').toLowerCase(),
          String(u.salt || ''),
          String(u.password_hash || ''),
          u.is_admin === true || u.is_admin === 1 ? 1 : 0,
          u.role || (u.is_admin ? 'super_admin' : null),
          u.active === false || u.active === 0 ? 0 : 1,
          u.reset_token_hash || null,
          u.reset_expires_at || null,
          String(u.created_at || new Date().toISOString()),
          String(u.updated_at || new Date().toISOString()),
        ],
      }))
  );
  console.log(`🌱 Seeded ${seed.length} user accounts into shared Turso database.`);
  return seed.length;
}

export async function seedReviews(): Promise<number> {
  const client = getDb();
  const seed = reviewsSeeds as any[];
  if (!Array.isArray(seed) || seed.length === 0) return 0;
  const { rows } = await client.execute('SELECT COUNT(*) AS c FROM reviews');
  if (Number(rows[0]?.c || 0) > 0) return 0;
  await client.batch(
    seed.map((r) => ({
      sql: `INSERT OR IGNORE INTO reviews (
        id, product_id, product_name, order_id, customer_name, customer_email,
        username, rating, comment, date, updated_at, verified_purchase, status,
        admin_reply, moderated_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        String(r.id || ''),
        String(r.productId || ''),
        String(r.productName || ''),
        r.orderId || null,
        String(r.customerName || ''),
        String(r.customerEmail || '').toLowerCase(),
        String(r.username || '').toLowerCase(),
        Number(r.rating) || 0,
        String(r.comment || ''),
        String(r.date || new Date().toISOString()),
        r.updatedAt || null,
        r.verifiedPurchase === true || r.verifiedPurchase === 1 ? 1 : 0,
        String(r.status || 'published'),
        toJSON(r.adminReply || null),
        r.moderatedAt || null,
      ],
    }))
  );
  console.log(`🌱 Seeded ${seed.length} reviews into shared Turso database.`);
  return seed.length;
}

export async function seedVouchers(): Promise<number> {
  const client = getDb();
  const { rows } = await client.execute('SELECT COUNT(*) AS c FROM vouchers');
  if (Number(rows[0]?.c || 0) > 0) return 0;

  // Merge seed file + guaranteed defaults (idempotent by code).
  const defaults = [
    { id: `voucher-${Date.now()}-pwd`, code: 'PWD', type: 'percent', value: 20, minSubtotal: 0, description: 'Persons with Disability discount (20%)' },
    { id: `voucher-${Date.now()}-senior`, code: 'SENIOR', type: 'percent', value: 20, minSubtotal: 0, description: 'Senior Citizen discount (20%)' },
    { id: `voucher-${Date.now()}-welcome`, code: 'WELCOME10', type: 'percent', value: 10, minSubtotal: 0, description: 'Welcome discount (10%)' },
    { id: `voucher-${Date.now()}-vip`, code: 'CHUBVIP', type: 'percent', value: 10, minSubtotal: 0, description: 'C-HUB VIP discount (10%)' },
  ];
  const seedV = vouchersSeeds as any[];
  const byCode = new Map<string, any>();
  [...seedV, ...defaults].forEach((v) => {
    if (v && v.code) byCode.set(String(v.code).toUpperCase(), v);
  });
  const list = [...byCode.values()];
  await client.batch(
    list.map((v) => ({
      sql: `INSERT OR IGNORE INTO vouchers (
        id, code, type, value, min_subtotal, max_discount, usage_limit, used_count,
        per_user_limit, users, starts_at, expires_at, active, description, created_at, updated_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        String(v.id || `voucher-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
        String(v.code || '').toUpperCase(),
        v.type === 'fixed' ? 'fixed' : 'percent',
        Number(v.value) || 0,
        Number(v.minSubtotal) || 0,
        Number(v.maxDiscount) || 0,
        Math.floor(Number(v.usageLimit) || 0),
        Math.floor(Number(v.usedCount) || 0),
        Math.floor(Number(v.perUserLimit) || 0),
        toJSON(v.users && typeof v.users === 'object' ? v.users : {}),
        v.startsAt || null,
        v.expiresAt || null,
        v.active === false || v.active === 0 ? 0 : 1,
        String(v.description || '').slice(0, 300),
        String(v.createdAt || new Date().toISOString()),
        String(v.updatedAt || new Date().toISOString()),
      ],
    }))
  );
  console.log(`🌱 Seeded ${list.length} vouchers into shared Turso database.`);
  return list.length;
}

export async function runInitialSeed(): Promise<void> {
  try {
    await ensureSchema();
  } catch (e) {
    console.error('⚠️ Schema provisioning warning:', (e as Error).message);
  }
  // Each seed is independent — one data hiccup must never block the others.
  const seeds: Array<[string, () => Promise<number>]> = [
    ['vouchers', seedVouchers],
    ['products', seedProducts],
    ['users', seedUsers],
    ['orders', seedOrders],
    ['reviews', seedReviews],
  ];
  for (const [name, fn] of seeds) {
    try {
      await fn();
    } catch (e) {
      console.error(`⚠️ ${name} seeding warning:`, (e as Error).message);
    }
  }
}