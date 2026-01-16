import axios from 'axios';
import { redirectTo } from './basePath';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      redirectTo('/login');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getCurrentUser: () => api.get('/api/auth/me'),
  psruStudentLogin: (data) => api.post('/api/auth/psru/student', data),
  psruProfessorLogin: (data) => api.post('/api/auth/psru/professor', data),
};

export const facultiesAPI = {
  getAll: () => api.get('/api/faculties'),
};

export const courseBooksAPI = {
  getCurriculums: () => api.get('/api/course-books/curriculums'),
  getBooks: (params) => api.get('/api/course-books/books', { params }),
  getCourseFiles: (courseId) => api.get(`/api/course-books/files/${courseId}`),
};

export const studentAPI = {
  // Browse all courses
  getAllCourses: (params) => api.get('/api/student/courses', { params }),
  // Get faculties for filter
  getFaculties: () => api.get('/api/student/faculties'),
  // Get curriculums for filter
  getCurriculums: (params) => api.get('/api/student/curriculums', { params }),
  // Get student's selected courses
  getMyCourses: () => api.get('/api/student/my-courses'),
  // Add course to student's list
  addCourse: (courseId) => api.post(`/api/student/my-courses/${courseId}`),
  // Remove course from student's list
  removeCourse: (courseId) => api.delete(`/api/student/my-courses/${courseId}`),
  // Get course detail with books
  getCourseDetail: (courseId) => api.get(`/api/student/courses/${courseId}`),
};

export default api;
