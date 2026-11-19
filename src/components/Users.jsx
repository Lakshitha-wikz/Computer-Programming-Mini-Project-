import React, { useState, useEffect } from 'react';
import API from '../api';

export default function Users({ showToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('sales');
  const [password, setPassword] = useState('password123');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/users');
      setUsers(res.users || []);
    } catch (err) {
      showToast('Failed to load users: ' + err.message, true);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('Name and email are required', true);
      return;
    }

    setSaving(true);
    try {
      await API.post('/api/users', {
        name: name.trim(),
        email: email.trim(),
        role,
        password: password.trim() || 'password123'
      });
      showToast(`User account created for "${name}" (${role})`);
      setShowModal(false);
      setName('');
      setEmail('');
      setPassword('password123');
      loadUsers();
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await API.put(`/api/users/${user.id}`, { status: newStatus });
      showToast(`User "${user.name}" status updated to ${newStatus}`);
      loadUsers();
    } catch (err) {
      showToast(err.message, true);
    }
  };

  return (
    <div className="content">
      <div className="toolbar">
        <div>
          <h3>System User Accounts &amp; RBAC</h3>
          <p style={{ color: 'var(--ink-soft)', fontSize: '0.85rem' }}>
            Control user permissions and role-based access control (Admin / Sales Staff)
          </p>
        </div>
        <button className="btn-add" onClick={() => setShowModal(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add New User
        </button>
      </div>

      <div className="panel" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email Address</th>
              <th style={{ textAlign: 'center' }}>Role</th>
              <th style={{ textAlign: 'center' }}>Account Status</th>
              <th>Created Date</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: 24, color: 'var(--ink-soft)' }}>
                  Loading users...
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td className="mono" style={{ color: 'var(--copper)' }}>#{u.id}</td>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 12,
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: u.role === 'admin' ? 'var(--copper-soft)' : 'var(--trace-soft)',
                        color: u.role === 'admin' ? 'var(--copper)' : 'var(--trace)'
                      }}
                    >
                      {u.role === 'admin' ? 'Administrator' : 'Sales Staff'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`pill ${u.status === 'active' ? 'ok' : 'out'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn-ghost"
                      onClick={() => handleToggleStatus(u)}
                      style={{ fontSize: '0.78rem', padding: '3px 8px' }}
                    >
                      {u.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="modal-overlay show" style={{ display: 'flex' }}>
          <div className="modal" style={{ maxWidth: 440 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>Add New System User</h3>
              <button className="btn-ghost" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="field">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kasun Chamara"
                  required
                />
              </div>

              <div className="field">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kasun@compstock.lk"
                  required
                />
              </div>

              <div className="field">
                <label>System Role *</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="sales">Sales Staff (Normal User)</option>
                  <option value="admin">Administrator (Full Control)</option>
                </select>
              </div>

              <div className="field">
                <label>Temporary Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Creating User...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
