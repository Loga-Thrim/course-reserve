const pool = require('../src/config/db');

async function dropCurriculumColumns() {
  const client = await pool.connect();
  
  try {
    console.log('Dropping curriculum_th and curriculum_en columns from professor_courses...');
    
    // Check if columns exist before dropping
    const checkColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'professor_courses' 
      AND column_name IN ('curriculum_th', 'curriculum_en')
    `);
    
    if (checkColumns.rows.length === 0) {
      console.log('Columns curriculum_th and curriculum_en do not exist. Nothing to drop.');
      return;
    }
    
    // Drop columns
    await client.query(`
      ALTER TABLE professor_courses 
      DROP COLUMN IF EXISTS curriculum_th,
      DROP COLUMN IF EXISTS curriculum_en
    `);
    
    console.log('✅ Successfully dropped curriculum_th and curriculum_en columns');
    
  } catch (error) {
    console.error('Error dropping columns:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

dropCurriculumColumns()
  .then(() => {
    console.log('Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
