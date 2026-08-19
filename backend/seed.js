const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'intern_management',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function seed() {
  console.log('🌱 Starting database seeding with validated constraints...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const defaultPassword = 'Admin@123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Drop legacy constraint on users table if any
    await client.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;');

    // Clean dependent tables first in reverse dependency order
    console.log('🧹 Cleaning existing test data...');
    await client.query('DELETE FROM file_attachments;');
    await client.query('DELETE FROM report_comments;');
    await client.query('DELETE FROM report_approvals;');
    await client.query('DELETE FROM daily_reports;');
    await client.query('DELETE FROM leave_requests;');
    await client.query('DELETE FROM attendance;');
    await client.query('DELETE FROM tasks;');
    await client.query('DELETE FROM project_interns;');
    await client.query('DELETE FROM projects;');
    await client.query('DELETE FROM rm_intern_relationships;');
    await client.query('DELETE FROM profiles;');
    await client.query('DELETE FROM users;');

    console.log('👤 Seeding Users...');
    // Seed HR
    const hrRes = await client.query(`
      INSERT INTO users (email, password_hash, full_name, role, is_active)
      VALUES ($1, $2, $3, 'hr', true)
      RETURNING id;
    `, ['hr@system.com', hashedPassword, 'Eleanor Vance']);
    const hrId = hrRes.rows[0].id;

    // Seed RM 1
    const rm1Res = await client.query(`
      INSERT INTO users (email, password_hash, full_name, role, is_active)
      VALUES ($1, $2, $3, 'rm', true)
      RETURNING id;
    `, ['rm@system.com', hashedPassword, 'Alex Rivera']);
    const rm1Id = rm1Res.rows[0].id;

    // Seed RM 2
    const rm2Res = await client.query(`
      INSERT INTO users (email, password_hash, full_name, role, is_active)
      VALUES ($1, $2, $3, 'rm', true)
      RETURNING id;
    `, ['marcus@system.com', hashedPassword, 'Marcus Sterling']);
    const rm2Id = rm2Res.rows[0].id;

    // Seed Intern 1
    const intern1Res = await client.query(`
      INSERT INTO users (email, password_hash, full_name, role, is_active)
      VALUES ($1, $2, $3, 'intern', true)
      RETURNING id;
    `, ['intern@system.com', hashedPassword, 'Sarah Chen']);
    const intern1Id = intern1Res.rows[0].id;

    // Seed Intern 2
    const intern2Res = await client.query(`
      INSERT INTO users (email, password_hash, full_name, role, is_active)
      VALUES ($1, $2, $3, 'intern', true)
      RETURNING id;
    `, ['david@system.com', hashedPassword, 'David Kim']);
    const intern2Id = intern2Res.rows[0].id;

    // Seed Intern 3
    const intern3Res = await client.query(`
      INSERT INTO users (email, password_hash, full_name, role, is_active)
      VALUES ($1, $2, $3, 'intern', true)
      RETURNING id;
    `, ['priya@system.com', hashedPassword, 'Priya Patel']);
    const intern3Id = intern3Res.rows[0].id;

    // Profiles
    console.log('📋 Seeding Profiles...');
    const profiles = [
      { userId: hrId, department: 'Human Resources', position: 'VP of People & Talent', phone: '+1 (555) 019-2834' },
      { userId: rm1Id, department: 'Software Engineering', position: 'Lead Software Architect', phone: '+1 (555) 382-9912' },
      { userId: rm2Id, department: 'Product Management', position: 'Principal Product Lead', phone: '+1 (555) 837-1290' },
      { userId: intern1Id, department: 'Frontend Engineering', position: 'Full-Stack Developer Intern', phone: '+1 (555) 923-4411' },
      { userId: intern2Id, department: 'Cloud Infrastructure', position: 'Cloud & DevOps Intern', phone: '+1 (555) 438-9901' },
      { userId: intern3Id, department: 'Design Studio', position: 'UI/UX Design Intern', phone: '+1 (555) 772-8833' },
    ];

    for (const p of profiles) {
      await client.query(`
        INSERT INTO profiles (user_id, department, position, phone, joined_date)
        VALUES ($1, $2, $3, $4, CURRENT_DATE - INTERVAL '60 days');
      `, [p.userId, p.department, p.position, p.phone]);
    }

    // RM-Intern Relationships
    console.log('🤝 Seeding RM-Intern Relationships...');
    await client.query(`
      INSERT INTO rm_intern_relationships (rm_id, intern_id, is_active, assigned_date)
      VALUES 
        ($1, $2, true, CURRENT_DATE - INTERVAL '30 days'),
        ($1, $3, true, CURRENT_DATE - INTERVAL '25 days'),
        ($4, $5, true, CURRENT_DATE - INTERVAL '20 days');
    `, [rm1Id, intern1Id, intern2Id, rm2Id, intern3Id]);

    // Projects: status in ('active', 'completed', 'on_hold', 'archived'), priority in ('low', 'medium', 'high', 'critical')
    console.log('🚀 Seeding Projects...');
    const proj1 = await client.query(`
      INSERT INTO projects (rm_id, title, description, status, priority, start_date, end_date)
      VALUES ($1, 'Cloud Native Microservices Dashboard', 'Building real-time observability telemetry dashboard with React, WebSockets, and Postgres.', 'active', 'high', CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE + INTERVAL '40 days')
      RETURNING id;
    `, [rm1Id]);
    const proj1Id = proj1.rows[0].id;

    const proj2 = await client.query(`
      INSERT INTO projects (rm_id, title, description, status, priority, start_date, end_date)
      VALUES ($1, 'AI Talent Screening Pipeline', 'Automated machine learning candidate screening pipeline with natural language processing.', 'active', 'critical', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '50 days')
      RETURNING id;
    `, [rm1Id]);
    const proj2Id = proj2.rows[0].id;

    const proj3 = await client.query(`
      INSERT INTO projects (rm_id, title, description, status, priority, start_date, end_date)
      VALUES ($1, 'Mobile App Core Performance V2', 'Refactoring rendering pipeline and reducing initial bundle payload for iOS/Android platforms.', 'active', 'medium', CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days')
      RETURNING id;
    `, [rm2Id]);
    const proj3Id = proj3.rows[0].id;

    // Project Interns mapping
    await client.query(`
      INSERT INTO project_interns (project_id, intern_id, assigned_date, is_active)
      VALUES 
        ($1, $2, CURRENT_DATE - INTERVAL '20 days', true),
        ($3, $2, CURRENT_DATE - INTERVAL '10 days', true),
        ($1, $4, CURRENT_DATE - INTERVAL '15 days', true),
        ($5, $6, CURRENT_DATE - INTERVAL '5 days', true);
    `, [proj1Id, intern1Id, proj2Id, intern2Id, proj3Id, intern3Id]);

    // Tasks: status in ('pending', 'in_progress', 'completed', 'blocked'), priority in ('low', 'medium', 'high', 'critical')
    console.log('✅ Seeding Tasks...');
    await client.query(`
      INSERT INTO tasks (project_id, assigned_to, title, description, status, priority, deadline)
      VALUES
        ($1, $2, 'Design Glassmorphism Dashboard UI Components', 'Create sleek card components with modern dark mode gradients and glowing states.', 'completed', 'high', CURRENT_DATE - INTERVAL '2 days'),
        ($1, $2, 'Integrate Real-Time Attendance WebSocket Feeds', 'Hook up backend telemetry stream with React Query and live status badge.', 'in_progress', 'critical', CURRENT_DATE + INTERVAL '3 days'),
        ($1, $2, 'Write Unit & E2E Tests for Auth Flow', 'Add comprehensive test coverage for JWT verification and token rotation.', 'pending', 'medium', CURRENT_DATE + INTERVAL '7 days'),
        ($3, $2, 'Implement Candidate PDF Parsing Module', 'Use NLP to extract key technical skills and experience levels.', 'pending', 'high', CURRENT_DATE + INTERVAL '12 days'),
        ($1, $4, 'Optimize PostgreSQL Indexing & Connection Pooling', 'Analyze slow queries on report_approvals and add composite indexes.', 'in_progress', 'high', CURRENT_DATE + INTERVAL '4 days');
    `, [proj1Id, intern1Id, proj2Id, intern2Id]);

    // Attendance: status in ('present', 'absent', 'leave', 'half_day', 'holiday')
    console.log('⏰ Seeding Attendance...');
    await client.query(`
      INSERT INTO attendance (intern_id, date, status, check_in_time, check_out_time, working_hours, remarks)
      VALUES
        ($1, CURRENT_DATE - INTERVAL '4 days', 'present', '09:02:00', '18:05:00', 8.5, 'On time, highly productive'),
        ($1, CURRENT_DATE - INTERVAL '3 days', 'present', '09:14:00', '18:10:00', 8.4, 'Completed dashboard wireframes'),
        ($1, CURRENT_DATE - INTERVAL '2 days', 'present', '09:45:00', '18:30:00', 8.2, 'Traffic delay, made up time'),
        ($1, CURRENT_DATE - INTERVAL '1 days', 'present', '09:00:00', '18:00:00', 8.5, 'API integration completed'),
        ($1, CURRENT_DATE, 'present', '09:05:00', NULL, 7.5, 'Checked in today - working on dashboard UI'),
        ($2, CURRENT_DATE, 'present', '09:10:00', NULL, 7.2, 'Checked in today - database profiling');
    `, [intern1Id, intern2Id]);

    // Daily Reports: status in ('pending', 'approved', 'rejected', 'resubmit')
    console.log('📝 Seeding Daily Reports...');
    const rep1 = await client.query(`
      INSERT INTO daily_reports (intern_id, project_id, date, work_done, challenges, next_plan, hours_worked, status, submitted_at)
      VALUES ($1, $2, CURRENT_DATE - INTERVAL '1 days', 
        'Finalized responsive navigation layout and created reusable KPI metric card components with interactive charts.',
        'Minor CSS grid alignment issues on mobile viewports, resolved using flex auto-wrap.',
        'Hook up attendance punch widget and connect daily report submissions to REST API.',
        8.5, 'approved', CURRENT_TIMESTAMP - INTERVAL '1 days')
      RETURNING id;
    `, [intern1Id, proj1Id]);
    const rep1Id = rep1.rows[0].id;

    // Report Approvals: status in ('approved', 'rejected', 'resubmit')
    await client.query(`
      INSERT INTO report_approvals (report_id, rm_id, status, comment, approved_at)
      VALUES ($1, $2, 'approved', 'Outstanding work Sarah! The glassmorphism card designs look ultra modern and polished.', CURRENT_TIMESTAMP - INTERVAL '18 hours');
    `, [rep1Id, rm1Id]);

    const rep2 = await client.query(`
      INSERT INTO daily_reports (intern_id, project_id, date, work_done, challenges, next_plan, hours_worked, status, submitted_at)
      VALUES ($1, $2, CURRENT_DATE, 
        'Implemented Live Digital Attendance Punch widget with real-time status timer and automated hours tracking.',
        'None today. Everything went smoothly.',
        'Complete leave application system with manager review workflow.',
        7.5, 'pending', CURRENT_TIMESTAMP - INTERVAL '2 hours')
      RETURNING id;
    `, [intern1Id, proj1Id]);

    // Leave Requests: leave_type in ('sick', 'casual', 'emergency', 'vacation', 'other'), status in ('pending', 'approved', 'rejected', 'cancelled')
    console.log('🏖️ Seeding Leave Requests...');
    await client.query(`
      INSERT INTO leave_requests (intern_id, rm_id, leave_type, start_date, end_date, reason, status, approved_by, approved_at, comment)
      VALUES 
        ($1, $2, 'casual', CURRENT_DATE - INTERVAL '12 days', CURRENT_DATE - INTERVAL '11 days', 'Family function attendance.', 'approved', $2, CURRENT_TIMESTAMP - INTERVAL '13 days', 'Approved. Enjoy!'),
        ($1, $2, 'other', CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '12 days', 'Semester final laboratory examinations.', 'pending', NULL, NULL, NULL),
        ($3, $2, 'sick', CURRENT_DATE + INTERVAL '2 days', CURRENT_DATE + INTERVAL '3 days', 'Medical appointment and recovery.', 'pending', NULL, NULL, NULL);
    `, [intern1Id, rm1Id, intern2Id]);

    await client.query('COMMIT');
    console.log('\n======================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('🔑 Ready-to-use Login Credentials (all passwords: Admin@123):');
    console.log('   👑 HR Admin           : hr@system.com');
    console.log('   👔 Reporting Manager  : rm@system.com');
    console.log('   🎓 Intern             : intern@system.com');
    console.log('======================================================\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Database Seeding Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
