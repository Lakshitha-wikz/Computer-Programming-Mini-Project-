// CompStock Invoices and Returns Module
let allInvoicesList = [];
let allReturnsList = [];
let activeInvoiceTab = 'invoices';
let currentReturnInvoice = null;

async function loadInvoicesScreen() {
  if (activeInvoiceTab === 'invoices') {
    await loadInvoicesList();
  } else {
    await loadReturnsList();
  }
}

function switchInvoiceTab(tab, btn) {
  activeInvoiceTab = tab;
  document.querySelectorAll('#invoicesTabs .tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  document.getElementById('invoicesListView').style.display = tab === 'invoices' ? 'block' : 'none';
  document.getElementById('returnsListView').style.display = tab === 'returns' ? 'block' : 'none';

  loadInvoicesScreen();
}

async function loadInvoicesList() {
  try {
    const searchVal = (document.getElementById('invoiceSearchInput')?.value || '').trim();
    let url = '/api/sales?limit=100';
    if (searchVal) {
      url += `&search=${encodeURIComponent(searchVal)}`;
    }
    const data = await API.get(url);
    allInvoicesList = data.sales || [];
    renderInvoicesTable();
  } catch (err) {
    console.error('Error fetching invoices:', err);
    toast('Failed to load invoices', true);
  }
}

function renderInvoicesTable() {
  const tbody = document.getElementById('invoicesTableBody');
  if (!tbody) return;

  if (allInvoicesList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--ink-soft);">No invoices found.</td></tr>';
    return;
  }

  tbody.innerHTML = allInvoicesList.map(s => {
    let retBadge = '';
    if (s.return_status === 'full') {
      retBadge = '<span class="badge-return full">FULL RETURN</span>';
    } else if (s.return_status === 'partial') {
      retBadge = '<span class="badge-return partial">PARTIAL RETURN</span>';
    }

    return `
      <tr>
        <td class="mono" style="font-weight:700; color:var(--copper);">#${escapeHtml(s.invoice_number)}</td>
        <td class="mono">${new Date(s.created_at).toLocaleDateString()}</td>
        <td>
          <strong>${escapeHtml(s.customer_name)}</strong>
          ${s.customer_phone ? `<div style="font-size:0.75rem; color:var(--ink-soft);">${escapeHtml(s.customer_phone)}</div>` : ''}
        </td>
        <td><small style="color:var(--ink-soft);">${escapeHtml(s.items_summary || '')}</small></td>
        <td class="mono right" style="font-weight:600;">Rs ${s.total.toLocaleString()}</td>
        <td>
          <span class="status-badge ${s.payment_status === 'paid' ? 'paid' : 'pending'}">${escapeHtml(s.payment_status)}</span>
          ${retBadge}
        </td>
        <td style="white-space:nowrap;">
          <button class="icon-btn" onclick="openInvoiceModal(${s.id})" title="View / Print Invoice">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="icon-btn" onclick="openReturnModal('${escapeHtml(s.invoice_number)}')" title="Process Return / Refund" style="color:var(--copper);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

async function loadReturnsList() {
  try {
    const data = await API.get('/api/returns?limit=100');
    allReturnsList = data.returns || [];
    renderReturnsTable();
  } catch (err) {
    console.error('Error fetching returns:', err);
    toast('Failed to load returns list', true);
  }
}

function renderReturnsTable() {
  const tbody = document.getElementById('returnsTableBody');
  if (!tbody) return;

  if (allReturnsList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--ink-soft);">No returns processed yet.</td></tr>';
    return;
  }

  tbody.innerHTML = allReturnsList.map(r => `
    <tr>
      <td class="mono" style="font-weight:700; color:var(--danger);">#${escapeHtml(r.return_number)}</td>
      <td class="mono" style="color:var(--copper);">#${escapeHtml(r.invoice_number)}</td>
      <td class="mono">${new Date(r.created_at).toLocaleDateString()}</td>
      <td>${escapeHtml(r.customer_name || 'Walk-in')}</td>
      <td class="mono right" style="font-weight:700; color:var(--danger);">Rs ${r.total_refund.toLocaleString()}</td>
      <td>${escapeHtml(r.reason || 'Customer Return')}</td>
      <td class="mono" style="font-size:0.75rem; color:var(--ink-soft);">${escapeHtml(r.creator_name || 'Staff')}</td>
    </tr>
  `).join('');
}

async function openReturnModal(invoiceNumber) {
  try {
    const data = await API.get(`/api/sales/${encodeURIComponent(invoiceNumber)}`);
    const sale = data.sale;
    if (!sale) {
      toast('Invoice not found', true);
      return;
    }

    currentReturnInvoice = sale;
    document.getElementById('returnModalInvoiceNum').textContent = `#${sale.invoice_number}`;
    document.getElementById('returnModalCustomer').textContent = sale.customer_name;
    document.getElementById('returnModalDate').textContent = new Date(sale.created_at).toLocaleDateString();
    document.getElementById('returnReasonInput').value = 'Customer returned product (warranty/change of mind)';

    const itemsContainer = document.getElementById('returnModalItems');
    itemsContainer.innerHTML = sale.items.map(it => {
      const eligible = it.quantity - (it.returned_quantity || 0);
      const isEligible = eligible > 0;

      return `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--panel-line); font-size:0.85rem;">
          <div>
            <strong>${escapeHtml(it.product_name)}</strong>
            <div class="mono" style="font-size:0.72rem; color:var(--ink-soft);">${escapeHtml(it.sku)} · Sold: ${it.quantity} (Returned: ${it.returned_quantity || 0})</div>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="mono">Rs ${it.unit_price.toLocaleString()}</span>
            <input type="number" 
              class="return-qty-input" 
              data-item-id="${it.id}" 
              data-unit-price="${it.unit_price}" 
              min="0" 
              max="${eligible}" 
              value="0" 
              ${!isEligible ? 'disabled' : ''} 
              style="width:60px; padding:4px 6px; text-align:center; border:1px solid var(--panel-line); border-radius:6px; font-family:var(--font-mono);"
              onchange="calculateReturnTotal()"
            >
          </div>
        </div>
      `;
    }).join('');

    calculateReturnTotal();
    openModal('returnModal');
  } catch (err) {
    toast(err.message, true);
  }
}

function calculateReturnTotal() {
  const inputs = document.querySelectorAll('.return-qty-input');
  let totalRefund = 0;
  inputs.forEach(inp => {
    const qty = parseInt(inp.value, 10) || 0;
    const price = parseFloat(inp.dataset.unitPrice) || 0;
    totalRefund += qty * price;
  });

  const totalEl = document.getElementById('returnTotalRefund');
  if (totalEl) totalEl.textContent = `Rs ${totalRefund.toLocaleString()}`;
}

async function submitReturn() {
  if (!currentReturnInvoice) return;

  const inputs = document.querySelectorAll('.return-qty-input');
  const returnItems = [];

  inputs.forEach(inp => {
    const qty = parseInt(inp.value, 10) || 0;
    const saleItemId = parseInt(inp.dataset.itemId, 10);
    if (qty > 0 && saleItemId) {
      returnItems.push({
        sale_item_id: saleItemId,
        quantity: qty
      });
    }
  });

  if (returnItems.length === 0) {
    toast('Please enter a return quantity for at least one item', true);
    return;
  }

  const reason = (document.getElementById('returnReasonInput')?.value || '').trim();

  try {
    const result = await API.post('/api/returns', {
      invoice_number: currentReturnInvoice.invoice_number,
      items: returnItems,
      reason: reason || 'Customer Return'
    });

    toast(`Return #${result.return.return_number} processed! Stock restored.`);
    closeModal('returnModal');
    loadInvoicesScreen();
    if (typeof loadInventory === 'function') {
      loadInventory();
    }
  } catch (err) {
    toast(err.message, true);
  }
}
