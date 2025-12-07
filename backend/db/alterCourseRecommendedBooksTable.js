const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const alterCourseRecommendedBooksTable = async () => {
  const client = await pool.connect();

  try {
    console.log('Altering course_recommended_books table columns...');

    // Increase column sizes to handle longer values
    await client.query(`
      ALTER TABLE course_recommended_books 
      ALTER COLUMN mattype_name TYPE VARCHAR(255);
    `);
    console.log('✓ mattype_name column updated to VARCHAR(255)');

    await client.query(`
      ALTER TABLE course_recommended_books 
      ALTER COLUMN callnumber TYPE VARCHAR(255);
    `);
    console.log('✓ callnumber column updated to VARCHAR(255)');

    await client.query(`
      ALTER TABLE course_recommended_books 
      ALTER COLUMN book_id TYPE VARCHAR(100);
    `);
    console.log('✓ book_id column updated to VARCHAR(100)');

    console.log('\n✅ Column alterations completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

alterCourseRecommendedBooksTable();
