import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  IconDashboard, 
  IconUsers, 
  IconBriefcase, 
  IconFileText, 
  IconCalendar, 
  IconLogOut 
} from './common/Icons';
import { DB } from '../services/store';

const RmDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';
  const [activeTab, setActiveTab] = useState(currentTab);

  const currentUser = JSON.parse(localStorage.getItem('user')) || {
    id: 3,
    full_name: 'Darrell Steward',
    email: 'darrell@system.com',
    role: 'rm'
  };

  const [interns] = useState(() => DB.getUsers().filter(u => u.role === 'intern' && u.internship_status !== 'completed'));
  const [tasks, setTasks] = useState(() => DB.getTasks());
  const [reports, setReports] = useState(() => DB.getReports());
  const [leaves, setLeaves] = useState(() => DB.getLeaves());

  // Task Modal State
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedInternId, setSelectedInternId] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [projectName, setProjectName] = useState('');
  const [priority, setPriority] = useState('HIGH');
  const [dueDate, setDueDate] = useState('');

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
  };

  const handleAssignTask = (e) => {
    e.preventDefault();
    if (!selectedInternId || !taskTitle.trim()) return;

    const targetIntern = interns.find(i => i.id.toString() === selectedInternId.toString());

    DB.assignTask({
      intern_id: Number(selectedInternId),
      intern_name: targetIntern ? targetIntern.full_name : 'Intern',
      rm_id: currentUser.id,
      title: taskTitle.trim(),
      project: projectName.trim() || 'IMS Deliverable',
      priority: priority,
      due_date: dueDate || '2026-08-30'
    });

    setTasks(DB.getTasks());
    setShowTaskModal(false);
    setTaskTitle('');
    setProjectName('');
    setDueDate('');
  };

  const handleReviewReport = (reportId, newStatus) => {
    DB.updateReportStatus(reportId, newStatus);
    setReports(DB.getReports());
  };

  const handleLeaveDecision = (leaveId, decision) => {
    DB.updateLeaveStatus(leaveId, decision);
    setLeaves(DB.getLeaves());
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f3f7', color: '#0f172a', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      
      {/* 1. DARK SLEEK SIDEBAR */}
      <aside style={{ width: '250px', background: '#111215', color: '#94a3b8', padding: '24px 16px', display: 'flex', flexDirection: 'column', zIndex: 20 }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px', marginBottom: '32px' }}>
          <div style={{ width: '32px', height: '32px', background: '#c8f135', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111215', fontWeight: '900', fontSize: '16px' }}>
            ⚡
          </div>
          <span style={{ color: '#ffffff', fontWeight: '800', fontSize: '15px', letterSpacing: '0.5px' }}>IMS PORTAL</span>
        </div>

        {/* Navigation Section */}
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '0 12px', marginBottom: '8px' }}>
          General
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '24px' }}>
          <button onClick={() => handleTabChange('dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '12px', border: 'none', background: activeTab === 'dashboard' ? '#22252a' : 'transparent', color: activeTab === 'dashboard' ? '#ffffff' : '#94a3b8', cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
            <IconDashboard size={18} /> Dashboard
          </button>
          <button onClick={() => handleTabChange('interns')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '12px', border: 'none', background: activeTab === 'interns' ? '#22252a' : 'transparent', color: activeTab === 'interns' ? '#ffffff' : '#94a3b8', cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
            <IconUsers size={18} /> Interns Directory
          </button>
        </nav>

        <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '0 12px', marginBottom: '8px' }}>
          Management
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <button onClick={() => handleTabChange('tasks')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '12px', border: 'none', background: activeTab === 'tasks' ? '#22252a' : 'transparent', color: activeTab === 'tasks' ? '#ffffff' : '#94a3b8', cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><IconBriefcase size={18} /> <span>Sprint Tasks</span></div>
            <span style={{ background: '#c8f135', color: '#111215', fontSize: '10px', padding: '2px 7px', borderRadius: '10px', fontWeight: '800' }}>{tasks.length}</span>
          </button>

          <button onClick={() => handleTabChange('reports')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '12px', border: 'none', background: activeTab === 'reports' ? '#22252a' : 'transparent', color: activeTab === 'reports' ? '#ffffff' : '#94a3b8', cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><IconFileText size={18} /> <span>Daily Reports</span></div>
            <span style={{ background: '#334155', color: '#f8fafc', fontSize: '10px', padding: '2px 7px', borderRadius: '10px', fontWeight: '700' }}>{reports.filter(r => r.status === 'PENDING').length}</span>
          </button>

          <button onClick={() => handleTabChange('leaves')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '12px', border: 'none', background: activeTab === 'leaves' ? '#22252a' : 'transparent', color: activeTab === 'leaves' ? '#ffffff' : '#94a3b8', cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><IconCalendar size={18} /> <span>Leave Approvals</span></div>
            <span style={{ background: '#ef4444', color: '#fff', fontSize: '10px', padding: '2px 7px', borderRadius: '10px', fontWeight: '700' }}>{leaves.filter(l => l.status === 'PENDING').length}</span>
          </button>
        </nav>

        {/* Logout */}
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '12px', border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontWeight: '700', fontSize: '13px', marginTop: 'auto' }}>
          <IconLogOut size={18} /> Logout
        </button>
      </aside>

      {/* 2. MAIN BENTO WORKSPACE */}
      <main style={{ flex: 1, padding: '24px 32px', display: 'flex', gap: '24px', overflowY: 'auto' }}>
        
        {/* Left 75% Grid */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Top Bar with Search */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: '#0f172a', letterSpacing: '-0.5px' }}>Dashboard</h1>
            <div style={{ width: '320px', position: 'relative' }}>
              <input type="text" placeholder="Search here anything..." style={{ width: '100%', padding: '10px 16px', borderRadius: '24px', border: '1px solid #e2e8f0', background: '#ffffff', fontSize: '13px', outline: 'none' }} />
            </div>
          </div>

          {/* 4 Stat KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div className="bento-card" style={{ padding: '18px 20px' }}>
              <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '600' }}>Total Interns</div>
              <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0 0' }}>{interns.length}</div>
              <small style={{ color: '#16a34a', fontSize: '11px', fontWeight: '700' }}>+12.5% vs last month</small>
            </div>

            <div className="bento-card" style={{ padding: '18px 20px' }}>
              <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '600' }}>Active Tasks</div>
              <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0 0' }}>{tasks.length}</div>
              <small style={{ color: '#16a34a', fontSize: '11px', fontWeight: '700' }}>+8.1% vs last month</small>
            </div>

            <div className="bento-card" style={{ padding: '18px 20px' }}>
              <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '600' }}>Pending Reports</div>
              <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0 0' }}>{reports.filter(r => r.status === 'PENDING').length}</div>
              <small style={{ color: '#ef4444', fontSize: '11px', fontWeight: '700' }}>Requires review</small>
            </div>

            <div className="bento-card" style={{ padding: '18px 20px' }}>
              <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '600' }}>Pending Leaves</div>
              <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '4px 0 0 0' }}>{leaves.filter(l => l.status === 'PENDING').length}</div>
              <small style={{ color: '#ef4444', fontSize: '11px', fontWeight: '700' }}>Decision required</small>
            </div>
          </div>

          {/* TAB: DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <>
              {/* Middle Row: Donut Split & Sprints Wave Chart */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '16px' }}>
                <div className="bento-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>Intern Department Split</h3>
                    <span style={{ fontSize: '11px', color: '#64748b', background: '#f8fafc', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>This Month ▾</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: 'conic-gradient(#c8f135 0% 45%, #111215 45% 75%, #94a3b8 75% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '65px', height: '65px', background: '#ffffff', borderRadius: '50%' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span><strong style={{ color: '#a3e635' }}>●</strong> Frontend Eng</span>
                        <strong>45%</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span><strong style={{ color: '#111215' }}>●</strong> Cloud Infra</span>
                        <strong>30%</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span><strong style={{ color: '#94a3b8' }}>●</strong> QA Testing</span>
                        <strong>25%</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bento-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>Sprint Efficiency Rate</h3>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>94.2% <span style={{ fontSize: '12px', color: '#16a34a' }}>+15.5%</span></div>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b', background: '#f8fafc', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>This Month ▾</span>
                  </div>

                  <svg viewBox="0 0 400 120" style={{ width: '100%', height: '110px' }}>
                    <defs>
                      <linearGradient id="limeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#c8f135" stopOpacity="0.6"/>
                        <stop offset="100%" stopColor="#c8f135" stopOpacity="0.0"/>
                      </linearGradient>
                    </defs>
                    <path d="M0,80 Q50,40 100,70 T200,30 T300,50 T400,20 L400,120 L0,120 Z" fill="url(#limeGrad)" />
                    <path d="M0,80 Q50,40 100,70 T200,30 T300,50 T400,20" fill="none" stroke="#a3e635" strokeWidth="3" />
                  </svg>
                </div>
              </div>

              {/* Bottom Table: Assigned Deliverables */}
              <div className="bento-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>Sprint Deliverables & Task Records</h3>
                  <button onClick={() => setShowTaskModal(true)} style={{ background: '#111215', color: '#c8f135', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                    + Assign Task
                  </button>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '10px 8px' }}>Task Title</th>
                      <th style={{ padding: '10px 8px' }}>Intern</th>
                      <th style={{ padding: '10px 8px' }}>Module</th>
                      <th style={{ padding: '10px 8px' }}>Priority</th>
                      <th style={{ padding: '10px 8px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(t => (
                      <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 8px', fontWeight: '700' }}>{t.title}</td>
                        <td style={{ padding: '12px 8px', color: '#64748b' }}>{t.intern_name}</td>
                        <td style={{ padding: '12px 8px' }}>{t.project}</td>
                        <td style={{ padding: '12px 8px' }}>
                          <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '800', background: t.priority === 'HIGH' ? '#fee2e2' : '#fef9c3', color: t.priority === 'HIGH' ? '#dc2626' : '#a16207' }}>
                            {t.priority}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', background: t.status === 'COMPLETED' ? '#dcfce7' : '#f1f5f9', color: t.status === 'COMPLETED' ? '#15803d' : '#475569' }}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* TAB: DAILY REPORTS REVIEW */}
          {activeTab === 'reports' && (
            <div className="bento-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '800', margin: '0 0 18px 0' }}>Daily Work Reports</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {reports.map(r => (
                  <div key={r.id} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px' }}>{r.intern_name} • {r.hours} hrs</div>
                      <p style={{ margin: '4px 0', fontSize: '13px', color: '#334155' }}><strong>Summary:</strong> {r.summary}</p>
                      <small style={{ color: '#ef4444' }}><strong>Blockers:</strong> {r.blockers || 'None'}</small>
                    </div>
                    {r.status === 'PENDING' ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleReviewReport(r.id, 'APPROVED')} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>✓ Approve</button>
                        <button onClick={() => handleReviewReport(r.id, 'REJECTED')} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>✕ Reject</button>
                      </div>
                    ) : (
                      <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', background: r.status === 'APPROVED' ? '#dcfce7' : '#fee2e2', color: r.status === 'APPROVED' ? '#15803d' : '#dc2626' }}>{r.status}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: LEAVE APPROVALS */}
          {activeTab === 'leaves' && (
            <div className="bento-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '800', margin: '0 0 18px 0' }}>Leave Applications</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {leaves.map(l => (
                  <div key={l.id} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px' }}>{l.intern_name} — {l.type}</div>
                      <small style={{ color: '#64748b' }}>Dates: {l.start_date} to {l.end_date}</small>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#334155' }}>Reason: {l.reason}</p>
                    </div>
                    {l.status === 'PENDING' ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleLeaveDecision(l.id, 'APPROVED')} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>✓ Approve</button>
                        <button onClick={() => handleLeaveDecision(l.id, 'REJECTED')} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>✕ Reject</button>
                      </div>
                    ) : (
                      <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', background: l.status === 'APPROVED' ? '#dcfce7' : '#fee2e2', color: l.status === 'APPROVED' ? '#15803d' : '#dc2626' }}>{l.status}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right 25% Sidebar Bento Panel */}
        <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="bento-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#c8f135', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
              DS
            </div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '14px' }}>{currentUser.full_name}</div>
              <small style={{ color: '#64748b', fontSize: '11px' }}>Admin Manager</small>
            </div>
          </div>

          <div className="bento-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>Review Channels</h3>
              <span style={{ fontSize: '10px', color: '#64748b' }}>This Month ▾</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Daily Work Logs</span>
                <strong>42% ↗</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Sprint PRs</span>
                <strong>28% ↗</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Leave Approvals</span>
                <strong>18% ↗</strong>
              </div>
            </div>
          </div>

          <div className="bento-card" style={{ padding: '20px', flex: 1 }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 16px 0' }}>Recent Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px' }}>
              <div>
                <div style={{ fontWeight: '700' }}>Sarah Chen</div>
                <div style={{ color: '#64748b' }}>Submitted daily blocker log.</div>
                <small style={{ color: '#94a3b8' }}>2 mins ago</small>
              </div>
              <div>
                <div style={{ fontWeight: '700' }}>David Kim</div>
                <div style={{ color: '#64748b' }}>Clocked In for shift.</div>
                <small style={{ color: '#94a3b8' }}>15 mins ago</small>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Task Assignment Modal */}
      {showTaskModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '18px', padding: '28px', maxWidth: '500px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '800' }}>Assign Sprint Task</h3>
            <form onSubmit={handleAssignTask}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Select Intern</label>
                <select value={selectedInternId} onChange={(e) => setSelectedInternId(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <option value="">Choose intern...</option>
                  {interns.map(i => <option key={i.id} value={i.id}>{i.full_name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Task Title</label>
                <input type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required placeholder="e.g. Design UI Components" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Module / Project</label>
                <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g. Talent Engine" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Due Date</label>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowTaskModal(false)} style={{ flex: 1, padding: '10px', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', background: '#111215', color: '#c8f135', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Confirm Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default RmDashboard;