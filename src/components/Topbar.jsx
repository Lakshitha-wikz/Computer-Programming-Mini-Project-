import React, { useState, useEffect, useRef } from 'react';
import API from '../api';

export default function Topbar({ screenTitle, screenEyebrow, theme, onToggleTheme, onSelectProduct }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const searchRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    loadNotifications();
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await API.get('/api/notifications');
      setNotifications(data.notifications || []);
    } catch (e) {
      // ignore
    }
  };

  const handleSearchChange = async (val) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    try {
      const data = await API.get(`/api/products?search=${encodeURIComponent(val)}`);
      setSearchResults((data.products || []).slice(0, 8));
      setShowDropdown(true);
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="topbar">
      <div>
        <div className="eyebrow">{screenEyebrow || 'ELECTRONIC SHOP'}</div>
        <h2>{screenTitle || 'CompStock'}</h2>
      </div>

      {/* Global Search Bar */}
      <div style={{ position: 'relative', width: 340 }} ref={searchRef}>
        <div className="search-global" style={{ display: 'flex', alignItems: 'center', background: 'var(--panel)', border: '1.5px solid var(--panel-line)', borderRadius: 8, padding: '7px 12px', gap: 8 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 16, height: 16, color: 'var(--ink-soft)' }}>
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search parts by name, SKU or barcode..."
            style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '0.85rem', color: 'var(--ink)' }}
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setShowDropdown(false); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-soft)' }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 4,
              background: 'var(--panel)',
              border: '1px solid var(--panel-line)',
              borderRadius: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              zIndex: 100,
              maxHeight: 320,
              overflowY: 'auto'
            }}
          >
            {searchResults.map((p) => (
              <div
                key={p.id}
                className="search-result-row"
                onClick={() => {
                  if (onSelectProduct) onSelectProduct(p);
                  setShowDropdown(false);
                }}
                style={{
                  padding: '10px 14px',
                  borderBottom: '1px solid var(--panel-line)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.name}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--ink-soft)' }}>
                    {p.sku} · {p.category}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                    Rs {p.selling_price?.toLocaleString()}
                  </div>
                  <span
                    className={`pill ${p.stock_quantity <= 0 ? 'out' : p.stock_quantity <= p.min_stock_level ? 'low' : 'ok'}`}
                    style={{ fontSize: '0.7rem', padding: '1px 6px' }}
                  >
                    {p.stock_quantity} in stock
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Topbar Actions */}
      <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Notification Bell */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            className="topbar-btn"
            onClick={() => setShowNotifs(!showNotifs)}
            title="System Notifications"
            style={{ position: 'relative' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 17, height: 17 }}>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {notifications.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  background: 'var(--danger)',
                  color: '#fff',
                  borderRadius: 10,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '1px 5px'
                }}
              >
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifs && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 8,
                width: 320,
                background: 'var(--panel)',
                border: '1px solid var(--panel-line)',
                borderRadius: 8,
                boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
                zIndex: 100,
                padding: 12
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 8, borderBottom: '1px solid var(--panel-line)', paddingBottom: 6 }}>
                Inventory &amp; System Alerts
              </div>
              {notifications.length === 0 ? (
                <div style={{ padding: 12, textAlign: 'center', color: 'var(--ink-soft)', fontSize: '0.82rem' }}>
                  No active alerts. All systems normal.
                </div>
              ) : (
                <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                  {notifications.map((n, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '8px 10px',
                        borderBottom: '1px solid var(--panel-line)',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8
                      }}
                    >
                      <span style={{ color: n.type === 'danger' ? 'var(--danger)' : 'var(--amber)', fontSize: '1rem' }}>
                        ⚠
                      </span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{n.title || 'Stock Notice'}</div>
                        <div style={{ color: 'var(--ink-soft)', fontSize: '0.74rem' }}>{n.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          className="topbar-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  );
}
