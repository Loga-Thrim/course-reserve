const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createCourseRecommendedBooksTable = async () => {
  const client = await pool.connect();

  try {
    console.log('Creating course_recommended_books table...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS course_recommended_books (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES professor_courses(id) ON DELETE CASCADE,
        book_id VARCHAR(50) NOT NULL,
        title VARCHAR(500) NOT NULL,
        author VARCHAR(255),
        publisher VARCHAR(255),
        callnumber VARCHAR(100),
        isbn VARCHAR(50),
        bookcover VARCHAR(500),
        mattype_name VARCHAR(50),
        lang VARCHAR(50),
        keyword_source VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(course_id, book_id)
      );
    `);

    console.log('✓ course_recommended_books table created');

    // Create indexes for faster queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_course_recommended_books_course_id 
      ON course_recommended_books(course_id);
    `);

    console.log('✓ Index created');

    console.log('\n✅ Course recommended books table migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

createCourseRecommendedBooksTable();
