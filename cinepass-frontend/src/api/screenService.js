import api from './axios'

export const screenService = {
  getByTheater: (theaterId) => api.get(`/theaters/${theaterId}/screens`),
  getById: (theaterId, screenId) =>
    api.get(`/theaters/${theaterId}/screens/${screenId}`),
  create: (theaterId, data) =>
    api.post(`/theaters/${theaterId}/screens`, data),
}
