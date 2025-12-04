# Changes Summary

## Overview
This document summarizes the changes made to rename the CMS route to Admin and add a new Professor role.

## Changes Made

### 1. Frontend Route Changes (/cms → /admin)

#### Directory Structure
- Renamed `/frontend/src/app/cms` → `/frontend/src/app/admin`
- Renamed `/frontend/src/components/cms` → `/frontend/src/components/admin`

#### Component Changes
- `CMSSidebar.js` → `AdminSidebar.js`
  - Updated function name: `CMSSidebar` → `AdminSidebar`
  - Updated all route hrefs from `/cms/*` to `/admin/*`
  - Changed title from "CMS Admin" to "Admin Panel"

- `CMSLayout.js` → `AdminLayout.js`
  - Updated function name: `CMSLayout` → `AdminLayout`
  - Updated all route references from `/cms/*` to `/admin/*`
  - Updated imports to use `AdminSidebar`

#### Page Updates
Updated all admin pages to use `AdminLayout`:
- `/admin/books/page.js`
- `/admin/course-reserves/page.js`
- `/admin/courses/page.js`
- `/admin/curriculums/page.js`
- `/admin/dashboard/page.js`
- `/admin/faculties/page.js`
- `/admin/login/page.js`
- `/admin/users/page.js`

#### API Changes
- Updated `adminApi.js` to redirect to `/admin/login` instead of `/cms/login`

### 2. Backend Changes - Professor Role

#### New Middleware
- Created `/backend/src/middleware/professorAuth.js`
  - Validates JWT tokens
  - Ensures user has 'professor' role

#### New Controllers
- `/backend/src/controllers/professor/coursesController.js`
  - View all courses
  - View individual course details

- `/backend/src/controllers/professor/courseReservesController.js`
  - View course reserves
  - Create course reserves
  - Delete course reserves

#### New Routes
- Created `/backend/src/routes/professor.js`
  - GET `/api/professor/courses` - Get all courses
  - GET `/api/professor/courses/:id` - Get single course
  - GET `/api/professor/course-reserves` - Get all reserves
  - POST `/api/professor/course-reserves` - Create reserve
  - DELETE `/api/professor/course-reserves/:id` - Delete reserve

#### Server Updates
- Updated `/backend/src/server.js` to include professor routes

#### Database Migration
- Created `/backend/db/addProfessorRole.js`
  - Adds support for 'professor' role
  - Instructions for creating professor accounts

### 3. Frontend - Professor Portal

#### Components
- Created `/frontend/src/components/professor/ProfessorSidebar.js`
  - Navigation for professor portal
  - Links to dashboard and course reserves

- Created `/frontend/src/components/professor/ProfessorLayout.js`
  - Layout wrapper for professor pages
  - Authentication check for professor role

#### API Library
- Created `/frontend/src/lib/professorApi.js`
  - API client with professor token handling
  - Endpoints for courses and course reserves

#### Pages
- `/frontend/src/app/professor/login/page.js`
  - Login page for professors
  - Validates professor role

- `/frontend/src/app/professor/dashboard/page.js`
  - Dashboard showing stats
  - Quick actions

- `/frontend/src/app/professor/course-reserves/page.js`
  - Manage course book reserves
  - Add/remove books for courses

## Role Structure

The system now supports three roles:

1. **user** (Student)
   - Access: `/` (root) - Student portal
   - Can browse and borrow books
   - View recommendations

2. **professor**
   - Access: `/professor` - Professor portal
   - Can view courses
   - Can manage course book reserves
   - Cannot modify users or system settings

3. **admin**
   - Access: `/admin` - Admin panel (previously `/cms`)
   - Full system access
   - Manage users, books, courses, etc.

## How to Use

### Running Database Migration
```bash
cd backend
node db/addProfessorRole.js
```

### Creating a Professor Account
1. Register a user account normally
2. Update the user's role in the database:
```sql
UPDATE users SET role = 'professor' WHERE email = 'professor@example.com';
```

### Accessing Different Portals
- Students: `http://localhost:3000/`
- Professors: `http://localhost:3000/professor/login`
- Admins: `http://localhost:3000/admin/login`

## API Endpoints Summary

### Admin Routes (requires admin role)
- `/api/admin/*` - All admin operations

### Professor Routes (requires professor role)
- `/api/professor/courses` - Course management
- `/api/professor/course-reserves` - Reserve management

### Public/User Routes (requires user authentication)
- `/api/books` - Book browsing
- `/api/borrows` - Borrowing operations
- `/api/recommendations` - Book recommendations
