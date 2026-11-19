import React, { useState, useEffect } from 'react';
import API from '../api';

export default function Audit({ showToast }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/audit');
      setLogs(res.logs || []);
    } catch (err) {
      showToast('Error loading audit trails: ' + err.message, true);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(l => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (l.action && l.action.toLowerCase().includes(term)) ||
      (l.user_name && l.user_name.toLowerCase().includes(term)) ||
      (l.description && l.description.toLowerCase().includes(term))
    );
  });

  return (
    <div className="content">
      <div className="toolbar">
        <div>
          <h3>System Security &amp; Audit Trail</h3>
          <p style={{ color: 'var(--ink-soft)', fontSize: '0.85rem' }}>
            Authoritative logs of authentication, inventory movements, and financial transactions
          </p>
        </div>
        <div className="table-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail..."
          />
        </div>
      </div>

      <div className="panel" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>User</th>
              <th>Event Details</th>
              <th style={{ textAlign: 'right' }}>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: 24, color: 'var(--ink-soft)' }}>
                  Loading audit logs...
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: 24, color: 'var(--ink-soft)' }}>
                  No audit trail records found.
                </td>
              </tr>
            ) : (
              filteredLogs.map((l) => (
                <tr key={l.id}>
                  <td className="mono" style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                    {new Date(l.created_at).toLocaleString()}
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 10,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        background: l.action.includes('LOGIN') ? 'var(--trace-soft)' :
                                    l.action.includes('DELETE') ? 'var(--danger-soft)' :
                                    'var(--copper-soft)',
                        color: l.action.includes('LOGIN') ? 'var(--trace)' :
                               l.action.includes('DELETE') ? 'var(--danger)' :
                               'var(--copper)'
                      }}
                    >
                      {l.action}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{l.user_name || 'System'}</td>
                  <td>{l.description}</td>
                  <td className="mono right" style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>
                    {l.ip_address || '127.0.0.1'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
