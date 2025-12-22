const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const addKeywordsAndFilesColumns = async () => {
  const client = await pool.connect();

  try {
    console.log('Adding keywords and files columns to professor_courses...\n');

    await client.query(`
      ALTER TABLE professor_courses 
      ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT '{}'
    `);
    console.log('✓ Added keywords column');

    await client.query(`
      ALTER TABLE professor_courses 
      ADD COLUMN IF NOT EXISTS faculty_id INTEGER REFERENCES faculties(id)
    `);
    console.log('✓ Added faculty_id column');

    await client.query(`
      ALTER TABLE professor_courses 
      ADD COLUMN IF NOT EXISTS curriculum_id INTEGER REFERENCES curriculums(id)
    `);
    console.log('✓ Added curriculum_id column');

    await client.query(`
      CREATE TABLE IF NOT EXISTS course_files (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES professor_courses(id) ON DELETE CASCADE,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        file_size INTEGER,
        file_path VARCHAR(500) NOT NULL,
        uploaded_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ Created course_files table');

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_course_files_course_id 
      ON course_files(course_id)
    `);
    console.log('✓ Created index on course_files');

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

addKeywordsAndFilesColumns();
