// scripts/generate-seed.mjs
// One-time migration helper: reads the old c-hub-backend JSON data files and
// writes compact seed JSON files that the shared Turso schema consumes.
// Run: node scripts/generate-seed.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const BACKEND_DATA = path.resolve(REPO_ROOT, '..', 'c-hub-backend', 'data');
const OUT_DIR = path.join(REPO_ROOT, 'server', 'seeds');

fs.mkdirSync(OUT_DIR, { recursive: true });

const readJson = (file, fallback = []) => {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    console.warn('⚠️ Skipping', path.basename(file), e.message);
    return fallback;
  }
};

// ── PRODUCTS: compact the catalog ─────────────────────────────────────────
const products = readJson(path.join(BACKEND_DATA, 'products.json'));
const compactProducts = products.map((p) => ({
  id: p.id,
  sku: p.sku || '',
  barcode: p.barcode || '',
  name: p.name || '',
  category: p.category || 'Apparel',
  subCategory: p.subCategory || '',
  brand: p.brand || 'C-HUB Originals',
  price: Number(p.price) || 0,
  originalPrice: Number(p.originalPrice) || Number(p.price) || 0,
  costPrice: Number(p.costPrice) || 0,
  image: p.image || '',
  colorName: p.colorName || '',
  color: p.color || '',
  bgColor: p.bgColor || '',
  textColor: p.textColor || '',
  sizes: Array.isArray(p.sizes) ? p.sizes : [],
  stock: Math.max(0, Math.round(Number(p.stock) || 0)),
  reservedStock: Math.max(0, Math.round(Number(p.reservedStock) || 0)),
  lowStockThreshold: Number.isFinite(Number(p.lowStockThreshold)) ? Number(p.lowStockThreshold) : 10,
  reorderPoint: Math.max(0, Math.round(Number(p.reorderPoint) || 0)),
  reorderQty: Math.max(0, Math.round(Number(p.reorderQty) || 0)),
  status: p.status || '',
  channelSync: p.channelSync || { web: true, shopee: false, lazada: false, tiktok: false },
  supplier: p.supplier || null,
  salesVelocity7d: Math.max(0, Number(p.salesVelocity7d) || 0),
  createdAt: p.createdAt || new Date().toISOString(),
  updatedAt: p.updatedAt || new Date().toISOString(),
}));

// Ensure unique SKUs — legacy data had some collisions (e.g. boys
// "polo" vs "poloshirt" shared a SKU), which would abort the seed batch.
const seenSkus = new Set();
compactProducts.forEach((p) => {
  let sku = p.sku || `CHUB-${String(p.id || Math.random()).replace(/[^a-zA-Z0-9]/g, '') || 'NA'}`;
  let n = 2;
  while (seenSkus.has(String(sku).toLowerCase())) {
    sku = `${p.sku || 'CHUB-NA'}-${n++}`;
  }
  seenSkus.add(String(sku).toLowerCase());
  p.sku = sku;
});

// ── USERS: preserve existing admin/accounts (sanitized to schema shape) ──
const users = readJson(path.join(BACKEND_DATA, 'users.json')).map((u) => ({
  name: u.name || '',
  username: String(u.username || '').toLowerCase(),
  email: String(u.email || '').toLowerCase(),
  salt: u.salt || '',
  password_hash: u.passwordHash || u.password_hash || '',
  is_admin: u.isAdmin === true ? 1 : 0,
  role: u.role || (u.isAdmin ? 'super_admin' : null),
  active: u.active !== false ? 1 : 0,
  reset_token_hash: u.resetTokenHash || null,
  reset_expires_at: u.resetExpiresAt || null,
  created_at: u.createdAt || new Date().toISOString(),
  updated_at: u.updatedAt || new Date().toISOString(),
}));

// ── ORDERS: migrate existing orders if any ────────────────────────────────
const orders = readJson(path.join(BACKEND_DATA, 'orders.json')).map((o) => ({
  orderId: o.orderId,
  orderNumber: o.orderNumber || '',
  date: o.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
  status: o.status || 'Pending',
  customer: o.customer || null,
  items: o.items || [],
  subtotal: Number(o.subtotal) || 0,
  shipping: Number(o.shipping) || 0,
  discount: Number(o.discount) || 0,
  discountCode: o.discountCode || '',
  total: Number(o.total) || 0,
  payment: o.payment || 'Cash on Delivery',
  paymentInfo: o.paymentInfo || null,
  fulfillment: o.fulfillment || null,
  refund: o.refund || null,
  returnRequest: o.returnRequest || null,
  returnRef: o.returnRef || null,
  statusHistory: Array.isArray(o.statusHistory) ? o.statusHistory : [],
  stockRestored: o.stockRestored === true ? 1 : 0,
  notes: o.notes || null,
  tags: o.tags || null,
  channel: o.channel || 'Online Store',
  createdAt: o.createdAt || new Date().toISOString(),
  updatedAt: o.updatedAt || new Date().toISOString(),
}));

// ── REVIEWS ───────────────────────────────────────────────────────────────
const reviews = readJson(path.join(BACKEND_DATA, 'reviews.json')).map((r) => ({
  id: r.id,
  productId: r.productId,
  productName: r.productName || '',
  orderId: r.orderId || null,
  customerName: r.customerName || '',
  customerEmail: String(r.customerEmail || '').toLowerCase(),
  username: String(r.username || '').toLowerCase(),
  rating: Number(r.rating) || 0,
  comment: r.comment || '',
  date: r.date || new Date().toISOString(),
  updatedAt: r.updatedAt || null,
  verifiedPurchase: r.verifiedPurchase === true ? 1 : 0,
  status: r.status || 'published',
  adminReply: r.adminReply || null,
  moderatedAt: r.moderatedAt || null,
}));

// ── VOUCHERS ──────────────────────────────────────────────────────────────
const vouchers = readJson(path.join(BACKEND_DATA, 'vouchers.json')).map((v) => ({
  id: v.id,
  code: String(v.code || '').toUpperCase(),
  type: v.type === 'fixed' ? 'fixed' : 'percent',
  value: Math.max(0, Number(v.value) || 0),
  minSubtotal: Math.max(0, Number(v.minSubtotal) || 0),
  maxDiscount: Math.max(0, Number(v.maxDiscount) || 0),
  usageLimit: Math.max(0, Math.floor(Number(v.usageLimit) || 0)),
  usedCount: Math.max(0, Math.floor(Number(v.usedCount) || 0)),
  perUserLimit: Math.max(0, Math.floor(Number(v.perUserLimit) || 0)),
  users: v.users && typeof v.users === 'object' ? v.users : {},
  startsAt: v.startsAt || null,
  expiresAt: v.expiresAt || null,
  active: v.active !== false ? 1 : 0,
  description: v.description || '',
  createdAt: v.createdAt || new Date().toISOString(),
  updatedAt: v.updatedAt || new Date().toISOString(),
}));

const write = (name, data) => {
  const file = path.join(OUT_DIR, name);
  fs.writeFileSync(file, JSON.stringify(data));
  console.log(`✅ Wrote ${file} (${(fs.statSync(file).size / 1024).toFixed(1)} KB, ${data.length} rows)`);
};

write('products.seed.json', compactProducts);
write('users.seed.json', users);
write('orders.seed.json', orders);
write('reviews.seed.json', reviews);
write('vouchers.seed.json', vouchers);

console.log('Done. Seed files are in server/seeds/ — copy them to the admin project too.');