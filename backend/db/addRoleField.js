const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const addRoleField = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Adding role field to users table...');

    // Add role column to users table with default 'user'
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';
    `);
    console.log('✓ Role column added');

    // Set existing users to 'user' role if null
    await client.query(`
      UPDATE users 
      SET role = 'user' 
      WHERE role IS NULL;
    `);
    console.log('✓ Updated existing users with default role');

    console.log('\n✅ Role field migration completed successfully!');
    console.log('Available roles: user, admin');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

addRoleField();
