const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to Neon PostgreSQL successfully!');
    
    // Test query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('📅 Current database time:', result.rows[0].current_time);
    
    // List tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('📊 Available tables:');
    tables.rows.forEach((row, i) => {
      console.log(`  ${i + 1}. ${row.table_name}`);
    });
    
    client.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
  }
}

testConnection();