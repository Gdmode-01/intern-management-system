const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'intern-management-secret-key-2026';

// ============================================
// DATABASE CONNECTION
// ============================================
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'intern_management',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection error:', err.stack);
  } else {
    console.log('✅ Connected to PostgreSQL database: ' + (process.env.DB_NAME || 'intern_management'));
    release();
  }
});

// ============================================
// MIDDLEWARE
// ============================================
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(express.json());

// ============================================
// AUTH & RBAC MIDDLEWARES
// ============================================
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query(`
      SELECT u.id, u.email, u.full_name, LOWER(u.role) as role, u.is_active,
             p.department, p.position, p.phone, p.profile_pic_url
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.id = $1 AND u.is_active = true
    `, [decoded.id]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }
};

const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = (req.user?.role || '').toLowerCase();
    const roles = allowedRoles.map(r => r.toLowerCase());
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: `Access denied. Required role: ${allowedRoles.join(' or ')}` });
    }
    next();
  };
};

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Intern Management Enterprise Backend'
  });
});

// ============================================
// AUTH ROUTES
// ============================================

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query(`
      SELECT u.id, u.email, u.password_hash, u.full_name, LOWER(u.role) as role, u.is_active,
             p.department, p.position, p.phone, p.profile_pic_url
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE LOWER(u.email) = LOWER($1)
    `, [email.trim()]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated. Please contact HR admin.' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    delete user.password_hash;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', authenticate, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// ============================================
// STATS / OVERVIEW METRICS
// ============================================

// GET /api/stats/overview (HR Dashboard)
app.get('/api/stats/overview', authenticate, checkRole(['hr']), async (req, res) => {
  try {
    const totalInternsRes = await pool.query("SELECT COUNT(*) FROM users WHERE LOWER(role) = 'intern'");
    const totalRmsRes = await pool.query("SELECT COUNT(*) FROM users WHERE LOWER(role) = 'rm'");
    const activeProjectsRes = await pool.query("SELECT COUNT(*) FROM projects WHERE status = 'active'");
    const todayAttendanceRes = await pool.query("SELECT COUNT(*) FROM attendance WHERE date = CURRENT_DATE AND status = 'present'");
    const pendingLeavesRes = await pool.query("SELECT COUNT(*) FROM leave_requests WHERE status = 'pending'");
    const pendingReportsRes = await pool.query("SELECT COUNT(*) FROM daily_reports WHERE status = 'pending'");
    const totalActiveUsersRes = await pool.query("SELECT COUNT(*) FROM users WHERE is_active = true");

    // Department breakdown
    const deptRes = await pool.query(`
      SELECT COALESCE(p.department, 'General') as name, COUNT(u.id) as count
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      GROUP BY p.department
      ORDER BY count DESC
    `);

    // Recent activity log
    const recentActivity = [
      { id: 1, type: 'attendance', title: 'Sarah Chen checked in', time: '09:05 AM', status: 'present' },
      { id: 2, type: 'report', title: 'Daily work report submitted by David Kim', time: '10:30 AM', status: 'pending' },
      { id: 3, type: 'project', title: 'Cloud Native Microservices Dashboard updated', time: 'Yesterday', status: 'active' },
      { id: 4, type: 'leave', title: 'Exam leave request submitted by Priya Patel', time: 'Yesterday', status: 'pending' },
    ];

    res.json({
      success: true,
      stats: {
        totalInterns: parseInt(totalInternsRes.rows[0].count, 10),
        totalRms: parseInt(totalRmsRes.rows[0].count, 10),
        activeProjects: parseInt(activeProjectsRes.rows[0].count, 10),
        todayAttendance: parseInt(todayAttendanceRes.rows[0].count, 10),
        pendingLeaves: parseInt(pendingLeavesRes.rows[0].count, 10),
        pendingReports: parseInt(pendingReportsRes.rows[0].count, 10),
        totalActiveUsers: parseInt(totalActiveUsersRes.rows[0].count, 10),
      },
      departments: deptRes.rows,
      recentActivity
    });
  } catch (error) {
    console.error('Stats overview error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stats/rm (RM Dashboard)
app.get('/api/stats/rm', authenticate, checkRole(['rm']), async (req, res) => {
  try {
    const assignedInternsRes = await pool.query(`
      SELECT COUNT(DISTINCT intern_id) FROM rm_intern_relationships 
      WHERE rm_id = $1 AND is_active = true
    `, [req.user.id]);

    const activeProjectsRes = await pool.query(`
      SELECT COUNT(*) FROM projects WHERE rm_id = $1 AND status = 'active'
    `, [req.user.id]);

    const pendingReportsRes = await pool.query(`
      SELECT COUNT(*) FROM daily_reports dr
      JOIN rm_intern_relationships rir ON dr.intern_id = rir.intern_id
      WHERE rir.rm_id = $1 AND rir.is_active = true AND dr.status = 'pending'
    `, [req.user.id]);

    const pendingLeavesRes = await pool.query(`
      SELECT COUNT(*) FROM leave_requests lr
      WHERE (lr.rm_id = $1 OR lr.intern_id IN (
        SELECT intern_id FROM rm_intern_relationships WHERE rm_id = $1 AND is_active = true
      )) AND lr.status = 'pending'
    `, [req.user.id]);

    res.json({
      success: true,
      stats: {
        assignedInterns: parseInt(assignedInternsRes.rows[0].count, 10),
        activeProjects: parseInt(activeProjectsRes.rows[0].count, 10),
        pendingReports: parseInt(pendingReportsRes.rows[0].count, 10),
        pendingLeaves: parseInt(pendingLeavesRes.rows[0].count, 10),
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stats/intern (Intern Dashboard)
app.get('/api/stats/intern', authenticate, checkRole(['intern']), async (req, res) => {
  try {
    const tasksRes = await pool.query(`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as active_tasks
      FROM tasks WHERE assigned_to = $1
    `, [req.user.id]);

    const attendanceRes = await pool.query(`
      SELECT COUNT(*) as days_present, COALESCE(SUM(working_hours), 0) as total_hours
      FROM attendance WHERE intern_id = $1 AND status = 'present'
    `, [req.user.id]);

    const reportsRes = await pool.query(`
      SELECT COUNT(*) as total_reports,
             COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_reports
      FROM daily_reports WHERE intern_id = $1
    `, [req.user.id]);

    const leaveRes = await pool.query(`
      SELECT COUNT(*) as pending_leaves FROM leave_requests WHERE intern_id = $1 AND status = 'pending'
    `, [req.user.id]);

    res.json({
      success: true,
      stats: {
        totalTasks: parseInt(tasksRes.rows[0].total_tasks, 10),
        completedTasks: parseInt(tasksRes.rows[0].completed_tasks, 10),
        activeTasks: parseInt(tasksRes.rows[0].active_tasks, 10),
        daysPresent: parseInt(attendanceRes.rows[0].days_present, 10),
        totalHours: parseFloat(attendanceRes.rows[0].total_hours || 0),
        totalReports: parseInt(reportsRes.rows[0].total_reports, 10),
        approvedReports: parseInt(reportsRes.rows[0].approved_reports, 10),
        pendingLeaves: parseInt(leaveRes.rows[0].pending_leaves, 10),
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// USER MANAGEMENT ROUTES
// ============================================

// GET /api/users
app.get('/api/users', authenticate, checkRole(['hr', 'rm']), async (req, res) => {
  try {
    const { role, search, department } = req.query;
    let query = `
      SELECT u.id, u.email, u.full_name, LOWER(u.role) as role, u.is_active, u.created_at,
             p.department, p.position, p.phone, p.profile_pic_url, p.joined_date
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE 1=1
    `;
    let params = [];

    if (req.user.role === 'rm') {
      params.push(req.user.id);
      query += ` AND (u.id IN (
        SELECT intern_id FROM rm_intern_relationships WHERE rm_id = $${params.length} AND is_active = true
      ) OR u.id = $${params.length})`;
    }

    if (role) {
      params.push(role.toLowerCase());
      query += ` AND LOWER(u.role) = $${params.length}`;
    }

    if (department) {
      params.push(`%${department}%`);
      query += ` AND p.department ILIKE $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (u.full_name ILIKE $${params.length} OR u.email ILIKE $${params.length} OR p.position ILIKE $${params.length})`;
    }

    query += ` ORDER BY u.created_at DESC`;
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/:id
app.get('/api/users/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT u.id, u.email, u.full_name, LOWER(u.role) as role, u.is_active, u.created_at,
             p.department, p.position, p.phone, p.profile_pic_url, p.joined_date
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users/rm (Create RM)
app.post('/api/users/rm', authenticate, checkRole(['hr']), async (req, res) => {
  try {
    const { email, full_name, department, position, phone } = req.body;

    if (!email || !full_name) {
      return res.status(400).json({ error: 'Email and full name are required' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    const tempPassword = 'Admin@123';
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const result = await pool.query(`
      INSERT INTO users (email, password_hash, full_name, role, is_active)
      VALUES ($1, $2, $3, 'rm', true)
      RETURNING id, email, full_name, role
    `, [email.trim().toLowerCase(), hashedPassword, full_name.trim()]);

    const newUserId = result.rows[0].id;

    await pool.query(`
      INSERT INTO profiles (user_id, department, position, phone, joined_date)
      VALUES ($1, $2, $3, $4, CURRENT_DATE)
    `, [newUserId, department || 'Management', position || 'Reporting Manager', phone || null]);

    res.status(201).json({
      success: true,
      message: 'Reporting Manager account created successfully',
      data: result.rows[0],
      tempPassword
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users/intern (Create Intern with RM & Project assignment)
app.post('/api/users/intern', authenticate, checkRole(['hr', 'rm']), async (req, res) => {
  try {
    const { email, full_name, department, position, phone, rm_ids, project_ids } = req.body;

    if (!email || !full_name) {
      return res.status(400).json({ error: 'Email and full name are required' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    const tempPassword = 'Admin@123';
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const result = await pool.query(`
      INSERT INTO users (email, password_hash, full_name, role, is_active)
      VALUES ($1, $2, $3, 'intern', true)
      RETURNING id, email, full_name, role
    `, [email.trim().toLowerCase(), hashedPassword, full_name.trim()]);

    const internId = result.rows[0].id;

    await pool.query(`
      INSERT INTO profiles (user_id, department, position, phone, joined_date)
      VALUES ($1, $2, $3, $4, CURRENT_DATE)
    `, [internId, department || 'Engineering Intern', position || 'Software Engineering Intern', phone || null]);

    // Link RM
    const targetRmIds = (rm_ids && rm_ids.length > 0) ? rm_ids : (req.user.role === 'rm' ? [req.user.id] : []);
    for (const rmId of targetRmIds) {
      await pool.query(`
        INSERT INTO rm_intern_relationships (rm_id, intern_id, is_active, assigned_date)
        VALUES ($1, $2, true, CURRENT_DATE)
      `, [rmId, internId]);
    }

    // Link Projects
    if (project_ids && project_ids.length > 0) {
      for (const projId of project_ids) {
        await pool.query(`
          INSERT INTO project_interns (project_id, intern_id, assigned_date, is_active)
          VALUES ($1, $2, CURRENT_DATE, true)
        `, [projId, internId]);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Intern account created and assigned successfully',
      data: result.rows[0],
      tempPassword
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/:id (Toggle status or update details)
app.put('/api/users/:id', authenticate, checkRole(['hr']), async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, department, position, phone, is_active } = req.body;

    if (full_name !== undefined || is_active !== undefined) {
      await pool.query(`
        UPDATE users SET
          full_name = COALESCE($1, full_name),
          is_active = COALESCE($2, is_active),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `, [full_name, is_active, id]);
    }

    if (department !== undefined || position !== undefined || phone !== undefined) {
      await pool.query(`
        INSERT INTO profiles (user_id, department, position, phone)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) DO UPDATE
        SET department = COALESCE($2, profiles.department),
            position = COALESCE($3, profiles.position),
            phone = COALESCE($4, profiles.phone);
      `, [id, department, position, phone]);
    }

    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ASSIGNED INTERNS (RM Specific)
// ============================================
app.get('/api/interns/assigned', authenticate, checkRole(['rm']), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.email, u.full_name, LOWER(u.role) as role, u.is_active,
             p.department, p.position, p.phone, p.profile_pic_url,
             (SELECT status FROM attendance WHERE intern_id = u.id AND date = CURRENT_DATE LIMIT 1) as today_attendance,
             (SELECT COUNT(*) FROM tasks WHERE assigned_to = u.id AND status = 'completed') as completed_tasks,
             (SELECT COUNT(*) FROM tasks WHERE assigned_to = u.id) as total_tasks
      FROM users u
      JOIN rm_intern_relationships rir ON u.id = rir.intern_id
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE rir.rm_id = $1 AND rir.is_active = true
      ORDER BY u.full_name ASC
    `, [req.user.id]);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// PROJECTS ROUTES
// ============================================

// GET /api/projects
app.get('/api/projects', authenticate, async (req, res) => {
  try {
    let query = `
      SELECT p.*, u.full_name as rm_name,
             (SELECT COUNT(*) FROM project_interns WHERE project_id = p.id AND is_active = true) as intern_count,
             (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as total_tasks,
             (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'completed') as completed_tasks
      FROM projects p
      LEFT JOIN users u ON p.rm_id = u.id
    `;
    let params = [];

    if (req.user.role === 'rm') {
      params.push(req.user.id);
      query += ` WHERE p.rm_id = $1`;
    } else if (req.user.role === 'intern') {
      params.push(req.user.id);
      query += ` WHERE p.id IN (
        SELECT project_id FROM project_interns WHERE intern_id = $1 AND is_active = true
      )`;
    }

    query += ` ORDER BY p.created_at DESC`;
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/projects
app.post('/api/projects', authenticate, checkRole(['rm', 'hr']), async (req, res) => {
  try {
    const { title, description, priority, start_date, end_date } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Project title is required' });
    }

    const validPriority = ['low', 'medium', 'high', 'critical'].includes(priority) ? priority : 'medium';

    const result = await pool.query(`
      INSERT INTO projects (rm_id, title, description, status, priority, start_date, end_date)
      VALUES ($1, $2, $3, 'active', $4, $5, $6)
      RETURNING *
    `, [
      req.user.id,
      title,
      description || '',
      validPriority,
      start_date || new Date().toISOString().split('T')[0],
      end_date || null
    ]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/projects/:id
app.put('/api/projects/:id', authenticate, checkRole(['rm', 'hr']), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, end_date } = req.body;

    const result = await pool.query(`
      UPDATE projects SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        priority = COALESCE($4, priority),
        end_date = COALESCE($5, end_date),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `, [title, description, status, priority, end_date, id]);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// TASKS ROUTES
// ============================================

// GET /api/tasks
app.get('/api/tasks', authenticate, async (req, res) => {
  try {
    const { project_id, assigned_to } = req.query;
    let query = `
      SELECT t.*, p.title as project_title, u.full_name as assignee_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE 1=1
    `;
    let params = [];

    if (req.user.role === 'intern') {
      params.push(req.user.id);
      query += ` AND t.assigned_to = $${params.length}`;
    } else if (req.user.role === 'rm') {
      if (assigned_to) {
        params.push(assigned_to);
        query += ` AND t.assigned_to = $${params.length}`;
      } else {
        params.push(req.user.id);
        query += ` AND (p.rm_id = $${params.length} OR t.assigned_to IN (
          SELECT intern_id FROM rm_intern_relationships WHERE rm_id = $${params.length} AND is_active = true
        ))`;
      }
    }

    if (project_id) {
      params.push(project_id);
      query += ` AND t.project_id = $${params.length}`;
    }

    query += ` ORDER BY t.created_at DESC`;
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tasks
app.post('/api/tasks', authenticate, checkRole(['rm']), async (req, res) => {
  try {
    const { project_id, assigned_to, title, description, priority, deadline } = req.body;

    if (!title || !project_id || !assigned_to) {
      return res.status(400).json({ error: 'Title, project, and assigned intern are required' });
    }

    const validPriority = ['low', 'medium', 'high', 'critical'].includes(priority) ? priority : 'medium';

    const result = await pool.query(`
      INSERT INTO tasks (project_id, assigned_to, title, description, status, priority, deadline)
      VALUES ($1, $2, $3, $4, 'pending', $5, $6)
      RETURNING *
    `, [project_id, assigned_to, title, description || '', validPriority, deadline || null]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/tasks/:id
app.put('/api/tasks/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, title, description, priority, deadline } = req.body;

    const validStatus = ['pending', 'in_progress', 'completed', 'blocked'];
    if (status && !validStatus.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const result = await pool.query(`
      UPDATE tasks SET
        status = COALESCE($1, status),
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        priority = COALESCE($4, priority),
        deadline = COALESCE($5, deadline),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `, [status, title, description, priority, deadline, id]);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ATTENDANCE ROUTES
// ============================================

// GET /api/attendance/today
app.get('/api/attendance/today', authenticate, checkRole(['intern']), async (req, res) => {
  try {
    const date = new Date().toISOString().split('T')[0];
    const result = await pool.query(`
      SELECT * FROM attendance WHERE intern_id = $1 AND date = $2
    `, [req.user.id, date]);

    res.json({
      success: true,
      hasCheckedIn: result.rows.length > 0 && result.rows[0].check_in_time !== null,
      hasCheckedOut: result.rows.length > 0 && result.rows[0].check_out_time !== null,
      record: result.rows[0] || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/attendance/checkin
app.post('/api/attendance/checkin', authenticate, checkRole(['intern']), async (req, res) => {
  try {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];

    const existing = await pool.query(
      'SELECT id FROM attendance WHERE intern_id = $1 AND date = $2',
      [req.user.id, date]
    );

    let result;
    if (existing.rows.length > 0) {
      result = await pool.query(`
        UPDATE attendance SET
          status = 'present',
          check_in_time = COALESCE(check_in_time, $1),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `, [time, existing.rows[0].id]);
    } else {
      result = await pool.query(`
        INSERT INTO attendance (intern_id, date, status, check_in_time)
        VALUES ($1, $2, 'present', $3)
        RETURNING *
      `, [req.user.id, date, time]);
    }

    res.json({ success: true, message: 'Punch In successful! Have a great day.', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/attendance/checkout
app.post('/api/attendance/checkout', authenticate, checkRole(['intern']), async (req, res) => {
  try {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];

    const existing = await pool.query(
      'SELECT * FROM attendance WHERE intern_id = $1 AND date = $2',
      [req.user.id, date]
    );

    if (existing.rows.length === 0 || !existing.rows[0].check_in_time) {
      return res.status(400).json({ error: 'You must Punch In before Punching Out.' });
    }

    const checkIn = existing.rows[0].check_in_time;
    const [inH, inM] = checkIn.split(':').map(Number);
    const [outH, outM] = time.split(':').map(Number);
    const totalMinutes = Math.max(0, (outH * 60 + outM) - (inH * 60 + inM));
    const hours = Math.round((totalMinutes / 60) * 10) / 10;

    const result = await pool.query(`
      UPDATE attendance SET
        check_out_time = $1,
        working_hours = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [time, hours, existing.rows[0].id]);

    res.json({ success: true, message: `Punch Out recorded! Total time: ${hours} hrs`, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/attendance
app.get('/api/attendance', authenticate, async (req, res) => {
  try {
    const { intern_id, start_date, end_date } = req.query;
    let query = `
      SELECT a.*, u.full_name as intern_name, p.department
      FROM attendance a
      JOIN users u ON a.intern_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE 1=1
    `;
    let params = [];

    if (req.user.role === 'intern') {
      params.push(req.user.id);
      query += ` AND a.intern_id = $${params.length}`;
    } else if (req.user.role === 'rm') {
      if (intern_id) {
        params.push(intern_id);
        query += ` AND a.intern_id = $${params.length}`;
      } else {
        params.push(req.user.id);
        query += ` AND a.intern_id IN (
          SELECT intern_id FROM rm_intern_relationships WHERE rm_id = $${params.length} AND is_active = true
        )`;
      }
    } else if (req.user.role === 'hr' && intern_id) {
      params.push(intern_id);
      query += ` AND a.intern_id = $${params.length}`;
    }

    if (start_date) {
      params.push(start_date);
      query += ` AND a.date >= $${params.length}`;
    }
    if (end_date) {
      params.push(end_date);
      query += ` AND a.date <= $${params.length}`;
    }

    query += ` ORDER BY a.date DESC LIMIT 50`;
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// DAILY REPORTS ROUTES
// ============================================

// GET /api/reports
app.get('/api/reports', authenticate, async (req, res) => {
  try {
    let query = `
      SELECT dr.*, u.full_name as intern_name, p.title as project_title,
             ra.comment as approval_comment, ra.approved_at
      FROM daily_reports dr
      JOIN users u ON dr.intern_id = u.id
      LEFT JOIN projects p ON dr.project_id = p.id
      LEFT JOIN report_approvals ra ON dr.id = ra.report_id
      WHERE 1=1
    `;
    let params = [];

    if (req.user.role === 'intern') {
      params.push(req.user.id);
      query += ` AND dr.intern_id = $${params.length}`;
    } else if (req.user.role === 'rm') {
      params.push(req.user.id);
      query += ` AND dr.intern_id IN (
        SELECT intern_id FROM rm_intern_relationships WHERE rm_id = $${params.length} AND is_active = true
      )`;
    }

    query += ` ORDER BY dr.date DESC, dr.created_at DESC`;
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/reports (Intern submits daily report)
app.post('/api/reports', authenticate, checkRole(['intern']), async (req, res) => {
  try {
    const { project_id, work_done, challenges, next_plan, hours_worked } = req.body;

    if (!work_done) {
      return res.status(400).json({ error: 'Please describe the work done today' });
    }

    const date = new Date().toISOString().split('T')[0];

    const result = await pool.query(`
      INSERT INTO daily_reports (intern_id, project_id, date, work_done, challenges, next_plan, hours_worked, status, submitted_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      req.user.id,
      project_id || null,
      date,
      work_done,
      challenges || '',
      next_plan || '',
      hours_worked ? parseFloat(hours_worked) : 8.0
    ]);

    res.status(201).json({ success: true, message: 'Daily report submitted successfully!', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/reports/:id/status (RM approves / rejects)
app.put('/api/reports/:id/status', authenticate, checkRole(['rm', 'hr']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    const validStatus = ['approved', 'rejected', 'resubmit'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ error: 'Invalid report status' });
    }

    await pool.query(`
      UPDATE daily_reports SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2
    `, [status, id]);

    await pool.query(`
      INSERT INTO report_approvals (report_id, rm_id, status, comment, approved_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
    `, [id, req.user.id, status, comment || null]);

    res.json({ success: true, message: `Report marked as ${status}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// LEAVE REQUESTS ROUTES
// ============================================

// GET /api/leaves
app.get('/api/leaves', authenticate, async (req, res) => {
  try {
    let query = `
      SELECT lr.*, u.full_name as intern_name, approver.full_name as approver_name
      FROM leave_requests lr
      JOIN users u ON lr.intern_id = u.id
      LEFT JOIN users approver ON lr.approved_by = approver.id
      WHERE 1=1
    `;
    let params = [];

    if (req.user.role === 'intern') {
      params.push(req.user.id);
      query += ` AND lr.intern_id = $${params.length}`;
    } else if (req.user.role === 'rm') {
      params.push(req.user.id);
      query += ` AND (lr.rm_id = $${params.length} OR lr.intern_id IN (
        SELECT intern_id FROM rm_intern_relationships WHERE rm_id = $${params.length} AND is_active = true
      ))`;
    }

    query += ` ORDER BY lr.created_at DESC`;
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/leaves (Intern applies for leave)
app.post('/api/leaves', authenticate, checkRole(['intern']), async (req, res) => {
  try {
    const { leave_type, start_date, end_date, reason } = req.body;

    if (!start_date || !end_date || !reason) {
      return res.status(400).json({ error: 'Start date, end date, and reason are required' });
    }

    const validTypes = ['sick', 'casual', 'emergency', 'vacation', 'other'];
    const selectedType = validTypes.includes(leave_type?.toLowerCase()) ? leave_type.toLowerCase() : 'casual';

    const rmRes = await pool.query(
      'SELECT rm_id FROM rm_intern_relationships WHERE intern_id = $1 AND is_active = true LIMIT 1',
      [req.user.id]
    );
    const rmId = rmRes.rows.length > 0 ? rmRes.rows[0].rm_id : null;

    const result = await pool.query(`
      INSERT INTO leave_requests (intern_id, rm_id, leave_type, start_date, end_date, reason, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING *
    `, [req.user.id, rmId, selectedType, start_date, end_date, reason]);

    res.status(201).json({ success: true, message: 'Leave application submitted successfully!', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/leaves/:id/status (RM / HR approves or rejects)
app.put('/api/leaves/:id/status', authenticate, checkRole(['rm', 'hr']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    const validStatus = ['approved', 'rejected', 'cancelled'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ error: 'Invalid leave status' });
    }

    const result = await pool.query(`
      UPDATE leave_requests SET
        status = $1,
        approved_by = $2,
        approved_at = CURRENT_TIMESTAMP,
        comment = COALESCE($3, comment),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [status, req.user.id, comment || null, id]);

    res.json({ success: true, message: `Leave request ${status}`, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// SERVER INITIALIZATION
// ============================================
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 INTERN MANAGEMENT ENTERPRISE API RUNNING`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`🩺 Health API: http://localhost:${PORT}/api/health`);
  console.log(`======================================================\n`);
});