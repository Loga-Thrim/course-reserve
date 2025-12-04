const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createCourseReservesTable = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Creating course_reserves table...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS course_reserves (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (course_id, book_id)
      );
    `);

    console.log('✅ course_reserves table created successfully!');
  } catch (error) {
    console.error('❌ Migration failed (course_reserves):', error);
  } finally {
    client.release();
    await pool.end();
  }
};

createCourseReservesTable();
