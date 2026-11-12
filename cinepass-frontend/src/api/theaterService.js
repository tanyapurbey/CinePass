import api from './axios'

export const theaterService = {
  getAll: () => api.get('/theaters'),
  getById: (id) => api.get(`/theaters/${id}`),
  getByCity: (city) => api.get(`/theaters/city/${city}`),
  create: (data) => api.post('/theaters', data),
  update: (id, data) => api.put(`/theaters/${id}`, data),
  delete: (id) => api.delete(`/theaters/${id}`),
}
