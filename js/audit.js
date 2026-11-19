// CompStock Audit Trail Log Module
let auditLogs = [];
let auditActions = [];
let currentAuditAction = '';
let currentAuditSearch = '';

async function loadAuditScreen() {
  try {
    let url = '/api/audit?limit=100';
    if (currentAuditAction) {
      url += `&action=${encodeURIComponent(currentAuditAction)}`;
    }
    if (currentAuditSearch) {
      url += `&search=${encodeURIComponent(currentAuditSearch)}`;
    }

    const data = await API.get(url);
    auditLogs = data.logs || [];
    auditActions = data.actions || [];

    populateAuditActionFilter();
    renderAuditTable();
  } catch (err) {
    console.error('Audit fetch error:', err);
    toast('Failed to load audit logs: ' + err.message, true);
  }
}

function populateAuditActionFilter() {
  const sel = document.getElementById('auditActionFilter');
  if (!sel || sel.children.length > 1) return;

  auditActions.forEach(action => {
    const opt = document.createElement('option');
    opt.value = action;
    opt.textContent = action;
    sel.appendChild(opt);
  });
}

function handleAuditFilterChange() {
  currentAuditAction = document.getElementById('auditActionFilter').value;
  currentAuditSearch = (document.getElementById('auditSearchInput')?.value || '').trim();
  loadAuditScreen();
}

function renderAuditTable() {
  const tbody = document.getElementById('auditTableBody');
  if (!tbody) return;

  if (auditLogs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:32px; color:var(--ink-soft);">No audit records found matching criteria.</td></tr>';
    return;
  }

  tbody.innerHTML = auditLogs.map(l => {
    let badgeClass = 'default';

    if (l.action.includes('SALE') || l.action.includes('CREATE')) {
      badgeClass = 'create';
    } else if (l.action.includes('RETURN') || l.action.includes('DELETE')) {
      badgeClass = 'delete';
    } else if (l.action.includes('UPDATE') || l.action.includes('ADJUST')) {
      badgeClass = 'update';
    }

    return `
      <tr>
        <td class="mono" style="font-size:0.75rem; color:var(--ink-soft);">${new Date(l.created_at).toLocaleString()}</td>
        <td><strong>${escapeHtml(l.user_name || 'System')}</strong></td>
        <td>
          <span class="audit-badge ${badgeClass}">
            ${escapeHtml(l.action)}
          </span>
        </td>
        <td>${escapeHtml(l.description)}</td>
        <td class="mono" style="font-size:0.75rem; color:var(--copper); font-weight:600;">${escapeHtml(l.related_id || '—')}</td>
      </tr>
    `;
  }).join('');
}
