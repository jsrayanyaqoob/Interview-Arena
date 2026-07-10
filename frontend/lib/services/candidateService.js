import api from '@/lib/api';

export const candidateService = {
  getDashboard: () =>
    api.get('/candidate/dashboard').then(r => r.data),

  getProfile: () =>
    api.get('/candidate/profile').then(r => r.data),

  updateProfile: (data) =>
    api.put('/candidate/profile', data).then(r => r.data),

  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return api.post('/candidate/profile/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/candidate/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  addSkill: (name, level) =>
    api.post('/candidate/profile/skills', { name, level }).then(r => r.data),

  deleteSkill: (id) =>
    api.delete(`/candidate/profile/skills/${id}`).then(r => r.data),

  addCertification: (data) =>
    api.post('/candidate/profile/certifications', data).then(r => r.data),

  addExperience: (data) =>
    api.post('/candidate/profile/experience', data).then(r => r.data),

  getPerformance: () =>
    api.get('/candidate/performance').then(r => r.data),

  getNotifications: (page = 1, limit = 20) =>
    api.get(`/candidate/notifications?page=${page}&limit=${limit}`).then(r => r.data),

  markNotificationRead: (id) =>
    api.put(`/candidate/notifications/${id}/read`).then(r => r.data),

  markAllNotificationsRead: () =>
    api.put('/candidate/notifications/read-all').then(r => r.data),
};
