const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createCoursesTable = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Creating courses table...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        curriculum_id INTEGER NOT NULL REFERENCES curriculums(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (name, curriculum_id)
      );
    `);

    console.log('✅ Courses table created successfully!');
  } catch (error) {
    console.error('❌ Migration failed (courses):', error);
  } finally {
    client.release();
    await pool.end();
  }
};

createCoursesTable();
