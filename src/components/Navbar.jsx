import React from 'react';

export default function Navbar({ currentScreen, onSelectScreen, currentUser, onLogout, lowStockCount }) {
  const isAdmin = currentUser && currentUser.role === 'admin';

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
            <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" strokeLinecap="round"/>
            <rect x="6" y="6" width="12" height="12" rx="2"/>
          </svg>
        </div>
        <div>
          <div className="brand-name">CompStock</div>
          <div className="brand-sub">Inventory &amp; Sales</div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="nav-group">
        <div className="nav-label">Menu</div>

        <button
          className={`nav-item ${currentScreen === 'dashboard' ? 'active' : ''}`}
          onClick={() => onSelectScreen('dashboard')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="7" height="9" rx="1.5"/>
            <rect x="14" y="3" width="7" height="5" rx="1.5"/>
            <rect x="14" y="12" width="7" height="9" rx="1.5"/>
            <rect x="3" y="16" width="7" height="5" rx="1.5"/>
          </svg>
          <span>Dashboard</span>
        </button>

        <button
          className={`nav-item ${currentScreen === 'inventory' ? 'active' : ''}`}
          onClick={() => onSelectScreen('inventory')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M21 8l-9-5-9 5 9 5 9-5z"/>
            <path d="M3 8v8l9 5 9-5V8"/>
            <path d="M12 13v8"/>
          </svg>
          <span>Inventory</span>
          {lowStockCount > 0 && <span className="badge">{lowStockCount}</span>}
        </button>

        <button
          className={`nav-item ${currentScreen === 'sales' ? 'active' : ''}`}
          onClick={() => onSelectScreen('sales')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="9" cy="20" r="1.4"/>
            <circle cx="17" cy="20" r="1.4"/>
            <path d="M2 3h2l2.4 12.4a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L20 7H5.2"/>
          </svg>
          <span>Sales POS</span>
        </button>

        <button
          className={`nav-item ${currentScreen === 'invoices' ? 'active' : ''}`}
          onClick={() => onSelectScreen('invoices')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <span>Invoices &amp; Returns</span>
        </button>

        <button
          className={`nav-item ${currentScreen === 'customers' ? 'active' : ''}`}
          onClick={() => onSelectScreen('customers')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span>Customers</span>
        </button>

        <button
          className={`nav-item ${currentScreen === 'reports' ? 'active' : ''}`}
          onClick={() => onSelectScreen('reports')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          <span>Reports &amp; Analytics</span>
        </button>

        {isAdmin && (
          <>
            <div className="nav-label" style={{ marginTop: 14 }}>Administration</div>

            <button
              className={`nav-item ${currentScreen === 'users' ? 'active' : ''}`}
              onClick={() => onSelectScreen('users')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
              <span>User Accounts</span>
            </button>

            <button
              className={`nav-item ${currentScreen === 'audit' ? 'active' : ''}`}
              onClick={() => onSelectScreen('audit')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>Security Audit</span>
            </button>

            <button
              className={`nav-item ${currentScreen === 'settings' ? 'active' : ''}`}
              onClick={() => onSelectScreen('settings')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              <span>Settings &amp; Backup</span>
            </button>
          </>
        )}
      </nav>

      {/* User profile foot */}
      <div className="sidebar-foot">
        <div className="user-who">
          <div className="avatar">
            {(currentUser?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="who-name">{currentUser?.name || 'User'}</div>
            <div className="who-role">{isAdmin ? 'ADMINISTRATOR' : 'SALES STAFF'}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout} title="Log out">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </aside>
  );
}
