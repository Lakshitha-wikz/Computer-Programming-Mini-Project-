const bcrypt = require('bcryptjs');
const { query, queryOne, run, transaction } = require('./db');
const { categories, users, customers, settings, products } = require('./seed-data');

function seedDatabase(force = false) {
  console.log('--- Initializing / Seeding CompStock Database ---');

  if (force) {
    console.log('Force reset requested. Clearing existing tables...');
    try { run('DELETE FROM return_items'); } catch (e) {}
    try { run('DELETE FROM returns'); } catch (e) {}
    try { run('DELETE FROM sale_items'); } catch (e) {}
    try { run('DELETE FROM sales'); } catch (e) {}
    try { run('DELETE FROM stock_movements'); } catch (e) {}
    try { run('DELETE FROM products'); } catch (e) {}
    try { run('DELETE FROM customers'); } catch (e) {}
    try { run('DELETE FROM categories'); } catch (e) {}
    try { run('DELETE FROM users'); } catch (e) {}
    try { run('DELETE FROM audit_logs'); } catch (e) {}
    try { run('DELETE FROM settings'); } catch (e) {}
  }

  // 1. Settings
  for (const s of settings) {
    const existing = queryOne('SELECT key FROM settings WHERE key = ?', [s.key]);
    if (!existing) {
      run('INSERT INTO settings (key, value) VALUES (?, ?)', [s.key, s.value]);
    }
  }

  // 2. Categories (21 categories)
  for (const cat of categories) {
    const existing = queryOne('SELECT id FROM categories WHERE name = ?', [cat]);
    if (!existing) {
      run('INSERT INTO categories (name) VALUES (?)', [cat]);
    }
  }

  // 3. Users
  for (const u of users) {
    const existing = queryOne('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [u.email]);
    if (!existing) {
      const hash = bcrypt.hashSync(u.pass, 10);
      run('INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)',
        [u.name, u.email, hash, u.role, u.status]);
    }
  }

  const adminUser = queryOne("SELECT id, name FROM users WHERE role = 'admin' LIMIT 1");
  const adminId = adminUser ? adminUser.id : 1;
  const adminName = adminUser ? adminUser.name : 'Admin User';

  // 4. Customers (12 customers)
  for (const c of customers) {
    const existing = queryOne('SELECT id FROM customers WHERE name = ?', [c.name]);
    if (!existing) {
      run('INSERT INTO customers (name, phone, email, address, status) VALUES (?, ?, ?, ?, ?)',
        [c.name, c.phone, c.email, c.address, c.status]);
    }
  }

  // 5. Products (110+ realistic components)
  console.log(`Seeding ${products.length} electronic component products...`);
  for (const p of products) {
    const existing = queryOne('SELECT id FROM products WHERE sku = ?', [p.sku]);
    if (!existing) {
      const res = run(
        `INSERT INTO products 
         (name, sku, barcode, category, description, selling_price, cost_price, stock_quantity, low_stock_threshold, icon, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.name, p.sku, p.barcode, p.cat, p.desc || '', p.price, p.cost, p.stock, p.threshold, p.icon, 'active']
      );
      const newProdId = res.lastInsertRowid;

      // Initial stock movement
      if (p.stock > 0) {
        run(
          `INSERT INTO stock_movements 
           (product_id, previous_quantity, quantity_change, new_quantity, reason, reference_id, user_id) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [newProdId, 0, p.stock, p.stock, 'initial_stock', 'INVENTORY_INIT', adminId]
        );
      }
    }
  }

  // 6. Realistic Historical Sales Across Multiple Dates
  const salesCount = queryOne('SELECT COUNT(*) as count FROM sales');
  if (salesCount.count === 0) {
    console.log('Seeding realistic multi-day historical sales and invoices...');

    function formatSqlDate(d) {
      const pad = n => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }

    const customerList = query('SELECT id, name FROM customers');
    const getCust = (name) => customerList.find(c => c.name.includes(name)) || { id: null, name: 'Walk-in' };

    // Diverse sample sales across the last 28 days
    const historicalSales = [
      {
        inv: 'S-1001', cust: getCust('N. Perera'), daysAgo: 26, hoursAgo: 2, method: 'cash',
        items: [
          { sku: 'MCU-ATM328-DIP', qty: 2, price: 650, cost: 420 },
          { sku: 'RES-10K-100PK', qty: 1, price: 350, cost: 160 },
          { sku: 'CAP-104-50PK', qty: 1, price: 250, cost: 110 }
        ]
      },
      {
        inv: 'S-1002', cust: getCust('Galle Robotics'), daysAgo: 24, hoursAgo: 5, method: 'bank_transfer',
        items: [
          { sku: 'DEV-UNO-R3', qty: 4, price: 2450, cost: 1650 },
          { sku: 'MOT-SG90', qty: 8, price: 420, cost: 240 },
          { sku: 'SEN-HCSR04', qty: 4, price: 340, cost: 195 },
          { sku: 'PROT-BB-830', qty: 4, price: 450, cost: 260 }
        ]
      },
      {
        inv: 'S-1003', cust: getCust('Walk-in'), daysAgo: 22, hoursAgo: 3, method: 'cash',
        items: [
          { sku: 'DIO-1N4007-25', qty: 2, price: 150, cost: 60 },
          { sku: 'LED-5MM-RED', qty: 2, price: 125, cost: 50 },
          { sku: 'REG-LM7805', qty: 3, price: 110, cost: 55 }
        ]
      },
      {
        inv: 'S-1004', cust: getCust('Kandy Electro'), daysAgo: 20, hoursAgo: 6, method: 'card',
        items: [
          { sku: 'MCU-ESP32-WR', qty: 5, price: 890, cost: 620 },
          { sku: 'MOD-RELAY-2CH', qty: 4, price: 380, cost: 220 },
          { sku: 'SEN-DHT22', qty: 3, price: 1150, cost: 780 }
        ]
      },
      {
        inv: 'S-1005', cust: getCust('R. Silva'), daysAgo: 18, hoursAgo: 1, method: 'cash',
        items: [
          { sku: 'DEV-NODEMCU-V3', qty: 1, price: 980, cost: 680 },
          { sku: 'SEN-BMP280', qty: 1, price: 420, cost: 260 },
          { sku: 'CAB-MF-20CM', qty: 1, price: 250, cost: 110 }
        ]
      },
      {
        inv: 'S-1006', cust: getCust('Ceylon Tech Labs'), daysAgo: 16, hoursAgo: 4, method: 'online',
        items: [
          { sku: 'DEV-MEGA-2560', qty: 2, price: 4200, cost: 3100 },
          { sku: 'DISP-LCD20X4-I2C', qty: 2, price: 1850, cost: 1250 },
          { sku: 'DRV-L298N', qty: 3, price: 680, cost: 420 }
        ]
      },
      {
        inv: 'S-1007', cust: getCust('Apex Automation'), daysAgo: 14, hoursAgo: 2, method: 'bank_transfer',
        items: [
          { sku: 'REL-SSR-25DA', qty: 4, price: 1450, cost: 980 },
          { sku: 'REG-LM2596-BUCK', qty: 5, price: 450, cost: 260 },
          { sku: 'SEN-PIR-SR501', qty: 5, price: 420, cost: 260 }
        ]
      },
      {
        inv: 'S-1008', cust: getCust('Walk-in'), daysAgo: 12, hoursAgo: 7, method: 'cash',
        items: [
          { sku: 'IC-NE555P', qty: 4, price: 75, cost: 35 },
          { sku: 'CAP-10UF-50V', qty: 1, price: 180, cost: 80 },
          { sku: 'RES-POT-10K', qty: 2, price: 90, cost: 45 }
        ]
      },
      {
        inv: 'S-1009', cust: getCust('Moratuwa IoT'), daysAgo: 10, hoursAgo: 3, method: 'card',
        items: [
          { sku: 'MCU-PICO-W', qty: 3, price: 1950, cost: 1450 },
          { sku: 'DISP-OLED-096B', qty: 3, price: 920, cost: 600 },
          { sku: 'SEN-BME280', qty: 3, price: 1100, cost: 750 }
        ]
      },
      {
        inv: 'S-1010', cust: getCust('D. Gunawardena'), daysAgo: 8, hoursAgo: 5, method: 'cash',
        items: [
          { sku: 'DEV-ESP32-30P', qty: 2, price: 1650, cost: 1180 },
          { sku: 'MOD-TP4056-TC', qty: 4, price: 160, cost: 85 },
          { sku: 'PWR-BATT-18650', qty: 2, price: 850, cost: 550 }
        ]
      },
      {
        inv: 'S-1011', cust: getCust('Smart Agro Sensors'), daysAgo: 6, hoursAgo: 2, method: 'bank_transfer',
        items: [
          { sku: 'MCU-ESP32-WR', qty: 6, price: 890, cost: 620 },
          { sku: 'SEN-SOIL-CAP', qty: 6, price: 380, cost: 220 },
          { sku: 'SEN-DS18B20-WP', qty: 4, price: 590, cost: 360 }
        ]
      },
      {
        inv: 'S-1012', cust: getCust('Walk-in'), daysAgo: 4, hoursAgo: 6, method: 'cash',
        items: [
          { sku: 'ACC-SOLDER-50G', qty: 1, price: 950, cost: 620 },
          { sku: 'ACC-WICK-2MM', qty: 1, price: 240, cost: 110 },
          { sku: 'PROT-BB-400', qty: 1, price: 280, cost: 150 }
        ]
      },
      {
        inv: 'S-1013', cust: getCust('K. Jayasuriya'), daysAgo: 3, hoursAgo: 4, method: 'card',
        items: [
          { sku: 'DEV-UNO-R3', qty: 1, price: 2450, cost: 1650 },
          { sku: 'SEN-HCSR04', qty: 2, price: 340, cost: 195 },
          { sku: 'DISP-LCD16X2-I2C', qty: 1, price: 980, cost: 650 },
          { sku: 'CAB-MM-20CM', qty: 1, price: 250, cost: 110 }
        ]
      },
      {
        inv: 'S-1014', cust: getCust('Ceylon Tech Labs'), daysAgo: 2, hoursAgo: 3, method: 'online',
        items: [
          { sku: 'DEV-ESP32-CAM', qty: 4, price: 2150, cost: 1550 },
          { sku: 'MOD-MICROSD-SPI', qty: 4, price: 260, cost: 140 },
          { sku: 'PWR-ADAPT-5V2A', qty: 4, price: 950, cost: 580 }
        ]
      },
      {
        inv: 'S-1015', cust: getCust('Walk-in'), daysAgo: 1, hoursAgo: 4, method: 'cash',
        items: [
          { sku: 'MCU-ATM328-DIP', qty: 3, price: 650, cost: 420 },
          { sku: 'ACC-SKT-DIP28', qty: 1, price: 200, cost: 85 },
          { sku: 'REG-LM7805', qty: 2, price: 110, cost: 55 }
        ]
      },
      {
        inv: 'S-1016', cust: getCust('Galle Robotics'), daysAgo: 1, hoursAgo: 2, method: 'card',
        items: [
          { sku: 'MOT-MG996R', qty: 4, price: 1650, cost: 1100 },
          { sku: 'DRV-TB6600', qty: 2, price: 2200, cost: 1550 }
        ]
      },
      {
        inv: 'S-1017', cust: getCust('N. Perera'), daysAgo: 0, hoursAgo: 3, method: 'cash',
        items: [
          { sku: 'MCU-ESP32-WR', qty: 2, price: 890, cost: 620 },
          { sku: 'SEN-DHT22', qty: 1, price: 1150, cost: 780 },
          { sku: 'PROT-BB-830', qty: 1, price: 450, cost: 260 }
        ]
      },
      {
        inv: 'S-1018', cust: getCust('MicroVolt Engineering'), daysAgo: 0, hoursAgo: 1, method: 'online',
        items: [
          { sku: 'DEV-UNO-R3', qty: 3, price: 2450, cost: 1650 },
          { sku: 'MOD-RELAY-4CH', qty: 2, price: 680, cost: 420 },
          { sku: 'PWR-ADAPT-12V2A', qty: 2, price: 1150, cost: 750 }
        ]
      }
    ];

    for (const s of historicalSales) {
      const saleDate = new Date();
      saleDate.setDate(saleDate.getDate() - s.daysAgo);
      saleDate.setHours(saleDate.getHours() - s.hoursAgo);
      const dateStr = formatSqlDate(saleDate);

      let subtotal = 0;
      for (const it of s.items) {
        subtotal += it.qty * it.price;
      }
      const total = subtotal;

      const saleRes = run(
        `INSERT INTO sales 
         (invoice_number, customer_id, customer_name, subtotal, discount, discount_type, discount_rate, tax, total, amount_paid, change_amount, payment_status, payment_method, created_by, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [s.inv, s.cust.id, s.cust.name, subtotal, 0, 'fixed', 0, 0, total, total, 0, 'paid', s.method, adminId, dateStr]
      );
      const saleId = saleRes.lastInsertRowid;

      for (const it of s.items) {
        const prod = queryOne('SELECT id, name FROM products WHERE sku = ?', [it.sku]);
        if (prod) {
          const lineTotal = it.qty * it.price;
          run(
            `INSERT INTO sale_items 
             (sale_id, product_id, product_name, sku, quantity, unit_price, unit_cost, line_total) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [saleId, prod.id, prod.name, it.sku, it.qty, it.price, it.cost || 0, lineTotal]
          );

          // Record stock movement for historical sale
          run(
            `INSERT INTO stock_movements 
             (product_id, previous_quantity, quantity_change, new_quantity, reason, reference_id, user_id, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [prod.id, 50, -it.qty, 50 - it.qty, 'sale', s.inv, adminId, dateStr]
          );
        }
      }
    }
  }

  // 7. Seed Initial Sample Return
  const returnsCount = queryOne('SELECT COUNT(*) as count FROM returns');
  if (returnsCount.count === 0) {
    const targetSale = queryOne("SELECT * FROM sales WHERE invoice_number = 'S-1015'");
    if (targetSale) {
      const saleItem = queryOne('SELECT * FROM sale_items WHERE sale_id = ? LIMIT 1', [targetSale.id]);
      if (saleItem) {
        const retRes = run(
          `INSERT INTO returns (return_number, sale_id, invoice_number, total_refund, reason, created_by) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          ['RET-1001', targetSale.id, targetSale.invoice_number, saleItem.unit_price, 'Customer ordered wrong component package', adminId]
        );
        const returnId = retRes.lastInsertRowid;

        run(
          `INSERT INTO return_items (return_id, sale_item_id, product_id, product_name, sku, quantity, unit_price, line_refund) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [returnId, saleItem.id, saleItem.product_id, saleItem.product_name, saleItem.sku, 1, saleItem.unit_price, saleItem.unit_price]
        );

        run("UPDATE sales SET return_status = 'partial' WHERE id = ?", [targetSale.id]);
        run("UPDATE sale_items SET returned_quantity = 1 WHERE id = ?", [saleItem.id]);
      }
    }
  }

  // 8. Seed Initial Audit Logs
  const auditCount = queryOne('SELECT COUNT(*) as count FROM audit_logs');
  if (auditCount.count === 0) {
    const logs = [
      { action: 'SYSTEM_BOOT', desc: 'CompStock server initialized with 110+ electronic components', rel: 'SYSTEM' },
      { action: 'LOGIN', desc: 'Administrator logged into system', rel: 'AUTH' },
      { action: 'CREATE_PRODUCT', desc: 'Added new component: Arduino UNO R3', rel: 'DEV-UNO-R3' },
      { action: 'STOCK_ADJUSTMENT', desc: 'Restock shipment received (+50 units ATmega328P)', rel: 'MCU-ATM328-DIP' },
      { action: 'CREATE_SALE', desc: 'Completed invoice S-1018 (Ceylon Tech Labs)', rel: 'S-1018' },
      { action: 'SALE_RETURN', desc: 'Processed customer return RET-1001 for S-1015', rel: 'RET-1001' }
    ];
    for (const l of logs) {
      run(
        'INSERT INTO audit_logs (user_id, user_name, action, description, related_id) VALUES (?, ?, ?, ?, ?)',
        [adminId, adminName, l.action, l.desc, l.rel]
      );
    }
  }

  console.log('--- CompStock Database Seeding Completed Successfully! ---');
  console.log(`Total Products: ${queryOne('SELECT COUNT(*) as c FROM products').c}`);
  console.log(`Total Categories: ${queryOne('SELECT COUNT(*) as c FROM categories').c}`);
  console.log(`Total Customers: ${queryOne('SELECT COUNT(*) as c FROM customers').c}`);
  console.log(`Total Sales: ${queryOne('SELECT COUNT(*) as c FROM sales').c}`);
  console.log('Default Credentials:');
  console.log('  Admin: admin@compstock.lk / Admin@12345 (or admin / admin123)');
  console.log('  Staff: staff@compstock.lk / Staff@12345 (or staff123)');
}

if (require.main === module) {
  const force = process.argv.includes('--force');
  seedDatabase(force);
}

module.exports = { seedDatabase };
