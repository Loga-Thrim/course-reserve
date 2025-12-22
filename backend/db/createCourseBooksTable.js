const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createCourseBooksTable = async () => {
  const client = await pool.connect();

  try {
    console.log('Creating course_books table...\n');

    // Create course_books table for books added to courses by professors
    await client.query(`
      CREATE TABLE IF NOT EXISTS course_books (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES professor_courses(id) ON DELETE CASCADE,
        book_id VARCHAR(100) NOT NULL,
        title VARCHAR(500),
        author VARCHAR(500),
        publisher VARCHAR(500),
        callnumber VARCHAR(100),
        isbn VARCHAR(50),
        bookcover TEXT,
        added_by VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(course_id, book_id)
      )
    `);
    console.log('✓ Created course_books table');

    // Create index for faster queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_course_books_course_id 
      ON course_books(course_id)
    `);
    console.log('✓ Created index on course_books');

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

createCourseBooksTable();
