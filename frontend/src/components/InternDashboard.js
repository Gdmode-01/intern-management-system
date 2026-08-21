import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  IconDashboard, 
  IconClock, 
  IconFileText, 
  IconCheckSquare, 
  IconCalendar, 
  IconLogOut 
} from './common/Icons';
import { DB } from '../services/store';

const InternDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(currentTab);

  const currentUser = JSON.parse(localStorage.getItem('user')) || {
    id: 5,
    full_name: 'Sarah Chen',
    email: 'intern@system.com',
    rm_id: 3,
    rm_name: 'Alex Rivera',
    department: 'Frontend Architecture'
  };

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [activePdf, setActivePdf] = useState(null);

  // Attendance State
  const [attendance, setAttendance] = useState(() => DB.getAttendance(currentUser.id));
  const [attendanceNotice, setAttendanceNotice] = useState('');

  // Tasks State
  const [tasks, setTasks] = useState([]);

  // Daily Report State
  const [reportSummary, setReportSummary] = useState('');
  const [blockers, setBlockers] = useState('');
  const [hoursSpent, setHoursSpent] = useState('8.0');
  const [reportMessage, setReportMessage] = useState('');
  const [reportsList, setReportsList] = useState([]);

  // Leaves State
  const [leaveType, setLeaveType] = useState('Sick Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveMessage, setLeaveMessage] = useState('');
  const [leavesList, setLeavesList] = useState([]);

  const reloadData = () => {
    // Synced tasks assigned by RM
    const allTasks = DB.getTasks();
    setTasks(allTasks.filter(t => t.intern_id === currentUser.id));

    const allReports = DB.getReports();
    setReportsList(allReports.filter(r => r.intern_id === currentUser.id));

    const allLeaves = DB.getLeaves();
    setLeavesList(allLeaves.filter(l => l.intern_id === currentUser.id));

    setAttendance(DB.getAttendance(currentUser.id));
  };

  useEffect(() => {
    reloadData();
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
  };

  // Live Punch-In (Instantly notifies RM)
  const handleClockIn = () => {
    const record = {
      ...attendance,
      clocked_in: true,
      clocked_out: false,
      clock_in_time: Date.now()
    };
    DB.saveAttendance(currentUser.id, record);
    setAttendance(record);
    setAttendanceNotice('⚡ Clocked In! Manager Alex Rivera can now see you as "Active On Duty".');
  };

  // Live Punch-Out (Computes hours and marks complete)
  const handleClockOut = () => {
    if (!attendance.clocked_in) {
      setAttendanceNotice('⚠️ Please Clock In first before Clocking Out.');
      return;
    }
    const durationHours = attendance.clock_in_time 
      ? Math.max(0.1, Number(((Date.now() - attendance.clock_in_time) / (1000 * 60 * 60)).toFixed(2))) 
      : 8.0;

    const record = {
      clocked_in: true,
      clocked_out: true,
      clock_in_time: attendance.clock_in_time,
      clock_out_time: Date.now(),
      total_hours: Number((attendance.total_hours + durationHours).toFixed(1))
    };
    DB.saveAttendance(currentUser.id, record);
    setAttendance(record);
    setAttendanceNotice(`✓ Clocked Out! Added +${durationHours} hrs to your Logged Hours.`);
  };

  // Toggle Deliverable Status
  const toggleTaskStatus = (id, currentStatus) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'IN PROGRESS' : 'COMPLETED';
    DB.updateTaskStatus(id, nextStatus);
    reloadData();
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!reportSummary.trim()) return;

    DB.submitReport({
      intern_id: currentUser.id,
      intern_name: currentUser.full_name,
      rm_id: currentUser.rm_id || 3,
      date: new Date().toISOString().split('T')[0],
      summary: reportSummary.trim(),
      blockers: blockers.trim() || 'None',
      hours: parseFloat(hoursSpent) || 8.0
    });

    setReportMessage('✅ Work log with blockers transmitted to Manager reviews!');
    setReportSummary('');
    setBlockers('');
    reloadData();

    setTimeout(() => setReportMessage(''), 3000);
  };

  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !leaveReason.trim()) return;

    DB.submitLeave({
      intern_id: currentUser.id,
      intern_name: currentUser.full_name,
      rm_id: currentUser.rm_id || 3,
      type: leaveType,
      start_date: startDate,
      end_date: endDate,
      reason: leaveReason.trim()
    });

    setLeaveMessage('✅ Leave request sent to assigned manager Alex Rivera!');
    setStartDate('');
    setEndDate('');
    setLeaveReason('');
    reloadData();

    setTimeout(() => setLeaveMessage(''), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'radial-gradient(ellipse at top left, #0f172a 0%, #070b14 70%, #030712 100%)', color: '#ffffff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      
      {/* Sidebar */}
      <aside className="glass-card" style={{ width: '270px', borderRadius: '0 20px 20px 0', padding: '28px 20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '36px', paddingLeft: '8px' }}>
          <div style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', padding: '10px', borderRadius: '12px', display: 'flex' }}>
            <span style={{ fontSize: '18px' }}>🎓</span>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#ffffff' }}>IMS Intern Portal</h3>
            <small style={{ color: '#6ee7b7', fontSize: '11px', fontWeight: '600' }}>Active Cohort 2026</small>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <button onClick={() => handleTabChange('overview')} className="nav-btn-motion" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'overview' ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'transparent', color: '#ffffff', cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
            <IconDashboard size={18} /> Workspace Overview
          </button>
          <button onClick={() => handleTabChange('punch')} className="nav-btn-motion" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'punch' ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'transparent', color: '#ffffff', cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
            <IconClock size={18} /> Attendance Terminal
          </button>
          <button onClick={() => handleTabChange('tasks')} className="nav-btn-motion" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'tasks' ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'transparent', color: '#ffffff', cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><IconCheckSquare size={18} /> <span>Sprint Deliverables</span></div>
            <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>{tasks.length}</span>
          </button>
          <button onClick={() => handleTabChange('reports')} className="nav-btn-motion" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'reports' ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'transparent', color: '#ffffff', cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
            <IconFileText size={18} /> Daily Work Logs
          </button>
          <button onClick={() => handleTabChange('leave')} className="nav-btn-motion" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'leave' ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'transparent', color: '#ffffff', cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
            <IconCalendar size={18} /> Leave Center
          </button>
          <button onClick={() => handleTabChange('policies')} className="nav-btn-motion" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'policies' ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'transparent', color: '#ffffff', cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
            <IconFileText size={18} /> Company Policies
          </button>
        </nav>
      </aside>

      {/* Main Container */}
      <main style={{ flex: 1, padding: '36px 44px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: '800', margin: 0, color: '#ffffff' }}>Welcome, {currentUser.full_name} ✨</h1>
              <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: 'rgba(16,185,129,0.15)', color: '#6ee7b7' }}>ENGINEERING INTERN</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0 0' }}>Assigned Manager: <strong style={{ color: '#38bdf8' }}>👔 {currentUser.rm_name || 'Alex Rivera'}</strong> • Department: <strong style={{ color: '#e2e8f0' }}>{currentUser.department || 'Frontend Architecture'}</strong></p>
          </div>
          <button onClick={handleLogout} className="nav-btn-motion" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
            <IconLogOut size={16} /> Logout
          </button>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px', marginBottom: '32px' }}>
              <div className="stat-card-3d" style={{ padding: '22px', borderRadius: '16px' }}>
                <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Tasks Assigned by RM</div>
                <div style={{ fontSize: '30px', fontWeight: '800', marginTop: '8px', color: '#ffffff' }}>{tasks.filter(t => t.status === 'COMPLETED').length} / {tasks.length}</div>
                <small style={{ color: '#10b981', fontSize: '11px', fontWeight: '600' }}>↗ Tasks Done</small>
              </div>

              <div className="stat-card-3d" style={{ padding: '22px', borderRadius: '16px' }}>
                <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Shift Status</div>
                <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '8px', color: attendance.clocked_in && !attendance.clocked_out ? '#10b981' : '#cbd5e1' }}>
                  {attendance.clocked_in && !attendance.clocked_out ? '🟢 On Duty' : '⚪ Shift Off'}
                </div>
                <small style={{ color: '#38bdf8', fontSize: '11px', fontWeight: '600' }}>Visible to Alex Rivera</small>
              </div>

              <div className="stat-card-3d" style={{ padding: '22px', borderRadius: '16px' }}>
                <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Logged Hours</div>
                <div style={{ fontSize: '30px', fontWeight: '800', marginTop: '8px', color: '#a5b4fc' }}>{attendance.total_hours} hrs</div>
                <small style={{ color: '#10b981', fontSize: '11px', fontWeight: '600' }}>↗ Live Calculated</small>
              </div>

              <div className="stat-card-3d" style={{ padding: '22px', borderRadius: '16px' }}>
                <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Reports Logged</div>
                <div style={{ fontSize: '30px', fontWeight: '800', marginTop: '8px', color: '#fcd34d' }}>{reportsList.length}</div>
                <small style={{ color: '#fcd34d', fontSize: '11px', fontWeight: '600' }}>↗ Synced with RM</small>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '26px', borderRadius: '18px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>Active Sprint Milestone</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(15,23,42,0.6)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: '#ffffff' }}>Sprint: Real-Time Mentorship & Tasks Lifecycle</h4>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>Tasks and punch-in status are directly monitored by Manager {currentUser.rm_name}.</p>
                </div>
                <span style={{ padding: '6px 14px', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>ACTIVE</span>
              </div>
            </div>
          </div>
        )}

        {/* PUNCH ATTENDANCE TAB */}
        {activeTab === 'punch' && (
          <div className="glass-card" style={{ padding: '36px', borderRadius: '20px', maxWidth: '560px' }}>
            <h2 style={{ marginTop: 0, fontSize: '20px', fontWeight: '800', color: '#ffffff' }}>Digital Attendance Punch</h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '24px' }}>Punch records are visible to your manager on their Live Attendance radar.</p>

            <div style={{ fontSize: '42px', fontWeight: '900', textAlign: 'center', margin: '28px 0', color: '#38bdf8', letterSpacing: '2px' }}>
              {currentTime}
            </div>

            {attendanceNotice && <div style={{ padding: '12px', background: 'rgba(56,189,248,0.15)', color: '#7dd3fc', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', textAlign: 'center', fontWeight: '600' }}>{attendanceNotice}</div>}

            <div style={{ display: 'flex', gap: '14px' }}>
              <button onClick={handleClockIn} disabled={attendance.clocked_in && !attendance.clocked_out} className="nav-btn-motion" style={{ flex: 1, padding: '14px', background: attendance.clocked_in && !attendance.clocked_out ? 'rgba(5,150,105,0.3)' : 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#ffffff', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>
                {attendance.clocked_in && !attendance.clocked_out ? '✓ Active On Duty' : '⚡ Clock In / Punch In'}
              </button>
              <button onClick={handleClockOut} disabled={!attendance.clocked_in || attendance.clocked_out} className="nav-btn-motion" style={{ flex: 1, padding: '14px', background: attendance.clocked_out ? 'rgba(225,29,72,0.3)' : 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)', color: '#ffffff', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>
                {attendance.clocked_out ? '✓ Clocked Out Today' : '🚪 Clock Out / Punch Out'}
              </button>
            </div>
          </div>
        )}

        {/* TASKS TAB (DELIVERABLES ASSIGNED BY RM) */}
        {activeTab === 'tasks' && (
          <div className="glass-card" style={{ padding: '28px', borderRadius: '18px' }}>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>My Sprint Deliverables ({tasks.length})</h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '24px' }}>Assigned directly by Manager {currentUser.rm_name}. Click to update progress.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {tasks.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>No active tasks assigned yet by your manager.</div>
              ) : (
                tasks.map(t => (
                  <div key={t.id} style={{ padding: '18px', background: 'rgba(15,23,42,0.6)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '15px', fontWeight: '700', color: t.status === 'COMPLETED' ? '#10b981' : '#ffffff', textDecoration: t.status === 'COMPLETED' ? 'line-through' : 'none' }}>
                          {t.title}
                        </span>
                        <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', background: t.priority === 'HIGH' ? 'rgba(225,29,72,0.2)' : 'rgba(2,132,199,0.2)', color: t.priority === 'HIGH' ? '#fda4af' : '#93c5fd' }}>
                          {t.priority}
                        </span>
                      </div>
                      <small style={{ color: '#94a3b8', display: 'block', marginTop: '6px' }}>Module: <strong style={{ color: '#cbd5e1' }}>{t.project}</strong> • Due Date: <strong style={{ color: '#a5b4fc' }}>{t.due_date || t.due}</strong></small>
                    </div>

                    <button onClick={() => toggleTaskStatus(t.id, t.status)} className="nav-btn-motion" style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: t.status === 'COMPLETED' ? 'rgba(5,150,105,0.2)' : 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)', color: t.status === 'COMPLETED' ? '#6ee7b7' : '#ffffff', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>
                      {t.status === 'COMPLETED' ? '✓ Completed' : 'Mark Done'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* DAILY REPORTS TAB */}
        {activeTab === 'reports' && (
          <div>
            <div className="glass-card" style={{ padding: '30px', borderRadius: '18px', marginBottom: '28px' }}>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>Submit Daily Work Log</h2>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>Transmits progress and blockers directly to Manager {currentUser.rm_name}.</p>
              
              {reportMessage && <div style={{ padding: '12px 16px', background: 'rgba(5,150,105,0.2)', border: '1px solid #059669', color: '#6ee7b7', borderRadius: '10px', marginBottom: '18px', fontSize: '13px', fontWeight: '600' }}>{reportMessage}</div>}

              <form onSubmit={handleReportSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', fontWeight: '600', marginBottom: '6px' }}>What did you accomplish today? *</label>
                  <textarea value={reportSummary} onChange={(e) => setReportSummary(e.target.value)} required rows="3" placeholder="Describe features, commits, PR reviews, bugs fixed..." style={{ width: '100%', padding: '12px 14px', background: 'rgba(7,11,20,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', fontWeight: '600', marginBottom: '6px' }}>Blockers / Challenges</label>
                    <input type="text" value={blockers} onChange={(e) => setBlockers(e.target.value)} placeholder="e.g. Waiting on database migration approval..." style={{ width: '100%', padding: '12px', background: 'rgba(7,11,20,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px' }} />
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
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>My Submission History</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px' }}>Date</th>
                    <th style={{ padding: '12px' }}>Work Summary</th>
                    <th style={{ padding: '12px' }}>Blockers / Challenges</th>
                    <th style={{ padding: '12px' }}>Hours</th>
                    <th style={{ padding: '12px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsList.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px' }}>
                      <td style={{ padding: '12px', color: '#64748b' }}>{r.date}</td>
                      <td style={{ padding: '12px', fontWeight: '600', color: '#ffffff' }}>{r.summary}</td>
                      <td style={{ padding: '12px', color: '#fcd34d' }}>{r.blockers || 'None'}</td>
                      <td style={{ padding: '12px', color: '#38bdf8' }}>{r.hours}h</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', background: r.status === 'APPROVED' ? 'rgba(5,150,105,0.2)' : 'rgba(217,119,6,0.2)', color: r.status === 'APPROVED' ? '#6ee7b7' : '#fcd34d' }}>
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
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required style={{ width: '100%', padding: '10px', background: 'rgba(7,11,20,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', fontWeight: '600', marginBottom: '6px' }}>To</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required style={{ width: '100%', padding: '10px', background: 'rgba(7,11,20,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', fontWeight: '600', marginBottom: '6px' }}>Reason</label>
                  <textarea value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} required rows="3" placeholder="State reasons..." style={{ width: '100%', padding: '10px', background: 'rgba(7,11,20,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
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
                  <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '6px' }}>Duration: {l.start_date} to {l.end_date}</div>
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
            <div style={{ display: 'grid', gap: '16px', marginTop: '20px' }}>
              <div style={{ padding: '20px', background: 'rgba(15,23,42,0.6)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#ffffff' }}>📜 Intern Code of Conduct & IP Protection</h4>
                  <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>Corporate workplace decorum, data confidentiality, and IP ownership.</p>
                </div>
                <button onClick={() => setActivePdf('code')} className="nav-btn-motion" style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>View Policy</button>
              </div>
            </div>
          </div>
        )}

        {/* PDF Policy Modal */}
        {activePdf && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', maxWidth: '600px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#ffffff' }}>📜 Official Intern Code of Conduct</h3>
                <button onClick={() => setActivePdf(null)} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>✕</button>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.7' }}>
                1. Proprietary source codes, database keys, and architecture designs remain strictly confidential.<br/>
                2. All IP developed during your tenure is the exclusive property of the enterprise.<br/>
                3. Maintain sprint delivery dates and participate actively in daily syncs.
              </p>
              <button onClick={() => setActivePdf(null)} style={{ width: '100%', background: '#0284c7', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', marginTop: '24px' }}>I Acknowledge & Understand</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InternDashboard;