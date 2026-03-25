import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  getMe:    ()     => api.get('/auth/me'),
  update:   (data) => api.put('/auth/profile', data),
};

export const transactionsAPI = {
  getAll:    (params) => api.get('/transactions', { params }),
  create:    (data)   => api.post('/transactions', data),
  update:    (id, data) => api.put(`/transactions/${id}`, data),
  remove:    (id)     => api.delete(`/transactions/${id}`),
  exportCSV: ()       => api.get('/transactions/export/csv', { responseType: 'blob' }),
};

export const budgetsAPI = {
  getAll: ()         => api.get('/budgets'),
  create: (data)     => api.post('/budgets', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  remove: (id)       => api.delete(`/budgets/${id}`),
};

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
};

export const analyticsAPI = {
  summary:    (params) => api.get('/analytics/summary', { params }),
  byCategory: (params) => api.get('/analytics/by-category', { params }),
  monthly:    (params) => api.get('/analytics/monthly', { params }),
};

export default api;