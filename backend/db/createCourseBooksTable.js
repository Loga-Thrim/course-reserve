const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createCourseBooksTable = async () => {
  const client = await pool.connect();

  try {
    console.log('Creating course_books table...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS course_books (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES professor_courses(id) ON DELETE CASCADE,
        book_id VARCHAR(50) NOT NULL,
        title VARCHAR(500) NOT NULL,
        author VARCHAR(255),
        publisher VARCHAR(255),
        callnumber VARCHAR(100),
        isbn VARCHAR(50),
        bookcover VARCHAR(500),
        added_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(course_id, book_id)
      );
    `);

    console.log('✓ course_books table created');

    // Create indexes for faster queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_course_books_course_id 
      ON course_books(course_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_course_books_book_id 
      ON course_books(book_id);
    `);

    console.log('✓ Indexes created');

    console.log('\n✅ Course books table migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

createCourseBooksTable();
