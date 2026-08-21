import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  IconDashboard, 
  IconUsers, 
  IconBriefcase, 
  IconFileText, 
  IconCalendar, 
  IconClock, 
  IconLogOut, 
  IconPlus 
} from './common/Icons';
import { DB } from '../services/store';

const RmDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(currentTab);

  const currentUser = JSON.parse(localStorage.getItem('user')) || {
    id: 3,
    full_name: 'Alex Rivera',
    email: 'rm@system.com',
    role: 'rm'
  };

  const [interns, setInterns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [reports, setReports] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});

  // Task Form State
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedInternId, setSelectedInternId] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [projectName, setProjectName] = useState('');
  const [priority, setPriority] = useState('HIGH');
  const [dueDate, setDueDate] = useState('');
  const [taskSuccessMsg, setTaskSuccessMsg] = useState('');

  const reloadData = () => {
    const allUsers = DB.getUsers();
    const myInterns = allUsers.filter(u => u.role === 'intern' && u.internship_status !== 'completed');
    setInterns(myInterns);

    // Fetch live attendance for all assigned interns
    const attObj = {};
    myInterns.forEach(intern => {
      attObj[intern.id] = DB.getAttendance(intern.id);
    });
    setAttendanceMap(attObj);

    setTasks(DB.getTasks());
    setReports(DB.getReports());
    setLeaves(DB.getLeaves());
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
  };

  // Assign Task Handler
  const handleAssignTask = (e) => {
    e.preventDefault();
    if (!selectedInternId || !taskTitle.trim()) return;

    const targetIntern = interns.find(i => i.id.toString() === selectedInternId.toString());

    DB.assignTask({
      intern_id: Number(selectedInternId),
      intern_name: targetIntern ? targetIntern.full_name : 'Intern',
      rm_id: currentUser.id,
      title: taskTitle.trim(),
      project: projectName.trim() || 'IMS Sprint',
      priority: priority,
      due_date: dueDate || '2026-08-30'
    });

    setTaskSuccessMsg(`✅ Task assigned to ${targetIntern?.full_name} successfully!`);
    setTaskTitle('');
    setProjectName('');
    setDueDate('');
    reloadData();

    setTimeout(() => {
      setShowTaskModal(false);
      setTaskSuccessMsg('');
    }, 1200);
  };

  const handleReviewReport = (reportId, newStatus) => {
    DB.updateReportStatus(reportId, newStatus);
    reloadData();
  };

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
  const activeDutyCount = Object.values(attendanceMap).filter(a => a.clocked_in && !a.clocked_out).length;

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
            <small style={{ color: '#a5b4fc', fontSize: '11px', fontWeight: '600' }}>Mentorship & Sprints</small>
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

          <button onClick={() => handleTabChange('attendance')} className="nav-btn-motion" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'attendance' ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : 'transparent', color: '#ffffff', cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><IconClock size={18} /> <span>Live Attendance</span></div>
            <span style={{ background: '#10b981', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>{activeDutyCount} Active</span>
          </button>

          <button onClick={() => handleTabChange('tasks')} className="nav-btn-motion" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'tasks' ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : 'transparent', color: '#ffffff', cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><IconBriefcase size={18} /> <span>Sprint Deliverables</span></div>
            <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>{tasks.length}</span>
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
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0 0' }}>Assign sprint tasks, monitor live intern punch-ins, and approve daily work logs.</p>
          </div>
          <button onClick={handleLogout} className="nav-btn-motion" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
            <IconLogOut size={16} /> Logout
          </button>
        </div>

        {/* Global Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px', marginBottom: '32px' }}>
          <div className="stat-card-3d" style={{ padding: '22px', borderRadius: '16px' }}>
            <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Assigned Interns</div>
            <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '8px', color: '#38bdf8' }}>{interns.length}</div>
            <small style={{ color: '#10b981', fontSize: '11px', fontWeight: '600' }}>↗ Under Mentorship</small>
          </div>

          <div className="stat-card-3d" style={{ padding: '22px', borderRadius: '16px' }}>
            <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Clocked-In Right Now</div>
            <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '8px', color: '#10b981' }}>{activeDutyCount}</div>
            <small style={{ color: '#10b981', fontSize: '11px', fontWeight: '600' }}>🟢 Active Shift</small>
          </div>

          <div className="stat-card-3d" style={{ padding: '22px', borderRadius: '16px' }}>
            <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Active Tasks</div>
            <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '8px', color: '#a5b4fc' }}>{tasks.length}</div>
            <small style={{ color: '#38bdf8', fontSize: '11px', fontWeight: '600' }}>↗ Sprint Deliverables</small>
          </div>

          <div className="stat-card-3d" style={{ padding: '22px', borderRadius: '16px' }}>
            <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Pending Reviews</div>
            <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '8px', color: '#fcd34d' }}>{pendingReports.length + pendingLeaves.length}</div>
            <small style={{ color: '#f59e0b', fontSize: '11px', fontWeight: '600' }}>↗ Reports & Leaves</small>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="glass-card" style={{ padding: '28px', borderRadius: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#ffffff' }}>Active Interns Overview & Live Status</h3>
              <button onClick={() => { setShowTaskModal(true); handleTabChange('tasks'); }} className="nav-btn-motion" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>
                + Assign New Sprint Task
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {interns.map(i => {
                const att = attendanceMap[i.id] || {};
                const isOnline = att.clocked_in && !att.clocked_out;
                return (
                  <div key={i.id} style={{ background: 'rgba(15,23,42,0.6)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#ffffff', fontWeight: '700' }}>{i.full_name}</h4>
                        <div style={{ color: '#94a3b8', fontSize: '13px' }}>{i.email}</div>
                      </div>
                      <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', background: isOnline ? 'rgba(5,150,105,0.2)' : 'rgba(255,255,255,0.08)', color: isOnline ? '#6ee7b7' : '#94a3b8', border: isOnline ? '1px solid #059669' : '1px solid rgba(255,255,255,0.1)' }}>
                        {isOnline ? '🟢 ACTIVE ON DUTY' : (att.clocked_out ? '🔴 CLOCKED OUT' : '⚪ NOT PUNCHED')}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '12px' }}>
                      <div><span style={{ color: '#64748b' }}>Department:</span> <strong style={{ color: '#38bdf8' }}>{i.department || 'Engineering'}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Total Logged:</span> <strong style={{ color: '#a5b4fc' }}>{att.total_hours || 0} hrs</strong></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: LIVE ATTENDANCE (FULL RADAR) */}
        {activeTab === 'attendance' && (
          <div className="glass-card" style={{ borderRadius: '18px', padding: '26px' }}>
            <h3 style={{ margin: '0 0 18px 0', fontSize: '17px', fontWeight: '700', color: '#ffffff' }}>Live Attendance & Punch Records</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 12px' }}>Intern Name</th>
                  <th style={{ padding: '14px 12px' }}>Email</th>
                  <th style={{ padding: '14px 12px' }}>Shift Status</th>
                  <th style={{ padding: '14px 12px' }}>Clock In Time</th>
                  <th style={{ padding: '14px 12px' }}>Total Working Hours</th>
                </tr>
              </thead>
              <tbody>
                {interns.map(i => {
                  const att = attendanceMap[i.id] || {};
                  const isOnline = att.clocked_in && !att.clocked_out;
                  return (
                    <tr key={i.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px' }}>
                      <td style={{ padding: '14px 12px', fontWeight: '700', color: '#ffffff' }}>{i.full_name}</td>
                      <td style={{ padding: '14px 12px', color: '#94a3b8' }}>{i.email}</td>
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', background: isOnline ? 'rgba(5,150,105,0.2)' : 'rgba(255,255,255,0.08)', color: isOnline ? '#6ee7b7' : '#94a3b8' }}>
                          {isOnline ? '🟢 ON DUTY' : (att.clocked_out ? '🔴 PUNCHED OUT' : '⚪ ABSENT / NOT IN')}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px', color: '#38bdf8' }}>
                        {att.clock_in_time ? new Date(att.clock_in_time).toLocaleTimeString() : 'N/A'}
                      </td>
                      <td style={{ padding: '14px 12px', fontWeight: '700', color: '#a5b4fc' }}>
                        {att.total_hours || 0} hrs
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: TASK ASSIGNMENT & SPRINT DELIVERABLES */}
        {activeTab === 'tasks' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>Assigned Sprint Deliverables ({tasks.length})</h3>
              <button onClick={() => setShowTaskModal(!showTaskModal)} className="nav-btn-motion" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                <IconPlus size={16} /> {showTaskModal ? 'Close Form' : '+ Assign New Sprint Task'}
              </button>
            </div>

            {/* Task Creation Form */}
            {showTaskModal && (
              <div className="glass-card" style={{ padding: '28px', borderRadius: '18px', marginBottom: '24px', border: '1px solid rgba(99,102,241,0.3)' }}>
                <h4 style={{ margin: '0 0 6px 0', color: '#ffffff', fontSize: '16px', fontWeight: '700' }}>Assign Task to Mentored Intern</h4>
                <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>Assigned task will instantly appear on the selected intern's sprint board.</p>

                {taskSuccessMsg && <div style={{ padding: '12px 16px', background: 'rgba(5,150,105,0.2)', border: '1px solid #059669', color: '#6ee7b7', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', fontWeight: '600' }}>{taskSuccessMsg}</div>}

                <form onSubmit={handleAssignTask}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', fontWeight: '600', marginBottom: '6px' }}>Select Intern *</label>
                      <select value={selectedInternId} onChange={(e) => setSelectedInternId(e.target.value)} required style={{ width: '100%', padding: '12px', background: 'rgba(7,11,20,0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', fontSize: '13px' }}>
                        <option value="">Choose intern...</option>
                        {interns.map(i => (
                          <option key={i.id} value={i.id}>🎓 {i.full_name} ({i.email})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', fontWeight: '600', marginBottom: '6px' }}>Project / Module Name</label>
                      <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g. Talent Engine or Auth Module" style={{ width: '100%', padding: '12px 14px', background: 'rgba(7,11,20,0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', fontSize: '13px' }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', fontWeight: '600', marginBottom: '6px' }}>Task Title & Description *</label>
                    <input type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required placeholder="e.g. Implement Candidate PDF Parsing & Validation Algorithm" style={{ width: '100%', padding: '12px 14px', background: 'rgba(7,11,20,0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', fontSize: '13px' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', fontWeight: '600', marginBottom: '6px' }}>Due Date</label>
                      <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={{ width: '100%', padding: '12px', background: 'rgba(7,11,20,0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', fontSize: '13px' }} />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', fontWeight: '600', marginBottom: '6px' }}>Priority Level</label>
                      <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ width: '100%', padding: '12px', background: 'rgba(7,11,20,0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', fontSize: '13px' }}>
                        <option value="HIGH">HIGH PRIORITY</option>
                        <option value="MEDIUM">MEDIUM PRIORITY</option>
                        <option value="LOW">LOW PRIORITY</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="nav-btn-motion" style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
                    Confirm & Assign Task →
                  </button>
                </form>
              </div>
            )}

            {/* Task List */}
            <div className="glass-card" style={{ borderRadius: '18px', padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tasks.map(t => (
                  <div key={t.id} style={{ background: 'rgba(15,23,42,0.6)', padding: '18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h4 style={{ margin: 0, fontSize: '15px', color: '#ffffff', fontWeight: '700' }}>{t.title}</h4>
                        <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', background: t.priority === 'HIGH' ? 'rgba(225,29,72,0.2)' : 'rgba(2,132,199,0.2)', color: t.priority === 'HIGH' ? '#fda4af' : '#93c5fd', border: `1px solid ${t.priority === 'HIGH' ? '#e11d48' : '#0284c7'}` }}>
                          {t.priority}
                        </span>
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '6px' }}>
                        Project: <strong style={{ color: '#cbd5e1' }}>{t.project}</strong> • Assigned To: <strong style={{ color: '#38bdf8' }}>🎓 {t.intern_name}</strong> • Deadline: <strong style={{ color: '#a5b4fc' }}>{t.due_date || t.due}</strong>
                      </div>
                    </div>

                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: t.status === 'COMPLETED' ? 'rgba(5,150,105,0.2)' : 'rgba(217,119,6,0.2)', color: t.status === 'COMPLETED' ? '#6ee7b7' : '#fcd34d', border: `1px solid ${t.status === 'COMPLETED' ? '#059669' : '#d97706'}` }}>
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: REPORTS */}
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
                  <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#fda4af' }}><strong>Blockers / Challenges:</strong> {r.blockers || 'None'}</p>

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

        {/* TAB 5: LEAVES */}
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