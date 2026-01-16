import axios from 'axios';
import { redirectTo } from './basePath';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const adminApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      redirectTo('/admin/login');
    }
    return Promise.reject(error);
  }
);

export const adminAuthAPI = {
  login: (data) => axios.post(`${API_URL}/api/auth/login`, data),
};

export const adminUsersAPI = {
  getAll: (params) => adminApi.get('/api/admin/users', { params }),
  create: (data) => adminApi.post('/api/admin/users', data),
  update: (id, data) => adminApi.put(`/api/admin/users/${id}`, data),
  delete: (id) => adminApi.delete(`/api/admin/users/${id}`),
};

export const adminFacultiesAPI = {
  getAll: () => adminApi.get('/api/admin/faculties'),
  create: (data) => adminApi.post('/api/admin/faculties', data),
  update: (id, data) => adminApi.put(`/api/admin/faculties/${id}`, data),
  delete: (id) => adminApi.delete(`/api/admin/faculties/${id}`),
};

export const adminCurriculumsAPI = {
  getAll: (params) => adminApi.get('/api/admin/curriculums', { params }),
  create: (data) => adminApi.post('/api/admin/curriculums', data),
  update: (id, data) => adminApi.put(`/api/admin/curriculums/${id}`, data),
  delete: (id) => adminApi.delete(`/api/admin/curriculums/${id}`),
};

export const adminCourseBooksAPI = {
  getAllCourses: (params) => adminApi.get('/api/admin/course-books/courses', { params }),
  searchBooks: (keyword) => adminApi.get('/api/admin/course-books/search', { params: { keyword } }),
  getRecommendedBooks: (courseId) => adminApi.get(`/api/admin/course-books/${courseId}`),
  addRecommendedBook: (courseId, data) => adminApi.post(`/api/admin/course-books/${courseId}`, data),
  removeRecommendedBook: (courseId, bookId) => adminApi.delete(`/api/admin/course-books/${courseId}/${bookId}`),
};

export const adminReportsAPI = {
  getOverview: () => adminApi.get('/api/admin/reports/overview'),
  getByFaculty: () => adminApi.get('/api/admin/reports/faculty'),
  getByCurriculum: (params) => adminApi.get('/api/admin/reports/curriculum', { params }),
  getCourses: (params) => adminApi.get('/api/admin/reports/courses', { params }),
  getBooks: (params) => adminApi.get('/api/admin/reports/books', { params }),
  getExportData: (type) => adminApi.get('/api/admin/reports/export', { params: { type } }),
};

export const adminActivityLogsAPI = {
  getLogs: (params) => adminApi.get('/api/admin/activity-logs', { params }),
  getStats: (params) => adminApi.get('/api/admin/activity-logs/stats', { params }),
  getFilterOptions: () => adminApi.get('/api/admin/activity-logs/filters'),
  exportLogs: (params) => adminApi.get('/api/admin/activity-logs/export', { params }),
  getStudentReport: () => adminApi.get('/api/admin/activity-logs/student-report'),
  getProfessorReport: () => adminApi.get('/api/admin/activity-logs/professor-report'),
};

export const adminStudentReportsAPI = {
  getOverview: () => adminApi.get('/api/admin/student-reports/overview'),
  getEnrollments: (params) => adminApi.get('/api/admin/student-reports/enrollments', { params }),
  getPopularCourses: (params) => adminApi.get('/api/admin/student-reports/popular-courses', { params }),
  getActiveStudents: (params) => adminApi.get('/api/admin/student-reports/active-students', { params }),
  getByFaculty: () => adminApi.get('/api/admin/student-reports/by-faculty'),
  getCoursesWithoutStudents: () => adminApi.get('/api/admin/student-reports/courses-without-students'),
  exportEnrollments: () => adminApi.get('/api/admin/student-reports/export'),
};

export default adminApi;
