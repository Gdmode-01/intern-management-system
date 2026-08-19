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

async function resetAllPasswords() {
  try {
    const rawPassword = 'Admin@123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPassword, salt);

    const result = await pool.query(
      'UPDATE users SET password_hash = $1 RETURNING email, role',
      [hash]
    );

    console.log('✅ ALL PASSWORDS RESET SUCCESSFULLY TO: Admin@123');
    console.table(result.rows);
    await pool.end();
  } catch (err) {
    console.error('❌ Error resetting password:', err);
  }
}

resetAllPasswords();