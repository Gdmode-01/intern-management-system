import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { IconSun, IconMoon, IconLogOut } from './Icons';

const Navbar = ({ activeRole, theme, toggleTheme }) => {
  const { user, logout } = useAuth();

  const roleStyles = {
    hr: { label: 'HR Admin', bg: 'var(--accent-purple-bg)', color: 'var(--accent-purple)', border: 'rgba(139,92,246,0.3)' },
    rm: { label: 'Reporting Manager', bg: 'var(--primary-50)', color: 'var(--primary-500)', border: 'var(--primary-100)' },
    intern: { label: 'Intern', bg: 'var(--accent-cyan-bg)', color: 'var(--accent-cyan)', border: 'var(--accent-cyan-border)' },
  };

  const currentRole = roleStyles[activeRole] || roleStyles.hr;

  return (
    <header style={{
      height: '70px',
      padding: '0 28px',
      background: 'var(--bg-surface-translucent)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>
          {activeRole === 'hr' ? 'HR Command Center' : activeRole === 'rm' ? 'RM Management Hub' : 'Intern Portal'}
        </h2>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          borderRadius: '9999px',
          background: currentRole.bg,
          color: currentRole.color,
          border: `1px solid ${currentRole.border}`,
          fontSize: '12px',
          fontWeight: '700',
          textTransform: 'uppercase'
        }}>
          <span className="pulse-dot" style={{ backgroundColor: currentRole.color }} />
          {currentRole.label}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'var(--bg-muted)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <IconSun size={18} color="var(--accent-amber)" /> : <IconMoon size={18} color="var(--primary-600)" />}
        </button>

        {/* User Info Capsule */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '6px 14px 6px 6px',
          borderRadius: '30px',
          background: 'var(--bg-muted)',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary-500), var(--accent-cyan))',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '14px',
            textTransform: 'uppercase'
          }}>
            {(user?.full_name || 'U').charAt(0)}
          </div>
          <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {user?.full_name || 'User'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {user?.department || user?.email}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="btn btn-outline btn-sm"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            color: 'var(--accent-rose)',
            borderColor: 'var(--accent-rose-border)',
            background: 'var(--accent-rose-bg)'
          }}
          title="Sign Out"
        >
          <IconLogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
