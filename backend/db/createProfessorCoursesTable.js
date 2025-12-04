const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createProfessorCoursesTable = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Creating professor_courses table...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS professor_courses (
        id SERIAL PRIMARY KEY,
        professor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name_th VARCHAR(255) NOT NULL,
        name_en VARCHAR(255) NOT NULL,
        code_th VARCHAR(50) NOT NULL,
        code_en VARCHAR(50) NOT NULL,
        curriculum_th TEXT NOT NULL,
        curriculum_en TEXT NOT NULL,
        description_th TEXT NOT NULL,
        description_en TEXT NOT NULL,
        website VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('✓ professor_courses table created');

    // Create index for faster queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_professor_courses_professor_id 
      ON professor_courses(professor_id);
    `);
    
    console.log('✓ Index created');
    
    console.log('\n✅ Professor courses table migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

createProfessorCoursesTable();
