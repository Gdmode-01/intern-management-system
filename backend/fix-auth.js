const { Pool } = require('pg');
const bcrypt = require('bcrypt'); // agar error aaye toh 'bcrypt' kar dena
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

async function fixLogin() {
    try {
        console.log("1. Connecting to Database...");
        
        // Plain text password ko bcrypt se real hash banao
        const passwordPlain = 'Admin@123';
        const salt = await bcrypt.genSalt(10);
        const realHash = await bcrypt.hash(passwordPlain, salt);

        console.log("2. Cleaning old HR constraints and users...");
        await pool.query("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;");
        
        // Safe update all HR users
        const res = await pool.query(
            "UPDATE users SET password_hash = $1, role = 'HR' WHERE email IN ('hr@system.com', 'hr@intern.com') RETURNING email, role;",
            [realHash]
        );

        console.log("3. HR Users Updated Successfully:", res.rows);
        console.log("\n==========================================");
        console.log("✅ SUCCESS! LOGIN FIXED.");
        console.log("Email: hr@system.com (OR hr@intern.com)");
        console.log("Password: Admin@123");
        console.log("==========================================\n");

    } catch (err) {
        console.error("❌ Error fixing auth:", err);
    } finally {
        await pool.end();
    }
}

fixLogin();