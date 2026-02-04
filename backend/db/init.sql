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
    code VARCHAR(10),
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
    book_id VARCHAR(50),
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
    book_id VARCHAR(50),
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
    book_id VARCHAR(50),
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, book_id)
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
(44, 'สังคมศาสตร์และการพัฒนาท้องถิ่น'),
(45, 'กองบริการการศึกษา')
ON CONFLICT DO NOTHING;

-- Reset sequence for faculties
SELECT setval('faculties_id_seq', 45, true);

-- Insert curriculums (หลักสูตร/สาขา) ตามข้อมูลรับสมัคร
INSERT INTO curriculums (id, code, name, faculty_id, level) VALUES
-- คณะครุศาสตร์ (37) - 11 สาขา
(1, '1201', 'สาขาวิชาการศึกษา วิชาเอกการประถมศึกษา', 37, 'ป.ตรี'),
(2, '1202', 'สาขาวิชาการศึกษา วิชาเอกการศึกษาปฐมวัย', 37, 'ป.ตรี'),
(3, '1203', 'สาขาวิชาการศึกษา วิชาเอกการศึกษาพิเศษ', 37, 'ป.ตรี'),
(4, '1204', 'สาขาวิชาการศึกษา วิชาเอกคณิตศาสตร์', 37, 'ป.ตรี'),
(5, '1205', 'สาขาวิชาการศึกษา วิชาเอกจิตวิทยาและการแนะแนว', 37, 'ป.ตรี'),
(6, '1206', 'สาขาวิชาการศึกษา วิชาเอกดนตรีและนาฏศิลป์ศึกษา', 37, 'ป.ตรี'),
(7, '1207', 'สาขาวิชาการศึกษา วิชาเอกพลศึกษา', 37, 'ป.ตรี'),
(8, '1208', 'สาขาวิชาการศึกษา วิชาเอกภาษาไทย', 37, 'ป.ตรี'),
(9, '1209', 'สาขาวิชาการศึกษา วิชาเอกภาษาอังกฤษ', 37, 'ป.ตรี'),
(10, '1210', 'สาขาวิชาการศึกษา วิชาเอกวิทยาศาสตร์ทั่วไป', 37, 'ป.ตรี'),
(11, '1211', 'สาขาวิชาการศึกษา วิชาเอกสังคมศึกษา', 37, 'ป.ตรี'),
-- คณะเทคโนโลยีการเกษตรและอาหาร (38) - 7 สาขา
(12, '2201', 'สาขาวิชาเกษตรศาสตร์ วิชาเอกการจัดการทรัพยากรเกษตรและสิ่งแวดล้อม', 38, 'ป.ตรี'),
(13, '2202', 'สาขาวิชาเกษตรศาสตร์ วิชาเอกพืชศาสตร์', 38, 'ป.ตรี'),
(14, '2203', 'สาขาวิชานวัตกรรมและเทคโนโลยีเพิ่มมูลค่าผลพลอยได้ทางการเกษตร', 38, 'ป.ตรี'),
(15, '2204', 'สาขาวิชาพัฒนาผลิตภัณฑ์เพื่อสุขภาพและเครื่องสำอาง', 38, 'ป.ตรี'),
(16, '2205', 'สาขาวิชาวิทยาศาสตร์และเทคโนโลยีการอาหาร', 38, 'ป.ตรี'),
(17, '2206', 'สาขาวิชาสัตวศาสตร์และการเพาะเลี้ยงสัตว์น้ำ วิชาเอกการเพาะเลี้ยงสัตว์น้ำ', 38, 'ป.ตรี'),
(18, '2207', 'สาขาวิชาสัตวศาสตร์และการเพาะเลี้ยงสัตว์น้ำ วิชาเอกสัตวศาสตร์', 38, 'ป.ตรี'),
-- คณะเทคโนโลยีอุตสาหกรรม (39) - 17 สาขา
(19, '3101', 'สาขาวิชาเทคโนโลยีอุตสาหกรรม วิชาเอกเทคโนโลยีวิศวกรรมการจัดการและโลจิสติกส์ (ต่อเนื่อง)', 39, 'ป.ตรี'),
(20, '3102', 'สาขาวิชาเทคโนโลยีอุตสาหกรรม วิชาเอกเทคโนโลยีวิศวกรรมไฟฟ้ากำลัง (ต่อเนื่อง)', 39, 'ป.ตรี'),
(21, '3203', 'สาขาวิชาวิศวกรรมการผลิต', 39, 'ป.ตรี'),
(22, '3204', 'สาขาวิชาวิศวกรรมคอมพิวเตอร์', 39, 'ป.ตรี'),
(23, '3205', 'สาขาวิชาวิศวกรรมเครื่องกล', 39, 'ป.ตรี'),
(24, '3206', 'สาขาวิชาวิศวกรรมไฟฟ้าสื่อสารและอิเล็กทรอนิกส์', 39, 'ป.ตรี'),
(25, '3207', 'สาขาวิชาวิศวกรรมโยธา', 39, 'ป.ตรี'),
(26, '3208', 'สาขาวิชาวิศวกรรมโลจิสติกส์', 39, 'ป.ตรี'),
(27, '3209', 'สาขาวิชาศิลปะและการออกแบบ วิชาเอกเครื่องปั้นดินเผา', 39, 'ป.ตรี'),
(28, '3210', 'สาขาวิชาศิลปะและการออกแบบ วิชาเอกออกแบบผลิตภัณฑ์', 39, 'ป.ตรี'),
(29, '3303', 'สาขาวิชาวิศวกรรมการผลิต (เทียบโอน)', 39, 'ป.ตรี'),
(30, '3304', 'สาขาวิชาวิศวกรรมคอมพิวเตอร์ (เทียบโอน)', 39, 'ป.ตรี'),
(31, '3305', 'สาขาวิชาวิศวกรรมเครื่องกล (เทียบโอน)', 39, 'ป.ตรี'),
(32, '3306', 'สาขาวิชาวิศวกรรมไฟฟ้าสื่อสารและอิเล็กทรอนิกส์ (เทียบโอน)', 39, 'ป.ตรี'),
(33, '3307', 'สาขาวิชาวิศวกรรมโยธา (เทียบโอน)', 39, 'ป.ตรี'),
(34, '3312', 'สาขาวิชาศิลปะและการออกแบบ (เทียบโอน)', 39, 'ป.ตรี'),
(35, '3411', 'สาขาวิชาสถาปัตยกรรม', 39, 'ป.ตรี'),
-- คณะพยาบาลศาสตร์ (40) - 1 สาขา
(36, '4201', 'พยาบาลศาสตรบัณฑิต', 40, 'ป.ตรี'),
-- คณะมนุษยศาสตร์และสังคมศาสตร์ (41) - 8 สาขา
(37, '5201', 'สาขาวิชาดนตรี', 41, 'ป.ตรี'),
(38, '5202', 'สาขาวิชาภาษาจีน', 41, 'ป.ตรี'),
(39, '5203', 'สาขาวิชาภาษาจีนธุรกิจ', 41, 'ป.ตรี'),
(40, '5204', 'สาขาวิชาภาษาญี่ปุ่น', 41, 'ป.ตรี'),
(41, '5205', 'สาขาวิชาภาษาไทย', 41, 'ป.ตรี'),
(42, '5206', 'สาขาวิชาภาษาอังกฤษ', 41, 'ป.ตรี'),
(43, '5207', 'สาขาวิชาภาษาอังกฤษธุรกิจ', 41, 'ป.ตรี'),
(44, '5208', 'สาขาวิชาสารสนเทศศาสตร์', 41, 'ป.ตรี'),
-- คณะวิทยาการจัดการ (42) - 16 สาขา
(45, '6201', 'สาขาวิชาการจัดการ', 42, 'ป.ตรี'),
(46, '6202', 'สาขาวิชาการจัดการการท่องเที่ยวระหว่างประเทศ', 42, 'ป.ตรี'),
(47, '6203', 'สาขาวิชาการจัดการทรัพยากรมนุษย์และองค์การ', 42, 'ป.ตรี'),
(48, '6204', 'สาขาวิชาการตลาดเชิงสร้างสรรค์และดิจิทัล', 42, 'ป.ตรี'),
(49, '6205', 'สาขาวิชาการท่องเที่ยวและบริการยุคดิจิทัล', 42, 'ป.ตรี'),
(50, '6206', 'บัญชีบัณฑิต', 42, 'ป.ตรี'),
(51, '6207', 'สาขาวิชาธุรกิจการค้าสมัยใหม่', 42, 'ป.ตรี'),
(52, '6208', 'สาขาวิชาเทคโนโลยีธุรกิจดิจิทัล', 42, 'ป.ตรี'),
(53, '6209', 'สาขาวิชานิเทศศาสตร์', 42, 'ป.ตรี'),
(54, '6210', 'สาขาวิชาเศรษฐศาสตร์ธุรกิจและภาครัฐ', 42, 'ป.ตรี'),
(55, '6301', 'สาขาวิชาการจัดการ (เทียบโอน)', 42, 'ป.ตรี'),
(56, '6302', 'สาขาวิชาการจัดการการท่องเที่ยวระหว่างประเทศ (เทียบโอน)', 42, 'ป.ตรี'),
(57, '6303', 'สาขาวิชาการจัดการทรัพยากรมนุษย์และองค์การ (เทียบโอน)', 42, 'ป.ตรี'),
(58, '6304', 'สาขาวิชาการตลาดเชิงสร้างสรรค์และดิจิทัล (เทียบโอน)', 42, 'ป.ตรี'),
(59, '6306', 'บัญชีบัณฑิต (เทียบโอน)', 42, 'ป.ตรี'),
(60, '6308', 'สาขาวิชาเทคโนโลยีธุรกิจดิจิทัล (เทียบโอน)', 42, 'ป.ตรี'),
-- คณะวิทยาศาสตร์และเทคโนโลยี (43) - 11 สาขา
(61, '7201', 'สาขาวิชาคณิตศาสตร์', 43, 'ป.ตรี'),
(62, '7202', 'สาขาวิชาคหกรรมศาสตร์', 43, 'ป.ตรี'),
(63, '7203', 'สาขาวิชาเคมี', 43, 'ป.ตรี'),
(64, '7204', 'สาขาวิชาจุลชีววิทยา', 43, 'ป.ตรี'),
(65, '7205', 'สาขาวิชาชีววิทยา', 43, 'ป.ตรี'),
(66, '7206', 'สาขาวิชาเทคโนโลยีสารสนเทศ', 43, 'ป.ตรี'),
(67, '7207', 'สาขาวิชาฟิสิกส์', 43, 'ป.ตรี'),
(68, '7208', 'สาขาวิชาวิทยาการคอมพิวเตอร์', 43, 'ป.ตรี'),
(69, '7209', 'สาขาวิชาวิทยาศาสตร์สิ่งแวดล้อม', 43, 'ป.ตรี'),
(70, '7210', 'สาขาวิชาสาธารณสุขศาสตร์', 43, 'ป.ตรี'),
(71, '7306', 'สาขาวิชาเทคโนโลยีสารสนเทศ (เทียบโอน)', 43, 'ป.ตรี'),
-- คณะสังคมศาสตร์และการพัฒนาท้องถิ่น (44) - 6 สาขา
(72, '8201', 'สาขาวิชาการพัฒนาชุมชน', 44, 'ป.ตรี'),
(73, '8202', 'สาขาวิชานิติศาสตร์', 44, 'ป.ตรี'),
(74, '8203', 'สาขาวิชารัฐประศาสนศาสตร์ วิชาเอกการบริหารจัดการภาครัฐ', 44, 'ป.ตรี'),
(75, '8204', 'สาขาวิชารัฐประศาสนศาสตร์ วิชาเอกการปกครองท้องถิ่น', 44, 'ป.ตรี'),
(76, '8205', 'สาขาวิชารัฐศาสตร์', 44, 'ป.ตรี'),
(77, '8206', 'สาขาวิชาสังคมสงเคราะห์ศาสตร์', 44, 'ป.ตรี'),
-- กองบริการการศึกษา (45) - 1 หลักสูตร
(78, '9001', 'รายวิชาศึกษาทั่วไป', 45, NULL)
ON CONFLICT DO NOTHING;

-- Reset sequence for curriculums
SELECT setval('curriculums_id_seq', 78, true);
