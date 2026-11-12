import api from './axios'

export const bookingService = {
  create: (data) => api.post('/bookings', data),
  lockSeats: (data) => api.post('/bookings/lock', data),
  confirmPayment: (id, paymentMethod) =>
    api.post(`/bookings/${id}/confirm-payment`, { paymentMethod }),
  getById: (id) => api.get(`/bookings/${id}`),
  getByUser: (userId) => api.get(`/bookings/user/${userId}`),
  getByNumber: (bookingNumber) =>
    api.get(`/bookings/number/${bookingNumber}`),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
}
