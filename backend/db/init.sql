-- Database initialization script for Course Reserve System
-- This script will be run automatically when the database container starts

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    faculty VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Faculties table
CREATE TABLE IF NOT EXISTS faculties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Curriculums table
CREATE TABLE IF NOT EXISTS curriculums (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    level VARCHAR(100),
    faculty_id INTEGER REFERENCES faculties(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Professor courses table
CREATE TABLE IF NOT EXISTS professor_courses (
    id SERIAL PRIMARY KEY,
    professor_id VARCHAR(50),
    name_th VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    code_th VARCHAR(50),
    code_en VARCHAR(50),
    description_th TEXT NOT NULL DEFAULT '',
    description_en TEXT,
    website VARCHAR(500),
    keywords TEXT[] DEFAULT '{}',
    faculty_id INTEGER REFERENCES faculties(id),
    curriculum_id INTEGER REFERENCES curriculums(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course instructors table
CREATE TABLE IF NOT EXISTS course_instructors (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES professor_courses(id) ON DELETE CASCADE,
    instructor_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course books table
CREATE TABLE IF NOT EXISTS course_books (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES professor_courses(id) ON DELETE CASCADE,
    book_id INTEGER,
    barcode VARCHAR(50),
    title VARCHAR(500) NOT NULL,
    author VARCHAR(500),
    publisher VARCHAR(500),
    callnumber VARCHAR(100),
    isbn VARCHAR(50),
    bookcover TEXT,
    collection_name VARCHAR(500),
    item_status VARCHAR(100),
    location VARCHAR(100),
    added_by VARCHAR(100),
    admin_recommended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, barcode)
);

-- Student courses table
CREATE TABLE IF NOT EXISTS student_courses (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(100) NOT NULL,
    student_name VARCHAR(255),
    student_email VARCHAR(255),
    course_id INTEGER REFERENCES professor_courses(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id)
);

-- Course files table
CREATE TABLE IF NOT EXISTS course_files (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES professor_courses(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    file_path VARCHAR(500),
    uploaded_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Book suggestions cache table
CREATE TABLE IF NOT EXISTS book_suggestions (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES professor_courses(id) ON DELETE CASCADE,
    book_id INTEGER,
    title VARCHAR(500),
    author VARCHAR(500),
    publisher VARCHAR(500),
    callnumber VARCHAR(100),
    isbn VARCHAR(50),
    bookcover TEXT,
    keyword_source VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course recommended books table (admin recommendations)
CREATE TABLE IF NOT EXISTS course_recommended_books (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES professor_courses(id) ON DELETE CASCADE,
    book_id INTEGER,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(500),
    publisher VARCHAR(500),
    callnumber VARCHAR(100),
    isbn VARCHAR(50),
    bookcover TEXT,
    mattype_name VARCHAR(255),
    lang VARCHAR(50),
    keyword_source VARCHAR(255),
    cat_date VARCHAR(100),
    admin_recommended BOOLEAN DEFAULT FALSE,
    added_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    user_type VARCHAR(20) NOT NULL,
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    faculty VARCHAR(255),
    program VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id INTEGER,
    resource_name VARCHAR(500),
    details JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_professor_courses_professor_id ON professor_courses(professor_id);
CREATE INDEX IF NOT EXISTS idx_professor_courses_faculty_id ON professor_courses(faculty_id);
CREATE INDEX IF NOT EXISTS idx_professor_courses_curriculum_id ON professor_courses(curriculum_id);
CREATE INDEX IF NOT EXISTS idx_course_books_course_id ON course_books(course_id);
CREATE INDEX IF NOT EXISTS idx_course_books_book_id ON course_books(book_id);
CREATE INDEX IF NOT EXISTS idx_course_books_barcode ON course_books(barcode);
CREATE INDEX IF NOT EXISTS idx_course_recommended_books_course_id ON course_recommended_books(course_id);
CREATE INDEX IF NOT EXISTS idx_course_recommended_books_book_id ON course_recommended_books(book_id);
CREATE INDEX IF NOT EXISTS idx_student_courses_student_id ON student_courses(student_id);
CREATE INDEX IF NOT EXISTS idx_student_courses_course_id ON student_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_course_files_course_id ON course_files(course_id);
CREATE INDEX IF NOT EXISTS idx_book_suggestions_course_id ON book_suggestions(course_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_type ON activity_logs(user_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource_type ON activity_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at_desc ON activity_logs(created_at DESC);

-- Insert default admin user (password: 123456)
INSERT INTO users (email, password_hash, name, role) 
VALUES ('admin@admin.com', '$2b$10$BJp8WoohrMgk0q3q4H3ZjeNjuSD9bKjlTp5qPVH4LHpCPd82su2tO', 'Admin', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert faculties (คณะ)
INSERT INTO faculties (id, name) VALUES
(37, 'ครุศาสตร์'),
(38, 'เทคโนโลยีการเกษตรและอาหาร'),
(39, 'เทคโนโลยีอุตสาหกรรม'),
(40, 'พยาบาลศาสตร์'),
(41, 'มนุษยศาสตร์และสังคมศาสตร์'),
(42, 'วิทยาการจัดการ'),
(43, 'วิทยาศาสตร์และเทคโนโลยี'),
(44, 'สังคมศาสตร์และการพัฒนาท้องถิ่น')
ON CONFLICT DO NOTHING;

-- Reset sequence for faculties
SELECT setval('faculties_id_seq', 44, true);

-- Insert curriculums (หลักสูตร/สาขา)
INSERT INTO curriculums (id, name, faculty_id, level) VALUES
-- ครุศาสตร์ (37)
(138, 'สาขาวิชาการศึกษา วิชาเอกการประถมศึกษา', 37, 'ป.ตรี'),
(139, 'สาขาวิชาการศึกษา วิชาเอกการศึกษาปฐมวัย', 37, 'ป.ตรี'),
(140, 'สาขาวิชาการศึกษา วิชาเอกการศึกษาพิเศษ', 37, 'ป.ตรี'),
(141, 'สาขาวิชาการศึกษา วิชาเอกคณิตศาสตร์', 37, 'ป.ตรี'),
(142, 'สาขาวิชาการศึกษา วิชาเอกจิตวิทยาและการแนะแนว', 37, 'ป.ตรี'),
(143, 'สาขาวิชาการศึกษา วิชาเอกดนตรีและนาฏศิลป์ศึกษา', 37, 'ป.ตรี'),
(144, 'สาขาวิชาการศึกษา วิชาเอกพลศึกษา', 37, 'ป.ตรี'),
(145, 'สาขาวิชาการศึกษา วิชาเอกภาษาไทย', 37, 'ป.ตรี'),
(146, 'สาขาวิชาการศึกษา วิชาเอกภาษาอังกฤษ', 37, 'ป.ตรี'),
(147, 'สาขาวิชาการศึกษา วิชาเอกวิทยาศาสตร์ทั่วไป', 37, 'ป.ตรี'),
(148, 'สาขาวิชาการศึกษา วิชาเอกสังคมศึกษา', 37, 'ป.ตรี'),
(149, 'ประกาศนียบัตรบัณฑิต วิชาชีพครู', 37, 'ป.บัณฑิต'),
(150, 'ครุศาสตรมหาบัณฑิต สาขาวิชาหลักสูตรและการสอน', 37, 'ป.โท'),
(151, 'ครุศาสตรมหาบัณฑิต สาขาวิชาการบริหารการศึกษา', 37, 'ป.โท'),
(152, 'ปรัชญาดุษฎีบัณฑิต สาขาวิชาวิจัยและพัฒนานวัตกรรม', 37, 'ป.เอก'),
(153, 'ครุศาสตรมหาบัณฑิต สาขาวิชาวิจัยและพัฒนานวัตกรรม', 37, 'ป.โท'),
-- เทคโนโลยีการเกษตรและอาหาร (38)
(154, 'สาขาวิชาเกษตรศาสตร์ วิชาเอกการจัดการทรัพยากรเกษตรและสิ่งแวดล้อม', 38, 'ป.ตรี'),
(155, 'สาขาวิชาเกษตรศาสตร์ วิชาเอกพืชศาสตร์', 38, 'ป.ตรี'),
(156, 'สาขาวิชานวัตกรรมและเทคโนโลยีเพิ่มมูลค่าผลพลอยได้ทางการเกษตร', 38, 'ป.ตรี'),
(157, 'สาขาวิชาพัฒนาผลิตภัณฑ์เพื่อสุขภาพและเครื่องสำอาง', 38, 'ป.ตรี'),
(158, 'สาขาวิชาวิทยาศาสตร์และเทคโนโลยีการอาหาร', 38, 'ป.ตรี'),
(159, 'สาขาวิชาสัตวศาสตร์และการเพาะเลี้ยงสัตว์น้ำ วิชาเอกการเพาะเลี้ยงสัตว์น้ำ', 38, 'ป.ตรี'),
(160, 'สาขาวิชาสัตวศาสตร์และการเพาะเลี้ยงสัตว์น้ำ วิชาเอกสัตวศาสตร์', 38, 'ป.ตรี'),
-- เทคโนโลยีอุตสาหกรรม (39)
(161, 'สาขาวิชาสถาปัตยกรรม', 39, 'ป.ตรี'),
(162, 'สาขาวิชาวิศวกรรมการผลิต', 39, 'ป.ตรี'),
(163, 'สาขาวิชาวิศวกรรมคอมพิวเตอร์', 39, 'ป.ตรี'),
(164, 'สาขาวิชาวิศวกรรมเครื่องกล', 39, 'ป.ตรี'),
(165, 'สาขาวิชาวิศวกรรมไฟฟ้าสื่อสารและอิเล็กทรอนิกส์', 39, 'ป.ตรี'),
(166, 'สาขาวิชาวิศวกรรมโยธา', 39, 'ป.ตรี'),
(167, 'สาขาวิชาวิศวกรรมโลจิสติกส์', 39, 'ป.ตรี'),
(168, 'สาขาวิชาศิลปะและการออกแบบ วิชาเอกเครื่องปั้นดินเผา', 39, 'ป.ตรี'),
(169, 'สาขาวิชาศิลปะและการออกแบบ วิชาเอกออกแบบผลิตภัณฑ์', 39, 'ป.ตรี'),
(170, 'สาขาวิชาวิศวกรรมการผลิต (เทียบโอน)', 39, 'ป.ตรี (เทียบโอน)'),
(171, 'สาขาวิชาวิศวกรรมคอมพิวเตอร์ (เทียบโอน)', 39, 'ป.ตรี (เทียบโอน)'),
(172, 'สาขาวิชาวิศวกรรมเครื่องกล (เทียบโอน)', 39, 'ป.ตรี (เทียบโอน)'),
(173, 'สาขาวิชาวิศวกรรมไฟฟ้าสื่อสารและอิเล็กทรอนิกส์ (เทียบโอน)', 39, 'ป.ตรี (เทียบโอน)'),
(174, 'สาขาวิชาวิศวกรรมโยธา (เทียบโอน)', 39, 'ป.ตรี (เทียบโอน)'),
(175, 'สาขาวิชาศิลปะและการออกแบบ (เทียบโอน)', 39, 'ป.ตรี (เทียบโอน)'),
(176, 'สาขาวิชาเทคโนโลยีอุตสาหกรรม วิชาเอกเทคโนโลยีวิศวกรรมการจัดการและโลจิสติกส์ (ต่อเนื่อง)', 39, 'ป.ตรี (ต่อเนื่อง)'),
(177, 'สาขาวิชาเทคโนโลยีอุตสาหกรรม วิชาเอกเทคโนโลยีวิศวกรรมไฟฟ้ากำลัง (ต่อเนื่อง)', 39, 'ป.ตรี (ต่อเนื่อง)'),
(178, 'วิศวกรรมศาสตรมหาบัณฑิต สาขาวิชาวิศวกรรมการจัดการและเทคโนโลยีอุตสาหกรรม', 39, 'ป.โท'),
-- พยาบาลศาสตร์ (40)
(179, 'พยาบาลศาสตรบัณฑิต', 40, 'ป.ตรี'),
-- มนุษยศาสตร์และสังคมศาสตร์ (41)
(180, 'สาขาวิชาดนตรี', 41, 'ป.ตรี'),
(181, 'สาขาวิชาภาษาจีน', 41, 'ป.ตรี'),
(182, 'สาขาวิชาภาษาจีนธุรกิจ', 41, 'ป.ตรี'),
(183, 'สาขาวิชาภาษาญี่ปุ่น', 41, 'ป.ตรี'),
(184, 'สาขาวิชาภาษาไทย', 41, 'ป.ตรี'),
(185, 'สาขาวิชาภาษาอังกฤษ', 41, 'ป.ตรี'),
(186, 'สาขาวิชาภาษาอังกฤษธุรกิจ', 41, 'ป.ตรี'),
(187, 'สาขาวิชาสารสนเทศศาสตร์', 41, 'ป.ตรี'),
(188, 'ศิลปศาสตรมหาบัณฑิต สาขาวิชาภาษาไทย', 41, 'ป.โท'),
-- วิทยาการจัดการ (42)
(189, 'สาขาวิชาการจัดการ', 42, 'ป.ตรี'),
(190, 'สาขาวิชาการจัดการการท่องเที่ยวระหว่างประเทศ', 42, 'ป.ตรี'),
(191, 'สาขาวิชาการจัดการทรัพยากรมนุษย์และองค์การ', 42, 'ป.ตรี'),
(192, 'สาขาวิชาการตลาดเชิงสร้างสรรค์และดิจิทัล', 42, 'ป.ตรี'),
(193, 'สาขาวิชาการท่องเที่ยวและบริการยุคดิจิทัล', 42, 'ป.ตรี'),
(194, 'บัญชีบัณฑิต', 42, 'ป.ตรี'),
(195, 'สาขาวิชาธุรกิจการค้าสมัยใหม่', 42, 'ป.ตรี'),
(196, 'สาขาวิชาเทคโนโลยีธุรกิจดิจิทัล', 42, 'ป.ตรี'),
(197, 'สาขาวิชานิเทศศาสตร์', 42, 'ป.ตรี'),
(198, 'สาขาวิชาเศรษฐศาสตร์ธุรกิจและภาครัฐ', 42, 'ป.ตรี'),
(199, 'สาขาวิชาการจัดการ (เทียบโอน)', 42, 'ป.ตรี (เทียบโอน)'),
(200, 'สาขาวิชาการจัดการการท่องเที่ยวระหว่างประเทศ (เทียบโอน)', 42, 'ป.ตรี (เทียบโอน)'),
(201, 'สาขาวิชาการจัดการทรัพยากรมนุษย์และองค์การ (เทียบโอน)', 42, 'ป.ตรี (เทียบโอน)'),
(202, 'สาขาวิชาการตลาดเชิงสร้างสรรค์และดิจิทัล (เทียบโอน)', 42, 'ป.ตรี (เทียบโอน)'),
(203, 'บัญชีบัณฑิต (เทียบโอน)', 42, 'ป.ตรี (เทียบโอน)'),
(204, 'สาขาวิชาเทคโนโลยีธุรกิจดิจิทัล (เทียบโอน)', 42, 'ป.ตรี (เทียบโอน)'),
(205, 'บริหารธุรกิจมหาบัณฑิต สาขาวิชาบริหารธุรกิจ', 42, 'ป.โท'),
(206, 'ปรัชญาดุษฎีบัณฑิต สาขาวิชาบริหารธุรกิจ', 42, 'ป.เอก'),
-- วิทยาศาสตร์และเทคโนโลยี (43)
(207, 'สาขาวิชาคณิตศาสตร์', 43, 'ป.ตรี'),
(208, 'สาขาวิชาคหกรรมศาสตร์', 43, 'ป.ตรี'),
(209, 'สาขาวิชาเคมี', 43, 'ป.ตรี'),
(210, 'สาขาวิชาจุลชีววิทยา', 43, 'ป.ตรี'),
(211, 'สาขาวิชาชีววิทยา', 43, 'ป.ตรี'),
(212, 'สาขาวิชาเทคโนโลยีสารสนเทศ', 43, 'ป.ตรี'),
(213, 'สาขาวิชาฟิสิกส์', 43, 'ป.ตรี'),
(214, 'สาขาวิชาวิทยาการคอมพิวเตอร์', 43, 'ป.ตรี'),
(215, 'สาขาวิชาวิทยาศาสตร์สิ่งแวดล้อม', 43, 'ป.ตรี'),
(216, 'สาขาวิชาสาธารณสุขศาสตร์', 43, 'ป.ตรี'),
(217, 'สาขาวิชาเทคโนโลยีสารสนเทศ (เทียบโอน)', 43, 'ป.ตรี (เทียบโอน)'),
(218, 'ศิลปศาสตรมหาบัณฑิต สาขาวิชาคหกรรมศาสตร์', 43, 'ป.โท'),
(219, 'ปรัชญาดุษฎีบัณฑิต สาขาวิชาคหกรรมศาสตร์', 43, 'ป.เอก'),
-- สังคมศาสตร์และการพัฒนาท้องถิ่น (44)
(220, 'สาขาวิชาการพัฒนาชุมชน', 44, 'ป.ตรี'),
(221, 'สาขาวิชานิติศาสตร์', 44, 'ป.ตรี'),
(222, 'สาขาวิชารัฐประศาสนศาสตร์ วิชาเอกการบริหารจัดการภาครัฐ', 44, 'ป.ตรี'),
(223, 'สาขาวิชารัฐประศาสนศาสตร์ วิชาเอกการปกครองท้องถิ่น', 44, 'ป.ตรี'),
(224, 'สาขาวิชารัฐศาสตร์', 44, 'ป.ตรี'),
(225, 'สาขาวิชาสังคมสงเคราะห์ศาสตร์', 44, 'ป.ตรี'),
(226, 'รัฐประศาสนศาสตรมหาบัณฑิต สาขาวิชารัฐประศาสนศาสตร์', 44, 'ป.โท'),
(227, 'ปรัชญาดุษฎีบัณฑิต สาขาวิชารัฐประศาสนศาสตร์', 44, 'ป.เอก')
ON CONFLICT DO NOTHING;

-- Reset sequence for curriculums
SELECT setval('curriculums_id_seq', 227, true);
