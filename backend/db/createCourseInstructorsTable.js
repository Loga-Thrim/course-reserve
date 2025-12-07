const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createCourseInstructorsTable = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Creating course_instructors table...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS course_instructors (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES professor_courses(id) ON DELETE CASCADE,
        instructor_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('✓ course_instructors table created');

    // Create index for faster queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_course_instructors_course_id 
      ON course_instructors(course_id);
    `);
    
    console.log('✓ Index created');
    
    console.log('\n✅ Course instructors table migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

createCourseInstructorsTable();
