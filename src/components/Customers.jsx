import React, { useState, useEffect } from 'react';
import API from '../api';

export default function Customers({ showToast }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  // History Modal
  const [historyCustomer, setHistoryCustomer] = useState(null);
  const [historyData, setHistoryData] = useState(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/api/customers');
      setCustomers(res.customers || []);
    } catch (err) {
      showToast('Error loading customers: ' + err.message, true);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setEmail('');
    setCompany('');
    setAddress('');
    setShowModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCustomer(c);
    setName(c.name || '');
    setPhone(c.phone || '');
    setEmail(c.email || '');
    setCompany(c.company || '');
    setAddress(c.address || '');
    setShowModal(true);
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Customer name is required', true);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
        company: company.trim() || null,
        address: address.trim() || null
      };

      if (editingCustomer) {
        await API.put(`/api/customers/${editingCustomer.id}`, payload);
        showToast(`Customer "${payload.name}" updated`);
      } else {
        await API.post('/api/customers', payload);
        showToast(`Customer "${payload.name}" created`);
      }
      setShowModal(false);
      loadCustomers();
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenHistory = async (c) => {
    setHistoryCustomer(c);
    try {
      const data = await API.get(`/api/customers/${c.id}/history`);
      setHistoryData(data);
    } catch (err) {
      showToast('Failed to load history: ' + err.message, true);
    }
  };

  const filtered = customers.filter(c => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(term)) ||
      (c.phone && c.phone.toLowerCase().includes(term)) ||
      (c.company && c.company.toLowerCase().includes(term))
    );
  });

  return (
    <div className="content">
      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="table-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers by name, phone or company..."
            />
          </div>
        </div>

        <button className="btn-add" onClick={handleOpenAdd}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Customer
        </button>
      </div>

      {/* Customers Table */}
      <div className="panel" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Company / Institution</th>
              <th style={{ textAlign: 'center' }}>Total Orders</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: 24, color: 'var(--ink-soft)' }}>
                  Loading customer records...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: 24, color: 'var(--ink-soft)' }}>
                  No customer records found.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td className="mono">{c.phone || '—'}</td>
                  <td>{c.email || '—'}</td>
                  <td>{c.company || 'Individual / Student'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="mono" style={{ fontWeight: 700 }}>{c.total_orders || 0}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`pill ${c.status === 'active' ? 'ok' : 'out'}`}>
                      {c.status || 'active'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn-ghost"
                      onClick={() => handleOpenHistory(c)}
                      style={{ fontSize: '0.78rem', padding: '3px 8px', marginRight: 4 }}
                    >
                      History
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() => handleOpenEdit(c)}
                      title="Edit Customer"
                    >
                      ✎
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay show" style={{ display: 'flex' }}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h3>
              <button className="btn-ghost" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveCustomer}>
              <div className="field">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Isuka Ranhiruu"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="077 123 4567"
                  />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="isuka@example.com"
                  />
                </div>
              </div>

              <div className="field">
                <label>Company / Organization / University</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. University Robotics Club"
                />
              </div>

              <div className="field">
                <label>Address / Location</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Colombo, Sri Lanka"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingCustomer ? 'Save Changes' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Purchase History Modal */}
      {historyCustomer && (
        <div className="modal-overlay show" style={{ display: 'flex' }}>
          <div className="modal" style={{ maxWidth: 620 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3>Purchase History · {historyCustomer.name}</h3>
              <button className="btn-ghost" onClick={() => { setHistoryCustomer(null); setHistoryData(null); }}>✕</button>
            </div>

            {!historyData ? (
              <p style={{ textAlign: 'center', padding: 20, color: 'var(--ink-soft)' }}>Loading history...</p>
            ) : (
              <div>
                <p className="sub" style={{ marginBottom: 14 }}>
                  Total Invoices: <strong>{historyData.sales?.length || 0}</strong>
                </p>

                <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Date</th>
                        <th style={{ textAlign: 'right' }}>Total Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!historyData.sales || historyData.sales.length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', padding: 16, color: 'var(--ink-soft)' }}>
                            No prior orders on record.
                          </td>
                        </tr>
                      ) : (
                        historyData.sales.map((s) => (
                          <tr key={s.id}>
                            <td className="mono" style={{ color: 'var(--copper)', fontWeight: 600 }}>
                              #{s.invoice_number}
                            </td>
                            <td>{new Date(s.created_at).toLocaleDateString()}</td>
                            <td className="mono right">Rs {s.total?.toLocaleString()}</td>
                            <td>
                              <span className={`status-badge ${s.payment_status === 'paid' ? 'paid' : 'pending'}`}>
                                {s.payment_status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div style={{ textAlign: 'right', marginTop: 18 }}>
                  <button
                    className="btn-secondary"
                    onClick={() => { setHistoryCustomer(null); setHistoryData(null); }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
