import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const adminApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
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

// Handle response errors
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Admin Auth APIs
export const adminAuthAPI = {
  login: (data) => axios.post(`${API_URL}/api/auth/login`, data),
};

// Admin Users APIs
export const adminUsersAPI = {
  getAll: (params) => adminApi.get('/api/admin/users', { params }),
  create: (data) => adminApi.post('/api/admin/users', data),
  update: (id, data) => adminApi.put(`/api/admin/users/${id}`, data),
  delete: (id) => adminApi.delete(`/api/admin/users/${id}`),
};

// Admin Faculties APIs
export const adminFacultiesAPI = {
  getAll: () => adminApi.get('/api/admin/faculties'),
  create: (data) => adminApi.post('/api/admin/faculties', data),
  update: (id, data) => adminApi.put(`/api/admin/faculties/${id}`, data),
  delete: (id) => adminApi.delete(`/api/admin/faculties/${id}`),
};

// Admin Curriculums APIs
export const adminCurriculumsAPI = {
  getAll: (params) => adminApi.get('/api/admin/curriculums', { params }),
  create: (data) => adminApi.post('/api/admin/curriculums', data),
  update: (id, data) => adminApi.put(`/api/admin/curriculums/${id}`, data),
  delete: (id) => adminApi.delete(`/api/admin/curriculums/${id}`),
};

// Admin Courses APIs
export const adminCoursesAPI = {
  getAll: (params) => adminApi.get('/api/admin/courses', { params }),
  create: (data) => adminApi.post('/api/admin/courses', data),
  update: (id, data) => adminApi.put(`/api/admin/courses/${id}`, data),
  delete: (id) => adminApi.delete(`/api/admin/courses/${id}`),
};

// Admin Course Reserves APIs
export const adminCourseReservesAPI = {
  getAll: (params) => adminApi.get('/api/admin/course-reserves', { params }),
  create: (data) => adminApi.post('/api/admin/course-reserves', data),
  delete: (id) => adminApi.delete(`/api/admin/course-reserves/${id}`),
};

// Admin Books APIs
export const adminBooksAPI = {
  getAll: (params) => adminApi.get('/api/admin/books', { params }),
  create: (data) => adminApi.post('/api/admin/books', data),
  update: (id, data) => adminApi.put(`/api/admin/books/${id}`, data),
  delete: (id) => adminApi.delete(`/api/admin/books/${id}`),
};

// Admin Categories API (reuse existing)
export const adminCategoriesAPI = {
  getAll: () => adminApi.get('/api/categories'),
};

export default adminApi;
