import api from './axios'

export const seatService = {
  getByScreen: (screenId) => api.get(`/screens/${screenId}/seats`),
  getById: (screenId, seatId) =>
    api.get(`/screens/${screenId}/seats/${seatId}`),
  create: (screenId, data) => api.post(`/screens/${screenId}/seats`, data),
  delete: (screenId, seatId) =>
    api.delete(`/screens/${screenId}/seats/${seatId}`),
}
