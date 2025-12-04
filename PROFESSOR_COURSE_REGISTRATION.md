# Professor Course Registration Feature

## Overview
Removed the course reserves feature and replaced it with a comprehensive course registration system for professors.

## Changes Made

### Backend

#### New Database Table: `professor_courses`
Created a new table to store courses registered by professors with the following fields:
- `id` - Auto-increment primary key
- `professor_id` - Foreign key to users table
- `name_th` - Course name in Thai (required)
- `name_en` - Course name in English (required)
- `code_th` - Course code in Thai (required)
- `code_en` - Course code in English (required)
- `curriculum_th` - Curriculum in Thai (required)
- `curriculum_en` - Curriculum in English (required)
- `description_th` - Course description in Thai (required)
- `description_en` - Course description in English (required)
- `website` - Optional website URL
- `created_at` - Timestamp
- `updated_at` - Timestamp

#### New Controller
**File:** `/backend/src/controllers/professor/courseRegistrationController.js`

Endpoints:
- `GET /api/professor/course-registration` - Get all courses by logged-in professor
- `POST /api/professor/course-registration` - Create new course
- `PUT /api/professor/course-registration/:id` - Update course
- `DELETE /api/professor/course-registration/:id` - Delete course

#### Updated Routes
**File:** `/backend/src/routes/professor.js`
- Replaced course reserves routes with course registration routes

#### Files Removed
- `courseReservesController.js`
- `coursesController.js`

### Frontend

#### New Page
**File:** `/frontend/src/app/professor/course-registration/page.js`

Features:
- Display all registered courses in card layout
- Create/Edit course modal with bilingual form fields
- Delete course functionality
- Responsive design with the new professor theme

#### Updated Components
**File:** `/frontend/src/components/professor/ProfessorSidebar.js`
- Changed menu from "สำรองหนังสือตามรายวิชา" to "ลงทะเบียนรายวิชา"

**File:** `/frontend/src/app/professor/dashboard/page.js`
- Updated to show "รายวิชาที่ลงทะเบียน" stats
- Removed course reserves stats
- Updated quick actions

#### Updated API
**File:** `/frontend/src/lib/professorApi.js`
- Replaced `professorCourseReservesAPI` with `professorCourseRegistrationAPI`
- New endpoints for CRUD operations on course registration

#### Files Removed
- `/frontend/src/app/professor/course-reserves/page.js` (directory removed)

## How to Use

### 1. Run Database Migration
```bash
cd backend
node db/createProfessorCoursesTable.js
```

### 2. Access the Feature
1. Login as a professor at: `http://localhost:3000/professor/login`
2. Navigate to "ลงทะเบียนรายวิชา" from the sidebar
3. Click "เพิ่มรายวิชา" to add a new course

### 3. Form Fields
When adding/editing a course, fill in:
- **ชื่อวิชา (ไทย)** - Thai course name ✱
- **ชื่อวิชา (อังกฤษ)** - English course name ✱
- **รหัสวิชา (ไทย)** - Thai course code ✱
- **รหัสวิชา (อังกฤษ)** - English course code ✱
- **หลักสูตร (ไทย)** - Thai curriculum ✱
- **หลักสูตร (อังกฤษ)** - English curriculum ✱
- **คำอธิบายรายวิชา (ไทย)** - Thai description ✱
- **คำอธิบายรายวิชา (อังกฤษ)** - English description ✱
- **เว็บไซต์สำหรับศึกษาเพิ่มเติม** - Optional website URL

✱ = Required field

## API Examples

### Create Course
```javascript
POST /api/professor/course-registration
{
  "name_th": "การเขียนโปรแกรมคอมพิวเตอร์",
  "name_en": "Computer Programming",
  "code_th": "วท102",
  "code_en": "CS102",
  "curriculum_th": "วิทยาศาสตร์คอมพิวเตอร์",
  "curriculum_en": "Computer Science",
  "description_th": "รายวิชาพื้นฐานการเขียนโปรแกรม",
  "description_en": "Basic programming course",
  "website": "https://example.com/cs102"
}
```

### Get All Courses
```javascript
GET /api/professor/course-registration
```

### Update Course
```javascript
PUT /api/professor/course-registration/:id
// Same body as create
```

### Delete Course
```javascript
DELETE /api/professor/course-registration/:id
```

## Security
- All endpoints require professor authentication
- Professors can only view, edit, and delete their own courses
- SQL injection protection via parameterized queries
