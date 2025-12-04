const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createCurriculumsTable = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Creating curriculums table...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS curriculums (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        level VARCHAR(255),
        faculty_id INTEGER NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (name, faculty_id)
      );
    `);

    console.log('✅ Curriculums table created successfully!');
  } catch (error) {
    console.error('❌ Migration failed (curriculums):', error);
  } finally {
    client.release();
    await pool.end();
  }
};

createCurriculumsTable();
