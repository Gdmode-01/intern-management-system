// backend/create-hr.js
const bcrypt = require('bcrypt');
const pool = require('./src/config/database');

async function createHR() {
    const email = 'hr@system.com';
    const password = 'Admin@123';
    const fullName = 'HR Admin';
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        // Check if user already exists
        const check = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (check.rows.length > 0) {
            console.log('❌ User already exists!');
            process.exit();
        }

        await pool.query(
            `INSERT INTO users (email, password_hash, full_name, role) 
             VALUES ($1, $2, $3, 'hr')`,
            [email, hashedPassword, fullName]
        );
        console.log('✅ HR User created successfully!');
        console.log('📧 Email: hr@system.com');
        console.log('🔑 Password: Admin@123');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
    process.exit();
}

createHR();