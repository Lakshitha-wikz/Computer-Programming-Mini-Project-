// CompStock System Settings & Database Backup Module
let systemSettings = {};

async function loadSettingsScreen() {
  await Promise.all([
    loadSystemSettings(),
    loadBackupDiagnostics()
  ]);
}

async function loadSystemSettings() {
  try {
    const data = await API.get('/api/settings');
    systemSettings = data.settings || {};

    const elName = document.getElementById('setCompanyName');
    const elPhone = document.getElementById('setCompanyPhone');
    const elEmail = document.getElementById('setCompanyEmail');
    const elAddress = document.getElementById('setCompanyAddress');
    const elCurrency = document.getElementById('setCurrency');
    const elLowStock = document.getElementById('setLowStockDefault');
    const elInvPrefix = document.getElementById('setInvoicePrefix');

    if (elName) elName.value = systemSettings.company_name || 'CompStock';
    if (elPhone) elPhone.value = systemSettings.company_phone || '+94 11 234 5678';
    if (elEmail) elEmail.value = systemSettings.company_email || 'info@compstock.lk';
    if (elAddress) elAddress.value = systemSettings.company_address || 'Pettah, Colombo 11, Sri Lanka';
    if (elCurrency) elCurrency.value = systemSettings.currency || 'LKR';
    if (elLowStock) elLowStock.value = systemSettings.low_stock_default || '8';
    if (elInvPrefix) elInvPrefix.value = systemSettings.invoice_prefix || 'S-';
  } catch (err) {
    console.error('Settings load error:', err);
    toast('Failed to load system settings', true);
  }
}

async function saveSystemSettings() {
  const payload = {
    company_name: document.getElementById('setCompanyName')?.value.trim() || 'CompStock',
    company_phone: document.getElementById('setCompanyPhone')?.value.trim() || '',
    company_email: document.getElementById('setCompanyEmail')?.value.trim() || '',
    company_address: document.getElementById('setCompanyAddress')?.value.trim() || '',
    currency: document.getElementById('setCurrency')?.value || 'LKR',
    low_stock_default: document.getElementById('setLowStockDefault')?.value || '8',
    invoice_prefix: document.getElementById('setInvoicePrefix')?.value.trim() || 'S-'
  };

  try {
    await API.put('/api/settings', payload);
    toast('Settings saved successfully');
    loadSystemSettings();
  } catch (err) {
    toast('Error saving settings: ' + err.message, true);
  }
}

async function loadBackupDiagnostics() {
  try {
    const data = await API.get('/api/backup/stats');
    const db = data.database;
    const counts = data.counts;
    const snapshots = data.snapshots || [];

    const dbSizeEl = document.getElementById('dbSizeFormatted');
    const dbCountsEl = document.getElementById('dbRecordCounts');
    const snapTable = document.getElementById('backupSnapshotsTable');

    if (dbSizeEl) dbSizeEl.textContent = db.size_formatted;
    if (dbCountsEl) {
      dbCountsEl.textContent = `${counts.products} Products · ${counts.sales} Sales · ${counts.customers} Customers · ${counts.audit_logs} Audit Logs`;
    }

    if (snapTable) {
      if (snapshots.length === 0) {
        snapTable.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:16px; color:var(--ink-soft);">No snapshot files recorded yet.</td></tr>';
      } else {
        snapTable.innerHTML = snapshots.map(s => `
          <tr>
            <td class="mono"><strong>${escapeHtml(s.filename)}</strong></td>
            <td class="mono right">${(s.size_bytes / 1024).toFixed(1)} KB</td>
            <td class="mono" style="font-size:0.75rem; color:var(--ink-soft);">${new Date(s.created_at).toLocaleString()}</td>
          </tr>
        `).join('');
      }
    }
  } catch (err) {
    console.error('Backup stats error:', err);
  }
}

async function createDbSnapshot() {
  try {
    const res = await API.post('/api/backup/snapshot', {});
    toast(`Snapshot created: ${res.snapshot.filename}`);
    loadBackupDiagnostics();
  } catch (err) {
    toast('Failed to create snapshot: ' + err.message, true);
  }
}

function downloadDbBackup() {
  window.location.href = '/api/backup/download';
  toast('Database download initiated...');
}
