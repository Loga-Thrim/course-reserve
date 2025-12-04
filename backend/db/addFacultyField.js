const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const addFacultyField = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Adding faculty field to users table...');

    // Add faculty column to users table
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS faculty VARCHAR(255);
    `);

    console.log('✅ Faculty field added successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

addFacultyField();
