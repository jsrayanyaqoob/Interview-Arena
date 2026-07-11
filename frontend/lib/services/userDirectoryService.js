import api from '@/lib/api';

export const userDirectoryService = {
  getUsersByRole: (role, params = {}) =>
    api.get(`/users?role=${role}`, { params }).then(r => r.data),

  getUserById: (id) =>
    api.get(`/users/${id}`).then(r => r.data),

  deleteUser: (id) =>
    api.delete(`/admin/users/${id}`).then(r => r.data),

  updateUser: (id, data) =>
    api.put(`/admin/users/${id}`, data).then(r => r.data),
};
