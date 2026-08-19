import React from 'react';
import { IconSparkles } from './Icons';

const Sidebar = ({ menuItems, activeTab, setActiveTab }) => {
  return (
    <aside style={{
      width: '260px',
      background: 'var(--bg-sidebar)',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      minHeight: '100vh',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '24px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
        }}>
          <IconSparkles size={22} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '17px', fontWeight: '800', color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>
            InternSync<span style={{ color: '#06b6d4' }}>.ai</span>
          </h1>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
            Enterprise Management
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav style={{ padding: '20px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{
          padding: '0 12px 8px 12px',
          fontSize: '11px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#64748b'
        }}>
          Main Navigation
        </div>

        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: 'none',
                background: isActive ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : 'transparent',
                color: isActive ? '#ffffff' : '#94a3b8',
                fontWeight: isActive ? '700' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: isActive ? '0 4px 15px rgba(99, 102, 241, 0.35)' : 'none',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#94a3b8';
                }
              }}
            >
              <Icon size={18} color={isActive ? '#ffffff' : '#94a3b8'} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '700',
                  background: isActive ? 'rgba(255,255,255,0.25)' : '#f43f5e',
                  color: '#ffffff'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Pro Plan / Status Footer */}
      <div style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{
          padding: '14px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="pulse-dot" />
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#f8fafc' }}>System Online</span>
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>
            PostgreSQL v18 Connected
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
