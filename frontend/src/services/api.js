import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
})

// Attach token on every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tm_token')
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

// ─── Auth ───────────────────────────────────────────────────────────────
export const registerUser = (data) =>
  api.post('/auth/register', data).then((r) => r.data)

export const loginUser = (data) =>
  api.post('/auth/login', data).then((r) => r.data)

export const getProfile = () =>
  api.get('/auth/profile').then((r) => r.data)

// ─── Itinerary / Trips ──────────────────────────────────────────────────
export const generateItinerary = (data) =>
  api.post('/generate-itinerary', data).then((r) => r.data)

export const saveTrip = (data) =>
  api.post('/save-trip', data).then((r) => r.data)

export const getUserTrips = (userId) =>
  api.get(`/trips/${userId}`).then((r) => r.data)

export const getTripById = (tripId) =>
  api.get(`/trips/detail/${tripId}`).then((r) => r.data)

export const getPublicTrip = (shareToken) =>
  api.get(`/trips/public/${shareToken}`).then((r) => r.data)

export const deleteTrip = (tripId, userId) =>
  api.delete(`/trips/${tripId}`, { params: { userId } }).then((r) => r.data)

export const inviteCollaborator = (tripId, data) =>
  api.post(`/trips/${tripId}/invite`, data).then((r) => r.data)

export const getTripMembers = (tripId) =>
  api.get(`/trips/${tripId}/members`).then((r) => r.data)

// ─── User Preferences ───────────────────────────────────────────────────
export const getUserPreferences = (userId) =>
  api.get('/user-preferences', { params: { userId } }).then((r) => r.data)

export const saveUserPreferences = (data) =>
  api.post('/user-preferences', data).then((r) => r.data)

// ─── Catalog ────────────────────────────────────────────────────────────
export const getCatalogHotels = (params) =>
  api.get('/catalog/hotels', { params }).then((r) => r.data)

export const getCatalogActivities = (params) =>
  api.get('/catalog/activities', { params }).then((r) => r.data)

export const getCatalogEvents = (params) =>
  api.get('/catalog/events', { params }).then((r) => r.data)

export const searchCatalog = (params) =>
  api.get('/catalog/search', { params }).then((r) => r.data)

// ─── Wishlist ───────────────────────────────────────────────────────────
export const addToWishlist = (data) =>
  api.post('/wishlist/add', data).then((r) => r.data)

export const getWishlist = (userId) =>
  api.get('/wishlist', { params: { userId } }).then((r) => r.data)

export const removeFromWishlist = (id, userId) =>
  api.delete(`/wishlist/${id}`, { params: { userId } }).then((r) => r.data)

export default api
