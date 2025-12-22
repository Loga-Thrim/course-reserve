const pool = require('../src/config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    const migrationFile = path.join(__dirname, 'migrations', 'create_activity_logs.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');
    
    console.log('Running migration: create_activity_logs.sql');
    await pool.query(sql);
    console.log('Migration completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
