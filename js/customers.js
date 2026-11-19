// CompStock Customers Module
let customersList = [];
let currentCustomerFilter = '';
let currentCustomerStatusFilter = 'all';

async function loadCustomers() {
  try {
    let url = '/api/customers?';
    if (currentCustomerFilter) {
      url += `search=${encodeURIComponent(currentCustomerFilter)}&`;
    }
    if (currentCustomerStatusFilter && currentCustomerStatusFilter !== 'all') {
      url += `status=${encodeURIComponent(currentCustomerStatusFilter)}&`;
    }
    const data = await API.get(url);
    customersList = data.customers || [];
    renderCustomersTable();
  } catch (err) {
    console.error('Error loading customers:', err);
    toast('Failed to load customers: ' + err.message, true);
  }
}

function renderCustomersTable() {
  const tbody = document.getElementById('customersTable');
  if (!tbody) return;

  if (customersList.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding:32px; color:var(--ink-soft);">
          No customers found. Click "+ Add Customer" to register one.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = customersList.map(c => {
    const isActive = c.status !== 'inactive';
    const statusBadge = isActive 
      ? '<span class="status-badge paid">Active</span>' 
      : '<span class="status-badge inactive">Inactive</span>';

    return `
      <tr>
        <td class="mono" style="font-weight:700; color:var(--copper);">#C-${c.id}</td>
        <td>
          <div style="font-weight:600; color:var(--ink);">${escapeHtml(c.name)}</div>
          ${c.company ? `<div style="font-size:0.75rem; color:var(--ink-soft);">${escapeHtml(c.company)}</div>` : ''}
        </td>
        <td class="mono">${escapeHtml(c.phone || '—')}</td>
        <td>${escapeHtml(c.email || '—')}</td>
        <td style="font-size:0.8rem; color:var(--ink-soft);">${escapeHtml(c.address || '—')}</td>
        <td>${statusBadge}</td>
        <td class="mono right" style="font-weight:600; color:var(--copper);">Rs ${(c.total_spent || 0).toLocaleString()} <small style="color:var(--ink-soft);">(${c.total_orders || 0} orders)</small></td>
        <td style="white-space:nowrap;">
          <button class="icon-btn" onclick="viewCustomerHistory(${c.id})" title="Purchase History">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </button>
          <button class="icon-btn" onclick="openEditCustomerModal(${c.id})" title="Edit Details">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>
          </button>
          <button class="icon-btn danger admin-only" onclick="deactivateCustomer(${c.id}, '${escapeHtml(c.name)}')" title="Deactivate / Remove">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function handleCustomerSearch(term) {
  currentCustomerFilter = term.trim();
  loadCustomers();
}

function filterCustomersByStatus(statusVal) {
  currentCustomerStatusFilter = statusVal;
  loadCustomers();
}

function openAddCustomerModal() {
  document.getElementById('custModalTitle').textContent = 'Add New Customer';
  document.getElementById('custFormId').value = '';
  document.getElementById('custFormName').value = '';
  document.getElementById('custFormPhone').value = '';
  document.getElementById('custFormEmail').value = '';
  document.getElementById('custFormAddress').value = '';
  if (document.getElementById('custFormCompany')) {
    document.getElementById('custFormCompany').value = '';
  }
  if (document.getElementById('custFormStatus')) {
    document.getElementById('custFormStatus').value = 'active';
  }
  openModal('customerModal');
}

function openEditCustomerModal(id) {
  const c = customersList.find(item => item.id === id);
  if (!c) return;

  document.getElementById('custModalTitle').textContent = 'Edit Customer';
  document.getElementById('custFormId').value = c.id;
  document.getElementById('custFormName').value = c.name || '';
  document.getElementById('custFormPhone').value = c.phone || '';
  document.getElementById('custFormEmail').value = c.email || '';
  document.getElementById('custFormAddress').value = c.address || '';
  if (document.getElementById('custFormCompany')) {
    document.getElementById('custFormCompany').value = c.company || '';
  }
  if (document.getElementById('custFormStatus')) {
    document.getElementById('custFormStatus').value = c.status || 'active';
  }
  openModal('customerModal');
}

async function saveCustomerForm() {
  const id = document.getElementById('custFormId').value;
  const name = document.getElementById('custFormName').value.trim();
  const phone = document.getElementById('custFormPhone').value.trim();
  const email = document.getElementById('custFormEmail').value.trim();
  const address = document.getElementById('custFormAddress').value.trim();
  const company = document.getElementById('custFormCompany')?.value.trim() || '';
  const status = document.getElementById('custFormStatus')?.value || 'active';

  if (!name) {
    toast('Customer name is required', true);
    return;
  }

  const payload = { name, phone, email, address, company, status };

  try {
    let savedCustomer = null;
    if (id) {
      const res = await API.put(`/api/customers/${id}`, payload);
      savedCustomer = res.customer;
      toast('Customer updated successfully');
    } else {
      const res = await API.post('/api/customers', payload);
      savedCustomer = res.customer;
      toast('Customer registered successfully');
    }
    closeModal('customerModal');
    loadCustomers();

    // If POS customer dropdown exists, refresh it and auto-select this customer!
    if (typeof loadCustomerOptionsInPos === 'function') {
      await loadCustomerOptionsInPos();
      if (savedCustomer) {
        if (typeof selectPosCustomer === 'function') {
          selectPosCustomer(savedCustomer);
        }
        const posSel = document.getElementById('posCustomerSelect');
        if (posSel) posSel.value = savedCustomer.id;
      }
    }
  } catch (err) {
    toast(err.message, true);
  }
}

async function deactivateCustomer(id, name) {
  if (!confirm(`Are you sure you want to deactivate or remove customer "${name}"?`)) return;

  try {
    const res = await API.del(`/api/customers/${id}`);
    toast(res.message || 'Customer updated');
    loadCustomers();
    if (typeof loadCustomerOptionsInPos === 'function') {
      loadCustomerOptionsInPos();
    }
  } catch (err) {
    toast(err.message, true);
  }
}

async function viewCustomerHistory(id) {
  try {
    const data = await API.get(`/api/customers/${id}/purchases`);
    const c = data.customer;
    const sales = data.sales || [];
    const items = data.items_purchased || [];

    document.getElementById('custHistName').textContent = c.name;
    document.getElementById('custHistPhone').textContent = c.phone || 'No phone';
    document.getElementById('custHistTotalSpent').textContent = `Rs ${(c.total_spent || 0).toLocaleString()}`;
    document.getElementById('custHistOrderCount').textContent = `${c.total_orders || 0} orders`;

    const salesTbody = document.getElementById('custHistSalesTable');
    if (sales.length === 0) {
      salesTbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:16px; color:var(--ink-soft);">No purchases yet.</td></tr>';
    } else {
      salesTbody.innerHTML = sales.map(s => `
        <tr style="cursor:pointer;" onclick="openInvoiceModal(${s.id})">
          <td class="mono" style="color:var(--copper); font-weight:600;">#${s.invoice_number}</td>
          <td class="mono">${new Date(s.created_at).toLocaleDateString()}</td>
          <td>${escapeHtml(s.items_summary || '')}</td>
          <td class="mono right" style="font-weight:600;">Rs ${s.total.toLocaleString()}</td>
        </tr>
      `).join('');
    }

    const itemsTbody = document.getElementById('custHistItemsTable');
    if (items.length === 0) {
      itemsTbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:16px; color:var(--ink-soft);">No items recorded.</td></tr>';
    } else {
      itemsTbody.innerHTML = items.map(it => `
        <tr>
          <td><strong>${escapeHtml(it.product_name)}</strong><br><small class="mono" style="color:var(--ink-soft);">${escapeHtml(it.sku)}</small></td>
          <td class="mono right">${it.total_quantity}</td>
          <td class="mono right" style="font-weight:600;">Rs ${it.total_amount.toLocaleString()}</td>
        </tr>
      `).join('');
    }

    openModal('customerHistoryModal');
  } catch (err) {
    toast('Failed to load customer history: ' + err.message, true);
  }
}
