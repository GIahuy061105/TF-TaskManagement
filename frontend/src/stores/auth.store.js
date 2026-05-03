import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api/index.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const accessToken = ref(localStorage.getItem('accessToken'))
  const workspaces = ref(JSON.parse(localStorage.getItem('workspaces') || '[]'))
  const activeWorkspace = ref(JSON.parse(localStorage.getItem('activeWorkspace') || 'null'))

  const isLoggedIn = computed(() => !!accessToken.value)
  const isAdmin = computed(() => activeWorkspace.value?.role === 'ADMIN')
  const isViewer = computed(() => activeWorkspace.value?.role === 'VIEWER')
  const isOwner = computed(() => user.value?.id === activeWorkspace.value?.ownerId)
  const displayRole = computed(() => {
    if (isOwner.value || activeWorkspace.value?.role === 'ADMIN') {
      return 'ADMIN';
    }
    return activeWorkspace.value?.role || 'MEMBER';
  });
  function saveToStorage() {
    localStorage.setItem('accessToken', accessToken.value || '')
    localStorage.setItem('user', JSON.stringify(user.value))
    localStorage.setItem('workspaces', JSON.stringify(workspaces.value))
    localStorage.setItem('activeWorkspace', JSON.stringify(activeWorkspace.value))
  }

  async function register(fullName, email, password) {
    const res = await api.post('/auth/register', { fullName, email, password })

    accessToken.value = res.data.accessToken
    user.value = res.data.user
    workspaces.value = [{ ...res.data.user.workspace, role: 'ADMIN' }]
    activeWorkspace.value = {
      ...res.data.user.workspace,
      role: 'ADMIN'
    }

    saveToStorage()
    return res.data
  }

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password })

    accessToken.value = res.data.accessToken
    user.value = res.data.user
    workspaces.value = res.data.workspaces
    activeWorkspace.value = res.data.activeWorkspace

    saveToStorage()
    return res.data
  }

  function switchWorkspace(workspaceId) {
    const ws = workspaces.value.find(w => w.id === workspaceId)
    if (!ws) return
    activeWorkspace.value = ws
    saveToStorage()
    window.location.reload()
  }

  async function logout() {
    await api.post('/auth/logout')
    accessToken.value = null
    user.value = null
    workspaces.value = []
    activeWorkspace.value = null
    localStorage.clear()
  }

  return {
    user,
    accessToken,
    workspaces,
    activeWorkspace,
    isLoggedIn,
    isAdmin,
    isViewer,
    isOwner,
    register,
    displayRole,
    login,
    logout,
    switchWorkspace
  }
})
