// Point of Sale / Sales Management Module
let cart = [];
let availableSaleProducts = [];
let currentSalesList = [];
let posCustomers = [];
let selectedPosCustomer = null;

async function loadSalesScreen() {
  await Promise.all([
    loadSaleProductsDropdown(),
    loadRecentSales(),
    loadCustomerOptionsInPos()
  ]);
  initPosItemSearchInput();
}

async function loadSaleProductsDropdown() {
  try {
    const data = await API.get('/api/products?status=active');
    availableSaleProducts = data.products || [];

    const select = document.getElementById('productSelect');
    if (!select) return;

    if (availableSaleProducts.length === 0) {
      select.innerHTML = '<option value="">No products available</option>';
      return;
    }

    select.innerHTML = availableSaleProducts.map(p => {
      const isOutOfStock = p.stock_quantity <= 0;
      const stockText = isOutOfStock ? 'OUT OF STOCK' : `${p.stock_quantity} in stock`;
      return `
        <option value="${p.id}" ${isOutOfStock ? 'disabled' : ''}>
          ${escapeHtml(p.name)} · ${escapeHtml(p.sku)} — Rs ${p.selling_price.toLocaleString()} (${stockText})
        </option>
      `;
    }).join('');
  } catch (err) {
    console.error('Error loading products for POS:', err);
  }
}

// Item Search input bar functionality
function initPosItemSearchInput() {
  const input = document.getElementById('posItemSearchInput');
  if (!input) return;

  input.onkeydown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const term = input.value.trim().toLowerCase();
      if (!term) return;

      const match = availableSaleProducts.find(p => 
        p.name.toLowerCase() === term ||
        p.sku.toLowerCase() === term ||
        p.name.toLowerCase().includes(term) ||
        (p.barcode && p.barcode.toLowerCase() === term)
      );

      if (match) {
        if (match.stock_quantity <= 0) {
          toast(`Product "${match.name}" is out of stock`, true);
        } else {
          // Select item in catalog dropdown and focus quantity - do not auto-add!
          const select = document.getElementById('productSelect');
          if (select) select.value = match.id;
          input.value = match.name;
          const resultsBox = document.getElementById('posItemSearchResults');
          if (resultsBox) resultsBox.style.display = 'none';

          const qtyInput = document.getElementById('qtyInput');
          if (qtyInput) {
            qtyInput.value = 1;
            qtyInput.focus();
            qtyInput.select();
          }
          toast(`Selected "${match.name}". Choose quantity and click "Add to Cart".`);
        }
      } else {
        toast(`No product matching "${term}"`, true);
      }
    } else if (e.key === 'Escape') {
      const res = document.getElementById('posItemSearchResults');
      if (res) res.style.display = 'none';
    }
  };
}

function handlePosItemSearch(query) {
  const trimmed = query.trim().toLowerCase();
  const resultsBox = document.getElementById('posItemSearchResults');
  const select = document.getElementById('productSelect');

  const filteredProducts = trimmed
    ? availableSaleProducts.filter(p => 
        p.name.toLowerCase().includes(trimmed) || 
        p.sku.toLowerCase().includes(trimmed) ||
        (p.category && p.category.toLowerCase().includes(trimmed)) ||
        (p.barcode && p.barcode.toLowerCase() === trimmed)
      )
    : availableSaleProducts;

  if (select) {
    if (filteredProducts.length === 0) {
      select.innerHTML = '<option value="">No matching products</option>';
    } else {
      select.innerHTML = filteredProducts.map(p => {
        const isOutOfStock = p.stock_quantity <= 0;
        const stockText = isOutOfStock ? 'OUT OF STOCK' : `${p.stock_quantity} in stock`;
        return `
          <option value="${p.id}" ${isOutOfStock ? 'disabled' : ''}>
            ${escapeHtml(p.name)} · ${escapeHtml(p.sku)} — Rs ${p.selling_price.toLocaleString()} (${stockText})
          </option>
        `;
      }).join('');
    }
  }

  if (!resultsBox) return;

  if (!trimmed) {
    resultsBox.style.display = 'none';
    return;
  }

  if (filteredProducts.length === 0) {
    resultsBox.innerHTML = `
      <div style="padding:12px; color:var(--ink-soft); font-size:0.8rem; text-align:center;">
        No products matching "${escapeHtml(query)}"
      </div>
    `;
    resultsBox.style.display = 'block';
    return;
  }

  resultsBox.innerHTML = filteredProducts.slice(0, 8).map(p => {
    const isOut = p.stock_quantity <= 0;
    return `
      <div class="search-item" onclick="onPosItemSearchSelect(${p.id})" style="padding:8px 12px; cursor:${isOut ? 'not-allowed' : 'pointer'}; border-bottom:1px solid var(--panel-line); display:flex; justify-content:space-between; align-items:center; opacity:${isOut ? '0.6' : '1'};">
        <div>
          <div style="font-weight:600; font-size:0.83rem; color:var(--ink);">${escapeHtml(p.name)}</div>
          <div class="mono" style="font-size:0.7rem; color:var(--ink-soft);">${escapeHtml(p.sku)} · ${escapeHtml(p.category || '')}</div>
        </div>
        <div style="text-align:right;">
          <div class="mono" style="font-size:0.8rem; font-weight:700; color:var(--copper);">Rs ${p.selling_price.toLocaleString()}</div>
          <div style="font-size:0.7rem; color:${isOut ? 'var(--danger)' : 'var(--trace)'}; font-weight:600;">${isOut ? 'Out of stock' : `${p.stock_quantity} in stock`}</div>
        </div>
      </div>
    `;
  }).join('');
  resultsBox.style.display = 'block';
}

function onPosItemSearchSelect(productId) {
  const p = availableSaleProducts.find(item => item.id === productId);
  if (!p) return;

  if (p.stock_quantity <= 0) {
    toast(`Product "${p.name}" is out of stock`, true);
    return;
  }

  // Select item in catalog dropdown and focus quantity - do not auto-add!
  const select = document.getElementById('productSelect');
  if (select) select.value = p.id;

  const input = document.getElementById('posItemSearchInput');
  if (input) input.value = p.name;

  const resultsBox = document.getElementById('posItemSearchResults');
  if (resultsBox) resultsBox.style.display = 'none';

  const qtyInput = document.getElementById('qtyInput');
  if (qtyInput) {
    qtyInput.value = 1;
    qtyInput.focus();
    qtyInput.select();
  }

  toast(`Selected "${p.name}". Choose quantity and click "Add to Cart".`);
}

// Customer Combobox / Autocomplete Management
async function loadCustomerOptionsInPos() {
  try {
    const data = await API.get('/api/customers');
    // Filter out inactive customers AND remove duplicate entries for 'Walk-in Customer'
    // so Walk-in Customer only appears once as the default option!
    posCustomers = (data.customers || []).filter(c => {
      if (c.status === 'inactive') return false;
      const lower = (c.name || '').trim().toLowerCase();
      if (lower === 'walk-in customer' || lower === 'walk-in' || lower.startsWith('walk-in')) {
        return false;
      }
      return true;
    });

    // Populate fallback select if present
    const sel = document.getElementById('posCustomerSelect');
    if (sel) {
      sel.innerHTML = '<option value="">Walk-in Customer</option>' + posCustomers.map(c => `
        <option value="${c.id}">${escapeHtml(c.name)} ${c.phone ? `(${escapeHtml(c.phone)})` : ''}</option>
      `).join('');
    }

    renderPosCustomerOptions();
  } catch (err) {
    console.error('Error loading customers for POS:', err);
  }
}

function renderPosCustomerOptions(filterText = '') {
  const container = document.getElementById('posCustomerDropdownList');
  if (!container) return;

  const query = filterText.trim().toLowerCase();
  const showWalkIn = !query || 'walk-in customer'.includes(query);

  let filtered = posCustomers;
  if (query) {
    filtered = posCustomers.filter(c => 
      (c.name && c.name.toLowerCase().includes(query)) ||
      (c.phone && c.phone.toLowerCase().includes(query)) ||
      (c.company && c.company.toLowerCase().includes(query))
    );
  }

  // Limit to 10 most recent customers with scrollbar as required
  const recent10 = filtered.slice(0, 10);

  let html = '';
  if (showWalkIn) {
    const isSelected = !selectedPosCustomer;
    html += `
      <div class="combobox-item ${isSelected ? 'selected' : ''}" onclick="selectPosCustomer(null)" style="padding:10px 14px; cursor:pointer; border-bottom:1px solid var(--panel-line); display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong style="color:var(--ink); font-size:0.85rem;">Walk-in Customer</strong>
          <span style="font-size:0.75rem; color:var(--ink-soft); margin-left:6px;">(Default)</span>
        </div>
        ${isSelected ? '<span style="color:var(--copper); font-weight:700;">✓</span>' : ''}
      </div>
    `;
  }

  if (recent10.length === 0 && !showWalkIn) {
    html += `
      <div style="padding:12px 14px; color:var(--ink-soft); font-size:0.8rem; text-align:center;">
        No customers matching "${escapeHtml(filterText)}"
      </div>
    `;
  } else {
    html += recent10.map(c => {
      const isSelected = selectedPosCustomer && selectedPosCustomer.id === c.id;
      return `
        <div class="combobox-item ${isSelected ? 'selected' : ''}" onclick="selectPosCustomer(${c.id})" style="padding:10px 14px; cursor:pointer; border-bottom:1px solid var(--panel-line); display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:600; color:var(--ink); font-size:0.85rem;">${escapeHtml(c.name)}</div>
            <div style="font-size:0.72rem; color:var(--ink-soft);">
              ${c.phone ? escapeHtml(c.phone) : 'No phone'} ${c.company ? `· ${escapeHtml(c.company)}` : ''}
            </div>
          </div>
          ${isSelected ? '<span style="color:var(--copper); font-weight:700;">✓</span>' : ''}
        </div>
      `;
    }).join('');
  }

  container.innerHTML = html;
}

function selectPosCustomer(custOrId) {
  const hiddenId = document.getElementById('posCustomerId');
  const input = document.getElementById('posCustomerInput');
  const sel = document.getElementById('posCustomerSelect');

  if (!custOrId) {
    selectedPosCustomer = null;
    if (hiddenId) hiddenId.value = '';
    if (input) {
      input.value = '';
      input.placeholder = 'Walk-in Customer';
    }
    if (sel) sel.value = '';
  } else {
    const cust = typeof custOrId === 'object' ? custOrId : posCustomers.find(c => c.id === custOrId);
    if (cust) {
      selectedPosCustomer = cust;
      if (hiddenId) hiddenId.value = cust.id;
      if (input) input.value = cust.name;
      if (sel) sel.value = cust.id;
    }
  }

  closePosCustomerDropdown();
}

function openPosCustomerDropdown() {
  const dropdown = document.getElementById('posCustomerDropdownList');
  if (dropdown) {
    renderPosCustomerOptions(document.getElementById('posCustomerInput')?.value || '');
    dropdown.style.display = 'block';
  }
}

function closePosCustomerDropdown() {
  const dropdown = document.getElementById('posCustomerDropdownList');
  if (dropdown) dropdown.style.display = 'none';
}

function togglePosCustomerDropdown() {
  const dropdown = document.getElementById('posCustomerDropdownList');
  if (!dropdown) return;
  if (dropdown.style.display === 'block') {
    closePosCustomerDropdown();
  } else {
    openPosCustomerDropdown();
  }
}

function filterPosCustomerDropdown(val) {
  openPosCustomerDropdown();
  renderPosCustomerOptions(val);
}

// Global click handler to close dropdowns when clicking outside
document.addEventListener('click', (e) => {
  const combobox = document.querySelector('.pos-customer-combobox');
  if (combobox && !combobox.contains(e.target)) {
    closePosCustomerDropdown();
  }
  const itemSearchWrap = document.getElementById('posItemSearchWrap');
  if (itemSearchWrap && !itemSearchWrap.contains(e.target)) {
    const res = document.getElementById('posItemSearchResults');
    if (res) res.style.display = 'none';
  }
});

async function loadRecentSales() {
  try {
    const data = await API.get('/api/sales?limit=25');
    currentSalesList = data.sales || [];
    renderRecentSalesTable();

    const countLabel = document.getElementById('salesTodayCount');
    if (countLabel) {
      const today = new Date().toISOString().split('T')[0];
      const todaySales = currentSalesList.filter(s => s.created_at.startsWith(today));
      countLabel.textContent = `${todaySales.length} today`;
    }
  } catch (err) {
    console.error('Error loading sales:', err);
  }
}

function renderRecentSalesTable() {
  const tbody = document.getElementById('recentSalesTable');
  if (!tbody) return;

  if (currentSalesList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:24px; color:var(--ink-soft);">No sales recorded yet.</td></tr>';
    return;
  }

  tbody.innerHTML = currentSalesList.map(s => {
    const dateObj = new Date(s.created_at);
    const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const statusClass = s.payment_status === 'paid' ? 'paid' : 'pending';

    let retTag = '';
    if (s.return_status === 'full') {
      retTag = ' · <span style="color:var(--danger); font-size:0.7rem; font-weight:700;">RETURNED</span>';
    } else if (s.return_status === 'partial') {
      retTag = ' · <span style="color:var(--amber); font-size:0.7rem; font-weight:700;">PART-RETURN</span>';
    }

    return `
      <tr style="cursor:pointer;" onclick="openInvoiceModal(${s.id})" title="Click to view invoice">
        <td class="mono" style="color:var(--copper); font-weight:600;">#${escapeHtml(s.invoice_number)}</td>
        <td class="mono">${dateStr}</td>
        <td>${escapeHtml(s.customer_name)}${retTag}</td>
        <td class="mono right">Rs ${s.total.toLocaleString()}</td>
        <td><span class="status-badge ${statusClass}">${escapeHtml(s.payment_status)}</span></td>
      </tr>
    `;
  }).join('');
}

function handleSalesSearch(term) {
  if (!term || !term.trim()) {
    loadRecentSales();
    return;
  }
  API.get(`/api/sales?search=${encodeURIComponent(term)}`)
    .then(data => {
      currentSalesList = data.sales || [];
      renderRecentSalesTable();
    })
    .catch(err => console.error('Sales search error:', err));
}

function addToCart() {
  const sel = document.getElementById('productSelect');
  const qtyInput = document.getElementById('qtyInput');
  if (!sel || !qtyInput) return;

  const prodId = parseInt(sel.value);
  const qty = parseInt(qtyInput.value) || 1;

  if (!prodId) {
    toast('Please select a product', true);
    return;
  }

  const p = availableSaleProducts.find(item => item.id === prodId);
  if (!p) return;

  if (p.stock_quantity <= 0) {
    toast(`Product "${p.name}" is out of stock`, true);
    return;
  }

  addProductToCart(p, qty);
  qtyInput.value = 1;
}

function addProductToCart(product, qty) {
  const existing = cart.find(c => c.product_id === product.id);
  const currentInCart = existing ? existing.quantity : 0;

  if (currentInCart + qty > product.stock_quantity) {
    toast(`Only ${product.stock_quantity} available in stock for "${product.name}"`, true);
    return;
  }

  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({
      product_id: product.id,
      name: product.name,
      sku: product.sku,
      unit_price: product.selling_price,
      max_stock: product.stock_quantity,
      quantity: qty
    });
  }

  renderCart();
}

function adjustCartQty(index, delta) {
  if (!cart[index]) return;
  const newQty = cart[index].quantity + delta;
  if (newQty <= 0) {
    cart.splice(index, 1);
  } else if (newQty > cart[index].max_stock) {
    toast(`Cannot exceed available stock (${cart[index].max_stock})`, true);
  } else {
    cart[index].quantity = newQty;
  }
  renderCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

function clearCart() {
  cart = [];
  renderCart();
}

function calculateCartTotals() {
  const subtotal = cart.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);

  const discType = document.getElementById('posDiscountType')?.value || 'fixed';
  const discVal = parseFloat(document.getElementById('posDiscountValue')?.value) || 0;

  let discount = 0;
  if (discType === 'percentage') {
    discount = Math.min(subtotal, (subtotal * discVal) / 100);
  } else {
    discount = Math.min(subtotal, discVal);
  }

  const total = Math.max(0, subtotal - discount);

  const amountPaidInput = document.getElementById('posAmountPaid');
  const amountPaid = parseFloat(amountPaidInput?.value) || 0;
  const change = amountPaid > 0 ? Math.max(0, amountPaid - total) : 0;

  return { subtotal, discount, total, amountPaid, change, discType, discVal };
}

function setCartQty(index, newQty) {
  if (!cart[index]) return;
  const val = parseInt(newQty);
  if (isNaN(val) || val <= 0) return;
  if (val > cart[index].max_stock) {
    toast(`Only ${cart[index].max_stock} units available in stock for "${cart[index].name}"`, true);
    cart[index].quantity = cart[index].max_stock;
  } else {
    cart[index].quantity = val;
  }
  renderCart();
}

function renderCart() {
  const container = document.getElementById('cartItems');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="padding:28px 18px; text-align:center; color:var(--ink-soft); font-size:0.85rem;">
        Cart is empty. Type to search items or select from catalog above.
      </div>
    `;
    updateCartTotalsDisplay(0, 0, 0, 0);
    return;
  }

  container.innerHTML = cart.map((item, idx) => `
    <div class="cart-item">
      <div style="flex:1; padding-right:12px;">
        <div style="font-weight:600; font-size:0.88rem;">${escapeHtml(item.name)}</div>
        <div class="mono" style="font-size:0.72rem; color:var(--ink-soft);">${escapeHtml(item.sku)} · Rs ${item.unit_price.toLocaleString()} each</div>
      </div>
      <div style="display:flex; align-items:center; gap:6px;">
        <button type="button" class="icon-btn" style="width:26px; height:26px; font-weight:bold; cursor:pointer;" onclick="adjustCartQty(${idx}, -1)" title="Decrease">−</button>
        <input type="number" class="mono" min="1" max="${item.max_stock}" value="${item.quantity}" oninput="setCartQty(${idx}, this.value)" onchange="setCartQty(${idx}, this.value)" style="width:52px; height:28px; text-align:center; font-weight:700; border:1.5px solid var(--panel-line); border-radius:6px; background:var(--bg); color:var(--ink); padding:0 2px;" title="Type quantity directly">
        <button type="button" class="icon-btn" style="width:26px; height:26px; font-weight:bold; cursor:pointer;" onclick="adjustCartQty(${idx}, 1)" title="Increase">+</button>
        <span class="mono" style="min-width:70px; text-align:right; font-weight:600; margin-left:4px;">Rs ${(item.unit_price * item.quantity).toLocaleString()}</span>
        <button class="cart-remove" onclick="removeFromCart(${idx})" title="Remove item" style="padding:4px; margin-left:6px; font-size:0.9rem;">✕</button>
      </div>
    </div>
  `).join('');

  const totals = calculateCartTotals();
  updateCartTotalsDisplay(totals.subtotal, totals.discount, totals.total, totals.change);
}

function updateCartTotalsDisplay(subtotal, discount, total, change) {
  const subEl = document.getElementById('cartSubtotal');
  const discEl = document.getElementById('cartDiscount');
  const totEl = document.getElementById('cartTotal');
  const changeEl = document.getElementById('posChangeDue');

  if (subEl) subEl.textContent = `Rs ${subtotal.toLocaleString()}`;
  if (discEl) discEl.textContent = discount > 0 ? `- Rs ${discount.toLocaleString()}` : 'Rs 0';
  if (totEl) totEl.textContent = `Rs ${total.toLocaleString()}`;
  if (changeEl) changeEl.textContent = `Rs ${change.toLocaleString()}`;
}

function onPosDiscountOrTenderChange() {
  const totals = calculateCartTotals();
  updateCartTotalsDisplay(totals.subtotal, totals.discount, totals.total, totals.change);
}

let isSubmittingSale = false;

async function confirmSale() {
  if (isSubmittingSale) return;

  if (cart.length === 0) {
    toast('Cart is empty. Add products to confirm sale.', true);
    return;
  }

  const confirmBtn = document.getElementById('posConfirmSaleBtn') || document.querySelector('#cartPanel button.btn-primary');
  if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.dataset.origText = confirmBtn.textContent;
    confirmBtn.textContent = 'Processing...';
  }
  isSubmittingSale = true;

  try {
    const totals = calculateCartTotals();
    const hiddenCustId = document.getElementById('posCustomerId');
    const custId = selectedPosCustomer ? selectedPosCustomer.id : (hiddenCustId && hiddenCustId.value ? parseInt(hiddenCustId.value) : null);
    const custName = selectedPosCustomer ? selectedPosCustomer.name : (document.getElementById('posCustomerInput')?.value.trim() || 'Walk-in Customer');
    const paymentMethod = document.getElementById('posPaymentMethod')?.value || 'cash';

    const payload = {
      customer_id: custId,
      customer_name: custName,
      payment_method: paymentMethod,
      payment_status: 'paid',
      discount_type: totals.discType,
      discount_rate: totals.discType === 'percentage' ? totals.discVal : 0,
      discount: totals.discount,
      amount_paid: totals.amountPaid > 0 ? totals.amountPaid : totals.total,
      items: cart.map(i => ({
        product_id: i.product_id,
        quantity: i.quantity
      }))
    };

    const data = await API.post('/api/sales', payload);
    const sale = data.sale;

    toast(`Sale confirmed! Invoice #${sale.invoice_number}`);
    clearCart();
    selectPosCustomer(null);
    
    // Reset inputs
    if (document.getElementById('posAmountPaid')) document.getElementById('posAmountPaid').value = '';
    if (document.getElementById('posDiscountValue')) document.getElementById('posDiscountValue').value = '0';

    await Promise.all([
      loadSaleProductsDropdown(),
      loadRecentSales()
    ]);

    // Open printable invoice modal
    openInvoiceModal(sale.id);
  } catch (err) {
    console.error('Sale confirmation error:', err);
    toast(err.message || 'Failed to complete sale', true);
  } finally {
    isSubmittingSale = false;
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.textContent = confirmBtn.dataset.origText || 'Confirm & Generate Invoice';
    }
  }
}

// Invoice details modal view
async function openInvoiceModal(saleId) {
  try {
    const data = await API.get(`/api/sales/${saleId}`);
    const s = data.sale;
    if (!s) return;

    document.getElementById('invModalNumber').textContent = `#${s.invoice_number}`;
    document.getElementById('invModalDate').textContent = new Date(s.created_at).toLocaleString();
    document.getElementById('invModalCustomer').textContent = s.customer_name;
    document.getElementById('invModalStaff').textContent = s.creator_name || 'Staff';
    document.getElementById('invModalMethod').textContent = (s.payment_method || 'CASH').toUpperCase();

    const itemsTbody = document.getElementById('invModalItems');
    itemsTbody.innerHTML = (s.items || []).map(it => `
      <tr>
        <td>
          <strong>${escapeHtml(it.product_name)}</strong><br>
          <small class="mono" style="color:var(--ink-soft);">${escapeHtml(it.sku)}</small>
          ${it.returned_quantity > 0 ? `<br><small style="color:var(--danger); font-weight:700;">(${it.returned_quantity} returned)</small>` : ''}
        </td>
        <td class="mono right">Rs ${it.unit_price.toLocaleString()}</td>
        <td class="mono right">${it.quantity}</td>
        <td class="mono right" style="font-weight:600;">Rs ${it.line_total.toLocaleString()}</td>
      </tr>
    `).join('');

    let totalsHtml = `
      <div style="font-size:0.85rem; padding:6px 0; border-top:1px solid var(--panel-line); margin-top:8px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span>Subtotal:</span>
          <span class="mono">Rs ${(s.subtotal || s.total).toLocaleString()}</span>
        </div>
        ${s.discount > 0 ? `
          <div style="display:flex; justify-content:space-between; color:var(--copper); margin-bottom:4px;">
            <span>Discount:</span>
            <span class="mono">- Rs ${s.discount.toLocaleString()}</span>
          </div>
        ` : ''}
        <div style="display:flex; justify-content:space-between; font-weight:700; font-size:1.05rem; padding-top:6px; border-top:1.5px solid var(--panel-line);">
          <span>Total Amount:</span>
          <span class="mono" style="color:var(--copper);">Rs ${s.total.toLocaleString()}</span>
        </div>
        ${s.amount_paid > 0 ? `
          <div style="display:flex; justify-content:space-between; margin-top:6px; font-size:0.8rem; color:var(--ink-soft);">
            <span>Amount Tendered:</span>
            <span class="mono">Rs ${s.amount_paid.toLocaleString()}</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--trace); font-weight:600;">
            <span>Change Returned:</span>
            <span class="mono">Rs ${(s.change_amount || 0).toLocaleString()}</span>
          </div>
        ` : ''}
      </div>
    `;

    const totalsContainer = document.getElementById('invModalTotalsSummary');
    if (totalsContainer) totalsContainer.innerHTML = totalsHtml;

    // Set up print button
    const printBtn = document.getElementById('invModalPrintBtn');
    if (printBtn) {
      printBtn.onclick = () => {
        window.open(`/api/export/invoice/${s.id}`, '_blank');
      };
    }

    openModal('invoiceModal');
  } catch (err) {
    toast('Error loading invoice: ' + err.message, true);
  }
}
