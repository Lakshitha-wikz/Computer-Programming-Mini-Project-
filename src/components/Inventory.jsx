import React, { useState, useEffect } from 'react';
import API from '../api';

export default function Inventory({ currentUser, showToast }) {
  const isAdmin = currentUser && currentUser.role === 'admin';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showValuationModal, setShowValuationModal] = useState(false);
  const [valuationData, setValuationData] = useState(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formCategory, setFormCategory] = useState('Microcontrollers');
  const [formCostPrice, setFormCostPrice] = useState('');
  const [formSellingPrice, setFormSellingPrice] = useState('');
  const [formStock, setFormStock] = useState('10');
  const [formMinStock, setFormMinStock] = useState('5');
  const [formSaving, setFormSaving] = useState(false);

  const categories = [
    'all',
    'Microcontrollers',
    'Sensors',
    'Integrated Circuits',
    'Power & Battery',
    'Wireless & IoT',
    'Passive Components',
    'Displays',
    'Motors & Actuators'
  ];

  useEffect(() => {
    loadProducts();
  }, [search, selectedCategory, selectedStatus]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      let query = [];
      if (search) query.push(`search=${encodeURIComponent(search)}`);
      if (selectedCategory !== 'all') query.push(`category=${encodeURIComponent(selectedCategory)}`);
      if (selectedStatus !== 'all') query.push(`status=${encodeURIComponent(selectedStatus)}`);
      
      const res = await API.get(`/api/products?${query.join('&')}`);
      setProducts(res.products || []);
    } catch (err) {
      showToast('Failed to load products: ' + err.message, true);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSku('');
    setFormBarcode('');
    setFormCategory('Microcontrollers');
    setFormCostPrice('');
    setFormSellingPrice('');
    setFormStock('10');
    setFormMinStock('5');
    setShowProductModal(true);
  };

  const handleOpenEditModal = (p) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormSku(p.sku);
    setFormBarcode(p.barcode || '');
    setFormCategory(p.category || 'Microcontrollers');
    setFormCostPrice(p.cost_price || p.unit_cost || '');
    setFormSellingPrice(p.selling_price || p.unit_price || '');
    setFormStock(String(p.stock_quantity));
    setFormMinStock(String(p.min_stock_level || 5));
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formSku.trim() || !formSellingPrice) {
      showToast('Please fill all required fields', true);
      return;
    }

    setFormSaving(true);
    try {
      const payload = {
        name: formName.trim(),
        sku: formSku.trim(),
        barcode: formBarcode.trim() || null,
        category: formCategory,
        unit_cost: parseFloat(formCostPrice) || 0,
        unit_price: parseFloat(formSellingPrice) || 0,
        stock_quantity: parseInt(formStock, 10) || 0,
        min_stock_level: parseInt(formMinStock, 10) || 5
      };

      if (editingProduct) {
        await API.put(`/api/products/${editingProduct.id}`, payload);
        showToast(`Product "${payload.name}" updated successfully`);
      } else {
        await API.post('/api/products', payload);
        showToast(`Product "${payload.name}" created successfully`);
      }

      setShowProductModal(false);
      loadProducts();
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteProduct = async (p) => {
    if (!window.confirm(`Are you sure you want to deactivate product "${p.name}"?`)) return;
    try {
      await API.del(`/api/products/${p.id}`);
      showToast(`Product "${p.name}" removed from active catalog`);
      loadProducts();
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const handleQuickAdjust = async (p, delta) => {
    const newQty = Math.max(0, p.stock_quantity + delta);
    try {
      await API.put(`/api/products/${p.id}`, { stock_quantity: newQty });
      setProducts(products.map(item => item.id === p.id ? { ...item, stock_quantity: newQty } : item));
      showToast(`Stock updated for ${p.name}: ${newQty} units`);
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const handleOpenValuation = async () => {
    try {
      const data = await API.get('/api/reports/dashboard');
      if (data && data.inventory_valuation) {
        setValuationData(data.inventory_valuation);
        setShowValuationModal(true);
      }
    } catch (err) {
      showToast('Failed to load valuation: ' + err.message, true);
    }
  };

  return (
    <div className="content">
      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="table-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, SKU or barcode..."
            />
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary" onClick={handleOpenValuation} style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
            📊 Valuation
          </button>
          {isAdmin && (
            <button className="btn-add" onClick={handleOpenAddModal}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Product
            </button>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="panel" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Component &amp; SKU</th>
              <th>Category</th>
              {isAdmin && <th style={{ textAlign: 'right' }}>Cost Price</th>}
              <th style={{ textAlign: 'right' }}>Selling Price</th>
              <th style={{ textAlign: 'center' }}>Stock Level</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              {isAdmin && <th style={{ textAlign: 'center' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={isAdmin ? 7 : 5} style={{ textAlign: 'center', padding: 30, color: 'var(--ink-soft)' }}>
                  Loading component catalog...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 7 : 5} style={{ textAlign: 'center', padding: 30, color: 'var(--ink-soft)' }}>
                  No matching electronic components found.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const isOut = p.stock_quantity === 0;
                const isLow = p.stock_quantity <= p.min_stock_level && !isOut;
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="prod-cell">
                        <div className="prod-thumb">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <rect x="4" y="4" width="16" height="16" rx="2"/>
                            <rect x="9" y="9" width="6" height="6"/>
                            <line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/>
                            <line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/>
                            <line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/>
                            <line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/>
                          </svg>
                        </div>
                        <div>
                          <div className="prod-name">{p.name}</div>
                          <div className="prod-cat mono" style={{ color: 'var(--copper)' }}>
                            {p.sku} {p.barcode ? `· ${p.barcode}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{p.category}</td>
                    {isAdmin && (
                      <td className="mono right" style={{ color: 'var(--ink-soft)' }}>
                        Rs {(p.cost_price || p.unit_cost || 0).toLocaleString()}
                      </td>
                    )}
                    <td className="mono right" style={{ fontWeight: 600 }}>
                      Rs {(p.selling_price || p.unit_price || 0).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="stock-adj" style={{ justifyContent: 'center' }}>
                        {isAdmin && (
                          <button onClick={() => handleQuickAdjust(p, -1)} disabled={p.stock_quantity <= 0}>
                            -
                          </button>
                        )}
                        <span className="mono" style={{ minWidth: 32, display: 'inline-block', fontWeight: 600 }}>
                          {p.stock_quantity}
                        </span>
                        {isAdmin && (
                          <button onClick={() => handleQuickAdjust(p, 1)}>
                            +
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`pill ${isOut ? 'out' : isLow ? 'low' : 'ok'}`}>
                        {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td style={{ textAlign: 'center' }}>
                        <button className="icon-btn" onClick={() => handleOpenEditModal(p)} title="Edit Component">
                          ✎
                        </button>
                        <button className="icon-btn danger" onClick={() => handleDeleteProduct(p)} title="Deactivate">
                          ✕
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div className="modal-overlay show" style={{ display: 'flex' }}>
          <div className="modal" style={{ maxWidth: 520 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>{editingProduct ? 'Edit Component' : 'Add New Electronic Component'}</h3>
              <button className="btn-ghost" onClick={() => setShowProductModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="field">
                <label>Component Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. ESP32 DevKit V1 Wireless Module"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field">
                  <label>SKU Code *</label>
                  <input
                    type="text"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="MCU-ESP32-V1"
                    required
                  />
                </div>
                <div className="field">
                  <label>Barcode</label>
                  <input
                    type="text"
                    value={formBarcode}
                    onChange={(e) => setFormBarcode(e.target.value)}
                    placeholder="890101500001"
                  />
                </div>
              </div>

              <div className="field">
                <label>Category *</label>
                <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
                  {categories.filter(c => c !== 'all').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field">
                  <label>Cost Price (Rs)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formCostPrice}
                    onChange={(e) => setFormCostPrice(e.target.value)}
                    placeholder="1200"
                  />
                </div>
                <div className="field">
                  <label>Selling Price (Rs) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formSellingPrice}
                    onChange={(e) => setFormSellingPrice(e.target.value)}
                    placeholder="1650"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field">
                  <label>Initial Stock Qty</label>
                  <input
                    type="number"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Min Alert Level</label>
                  <input
                    type="number"
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
                <button type="button" className="btn-secondary" onClick={() => setShowProductModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={formSaving}>
                  {formSaving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Component'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inventory Valuation Modal */}
      {showValuationModal && valuationData && (
        <div className="modal-overlay show" style={{ display: 'flex' }}>
          <div className="modal" style={{ maxWidth: 460 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>Inventory Valuation</h3>
              <button className="btn-ghost" onClick={() => setShowValuationModal(false)}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="kpi">
                <div className="kpi-label">Total Cost Value</div>
                <div className="kpi-value">Rs {valuationData.cost_value?.toLocaleString()}</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Total Retail Value</div>
                <div className="kpi-value">Rs {valuationData.retail_value?.toLocaleString()}</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Potential Gross Profit</div>
                <div className="kpi-value" style={{ color: 'var(--trace)' }}>
                  Rs {valuationData.potential_profit?.toLocaleString()}
                </div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Overall Margin</div>
                <div className="kpi-value">{valuationData.margin_percent}%</div>
              </div>
            </div>
            <div style={{ textAlign: 'right', marginTop: 20 }}>
              <button className="btn-secondary" onClick={() => setShowValuationModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
