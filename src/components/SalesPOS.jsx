import React, { useState, useEffect } from 'react';
import API from '../api';

export default function SalesPOS({ onCompleteSale, showToast }) {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Selection & Cart
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);
  const [cart, setCart] = useState([]);

  // Discount & Payment
  const [discountType, setDiscountType] = useState('fixed'); // 'fixed' or 'percentage'
  const [discountValue, setDiscountValue] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Search in POS
  const [itemSearch, setItemSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Microcontrollers', 'Sensors', 'Integrated Circuits', 'Power & Battery', 'Passive Components'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prodRes, custRes] = await Promise.all([
        API.get('/api/products?status=active'),
        API.get('/api/customers?status=active')
      ]);
      setProducts(prodRes.products || []);
      setCustomers(custRes.customers || []);
      if (prodRes.products?.length > 0) {
        setSelectedProductId(String(prodRes.products[0].id));
      }
    } catch (err) {
      showToast('Error loading POS catalog: ' + err.message, true);
    }
  };

  const handleAddToCart = () => {
    const prod = products.find(p => p.id === parseInt(selectedProductId, 10));
    if (!prod) {
      showToast('Please select a component first', true);
      return;
    }

    const qty = parseInt(selectedQty, 10) || 1;
    if (qty <= 0) {
      showToast('Quantity must be greater than zero', true);
      return;
    }

    if (prod.stock_quantity < qty) {
      showToast(`Insufficient stock for "${prod.name}". Available: ${prod.stock_quantity}`, true);
      return;
    }

    const existingIndex = cart.findIndex(item => item.product_id === prod.id);
    if (existingIndex >= 0) {
      const existing = cart[existingIndex];
      const newTotalQty = existing.quantity + qty;
      if (prod.stock_quantity < newTotalQty) {
        showToast(`Cannot add ${qty} more. Total requested (${newTotalQty}) exceeds stock (${prod.stock_quantity})`, true);
        return;
      }
      const updated = [...cart];
      updated[existingIndex].quantity = newTotalQty;
      updated[existingIndex].line_total = newTotalQty * (prod.selling_price || prod.unit_price);
      setCart(updated);
    } else {
      const price = prod.selling_price || prod.unit_price;
      setCart([
        ...cart,
        {
          product_id: prod.id,
          name: prod.name,
          sku: prod.sku,
          unit_price: price,
          quantity: qty,
          stock_quantity: prod.stock_quantity,
          line_total: qty * price
        }
      ]);
    }

    showToast(`Added ${qty}× "${prod.name}" to cart`);
    setSelectedQty(1);
  };

  const handleUpdateCartQty = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    const updated = cart.map(item => {
      if (item.product_id === productId) {
        if (newQty > item.stock_quantity) {
          showToast(`Max available stock for "${item.name}" is ${item.stock_quantity}`, true);
          return item;
        }
        return {
          ...item,
          quantity: newQty,
          line_total: newQty * item.unit_price
        };
      }
      return item;
    });
    setCart(updated);
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  // Calculations: Subtotal - Discount = Final Total (Strictly No Tax)
  const subtotal = cart.reduce((acc, item) => acc + item.line_total, 0);
  
  let discountAmount = 0;
  if (discountType === 'percentage') {
    discountAmount = Math.round((subtotal * (parseFloat(discountValue) || 0)) / 100);
  } else {
    discountAmount = Math.min(subtotal, parseFloat(discountValue) || 0);
  }
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const tendered = parseFloat(amountPaid) || 0;
  const changeAmount = tendered >= finalTotal ? tendered - finalTotal : 0;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      showToast('Your cart is empty', true);
      return;
    }

    if (paymentMethod === 'cash' && tendered < finalTotal) {
      showToast(`Amount tendered (Rs ${tendered}) is less than total (Rs ${finalTotal})`, true);
      return;
    }

    setIsProcessing(true);
    try {
      const payload = {
        customer_id: selectedCustomer ? selectedCustomer.id : null,
        customer_name: selectedCustomer ? selectedCustomer.name : 'Walk-in Customer',
        items: cart.map(it => ({
          product_id: it.product_id,
          quantity: it.quantity,
          unit_price: it.unit_price
        })),
        discount_type: discountType,
        discount_rate: parseFloat(discountValue) || 0,
        payment_method: paymentMethod,
        amount_paid: tendered > 0 ? tendered : finalTotal
      };

      const res = await API.post('/api/sales', payload);
      showToast(`Sale completed! Invoice #${res.sale.invoice_number}`);

      // Clear cart
      setCart([]);
      setDiscountValue(0);
      setAmountPaid('');

      // Trigger invoice receipt modal
      if (onCompleteSale && res.sale) {
        onCompleteSale(res.sale.id);
      }

      // Refresh product stock
      loadData();
    } catch (err) {
      showToast('Checkout failed: ' + err.message, true);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = activeCategory === 'All' || p.category === activeCategory;
    const term = itemSearch.trim().toLowerCase();
    const matchesSearch = !term || p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="content">
      <div className="sales-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
        
        {/* Left Column: Catalog & Item Selection */}
        <div>
          {/* Customer Selection Card */}
          <div className="panel" style={{ marginBottom: 18, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Customer Profile</span>
              {selectedCustomer && (
                <button
                  className="btn-ghost"
                  onClick={() => setSelectedCustomer(null)}
                  style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                >
                  Clear (Walk-in)
                </button>
              )}
            </div>
            <select
              value={selectedCustomer ? selectedCustomer.id : ''}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) {
                  setSelectedCustomer(null);
                } else {
                  const c = customers.find(item => item.id === parseInt(val, 10));
                  setSelectedCustomer(c || null);
                }
              }}
              style={{ width: '100%', padding: '8px 12px' }}
            >
              <option value="">Walk-in Customer (Standard Retail)</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.company ? `(${c.company})` : ''} · {c.phone || c.email || 'Registered'}
                </option>
              ))}
            </select>
          </div>

          {/* Component Selection Bar */}
          <div className="panel" style={{ marginBottom: 18, padding: 18 }}>
            <h3 style={{ margin: '0 0 12px' }}>Select Component to Add</h3>
            
            <div className="field">
              <label>Choose Component from Catalog</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                style={{ width: '100%', padding: 10, fontSize: '0.9rem' }}
              >
                {products.map(p => (
                  <option key={p.id} value={p.id} disabled={p.stock_quantity <= 0}>
                    {p.name} · {p.sku} — Rs {(p.selling_price || p.unit_price).toLocaleString()} ({p.stock_quantity <= 0 ? 'OUT OF STOCK' : `${p.stock_quantity} in stock`})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginTop: 12 }}>
              <div className="field" style={{ width: 140, marginBottom: 0 }}>
                <label>Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={selectedQty}
                  onChange={(e) => setSelectedQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  style={{ width: '100%', textAlign: 'center', padding: '9px 4px', fontWeight: 700 }}
                />
              </div>

              <button
                type="button"
                className="btn-primary"
                onClick={handleAddToCart}
                style={{ flex: 1, padding: 10, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                  <circle cx="9" cy="20" r="1.4"/>
                  <circle cx="17" cy="20" r="1.4"/>
                  <path d="M2 3h2l2.4 12.4a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L20 7H5.2"/>
                </svg>
                Add to Cart
              </button>
            </div>
          </div>

          {/* Catalog Quick Browse */}
          <div className="panel" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>Quick Catalog Browse</h3>
              <input
                type="text"
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                placeholder="Filter catalog..."
                style={{ width: 180, padding: '5px 10px', fontSize: '0.8rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {categories.map(c => (
                <button
                  key={c}
                  className={`filter-chip ${activeCategory === c ? 'active' : ''}`}
                  onClick={() => setActiveCategory(c)}
                  style={{ fontSize: '0.74rem' }}
                >
                  {c}
                </button>
              ))}
            </div>

            <div style={{ maxHeight: 280, overflowY: 'auto' }}>
              {filteredProducts.slice(0, 20).map(p => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedProductId(String(p.id));
                    showToast(`Selected "${p.name}". Set quantity & click Add to Cart.`);
                  }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderBottom: '1px solid var(--panel-line)',
                    cursor: 'pointer',
                    background: selectedProductId === String(p.id) ? 'var(--table-row-hover)' : 'transparent'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{p.name}</div>
                    <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--copper)' }}>
                      {p.sku} · {p.stock_quantity} available
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                    Rs {(p.selling_price || p.unit_price).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Cart & Financial Totals */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="panel-head" style={{ paddingBottom: 12, borderBottom: '1px solid var(--panel-line)' }}>
            <h3>Current POS Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</h3>
            <p>Customer: <strong>{selectedCustomer ? selectedCustomer.name : 'Walk-in'}</strong></p>
          </div>

          {/* Cart Items List */}
          <div style={{ flex: 1, minHeight: 180, maxHeight: 320, overflowY: 'auto', margin: '12px 0' }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--ink-soft)' }}>
                Cart is currently empty.<br/>Select components from catalog to begin sale.
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product_id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: '1px solid var(--panel-line)'
                  }}
                >
                  <div style={{ flex: 1, paddingRight: 10 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.84rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--ink-soft)' }}>
                      Rs {item.unit_price.toLocaleString()} each
                    </div>
                  </div>

                  {/* Quantity adjustments: both buttons and direct number input */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginRight: 12 }}>
                    <button
                      className="icon-btn"
                      style={{ width: 26, height: 26 }}
                      onClick={() => handleUpdateCartQty(item.product_id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleUpdateCartQty(item.product_id, parseInt(e.target.value, 10) || 1)}
                      style={{
                        width: 44,
                        textAlign: 'center',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.82rem',
                        padding: '3px 0'
                      }}
                    />
                    <button
                      className="icon-btn"
                      style={{ width: 26, height: 26 }}
                      onClick={() => handleUpdateCartQty(item.product_id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <div className="mono" style={{ width: 80, textAlign: 'right', fontWeight: 600 }}>
                    Rs {item.line_total.toLocaleString()}
                  </div>

                  <button
                    className="icon-btn danger"
                    onClick={() => handleRemoveFromCart(item.product_id)}
                    style={{ marginLeft: 8, width: 24, height: 24 }}
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Financial Calculation Box */}
          <div style={{ background: 'var(--bg)', borderRadius: 8, padding: 16, marginTop: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.85rem' }}>
              <span>Subtotal:</span>
              <span className="mono">Rs {subtotal.toLocaleString()}</span>
            </div>

            {/* Discount Inputs */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: '0.82rem' }}>Discount:</span>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                style={{ padding: '3px 6px', fontSize: '0.78rem' }}
              >
                <option value="fixed">Fixed (Rs)</option>
                <option value="percentage">Percentage (%)</option>
              </select>
              <input
                type="number"
                min="0"
                value={discountValue}
                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                style={{ width: 70, padding: '3px 6px', textAlign: 'center', fontSize: '0.82rem' }}
              />
              <span className="mono" style={{ marginLeft: 'auto', color: 'var(--copper)' }}>
                - Rs {discountAmount.toLocaleString()}
              </span>
            </div>

            {/* Total */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: 10,
                borderTop: '2px solid var(--panel-line)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--copper)'
              }}
            >
              <span>Total Payable:</span>
              <span className="mono">Rs {finalTotal.toLocaleString()}</span>
            </div>

            {/* Payment Method & Tendered */}
            <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ width: '100%', marginTop: 4, padding: 6 }}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>
                  Amount Tendered (Rs)
                </label>
                <input
                  type="number"
                  placeholder={String(finalTotal)}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  style={{ width: '100%', marginTop: 4, padding: 6, fontWeight: 700 }}
                />
              </div>
            </div>

            {tendered > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: '0.85rem' }}>
                <span>Change Returned:</span>
                <span className="mono" style={{ fontWeight: 700, color: 'var(--trace)' }}>
                  Rs {changeAmount.toLocaleString()}
                </span>
              </div>
            )}

            <button
              className="btn-primary"
              onClick={handleCheckout}
              disabled={isProcessing || cart.length === 0}
              style={{ width: '100%', marginTop: 16, padding: '12px 16px', fontSize: '1rem', fontWeight: 700 }}
            >
              {isProcessing ? 'Processing Transaction...' : 'Complete Sale &amp; Print Invoice'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
