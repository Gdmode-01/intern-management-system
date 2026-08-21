import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  IconDashboard, 
  IconUsers, 
  IconFileText, 
  IconCalendar, 
  IconLogOut 
} from './common/Icons';
import { DB } from '../services/store';

const RmDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'reports';
  const [activeTab, setActiveTab] = useState(currentTab);

  const currentUser = JSON.parse(localStorage.getItem('user')) || {
    id: 3,
    full_name: 'Alex Rivera',
    email: 'rm@system.com',
    role: 'rm'
  };

  const [interns, setInterns] = useState([]);
  const [reports, setReports] = useState([]);
  const [leaves, setLeaves] = useState([]);

  const reloadData = () => {
    const allUsers = DB.getUsers();
    // Filter active interns assigned to this manager or enterprise pool
    const myInterns = allUsers.filter(u => u.role === 'intern' && u.internship_status !== 'completed');
    setInterns(myInterns);

    // Cross-role synced reports
    const allReports = DB.getReports();
    setReports(allReports);

    // Cross-role synced leaves
    const allLeaves = DB.getLeaves();
    setLeaves(allLeaves);
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
  };

  // TC-006: Daily Report Approval Persistence
  const handleReviewReport = (reportId, newStatus) => {
    DB.updateReportStatus(reportId, newStatus);
    reloadData();
  };

  // TC-007: Leave Approval Persistence
  const handleLeaveDecision = (leaveId, decision) => {
    DB.updateLeaveStatus(leaveId, decision);
    reloadData();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const pendingReports = reports.filter(r => r.status === 'PENDING');
  const pendingLeaves = leaves.filter(l => l.status === 'PENDING');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'radial-gradient(ellipse at top left, #1e1b4b 0%, #070b14 70%, #030712 100%)', color: '#ffffff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      
      {/* Sidebar */}
      <aside className="glass-card" style={{ width: '270px', borderRadius: '0 20px 20px 0', padding: '28px 20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '36px', paddingLeft: '8px' }}>
          <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', padding: '10px', borderRadius: '12px', display: 'flex' }}>
            <span style={{ fontSize: '18px' }}>👔</span>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#ffffff' }}>Manager Hub</h3>
            <small style={{ color: '#a5b4fc', fontSize: '11px', fontWeight: '600' }}>Mentorship & Reviews</small>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <button onClick={() => handleTabChange('overview')} className="nav-btn-motion" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'overview' ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : 'transparent', color: '#ffffff', cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
            <IconDashboard size={18} /> Command Center
          </button>

          <button onClick={() => handleTabChange('interns')} className="nav-btn-motion" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'interns' ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : 'transparent', color: '#ffffff', cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><IconUsers size={18} /> <span>My Interns</span></div>
            <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>{interns.length}</span>
          </button>

          <button onClick={() => handleTabChange('reports')} className="nav-btn-motion" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'reports' ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : 'transparent', color: '#ffffff', cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><IconFileText size={18} /> <span>Daily Reports</span></div>
            <span style={{ background: '#d97706', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>{pendingReports.length}</span>
          </button>

          <button onClick={() => handleTabChange('leaves')} className="nav-btn-motion" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'leaves' ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : 'transparent', color: '#ffffff', cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><IconCalendar size={18} /> <span>Leave Approvals</span></div>
            <span style={{ background: '#e11d48', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>{pendingLeaves.length}</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '36px 44px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: '800', margin: 0, color: '#ffffff' }}>Manager Command Center 👔</h1>
              <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}>{currentUser.full_name}</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0 0' }}>Review daily intern blockers, approve work logs, and sanction leave applications.</p>
          </div>
          <button onClick={handleLogout} className="nav-btn-motion" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
            <IconLogOut size={16} /> Logout
          </button>
        </div>

        {/* Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px', marginBottom: '32px' }}>
          <div className="stat-card-3d" style={{ padding: '22px', borderRadius: '16px' }}>
            <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Assigned Interns</div>
            <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '8px', color: '#38bdf8' }}>{interns.length}</div>
            <small style={{ color: '#10b981', fontSize: '11px', fontWeight: '600' }}>↗ Active Cohort</small>
          </div>

          <div className="stat-card-3d" style={{ padding: '22px', borderRadius: '16px' }}>
            <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Pending Reports</div>
            <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '8px', color: '#fcd34d' }}>{pendingReports.length}</div>
            <small style={{ color: '#f59e0b', fontSize: '11px', fontWeight: '600' }}>↗ Requires Signoff</small>
          </div>

          <div className="stat-card-3d" style={{ padding: '22px', borderRadius: '16px' }}>
            <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Pending Leaves</div>
            <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '8px', color: '#fda4af' }}>{pendingLeaves.length}</div>
            <small style={{ color: '#e11d48', fontSize: '11px', fontWeight: '600' }}>↗ Decision Required</small>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="glass-card" style={{ padding: '26px', borderRadius: '18px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>Active Mentorship Summary</h3>
            <div style={{ padding: '16px', background: 'rgba(15,23,42,0.6)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>Monitoring {interns.length} assigned interns across sprint deliverables and daily submissions.</p>
            </div>
          </div>
        )}

        {/* TAB 2: MY INTERNS */}
        {activeTab === 'interns' && (
          <div className="glass-card" style={{ borderRadius: '18px', padding: '26px' }}>
            <h3 style={{ margin: '0 0 18px 0', fontSize: '17px', fontWeight: '700', color: '#ffffff' }}>My Mentored Interns ({interns.length})</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {interns.map(i => (
                <div key={i.id} style={{ background: 'rgba(15,23,42,0.6)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#ffffff', fontWeight: '700' }}>{i.full_name}</h4>
                      <div style={{ color: '#94a3b8', fontSize: '13px' }}>{i.email}</div>
                    </div>
                    <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', background: 'rgba(5,150,105,0.2)', color: '#6ee7b7' }}>ACTIVE</span>
                  </div>
                  <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <div><span style={{ color: '#64748b' }}>Department:</span> <strong style={{ color: '#38bdf8' }}>{i.department || 'Engineering'}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DAILY REPORTS (DISPLAYS BLOCKERS & PERSISTS APPROVAL) */}
        {activeTab === 'reports' && (
          <div className="glass-card" style={{ borderRadius: '18px', padding: '26px' }}>
            <h3 style={{ margin: '0 0 18px 0', fontSize: '17px', fontWeight: '700', color: '#ffffff' }}>Daily Work Report Reviews ({reports.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {reports.map(r => (
                <div key={r.id} style={{ background: 'rgba(15,23,42,0.6)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '15px', color: '#ffffff' }}>{r.intern_name || 'Sarah Chen'}</strong>
                      <span style={{ color: '#94a3b8', fontSize: '12px', marginLeft: '12px' }}>Date: {r.date} • {r.hours} Hours Logged</span>
                    </div>
                    <span style={{ padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', background: r.status === 'APPROVED' ? 'rgba(5,150,105,0.2)' : 'rgba(217,119,6,0.2)', color: r.status === 'APPROVED' ? '#6ee7b7' : '#fcd34d' }}>
                      {r.status}
                    </span>
                  </div>

                  <p style={{ margin: '10px 0 6px 0', fontSize: '13px', color: '#cbd5e1' }}><strong>Summary:</strong> {r.summary}</p>
                  
                  {/* TC-005 Blocker Visibility */}
                  <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#fda4af' }}>
                    <strong>Blockers / Challenges:</strong> {r.blockers || 'None'}
                  </p>

                  {r.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button onClick={() => handleReviewReport(r.id, 'APPROVED')} className="nav-btn-motion" style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>
                        ✓ Approve Report
                      </button>
                      <button onClick={() => handleReviewReport(r.id, 'REJECTED')} className="nav-btn-motion" style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>
                        ✕ Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: LEAVE APPROVALS (CROSS-ROLE SYNCED & PERSISTENT) */}
        {activeTab === 'leaves' && (
          <div className="glass-card" style={{ borderRadius: '18px', padding: '26px' }}>
            <h3 style={{ margin: '0 0 18px 0', fontSize: '17px', fontWeight: '700', color: '#ffffff' }}>Leave Requests & Approvals ({leaves.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {leaves.map(l => (
                <div key={l.id} style={{ background: 'rgba(15,23,42,0.6)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#ffffff', fontWeight: '700' }}>{l.intern_name || 'Sarah Chen'} — {l.type}</h4>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>Dates: {l.start_date} to {l.end_date} • Reason: <span style={{ color: '#cbd5e1' }}>{l.reason}</span></div>
                  </div>
                  {l.status === 'PENDING' ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleLeaveDecision(l.id, 'APPROVED')} className="nav-btn-motion" style={{ background: '#059669', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>✓ Approve</button>
                      <button onClick={() => handleLeaveDecision(l.id, 'REJECTED')} className="nav-btn-motion" style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>✕ Reject</button>
                    </div>
                  ) : (
                    <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', background: l.status === 'APPROVED' ? 'rgba(5,150,105,0.2)' : 'rgba(225,29,72,0.2)', color: l.status === 'APPROVED' ? '#6ee7b7' : '#fda4af' }}>{l.status}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RmDashboard;