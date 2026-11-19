import React, { useState, useEffect } from 'react';
import API from '../api';

export default function Reports({ showToast }) {
  const [activeTab, setActiveTab] = useState('daily'); // 'daily', 'monthly', 'forecasting'
  
  // Daily Report State
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyData, setDailyData] = useState(null);
  const [loadingDaily, setLoadingDaily] = useState(false);

  // Monthly Report State
  const [monthlyMonth, setMonthlyMonth] = useState(new Date().toISOString().slice(0, 7));
  const [monthlyData, setMonthlyData] = useState(null);
  const [loadingMonthly, setLoadingMonthly] = useState(false);

  // Forecasting State
  const [forecasts, setForecasts] = useState([]);
  const [loadingForecast, setLoadingForecast] = useState(false);

  useEffect(() => {
    if (activeTab === 'daily') {
      loadDailyReport();
    } else if (activeTab === 'monthly') {
      loadMonthlyReport();
    } else if (activeTab === 'forecasting') {
      loadForecasting();
    }
  }, [activeTab, dailyDate, monthlyMonth]);

  const loadDailyReport = async () => {
    try {
      setLoadingDaily(true);
      const data = await API.get(`/api/reports/sales?period=custom&start_date=${dailyDate}&end_date=${dailyDate}`);
      setDailyData(data);
    } catch (err) {
      showToast('Error loading daily report: ' + err.message, true);
    } finally {
      setLoadingDaily(false);
    }
  };

  const loadMonthlyReport = async () => {
    try {
      setLoadingMonthly(true);
      const data = await API.get('/api/reports/monthly');
      setMonthlyData(data);
    } catch (err) {
      showToast('Error loading monthly report: ' + err.message, true);
    } finally {
      setLoadingMonthly(false);
    }
  };

  const loadForecasting = async () => {
    try {
      setLoadingForecast(true);
      const data = await API.get('/api/reports/sales');
      // Or stock forecasts
      const forecastRes = await API.get('/api/reports/dashboard');
      setForecasts(forecastRes.low_stock_items || []);
    } catch (err) {
      showToast('Error loading forecasting: ' + err.message, true);
    } finally {
      setLoadingForecast(false);
    }
  };

  const handleDownloadCsv = (type) => {
    let url = `/api/export/csv?type=${type}`;
    if (type === 'daily') url += `&date=${dailyDate}`;
    if (type === 'monthly') url += `&month=${monthlyMonth}`;
    window.open(url, '_blank');
  };

  const handleDownloadPdf = (type) => {
    let url = `/api/export/pdf?type=${type}`;
    if (type === 'daily') url += `&date=${dailyDate}`;
    if (type === 'monthly') url += `&month=${monthlyMonth}`;
    window.open(url, '_blank');
  };

  const handlePrintReport = (type) => {
    let url = `/api/export/report-pdf?type=${type}`;
    if (type === 'daily') url += `&date=${dailyDate}`;
    if (type === 'monthly') url += `&month=${monthlyMonth}`;
    window.open(url, '_blank');
  };

  return (
    <div className="content">
      {/* Report Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button
          className={`tab-btn ${activeTab === 'daily' ? 'active' : ''}`}
          onClick={() => setActiveTab('daily')}
        >
          📅 Daily Sales Report
        </button>
        <button
          className={`tab-btn ${activeTab === 'monthly' ? 'active' : ''}`}
          onClick={() => setActiveTab('monthly')}
        >
          📊 Monthly Sales Report
        </button>
        <button
          className={`tab-btn ${activeTab === 'forecasting' ? 'active' : ''}`}
          onClick={() => setActiveTab('forecasting')}
        >
          📈 Stock Forecasting &amp; Reorder
        </button>
      </div>

      {/* ================= TAB 1: DAILY SALES REPORT ================= */}
      {activeTab === 'daily' && (
        <div>
          {/* Controls Bar */}
          <div className="panel" style={{ padding: '14px 18px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Select Report Date:</label>
              <input
                type="date"
                value={dailyDate}
                onChange={(e) => setDailyDate(e.target.value)}
                style={{ padding: '6px 10px', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn-secondary"
                onClick={() => handlePrintReport('daily')}
                style={{ padding: '7px 12px', fontSize: '0.82rem' }}
              >
                🖨 Printable View
              </button>
              <button
                className="btn-secondary"
                onClick={() => handleDownloadCsv('daily')}
                style={{ padding: '7px 12px', fontSize: '0.82rem' }}
              >
                📥 Download CSV
              </button>
              <button
                className="btn-primary"
                onClick={() => handleDownloadPdf('daily')}
                style={{ padding: '7px 14px', fontSize: '0.82rem' }}
              >
                📄 Download Official PDF
              </button>
            </div>
          </div>

          {/* Daily KPIs */}
          {dailyData && (
            <div className="kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
              <div className="kpi">
                <div className="kpi-label">Total Revenue</div>
                <div className="kpi-value" style={{ color: 'var(--copper)' }}>
                  Rs {(dailyData.kpis?.revenue || 0).toLocaleString()}
                </div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Units Sold</div>
                <div className="kpi-value">
                  {dailyData.kpis?.units_sold || 0} units
                </div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Transactions</div>
                <div className="kpi-value">
                  {dailyData.kpis?.transactions || 0} orders
                </div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Gross Margin</div>
                <div className="kpi-value" style={{ color: 'var(--trace)' }}>
                  {dailyData.kpis?.margin || 0}%
                </div>
              </div>
            </div>
          )}

          {/* Daily Transactions Breakdown */}
          <div className="panel" style={{ overflowX: 'auto' }}>
            <div className="panel-head">
              <h3>Daily Sales Audit Log</h3>
              <p>Transactions recorded for {dailyDate}</p>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Time</th>
                  <th>Customer</th>
                  <th>Items Purchased</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th style={{ textAlign: 'center' }}>Payment</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loadingDaily ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: 24, color: 'var(--ink-soft)' }}>
                      Loading daily sales transactions...
                    </td>
                  </tr>
                ) : !dailyData || !dailyData.sales || dailyData.sales.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: 24, color: 'var(--ink-soft)' }}>
                      No sales recorded for {dailyDate}.
                    </td>
                  </tr>
                ) : (
                  dailyData.sales.map((s) => (
                    <tr key={s.id}>
                      <td className="mono" style={{ color: 'var(--copper)', fontWeight: 600 }}>
                        #{s.invoice_number}
                      </td>
                      <td className="mono">{new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>{s.customer_name || 'Walk-in Customer'}</td>
                      <td>{s.items_summary || 'Component sale'}</td>
                      <td className="mono right" style={{ fontWeight: 600 }}>
                        Rs {s.total?.toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'center', textTransform: 'uppercase' }}>
                        {s.payment_method || 'CASH'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`status-badge ${s.payment_status === 'paid' ? 'paid' : 'pending'}`}>
                          {s.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 2: MONTHLY SALES REPORT ================= */}
      {activeTab === 'monthly' && (
        <div>
          {/* Controls Bar */}
          <div className="panel" style={{ padding: '14px 18px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Select Month:</label>
              <input
                type="month"
                value={monthlyMonth}
                onChange={(e) => setMonthlyMonth(e.target.value)}
                style={{ padding: '6px 10px', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn-secondary"
                onClick={() => handlePrintReport('monthly')}
                style={{ padding: '7px 12px', fontSize: '0.82rem' }}
              >
                🖨 Printable View
              </button>
              <button
                className="btn-secondary"
                onClick={() => handleDownloadCsv('monthly')}
                style={{ padding: '7px 12px', fontSize: '0.82rem' }}
              >
                📥 Download CSV
              </button>
              <button
                className="btn-primary"
                onClick={() => handleDownloadPdf('monthly')}
                style={{ padding: '7px 14px', fontSize: '0.82rem' }}
              >
                📄 Download Official PDF
              </button>
            </div>
          </div>

          {/* Monthly KPIs */}
          {monthlyData && (
            <div className="kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
              <div className="kpi">
                <div className="kpi-label">Monthly Gross Revenue</div>
                <div className="kpi-value" style={{ color: 'var(--copper)' }}>
                  Rs {(monthlyData.kpis?.monthly_revenue || 0).toLocaleString()}
                </div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Best Selling Product</div>
                <div className="kpi-value" style={{ fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {monthlyData.kpis?.best_product || 'N/A'}
                </div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Total Stock Movement</div>
                <div className="kpi-value">
                  {monthlyData.kpis?.stock_movement || 0} units
                </div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Monthly Profit Margin</div>
                <div className="kpi-value" style={{ color: 'var(--trace)' }}>
                  {monthlyData.kpis?.profit_margin || 0}%
                </div>
              </div>
            </div>
          )}

          {/* Top Selling Products Ranking Table */}
          <div className="panel" style={{ overflowX: 'auto' }}>
            <div className="panel-head">
              <h3>Top Selling Electronic Components Ranking</h3>
              <p>Top performing parts by demand and revenue contribution</p>
            </div>

            <table>
              <thead>
                <tr>
                  <th style={{ width: 60 }}>Rank</th>
                  <th>Component Name</th>
                  <th>SKU</th>
                  <th style={{ textAlign: 'center' }}>Units Sold</th>
                  <th style={{ textAlign: 'right' }}>Total Revenue Generated</th>
                </tr>
              </thead>
              <tbody>
                {loadingMonthly ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: 24, color: 'var(--ink-soft)' }}>
                      Computing monthly statistics...
                    </td>
                  </tr>
                ) : !monthlyData || !monthlyData.best_products || monthlyData.best_products.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: 24, color: 'var(--ink-soft)' }}>
                      No sales recorded for {monthlyMonth}.
                    </td>
                  </tr>
                ) : (
                  monthlyData.best_products.map((p, idx) => (
                    <tr key={idx}>
                      <td className="mono" style={{ fontWeight: 700, color: 'var(--copper)' }}>
                        #{idx + 1}
                      </td>
                      <td style={{ fontWeight: 600 }}>{p.product_name}</td>
                      <td className="mono" style={{ color: 'var(--ink-soft)' }}>{p.sku}</td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>{p.units_sold} units</td>
                      <td className="mono right" style={{ fontWeight: 600 }}>
                        Rs {(p.revenue || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: STOCK FORECASTING ================= */}
      {activeTab === 'forecasting' && (
        <div className="panel" style={{ overflowX: 'auto' }}>
          <div className="panel-head">
            <h3>Automated Stock Depletion Forecast &amp; Reorder Analysis</h3>
            <p>Calculates remaining inventory runout based on historical component velocity</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Component</th>
                <th>SKU</th>
                <th style={{ textAlign: 'center' }}>Current Stock</th>
                <th style={{ textAlign: 'center' }}>Reorder Level</th>
                <th style={{ textAlign: 'center' }}>Depletion Status</th>
              </tr>
            </thead>
            <tbody>
              {loadingForecast ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: 24, color: 'var(--ink-soft)' }}>
                    Computing stock forecasts...
                  </td>
                </tr>
              ) : forecasts.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: 24, color: 'var(--ink-soft)' }}>
                    All items are stocked above reorder thresholds.
                  </td>
                </tr>
              ) : (
                forecasts.map((f) => (
                  <tr key={f.id}>
                    <td style={{ fontWeight: 600 }}>{f.name}</td>
                    <td className="mono" style={{ color: 'var(--copper)' }}>{f.sku}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{f.stock_quantity} units</td>
                    <td style={{ textAlign: 'center' }}>{f.min_stock_level || 5} units</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`pill ${f.stock_quantity === 0 ? 'out' : 'low'}`}>
                        {f.stock_quantity === 0 ? 'Urgent Reorder Required' : 'Low Stock Warning'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
