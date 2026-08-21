// Storage Keys
const USERS_KEY = 'ims_users_db';
const LEAVES_KEY = 'ims_leaves_db';
const REPORTS_KEY = 'ims_reports_db';
const ATTENDANCE_KEY = 'ims_attendance_db';

// Seed Initial Accounts (Default credentials)
const defaultUsers = [
  { id: 1, full_name: 'Operations Admin', email: 'ops@system.com', password: 'password123', role: 'operations', department: 'Executive Management' },
  { id: 2, full_name: 'Senior HR Lead', email: 'hr@system.com', password: 'password123', role: 'hr', department: 'Human Resources' },
  { id: 3, full_name: 'Alex Rivera', email: 'rm@system.com', password: 'password123', role: 'rm', department: 'Engineering' },
  { id: 4, full_name: 'Vikram Malhotra', email: 'vikram@system.com', password: 'password123', role: 'rm', department: 'Cloud Infrastructure' },
  { id: 5, full_name: 'Sarah Chen', email: 'intern@system.com', password: 'password123', role: 'intern', internship_status: 'active', rm_id: 3, rm_name: 'Alex Rivera', department: 'Frontend Architecture' },
  { id: 6, full_name: 'David Kim', email: 'david@system.com', password: 'password123', role: 'intern', internship_status: 'active', rm_id: 3, rm_name: 'Alex Rivera', department: 'Cloud Infrastructure' }
];

const defaultReports = [
  { id: 101, intern_id: 5, intern_name: 'Sarah Chen', rm_id: 3, date: '2026-08-17', summary: 'Implemented candidate PDF parser and added unit tests.', blockers: 'Resolved CORS configuration on auth gateway', hours: 8.0, status: 'APPROVED' },
  { id: 102, intern_id: 6, intern_name: 'David Kim', rm_id: 3, date: '2026-08-17', summary: 'Configured Dockerized PostgreSQL database pool.', blockers: 'Port conflict on staging cluster', hours: 7.5, status: 'PENDING' }
];

const defaultLeaves = [
  { id: 201, intern_id: 5, intern_name: 'Sarah Chen', rm_id: 3, type: 'Sick Leave', start_date: '2026-08-21', end_date: '2026-08-22', reason: 'Fever and viral infection', status: 'PENDING' }
];

export const DB = {
  getUsers: () => {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) {
      localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(data);
  },

  addUser: (userData) => {
    const users = DB.getUsers();
    const cleanEmail = userData.email.trim().toLowerCase();
    
    // Uniqueness constraint enforcement (TC-002)
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error(`Email "${cleanEmail}" is already registered. Please use a unique email.`);
    }

    const newUser = {
      id: Date.now(),
      ...userData,
      email: cleanEmail,
      password: userData.password || 'password123',
      internship_status: userData.internship_status || 'active'
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return newUser;
  },

  updateUser: (id, updates) => {
    const users = DB.getUsers().map(u => u.id === id ? { ...u, ...updates } : u);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return users;
  },

  // Leave persistence & cross-role sync (TC-004, TC-007)
  getLeaves: () => {
    const data = localStorage.getItem(LEAVES_KEY);
    if (!data) {
      localStorage.setItem(LEAVES_KEY, JSON.stringify(defaultLeaves));
      return defaultLeaves;
    }
    return JSON.parse(data);
  },

  submitLeave: (leaveData) => {
    const leaves = DB.getLeaves();
    const newLeave = {
      id: Date.now(),
      status: 'PENDING',
      created_at: new Date().toISOString(),
      ...leaveData
    };
    leaves.unshift(newLeave);
    localStorage.setItem(LEAVES_KEY, JSON.stringify(leaves));
    return newLeave;
  },

  updateLeaveStatus: (leaveId, status) => {
    const leaves = DB.getLeaves().map(l => l.id === Number(leaveId) ? { ...l, status } : l);
    localStorage.setItem(LEAVES_KEY, JSON.stringify(leaves));
    return leaves;
  },

  // Daily reports persistence & blocker propagation (TC-005, TC-006)
  getReports: () => {
    const data = localStorage.getItem(REPORTS_KEY);
    if (!data) {
      localStorage.setItem(REPORTS_KEY, JSON.stringify(defaultReports));
      return defaultReports;
    }
    return JSON.parse(data);
  },

  submitReport: (reportData) => {
    const reports = DB.getReports();
    const newReport = {
      id: Date.now(),
      status: 'PENDING',
      created_at: new Date().toISOString(),
      ...reportData
    };
    reports.unshift(newReport);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    return newReport;
  },

  updateReportStatus: (reportId, status) => {
    const reports = DB.getReports().map(r => r.id === Number(reportId) ? { ...r, status } : r);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    return reports;
  },

  // Attendance & dynamic logged hours calculation (TC-008)
  getAttendance: (userId) => {
    const data = localStorage.getItem(`${ATTENDANCE_KEY}_${userId}`);
    if (!data) {
      return { clocked_in: false, clocked_out: false, clock_in_time: null, total_hours: 98.5 };
    }
    return JSON.parse(data);
  },

  saveAttendance: (userId, record) => {
    localStorage.setItem(`${ATTENDANCE_KEY}_${userId}`, JSON.stringify(record));
    return record;
  }
};