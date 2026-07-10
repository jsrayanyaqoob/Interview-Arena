import api from '@/lib/api';

export const authService = {
  login: (email, password, rememberMe = false) =>
    api.post('/auth/login', { email, password, rememberMe }).then(r => r.data),

  register: (userData) =>
    api.post('/auth/register', userData).then(r => r.data),

  refreshToken: (refreshToken) =>
    api.post('/auth/refresh', { refreshToken }).then(r => r.data),

  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }).then(r => r.data),

  resetPassword: (token, password) =>
    api.post('/auth/reset-password', { token, password }).then(r => r.data),

  changePassword: (currentPassword, newPassword) =>
    api.put('/auth/change-password', { currentPassword, newPassword }).then(r => r.data),

  getProfile: () =>
    api.get('/auth/me').then(r => r.data),
};
