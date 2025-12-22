import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
      window.location.href = '/login';
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

export default api;
