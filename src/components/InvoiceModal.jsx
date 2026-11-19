import React, { useState, useEffect } from 'react';
import API from '../api';

export default function InvoiceModal({ saleId, onClose, showToast }) {
  const [sale, setSale] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (saleId) {
      loadInvoiceDetails();
    }
  }, [saleId]);

  const loadInvoiceDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/api/sales/${saleId}`);
      setSale(res.sale);
      setItems(res.items || []);
    } catch (err) {
      showToast('Error loading invoice: ' + err.message, true);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.open(`/api/export/invoice/${saleId}`, '_blank');
  };

  if (!saleId) return null;

  return (
    <div className="modal-overlay show" style={{ display: 'flex' }}>
      <div className="modal" style={{ maxWidth: 640 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3>Electronic Shop Invoice Receipt</h3>
          <button className="btn-ghost" onClick={onClose}>✕</button>
        </div>

        {loading || !sale ? (
          <p style={{ textAlign: 'center', padding: 30, color: 'var(--ink-soft)' }}>Generating invoice view...</p>
        ) : (
          <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--panel-line)', paddingBottom: 12, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>CompStock</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>Pettah, Colombo 11, Sri Lanka</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>Billed To: <strong>{sale.customer_name || 'Walk-in Customer'}</strong></div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--copper)' }}>
                  #{sale.invoice_number}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>
                  {new Date(sale.created_at).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Method: <strong>{sale.payment_method || 'CASH'}</strong>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div style={{ maxHeight: 220, overflowY: 'auto', marginBottom: 14 }}>
              <table>
                <thead>
                  <tr>
                    <th>Component</th>
                    <th style={{ textAlign: 'right' }}>Price</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id}>
                      <td>
                        <strong>{it.product_name}</strong>
                        <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--ink-soft)' }}>{it.sku}</div>
                      </td>
                      <td className="mono right">Rs {it.unit_price?.toLocaleString()}</td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>{it.quantity}</td>
                      <td className="mono right" style={{ fontWeight: 600 }}>Rs {it.line_total?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown */}
            <div style={{ background: 'var(--bg)', borderRadius: 8, padding: 12, fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>Subtotal:</span>
                <span className="mono">Rs {sale.subtotal?.toLocaleString()}</span>
              </div>
              {sale.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: 'var(--copper)' }}>
                  <span>Discount:</span>
                  <span className="mono">- Rs {sale.discount?.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', paddingTop: 6, borderTop: '1px solid var(--panel-line)', color: 'var(--copper)' }}>
                <span>Total Amount:</span>
                <span className="mono">Rs {sale.total?.toLocaleString()}</span>
              </div>
              {sale.amount_paid > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
                  <span>Tendered: Rs {sale.amount_paid?.toLocaleString()}</span>
                  <span>Change: Rs {sale.change_amount?.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button className="btn-secondary" onClick={onClose}>
                Close
              </button>
              <button className="btn-primary" onClick={handlePrint}>
                🖨 Print / Save PDF Invoice
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
