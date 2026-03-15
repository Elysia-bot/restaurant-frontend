import axios from 'axios'

const api = axios.create({ 
  baseURL: 'https://restaurant-backend-production-7837.up.railway.app/api' 
})

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('adminToken')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export const authAPI = {
  login: (data) => api.post('/auth/login', data)
}

export const tableAPI = {
  scan: (qr) => api.get(`/tables/scan?qr=${qr}`),
  getAll: () => api.get('/tables'),
  free: (id) => api.put(`/tables/${id}/free`)
}

export const categoryAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`)
}

export const menuAPI = {
  getAll: (params) => api.get('/menu-items', { params }),
  getById: (id) => api.get(`/menu-items/${id}`),
  create: (data) => api.post('/menu-items', data),
  update: (id, data) => api.put(`/menu-items/${id}`, data),
  delete: (id) => api.delete(`/menu-items/${id}`),
  toggle: (id) => api.patch(`/menu-items/${id}/toggle-availability`)
}

export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getByTable: (tableId) => api.get(`/orders/table/${tableId}`),
  cancel: (id) => api.delete(`/orders/${id}`),
  getAll: (status) => api.get('/orders', { params: status ? { status } : {} }),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status })
}

export const feedbackAPI = {
  create: (data) => api.post('/feedback', data),
  getAll: () => api.get('/feedback'),
  getAvg: () => api.get('/feedback/average-rating')
}

export const supportAPI = {
  create: (data) => api.post('/support-messages', data),
  getAll: () => api.get('/support-messages'),
  markRead: (id) => api.put(`/support-messages/${id}/read`),
  unreadCount: () => api.get('/support-messages/unread-count')
}

export const statsAPI = {
  getRevenue: (params) => api.get('/stats/revenue', { params }),
  getTopItems: () => api.get('/stats/top-items')
}

export default api
