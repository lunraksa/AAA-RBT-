/**
 * PostgreSQL Connection Diagnostic Tester
 * Run: node test-db.js
 */

const { Pool } = require('pg');
require('dotenv').config();

console.log('\n--- Testing PostgreSQL Connection ---');
console.log(`Host:     ${process.env.PGHOST || 'localhost'}`);
console.log(`Port:     ${process.env.PGPORT || 5433}`);
console.log(`User:     ${process.env.PGUSER || 'postgres'}`);
console.log(`Database: ${process.env.PGDATABASE || 'robotics_attendance'}`);
console.log(`Password: ${process.env.PGPASSWORD ? '******' : '(empty)'}`);

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: 'postgres', // Connect to default postgres DB first to test credentials
  password: process.env.PGPASSWORD,
  port: parseInt(process.env.PGPORT, 10) || 5433,
  connectionTimeoutMillis: 3000
});

pool.connect(async (err, client, release) => {
  if (err) {
    console.error('\n❌ Connection Failed:');
    console.error('Error message:', err.message);
    if (err.message.includes('password authentication failed')) {
      console.log('\n👉 Solution:');
      console.log('Your PostgreSQL password in .env is incorrect.');
      console.log('Open .env and set PGPASSWORD to the password you set during PostgreSQL installation.');
    } else if (err.message.includes('ECONNREFUSED')) {
      console.log('\n👉 Solution:');
      console.log('PostgreSQL service is not running on this port.');
      console.log('Check if your PostgreSQL service is running or verify port.');
    }
    process.exit(1);
  }

  console.log('\n✅ Successfully connected to PostgreSQL Server!');
  
  try {
    const res = await client.query('SELECT version();');
    console.log('Version:', res.rows[0].version.split(',')[0]);

    // Check if robotics_attendance exists
    const dbName = process.env.PGDATABASE || 'robotics_attendance';
    const checkDb = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (checkDb.rowCount === 0) {
      console.log(`Database "${dbName}" does not exist yet. Creating it...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database "${dbName}" created successfully!`);
    } else {
      console.log(`✅ Database "${dbName}" already exists.`);
    }
  } catch (e) {
    console.error('Query error:', e.message);
  } finally {
    release();
    await pool.end();
    console.log('\nAll tests completed successfully. Your server is ready to run with PostgreSQL!\n');
  }
});
