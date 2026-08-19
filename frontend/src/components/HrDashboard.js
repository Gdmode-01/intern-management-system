import React, { useState, useEffect } from 'react';
import { IconUsers, IconBriefcase, IconPlus, IconLogOut, IconCheckSquare } from './common/Icons';

const USERS_STORAGE_KEY = 'internsync_users_data';

const defaultSeedData = [
  { id: 1, full_name: 'Alex Rivera', email: 'rm@system.com', role: 'rm', department: 'Engineering' },
  { id: 2, full_name: 'Vikram Malhotra', email: 'vikram@system.com', role: 'rm', department: 'Cloud Infrastructure' },
  { id: 3, full_name: 'Sarah Chen', email: 'intern@system.com', role: 'intern', internship_status: 'active', rm_id: 1, rm_name: 'Alex Rivera', department: 'Frontend Architecture' },
  { id: 4, full_name: 'David Kim', email: 'david@system.com', role: 'intern', internship_status: 'active', rm_id: 1, rm_name: 'Alex Rivera', department: 'Cloud Infrastructure' },
  { id: 5, full_name: 'Emily Watson', email: 'emily@system.com', role: 'intern', internship_status: 'completed', rm_id: 2, rm_name: 'Vikram Malhotra', department: 'Data Science' }
];

const HrDashboard = () => {
  const [activeTab, setActiveTab] = useState('active-interns');
  
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultSeedData));
    return defaultSeedData;
  });

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('intern');
  const [department, setDepartment] = useState('');
  const [assignedRmId, setAssignedRmId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  const managers = users.filter(u => u.role?.toLowerCase() === 'rm');
  const activeInterns = users.filter(u => u.role?.toLowerCase() === 'intern' && u.internship_status !== 'completed');
  const alumniInterns = users.filter(u => u.role?.toLowerCase() === 'intern' && u.internship_status === 'completed');

  const handleAssignRm = (internId, newRmId) => {
    const selectedManager = managers.find(m => m.id.toString() === newRmId.toString());
    const rmName = selectedManager ? selectedManager.full_name : 'Unassigned';

    const updated = users.map(u => {
      if (u.id === internId) {
        return { ...u, rm_id: newRmId, rm_name: rmName };
      }
      return u;
    });

    setUsers(updated);
  };

  const handleCompleteIntern = (userId, currentStatus) => {
    const nextStatus = currentStatus === 'completed' ? 'active' : 'completed';
    const updated = users.map(u => u.id === userId ? { ...u, internship_status: nextStatus } : u);
    setUsers(updated);
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!email || !fullName) return;

    setLoading(true);
    setMessage('');

    const selectedManager = managers.find(m => m.id.toString() === assignedRmId.toString());
    const defaultManager = managers.length > 0 ? managers[0] : null;
    const assignedManager = role === 'intern' ? (selectedManager || defaultManager) : null;

    const newUserObj = {
      id: Date.now(),
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      role: role,
      department: department || (role === 'intern' ? 'Engineering' : 'Technology'),
      internship_status: 'active',
      rm_id: assignedManager ? assignedManager.id : null,
      rm_name: assignedManager ? assignedManager.full_name : null
    };

    setUsers([newUserObj, ...users]);

    setMessage(`✅ ${role.toUpperCase()} "${fullName}" onboarded and mapped successfully!`);
    setEmail('');
    setFullName('');
    setDepartment('');
    setLoading(false);

    setTimeout(() => {
      setActiveTab(role === 'rm' ? 'managers' : 'active-interns');
      setMessage('');
    }, 1200);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'radial-gradient(ellipse at top left, #082f49 0%, #070b14 70%, #030712 100%)', color: '#ffffff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      
      {/* Sidebar */}
      <aside className="glass-card" style={{ width: '270px', borderRadius: '0 20px 20px 0', borderRight: '1px solid rgba(255,255,255,0.08)', padding: '28px 20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '36px', paddingLeft: '8px' }}>
          <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', padding: '10px', borderRadius: '12px', display: 'flex', boxShadow: '0 8px 16px -4px rgba(2,132,199,0.4)' }}>
            <span style={{ fontSize: '18px' }}>👑</span>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.3px' }}>HR Talent Center</h3>
            <small style={{ color: '#38bdf8', fontSize: '11px', fontWeight: '600' }}>Lifecycle & RM Mapping</small>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <button 
            onClick={() => setActiveTab('active-interns')} 
            className="nav-btn-motion"
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', border: 'none', 
              background: activeTab === 'active-interns' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'transparent', color: '#ffffff', 
              cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '13px' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IconUsers size={18} /> <span>Active Interns</span>
            </div>
            <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>{activeInterns.length}</span>
          </button>

          <button 
            onClick={() => setActiveTab('alumni')} 
            className="nav-btn-motion"
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', border: 'none', 
              background: activeTab === 'alumni' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'transparent', color: '#ffffff', 
              cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '13px' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IconCheckSquare size={18} /> <span>Alumni / Completed</span>
            </div>
            <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>{alumniInterns.length}</span>
          </button>

          <button 
            onClick={() => setActiveTab('managers')} 
            className="nav-btn-motion"
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', border: 'none', 
              background: activeTab === 'managers' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'transparent', color: '#ffffff', 
              cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '13px' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IconBriefcase size={18} /> <span>Reporting Managers</span>
            </div>
            <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>{managers.length}</span>
          </button>

          <button 
            onClick={() => setActiveTab('create')} 
            className="nav-btn-motion"
            style={{ 
              display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', border: 'none', 
              background: activeTab === 'create' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'rgba(15,23,42,0.6)', color: '#38bdf8', 
              cursor: 'pointer', textAlign: 'left', fontWeight: '700', fontSize: '13px', marginTop: '14px', border: '1px solid rgba(56,189,248,0.2)' 
            }}
          >
            <IconPlus size={18} /> <span>+ Onboard New User</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '36px 44px', overflowY: 'auto' }}>
        
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: '800', margin: 0, color: '#ffffff', letterSpacing: '-0.5px' }}>Internship Lifecycle Management</h1>
              <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)' }}>HR ADMINISTRATION</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0 0' }}>Assign Reporting Managers (RMs), monitor active cohort progress, and archive graduated alumni.</p>
          </div>
          <button onClick={handleLogout} className="nav-btn-motion" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', boxShadow: '0 8px 16px -4px rgba(225,29,72,0.4)' }}>
            <IconLogOut size={16} /> Logout
          </button>
        </div>

        {/* 3D Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px', marginBottom: '32px' }}>
          <div className="stat-card-3d" style={{ padding: '22px', borderRadius: '16px' }}>
            <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Active Interns</div>
            <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '8px', color: '#38bdf8' }}>{activeInterns.length}</div>
            <small style={{ color: '#10b981', fontSize: '11px', fontWeight: '600' }}>↗ In Active Mentorship</small>
          </div>

          <div className="stat-card-3d" style={{ padding: '22px', borderRadius: '16px' }}>
            <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Reporting Managers</div>
            <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '8px', color: '#a5b4fc' }}>{managers.length}</div>
            <small style={{ color: '#a5b4fc', fontSize: '11px', fontWeight: '600' }}>↗ Managing Sprints</small>
          </div>

          <div className="stat-card-3d" style={{ padding: '22px', borderRadius: '16px' }}>
            <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Graduated Alumni</div>
            <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '8px', color: '#fcd34d' }}>{alumniInterns.length}</div>
            <small style={{ color: '#fcd34d', fontSize: '11px', fontWeight: '600' }}>↗ Certified & Completed</small>
          </div>
        </div>

        {/* TAB 1: ACTIVE INTERNS (WITH RM ALLOCATION) */}
        {activeTab === 'active-interns' && (
          <div className="glass-card" style={{ borderRadius: '18px', padding: '26px' }}>
            <h3 style={{ margin: '0 0 18px 0', color: '#ffffff', fontSize: '17px', fontWeight: '700' }}>Active Interns & RM Allocations ({activeInterns.length})</h3>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 12px' }}>ID</th>
                  <th style={{ padding: '14px 12px' }}>Intern Name</th>
                  <th style={{ padding: '14px 12px' }}>Email</th>
                  <th style={{ padding: '14px 12px' }}>Assigned Manager (RM)</th>
                  <th style={{ padding: '14px 12px' }}>Status</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeInterns.map(intern => (
                  <tr key={intern.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px' }}>
                    <td style={{ padding: '14px 12px', color: '#64748b' }}>#{intern.id}</td>
                    <td style={{ padding: '14px 12px', fontWeight: '700', color: '#ffffff', fontSize: '14px' }}>{intern.full_name}</td>
                    <td style={{ padding: '14px 12px', color: '#94a3b8' }}>{intern.email}</td>
                    
                    {/* Inline RM Selector */}
                    <td style={{ padding: '14px 12px' }}>
                      <select 
                        value={intern.rm_id || ''} 
                        onChange={(e) => handleAssignRm(intern.id, e.target.value)}
                        style={{ padding: '8px 12px', background: 'rgba(7,11,20,0.8)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '8px', color: '#38bdf8', fontSize: '13px', fontWeight: '700', outline: 'none' }}
                      >
                        <option value="">Select Manager...</option>
                        {managers.map(m => (
                          <option key={m.id} value={m.id}>👔 {m.full_name} ({m.department || 'Management'})</option>
                        ))}
                      </select>
                    </td>

                    <td style={{ padding: '14px 12px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: 'rgba(5,150,105,0.2)', color: '#6ee7b7', border: '1px solid #059669' }}>
                        ACTIVE
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleCompleteIntern(intern.id, intern.internship_status)}
                        className="nav-btn-motion"
                        style={{ background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                      >
                        🎓 Graduate to Alumni
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: ALUMNI DIRECTORY */}
        {activeTab === 'alumni' && (
          <div className="glass-card" style={{ borderRadius: '18px', padding: '26px' }}>
            <h3 style={{ margin: '0 0 18px 0', color: '#38bdf8', fontSize: '17px', fontWeight: '700' }}>🎓 Graduated Alumni Directory ({alumniInterns.length})</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 12px' }}>ID</th>
                  <th style={{ padding: '14px 12px' }}>Intern Name</th>
                  <th style={{ padding: '14px 12px' }}>Email</th>
                  <th style={{ padding: '14px 12px' }}>Mentored By</th>
                  <th style={{ padding: '14px 12px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {alumniInterns.map(intern => (
                  <tr key={intern.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px' }}>
                    <td style={{ padding: '14px 12px', color: '#64748b' }}>#{intern.id}</td>
                    <td style={{ padding: '14px 12px', fontWeight: '700', color: '#ffffff', fontSize: '14px' }}>{intern.full_name}</td>
                    <td style={{ padding: '14px 12px', color: '#94a3b8' }}>{intern.email}</td>
                    <td style={{ padding: '14px 12px', color: '#a5b4fc' }}>👔 {intern.rm_name || 'Alex Rivera'}</td>
                    <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleCompleteIntern(intern.id, intern.internship_status)}
                        className="nav-btn-motion"
                        style={{ background: 'rgba(15,23,42,0.8)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                      >
                        ↩ Revert to Active
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: MANAGERS */}
        {activeTab === 'managers' && (
          <div className="glass-card" style={{ borderRadius: '18px', padding: '26px' }}>
            <h3 style={{ margin: '0 0 18px 0', color: '#ffffff', fontSize: '17px', fontWeight: '700' }}>Reporting Managers Directory ({managers.length})</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 12px' }}>ID</th>
                  <th style={{ padding: '14px 12px' }}>Manager Name</th>
                  <th style={{ padding: '14px 12px' }}>Email Address</th>
                  <th style={{ padding: '14px 12px' }}>Department</th>
                  <th style={{ padding: '14px 12px' }}>Assigned Interns</th>
                </tr>
              </thead>
              <tbody>
                {managers.map(m => {
                  const count = users.filter(u => u.role?.toLowerCase() === 'intern' && u.rm_id?.toString() === m.id?.toString() && u.internship_status !== 'completed').length;
                  return (
                    <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px' }}>
                      <td style={{ padding: '14px 12px', color: '#64748b' }}>#{m.id}</td>
                      <td style={{ padding: '14px 12px', fontWeight: '700', color: '#ffffff', fontSize: '14px' }}>{m.full_name}</td>
                      <td style={{ padding: '14px 12px', color: '#94a3b8' }}>{m.email}</td>
                      <td style={{ padding: '14px 12px', color: '#38bdf8', fontWeight: '600' }}>{m.department || 'Engineering'}</td>
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{ padding: '4px 10px', background: 'rgba(79,70,229,0.2)', color: '#c7d2fe', border: '1px solid #4f46e5', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                          {count} Interns Mapped
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: CREATE / ONBOARD USER */}
        {activeTab === 'create' && (
          <div className="glass-card" style={{ borderRadius: '20px', padding: '36px', maxWidth: '540px' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>Onboard New User & Map RM</h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '24px' }}>Creates credential and persists it across all organizational views.</p>
            
            {message && <div style={{ padding: '12px 16px', background: 'rgba(5,150,105,0.2)', color: '#6ee7b7', border: '1px solid #059669', borderRadius: '10px', marginBottom: '20px', fontSize: '13px', fontWeight: '600' }}>{message}</div>}
            
            <form onSubmit={handleCreateUser}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', fontWeight: '600', marginBottom: '6px' }}>User Role</label>
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)} 
                  style={{ width: '100%', padding: '12px', background: 'rgba(7,11,20,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                >
                  <option value="intern">Intern</option>
                  <option value="rm">Reporting Manager (RM)</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', fontWeight: '600', marginBottom: '6px' }}>Full Name *</label>
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(7,11,20,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', boxSizing: 'border-box', fontSize: '13px' }} 
                  placeholder="e.g. Vikram Singh" 
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', fontWeight: '600', marginBottom: '6px' }}>Email Address *</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(7,11,20,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', boxSizing: 'border-box', fontSize: '13px' }} 
                  placeholder="user@company.com" 
                />
              </div>

              {role === 'intern' && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#38bdf8', fontWeight: '600', marginBottom: '6px' }}>Assign Reporting Manager (RM) *</label>
                  <select 
                    value={assignedRmId} 
                    onChange={(e) => setAssignedRmId(e.target.value)} 
                    style={{ width: '100%', padding: '12px', background: 'rgba(7,11,20,0.7)', border: '1px solid #0284c7', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                  >
                    {managers.map(m => (
                      <option key={m.id} value={m.id}>👔 {m.full_name} ({m.department || 'Management'})</option>
                    ))}
                  </select>
                </div>
              )}

              {role === 'rm' && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', fontWeight: '600', marginBottom: '6px' }}>Department</label>
                  <input 
                    type="text" 
                    value={department} 
                    onChange={(e) => setDepartment(e.target.value)} 
                    style={{ width: '100%', padding: '12px 14px', background: 'rgba(7,11,20,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', boxSizing: 'border-box', fontSize: '13px' }} 
                    placeholder="e.g. Cloud Infrastructure" 
                  />
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading} 
                className="nav-btn-motion"
                style={{ width: '100%', background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)', color: '#ffffff', border: 'none', padding: '13px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', marginTop: '10px', fontSize: '14px', boxShadow: '0 8px 16px -4px rgba(2,132,199,0.4)' }}
              >
                {loading ? 'Onboarding...' : 'Create Account & Persist'}
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
};

export default HrDashboard;