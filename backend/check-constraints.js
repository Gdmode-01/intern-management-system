const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'intern_management',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function check() {
  const res = await pool.query(`
    SELECT conname, pg_get_constraintdef(c.oid) as def
    FROM pg_constraint c 
    JOIN pg_namespace n ON n.oid = c.connamespace 
    WHERE n.nspname = 'public' AND contype = 'c';
  `);
  console.log(res.rows);
  await pool.end();
}

check();
