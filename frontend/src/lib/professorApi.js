import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const professorApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
professorApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('professorToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
professorApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('professorToken');
      localStorage.removeItem('professorUser');
      window.location.href = '/professor/login';
    }
    return Promise.reject(error);
  }
);

// Professor Auth APIs
export const professorAuthAPI = {
  login: (data) => axios.post(`${API_URL}/api/auth/login`, data),
};

// Professor Course Registration APIs
export const professorCourseRegistrationAPI = {
  getAll: () => professorApi.get('/api/professor/course-registration'),
  getFaculties: () => professorApi.get('/api/professor/course-registration/faculties'),
  getCurriculums: (facultyId) => professorApi.get('/api/professor/course-registration/curriculums', { params: { faculty_id: facultyId } }),
  create: (data) => professorApi.post('/api/professor/course-registration', data),
  update: (id, data) => professorApi.put(`/api/professor/course-registration/${id}`, data),
  delete: (id) => professorApi.delete(`/api/professor/course-registration/${id}`),
  // File operations
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

// Professor Course Books APIs
export const professorCourseBooksAPI = {
  getMyCourses: () => professorApi.get('/api/professor/course-books/my-courses'),
  searchBooks: (keyword) => professorApi.get(`/api/professor/course-books/search?keyword=${encodeURIComponent(keyword)}`),
  getBookSuggestions: (courseId) => professorApi.get(`/api/professor/course-books/${courseId}/suggestions`),
  refreshBookSuggestions: (courseId) => professorApi.post(`/api/professor/course-books/${courseId}/refresh`),
  getCourseBooks: (courseId) => professorApi.get(`/api/professor/course-books/${courseId}`),
  addBookToCourse: (courseId, bookData) => professorApi.post(`/api/professor/course-books/${courseId}`, bookData),
  removeBookFromCourse: (courseId, bookId) => professorApi.delete(`/api/professor/course-books/${courseId}/${bookId}`),
};

export default professorApi;
