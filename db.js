require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const dbPath = path.resolve(process.env.DB_PATH || './data/compstock.db');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new DatabaseSync(dbPath);

// Enable foreign keys and WAL mode
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

// Ensure columns exist on legacy tables before applying indexes
function ensureColumn(table, column, definition) {
  try {
    const tableInfo = db.prepare(`PRAGMA table_info(${table})`).all();
    const exists = tableInfo.some(col => col.name === column);
    if (!exists && tableInfo.length > 0) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
    }
  } catch (e) {
    // Table may not exist yet, handled by schema.sql
  }
}

ensureColumn('customers', 'company', 'TEXT');
ensureColumn('customers', 'status', "TEXT NOT NULL DEFAULT 'active'");
ensureColumn('products', 'barcode', 'TEXT');
ensureColumn('products', 'description', 'TEXT');
ensureColumn('sales', 'customer_id', 'INTEGER REFERENCES customers(id)');
ensureColumn('sales', 'discount_type', "TEXT DEFAULT 'fixed'");
ensureColumn('sales', 'discount_rate', 'REAL DEFAULT 0');
ensureColumn('sales', 'amount_paid', 'REAL DEFAULT 0');
ensureColumn('sales', 'change_amount', 'REAL DEFAULT 0');
ensureColumn('sales', 'return_status', "TEXT DEFAULT 'none'");
ensureColumn('sale_items', 'unit_cost', 'REAL DEFAULT 0');
ensureColumn('sale_items', 'returned_quantity', 'INTEGER DEFAULT 0');

// Initialize schema
const schemaPath = path.join(__dirname, 'schema.sql');
if (fs.existsSync(schemaPath)) {
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSql);
}

function query(sql, params = []) {
  const stmt = db.prepare(sql);
  const rows = stmt.all(...params);
  // Convert null prototype objects to standard JS objects
  return rows.map(r => ({ ...r }));
}

function queryOne(sql, params = []) {
  const stmt = db.prepare(sql);
  const row = stmt.get(...params);
  return row ? { ...row } : null;
}

function run(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.run(...params);
}

function exec(sql) {
  return db.exec(sql);
}

function transaction(fn) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

module.exports = {
  db,
  dbPath,
  query,
  queryOne,
  run,
  exec,
  transaction
};
