import api from '@/lib/api';

export const interviewService = {
  /**
   * Start a new AI-powered interview with config
   */
  startInterview: (config) =>
    api.post('/interview/start', config).then(r => r.data),

  /**
   * Submit an answer and get the next question or completion
   */
  submitAnswer: (interviewId, data) =>
    api.post(`/interview/${interviewId}/answer`, data).then(r => r.data),

  /**
   * Manually complete an interview
   */
  completeInterview: (interviewId) =>
    api.post(`/interview/${interviewId}/complete`).then(r => r.data),

  /**
   * Get interview details with result
   */
  getInterview: (id) =>
    api.get(`/interview/${id}`).then(r => r.data),

  /**
   * Get interview history
   */
  getHistory: (params = {}) =>
    api.get('/interview', { params }).then(r => r.data),
};
