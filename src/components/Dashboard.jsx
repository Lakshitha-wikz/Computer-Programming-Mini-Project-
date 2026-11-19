import React, { useState, useEffect } from 'react';
import API from '../api';

export default function Dashboard({ onOpenInvoice, onNavigateToInventory, onNavigateToPOS }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await API.get('/api/reports/dashboard');
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="content" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ color: 'var(--ink-soft)' }}>Loading real-time shop performance metrics...</p>
      </div>
    );
  }

  const s = stats || {};

  return (
    <div className="content">
      {/* Primary KPI Grid (4 cards) */}
      <div className="stat-grid">
        <div className="stat-card c1">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 8l-9-5-9 5 9 5 9-5z"/>
              <path d="M3 8v8l9 5 9-5V8"/>
            </svg>
          </div>
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{s.total_products || 0}</div>
          <div className="stat-delta">Active catalog items</div>
        </div>

        <div className="stat-card c2">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 3v18h18"/>
              <path d="M7 14l4-4 3 3 5-6"/>
            </svg>
          </div>
          <div className="stat-label">Today's Sales</div>
          <div className="stat-value">Rs {(s.today_sales || 0).toLocaleString()}</div>
          <div className="stat-delta">Live POS revenue</div>
        </div>

        <div className="stat-card c3">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M10.3 3.9L2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>
              <path d="M12 9v4M12 17h.01"/>
            </svg>
          </div>
          <div className="stat-label">Low Stock Items</div>
          <div className="stat-value">{s.low_stock_count || 0}</div>
          <div className="stat-delta down">Reorder required</div>
        </div>

        <div className="stat-card c4">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="4" width="18" height="16" rx="2"/>
              <path d="M3 10h18M8 2v4M16 2v4"/>
            </svg>
          </div>
          <div className="stat-label">Transactions Today</div>
          <div className="stat-value">{s.transactions_today || 0}</div>
          <div className="stat-delta">Completed orders</div>
        </div>
      </div>

      {/* Secondary KPI Grid (Financial & Margin Analysis) */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginTop: -8 }}>
        <div className="stat-card c5">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div className="stat-label">Today's Gross Profit</div>
          <div className="stat-value">Rs {(s.today_profit || 0).toLocaleString()}</div>
          <div className="stat-delta">Authoritative calculation</div>
        </div>

        <div className="stat-card c6">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 12h8"/>
            </svg>
          </div>
          <div className="stat-label">Today's Margin</div>
          <div className="stat-value">{s.profit_margin || 0}%</div>
          <div className="stat-delta">Net sales margin</div>
        </div>

        <div className="stat-card c7">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10"/>
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            </svg>
          </div>
          <div className="stat-label">Out of Stock</div>
          <div className="stat-value">{s.out_of_stock_count || 0}</div>
          <div className="stat-delta down">0 units available</div>
        </div>

        <div className="stat-card c8">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <div className="stat-label">Inventory Retail Value</div>
          <div className="stat-value">Rs {(s.inventory_valuation?.retail_value || 0).toLocaleString()}</div>
          <div className="stat-delta">Total catalog value</div>
        </div>
      </div>

      {/* Main Split Panels */}
      <div className="dash-grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24 }}>
        {/* Recent Transactions Panel */}
        <div className="panel">
          <div className="panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>Recent Transactions</h3>
              <p>Latest orders processed at POS counter</p>
            </div>
            <button className="btn-ghost" onClick={onNavigateToPOS} style={{ fontSize: '0.8rem' }}>
              Open POS &rarr;
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Sale ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {!s.recent_sales || s.recent_sales.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: 24, color: 'var(--ink-soft)' }}>
                      No sales recorded today yet.
                    </td>
                  </tr>
                ) : (
                  s.recent_sales.map((sale) => (
                    <tr
                      key={sale.id}
                      onClick={() => onOpenInvoice && onOpenInvoice(sale.id)}
                      style={{ cursor: 'pointer' }}
                      title="Click to view detailed invoice"
                    >
                      <td className="mono" style={{ color: 'var(--copper)', fontWeight: 600 }}>
                        #{sale.invoice_number}
                      </td>
                      <td>{sale.customer_name || 'Walk-in Customer'}</td>
                      <td style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {sale.items_summary || 'Electronic components'}
                      </td>
                      <td className="mono right" style={{ fontWeight: 600 }}>
                        Rs {sale.total?.toLocaleString()}
                      </td>
                      <td>
                        <span className={`status-badge ${sale.payment_status === 'paid' ? 'paid' : 'pending'}`}>
                          {sale.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Attention List */}
        <div className="panel">
          <div className="panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>Low Stock Attention</h3>
              <p>Parts below minimum threshold</p>
            </div>
            <button className="btn-ghost" onClick={onNavigateToInventory} style={{ fontSize: '0.8rem' }}>
              Manage Stock &rarr;
            </button>
          </div>

          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {!s.low_stock_items || s.low_stock_items.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--ink-soft)' }}>
                All electronic components are sufficiently stocked.
              </div>
            ) : (
              s.low_stock_items.map((item) => {
                const isOut = item.stock_quantity === 0;
                return (
                  <div
                    key={item.id}
                    className="low-stock-row"
                    onClick={onNavigateToInventory}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--panel-line)',
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.name}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-soft)' }}>
                        {item.sku}
                      </div>
                    </div>
                    <span className={`pill ${isOut ? 'out' : 'low'}`}>
                      {isOut ? '0 left' : `${item.stock_quantity} left`}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
