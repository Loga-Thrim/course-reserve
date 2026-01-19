import axios from 'axios';
import { redirectTo } from './basePath';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const professorApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

professorApi.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('professorToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

professorApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if we're in browser and it's not during initial load
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      // Check if token exists - if not, it's likely a timing issue during hydration
      const token = localStorage.getItem('professorToken');
      if (token) {
        // Token exists but got 401 - token is invalid, clear and redirect
        localStorage.removeItem('professorToken');
        localStorage.removeItem('professorUser');
        redirectTo('/professor/login');
      }
    }
    return Promise.reject(error);
  }
);

export const professorAuthAPI = {
  psruLogin: (data) => axios.post(`${API_URL}/api/auth/psru/professor`, data),
  selfLogin: (data) => axios.post(`${API_URL}/api/auth/login`, data),
};

export const professorDashboardAPI = {
  getStats: () => professorApi.get('/api/professor/dashboard/stats'),
};

export const professorCourseRegistrationAPI = {
  getAll: () => professorApi.get('/api/professor/course-registration'),
  getFaculties: () => professorApi.get('/api/professor/course-registration/faculties'),
  getCurriculums: (facultyId) => professorApi.get('/api/professor/course-registration/curriculums', { params: { faculty_id: facultyId } }),
  create: (data) => professorApi.post('/api/professor/course-registration', data),
  update: (id, data) => professorApi.put(`/api/professor/course-registration/${id}`, data),
  delete: (id) => professorApi.delete(`/api/professor/course-registration/${id}`),
  getFiles: (courseId) => professorApi.get(`/api/professor/course-registration/${courseId}/files`),
  uploadFile: (courseId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return professorApi.post(`/api/professor/course-registration/${courseId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteFile: (courseId, fileId) => professorApi.delete(`/api/professor/course-registration/${courseId}/files/${fileId}`),
};

export const professorCourseBooksAPI = {
  getMyCourses: () => professorApi.get('/api/professor/course-books/my-courses'),
  searchBooks: (keyword) => professorApi.get(`/api/professor/course-books/search?keyword=${encodeURIComponent(keyword)}`),
  getBookSuggestions: (courseId) => professorApi.get(`/api/professor/course-books/${courseId}/suggestions`),
  refreshBookSuggestions: (courseId) => professorApi.post(`/api/professor/course-books/${courseId}/refresh`),
  getCourseBooks: (courseId) => professorApi.get(`/api/professor/course-books/${courseId}`),
  addBookToCourse: (courseId, bookData) => professorApi.post(`/api/professor/course-books/${courseId}`, bookData),
  removeBookFromCourse: (courseId, bookId) => professorApi.delete(`/api/professor/course-books/${courseId}/${bookId}`),
  lineBorrow: (data) => professorApi.post('/api/professor/line-borrow', data),
  getLineBorrowStatus: (studentId) => professorApi.get(`/api/professor/line-borrow/${studentId}`),
};

export default professorApi;
