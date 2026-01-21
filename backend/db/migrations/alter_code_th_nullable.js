const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const pool = require('../../src/config/db');

async function alterCodeThNullable() {
  const client = await pool.connect();
  
  try {
    console.log('Altering code_th column to allow NULL...');
    
    await client.query(
      `ALTER TABLE professor_courses ALTER COLUMN code_th DROP NOT NULL`
    );
    
    console.log('✅ Column code_th is now nullable');
    console.log('✅ Migration completed successfully');
    
  } catch (error) {
    console.error('Error altering code_th column:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

alterCodeThNullable()
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
