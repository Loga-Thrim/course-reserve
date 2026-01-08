-- Database initialization script for Course Reserve System
-- This script will be run automatically when the database container starts

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'student',
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
    code_th VARCHAR(50),
    code_en VARCHAR(50),
    name_th VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    credits INTEGER,
    description TEXT,
    curriculum_th VARCHAR(255),
    curriculum_en VARCHAR(255),
    faculty_id INTEGER REFERENCES faculties(id),
    curriculum_id INTEGER REFERENCES curriculums(id),
    professor_id VARCHAR(100),
    professor_name VARCHAR(255),
    semester VARCHAR(20),
    academic_year VARCHAR(20),
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
    title VARCHAR(500) NOT NULL,
    author VARCHAR(500),
    publisher VARCHAR(500),
    callnumber VARCHAR(100),
    isbn VARCHAR(50),
    bookcover TEXT,
    admin_recommended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student courses table
CREATE TABLE IF NOT EXISTS student_courses (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(100) NOT NULL,
    student_name VARCHAR(255),
    course_id INTEGER REFERENCES professor_courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    user_type VARCHAR(20) NOT NULL,
    user_name VARCHAR(255),
    user_email VARCHAR(255),
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
CREATE INDEX IF NOT EXISTS idx_student_courses_student_id ON student_courses(student_id);
CREATE INDEX IF NOT EXISTS idx_student_courses_course_id ON student_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_type ON activity_logs(user_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource_type ON activity_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at_desc ON activity_logs(created_at DESC);
