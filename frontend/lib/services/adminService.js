import api from '@/lib/api';

export const adminService = {
  getDashboard: () =>
    api.get('/admin/dashboard').then(r => r.data),

  getUsers: (params = {}) =>
    api.get('/admin/users', { params }).then(r => r.data),

  getUser: (id) =>
    api.get(`/admin/users/${id}`).then(r => r.data),

  updateUser: (id, data) =>
    api.put(`/admin/users/${id}`, data).then(r => r.data),

  deleteUser: (id) =>
    api.delete(`/admin/users/${id}`).then(r => r.data),

  getAnalytics: () =>
    api.get('/admin/analytics').then(r => r.data),

  getLogs: (params = {}) =>
    api.get('/admin/logs', { params }).then(r => r.data),

  sendNotification: (data) =>
    api.post('/admin/notifications', data).then(r => r.data),
};
