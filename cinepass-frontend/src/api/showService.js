import api from './axios'

export const showService = {
  getAll: () => api.get('/shows'),
  getById: (id) => api.get(`/shows/${id}`),
  getByMovie: (movieId) => api.get(`/shows/movie/${movieId}`),
  getByMovieAndCity: (movieId, city) =>
    api.get(`/shows/movie/${movieId}/city/${city}`),
  getByDateRange: (start, end) =>
    api.get('/shows/date-range', { params: { start, end } }),
  create: (data) => api.post('/shows', data),
}
