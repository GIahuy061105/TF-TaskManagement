import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  const activeWorkspace = JSON.parse(localStorage.getItem('activeWorkspace') || 'null')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (activeWorkspace?.id) {
    config.headers['x-workspace-id'] = activeWorkspace.id
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('activeWorkspace')
      localStorage.removeItem('user')
      localStorage.removeItem('workspaces')

      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
