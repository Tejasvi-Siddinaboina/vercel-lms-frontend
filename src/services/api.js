import axios from 'axios'

const API = axios.create({ baseURL: '/api' })

API.interceptors.request.use(config => {
  const token = localStorage.getItem('lms_token')
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login:    (data) => API.post('/auth/login', data),
}

export const bookAPI = {
  getAll: ()         => API.get('/books'),
  add:    (data)     => API.post('/books', data),
  update: (id, data) => API.put(`/books/${id}`, data),
  delete: (id)       => API.delete(`/books/${id}`),
  stats:  ()         => API.get('/books/stats'),
}
