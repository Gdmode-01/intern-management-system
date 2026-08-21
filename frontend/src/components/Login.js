import React, { useState } from 'react';
import { DB } from '../services/store';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    const users = DB.getUsers();
    const matchedUser = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!matchedUser) {
      setErrorMessage('Invalid credentials: No account registered with this email address.');
      return;
    }

    if (matchedUser.password !== cleanPassword) {
      setErrorMessage('Invalid credentials: Incorrect password provided.');
      return;
    }

    // Persist authenticated session
    localStorage.setItem('token', `jwt-session-${matchedUser.id}-${Date.now()}`);
    localStorage.setItem('user', JSON.stringify({
      id: matchedUser.id,
      email: matchedUser.email,
      role: matchedUser.role,
      full_name: matchedUser.full_name,
      department: matchedUser.department,
      rm_id: matchedUser.rm_id,
      rm_name: matchedUser.rm_name
    }));

    // Dynamic role routing
    const routes = {
      operations: '/operations/dashboard',
      hr: '/hr/dashboard',
      rm: '/rm/dashboard',
      intern: '/intern/dashboard'
    };

    window.location.href = routes[matchedUser.role] || '/login';
  };

  const fillQuickCredential = (quickEmail) => {
    setEmail(quickEmail);
    setPassword('password123');
    setErrorMessage('');
  };

  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #070b14 60%, #030712 100%)', padding: '20px' }}>
      <div className="glass-card" style={{ padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '440px', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)', borderRadius: '16px', marginBottom: '14px' }}>
            <span style={{ fontSize: '24px' }}>🏛️</span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff', margin: '0 0 6px 0' }}>Intern Management System</h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Authenticated Multi-Role Enterprise Portal</p>
        </div>

        {/* Quick Role Fill Buttons (Populates Form For Testing) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
          <button type="button" onClick={() => fillQuickCredential('ops@system.com')} style={{ padding: '8px', background: 'rgba(217,119,6,0.15)', border: '1px solid rgba(217,119,6,0.4)', borderRadius: '8px', color: '#fde68a', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>⚙️ Ops Account</button>
          <button type="button" onClick={() => fillQuickCredential('hr@system.com')} style={{ padding: '8px', background: 'rgba(2,132,199,0.15)', border: '1px solid rgba(2,132,199,0.4)', borderRadius: '8px', color: '#7dd3fc', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>👑 HR Account</button>
          <button type="button" onClick={() => fillQuickCredential('rm@system.com')} style={{ padding: '8px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: '8px', color: '#c7d2fe', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>👔 RM Account</button>
          <button type="button" onClick={() => fillQuickCredential('intern@system.com')} style={{ padding: '8px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '8px', color: '#a7f3d0', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>🎓 Intern Account</button>
        </div>

        {errorMessage && (
          <div style={{ padding: '12px 14px', background: 'rgba(225,29,72,0.2)', border: '1px solid #e11d48', borderRadius: '10px', color: '#fda4af', fontSize: '13px', fontWeight: '600', marginBottom: '18px' }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', fontWeight: '600', marginBottom: '6px' }}>Work Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@system.com" required style={{ width: '100%', padding: '12px 14px', background: 'rgba(7, 11, 20, 0.7)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: '#fff', fontSize: '13px' }} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', fontWeight: '600', marginBottom: '6px' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={{ width: '100%', padding: '12px 14px', background: 'rgba(7, 11, 20, 0.7)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: '#fff', fontSize: '13px' }} />
          </div>

          <button type="submit" style={{ width: '100%', background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)', color: '#fff', border: 'none', padding: '13px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>
            Authenticate & Launch →
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;