import api from './axios'

export const movieService = {
  getAll: () => api.get('/movies'),
  getById: (id) => api.get(`/movies/${id}`),
  search: (title) => api.get('/movies/search', { params: { title } }),
  getByLanguage: (language) => api.get(`/movies/language/${language}`),
  getByGenre: (genre) => api.get(`/movies/genre/${genre}`),
  create: (data) => api.post('/movies', data),
  update: (id, data) => api.put(`/movies/${id}`, data),
  delete: (id) => api.delete(`/movies/${id}`),
}
