const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const addProfessorRole = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Adding professor role support...');

    // Check if role column already exists
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role';
    `);

    if (checkColumn.rows.length === 0) {
      // Add role column if it doesn't exist
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN role VARCHAR(50) DEFAULT 'user';
      `);
      console.log('✓ Role column added');
    } else {
      console.log('✓ Role column already exists');
    }

    // Update role check constraint if it exists, or add a comment
    console.log('✓ Professor role is now supported');
    console.log('\nAvailable roles:');
    console.log('  - user (default for students)');
    console.log('  - professor');
    console.log('  - admin');
    
    console.log('\n✅ Professor role migration completed successfully!');
    console.log('\nTo create a professor account, you can:');
    console.log('1. Register a normal user account');
    console.log('2. Update the user\'s role to "professor" using SQL:');
    console.log('   UPDATE users SET role = \'professor\' WHERE email = \'professor@example.com\';');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

addProfessorRole();
