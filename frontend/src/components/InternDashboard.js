import React, { useState, useEffect } from 'react';
import { 
  IconDashboard, 
  IconClock, 
  IconFileText, 
  IconCheckSquare, 
  IconCalendar, 
  IconLogOut 
} from './common/Icons';

const TASKS_STORAGE_KEY = 'internsync_tasks_data';

const defaultTasks = [
  { id: 1, title: 'Design Glassmorphism Dashboard UI Components', project: 'IMS Workspace', internName: 'Sarah Chen', due: '2026-08-20', priority: 'HIGH', status: 'COMPLETED' },
  { id: 2, title: 'Implement Candidate PDF Parsing Module', project: 'Talent Engine', internName: 'Sarah Chen', due: '2026-08-25', priority: 'MEDIUM', status: 'IN PROGRESS' },
  { id: 3, title: 'Write Integration Test Suites for Auth API', project: 'Security Suite', internName: 'David Kim', due: '2026-08-28', priority: 'HIGH', status: 'PENDING' }
];

const InternDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [activePdf, setActivePdf] = useState(null);
  const [punchedIn, setPunchedIn] = useState(false);
  const [punchedOut, setPunchedOut] = useState(false);

  const [reportSummary, setReportSummary] = useState('');
  const [blockers, setBlockers] = useState('');
  const [hoursSpent, setHoursSpent] = useState('8.0');
  const [reportMessage, setReportMessage] = useState('');

  const [reportsList, setReportsList] = useState([
    { id: 1, date: '2026-08-17', summary: 'Implemented candidate PDF parser and added unit tests.', blockers: 'None', hours: 8.0, status: 'APPROVED', feedback: 'Clean implementation.' },
    { id: 2, date: '2026-08-16', summary: 'Built responsive sidebar and glassmorphism styling.', blockers: 'Resolved CSS bleed', hours: 7.5, status: 'PENDING', feedback: 'Under review' }
  ]);

  // Synchronized tasks with Manager Hub
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem(TASKS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(defaultTasks));
    return defaultTasks;
  });

  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const [leaveType, setLeaveType] = useState('Sick Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveMessage, setLeaveMessage] = useState('');
  const [leavesList, setLeavesList] = useState([
    { id: 1, type: 'Casual Leave', dates: '2026-08-05 to 2026-08-06', reason: 'Personal errands', status: 'APPROVED' }
  ]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleReportSubmit = (e) => {
    e.preventDefault();
    const newReport = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      summary: reportSummary,
      blockers: blockers || 'None',
      hours: parseFloat(hoursSpent),
      status: 'PENDING',
      feedback: 'Pending RM review'
    };
    setReportsList([newReport, ...reportsList]);
    setReportMessage('✅ Work log submitted to Reporting Manager!');
    setReportSummary('');
    setBlockers('');
  };

  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    const newLeave = {
      id: Date.now(),
      type: leaveType,
      dates: `${startDate} to ${endDate}`,
      reason: leaveReason,
      status: 'PENDING'
    };
    setLeavesList([newLeave, ...leavesList]);
    setLeaveMessage('✅ Leave request sent to your assigned manager!');
    setStartDate('');
    setEndDate('');
    setLeaveReason('');
  };

  const toggleTaskStatus = (id) => {
    const updated = tasks.map(t => t.id === id ? { ...t, status: t.status === 'COMPLETED' ? 'IN PROGRESS' : 'COMPLETED' } : t);
    setTasks(updated);
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'radial-gradient(ellipse at top left, #0f172a 0%, #070b14 70%, #030712 100%)', color: '#ffffff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      
      {/* Sidebar */}
      <aside className="glass-card" style={{ width: '270px', borderRadius: '0 20px 20px 0', borderRight: '1px solid rgba(255,255,255,0.08)', padding: '28px 20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '36px', paddingLeft: '8px' }}>
          <div style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', padding: '10px', borderRadius: '12px', display: 'flex', boxShadow: '0 8px 16px -4px rgba(16,185,129,0.4)' }}>
            <span style={{ fontSize: '18px' }}>🎓</span>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.3px' }}>IMS Intern Portal</h3>
            <small style={{ color: '#6ee7b7', fontSize: '11px', fontWeight: '600' }}>Active Cohort 2026</small>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <button onClick={() => setActiveTab('overview')} className="nav-btn-motion" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'overview' ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'transparent', color: '#ffffff', cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
            <IconDashboard size={18} /> Workspace Overview
          </button>
          <button onClick={() => setActiveTab('punch')} className="nav-btn-motion" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'punch' ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'transparent', color: '#ffffff', cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
            <IconClock size={18} /> Attendance Terminal
          </button>
          <button onClick={() => setActiveTab('reports')} className="nav-btn-motion" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'reports' ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'transparent', color: '#ffffff', cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
            <IconFileText size={18} /> Daily Work Logs
          </button>
          <button onClick={() => setActiveTab('tasks')} className="nav-btn-motion" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'tasks' ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'transparent', color: '#ffffff', cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <IconCheckSquare size={18} /> <span>Sprint Deliverables</span>
            </div>
            <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>{tasks.length}</span>
          </button>
          <button onClick={() => setActiveTab('leave')} className="nav-btn-motion" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'leave' ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'transparent', color: '#ffffff', cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
            <IconCalendar size={18} /> Leave Center
          </button>
          <button onClick={() => setActiveTab('policies')} className="nav-btn-motion" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'policies' ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'transparent', color: '#ffffff', cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
            <IconFileText size={18} /> Company Policies
          </button>
        </nav>
      </aside>

      {/* Main View */}
      <main style={{ flex: 1, padding: '36px 44px', overflowY: 'auto' }}>
        
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: '800', margin: 0, color: '#ffffff', letterSpacing: '-0.5px' }}>Welcome, Sarah Chen ✨</h1>
              <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.3)' }}>ENGINEERING INTERN</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0 0' }}>Assigned Manager: <strong style={{ color: '#38bdf8' }}>👔 Alex Rivera</strong> • Department: <strong style={{ color: '#e2e8f0' }}>Frontend Architecture</strong></p>
          </div>
          <button onClick={handleLogout} className="nav-btn-motion" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', boxShadow: '0 8px 16px -4px rgba(225,29,72,0.4)' }}>
            <IconLogOut size={16} /> Logout
          </button>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px', marginBottom: '32px' }}>
              <div className="stat-card-3d" style={{ padding: '22px', borderRadius: '16px' }}>
                <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Tasks Completed</div>
                <div style={{ fontSize: '30px', fontWeight: '800', marginTop: '8px', color: '#ffffff' }}>{tasks.filter(t => t.status === 'COMPLETED').length} / {tasks.length}</div>
                <small style={{ color: '#10b981', fontSize: '11px', fontWeight: '600' }}>↗ Sprint Deliverables</small>
              </div>

              <div className="stat-card-3d" style={{ padding: '22px', borderRadius: '16px' }}>
                <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Attendance Days</div>
                <div style={{ fontSize: '30px', fontWeight: '800', marginTop: '8px', color: '#38bdf8' }}>14 Days</div>
                <small style={{ color: '#38bdf8', fontSize: '11px', fontWeight: '600' }}>↗ 100% Record</small>
              </div>

              <div className="stat-card-3d" style={{ padding: '22px', borderRadius: '16px' }}>
                <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Logged Hours</div>
                <div style={{ fontSize: '30px', fontWeight: '800', marginTop: '8px', color: '#a5b4fc' }}>98.5 hrs</div>
                <small style={{ color: '#a5b4fc', fontSize: '11px', fontWeight: '600' }}>↗ Avg 8.2 hrs / day</small>
              </div>

              <div className="stat-card-3d" style={{ padding: '22px', borderRadius: '16px' }}>
                <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Reports Logged</div>
                <div style={{ fontSize: '30px', fontWeight: '800', marginTop: '8px', color: '#fcd34d' }}>{reportsList.length}</div>
                <small style={{ color: '#fcd34d', fontSize: '11px', fontWeight: '600' }}>↗ Verified</small>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '26px', borderRadius: '18px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>Active Sprint Milestone</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(15,23,42,0.6)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: '#ffffff' }}>Sprint #3: Enterprise Management System Rollout</h4>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>Implement dark 3D UI, multi-tenant state persistence, and task synchronization.</p>
                </div>
                <span style={{ padding: '6px 14px', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', borderRadius: '20px', fontSize: '12px', fontWeight: '700', border: '1px solid rgba(56,189,248,0.3)' }}>IN PROGRESS</span>
              </div>
            </div>
          </div>
        )}

        {/* PUNCH TAB */}
        {activeTab === 'punch' && (
          <div className="glass-card" style={{ padding: '36px', borderRadius: '20px', maxWidth: '560px' }}>
            <h2 style={{ marginTop: 0, fontSize: '20px', fontWeight: '800', color: '#ffffff' }}>Digital Attendance Punch</h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '24px' }}>Daily shift timing: 09:00 AM - 06:00 PM IST</p>

            <div style={{ fontSize: '42px', fontWeight: '900', textAlign: 'center', margin: '28px 0', color: '#38bdf8', letterSpacing: '2px' }}>
              {currentTime}
            </div>

            <div style={{ display: 'flex', gap: '14px' }}>
              <button onClick={() => setPunchedIn(true)} className="nav-btn-motion" style={{ flex: 1, padding: '14px', background: punchedIn ? 'rgba(5,150,105,0.4)' : 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#ffffff', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>
                {punchedIn ? '✓ Clocked In Today' : '⚡ Clock In / Punch In'}
              </button>
              <button onClick={() => setPunchedOut(true)} className="nav-btn-motion" style={{ flex: 1, padding: '14px', background: punchedOut ? 'rgba(225,29,72,0.4)' : 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)', color: '#ffffff', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>
                {punchedOut ? '✓ Clocked Out Today' : '🚪 Clock Out / Punch Out'}
              </button>
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <div>
            <div className="glass-card" style={{ padding: '30px', borderRadius: '18px', marginBottom: '28px' }}>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>Submit Daily Work Log</h2>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>Log achievements and sprint blockers for your manager Alex Rivera.</p>
              
              {reportMessage && <div style={{ padding: '12px 16px', background: 'rgba(5,150,105,0.2)', border: '1px solid #059669', color: '#6ee7b7', borderRadius: '10px', marginBottom: '18px', fontSize: '13px', fontWeight: '600' }}>{reportMessage}</div>}

              <form onSubmit={handleReportSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', fontWeight: '600', marginBottom: '6px' }}>What did you accomplish today? *</label>
                  <textarea value={reportSummary} onChange={(e) => setReportSummary(e.target.value)} required rows="3" placeholder="Describe features, commits, PR reviews, bugs fixed..." style={{ width: '100%', padding: '12px 14px', background: 'rgba(7,11,20,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', fontWeight: '600', marginBottom: '6px' }}>Blockers / Challenges</label>
                    <input type="text" value={blockers} onChange={(e) => setBlockers(e.target.value)} placeholder="e.g. Waiting on API endpoints..." style={{ width: '100%', padding: '12px', background: 'rgba(7,11,20,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', fontWeight: '600', marginBottom: '6px' }}>Hours Logged</label>
                    <input type="number" step="0.5" value={hoursSpent} onChange={(e) => setHoursSpent(e.target.value)} required style={{ width: '100%', padding: '12px', background: 'rgba(7,11,20,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px' }} />
                  </div>
                </div>

                <button type="submit" className="nav-btn-motion" style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
                  Submit Log to Manager →
                </button>
              </form>
            </div>

            <div className="glass-card" style={{ padding: '26px', borderRadius: '18px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>Previous Work Logs</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px' }}>Date</th>
                    <th style={{ padding: '12px' }}>Work Summary</th>
                    <th style={{ padding: '12px' }}>Blockers</th>
                    <th style={{ padding: '12px' }}>Hours</th>
                    <th style={{ padding: '12px' }}>RM Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsList.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px' }}>
                      <td style={{ padding: '12px', color: '#64748b' }}>{r.date}</td>
                      <td style={{ padding: '12px', fontWeight: '600', color: '#ffffff' }}>{r.summary}</td>
                      <td style={{ padding: '12px', color: '#94a3b8' }}>{r.blockers}</td>
                      <td style={{ padding: '12px', color: '#38bdf8' }}>{r.hours}h</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', background: r.status === 'APPROVED' ? 'rgba(5,150,105,0.2)' : 'rgba(217,119,6,0.2)', color: r.status === 'APPROVED' ? '#6ee7b7' : '#fcd34d', border: `1px solid ${r.status === 'APPROVED' ? '#059669' : '#d97706'}` }}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TASKS TAB (LIVE SYNCED DELIVERABLES) */}
        {activeTab === 'tasks' && (
          <div className="glass-card" style={{ padding: '28px', borderRadius: '18px' }}>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>My Sprint Deliverables ({tasks.length})</h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '24px' }}>Tasks assigned directly by your Reporting Manager in real-time.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tasks.map(t => (
                <div key={t.id} style={{ padding: '18px', background: 'rgba(15,23,42,0.6)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '700', color: t.status === 'COMPLETED' ? '#10b981' : '#ffffff', textDecoration: t.status === 'COMPLETED' ? 'line-through' : 'none' }}>
                        {t.title}
                      </span>
                      <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', background: t.priority === 'HIGH' ? 'rgba(225,29,72,0.2)' : 'rgba(2,132,199,0.2)', color: t.priority === 'HIGH' ? '#fda4af' : '#93c5fd', border: `1px solid ${t.priority === 'HIGH' ? '#e11d48' : '#0284c7'}` }}>
                        {t.priority}
                      </span>
                    </div>
                    <small style={{ color: '#94a3b8', display: 'block', marginTop: '4px' }}>Project: <strong style={{ color: '#cbd5e1' }}>{t.project}</strong> • Due: <strong style={{ color: '#a5b4fc' }}>{t.due}</strong> • Assigned to: <strong style={{ color: '#38bdf8' }}>{t.internName}</strong></small>
                  </div>
                  <button onClick={() => toggleTaskStatus(t.id)} className="nav-btn-motion" style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: t.status === 'COMPLETED' ? 'rgba(5,150,105,0.2)' : 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)', color: t.status === 'COMPLETED' ? '#6ee7b7' : '#ffffff', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>
                    {t.status === 'COMPLETED' ? '✓ Completed' : 'Mark Done'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LEAVE CENTER TAB */}
        {activeTab === 'leave' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="glass-card" style={{ padding: '28px', borderRadius: '18px' }}>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>Apply For Leave</h2>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>Sent to your assigned Reporting Manager for sanctioning.</p>
              {leaveMessage && <div style={{ padding: '12px 16px', background: 'rgba(5,150,105,0.2)', color: '#6ee7b7', border: '1px solid #059669', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>{leaveMessage}</div>}
              
              <form onSubmit={handleLeaveSubmit}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', fontWeight: '600', marginBottom: '6px' }}>Leave Category</label>
                  <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'rgba(7,11,20,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Exam / Academic Leave">Exam / Academic Leave</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', fontWeight: '600', marginBottom: '6px' }}>From</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required style={{ width: '100%', padding: '10px', background: 'rgba(7,11,20,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', fontWeight: '600', marginBottom: '6px' }}>To</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required style={{ width: '100%', padding: '10px', background: 'rgba(7,11,20,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', fontWeight: '600', marginBottom: '6px' }}>Reason</label>
                  <textarea value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} required rows="3" placeholder="State reasons..." style={{ width: '100%', padding: '10px', background: 'rgba(7,11,20,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
                </div>

                <button type="submit" className="nav-btn-motion" style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#ffffff', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', width: '100%' }}>
                  Submit Leave Request
                </button>
              </form>
            </div>

            <div className="glass-card" style={{ padding: '28px', borderRadius: '18px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>Leave Applications History</h3>
              {leavesList.map(l => (
                <div key={l.id} style={{ padding: '14px', background: 'rgba(15,23,42,0.6)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px', color: '#ffffff' }}>{l.type}</span>
                    <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', background: l.status === 'APPROVED' ? 'rgba(5,150,105,0.2)' : 'rgba(217,119,6,0.2)', color: l.status === 'APPROVED' ? '#6ee7b7' : '#fcd34d' }}>{l.status}</span>
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '6px' }}>Duration: {l.dates}</div>
                  <div style={{ color: '#cbd5e1', fontSize: '13px', marginTop: '4px' }}>Reason: {l.reason}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* POLICIES TAB */}
        {activeTab === 'policies' && (
          <div className="glass-card" style={{ padding: '32px', borderRadius: '20px' }}>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>Company Policies & NDA</h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '24px' }}>Official enterprise documentation for active interns.</p>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ padding: '20px', background: 'rgba(15,23,42,0.6)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#ffffff' }}>📜 Intern Code of Conduct & IP Protection</h4>
                  <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>Corporate workplace decorum, data confidentiality, and IP ownership.</p>
                </div>
                <button onClick={() => setActivePdf('code-of-conduct')} className="nav-btn-motion" style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
                  View Policy
                </button>
              </div>

              <div style={{ padding: '20px', background: 'rgba(15,23,42,0.6)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#ffffff' }}>⏰ Attendance & Leave Rules</h4>
                  <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>Daily shift timings (9:00 AM - 6:00 PM) and casual leave quotas.</p>
                </div>
                <button onClick={() => setActivePdf('attendance')} className="nav-btn-motion" style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
                  View Policy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* POLICY MODAL */}
        {activePdf && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', maxWidth: '600px', width: '100%', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#ffffff' }}>{activePdf === 'code-of-conduct' ? '📜 Official Intern Code of Conduct' : '⏰ Attendance & Leave Guidelines'}</h3>
                <button onClick={() => setActivePdf(null)} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>✕</button>
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.7', maxHeight: '350px', overflowY: 'auto' }}>
                {activePdf === 'code-of-conduct' ? (
                  <p>1. Proprietary source codes, database keys, and architecture designs remain strictly confidential.<br/>2. All IP developed during your tenure is the exclusive property of the enterprise.<br/>3. Maintain sprint delivery dates and participate actively in daily syncs.</p>
                ) : (
                  <p>1. Core office hours are 09:00 AM to 06:00 PM IST.<br/>2. Digital Punch-in is mandatory before 09:30 AM.<br/>3. Max 2 casual leaves allowed per 30-day cohort cycle with prior RM signoff.</p>
                )}
              </div>
              <button onClick={() => setActivePdf(null)} style={{ width: '100%', background: '#0284c7', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', marginTop: '24px' }}>
                I Acknowledge & Understand
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default InternDashboard;