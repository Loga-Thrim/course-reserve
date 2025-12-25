const pool = require('../src/config/db');

async function addCatDateColumn() {
  const client = await pool.connect();
  
  try {
    console.log('Adding cat_date column to course_recommended_books...');
    
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'course_recommended_books' 
      AND column_name = 'cat_date'
    `);
    
    if (checkColumn.rows.length > 0) {
      console.log('Column cat_date already exists. Nothing to add.');
      return;
    }
    
    await client.query(`
      ALTER TABLE course_recommended_books 
      ADD COLUMN cat_date TIMESTAMP
    `);
    
    console.log('✅ Successfully added cat_date column');
    
  } catch (error) {
    console.error('Error adding column:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

addCatDateColumn();
