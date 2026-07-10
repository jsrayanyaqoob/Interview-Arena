import api from '@/lib/api';

export const recruiterService = {
  getDashboard: () =>
    api.get('/recruiter/dashboard').then(r => r.data),

  getCandidates: (params = {}) =>
    api.get('/recruiter/candidates', { params }).then(r => r.data),

  getTemplates: (params = {}) =>
    api.get('/recruiter/templates', { params }).then(r => r.data),

  getTemplate: (id) =>
    api.get(`/recruiter/templates/${id}`).then(r => r.data),

  createTemplate: (data) =>
    api.post('/recruiter/templates', data).then(r => r.data),

  updateTemplate: (id, data) =>
    api.put(`/recruiter/templates/${id}`, data).then(r => r.data),

  deleteTemplate: (id) =>
    api.delete(`/recruiter/templates/${id}`).then(r => r.data),

  duplicateTemplate: (id) =>
    api.post(`/recruiter/templates/${id}/duplicate`).then(r => r.data),

  addQuestion: (templateId, data) =>
    api.post(`/recruiter/templates/${templateId}/questions`, data).then(r => r.data),

  updateQuestion: (id, data) =>
    api.put(`/recruiter/questions/${id}`, data).then(r => r.data),

  deleteQuestion: (id) =>
    api.delete(`/recruiter/questions/${id}`).then(r => r.data),

  reorderQuestions: (templateId, order) =>
    api.put(`/recruiter/templates/${templateId}/questions/reorder`, { order }).then(r => r.data),

  scheduleInterview: (data) =>
    api.post('/recruiter/schedule', data).then(r => r.data),

  getAnalytics: (params = {}) =>
    api.get('/recruiter/analytics', { params }).then(r => r.data),
};
