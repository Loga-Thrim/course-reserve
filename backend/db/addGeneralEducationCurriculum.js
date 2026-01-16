const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../src/config/db');

async function addGeneralEducationCurriculum() {
  const client = await pool.connect();
  
  try {
    console.log('Adding General Education curriculum...');
    
    // First, check if "กองบริการศึกษา" faculty exists, if not create it
    let facultyResult = await client.query(
      `SELECT id FROM faculties WHERE name ILIKE '%กองบริการศึกษา%' OR name ILIKE '%สำนักส่งเสริมวิชาการ%'`
    );
    
    let facultyId;
    if (facultyResult.rows.length === 0) {
      // Create the faculty
      const insertFaculty = await client.query(
        `INSERT INTO faculties (name) VALUES ('กองบริการศึกษา') RETURNING id`
      );
      facultyId = insertFaculty.rows[0].id;
      console.log('✅ Created faculty: กองบริการศึกษา (ID: ' + facultyId + ')');
    } else {
      facultyId = facultyResult.rows[0].id;
      console.log('Faculty already exists (ID: ' + facultyId + ')');
    }
    
    // Check if "รายวิชาศึกษาทั่วไป" curriculum exists
    const curriculumResult = await client.query(
      `SELECT id FROM curriculums WHERE name ILIKE '%รายวิชาศึกษาทั่วไป%' AND faculty_id = $1`,
      [facultyId]
    );
    
    if (curriculumResult.rows.length === 0) {
      // Create the curriculum
      await client.query(
        `INSERT INTO curriculums (faculty_id, name, level) VALUES ($1, 'รายวิชาศึกษาทั่วไป', 'ปริญญาตรี')`,
        [facultyId]
      );
      console.log('✅ Created curriculum: รายวิชาศึกษาทั่วไป');
    } else {
      console.log('Curriculum "รายวิชาศึกษาทั่วไป" already exists');
    }
    
    console.log('✅ Migration completed successfully');
    
  } catch (error) {
    console.error('Error adding General Education curriculum:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addGeneralEducationCurriculum()
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
