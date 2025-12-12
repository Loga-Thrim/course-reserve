const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const curriculumsData = [
  // คณะครุศาสตร์
  { faculty: 'คณะครุศาสตร์', level: 'ระดับปริญญาเอก', curriculums: ['การวิจัยและประเมินทางการศึกษา', 'การศึกษาพิเศษ', 'การบริหารการศึกษา'] },
  { faculty: 'คณะครุศาสตร์', level: 'ระดับปริญญาโท', curriculums: ['การบริหารการศึกษา', 'การวิจัยและประเมินทางการศึกษา', 'หลักสูตรและการสอน'] },
  { faculty: 'คณะครุศาสตร์', level: 'ระดับประกาศนียบัตรบัณฑิต', curriculums: ['ประกาศนียบัตรบัณฑิตวิชาชีพครู'] },
  { faculty: 'คณะครุศาสตร์', level: 'ระดับปริญญาตรี 4 ปี', curriculums: ['สาขาวิชาคณิตศาสตร์', 'สาขาวิชาพลศึกษา', 'สาขาวิชาการศึกษาปฐมวัย', 'สาขาวิชาดนตรีศึกษา', 'สาขาวิชาภาษาไทย', 'สาขาวิชาภาษาอังกฤษ', 'สาขาวิชาการศึกษาพิเศษ', 'สาขาวิชาสังคมศึกษา', 'สาขาวิชาการประถมศึกษา', 'สาขาวิชาจิตวิทยาและการแนะแนว'] },
  
  // คณะมนุษยศาสตร์และสังคมศาสตร์
  { faculty: 'คณะมนุษยศาสตร์และสังคมศาสตร์', level: 'ระดับปริญญาโท', curriculums: ['สาขาวิชาภาษาไทย'] },
  { faculty: 'คณะมนุษยศาสตร์และสังคมศาสตร์', level: 'ระดับปริญญาตรี 4 ปี', curriculums: ['สาขาวิชาสารสนเทศศาสตร์', 'สาขาวิชาภาษาจีน', 'สาขาวิชาภาษาญี่ปุ่น', 'สาขาวิชาภาษาไทย', 'สาขาวิชาดนตรีสากล', 'สาขาวิชาภาษาอังกฤษ', 'สาขาวิชาภาษาอังกฤษธุรกิจ', 'สาขาวิชาภาษาจีนธุรกิจ'] },
  
  // คณะวิทยาศาสตร์และเทคโนโลยี
  { faculty: 'คณะวิทยาศาสตร์และเทคโนโลยี', level: 'ระดับปริญญาเอก', curriculums: ['สาขาวิชาคหกรรมศาสตร์'] },
  { faculty: 'คณะวิทยาศาสตร์และเทคโนโลยี', level: 'ระดับปริญญาโท', curriculums: ['สาขาวิชาคหกรรมศาสตร์'] },
  { faculty: 'คณะวิทยาศาสตร์และเทคโนโลยี', level: 'ระดับปริญญาตรี 4 ปี', curriculums: ['สาขาวิชาเคมี', 'สาขาวิชาฟิสิกส์', 'สาขาวิชาการศึกษาปฐมวัย', 'สาขาวิชาวิทยาศาสตร์สิ่งแวดล้อม', 'สาขาวิชาสาธารณสุขศาสตร์', 'สาขาวิชาเทคโนโลยีสารสนเทศ', 'สาขาวิชาวิทยาการคอมพิวเตอร์', 'สาขาวิชาบูรณาการสุขภาพ ความงาม และสปา', 'สาขาวิชาคณิตศาสตร์', 'สาขาวิชาจุลชีววิทยา', 'สาขาวิชาชีววิทยา', 'สาขาวิชาวิทยาการข้อมูลและสถิติ', 'สาขาวิชาคหกรรมศาสตร์', 'สาขาวิชาวิทยาศาสตร์ศึกษา'] },
  
  // คณะวิทยาการจัดการ
  { faculty: 'คณะวิทยาการจัดการ', level: 'ระดับปริญญาเอก', curriculums: ['สาขาวิชาบริหารธุรกิจ'] },
  { faculty: 'คณะวิทยาการจัดการ', level: 'ระดับปริญญาโท', curriculums: ['สาขาวิชาบริหารธุรกิจ'] },
  { faculty: 'คณะวิทยาการจัดการ', level: 'ระดับปริญญาตรี 4 ปี', curriculums: ['สาขาวิชาธุรกิจการค้าสมัยใหม่', 'สาขาวิชาการตลาดเชิงสร้างสรรค์และดิจิทัล', 'สาขาวิชาการจัดการเทคโนโลยีสารสนเทศทางธุรกิจ', 'สาขาวิชาการท่องเที่ยวและบริการยุคดิจิทัล', 'สาขาวิชาเศรษฐศาสตร์ธุรกิจและภาครัฐ', 'สาขาวิชาเทคโนโลยีสารสนเทศ', 'สาขาวิชาการจัดการ', 'สาขาวิชาบัญชีบัณฑิต', 'สาขาวิชาการจัดการทรัพยากรมนุษย์และองค์การ', 'สาขาวิชานิเทศศาสตร์', 'สาขาวิชาการจัดการการท่องเที่ยวระหว่างประเทศ'] },
  
  // คณะสังคมศาสตร์และการพัฒนาท้องถิ่น
  { faculty: 'คณะสังคมศาสตร์และการพัฒนาท้องถิ่น', level: 'ระดับปริญญาเอก', curriculums: ['สาขาวิชารัฐประศาสนศาสตร์'] },
  { faculty: 'คณะสังคมศาสตร์และการพัฒนาท้องถิ่น', level: 'ระดับปริญญาโท', curriculums: ['สาขาวิชารัฐประศาสนศาสตร์', 'สาขาวิชานิติศาสตร์'] },
  { faculty: 'คณะสังคมศาสตร์และการพัฒนาท้องถิ่น', level: 'ระดับปริญญาตรี 4 ปี', curriculums: ['นิติศาสตรบัณฑิต', 'สาขาวิชาการพัฒนาชุมชน', 'สาขาวิชาสังคมสงเคราะห์ศาสตร์', 'สาขาวิชารัฐประศาสนศาสตร์', 'สาขาวิชารัฐศาสตร์'] },
  
  // คณะเทคโนโลยีการเกษตรและอาหาร
  { faculty: 'คณะเทคโนโลยีการเกษตรและอาหาร', level: 'ระดับปริญญาตรี 4 ปี', curriculums: ['สาขาวิชาพัฒนาผลิตภัณฑ์เพื่อสุขภาพและเครื่องสำอาง', 'สาขาวิชาวิทยาศาสตร์และเทคโนโลยีการอาหาร', 'สาขาวิชาวิศวกรรมอาหาร', 'สาขาวิชาสัตวศาสตร์และการเพาะเลี้ยงสัตว์น้ำ', 'สาขาวิชาเกษตรศาสตร์', 'สาขาวิชาเทคโนโลยีระบบเกษตร'] },
  
  // คณะเทคโนโลยีอุตสาหกรรม
  { faculty: 'คณะเทคโนโลยีอุตสาหกรรม', level: 'ระดับปริญญาตรี 4 ปี', curriculums: ['อุตสาหกรรมศาสตรบัณฑิต เทคโนโลยีอุตสาหกรรม (ต่อเนื่อง)', 'สาขาวิชาวิศวกรรมคอมพิวเตอร์', 'สาขาวิชาศิลปะและนวัตกรรมการออกแบบสร้างสรรค์', 'สาขาวิชานวัตกรรมเซรามิกส์สร้างสรรค์', 'สาขาวิชาวิศวกรรมโลจิสติกส์', 'สาขาวิชาวิศวกรรมอิเล็กทรอนิกส์', 'สาขาวิชาวิศวกรรมเครื่องกล', 'สาขาวิชาวิศวกรรมโยธา'] },
  
  // คณะพยาบาลศาสตร์
  { faculty: 'คณะพยาบาลศาสตร์', level: 'ระดับปริญญาตรี 4 ปี', curriculums: ['สาขาวิชาพยาบาลศาสตร์'] },
];

const seedCurriculumsData = async () => {
  const client = await pool.connect();

  try {
    console.log('Seeding curriculums data...\n');

    await client.query('BEGIN');

    // First, ensure faculties exist
    const faculties = [...new Set(curriculumsData.map(d => d.faculty))];
    
    for (const facultyName of faculties) {
      const existing = await client.query('SELECT id FROM faculties WHERE name = $1', [facultyName]);
      if (existing.rows.length === 0) {
        await client.query('INSERT INTO faculties (name) VALUES ($1)', [facultyName]);
        console.log(`✓ Created faculty: ${facultyName}`);
      }
    }

    // Now insert curriculums
    for (const data of curriculumsData) {
      const facultyResult = await client.query('SELECT id FROM faculties WHERE name = $1', [data.faculty]);
      const facultyId = facultyResult.rows[0].id;

      for (const curriculumName of data.curriculums) {
        const existing = await client.query(
          'SELECT id FROM curriculums WHERE name = $1 AND faculty_id = $2',
          [curriculumName, facultyId]
        );
        
        if (existing.rows.length === 0) {
          await client.query(
            'INSERT INTO curriculums (name, level, faculty_id) VALUES ($1, $2, $3)',
            [curriculumName, data.level, facultyId]
          );
          console.log(`  ✓ Added: ${curriculumName} (${data.level})`);
        } else {
          // Update level if needed
          await client.query(
            'UPDATE curriculums SET level = $1 WHERE id = $2',
            [data.level, existing.rows[0].id]
          );
          console.log(`  ~ Updated: ${curriculumName} (${data.level})`);
        }
      }
    }

    await client.query('COMMIT');
    console.log('\n✅ Curriculums data seeded successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

seedCurriculumsData();
