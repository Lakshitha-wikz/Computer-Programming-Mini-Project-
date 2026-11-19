import React, { useState } from 'react';
import API from '../api';

export default function Login({ onLogin, showToast }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('admin@compstock.lk');
  const [password, setPassword] = useState('admin123');

  // Registration state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === 'admin') {
      setEmail('admin@compstock.lk');
      setPassword('admin123');
    } else {
      setEmail('staff@compstock.lk');
      setPassword('staff123');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter your email and password', true);
      return;
    }
    setLoading(true);
    try {
      const data = await API.post('/api/auth/login', { email, password });
      showToast(`Welcome back, ${data.user.name}!`);
      onLogin(data.user);
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName.trim()) {
      showToast('Full name is required', true);
      return;
    }
    if (!regEmail.trim()) {
      showToast('Email address is required', true);
      return;
    }
    if (regPassword.length < 6) {
      showToast('Password must be at least 6 characters long', true);
      return;
    }
    if (regPassword !== regConfirmPassword) {
      showToast('Passwords do not match', true);
      return;
    }

    setLoading(true);
    try {
      const data = await API.post('/api/auth/register', {
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword
      });
      showToast(`Registration successful! Welcome, ${data.user.name}!`);
      onLogin(data.user);
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap" style={{ display: 'flex' }}>
      <div className="login-card">
        {/* Brand header */}
        <div className="brand">
          <div className="brand-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
              <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" strokeLinecap="round"/>
              <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
          </div>
          <div>
            <div className="brand-name">CompStock</div>
            <div className="brand-sub">Inventory &amp; Sales · React SPA</div>
          </div>
        </div>

        {/* Auth Mode Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--panel-line)', marginBottom: 18 }}>
          <button
            type="button"
            className={`tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
            style={{
              flex: 1,
              borderRadius: 0,
              border: 'none',
              borderBottom: mode === 'login' ? '2px solid var(--copper)' : 'none',
              padding: 10,
              fontWeight: 700
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`tab-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => setMode('register')}
            style={{
              flex: 1,
              borderRadius: 0,
              border: 'none',
              borderBottom: mode === 'register' ? '2px solid var(--copper)' : 'none',
              padding: 10,
              fontWeight: 700
            }}
          >
            Register
          </button>
        </div>

        {mode === 'login' ? (
          <div>
            <h1>Sign in to your shop</h1>
            <p className="sub">Electronic Components &amp; Equipment Shop — inventory, sales and reporting in one place.</p>

            <div className="role-toggle">
              <div
                className={`role-opt ${role === 'admin' ? 'active' : ''}`}
                onClick={() => handleRoleSelect('admin')}
              >
                Admin
              </div>
              <div
                className={`role-opt ${role === 'sales' ? 'active' : ''}`}
                onClick={() => handleRoleSelect('sales')}
              >
                Sales Staff
              </div>
            </div>

            <form onSubmit={handleLoginSubmit}>
              <div className="field">
                <label>Email / Username</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@shop.lk"
                  required
                />
              </div>
              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Authenticating...' : 'Log in'}
              </button>
            </form>

            <div className="login-foot">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--copper)' }} /> Keep me signed in
              </label>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setMode('register');
                }}
                style={{ color: 'var(--copper)', fontWeight: 600 }}
              >
                Create account &rarr;
              </a>
            </div>
          </div>
        ) : (
          <div>
            <h1>Create New Account</h1>
            <p className="sub">Register a new Sales Staff / Normal User account for the shop.</p>

            <form onSubmit={handleRegisterSubmit}>
              <div className="field">
                <label>Full Name</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Nuwan Perera"
                  required
                />
              </div>
              <div className="field">
                <label>Email Address</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="nuwan@compstock.lk"
                  required
                />
              </div>
              <div className="field">
                <label>Password (min 6 characters)</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create strong password"
                  required
                />
              </div>
              <div className="field">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: 10 }} disabled={loading}>
                {loading ? 'Creating account...' : 'Register Account'}
              </button>
            </form>

            <div className="login-foot" style={{ justifyContent: 'center', marginTop: 14 }}>
              <span>
                Already have an account?{' '}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setMode('login');
                  }}
                  style={{ color: 'var(--copper)', fontWeight: 600 }}
                >
                  Sign In
                </a>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
