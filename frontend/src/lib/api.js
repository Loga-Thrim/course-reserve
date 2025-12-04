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
};

export const booksAPI = {
  getAll: (params) => api.get('/api/books', { params }),
  getById: (id) => api.get(`/api/books/${id}`),
};

export const categoriesAPI = {
  getAll: () => api.get('/api/categories'),
};

export const facultiesAPI = {
  getAll: () => api.get('/api/faculties'),
};
export const borrowsAPI = {
  borrow: (bookId) => api.post('/api/borrows', { bookId }),
  getUserBorrows: (params) => api.get('/api/borrows', { params }),
  returnBook: (id) => api.put(`/api/borrows/${id}/return`),
};

export const recommendationsAPI = {
  get: (params) => api.get('/api/recommendations', { params }),
};

export default api;
