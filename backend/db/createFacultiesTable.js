const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createFacultiesTable = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Creating faculties table and inserting data...');

    // Create faculties table
    await client.query(`
      CREATE TABLE IF NOT EXISTS faculties (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Faculties table created');

    // Insert faculty data
    const faculties = [
      'คณะครุศาสตร์',
      'คณะวิทยาศาสตร์และเทคโนโลยี',
      'คณะมนุษยศาสตร์และสังคมศาสตร์',
      'คณะวิทยาการจัดการ',
      'คณะเทคโนโลยีการเกษตรและอาหาร',
      'คณะเทคโนโลยีอุตสาหกรรม',
      'วิทยาลัยการจัดการและพัฒนาท้องถิ่น',
      'บัณฑิตวิทยาลัย'
    ];

    for (const faculty of faculties) {
      await client.query(
        'INSERT INTO faculties (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [faculty]
      );
      console.log(`✓ Added: ${faculty}`);
    }

    console.log('\n✅ Faculties table created and data inserted successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

createFacultiesTable();
