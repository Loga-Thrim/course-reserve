const pool = require('../src/config/db');
const { fetchAndStoreRecommendedBooks } = require('../src/services/bookRecommendationService');

// Mock courses data - realistic Thai university courses
const mockCourses = [
  // วิทยาศาสตร์และเทคโนโลยี - วิทยาการคอมพิวเตอร์
  {
    code_th: 'CS101',
    code_en: 'CS101',
    name_th: 'หลักการเขียนโปรแกรมคอมพิวเตอร์',
    name_en: 'Principles of Computer Programming',
    description_th: 'ศึกษาหลักการเขียนโปรแกรมเบื้องต้น การวิเคราะห์ปัญหา การออกแบบอัลกอริทึม โครงสร้างข้อมูลพื้นฐาน การเขียนโปรแกรมภาษา Python หรือ Java ตัวแปร ชนิดข้อมูล โครงสร้างควบคุม ฟังก์ชัน และการจัดการไฟล์',
    description_en: 'Study of basic programming principles, problem analysis, algorithm design, basic data structures, Python or Java programming, variables, data types, control structures, functions, and file handling.',
    faculty: 'วิทยาศาสตร์และเทคโนโลยี',
    curriculum: 'วิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์',
    instructors: ['ผศ.ดร.สมชาย วิทยาการ', 'อ.สุภาพร โปรแกรมเมอร์'],
    keywords: ['programming', 'python', 'java', 'algorithm', 'computer science'],
    website: 'https://cs.psru.ac.th/cs101'
  },
  {
    code_th: 'CS201',
    code_en: 'CS201',
    name_th: 'โครงสร้างข้อมูลและอัลกอริทึม',
    name_en: 'Data Structures and Algorithms',
    description_th: 'ศึกษาโครงสร้างข้อมูลแบบต่างๆ ได้แก่ Array, Linked List, Stack, Queue, Tree, Graph และ Hash Table รวมถึงการวิเคราะห์ประสิทธิภาพของอัลกอริทึม Big-O Notation และอัลกอริทึมการค้นหาและเรียงลำดับ',
    description_en: 'Study of various data structures including Array, Linked List, Stack, Queue, Tree, Graph, and Hash Table, algorithm efficiency analysis, Big-O Notation, searching and sorting algorithms.',
    faculty: 'วิทยาศาสตร์และเทคโนโลยี',
    curriculum: 'วิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์',
    instructors: ['รศ.ดร.วิชัย อัลกอริทึม'],
    keywords: ['data structure', 'algorithm', 'programming', 'computer'],
    website: ''
  },
  {
    code_th: 'CS301',
    code_en: 'CS301',
    name_th: 'ระบบฐานข้อมูล',
    name_en: 'Database Systems',
    description_th: 'ศึกษาแนวคิดและหลักการของระบบฐานข้อมูล การออกแบบฐานข้อมูลเชิงสัมพันธ์ ER-Diagram Normalization ภาษา SQL การจัดการธุรกรรม และความปลอดภัยของฐานข้อมูล',
    description_en: 'Study of database system concepts and principles, relational database design, ER-Diagram, Normalization, SQL language, transaction management, and database security.',
    faculty: 'วิทยาศาสตร์และเทคโนโลยี',
    curriculum: 'วิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์',
    instructors: ['ผศ.ดร.ฐานข้อมูล ดาต้าเบส', 'อ.มายเอสคิวแอล จัดการ'],
    keywords: ['database', 'SQL', 'MySQL', 'PostgreSQL', 'data management'],
    website: 'https://cs.psru.ac.th/cs301'
  },
  {
    code_th: 'CS401',
    code_en: 'CS401',
    name_th: 'ปัญญาประดิษฐ์เบื้องต้น',
    name_en: 'Introduction to Artificial Intelligence',
    description_th: 'ศึกษาพื้นฐานปัญญาประดิษฐ์ การเรียนรู้ของเครื่อง (Machine Learning) โครงข่ายประสาทเทียม (Neural Networks) การประมวลผลภาษาธรรมชาติ และการประยุกต์ใช้ AI ในงานต่างๆ',
    description_en: 'Study of artificial intelligence fundamentals, machine learning, neural networks, natural language processing, and AI applications.',
    faculty: 'วิทยาศาสตร์และเทคโนโลยี',
    curriculum: 'วิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์',
    instructors: ['รศ.ดร.ปัญญา ประดิษฐ์'],
    keywords: ['artificial intelligence', 'machine learning', 'deep learning', 'neural network', 'AI'],
    website: ''
  },

  // วิทยาศาสตร์และเทคโนโลยี - เทคโนโลยีสารสนเทศ
  {
    code_th: 'IT101',
    code_en: 'IT101',
    name_th: 'เทคโนโลยีสารสนเทศเบื้องต้น',
    name_en: 'Introduction to Information Technology',
    description_th: 'ศึกษาความรู้พื้นฐานเกี่ยวกับเทคโนโลยีสารสนเทศ ฮาร์ดแวร์ ซอฟต์แวร์ ระบบเครือข่าย อินเทอร์เน็ต การประยุกต์ใช้งาน IT ในองค์กร และจริยธรรมทางเทคโนโลยีสารสนเทศ',
    description_en: 'Study of information technology fundamentals, hardware, software, network systems, internet, IT applications in organizations, and IT ethics.',
    faculty: 'วิทยาศาสตร์และเทคโนโลยี',
    curriculum: 'วิทยาศาสตรบัณฑิต สาขาวิชาเทคโนโลยีสารสนเทศ',
    instructors: ['อ.สารสนเทศ เทคโนโลยี'],
    keywords: ['information technology', 'IT', 'computer', 'network', 'internet'],
    website: ''
  },
  {
    code_th: 'IT201',
    code_en: 'IT201',
    name_th: 'การพัฒนาเว็บแอปพลิเคชัน',
    name_en: 'Web Application Development',
    description_th: 'ศึกษาการพัฒนาเว็บแอปพลิเคชันสมัยใหม่ HTML5 CSS3 JavaScript React.js หรือ Vue.js การเชื่อมต่อ API RESTful และการออกแบบ UI/UX',
    description_en: 'Study of modern web application development, HTML5, CSS3, JavaScript, React.js or Vue.js, RESTful API integration, and UI/UX design.',
    faculty: 'วิทยาศาสตร์และเทคโนโลยี',
    curriculum: 'วิทยาศาสตรบัณฑิต สาขาวิชาเทคโนโลยีสารสนเทศ',
    instructors: ['ผศ.เว็บ ดีเวลลอปเปอร์', 'อ.ฟรอนต์เอนด์ รีแอค'],
    keywords: ['web development', 'HTML', 'CSS', 'JavaScript', 'React', 'frontend'],
    website: 'https://it.psru.ac.th/webdev'
  },

  // วิทยาการจัดการ - การบัญชี
  {
    code_th: 'AC101',
    code_en: 'AC101',
    name_th: 'หลักการบัญชีเบื้องต้น',
    name_en: 'Principles of Accounting',
    description_th: 'ศึกษาหลักการและแนวคิดทางการบัญชี วงจรบัญชี การบันทึกรายการค้า การจัดทำงบการเงิน งบดุล งบกำไรขาดทุน และการวิเคราะห์งบการเงินเบื้องต้น',
    description_en: 'Study of accounting principles and concepts, accounting cycle, transaction recording, financial statement preparation, balance sheet, income statement, and basic financial analysis.',
    faculty: 'วิทยาการจัดการ',
    curriculum: 'บัญชีบัณฑิต สาขาวิชาการบัญชี',
    instructors: ['ผศ.บัญชี การเงิน', 'อ.งบดุล รายได้'],
    keywords: ['accounting', 'finance', 'financial statement', 'bookkeeping'],
    website: ''
  },
  {
    code_th: 'AC201',
    code_en: 'AC201',
    name_th: 'การบัญชีต้นทุน',
    name_en: 'Cost Accounting',
    description_th: 'ศึกษาแนวคิดและหลักการบัญชีต้นทุน การคำนวณต้นทุนผลิตภัณฑ์ ระบบต้นทุนงานสั่งทำ ระบบต้นทุนช่วงการผลิต การวิเคราะห์ต้นทุน-ปริมาณ-กำไร และการจัดทำงบประมาณ',
    description_en: 'Study of cost accounting concepts and principles, product costing, job order costing, process costing, cost-volume-profit analysis, and budgeting.',
    faculty: 'วิทยาการจัดการ',
    curriculum: 'บัญชีบัณฑิต สาขาวิชาการบัญชี',
    instructors: ['รศ.ต้นทุน วิเคราะห์'],
    keywords: ['cost accounting', 'management accounting', 'budgeting', 'costing'],
    website: ''
  },

  // วิทยาการจัดการ - การตลาด
  {
    code_th: 'MK101',
    code_en: 'MK101',
    name_th: 'หลักการตลาด',
    name_en: 'Principles of Marketing',
    description_th: 'ศึกษาแนวคิดและหลักการตลาด ส่วนประสมทางการตลาด 4Ps พฤติกรรมผู้บริโภค การแบ่งส่วนตลาด การกำหนดตลาดเป้าหมาย และการวางตำแหน่งผลิตภัณฑ์',
    description_en: 'Study of marketing concepts and principles, marketing mix 4Ps, consumer behavior, market segmentation, target marketing, and product positioning.',
    faculty: 'วิทยาการจัดการ',
    curriculum: 'บริหารธุรกิจบัณฑิต สาขาวิชาการตลาดเชิงสร้างสรรค์และดิจิทัล',
    instructors: ['ผศ.ดร.การตลาด ดิจิทัล'],
    keywords: ['marketing', 'digital marketing', 'consumer behavior', 'branding'],
    website: ''
  },
  {
    code_th: 'MK301',
    code_en: 'MK301',
    name_th: 'การตลาดดิจิทัล',
    name_en: 'Digital Marketing',
    description_th: 'ศึกษากลยุทธ์การตลาดดิจิทัล SEO SEM Social Media Marketing Content Marketing Email Marketing การวิเคราะห์ข้อมูลการตลาด Google Analytics และการวางแผนแคมเปญดิจิทัล',
    description_en: 'Study of digital marketing strategies, SEO, SEM, Social Media Marketing, Content Marketing, Email Marketing, marketing analytics, Google Analytics, and digital campaign planning.',
    faculty: 'วิทยาการจัดการ',
    curriculum: 'บริหารธุรกิจบัณฑิต สาขาวิชาการตลาดเชิงสร้างสรรค์และดิจิทัล',
    instructors: ['อ.โซเชียล มีเดีย', 'อ.คอนเทนต์ มาร์เก็ตติ้ง'],
    keywords: ['digital marketing', 'SEO', 'social media', 'content marketing', 'online marketing'],
    website: 'https://ms.psru.ac.th/digitalmarketing'
  },

  // เทคโนโลยีอุตสาหกรรม - วิศวกรรมคอมพิวเตอร์
  {
    code_th: 'CPE101',
    code_en: 'CPE101',
    name_th: 'วงจรดิจิทัลและการออกแบบลอจิก',
    name_en: 'Digital Circuits and Logic Design',
    description_th: 'ศึกษาระบบเลขฐาน พีชคณิตบูลีน วงจรลอจิกพื้นฐาน Combinational Logic Sequential Logic Flip-Flops Counters และการออกแบบวงจรดิจิทัล',
    description_en: 'Study of number systems, Boolean algebra, basic logic circuits, combinational logic, sequential logic, flip-flops, counters, and digital circuit design.',
    faculty: 'เทคโนโลยีอุตสาหกรรม',
    curriculum: 'วิศวกรรมศาสตรบัณฑิต สาขาวิชาวิศวกรรมคอมพิวเตอร์',
    instructors: ['รศ.ดร.ดิจิทัล ลอจิก'],
    keywords: ['digital circuit', 'logic design', 'electronics', 'computer engineering'],
    website: ''
  },
  {
    code_th: 'CPE201',
    code_en: 'CPE201',
    name_th: 'สถาปัตยกรรมคอมพิวเตอร์',
    name_en: 'Computer Architecture',
    description_th: 'ศึกษาโครงสร้างและการทำงานของคอมพิวเตอร์ CPU Memory I/O Systems Instruction Set Architecture Pipeline และ Cache Memory',
    description_en: 'Study of computer structure and operation, CPU, Memory, I/O Systems, Instruction Set Architecture, Pipeline, and Cache Memory.',
    faculty: 'เทคโนโลยีอุตสาหกรรม',
    curriculum: 'วิศวกรรมศาสตรบัณฑิต สาขาวิชาวิศวกรรมคอมพิวเตอร์',
    instructors: ['ผศ.ดร.สถาปัตย์ คอมพิวเตอร์'],
    keywords: ['computer architecture', 'CPU', 'memory', 'hardware', 'processor'],
    website: ''
  },

  // ครุศาสตร์
  {
    code_th: 'ED101',
    code_en: 'ED101',
    name_th: 'จิตวิทยาสำหรับครู',
    name_en: 'Psychology for Teachers',
    description_th: 'ศึกษาทฤษฎีจิตวิทยาการเรียนรู้ พัฒนาการของผู้เรียน จิตวิทยาพัฒนาการ ความแตกต่างระหว่างบุคคล แรงจูงใจในการเรียนรู้ และการประยุกต์ใช้จิตวิทยาในการจัดการเรียนการสอน',
    description_en: 'Study of learning psychology theories, learner development, developmental psychology, individual differences, learning motivation, and psychology application in teaching.',
    faculty: 'ครุศาสตร์',
    curriculum: 'ครุศาสตรบัณฑิต สาขาวิชาการศึกษา',
    instructors: ['รศ.ดร.จิตวิทยา การศึกษา'],
    keywords: ['psychology', 'education', 'learning', 'teaching', 'child development'],
    website: ''
  },
  {
    code_th: 'ED201',
    code_en: 'ED201',
    name_th: 'หลักสูตรและการจัดการเรียนรู้',
    name_en: 'Curriculum and Learning Management',
    description_th: 'ศึกษาแนวคิดและทฤษฎีหลักสูตร การพัฒนาหลักสูตร การออกแบบการจัดการเรียนรู้ เทคนิคการสอน สื่อการเรียนการสอน และการวัดและประเมินผลการเรียนรู้',
    description_en: 'Study of curriculum concepts and theories, curriculum development, learning design, teaching techniques, instructional media, and learning assessment.',
    faculty: 'ครุศาสตร์',
    curriculum: 'ครุศาสตรบัณฑิต สาขาวิชาการศึกษา',
    instructors: ['ผศ.ดร.หลักสูตร การสอน', 'อ.การเรียนรู้ สมัยใหม่'],
    keywords: ['curriculum', 'education', 'teaching', 'learning management', 'pedagogy'],
    website: ''
  },

  // พยาบาลศาสตร์
  {
    code_th: 'NS101',
    code_en: 'NS101',
    name_th: 'กายวิภาคศาสตร์และสรีรวิทยา',
    name_en: 'Anatomy and Physiology',
    description_th: 'ศึกษาโครงสร้างและหน้าที่ของร่างกายมนุษย์ ระบบโครงกระดูก ระบบกล้ามเนื้อ ระบบประสาท ระบบไหลเวียนเลือด ระบบหายใจ ระบบย่อยอาหาร และระบบขับถ่าย',
    description_en: 'Study of human body structure and function, skeletal system, muscular system, nervous system, circulatory system, respiratory system, digestive system, and excretory system.',
    faculty: 'พยาบาลศาสตร์',
    curriculum: 'พยาบาลศาสตรบัณฑิต',
    instructors: ['รศ.ดร.กายวิภาค ศาสตร์', 'ผศ.สรีรวิทยา มนุษย์'],
    keywords: ['anatomy', 'physiology', 'nursing', 'human body', 'medical'],
    website: ''
  },
  {
    code_th: 'NS201',
    code_en: 'NS201',
    name_th: 'การพยาบาลพื้นฐาน',
    name_en: 'Fundamentals of Nursing',
    description_th: 'ศึกษาหลักการและเทคนิคการพยาบาลพื้นฐาน การประเมินสภาพผู้ป่วย การดูแลสุขอนามัย การให้ยา การทำแผล และการดูแลผู้ป่วยแบบองค์รวม',
    description_en: 'Study of basic nursing principles and techniques, patient assessment, hygiene care, medication administration, wound care, and holistic patient care.',
    faculty: 'พยาบาลศาสตร์',
    curriculum: 'พยาบาลศาสตรบัณฑิต',
    instructors: ['ผศ.การพยาบาล พื้นฐาน'],
    keywords: ['nursing', 'patient care', 'healthcare', 'medical', 'nursing fundamentals'],
    website: ''
  },

  // มนุษยศาสตร์และสังคมศาสตร์ - ภาษาอังกฤษ
  {
    code_th: 'EN101',
    code_en: 'EN101',
    name_th: 'ภาษาอังกฤษพื้นฐาน',
    name_en: 'Fundamental English',
    description_th: 'ศึกษาทักษะภาษาอังกฤษพื้นฐานทั้ง 4 ทักษะ ได้แก่ การฟัง การพูด การอ่าน และการเขียน ไวยากรณ์พื้นฐาน คำศัพท์ในชีวิตประจำวัน และการสื่อสารในสถานการณ์ต่างๆ',
    description_en: 'Study of four basic English skills: listening, speaking, reading, and writing, basic grammar, everyday vocabulary, and communication in various situations.',
    faculty: 'มนุษยศาสตร์และสังคมศาสตร์',
    curriculum: 'ศิลปศาสตรบัณฑิต สาขาวิชาภาษาอังกฤษ',
    instructors: ['อ.อิงลิช ทีชเชอร์', 'อ.แกรมม่า มาสเตอร์'],
    keywords: ['English', 'language', 'grammar', 'communication', 'vocabulary'],
    website: ''
  },
  {
    code_th: 'EN301',
    code_en: 'EN301',
    name_th: 'การแปลภาษาอังกฤษ',
    name_en: 'English Translation',
    description_th: 'ศึกษาทฤษฎีและเทคนิคการแปล การแปลจากภาษาอังกฤษเป็นภาษาไทย และจากภาษาไทยเป็นภาษาอังกฤษ การแปลเอกสารประเภทต่างๆ และจรรยาบรรณนักแปล',
    description_en: 'Study of translation theories and techniques, English-Thai and Thai-English translation, translation of various document types, and translator ethics.',
    faculty: 'มนุษยศาสตร์และสังคมศาสตร์',
    curriculum: 'ศิลปศาสตรบัณฑิต สาขาวิชาภาษาอังกฤษ',
    instructors: ['ผศ.ดร.ทรานสเลชั่น เอ็กซ์เพิร์ท'],
    keywords: ['translation', 'English', 'Thai', 'linguistics', 'interpreter'],
    website: ''
  },

  // เทคโนโลยีการเกษตรและอาหาร
  {
    code_th: 'AG101',
    code_en: 'AG101',
    name_th: 'หลักการเกษตร',
    name_en: 'Principles of Agriculture',
    description_th: 'ศึกษาหลักการเกษตรเบื้องต้น การผลิตพืช การเลี้ยงสัตว์ ดินและปุ๋ย การจัดการน้ำ ศัตรูพืชและการป้องกันกำจัด และเกษตรอินทรีย์',
    description_en: 'Study of basic agricultural principles, crop production, animal husbandry, soil and fertilizers, water management, pest control, and organic farming.',
    faculty: 'เทคโนโลยีการเกษตรและอาหาร',
    curriculum: 'วิทยาศาสตรบัณฑิต สาขาวิชาเกษตรศาสตร์',
    instructors: ['รศ.ดร.เกษตร ศาสตร์', 'อ.พืชไร่ นาสวน'],
    keywords: ['agriculture', 'farming', 'crop', 'organic', 'plant science'],
    website: ''
  },
  {
    code_th: 'FT101',
    code_en: 'FT101',
    name_th: 'วิทยาศาสตร์และเทคโนโลยีการอาหาร',
    name_en: 'Food Science and Technology',
    description_th: 'ศึกษาองค์ประกอบทางเคมีของอาหาร การแปรรูปอาหาร การถนอมอาหาร การควบคุมคุณภาพอาหาร สุขาภิบาลอาหาร และมาตรฐานความปลอดภัยอาหาร',
    description_en: 'Study of food chemical composition, food processing, food preservation, food quality control, food sanitation, and food safety standards.',
    faculty: 'เทคโนโลยีการเกษตรและอาหาร',
    curriculum: 'วิทยาศาสตรบัณฑิต สาขาวิชาวิทยาศาสตร์และเทคโนโลยีการอาหาร',
    instructors: ['ผศ.ดร.อาหาร เทคโนโลยี'],
    keywords: ['food science', 'food technology', 'food processing', 'food safety', 'nutrition'],
    website: ''
  }
];

async function seedCourses() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🚀 Starting to seed courses...\n');
    
    // Get faculty and curriculum IDs
    const facultiesResult = await client.query('SELECT id, name FROM faculties');
    const curriculumsResult = await client.query('SELECT id, name, faculty_id FROM curriculums');
    
    const facultyMap = {};
    facultiesResult.rows.forEach(f => { facultyMap[f.name] = f.id; });
    
    const curriculumMap = {};
    curriculumsResult.rows.forEach(c => { curriculumMap[c.name] = { id: c.id, faculty_id: c.faculty_id }; });
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const course of mockCourses) {
      const facultyId = facultyMap[course.faculty];
      const curriculumData = curriculumMap[course.curriculum];
      
      if (!facultyId) {
        console.log(`  ⚠ Faculty "${course.faculty}" not found, skipping ${course.code_th}`);
        skippedCount++;
        continue;
      }
      
      if (!curriculumData) {
        console.log(`  ⚠ Curriculum "${course.curriculum}" not found, skipping ${course.code_th}`);
        skippedCount++;
        continue;
      }
      
      // Check if course already exists
      const existing = await client.query(
        'SELECT id FROM professor_courses WHERE code_th = $1',
        [course.code_th]
      );
      
      if (existing.rows.length > 0) {
        console.log(`  ✓ Course "${course.code_th}" already exists`);
        skippedCount++;
        continue;
      }
      
      // Insert course
      const result = await client.query(
        `INSERT INTO professor_courses 
         (professor_id, name_th, name_en, code_th, code_en, faculty_id, curriculum_id, 
          description_th, description_en, website, keywords) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
         RETURNING id`,
        ['MOCK_PROFESSOR', course.name_th, course.name_en, course.code_th, course.code_en,
         facultyId, curriculumData.id, course.description_th, course.description_en,
         course.website || null, course.keywords]
      );
      
      const courseId = result.rows[0].id;
      
      // Insert instructors
      for (const instructor of course.instructors) {
        await client.query(
          'INSERT INTO course_instructors (course_id, instructor_name) VALUES ($1, $2)',
          [courseId, instructor]
        );
      }
      
      console.log(`  + Added "${course.code_th} - ${course.name_th}"`);
      addedCount++;
    }
    
    await client.query('COMMIT');
    
    console.log('\n✅ Seeding completed!');
    console.log(`   - Courses added: ${addedCount}`);
    console.log(`   - Courses skipped: ${skippedCount}`);
    
    // Fetch recommended books for new courses
    console.log('\n📚 Fetching recommended books for courses...');
    const coursesWithKeywords = await pool.query(
      `SELECT id, keywords FROM professor_courses WHERE keywords IS NOT NULL AND array_length(keywords, 1) > 0`
    );
    
    for (const course of coursesWithKeywords.rows) {
      try {
        console.log(`  Fetching books for course ID ${course.id}...`);
        await fetchAndStoreRecommendedBooks(course.id, course.keywords);
      } catch (err) {
        console.log(`  ⚠ Error fetching books for course ${course.id}: ${err.message}`);
      }
    }
    
    console.log('\n🎉 All done!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding courses:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the seed
seedCourses()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
