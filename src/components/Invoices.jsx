import React, { useState, useEffect } from 'react';
import API from '../api';

export default function Invoices({ onOpenInvoice, showToast }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Return Processing Modal State
  const [returnSale, setReturnSale] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [returnQuantities, setReturnQuantities] = useState({});
  const [returnReason, setReturnReason] = useState('Defective component');
  const [processingReturn, setProcessingReturn] = useState(false);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await API.get('/api/sales');
      setSales(data.sales || []);
    } catch (err) {
      showToast('Failed to load invoices: ' + err.message, true);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReturnModal = async (sale) => {
    try {
      const data = await API.get(`/api/sales/${sale.id}`);
      setReturnSale(data.sale);
      setReturnItems(data.items || []);
      const initialQty = {};
      (data.items || []).forEach(it => {
        initialQty[it.id] = 0;
      });
      setReturnQuantities(initialQty);
    } catch (err) {
      showToast('Failed to load sale details: ' + err.message, true);
    }
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    if (!returnSale) return;

    const itemsToReturn = [];
    returnItems.forEach(it => {
      const qty = parseInt(returnQuantities[it.id], 10) || 0;
      if (qty > 0) {
        itemsToReturn.push({
          sale_item_id: it.id,
          product_id: it.product_id,
          quantity: qty,
          refund_amount: qty * it.unit_price
        });
      }
    });

    if (itemsToReturn.length === 0) {
      showToast('Please specify at least 1 item quantity to return', true);
      return;
    }

    setProcessingReturn(true);
    try {
      const res = await API.post('/api/returns', {
        sale_id: returnSale.id,
        reason: returnReason,
        items: itemsToReturn
      });
      showToast(`Return processed successfully! Refund: Rs ${res.refund_total?.toLocaleString()}`);
      setReturnSale(null);
      loadSales();
    } catch (err) {
      showToast('Return processing failed: ' + err.message, true);
    } finally {
      setProcessingReturn(false);
    }
  };

  const filteredSales = sales.filter(s => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (s.invoice_number && s.invoice_number.toLowerCase().includes(term)) ||
      (s.customer_name && s.customer_name.toLowerCase().includes(term)) ||
      (s.payment_status && s.payment_status.toLowerCase().includes(term))
    );
  });

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
              placeholder="Search invoices by #, customer or status..."
            />
          </div>
        </div>
        <button className="btn-secondary" onClick={loadSales} style={{ padding: '8px 14px' }}>
          ↻ Refresh Invoices
        </button>
      </div>

      {/* Invoices Table */}
      <div className="panel" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date &amp; Time</th>
              <th>Customer</th>
              <th>Payment Method</th>
              <th style={{ textAlign: 'right' }}>Total Amount</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'center' }}>Return Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: 28, color: 'var(--ink-soft)' }}>
                  Loading sales invoices...
                </td>
              </tr>
            ) : filteredSales.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: 28, color: 'var(--ink-soft)' }}>
                  No matching invoice transactions found.
                </td>
              </tr>
            ) : (
              filteredSales.map((s) => (
                <tr key={s.id}>
                  <td className="mono" style={{ color: 'var(--copper)', fontWeight: 700 }}>
                    #{s.invoice_number}
                  </td>
                  <td>{new Date(s.created_at).toLocaleString()}</td>
                  <td>{s.customer_name || 'Walk-in'}</td>
                  <td style={{ textTransform: 'uppercase' }}>{s.payment_method || 'CASH'}</td>
                  <td className="mono right" style={{ fontWeight: 600 }}>
                    Rs {s.total?.toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`status-badge ${s.payment_status === 'paid' ? 'paid' : 'pending'}`}>
                      {s.payment_status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {s.return_status && s.return_status !== 'none' ? (
                      <span className={`badge-return ${s.return_status}`}>
                        {s.return_status.toUpperCase()}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--ink-soft)', fontSize: '0.75rem' }}>None</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn-ghost"
                      onClick={() => onOpenInvoice(s.id)}
                      style={{ fontSize: '0.78rem', padding: '4px 8px', marginRight: 6 }}
                    >
                      View Invoice
                    </button>
                    {s.payment_status === 'paid' && s.return_status !== 'full' && (
                      <button
                        className="btn-ghost"
                        onClick={() => handleOpenReturnModal(s)}
                        style={{ fontSize: '0.78rem', padding: '4px 8px', color: 'var(--danger)' }}
                      >
                        Return Items
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Return Processing Modal */}
      {returnSale && (
        <div className="modal-overlay show" style={{ display: 'flex' }}>
          <div className="modal" style={{ maxWidth: 540 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3>Process Sales Return · Invoice #{returnSale.invoice_number}</h3>
              <button className="btn-ghost" onClick={() => setReturnSale(null)}>✕</button>
            </div>

            <p className="sub" style={{ marginBottom: 16 }}>
              Returned items are automatically restocked into inventory.
            </p>

            <form onSubmit={handleSubmitReturn}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--ink-soft)' }}>
                  Items Purchased in this Order
                </label>
                {returnItems.map((item) => {
                  const maxReturnable = item.quantity - (item.returned_quantity || 0);
                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 0',
                        borderBottom: '1px solid var(--panel-line)'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.product_name}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--ink-soft)' }}>
                          Rs {item.unit_price} · Max returnable: {maxReturnable} units
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: '0.8rem' }}>Return Qty:</span>
                        <input
                          type="number"
                          min="0"
                          max={maxReturnable}
                          value={returnQuantities[item.id] || 0}
                          onChange={(e) => {
                            const val = Math.min(maxReturnable, Math.max(0, parseInt(e.target.value, 10) || 0));
                            setReturnQuantities({
                              ...returnQuantities,
                              [item.id]: val
                            });
                          }}
                          style={{ width: 60, textAlign: 'center', padding: '4px 6px', fontWeight: 700 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="field">
                <label>Reason for Return</label>
                <select value={returnReason} onChange={(e) => setReturnReason(e.target.value)}>
                  <option value="Defective component">Defective component</option>
                  <option value="Customer bought incorrect voltage / specification">
                    Customer bought incorrect voltage / specification
                  </option>
                  <option value="Project cancelled">Project cancelled</option>
                  <option value="Excess components">Excess components</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <button type="button" className="btn-secondary" onClick={() => setReturnSale(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={processingReturn}>
                  {processingReturn ? 'Restocking & Refunding...' : 'Confirm Return & Restock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
