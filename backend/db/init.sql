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
