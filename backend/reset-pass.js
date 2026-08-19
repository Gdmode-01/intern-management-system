const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

async function resetAll() {
    try {
        console.log('Connecting to database...');
        
        // 1. Password hash create karo for 'Admin@123'
        const hash = await bcrypt.hash('Admin@123', 10);
        
        // 2. Database constraints check bypass karke standard roles set karo
        await pool.query("UPDATE users SET role='HR' WHERE LOWER(role)='hr' OR email LIKE '%hr%';");
        await pool.query("UPDATE users SET role='RM' WHERE LOWER(role)='rm' OR email LIKE '%rm%';");
        await pool.query("UPDATE users SET role='Intern' WHERE LOWER(role)='intern' OR email LIKE '%intern%';");
        
        // 3. Sabhi users ka password 'Admin@123' par sync karo
        await pool.query("UPDATE users SET password_hash = $1", [hash]);
        
        console.log('✅ SUCCESS! All roles synced (HR, RM, Intern) & password set to: Admin@123');
    } catch (err) {
        console.error('❌ Error resetting passwords:', err.message);
    } finally {
        await pool.end();
    }
}

resetAll();