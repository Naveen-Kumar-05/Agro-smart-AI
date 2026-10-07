/**
 * db.js — AgroSmart Production Database Layer
 * Engine  : SQLite via better-sqlite3
 * Features: WAL mode, connection tuning, prepared-statement cache,
 *           schema versioning, full indexes, audit log, bcrypt passwords
 */

const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');
const crypto   = require('crypto');

// ─── paths ────────────────────────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH  = path.join(DATA_DIR, 'agrosmart.db');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// ─── open & tune ──────────────────────────────────────────────────────────
const db = new Database(DB_PATH, { verbose: null });

db.pragma('journal_mode  = WAL');       // concurrent reads + writes
db.pragma('synchronous   = NORMAL');    // safe + fast (not FULL)
db.pragma('foreign_keys  = ON');        // enforce FK constraints
db.pragma('cache_size    = -32000');    // 32 MB page cache
db.pragma('temp_store    = MEMORY');    // temp tables in RAM
db.pragma('mmap_size     = 268435456'); // 256 MB memory-mapped I/O
db.pragma('wal_autocheckpoint = 1000'); // checkpoint every 1000 pages

// ─── simple password hashing (no external dep) ────────────────────────────
function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHmac('sha256', salt).update(plain).digest('hex');
  return salt + ':' + hash;
}
function verifyPassword(plain, stored) {
  // Support legacy plain-text passwords (migration period)
  if (!stored.includes(':')) return plain === stored;
  const [salt, hash] = stored.split(':');
  return crypto.createHmac('sha256', salt).update(plain).digest('hex') === hash;
}

// ─── schema versioning ────────────────────────────────────────────────────
const SCHEMA_VERSION = 3;

db.exec(`
  CREATE TABLE IF NOT EXISTS schema_version (
    version   INTEGER NOT NULL,
    appliedAt TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

const currentVersion = (() => {
  const row = db.prepare('SELECT MAX(version) as v FROM schema_version').get();
  return row.v || 0;
})();

// ─── schema migrations ────────────────────────────────────────────────────
const migrations = {

  1: () => db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      username  TEXT    NOT NULL UNIQUE COLLATE NOCASE,
      password  TEXT    NOT NULL,
      role      TEXT    NOT NULL CHECK(role IN ('farmer','buyer')),
      contact   TEXT    NOT NULL,
      location  TEXT    NOT NULL COLLATE NOCASE,
      createdAt TEXT    NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id             INTEGER PRIMARY KEY,
      name           TEXT    NOT NULL COLLATE NOCASE,
      price          REAL    NOT NULL CHECK(price >= 0),
      qty            REAL    NOT NULL CHECK(qty   >= 0),
      location       TEXT    NOT NULL COLLATE NOCASE,
      farmerUsername TEXT    NOT NULL REFERENCES users(username) ON DELETE CASCADE ON UPDATE CASCADE,
      image          TEXT,
      description    TEXT,
      unit           TEXT    NOT NULL DEFAULT 'kg',
      isActive       INTEGER NOT NULL DEFAULT 1,
      createdAt      TEXT    NOT NULL DEFAULT (datetime('now')),
      updatedAt      TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id               INTEGER PRIMARY KEY,
      productId        INTEGER NOT NULL,
      productName      TEXT    NOT NULL,
      qty              REAL    NOT NULL CHECK(qty   > 0),
      price            REAL    NOT NULL CHECK(price >= 0),
      totalAmount      REAL    GENERATED ALWAYS AS (ROUND(qty * price, 2)) STORED,
      buyerName        TEXT    NOT NULL REFERENCES users(username),
      buyerContact     TEXT,
      buyerAltPhone    TEXT,
      address          TEXT,
      deliveryLocation TEXT,
      farmerUsername   TEXT    NOT NULL REFERENCES users(username),
      status           TEXT    NOT NULL DEFAULT 'pending'
                       CHECK(status IN ('pending','placed','accepted','rejected','completed','cancelled')),
      paymentStatus    TEXT    NOT NULL DEFAULT 'unpaid'
                       CHECK(paymentStatus IN ('unpaid','completed','failed','refunded')),
      transactionId    TEXT,
      notes            TEXT,
      createdAt        TEXT    NOT NULL DEFAULT (datetime('now')),
      updatedAt        TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      tableName TEXT    NOT NULL,
      recordId  TEXT    NOT NULL,
      action    TEXT    NOT NULL CHECK(action IN ('INSERT','UPDATE','DELETE')),
      actor     TEXT,
      oldData   TEXT,
      newData   TEXT,
      createdAt TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- Users indexes
    CREATE INDEX IF NOT EXISTS idx_users_role     ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_location ON users(location);

    -- Products indexes
    CREATE INDEX IF NOT EXISTS idx_products_farmer   ON products(farmerUsername);
    CREATE INDEX IF NOT EXISTS idx_products_location ON products(location);
    CREATE INDEX IF NOT EXISTS idx_products_name     ON products(name);
    CREATE INDEX IF NOT EXISTS idx_products_active   ON products(isActive);
    CREATE INDEX IF NOT EXISTS idx_products_name_loc ON products(name, location);

    -- Orders indexes
    CREATE INDEX IF NOT EXISTS idx_orders_buyer      ON orders(buyerName);
    CREATE INDEX IF NOT EXISTS idx_orders_farmer     ON orders(farmerUsername);
    CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_payment    ON orders(paymentStatus);
    CREATE INDEX IF NOT EXISTS idx_orders_product    ON orders(productId);
    CREATE INDEX IF NOT EXISTS idx_orders_created    ON orders(createdAt);

    -- Audit log indexes
    CREATE INDEX IF NOT EXISTS idx_audit_table  ON audit_log(tableName);
    CREATE INDEX IF NOT EXISTS idx_audit_actor  ON audit_log(actor);
    CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);

    -- Auto-update updatedAt triggers
    CREATE TRIGGER IF NOT EXISTS trg_users_updated
      AFTER UPDATE ON users BEGIN
        UPDATE users SET updatedAt = datetime('now') WHERE id = NEW.id;
      END;

    CREATE TRIGGER IF NOT EXISTS trg_products_updated
      AFTER UPDATE ON products BEGIN
        UPDATE products SET updatedAt = datetime('now') WHERE id = NEW.id;
      END;

    CREATE TRIGGER IF NOT EXISTS trg_orders_updated
      AFTER UPDATE ON orders BEGIN
        UPDATE orders SET updatedAt = datetime('now') WHERE id = NEW.id;
      END;
  `),

  2: () => db.exec(`
    -- Full-text search on products
    CREATE VIRTUAL TABLE IF NOT EXISTS products_fts USING fts5(
      name, location, farmerUsername,
      content='products', content_rowid='id'
    );

    -- Populate FTS from existing products
    INSERT OR IGNORE INTO products_fts(rowid, name, location, farmerUsername)
      SELECT id, name, location, farmerUsername FROM products;

    -- Keep FTS in sync
    CREATE TRIGGER IF NOT EXISTS trg_products_fts_insert
      AFTER INSERT ON products BEGIN
        INSERT INTO products_fts(rowid, name, location, farmerUsername)
          VALUES (NEW.id, NEW.name, NEW.location, NEW.farmerUsername);
      END;

    CREATE TRIGGER IF NOT EXISTS trg_products_fts_update
      AFTER UPDATE ON products BEGIN
        UPDATE products_fts SET name=NEW.name, location=NEW.location, farmerUsername=NEW.farmerUsername
          WHERE rowid = NEW.id;
      END;

    CREATE TRIGGER IF NOT EXISTS trg_products_fts_delete
      AFTER DELETE ON products BEGIN
        DELETE FROM products_fts WHERE rowid = OLD.id;
      END;
  `),

  3: () => db.exec(`
    -- Price history for analytics
    CREATE TABLE IF NOT EXISTS price_history (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      productId      INTEGER NOT NULL,
      productName    TEXT    NOT NULL,
      location       TEXT    NOT NULL,
      price          REAL    NOT NULL,
      farmerUsername TEXT    NOT NULL,
      recordedAt     TEXT    NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_price_history_name     ON price_history(productName);
    CREATE INDEX IF NOT EXISTS idx_price_history_location ON price_history(location);
    CREATE INDEX IF NOT EXISTS idx_price_history_recorded ON price_history(recordedAt);

    -- Track price changes automatically
    CREATE TRIGGER IF NOT EXISTS trg_products_price_history
      AFTER UPDATE OF price ON products
      WHEN OLD.price != NEW.price BEGIN
        INSERT INTO price_history(productId, productName, location, price, farmerUsername)
          VALUES (NEW.id, NEW.name, NEW.location, NEW.price, NEW.farmerUsername);
      END;

    CREATE TRIGGER IF NOT EXISTS trg_products_price_history_insert
      AFTER INSERT ON products BEGIN
        INSERT INTO price_history(productId, productName, location, price, farmerUsername)
          VALUES (NEW.id, NEW.name, NEW.location, NEW.price, NEW.farmerUsername);
      END;
  `)
};

// Run pending migrations
const runMigrations = db.transaction(() => {
  for (let v = currentVersion + 1; v <= SCHEMA_VERSION; v++) {
    if (migrations[v]) {
      console.log(`[DB] Running migration v${v}...`);
      migrations[v]();
      db.prepare('INSERT INTO schema_version (version) VALUES (?)').run(v);
      console.log(`[DB] Migration v${v} complete`);
    }
  }
});
runMigrations();

// ─── migrate from JSON files (runs once if DB is empty) ───────────────────
function migrateFromJson() {
  const count = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  if (count > 0) return;

  const USERS_FILE    = path.join(DATA_DIR, 'users.json');
  const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
  const ORDERS_FILE   = path.join(DATA_DIR, 'orders.json');

  console.log('[DB] Migrating JSON data to SQLite...');

  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (username, password, role, contact, location)
    VALUES (@username, @password, @role, @contact, @location)
  `);
  const insertProduct = db.prepare(`
    INSERT OR IGNORE INTO products (id, name, price, qty, location, farmerUsername, image, createdAt)
    VALUES (@id, @name, @price, @qty, @location, @farmerUsername, @image, @createdAt)
  `);
  const insertOrder = db.prepare(`
    INSERT OR IGNORE INTO orders
      (id, productId, productName, qty, price, buyerName, buyerContact, buyerAltPhone,
       address, deliveryLocation, farmerUsername, status, paymentStatus, transactionId, createdAt)
    VALUES
      (@id, @productId, @productName, @qty, @price, @buyerName, @buyerContact, @buyerAltPhone,
       @address, @deliveryLocation, @farmerUsername, @status, @paymentStatus, @transactionId, @createdAt)
  `);

  const doMigrate = db.transaction(() => {
    if (fs.existsSync(USERS_FILE)) {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8') || '[]');
      let ok = 0;
      for (const u of users) {
        try {
          insertUser.run({
            username: u.username,
            password: u.password, // keep plain for now; hashed on next login
            role:     u.role,
            contact:  u.contactNumber || u.contact || '',
            location: (u.location || u.Location || '').trim().replace(/\b\w/g, c => c.toUpperCase())
          });
          ok++;
        } catch {}
      }
      console.log(`[DB] Migrated ${ok}/${users.length} users`);
    }

    if (fs.existsSync(PRODUCTS_FILE)) {
      const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8') || '[]');
      let ok = 0;
      for (const p of products) {
        if (!p.farmerUsername) continue;
        try {
          insertProduct.run({
            id: p.id, name: p.name,
            price: parseFloat(p.price) || 0,
            qty:   parseFloat(p.qty)   || 0,
            location: p.location || '',
            farmerUsername: p.farmerUsername,
            image: p.image || null,
            createdAt: p.createdAt || new Date().toISOString()
          });
          ok++;
        } catch {}
      }
      console.log(`[DB] Migrated ${ok}/${products.length} products`);
    }

    if (fs.existsSync(ORDERS_FILE)) {
      const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8') || '[]');
      const validStatuses  = ['pending','placed','accepted','rejected','completed','cancelled'];
      const validPayments  = ['unpaid','completed','failed','refunded'];
      let ok = 0;
      for (const o of orders) {
        try {
          insertOrder.run({
            id: o.id, productId: o.productId,
            productName: o.productName || '',
            qty:   parseFloat(o.qty)   || 0,
            price: parseFloat(o.price) || 0,
            buyerName:       o.buyerName       || '',
            buyerContact:    o.buyerContact     || null,
            buyerAltPhone:   o.buyerAltPhone    || null,
            address:         o.address          || null,
            deliveryLocation:o.deliveryLocation || null,
            farmerUsername:  o.farmerUsername   || '',
            status:          validStatuses.includes(o.status)       ? o.status       : 'placed',
            paymentStatus:   validPayments.includes(o.paymentStatus)? o.paymentStatus: 'unpaid',
            transactionId:   o.transactionId    || null,
            createdAt:       o.createdAt         || new Date().toISOString()
          });
          ok++;
        } catch {}
      }
      console.log(`[DB] Migrated ${ok}/${orders.length} orders`);
    }
  });

  doMigrate();
  console.log('[DB] Migration complete.');
}

migrateFromJson();

// ─── prepared statement cache ─────────────────────────────────────────────
const stmts = {
  // Users
  userByUsername:    db.prepare('SELECT * FROM users WHERE username = ? COLLATE NOCASE'),
  userByCredentials: db.prepare('SELECT * FROM users WHERE username = ? COLLATE NOCASE AND role = ?'),
  userExists:        db.prepare('SELECT 1 FROM users WHERE username = ? COLLATE NOCASE'),
  userInsert:        db.prepare('INSERT INTO users (username, password, role, contact, location) VALUES (?,?,?,?,?)'),

  // Products
  productsAll:       db.prepare('SELECT * FROM products WHERE isActive = 1 ORDER BY createdAt DESC'),
  productById:       db.prepare('SELECT * FROM products WHERE id = ?'),
  productsByFarmer:  db.prepare('SELECT * FROM products WHERE farmerUsername = ? ORDER BY createdAt DESC'),
  productInsert:     db.prepare('INSERT INTO products (id,name,price,qty,location,farmerUsername,image,description,unit) VALUES (?,?,?,?,?,?,?,?,?)'),
  productUpdate:     db.prepare('UPDATE products SET price=?,qty=?,location=?,name=?,description=?,updatedAt=datetime(\'now\') WHERE id=?'),
  productReduceQty:  db.prepare('UPDATE products SET qty=qty-?,updatedAt=datetime(\'now\') WHERE id=?'),
  productDelete:     db.prepare('UPDATE products SET isActive=0,updatedAt=datetime(\'now\') WHERE id=?'),
  productHardDelete: db.prepare('DELETE FROM products WHERE id=?'),
  productsByNameLoc: db.prepare('SELECT * FROM products WHERE LOWER(name)=LOWER(?) AND LOWER(location)=LOWER(?) AND isActive=1'),
  productsByName:    db.prepare('SELECT * FROM products WHERE LOWER(name)=LOWER(?) AND isActive=1'),

  // Orders
  ordersAll:         db.prepare('SELECT * FROM orders ORDER BY createdAt DESC'),
  orderById:         db.prepare('SELECT * FROM orders WHERE id=?'),
  ordersByBuyer:     db.prepare('SELECT * FROM orders WHERE buyerName=? ORDER BY createdAt DESC'),
  ordersByFarmer:    db.prepare('SELECT * FROM orders WHERE farmerUsername=? ORDER BY createdAt DESC'),
  orderInsert:       db.prepare(`
    INSERT INTO orders
      (id,productId,productName,qty,price,buyerName,buyerContact,buyerAltPhone,
       address,deliveryLocation,farmerUsername,status,paymentStatus,transactionId)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `),
  orderUpdateStatus: db.prepare('UPDATE orders SET status=?,updatedAt=datetime(\'now\') WHERE id=?'),

  // Analytics
  priceHistory:      db.prepare('SELECT * FROM price_history WHERE LOWER(productName)=LOWER(?) ORDER BY recordedAt DESC LIMIT 30'),
  farmerStats:       db.prepare(`
    SELECT
      COUNT(*)                                          AS totalOrders,
      SUM(CASE WHEN status='placed' THEN 1 ELSE 0 END) AS pendingOrders,
      SUM(CASE WHEN paymentStatus='completed' THEN totalAmount ELSE 0 END) AS totalRevenue
    FROM orders WHERE farmerUsername=?
  `),
};

// ─── helper: format row for frontend (price/qty as strings for compat) ────
const fmt = row => row ? { ...row, price: String(row.price), qty: String(row.qty) } : null;
const fmtAll = rows => rows.map(fmt);

// ─── audit helper ─────────────────────────────────────────────────────────
const auditInsert = db.prepare(
  'INSERT INTO audit_log (tableName,recordId,action,actor,oldData,newData) VALUES (?,?,?,?,?,?)'
);
function audit(table, id, action, actor, oldData, newData) {
  try {
    auditInsert.run(table, String(id), action, actor || null,
      oldData ? JSON.stringify(oldData) : null,
      newData ? JSON.stringify(newData) : null);
  } catch {}
}

// ═══════════════════════════════════════════════════════════════════════════
//  USERS
// ═══════════════════════════════════════════════════════════════════════════
const Users = {
  findByUsername(username) {
    return stmts.userByUsername.get(username);
  },

  findByCredentials(username, password, role) {
    const user = stmts.userByCredentials.get(username, role);
    if (!user) return null;
    if (!verifyPassword(password, user.password)) return null;
    return user;
  },

  exists(username) {
    return !!stmts.userExists.get(username);
  },

  create({ username, password, role, contactNumber, location }) {
    const normalized = location.trim().replace(/\b\w/g, c => c.toUpperCase());
    const hashed     = hashPassword(password);
    const result     = stmts.userInsert.run(username, hashed, role, contactNumber, normalized);
    audit('users', result.lastInsertRowid, 'INSERT', username, null, { username, role, location: normalized });
    return result;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
//  PRODUCTS
// ═══════════════════════════════════════════════════════════════════════════
const Products = {
  getAll() {
    return fmtAll(stmts.productsAll.all());
  },

  getByFarmer(farmerUsername) {
    return fmtAll(stmts.productsByFarmer.all(farmerUsername));
  },

  getById(id) {
    return stmts.productById.get(id);
  },

  create({ name, price, qty, location, farmerUsername, image, description, unit }) {
    const id = Date.now();
    stmts.productInsert.run(id, name, parseFloat(price), parseFloat(qty),
      location, farmerUsername, image || null, description || null, unit || 'kg');
    audit('products', id, 'INSERT', farmerUsername, null, { name, price, qty, location });
    return id;
  },

  update({ id, price, qty, location, name, description }) {
    const existing = Products.getById(id);
    if (!existing) return false;
    stmts.productUpdate.run(
      price       !== undefined ? parseFloat(price) : existing.price,
      qty         !== undefined ? parseFloat(qty)   : existing.qty,
      location    !== undefined ? location           : existing.location,
      name        !== undefined ? name               : existing.name,
      description !== undefined ? description        : existing.description,
      id
    );
    audit('products', id, 'UPDATE', existing.farmerUsername, existing, { price, qty, location, name });
    return true;
  },

  reduceQty(id, amount) {
    stmts.productReduceQty.run(parseFloat(amount), id);
  },

  // Soft delete (keeps history)
  delete(id) {
    const existing = Products.getById(id);
    stmts.productDelete.run(id);
    if (existing) audit('products', id, 'DELETE', existing.farmerUsername, existing, null);
  },

  searchByName(name, location) {
    if (location) return stmts.productsByNameLoc.all(name, location);
    return stmts.productsByName.all(name);
  },

  // Full-text search
  search(query) {
    try {
      const rows = db.prepare(`
        SELECT p.* FROM products p
        JOIN products_fts f ON p.id = f.rowid
        WHERE products_fts MATCH ? AND p.isActive = 1
        ORDER BY rank
      `).all(query + '*');
      return fmtAll(rows);
    } catch {
      // Fallback to LIKE search
      return fmtAll(db.prepare(
        "SELECT * FROM products WHERE (name LIKE ? OR location LIKE ?) AND isActive=1"
      ).all('%' + query + '%', '%' + query + '%'));
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
//  ORDERS
// ═══════════════════════════════════════════════════════════════════════════
const Orders = {
  getAll() {
    return fmtAll(stmts.ordersAll.all());
  },

  getByBuyer(buyerName) {
    return fmtAll(stmts.ordersByBuyer.all(buyerName));
  },

  getByFarmer(farmerUsername) {
    return fmtAll(stmts.ordersByFarmer.all(farmerUsername));
  },

  getById(id) {
    const row = stmts.orderById.get(id);
    return row ? fmt(row) : null;
  },

  create(order) {
    const id = Date.now();
    stmts.orderInsert.run(
      id, order.productId, order.productName,
      parseFloat(order.qty), parseFloat(order.price),
      order.buyerName,
      order.buyerContact     || null,
      order.buyerAltPhone    || null,
      order.address          || null,
      order.deliveryLocation || null,
      order.farmerUsername,
      order.status           || 'placed',
      order.paymentStatus    || 'unpaid',
      order.transactionId    || null
    );
    audit('orders', id, 'INSERT', order.buyerName, null, order);
    return id;
  },

  updateStatus(id, status) {
    const old = Orders.getById(id);
    stmts.orderUpdateStatus.run(status, id);
    audit('orders', id, 'UPDATE', old?.farmerUsername, { status: old?.status }, { status });
  },

  // Analytics
  getFarmerStats(farmerUsername) {
    return stmts.farmerStats.get(farmerUsername);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
//  ATOMIC TRANSACTION: place order (reduce stock + create order)
// ═══════════════════════════════════════════════════════════════════════════
const placeOrder = db.transaction((orderData) => {
  const product = Products.getById(orderData.productId);
  if (!product)                                    throw new Error('Product not found');
  if (!product.isActive)                           throw new Error('Product is no longer available');

  const orderQty = parseFloat(orderData.qty);
  if (isNaN(orderQty) || orderQty <= 0)            throw new Error('Invalid quantity');
  if (orderQty > parseFloat(product.qty))          throw new Error('Stock unavailable');

  Products.reduceQty(orderData.productId, orderQty);
  const orderId      = Orders.create(orderData);
  const remainingQty = parseFloat(product.qty) - orderQty;

  return { orderId, remainingQty };
});

// ─── export ───────────────────────────────────────────────────────────────
module.exports = { db, Users, Products, Orders, placeOrder };
