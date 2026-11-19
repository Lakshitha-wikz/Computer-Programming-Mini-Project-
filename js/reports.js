// Dashboard and Reports Analytics Module
let activeReportTab = 'daily';

// Load Dashboard Screen Data
async function loadDashboard() {
  try {
    const data = await API.get('/api/reports/dashboard');

    // Stat cards
    document.getElementById('dashTotalProducts').textContent = data.total_products;
    document.getElementById('dashTodaySales').textContent = 'Rs ' + data.today_sales.toLocaleString();
    document.getElementById('dashLowStockCount').textContent = data.low_stock_count;
    document.getElementById('dashTransactionsToday').textContent = data.transactions_today;

    const profitEl = document.getElementById('dashTodayProfit');
    const marginEl = document.getElementById('dashProfitMargin');
    const outStockEl = document.getElementById('dashOutOfStockCount');
    const valRetailEl = document.getElementById('dashValuationRetail');

    if (profitEl) profitEl.textContent = 'Rs ' + (data.today_profit || 0).toLocaleString();
    if (marginEl) marginEl.textContent = `${data.profit_margin || 0}%`;
    if (outStockEl) outStockEl.textContent = data.out_of_stock_count || 0;
    if (valRetailEl && data.inventory_valuation) {
      valRetailEl.textContent = 'Rs ' + (data.inventory_valuation.retail_value || 0).toLocaleString();
    }

    // Sidebar badge
    const badge = document.getElementById('inventoryLowBadge');
    if (badge) {
      badge.textContent = data.low_stock_count;
      badge.style.display = data.low_stock_count > 0 ? 'inline-block' : 'none';
    }

    // Recent Transactions table
    const recentTbody = document.getElementById('dashRecentTable');
    if (recentTbody) {
      if (data.recent_sales.length === 0) {
        recentTbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:18px; color:var(--ink-soft);">No transactions yet today.</td></tr>';
      } else {
        recentTbody.innerHTML = data.recent_sales.map(s => {
          const statusClass = s.payment_status === 'paid' ? 'paid' : 'pending';
          return `
            <tr style="cursor:pointer;" onclick="openInvoiceModal(${s.id})" title="Click to view invoice">
              <td class="mono" style="color:var(--copper); font-weight:600;">#${escapeHtml(s.invoice_number)}</td>
              <td>${escapeHtml(s.customer_name)}</td>
              <td>${escapeHtml(s.items_summary || 'Items')}</td>
              <td class="mono right">Rs ${s.total.toLocaleString()}</td>
              <td><span class="status-badge ${statusClass}">${escapeHtml(s.payment_status)}</span></td>
            </tr>
          `;
        }).join('');
      }
    }

    // Low stock items list
    const lowStockContainer = document.getElementById('dashLowStockList');
    if (lowStockContainer) {
      if (data.low_stock_items.length === 0) {
        lowStockContainer.innerHTML = '<div style="padding:24px 20px; text-align:center; color:var(--ink-soft);">All products sufficiently stocked.</div>';
      } else {
        lowStockContainer.innerHTML = data.low_stock_items.map(p => {
          const isOut = p.stock_quantity === 0;
          const pillClass = isOut ? 'out' : 'low';
          const pillText = isOut ? '0 left' : `${p.stock_quantity} left`;
          return `
            <div class="low-stock-row">
              <div>
                <div class="ls-name">${escapeHtml(p.name)}</div>
                <div class="ls-sku">${escapeHtml(p.sku)}</div>
              </div>
              <span class="pill ${pillClass}">${pillText}</span>
            </div>
          `;
        }).join('');
      }
    }
  } catch (err) {
    console.error('Failed to load dashboard stats:', err);
  }
}

// Reports Tab Switching
function showReport(name, btn) {
  activeReportTab = name;
  document.querySelectorAll('.report-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('report-' + name);
  if (panel) panel.classList.add('active');

  document.querySelectorAll('#reportsTabs .tab-btn').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');

  if (name === 'daily') {
    loadDailyReport();
  } else if (name === 'monthly') {
    loadMonthlyReport();
  } else if (name === 'profit') {
    loadProfitReport();
  } else if (name === 'forecasting') {
    loadForecastingReport();
  } else if (name === 'calendar') {
    loadCalendarReport();
  }
}

function loadReports() {
  showReport(activeReportTab, document.querySelector(`#reportsTabs [data-tab="${activeReportTab}"]`));
}

// Daily Report
async function loadDailyReport() {
  try {
    const data = await API.get('/api/reports/daily');

    document.getElementById('dailyRevKpi').textContent = 'Rs ' + (data.kpis.total_revenue || 0).toLocaleString();
    document.getElementById('dailySoldKpi').textContent = (data.kpis.products_sold || 0) + ' units';
    document.getElementById('dailyTxKpi').textContent = data.kpis.transactions || 0;

    const tbody = document.getElementById('dailyReportTable');
    if (tbody) {
      if (!data.sales || data.sales.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:24px; color:var(--ink-soft);">No sales completed today yet.</td></tr>';
      } else {
        tbody.innerHTML = data.sales.map(s => {
          const statusClass = s.payment_status === 'paid' ? 'paid' : 'pending';
          return `
            <tr style="cursor:pointer;" onclick="openInvoiceModal(${s.id})">
              <td class="mono" style="color:var(--copper); font-weight:600;">#${escapeHtml(s.invoice_number)}</td>
              <td class="mono">${escapeHtml(s.formatted_time || 'Today')}</td>
              <td>${escapeHtml(s.customer_name)}</td>
              <td class="mono right">Rs ${s.total.toLocaleString()}</td>
              <td><span class="status-badge ${statusClass}">${escapeHtml(s.payment_status)}</span></td>
            </tr>
          `;
        }).join('');
      }
    }
  } catch (err) {
    console.error('Error loading daily report:', err);
  }
}

// Monthly Report
async function loadMonthlyReport() {
  try {
    const data = await API.get('/api/reports/monthly');

    document.getElementById('monthlyRevKpi').textContent = 'Rs ' + (data.kpis.monthly_revenue || 0).toLocaleString();
    document.getElementById('monthlyBestProdKpi').textContent = data.kpis.best_product || 'N/A';
    document.getElementById('monthlyStockMoveKpi').textContent = (data.kpis.stock_movement || 0) + ' units';

    // Best Products table
    const tbody = document.getElementById('monthlyBestProductsTable');
    if (tbody) {
      if (!data.best_products || data.best_products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:24px; color:var(--ink-soft);">No product sales this month yet.</td></tr>';
      } else {
        tbody.innerHTML = data.best_products.map((p, idx) => `
          <tr>
            <td class="mono">${idx + 1}</td>
            <td><strong>${escapeHtml(p.product_name)}</strong><br><small class="mono" style="color:var(--ink-soft);">${escapeHtml(p.sku)}</small></td>
            <td class="mono right">Rs ${p.revenue.toLocaleString()}</td>
            <td class="mono right">${p.units_sold}</td>
          </tr>
        `).join('');
      }
    }

    // Dynamic Bar Chart
    renderTrendChart(data.trend || []);
  } catch (err) {
    console.error('Error loading monthly report:', err);
  }
}

// Profit & Margin Report
async function loadProfitReport() {
  try {
    const data = await API.get('/api/reports/sales?period=month');
    const k = data.kpis;

    const revEl = document.getElementById('profitRevKpi');
    const costEl = document.getElementById('profitCostKpi');
    const profitEl = document.getElementById('profitGrossKpi');
    const marginEl = document.getElementById('profitMarginKpi');
    const atvEl = document.getElementById('profitAtvKpi');

    if (revEl) revEl.textContent = `Rs ${(k.revenue || 0).toLocaleString()}`;
    if (costEl) costEl.textContent = `Rs ${(k.cost || 0).toLocaleString()}`;
    if (profitEl) profitEl.textContent = `Rs ${(k.profit || 0).toLocaleString()}`;
    if (marginEl) marginEl.textContent = `${k.margin || 0}%`;
    if (atvEl) atvEl.textContent = `Rs ${(k.average_transaction_value || 0).toLocaleString()}`;

    const tbody = document.getElementById('profitTableBody');
    if (tbody) {
      const sales = data.sales || [];
      if (sales.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--ink-soft);">No transactions in this period.</td></tr>';
      } else {
        tbody.innerHTML = sales.map(s => {
          const margin = s.total > 0 ? Math.round((s.order_profit / s.total) * 100) : 0;
          return `
            <tr style="cursor:pointer;" onclick="openInvoiceModal(${s.id})">
              <td class="mono" style="color:var(--copper); font-weight:600;">#${escapeHtml(s.invoice_number)}</td>
              <td>${escapeHtml(s.customer_name)}</td>
              <td class="mono right">Rs ${s.total.toLocaleString()}</td>
              <td class="mono right" style="color:var(--ink-soft);">Rs ${(s.order_cost || 0).toLocaleString()}</td>
              <td class="mono right" style="font-weight:700; color:var(--trace);">Rs ${(s.order_profit || 0).toLocaleString()}</td>
              <td class="mono right" style="font-weight:600;">${margin}%</td>
            </tr>
          `;
        }).join('');
      }
    }
  } catch (err) {
    console.error('Error loading profit report:', err);
  }
}

// Stock Forecasting & Reorders
async function loadForecastingReport() {
  try {
    const data = await API.get('/api/reports/forecasts');
    const forecasts = data.forecasts || [];

    const tbody = document.getElementById('forecastTableBody');
    if (!tbody) return;

    if (forecasts.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:24px; color:var(--ink-soft);">No forecasting data available.</td></tr>';
      return;
    }

    tbody.innerHTML = forecasts.map(f => {
      let statusPill = '<span class="pill ok">Healthy</span>';
      if (f.status === 'Critical') {
        statusPill = '<span class="pill out">Critical (0 Stock)</span>';
      } else if (f.status === 'Restock Soon') {
        statusPill = '<span class="pill low">Restock Soon</span>';
      } else if (f.status === 'Monitor') {
        statusPill = '<span class="pill low">Monitor</span>';
      }

      return `
        <tr>
          <td>
            <strong>${escapeHtml(f.name)}</strong><br>
            <small class="mono" style="color:var(--ink-soft);">${escapeHtml(f.sku)} · ${escapeHtml(f.category)}</small>
          </td>
          <td class="mono right" style="font-weight:600;">${f.current_stock}</td>
          <td class="mono right">${f.threshold}</td>
          <td class="mono right">${f.units_sold_30d}</td>
          <td class="mono right">${f.avg_daily_sales}/day</td>
          <td class="mono right" style="font-weight:700; color:${f.days_remaining <= 5 ? 'var(--danger)' : 'inherit'};">
            ${f.days_remaining !== null ? `${f.days_remaining} d` : '—'}
          </td>
          <td>${statusPill}</td>
          <td class="mono right" style="font-weight:700; color:var(--copper);">
            ${f.recommended_order > 0 ? `+${f.recommended_order} units` : '—'}
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Error loading forecasting:', err);
  }
}

// Sales Calendar
async function loadCalendarReport() {
  try {
    const data = await API.get('/api/reports/calendar');
    const container = document.getElementById('salesCalendarContainer');
    if (!container) return;

    const daysMap = new Map();
    (data.days || []).forEach(d => {
      daysMap.set(parseInt(d.day, 10), d);
    });

    const now = new Date();
    const daysInMonth = new Date(data.year, data.month, 0).getDate();
    const firstDayOfWeek = new Date(data.year, data.month - 1, 1).getDay();

    let gridHtml = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
        <h4 style="margin:0; font-family:var(--font-display);">${new Date(data.year, data.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</h4>
      </div>
      <div class="calendar-grid">
        <div class="cal-day-header">Sun</div>
        <div class="cal-day-header">Mon</div>
        <div class="cal-day-header">Tue</div>
        <div class="cal-day-header">Wed</div>
        <div class="cal-day-header">Thu</div>
        <div class="cal-day-header">Fri</div>
        <div class="cal-day-header">Sat</div>
    `;

    // Blank padding days
    for (let i = 0; i < firstDayOfWeek; i++) {
      gridHtml += '<div style="background:transparent;"></div>';
    }

    // Days in current month
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const dayData = daysMap.get(dayNum);
      const rev = dayData ? dayData.total_revenue : 0;
      const tx = dayData ? dayData.transaction_count : 0;

      gridHtml += `
        <div class="cal-day-card ${rev > 0 ? 'has-sales' : ''}">
          <div class="cal-day-num">${dayNum}</div>
          <div>
            ${rev > 0 ? `
              <div class="cal-day-sales">Rs ${rev >= 1000 ? (rev / 1000).toFixed(1) + 'k' : rev}</div>
              <div class="cal-day-tx">${tx} sale${tx > 1 ? 's' : ''}</div>
            ` : '<div style="font-size:0.65rem; color:var(--ink-soft); text-align:right;">—</div>'}
          </div>
        </div>
      `;
    }

    gridHtml += '</div>';
    container.innerHTML = gridHtml;
  } catch (err) {
    console.error('Error loading calendar:', err);
  }
}

function renderTrendChart(trendData) {
  const barsContainer = document.getElementById('monthlyChartBars');
  const labelsContainer = document.getElementById('monthlyChartLabels');
  if (!barsContainer || !labelsContainer) return;

  if (trendData.length === 0) {
    barsContainer.innerHTML = '<div style="margin:auto; color:var(--ink-soft); font-size:0.85rem;">No historical sales data to plot yet.</div>';
    labelsContainer.innerHTML = '';
    return;
  }

  const maxVal = Math.max(...trendData.map(d => d.daily_revenue || d.daily_rev || 0), 1000);

  barsContainer.innerHTML = trendData.map(d => {
    const rev = d.daily_revenue || d.daily_rev || 0;
    const pct = Math.max(8, Math.round((rev / maxVal) * 100));
    const label = rev >= 1000 ? (rev / 1000).toFixed(1) + 'k' : rev;
    return `
      <div class="chart-bar" style="height:${pct}%;">
        <span>${label}</span>
      </div>
    `;
  }).join('');

  labelsContainer.innerHTML = trendData.map(d => `
    <div>${escapeHtml(d.day_label)}</div>
  `).join('');
}

// Exports
async function triggerExportCsv(explicitType) {
  let type = explicitType;
  if (!type) {
    if (activeReportTab === 'daily') type = 'daily';
    else if (activeReportTab === 'monthly' || activeReportTab === 'profit') type = 'monthly';
    else if (activeReportTab === 'forecasting') type = 'forecasts';
    else type = 'daily';
  }

  toast(`Exporting ${type} report as CSV...`);

  try {
    const response = await fetch(`/api/export/csv?type=${type}`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Export failed with status ${response.status}`);
    }

    const disposition = response.headers.get('content-disposition');
    let filename = `compstock-${type}-report.csv`;
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^";]+)"?/);
      if (match && match[1]) filename = match[1];
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast(`${type.charAt(0).toUpperCase() + type.slice(1)} downloaded as CSV`);
  } catch (err) {
    console.error('CSV Export Error:', err);
    toast('Export failed: ' + err.message, true);
  }
}

function triggerExportPdf() {
  const type = activeReportTab === 'daily' ? 'daily' : 'monthly';
  const url = `/api/export/report-pdf?type=${type}`;
  window.open(url, '_blank');
  toast(`Opening printable ${type} report...`);
}
