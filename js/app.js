// CompStock App Core Logic
let currentUser = null;
let currentScreen = 'dashboard';
let selectedRole = 'admin';
let currentTheme = localStorage.getItem('compstock_theme') || 'light';

// Global HTML sanitization helper
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initAuth();
  initGlobalSearch();
  initKeyboardShortcuts();
  initNotifications();
});

// Theme handling
function initTheme() {
  document.documentElement.setAttribute('data-theme', currentTheme);
  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.innerHTML = currentTheme === 'dark' ? '☀️' : '🌙';
    themeBtn.title = currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  }
}

function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('compstock_theme', currentTheme);
  initTheme();
  toast(`Switched to ${currentTheme} theme`);
}

// Toast notification helper
let toastTimer = null;
function toast(msg, isError = false) {
  const tEl = document.getElementById('toast');
  const msgEl = document.getElementById('toastMsg');
  if (!tEl || !msgEl) return;

  msgEl.textContent = msg;
  if (isError) {
    tEl.classList.add('error');
  } else {
    tEl.classList.remove('error');
  }

  tEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    tEl.classList.remove('show');
    tEl.classList.remove('error');
  }, 3000);
}

// Modal helper
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('show');
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('show');
}

// Role toggle in login screen
function selectRole(el, role) {
  document.querySelectorAll('.role-opt').forEach(o => o.classList.remove('active'));
  el.classList.add('active');
  selectedRole = role;

  const emailInput = document.getElementById('loginEmail');
  const passInput = document.getElementById('loginPassword');

  if (role === 'admin') {
    emailInput.value = 'admin@compstock.lk';
    passInput.value = 'admin123';
  } else {
    emailInput.value = 'staff@compstock.lk';
    passInput.value = 'staff123';
  }
}

// Toggle between Sign In and Register modes
function toggleAuthMode(mode) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const authTitle = document.getElementById('authCardTitle');
  const authSub = document.getElementById('authCardSub');
  const authTabs = document.querySelectorAll('.auth-tab');

  authTabs.forEach(t => {
    const isActive = t.dataset.mode === mode;
    t.classList.toggle('active', isActive);
    t.style.borderBottom = isActive ? '2px solid var(--copper)' : 'none';
  });

  if (mode === 'register') {
    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'block';
    if (authTitle) authTitle.textContent = 'Create New Account';
    if (authSub) authSub.textContent = 'Register a new Sales Staff / Normal User account for the shop.';
  } else {
    if (loginForm) loginForm.style.display = 'block';
    if (registerForm) registerForm.style.display = 'none';
    if (authTitle) authTitle.textContent = 'Sign in to your shop';
    if (authSub) authSub.textContent = 'Electronic Components & Equipment Shop — inventory, sales and reporting in one place.';
  }
}

async function doRegister() {
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('registerConfirmPassword').value;

  if (!name) {
    toast('Please enter your full name', true);
    return;
  }
  if (!email) {
    toast('Please enter your email address', true);
    return;
  }
  if (!password || password.length < 6) {
    toast('Password must be at least 6 characters long', true);
    return;
  }
  if (password !== confirmPassword) {
    toast('Passwords do not match', true);
    return;
  }

  try {
    const data = await API.post('/api/auth/register', { name, email, password });
    currentUser = data.user;
    renderAuthenticatedUser();
    toast(`Registration successful! Welcome to CompStock, ${currentUser.name}!`);
    showScreen('dashboard', document.querySelector('[data-screen="dashboard"]'));
    loadSmartNotifications();
  } catch (err) {
    toast(err.message, true);
  }
}

// Authentication handling
async function initAuth() {
  try {
    const data = await API.get('/api/auth/me');
    if (data && data.user) {
      currentUser = data.user;
      renderAuthenticatedUser();
      showScreen('dashboard', document.querySelector('[data-screen="dashboard"]'));
      loadSmartNotifications();
    } else {
      showLoginScreen();
    }
  } catch (err) {
    showLoginScreen();
  }
}

function showLoginScreen() {
  currentUser = null;
  document.getElementById('app').classList.remove('active');
  document.getElementById('loginWrap').style.display = 'flex';
  document.body.classList.remove('role-admin');
}

function renderAuthenticatedUser() {
  document.getElementById('loginWrap').style.display = 'none';
  document.getElementById('app').classList.add('active');

  const isAdmin = currentUser.role === 'admin';
  document.body.classList.toggle('role-admin', isAdmin);

  const whoName = document.getElementById('whoName');
  const whoRole = document.getElementById('whoRole');
  const avatarInit = document.getElementById('avatarInit');

  if (whoName) whoName.textContent = currentUser.name;
  if (whoRole) whoRole.textContent = isAdmin ? 'ADMINISTRATOR' : 'SALES STAFF';
  if (avatarInit) avatarInit.textContent = (currentUser.name || 'U').charAt(0).toUpperCase();

  // Redirect if staff enters admin only page
  if (!isAdmin && ['users', 'audit', 'settings'].includes(currentScreen)) {
    showScreen('dashboard', document.querySelector('[data-screen="dashboard"]'));
  }
}

async function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    toast('Please enter email and password', true);
    return;
  }

  try {
    const data = await API.post('/api/auth/login', { email, password });
    currentUser = data.user;
    renderAuthenticatedUser();
    toast(`Welcome back, ${currentUser.name}!`);
    showScreen('dashboard', document.querySelector('[data-screen="dashboard"]'));
    loadSmartNotifications();
  } catch (err) {
    toast(err.message, true);
  }
}

async function doLogout() {
  try {
    await API.post('/api/auth/logout', {});
  } catch (e) {
    console.error('Logout error:', e);
  }
  showLoginScreen();
  toast('Logged out successfully');
}

// Navigation / Screen router
function showScreen(name, btn) {
  currentScreen = name;

  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const targetScreen = document.getElementById('screen-' + name);
  if (targetScreen) targetScreen.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (btn) {
    btn.classList.add('active');
  } else {
    const defaultBtn = document.querySelector(`.nav-item[data-screen="${name}"]`);
    if (defaultBtn) defaultBtn.classList.add('active');
  }

  // Trigger screen-specific data loading
  if (name === 'dashboard' && typeof loadDashboard === 'function') {
    loadDashboard();
  } else if (name === 'inventory' && typeof loadInventory === 'function') {
    loadInventory();
  } else if (name === 'sales' && typeof loadSalesScreen === 'function') {
    loadSalesScreen();
  } else if (name === 'invoices' && typeof loadInvoicesScreen === 'function') {
    loadInvoicesScreen();
  } else if (name === 'customers' && typeof loadCustomers === 'function') {
    loadCustomers();
  } else if (name === 'reports' && typeof loadReports === 'function') {
    loadReports();
  } else if (name === 'users' && typeof loadUsers === 'function') {
    loadUsers();
  } else if (name === 'audit' && typeof loadAuditScreen === 'function') {
    loadAuditScreen();
  } else if (name === 'settings' && typeof loadSettingsScreen === 'function') {
    loadSettingsScreen();
  }
}

// ============ SMART NOTIFICATION CENTER ============
let notificationsList = [];

function initNotifications() {
  const bell = document.getElementById('notificationBellBtn');
  const dropdown = document.getElementById('notificationDropdown');
  if (bell && dropdown) {
    bell.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && e.target !== bell) {
        dropdown.classList.remove('show');
      }
    });
  }

  // Poll notifications every 60s
  setInterval(() => {
    if (currentUser) loadSmartNotifications();
  }, 60000);
}

async function loadSmartNotifications() {
  try {
    const data = await API.get('/api/notifications');
    notificationsList = data.notifications || [];
    const unread = data.unread_count || 0;

    const badge = document.getElementById('notifBadgeCount');
    if (badge) {
      if (unread > 0) {
        badge.textContent = unread;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }

    renderNotificationsDropdown();
  } catch (err) {
    console.error('Error fetching notifications:', err);
  }
}

function renderNotificationsDropdown() {
  const container = document.getElementById('notifItemsContainer');
  if (!container) return;

  if (notificationsList.length === 0) {
    container.innerHTML = '<div style="padding:24px; text-align:center; color:var(--ink-soft); font-size:0.8rem;">No active alerts or events.</div>';
    return;
  }

  container.innerHTML = notificationsList.map(n => `
    <div class="notif-item" onclick="onNotificationClick('${n.linkScreen || 'dashboard'}')">
      <div class="notif-icon ${n.type}">
        ${getNotifIconSvg(n.type)}
      </div>
      <div class="notif-content">
        <div class="notif-title">${escapeHtml(n.title)}</div>
        <div class="notif-msg">${escapeHtml(n.message)}</div>
        <div class="notif-time">${escapeHtml(n.timestamp)}</div>
      </div>
    </div>
  `).join('');
}

function getNotifIconSvg(type) {
  if (type === 'danger') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
  if (type === 'warning') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><path d="M10.3 3.9L2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>';
  if (type === 'success') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><path d="M20 6L9 17l-5-5"/></svg>';
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
}

function onNotificationClick(screenName) {
  document.getElementById('notificationDropdown')?.classList.remove('show');
  showScreen(screenName, document.querySelector(`.nav-item[data-screen="${screenName}"]`));
}

// ============ GLOBAL SEARCH & MODAL ============
function initGlobalSearch() {
  const globalInputs = document.querySelectorAll('.search-global input');
  globalInputs.forEach(input => {
    input.addEventListener('focus', () => {
      openModal('globalSearchModal');
      setTimeout(() => document.getElementById('searchModalInput')?.focus(), 50);
    });
  });

  const modalInput = document.getElementById('searchModalInput');
  let debounce = null;
  if (modalInput) {
    modalInput.addEventListener('input', (e) => {
      clearTimeout(debounce);
      const query = e.target.value.trim();
      debounce = setTimeout(() => executeGlobalSearch(query), 200);
    });
  }
}

async function executeGlobalSearch(q) {
  const resultsContainer = document.getElementById('searchModalResults');
  if (!resultsContainer) return;

  if (!q) {
    resultsContainer.innerHTML = '<div style="padding:24px; text-align:center; color:var(--ink-soft); font-size:0.85rem;">Type to search across Products, SKUs, Barcodes, Invoices, and Customers...</div>';
    return;
  }

  try {
    const data = await API.get(`/api/products/global-search?q=${encodeURIComponent(q)}`);
    const { products = [], sales = [], customers = [] } = data;

    if (products.length === 0 && sales.length === 0 && customers.length === 0) {
      resultsContainer.innerHTML = `<div style="padding:24px; text-align:center; color:var(--ink-soft); font-size:0.85rem;">No results found for "${escapeHtml(q)}".</div>`;
      return;
    }

    let html = '';

    if (products.length > 0) {
      html += `<div style="font-family:var(--font-mono); font-size:0.7rem; color:var(--copper); font-weight:700; margin:10px 0 6px;">PRODUCTS (${products.length})</div>`;
      products.forEach(p => {
        html += `
          <div class="search-result-row" style="display:flex; justify-content:space-between; align-items:center; padding:8px 10px; border-radius:6px; cursor:pointer;" onclick="goToProductFromSearch(${p.id})">
            <div>
              <strong>${escapeHtml(p.name)}</strong>
              <div class="mono" style="font-size:0.72rem; color:var(--ink-soft);">${escapeHtml(p.sku)} · ${escapeHtml(p.category)} ${p.barcode ? `· ${escapeHtml(p.barcode)}` : ''}</div>
            </div>
            <div style="text-align:right;">
              <div class="mono" style="font-weight:600;">Rs ${p.selling_price.toLocaleString()}</div>
              <div style="font-size:0.72rem; color:${p.stock_quantity <= p.low_stock_threshold ? 'var(--danger)' : 'var(--trace)'}; font-weight:600;">${p.stock_quantity} in stock</div>
            </div>
          </div>
        `;
      });
    }

    if (sales.length > 0) {
      html += `<div style="font-family:var(--font-mono); font-size:0.7rem; color:var(--copper); font-weight:700; margin:14px 0 6px;">INVOICES (${sales.length})</div>`;
      sales.forEach(s => {
        html += `
          <div class="search-result-row" style="display:flex; justify-content:space-between; align-items:center; padding:8px 10px; border-radius:6px; cursor:pointer;" onclick="goToInvoiceFromSearch(${s.id})">
            <div>
              <strong class="mono" style="color:var(--copper);">#${escapeHtml(s.invoice_number)}</strong>
              <div style="font-size:0.72rem; color:var(--ink-soft);">${escapeHtml(s.customer_name)} · ${new Date(s.created_at).toLocaleDateString()}</div>
            </div>
            <div class="mono" style="font-weight:600;">Rs ${s.total.toLocaleString()}</div>
          </div>
        `;
      });
    }

    if (customers.length > 0) {
      html += `<div style="font-family:var(--font-mono); font-size:0.7rem; color:var(--copper); font-weight:700; margin:14px 0 6px;">CUSTOMERS (${customers.length})</div>`;
      customers.forEach(c => {
        html += `
          <div class="search-result-row" style="display:flex; justify-content:space-between; align-items:center; padding:8px 10px; border-radius:6px; cursor:pointer;" onclick="goToCustomerFromSearch(${c.id})">
            <div>
              <strong>${escapeHtml(c.name)}</strong>
              <div class="mono" style="font-size:0.72rem; color:var(--ink-soft);">${escapeHtml(c.phone || 'No phone')} ${c.company ? `· ${escapeHtml(c.company)}` : ''}</div>
            </div>
            <span class="mono" style="font-size:0.75rem; color:var(--copper); font-weight:600;">View</span>
          </div>
        `;
      });
    }

    resultsContainer.innerHTML = html;
  } catch (err) {
    resultsContainer.innerHTML = `<div style="padding:16px; color:var(--danger);">${err.message}</div>`;
  }
}

function goToProductFromSearch(id) {
  closeModal('globalSearchModal');
  showScreen('inventory', document.querySelector('[data-screen="inventory"]'));
  if (typeof openProductDetailsModal === 'function') {
    openProductDetailsModal(id);
  }
}

function goToInvoiceFromSearch(id) {
  closeModal('globalSearchModal');
  if (typeof openInvoiceModal === 'function') {
    openInvoiceModal(id);
  }
}

function goToCustomerFromSearch(id) {
  closeModal('globalSearchModal');
  showScreen('customers', document.querySelector('[data-screen="customers"]'));
  if (typeof viewCustomerHistory === 'function') {
    viewCustomerHistory(id);
  }
}

// ============ KEYBOARD SHORTCUTS ============
function initKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    // Ctrl+K -> Global search
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openModal('globalSearchModal');
      setTimeout(() => document.getElementById('searchModalInput')?.focus(), 50);
      return;
    }

    // Ctrl+Enter -> Complete sale if on POS
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (currentScreen === 'sales' && typeof confirmSale === 'function') {
        e.preventDefault();
        confirmSale();
      }
      return;
    }

    // Escape -> Close all modals and dropdowns
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.show').forEach(m => m.classList.remove('show'));
      document.getElementById('notificationDropdown')?.classList.remove('show');
    }
  });
}
