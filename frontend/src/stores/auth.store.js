import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api/index.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const accessToken = ref(localStorage.getItem('accessToken'))

  const isLoggedIn = computed(() => !!accessToken.value)

  async function register(fullName, email, password) {
    const res = await api.post('/auth/register', { fullName, email, password })
    accessToken.value = res.data.accessToken
    user.value = res.data.user
    localStorage.setItem('accessToken', res.data.accessToken)
    return res.data
  }

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password })
    accessToken.value = res.data.accessToken
    user.value = res.data.user
    localStorage.setItem('accessToken', res.data.accessToken)
    return res.data
  }

  async function logout() {
    await api.post('/auth/logout')
    accessToken.value = null
    user.value = null
    localStorage.removeItem('accessToken')
  }

  return { user, accessToken, isLoggedIn, register, login, logout }
})
