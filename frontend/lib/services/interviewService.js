import api from '@/lib/api';

export const interviewService = {
  getTemplates: () =>
    api.get('/interview/templates').then(r => r.data),

  startInterview: (templateId) =>
    api.post('/interview/start', { templateId }).then(r => r.data),

  getInterview: (id) =>
    api.get(`/interview/${id}`).then(r => r.data),

  submitAnswer: (interviewId, data) =>
    api.post(`/interview/${interviewId}/answers`, data).then(r => r.data),

  completeInterview: (interviewId) =>
    api.post(`/interview/${interviewId}/complete`).then(r => r.data),

  pauseInterview: (interviewId) =>
    api.post(`/interview/${interviewId}/pause`).then(r => r.data),

  resumeInterview: (interviewId) =>
    api.post(`/interview/${interviewId}/resume`).then(r => r.data),

  getHistory: (params = {}) =>
    api.get('/interview', { params }).then(r => r.data),
};
