const pool = require('../src/config/db');

async function createStudentCoursesTable() {
  const client = await pool.connect();
  
  try {
    console.log('Creating student_courses table...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS student_courses (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(50) NOT NULL,
        student_name VARCHAR(255),
        student_email VARCHAR(255),
        course_id INTEGER NOT NULL REFERENCES professor_courses(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, course_id)
      )
    `);
    
    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_student_courses_student_id ON student_courses(student_id);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_student_courses_course_id ON student_courses(course_id);
    `);
    
    console.log('✅ Successfully created student_courses table');
    
  } catch (error) {
    console.error('Error creating table:', error);
    throw error;
  } finally {
    client.release();
  }
}

createStudentCoursesTable()
  .then(() => {
    console.log('Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
