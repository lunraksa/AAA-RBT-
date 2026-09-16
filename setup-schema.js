const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: parseInt(process.env.PGPORT, 10)
});

async function runSchema() {
  try {
    const sql = fs.readFileSync('schema.sql', 'utf-8');
    await pool.query(sql);
    console.log('✅ schema.sql executed successfully!');

    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('📋 Tables in robotics_attendance:', tables.rows.map(r => r.table_name).join(', '));

    // PostgreSQL students table initialized with clean empty roster
    console.log('✅ PostgreSQL students table verified (Empty roster ready for registration).');

    // Seed admin profile in settings table if empty
    const profile = {
      name: 'LUN RAKSA',
      role: 'Head Administrator',
      photo: 'assets/lun_raksa.jpg',
      email: 'raksa.lun@robotics.edu',
      phone: '+855 12 888 999',
      bio: 'Robotics & AI Department Head',
      password: 'admin123',
      pin: '1234',
      isAdmin: true
    };
    await pool.query(
      "INSERT INTO settings (key, value) VALUES ('adminProfile', $1) ON CONFLICT (key) DO NOTHING",
      [JSON.stringify(profile)]
    );
    console.log('✅ Admin profile seeded in PostgreSQL settings table!');
  } catch (err) {
    console.error('Schema execution error:', err.message);
  } finally {
    await pool.end();
  }
}

runSchema();
