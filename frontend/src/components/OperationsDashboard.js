import React, { useState } from 'react';
import { IconDashboard, IconUsers, IconLogOut } from './common/Icons';

const USERS_STORAGE_KEY = 'internsync_users_data';

const OperationsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const getUsers = () => {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  };

  const [users] = useState(getUsers);

  const interns = users.filter(u => u.role === 'intern');
  const activeInterns = interns.filter(u => u.internship_status !== 'completed');
  const alumni = interns.filter(u => u.internship_status === 'completed');
  const managers = users.filter(u => u.role === 'rm');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'radial-gradient(ellipse at top left, #451a03 0%, #070b14 70%, #030712 100%)', color: '#ffffff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      
      {/* Sidebar */}
      <aside className="glass-card" style={{ width: '270px', borderRadius: '0 20px 20px 0', borderRight: '1px solid rgba(255,255,255,0.08)', padding: '28px 20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '36px', paddingLeft: '8px' }}>
          <div style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', padding: '10px', borderRadius: '12px', display: 'flex', boxShadow: '0 8px 16px -4px rgba(217,119,6,0.4)' }}>
            <span style={{ fontSize: '18px' }}>⚙️</span>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.3px' }}>Operations</h3>
            <small style={{ color: '#fde68a', fontSize: '11px', fontWeight: '600' }}>Executive Control</small>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <button onClick={() => setActiveTab('overview')} className="nav-btn-motion" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'overview' ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' : 'transparent', color: '#ffffff', cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
            <IconDashboard size={18} /> Executive Overview
          </button>
          <button onClick={() => setActiveTab('roster')} className="nav-btn-motion" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'roster' ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' : 'transparent', color: '#ffffff', cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
            <IconUsers size={18} /> Organization Audit
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '36px 44px', overflowY: 'auto' }}>
        
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: '800', margin: 0, color: '#ffffff', letterSpacing: '-0.5px' }}>Operations Command Dashboard</h1>
              <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: 'rgba(217,119,6,0.15)', color: '#fde68a', border: '1px solid rgba(217,119,6,0.3)' }}>OPS ADMIN</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0 0' }}>Enterprise headcount, active sprints oversight, and cohort metrics.</p>
          </div>
          <button onClick={handleLogout} className="nav-btn-motion" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', boxShadow: '0 8px 16px -4px rgba(225,29,72,0.4)' }}>
            <IconLogOut size={16} /> Logout
          </button>
        </div>

        {/* 3D Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px', marginBottom: '32px' }}>
          <div className="stat-card-3d" style={{ padding: '22px', borderRadius: '16px' }}>
            <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Total Headcount</div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#ffffff', marginTop: '8px' }}>{users.length}</div>
            <small style={{ color: '#38bdf8', fontSize: '11px', fontWeight: '600' }}>Enterprise Wide</small>
          </div>

          <div className="stat-card-3d" style={{ padding: '22px', borderRadius: '16px' }}>
            <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Active Interns</div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#10b981', marginTop: '8px' }}>{activeInterns.length}</div>
            <small style={{ color: '#10b981', fontSize: '11px', fontWeight: '600' }}>Under Mentorship</small>
          </div>

          <div className="stat-card-3d" style={{ padding: '22px', borderRadius: '16px' }}>
            <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Reporting Managers</div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#818cf8', marginTop: '8px' }}>{managers.length}</div>
            <small style={{ color: '#818cf8', fontSize: '11px', fontWeight: '600' }}>Across Departments</small>
          </div>

          <div className="stat-card-3d" style={{ padding: '22px', borderRadius: '16px' }}>
            <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Graduated Alumni</div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#f59e0b', marginTop: '8px' }}>{alumni.length}</div>
            <small style={{ color: '#f59e0b', fontSize: '11px', fontWeight: '600' }}>Archived Cohorts</small>
          </div>
        </div>

        {/* Audit Table */}
        <div className="glass-card" style={{ borderRadius: '18px', padding: '26px' }}>
          <h3 style={{ margin: '0 0 18px 0', fontSize: '17px', fontWeight: '700', color: '#ffffff' }}>System-Wide User Audit</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 12px' }}>ID</th>
                <th style={{ padding: '14px 12px' }}>Full Name</th>
                <th style={{ padding: '14px 12px' }}>Email</th>
                <th style={{ padding: '14px 12px' }}>Role</th>
                <th style={{ padding: '14px 12px' }}>Mapped RM / Dept</th>
                <th style={{ padding: '14px 12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px' }}>
                  <td style={{ padding: '14px 12px', color: '#64748b' }}>#{u.id}</td>
                  <td style={{ padding: '14px 12px', fontWeight: '700', color: '#ffffff', fontSize: '14px' }}>{u.full_name}</td>
                  <td style={{ padding: '14px 12px', color: '#94a3b8' }}>{u.email}</td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', background: 'rgba(255,255,255,0.08)', color: '#cbd5e1' }}>
                      {u.role?.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', color: '#38bdf8', fontWeight: '600' }}>{u.rm_name ? `👔 ${u.rm_name}` : (u.department || 'N/A')}</td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: u.internship_status === 'completed' ? 'rgba(79,70,229,0.2)' : 'rgba(5,150,105,0.2)', color: u.internship_status === 'completed' ? '#a5b4fc' : '#6ee7b7', border: `1px solid ${u.internship_status === 'completed' ? '#4f46e5' : '#059669'}` }}>
                      {u.internship_status ? u.internship_status.toUpperCase() : 'ACTIVE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default OperationsDashboard;