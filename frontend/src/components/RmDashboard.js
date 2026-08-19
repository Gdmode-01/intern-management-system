import React, { useState, useEffect } from 'react';
import { 
  IconDashboard, 
  IconUsers, 
  IconBriefcase, 
  IconFileText, 
  IconCalendar, 
  IconLogOut,
  IconPlus
} from './common/Icons';

const USERS_STORAGE_KEY = 'internsync_users_data';
const TASKS_STORAGE_KEY = 'internsync_tasks_data';

const defaultTasks = [
  { id: 1, title: 'Design Glassmorphism Dashboard UI Components', project: 'IMS Workspace', internName: 'Sarah Chen', due: '2026-08-20', priority: 'HIGH', status: 'COMPLETED' },
  { id: 2, title: 'Implement Candidate PDF Parsing Module', project: 'Talent Engine', internName: 'Sarah Chen', due: '2026-08-25', priority: 'MEDIUM', status: 'IN PROGRESS' },
  { id: 3, title: 'Write Integration Test Suites for Auth API', project: 'Security Suite', internName: 'David Kim', due: '2026-08-28', priority: 'HIGH', status: 'PENDING' }
];

const RmDashboard = () => {
  const [activeTab, setActiveTab] = useState('projects');
  
  // 1. Mapped Interns from HR
  const getAssignedInterns = () => {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.filter(u => u.role === 'intern' && u.internship_status !== 'completed');
    } catch {
      return [];
    }
  };

  const interns = getAssignedInterns();

  // 2. Shared Tasks State
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

  // Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedIntern, setSelectedIntern] = useState('');
  const [projectName, setProjectName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('HIGH');
  const [taskMessage, setTaskMessage] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);

  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const [reports, setReports] = useState([
    { id: 1, internName: 'Sarah Chen', date: '2026-08-17', summary: 'Implemented candidate PDF parser and added unit tests.', blockers: 'None', hours: 8.0, status: 'PENDING' },
    { id: 2, internName: 'David Kim', date: '2026-08-17', summary: 'Configured Dockerized PostgreSQL database pool.', blockers: 'Port conflict on staging', hours: 7.5, status: 'PENDING' }
  ]);

  const [leaves, setLeaves] = useState([
    { id: 1, internName: 'Sarah Chen', type: 'Sick Leave', dates: '2026-08-21 to 2026-08-22', reason: 'Fever and rest', status: 'PENDING' }
  ]);

  const handleAssignTask = (e) => {
    e.preventDefault();
    if (!taskTitle || !selectedIntern) return;

    const newTask = {
      id: Date.now(),
      title: taskTitle.trim(),
      project: projectName.trim() || 'IMS Sprint Core',
      internName: selectedIntern,
      due: dueDate || '2026-08-30',
      priority: priority,
      status: 'PENDING'
    };

    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updatedTasks));

    setTaskMessage(`✅ Task assigned to ${selectedIntern} successfully!`);
    setTaskTitle('');
    setProjectName('');
    setDueDate('');
    
    setTimeout(() => {
      setShowTaskForm(false);
      setTaskMessage('');
    }, 1200);
  };

  const handleReviewReport = (reportId, newStatus) => {
    setReports(reports.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
  };

  const handleLeaveDecision = (leaveId, decision) => {
    setLeaves(leaves.map(l => l.id === leaveId ? { ...l, status: decision } : l));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'radial-gradient(ellipse at top left, #1e1b4b 0%, #070b14 70%, #030712 100%)', color: '#ffffff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      
      {/* Sidebar */}
      <aside className="glass-card" style={{ width: '270px', borderRadius: '0 20px 20px 0', borderRight: '1px solid rgba(255,255,255,0.08)', padding: '28px 20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '36px', paddingLeft: '8px' }}>
          <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', padding: '10px', borderRadius: '12px', display: 'flex', boxShadow: '0 8px 16px -4px rgba(79,70,229,0.4)' }}>
            <span style={{ fontSize: '18px' }}>👔</span>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.3px' }}>Manager Hub</h3>
            <small style={{ color: '#a5b4fc', fontSize: '11px', fontWeight: '600' }}>Mentorship & Sprints</small>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <button onClick={() => setActiveTab('overview')} className="nav-btn-motion" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'overview' ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : 'transparent', color: '#ffffff', cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
            <IconDashboard size={18} /> Command Center
          </button>

          <button onClick={() => setActiveTab('interns')} className="nav-btn-motion" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'interns' ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : 'transparent', color: '#ffffff', cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IconUsers size={18} /> <span>My Interns</span>
            </div>
            <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>{interns.length}</span>
          </button>

          <button onClick={() => setActiveTab('projects')} className="nav-btn-motion" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'projects' ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : 'transparent', color: '#ffffff', cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IconBriefcase size={18} /> <span>Projects & Sprints</span>
            </div>
            <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>{tasks.length}</span>
          </button>

          <button onClick={() => setActiveTab('reports')} className="nav-btn-motion" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'reports' ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : 'transparent', color: '#ffffff', cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IconFileText size={18} /> <span>Daily Reports</span>
            </div>
            <span style={{ background: '#d97706', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>{reports.filter(r => r.status === 'PENDING').length}</span>
          </button>

          <button onClick={() => setActiveTab('leaves')} className="nav-btn-motion" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', border: 'none', background: activeTab === 'leaves' ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : 'transparent', color: '#ffffff', cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IconCalendar size={18} /> <span>Leave Approvals</span>
            </div>
            <span style={{ background: '#e11d48', color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>{leaves.filter(l => l.status === 'PENDING').length}</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '36px 44px', overflowY: 'auto' }}>
        
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: '800', margin: 0, color: '#ffffff', letterSpacing: '-0.5px' }}>Manager Command Center 👔</h1>
              <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}>REPORTING MANAGER</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0 0' }}>Assign sprint tasks to mentored interns, review work logs, and approve leaves.</p>
          </div>
          <button onClick={handleLogout} className="nav-btn-motion" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', boxShadow: '0 8px 16px -4px rgba(225,29,72,0.4)' }}>
            <IconLogOut size={16} /> Logout
          </button>
        </div>

        {/* 3D Glowing Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px', marginBottom: '32px' }}>
          <div className="stat-card-3d" style={{ padding: '22px', borderRadius: '16px' }}>
            <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Assigned Interns</div>
            <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '8px', color: '#38bdf8' }}>{interns.length}</div>
            <small style={{ color: '#10b981', fontSize: '11px', fontWeight: '600' }}>↗ Under Mentorship</small>
          </div>

          <div className="stat-card-3d" style={{ padding: '22px', borderRadius: '16px' }}>
            <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Active Tasks</div>
            <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '8px', color: '#a5b4fc' }}>{tasks.length}</div>
            <small style={{ color: '#38bdf8', fontSize: '11px', fontWeight: '600' }}>↗ Assigned Sprints</small>
          </div>

          <div className="stat-card-3d" style={{ padding: '22px', borderRadius: '16px' }}>
            <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Pending Reports</div>
            <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '8px', color: '#fcd34d' }}>{reports.filter(r => r.status === 'PENDING').length}</div>
            <small style={{ color: '#f59e0b', fontSize: '11px', fontWeight: '600' }}>↗ Requires Signoff</small>
          </div>

          <div className="stat-card-3d" style={{ padding: '22px', borderRadius: '16px' }}>
            <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Pending Leaves</div>
            <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '8px', color: '#fda4af' }}>{leaves.filter(l => l.status === 'PENDING').length}</div>
            <small style={{ color: '#e11d48', fontSize: '11px', fontWeight: '600' }}>↗ Decision Required</small>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="glass-card" style={{ padding: '26px', borderRadius: '18px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>Active Sprint Milestone Overview</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(15,23,42,0.6)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', color: '#ffffff' }}>Cohort Sprint Milestone: System Architecture Deliverables</h4>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>Monitoring {interns.length} assigned interns with {tasks.length} total active sprint deliverables.</p>
              </div>
              <span style={{ padding: '6px 14px', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', borderRadius: '20px', fontSize: '12px', fontWeight: '700', border: '1px solid rgba(99,102,241,0.4)' }}>ACTIVE MILESTONE</span>
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
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#ffffff', fontWeight: '700' }}>{i.full_name || i.name}</h4>
                      <div style={{ color: '#94a3b8', fontSize: '13px' }}>{i.email}</div>
                    </div>
                    <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', background: 'rgba(5,150,105,0.2)', color: '#6ee7b7', border: '1px solid #059669' }}>
                      ACTIVE COHORT
                    </span>
                  </div>
                  <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <div><span style={{ color: '#64748b' }}>Department:</span> <strong style={{ color: '#38bdf8' }}>{i.department || 'Engineering'}</strong></div>
                    <div><span style={{ color: '#64748b' }}>Assigned RM:</span> <strong style={{ color: '#a5b4fc' }}>{i.rm_name || 'Alex Rivera'}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PROJECTS & ASSIGN TASKS (FULL TASK ASSIGNMENT WORKFLOW) */}
        {activeTab === 'projects' && (
          <div>
            {/* Header with Assign Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>Assigned Sprint Tasks & Deliverables ({tasks.length})</h3>
              <button 
                onClick={() => setShowTaskForm(!showTaskForm)} 
                className="nav-btn-motion" 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', boxShadow: '0 8px 16px -4px rgba(79,70,229,0.4)' }}
              >
                <IconPlus size={16} /> {showTaskForm ? 'Close Form' : '+ Assign New Task'}
              </button>
            </div>

            {/* Task Assignment Form Panel */}
            {showTaskForm && (
              <div className="glass-card" style={{ padding: '28px', borderRadius: '18px', marginBottom: '24px', border: '1px solid rgba(99,102,241,0.3)' }}>
                <h4 style={{ margin: '0 0 6px 0', color: '#ffffff', fontSize: '16px', fontWeight: '700' }}>Assign Task to Mentored Intern</h4>
                <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>Assigned task will instantly appear on the selected intern's sprint board.</p>

                {taskMessage && <div style={{ padding: '12px 16px', background: 'rgba(5,150,105,0.2)', border: '1px solid #059669', color: '#6ee7b7', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', fontWeight: '600' }}>{taskMessage}</div>}

                <form onSubmit={handleAssignTask}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', fontWeight: '600', marginBottom: '6px' }}>Select Intern *</label>
                      <select 
                        value={selectedIntern} 
                        onChange={(e) => setSelectedIntern(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '12px', background: 'rgba(7,11,20,0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                      >
                        <option value="">Choose intern...</option>
                        {interns.map(i => (
                          <option key={i.id} value={i.full_name || i.name}>🎓 {i.full_name || i.name} ({i.email})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', fontWeight: '600', marginBottom: '6px' }}>Project / Module Name</label>
                      <input 
                        type="text" 
                        value={projectName} 
                        onChange={(e) => setProjectName(e.target.value)} 
                        placeholder="e.g. Talent Engine or Auth Module" 
                        style={{ width: '100%', padding: '12px 14px', background: 'rgba(7,11,20,0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', boxSizing: 'border-box', fontSize: '13px' }} 
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', fontWeight: '600', marginBottom: '6px' }}>Task Title & Description *</label>
                    <input 
                      type="text" 
                      value={taskTitle} 
                      onChange={(e) => setTaskTitle(e.target.value)} 
                      required 
                      placeholder="e.g. Implement Candidate PDF Parsing & Validation Algorithm" 
                      style={{ width: '100%', padding: '12px 14px', background: 'rgba(7,11,20,0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', boxSizing: 'border-box', fontSize: '13px' }} 
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', fontWeight: '600', marginBottom: '6px' }}>Due Date</label>
                      <input 
                        type="date" 
                        value={dueDate} 
                        onChange={(e) => setDueDate(e.target.value)} 
                        style={{ width: '100%', padding: '12px', background: 'rgba(7,11,20,0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', boxSizing: 'border-box', fontSize: '13px' }} 
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', fontWeight: '600', marginBottom: '6px' }}>Priority Level</label>
                      <select 
                        value={priority} 
                        onChange={(e) => setPriority(e.target.value)} 
                        style={{ width: '100%', padding: '12px', background: 'rgba(7,11,20,0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                      >
                        <option value="HIGH">HIGH PRIORITY</option>
                        <option value="MEDIUM">MEDIUM PRIORITY</option>
                        <option value="LOW">LOW PRIORITY</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="nav-btn-motion" 
                    style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}
                  >
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
                        Project: <strong style={{ color: '#cbd5e1' }}>{t.project}</strong> • Assigned To: <strong style={{ color: '#38bdf8' }}>🎓 {t.internName}</strong> • Deadline: <strong style={{ color: '#a5b4fc' }}>{t.due}</strong>
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
            <h3 style={{ margin: '0 0 18px 0', fontSize: '17px', fontWeight: '700', color: '#ffffff' }}>Daily Work Report Reviews</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reports.map(r => (
                <div key={r.id} style={{ background: 'rgba(15,23,42,0.6)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#ffffff' }}>{r.internName}</strong>
                      <span style={{ color: '#94a3b8', fontSize: '12px', marginLeft: '10px' }}>Date: {r.date} • {r.hours} Hours Logged</span>
                    </div>
                    <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', background: r.status === 'APPROVED' ? 'rgba(5,150,105,0.2)' : 'rgba(217,119,6,0.2)', color: r.status === 'APPROVED' ? '#6ee7b7' : '#fcd34d' }}>
                      {r.status}
                    </span>
                  </div>
                  <p style={{ margin: '8px 0', fontSize: '13px', color: '#cbd5e1' }}><strong>Summary:</strong> {r.summary}</p>
                  {r.status === 'PENDING' && (
                    <button onClick={() => handleReviewReport(r.id, 'APPROVED')} className="nav-btn-motion" style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', marginTop: '6px' }}>
                      ✓ Approve Report
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: LEAVES */}
        {activeTab === 'leaves' && (
          <div className="glass-card" style={{ borderRadius: '18px', padding: '26px' }}>
            <h3 style={{ margin: '0 0 18px 0', fontSize: '17px', fontWeight: '700', color: '#ffffff' }}>Leave Requests & Approvals</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {leaves.map(l => (
                <div key={l.id} style={{ background: 'rgba(15,23,42,0.6)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#ffffff', fontWeight: '700' }}>{l.internName} — {l.type}</h4>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>Dates: {l.dates} • Reason: {l.reason}</div>
                  </div>
                  {l.status === 'PENDING' ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleLeaveDecision(l.id, 'APPROVED')} className="nav-btn-motion" style={{ background: '#059669', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>✓ Approve</button>
                      <button onClick={() => handleLeaveDecision(l.id, 'REJECTED')} className="nav-btn-motion" style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>✕ Reject</button>
                    </div>
                  ) : (
                    <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', background: l.status === 'APPROVED' ? 'rgba(5,150,105,0.2)' : 'rgba(217,119,6,0.2)', color: l.status === 'APPROVED' ? '#6ee7b7' : '#fcd34d' }}>{l.status}</span>
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