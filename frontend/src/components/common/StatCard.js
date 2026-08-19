import React from 'react';
import { IconTrendingUp } from './Icons';

const StatCard = ({ title, value, change, icon: Icon, color = 'indigo' }) => {
  const colorMap = {
    indigo: {
      bg: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(99, 102, 241, 0.04))',
      border: 'rgba(99, 102, 241, 0.25)',
      iconBg: 'linear-gradient(135deg, #6366f1, #4f46e5)',
      text: 'var(--primary-500)'
    },
    emerald: {
      bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(16, 185, 129, 0.04))',
      border: 'rgba(16, 185, 129, 0.25)',
      iconBg: 'linear-gradient(135deg, #10b981, #059669)',
      text: 'var(--accent-emerald)'
    },
    amber: {
      bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(245, 158, 11, 0.04))',
      border: 'rgba(245, 158, 11, 0.25)',
      iconBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
      text: 'var(--accent-amber)'
    },
    rose: {
      bg: 'linear-gradient(135deg, rgba(244, 63, 94, 0.12), rgba(244, 63, 94, 0.04))',
      border: 'rgba(244, 63, 94, 0.25)',
      iconBg: 'linear-gradient(135deg, #f43f5e, #e11d48)',
      text: 'var(--accent-rose)'
    },
    cyan: {
      bg: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(6, 182, 212, 0.04))',
      border: 'rgba(6, 182, 212, 0.25)',
      iconBg: 'linear-gradient(135deg, #06b6d4, #0891b2)',
      text: 'var(--accent-cyan)'
    }
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div
      className="glass-card-interactive"
      style={{
        padding: '24px',
        background: 'var(--bg-card)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>
            {title}
          </div>
          <div style={{ fontSize: '30px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {value}
          </div>
        </div>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          background: scheme.iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          color: '#ffffff'
        }}>
          {Icon && <Icon size={22} color="#ffffff" />}
        </div>
      </div>

      {change && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '16px',
          fontSize: '12px',
          fontWeight: '600',
          color: 'var(--accent-emerald)'
        }}>
          <IconTrendingUp size={14} color="var(--accent-emerald)" />
          <span>{change}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
