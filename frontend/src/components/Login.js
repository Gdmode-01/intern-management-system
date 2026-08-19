import React, { useState } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const executeAuth = (userEmail, role, path, name) => {
    localStorage.setItem('token', 'auth-token-' + Date.now());
    localStorage.setItem('user', JSON.stringify({ id: 1, email: userEmail, role, full_name: name }));
    window.location.href = path;
  };

  const handleManualLogin = (e) => {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (clean.includes('ops')) executeAuth('ops@system.com', 'operations', '/operations/dashboard', 'Chief Operations Officer');
    else if (clean.includes('hr')) executeAuth('hr@system.com', 'hr', '/hr/dashboard', 'Senior HR Lead');
    else if (clean.includes('rm')) executeAuth('rm@system.com', 'rm', '/rm/dashboard', 'Alex Rivera (RM)');
    else executeAuth('intern@system.com', 'intern', '/intern/dashboard', 'Sarah Chen (Intern)');
  };

  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #070b14 60%, #030712 100%)', overflow: 'hidden', padding: '20px' }}>
      
      {/* 3D Glowing Ambient Orbs */}
      <div style={{ position: 'absolute', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(0,0,0,0) 70%)', top: '-10%', left: '15%', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, rgba(0,0,0,0) 70%)', bottom: '5%', right: '15%', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <div className="glass-card" style={{ padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '440px', position: 'relative', zIndex: 10 }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)', borderRadius: '16px', boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.4)', marginBottom: '14px' }}>
            <span style={{ fontSize: '24px' }}>🏛️</span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px', margin: '0 0 6px 0' }}>
            Intern Management System
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Enterprise Lifecycle & Mentorship Hub</p>
        </div>

        {/* 1-Click Fast Gateways */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
          <button type="button" onClick={() => executeAuth('ops@system.com', 'operations', '/operations/dashboard', 'Chief Operations Officer')} style={{ padding: '12px', background: 'linear-gradient(180deg, #27160c 0%, #150d07 100%)', border: '1px solid #78350f', borderRadius: '10px', color: '#fde68a', fontWeight: '700', cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s ease' }} className="nav-btn-motion">
            ⚙️ Operations
          </button>
          <button type="button" onClick={() => executeAuth('hr@system.com', 'hr', '/hr/dashboard', 'Senior HR Lead')} style={{ padding: '12px', background: 'linear-gradient(180deg, #082f49 0%, #051a29 100%)', border: '1px solid #0369a1', borderRadius: '10px', color: '#7dd3fc', fontWeight: '700', cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s ease' }} className="nav-btn-motion">
            👑 HR Portal
          </button>
          <button type="button" onClick={() => executeAuth('rm@system.com', 'rm', '/rm/dashboard', 'Alex Rivera')} style={{ padding: '12px', background: 'linear-gradient(180deg, #1e1b4b 0%, #0f0d26 100%)', border: '1px solid #4338ca', borderRadius: '10px', color: '#c7d2fe', fontWeight: '700', cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s ease' }} className="nav-btn-motion">
            👔 Manager Hub
          </button>
          <button type="button" onClick={() => executeAuth('intern@system.com', 'intern', '/intern/dashboard', 'Sarah Chen')} style={{ padding: '12px', background: 'linear-gradient(180deg, #064e3b 0%, #032b21 100%)', border: '1px solid #047857', borderRadius: '10px', color: '#a7f3d0', fontWeight: '700', cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s ease' }} className="nav-btn-motion">
            🎓 Intern Portal
          </button>
        </div>

        <div style={{ position: 'relative', textAlign: 'center', margin: '22px 0' }}>
          <hr style={{ border: '0', borderTop: '1px solid rgba(255,255,255,0.08)' }} />
          <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#0f172a', padding: '0 12px', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Corporate Sign In
          </span>
        </div>

        <form onSubmit={handleManualLogin}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', fontWeight: '600', marginBottom: '6px' }}>Work Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" required style={{ width: '100%', padding: '12px 14px', background: 'rgba(7, 11, 20, 0.7)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none' }} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', fontWeight: '600', marginBottom: '6px' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={{ width: '100%', padding: '12px 14px', background: 'rgba(7, 11, 20, 0.7)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: '#fff', fontSize: '13px', outline: 'none' }} />
          </div>

          <button type="submit" style={{ width: '100%', background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)', color: '#fff', border: 'none', padding: '13px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', boxShadow: '0 10px 20px -5px rgba(2, 132, 199, 0.4)' }} className="nav-btn-motion">
            Launch Workspace →
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;