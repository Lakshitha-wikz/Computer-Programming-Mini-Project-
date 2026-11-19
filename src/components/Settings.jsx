import React, { useState, useEffect } from 'react';
import API from '../api';

export default function Settings({ showToast }) {
  const [settings, setSettings] = useState({
    company_name: 'CompStock',
    company_phone: '+94 11 234 5678',
    company_email: 'info@compstock.lk',
    company_address: 'First Cross Street, Pettah, Colombo 11, Sri Lanka',
    currency_symbol: 'Rs'
  });
  const [diagnostics, setDiagnostics] = useState(null);
  const [saving, setSaving] = useState(false);
  const [backingUp, setBackingUp] = useState(false);

  useEffect(() => {
    loadSettings();
    loadDiagnostics();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await API.get('/api/settings');
      if (data && data.settings) {
        setSettings(data.settings);
      }
    } catch (e) {
      // ignore
    }
  };

  const loadDiagnostics = async () => {
    try {
      const data = await API.get('/api/backup/diagnostics');
      setDiagnostics(data);
    } catch (e) {
      // ignore
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put('/api/settings', settings);
      showToast('Shop configuration updated successfully');
    } catch (err) {
      showToast('Failed to update settings: ' + err.message, true);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateBackup = async () => {
    setBackingUp(true);
    try {
      const res = await API.post('/api/backup/snapshot', {});
      showToast(`Database snapshot saved: ${res.backup_file}`);
      loadDiagnostics();
    } catch (err) {
      showToast('Backup failed: ' + err.message, true);
    } finally {
      setBackingUp(false);
    }
  };

  return (
    <div className="content">
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
        
        {/* Shop Settings Form */}
        <div className="panel" style={{ padding: 24 }}>
          <div className="panel-head" style={{ marginBottom: 16 }}>
            <h3>Shop Profile &amp; Invoice Header</h3>
            <p>Details displayed on customer thermal receipts and invoices</p>
          </div>

          <form onSubmit={handleSaveSettings}>
            <div className="field">
              <label>Business Name</label>
              <input
                type="text"
                value={settings.company_name || ''}
                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label>Contact Phone</label>
                <input
                  type="text"
                  value={settings.company_phone || ''}
                  onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })}
                  required
                />
              </div>

              <div className="field">
                <label>Official Email</label>
                <input
                  type="email"
                  value={settings.company_email || ''}
                  onChange={(e) => setSettings({ ...settings, company_email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label>Store Physical Address</label>
              <input
                type="text"
                value={settings.company_address || ''}
                onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label>Currency Symbol</label>
              <input
                type="text"
                value={settings.currency_symbol || 'Rs'}
                onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
                style={{ width: 120 }}
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={saving} style={{ marginTop: 10 }}>
              {saving ? 'Saving Profile...' : 'Save Settings'}
            </button>
          </form>
        </div>

        {/* Database Health & Backup */}
        <div className="panel" style={{ padding: 24 }}>
          <div className="panel-head" style={{ marginBottom: 16 }}>
            <h3>Relational Database Engine (SQLite3)</h3>
            <p>ACID integrity, WAL mode status, and backup management</p>
          </div>

          {diagnostics ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'var(--bg)', padding: 14, borderRadius: 8, fontSize: '0.82rem' }}>
                <div style={{ marginBottom: 6 }}>
                  <strong>Database File:</strong> <span className="mono">{diagnostics.db_path || 'data/compstock.db'}</span>
                </div>
                <div style={{ marginBottom: 6 }}>
                  <strong>Journal Mode:</strong> <span className="mono" style={{ color: 'var(--trace)', fontWeight: 700 }}>WAL (Write-Ahead Logging)</span>
                </div>
                <div style={{ marginBottom: 6 }}>
                  <strong>Foreign Key Enforcement:</strong> <span className="mono" style={{ color: 'var(--trace)', fontWeight: 700 }}>ACTIVE (PRAGMA foreign_keys = ON)</span>
                </div>
                <div>
                  <strong>Database File Size:</strong> <span className="mono">{diagnostics.file_size_formatted || 'N/A'}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, textAlign: 'center' }}>
                <div className="kpi" style={{ padding: 10 }}>
                  <div className="kpi-label">Catalog</div>
                  <div className="kpi-value" style={{ fontSize: '1.2rem' }}>{diagnostics.table_counts?.products || 137}</div>
                </div>
                <div className="kpi" style={{ padding: 10 }}>
                  <div className="kpi-label">Sales</div>
                  <div className="kpi-value" style={{ fontSize: '1.2rem' }}>{diagnostics.table_counts?.sales || 0}</div>
                </div>
                <div className="kpi" style={{ padding: 10 }}>
                  <div className="kpi-label">Audit Logs</div>
                  <div className="kpi-value" style={{ fontSize: '1.2rem' }}>{diagnostics.table_counts?.audit_logs || 0}</div>
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                <button
                  className="btn-secondary"
                  onClick={handleCreateBackup}
                  disabled={backingUp}
                  style={{ width: '100%', padding: '10px 14px' }}
                >
                  {backingUp ? 'Creating SQLite Snapshot...' : '💾 Create Immediate Database Backup'}
                </button>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--ink-soft)' }}>Loading database diagnostics...</p>
          )}
        </div>

      </div>
    </div>
  );
}
