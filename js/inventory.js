// Inventory Management Module
let inventoryProducts = [];
let activeCategory = 'All';
let inventorySearchTerm = '';
let quickAdjustProductId = null;

const productIcons = {
  cpu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="6" y="6" width="12" height="12" rx="1"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/></svg>',
  chip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 4v-1M16 4v-1M8 21v-1M16 21v-1"/></svg>',
  res: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 12h3l1.5-4 3 8 3-8 3 8 1.5-4H22"/></svg>',
  sen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M22 12h-3M5 12H2M19 5l-2 2M7 17l-2 2M19 19l-2-2M7 7 5 5"/></svg>',
  disp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="12" rx="1"/><path d="M8 21h8"/></svg>'
};

function getProductIcon(iconName) {
  return productIcons[iconName] || productIcons.chip;
}

function stockPill(stock, threshold = 8) {
  if (stock === 0) return '<span class="pill out">Out of stock</span>';
  if (stock <= threshold) return `<span class="pill low">${stock} left</span>`;
  return `<span class="pill ok">${stock} in stock</span>`;
}

async function loadInventory() {
  try {
    let url = '/api/products?';
    if (activeCategory && activeCategory !== 'All' && activeCategory !== 'All Categories') {
      url += `category=${encodeURIComponent(activeCategory)}&`;
    }
    if (inventorySearchTerm) {
      url += `search=${encodeURIComponent(inventorySearchTerm)}&`;
    }

    const [prodData, valData] = await Promise.all([
      API.get(url),
      API.get('/api/products/valuation')
    ]);

    inventoryProducts = prodData.products || [];
    renderInventoryTable();
    populateQuickStockDropdown();
    renderValuationStrip(valData.valuation);
  } catch (err) {
    toast('Failed to load inventory: ' + err.message, true);
  }
}

function renderValuationStrip(v) {
  if (!v) return;
  const skusEl = document.getElementById('valTotalSkus');
  const unitsEl = document.getElementById('valTotalUnits');
  const costEl = document.getElementById('valAssetCost');
  const retailEl = document.getElementById('valRetailValue');
  const marginEl = document.getElementById('valPotentialMargin');

  if (skusEl) skusEl.textContent = v.total_skus || 0;
  if (unitsEl) unitsEl.textContent = (v.total_units || 0).toLocaleString();
  if (costEl) costEl.textContent = `Rs ${(v.asset_value_cost || 0).toLocaleString()}`;
  if (retailEl) retailEl.textContent = `Rs ${(v.retail_value || 0).toLocaleString()}`;
  if (marginEl) marginEl.textContent = `${v.potential_margin_pct || 0}%`;
}

function renderInventoryTable() {
  const tbody = document.getElementById('inventoryTable');
  if (!tbody) return;

  if (inventoryProducts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding:32px; color:var(--ink-soft);">
          No products found matching the criteria.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = inventoryProducts.map(p => `
    <tr>
      <td>
        <div class="prod-cell">
          <div class="prod-thumb">${getProductIcon(p.icon)}</div>
          <div>
            <div class="prod-name" style="cursor:pointer;" onclick="openProductDetailsModal(${p.id})">${escapeHtml(p.name)}</div>
            <div class="prod-cat">${escapeHtml(p.category)}</div>
          </div>
        </div>
      </td>
      <td class="mono">${escapeHtml(p.sku)}</td>
      <td class="mono" style="font-size:0.75rem; color:var(--ink-soft);">${escapeHtml(p.barcode || '—')}</td>
      <td>${escapeHtml(p.category)}</td>
      <td class="mono right" style="font-weight:600;">Rs ${p.selling_price.toLocaleString()}</td>
      <td class="mono right">${p.stock_quantity}</td>
      <td>${stockPill(p.stock_quantity, p.low_stock_threshold)}</td>
      <td style="white-space:nowrap;">
        <button class="icon-btn" onclick="openProductDetailsModal(${p.id})" title="View Details & Stock History">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </button>
        <button class="icon-btn admin-only" onclick="openEditProductModal(${p.id})" title="Edit Product">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>
        </button>
        <button class="icon-btn danger admin-only" onclick="deleteProduct(${p.id}, '${escapeHtml(p.sku)}')" title="Deactivate Product">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
        </button>
      </td>
    </tr>
  `).join('');
}

function handleInventorySearch(term) {
  inventorySearchTerm = term;
  loadInventory();
}

function filterByCategory(catName, btn) {
  activeCategory = catName;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  if (btn) btn.classList.add('active');
  loadInventory();
}

// Product Details & History Modal
async function openProductDetailsModal(id) {
  try {
    const data = await API.get(`/api/products/${id}/history`);
    const p = data.product;
    const history = data.history || [];

    document.getElementById('pdmName').textContent = p.name;
    document.getElementById('pdmSku').textContent = p.sku;
    document.getElementById('pdmBarcode').textContent = p.barcode || 'None';
    document.getElementById('pdmCategory').textContent = p.category;
    document.getElementById('pdmSellingPrice').textContent = `Rs ${p.selling_price.toLocaleString()}`;
    document.getElementById('pdmCostPrice').textContent = `Rs ${(p.cost_price || 0).toLocaleString()}`;
    document.getElementById('pdmCurrentStock').textContent = `${p.stock_quantity} units`;
    document.getElementById('pdmThreshold').textContent = `${p.low_stock_threshold} units`;
    document.getElementById('pdmDescription').textContent = p.description || 'No description provided.';

    const histTbody = document.getElementById('pdmHistoryTable');
    if (history.length === 0) {
      histTbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:16px; color:var(--ink-soft);">No movement records yet.</td></tr>';
    } else {
      histTbody.innerHTML = history.map(h => `
        <tr>
          <td class="mono" style="font-size:0.75rem; color:var(--ink-soft);">${new Date(h.created_at).toLocaleDateString()}</td>
          <td><span style="font-size:0.75rem; text-transform:uppercase; font-weight:700;">${escapeHtml(h.reason)}</span></td>
          <td class="mono right" style="font-weight:700; color:${h.quantity_change > 0 ? 'var(--trace)' : 'var(--danger)'};">
            ${h.quantity_change > 0 ? '+' : ''}${h.quantity_change}
          </td>
          <td class="mono right">${h.new_quantity}</td>
          <td class="mono" style="font-size:0.75rem; color:var(--copper);">${escapeHtml(h.reference_id || '—')}</td>
        </tr>
      `).join('');
    }

    openModal('productDetailsModal');
  } catch (err) {
    toast('Error fetching product history: ' + err.message, true);
  }
}

// Add Product Modal Handler
async function saveProduct() {
  const name = document.getElementById('addProdName').value.trim();
  const sku = document.getElementById('addProdSku').value.trim();
  const barcode = (document.getElementById('addProdBarcode')?.value || '').trim();
  const category = document.getElementById('addProdCat').value;
  const price = parseFloat(document.getElementById('addProdPrice').value);
  const cost = parseFloat(document.getElementById('addProdCost').value) || 0;
  const stock = parseInt(document.getElementById('addProdStock').value) || 0;
  const threshold = parseInt(document.getElementById('addProdThreshold').value) || 8;
  const icon = document.getElementById('addProdIcon').value || 'chip';
  const description = (document.getElementById('addProdDesc')?.value || '').trim();

  if (!name || !sku || isNaN(price)) {
    toast('Please fill all required fields correctly', true);
    return;
  }

  try {
    await API.post('/api/products', {
      name,
      sku,
      barcode,
      category,
      selling_price: price,
      cost_price: cost,
      stock_quantity: stock,
      low_stock_threshold: threshold,
      icon,
      description
    });

    closeModal('addProductModal');
    toast(`Product ${sku} added successfully`);
    
    // Clear inputs
    document.getElementById('addProdName').value = '';
    document.getElementById('addProdSku').value = '';
    if (document.getElementById('addProdBarcode')) document.getElementById('addProdBarcode').value = '';
    document.getElementById('addProdPrice').value = '';
    document.getElementById('addProdStock').value = '';

    loadInventory();
  } catch (err) {
    toast(err.message, true);
  }
}

// Edit Product Modal Handlers
async function openEditProductModal(id) {
  try {
    const data = await API.get(`/api/products/${id}`);
    const p = data.product;
    if (!p) return;

    document.getElementById('editProdId').value = p.id;
    document.getElementById('editProdName').value = p.name;
    document.getElementById('editProdSku').value = p.sku;
    if (document.getElementById('editProdBarcode')) {
      document.getElementById('editProdBarcode').value = p.barcode || '';
    }
    document.getElementById('editProdCat').value = p.category;
    document.getElementById('editProdPrice').value = p.selling_price;
    document.getElementById('editProdCost').value = p.cost_price || 0;
    document.getElementById('editProdThreshold').value = p.low_stock_threshold || 8;
    document.getElementById('editProdIcon').value = p.icon || 'chip';
    document.getElementById('editProdStatus').value = p.status || 'active';
    if (document.getElementById('editProdDesc')) {
      document.getElementById('editProdDesc').value = p.description || '';
    }

    openModal('editProductModal');
  } catch (err) {
    toast('Failed to load product: ' + err.message, true);
  }
}

async function saveEditProduct() {
  const id = document.getElementById('editProdId').value;
  const name = document.getElementById('editProdName').value.trim();
  const sku = document.getElementById('editProdSku').value.trim();
  const barcode = (document.getElementById('editProdBarcode')?.value || '').trim();
  const category = document.getElementById('editProdCat').value;
  const price = parseFloat(document.getElementById('editProdPrice').value);
  const cost = parseFloat(document.getElementById('editProdCost').value) || 0;
  const threshold = parseInt(document.getElementById('editProdThreshold').value) || 8;
  const icon = document.getElementById('editProdIcon').value;
  const status = document.getElementById('editProdStatus').value;
  const description = (document.getElementById('editProdDesc')?.value || '').trim();

  if (!name || !sku || isNaN(price)) {
    toast('Please fill all required fields correctly', true);
    return;
  }

  try {
    await API.put(`/api/products/${id}`, {
      name,
      sku,
      barcode,
      category,
      selling_price: price,
      cost_price: cost,
      low_stock_threshold: threshold,
      icon,
      status,
      description
    });

    closeModal('editProductModal');
    toast(`Product ${sku} updated successfully`);
    loadInventory();
  } catch (err) {
    toast(err.message, true);
  }
}

// Delete / Deactivate Product
async function deleteProduct(id, sku) {
  if (!confirm(`Are you sure you want to deactivate product ${sku}?`)) {
    return;
  }

  try {
    await API.del(`/api/products/${id}`);
    toast(`Product ${sku} deactivated`);
    loadInventory();
  } catch (err) {
    toast(err.message, true);
  }
}

// Quick Stock Adjustment
function populateQuickStockDropdown() {
  const select = document.getElementById('quickStockSelect');
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = inventoryProducts.map(p => `
    <option value="${p.id}" ${p.id == currentVal ? 'selected' : ''}>
      ${escapeHtml(p.name)} · ${escapeHtml(p.sku)} (Current: ${p.stock_quantity})
    </option>
  `).join('');

  if (inventoryProducts.length > 0 && !currentVal) {
    select.value = inventoryProducts[0].id;
    updateQuickStockInput(inventoryProducts[0].stock_quantity);
  } else {
    const selected = inventoryProducts.find(p => p.id == select.value);
    if (selected) updateQuickStockInput(selected.stock_quantity);
  }
}

function onQuickStockProductChange() {
  const select = document.getElementById('quickStockSelect');
  const selected = inventoryProducts.find(p => p.id == select.value);
  if (selected) {
    updateQuickStockInput(selected.stock_quantity);
  }
}

function updateQuickStockInput(qty) {
  const input = document.getElementById('quickStockInput');
  if (input) input.value = qty;
}

function adjustQuickStock(delta) {
  const input = document.getElementById('quickStockInput');
  if (!input) return;
  const current = parseInt(input.value) || 0;
  input.value = Math.max(0, current + delta);
}

async function saveQuickStockAdjustment() {
  const select = document.getElementById('quickStockSelect');
  const input = document.getElementById('quickStockInput');
  const reasonSelect = document.getElementById('quickStockReason');
  if (!select || !input) return;

  const prodId = select.value;
  const newStock = parseInt(input.value);
  const reason = reasonSelect ? reasonSelect.value : 'manual_adjustment';

  if (!prodId || isNaN(newStock) || newStock < 0) {
    toast('Please select a valid product and stock quantity', true);
    return;
  }

  try {
    await API.post(`/api/products/${prodId}/stock-adjustment`, {
      new_stock: newStock,
      reason
    });
    toast(`Stock updated to ${newStock}`);
    loadInventory();
  } catch (err) {
    toast(err.message, true);
  }
}
