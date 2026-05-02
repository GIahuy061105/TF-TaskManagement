import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api/index.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const accessToken = ref(localStorage.getItem('accessToken'))

  const activeWorkspaceId = ref(localStorage.getItem('activeWorkspaceId'))
  const workspaces = ref([])
  const userRole = ref(localStorage.getItem('userRole'))

  const isLoggedIn = computed(() => !!accessToken.value)

  function setActiveWorkspace(workspaceData, role) {
    activeWorkspaceId.value = workspaceData.id
    userRole.value = role
    localStorage.setItem('activeWorkspaceId', workspaceData.id)
    localStorage.setItem('userRole', role)
  }

  async function register(fullName, email, password) {
    const res = await api.post('/auth/register', { fullName, email, password })

    accessToken.value = res.data.accessToken
    user.value = res.data.user

    setActiveWorkspace(res.data.user.workspace, 'ADMIN')

    localStorage.setItem('accessToken', res.data.accessToken)
    return res.data
  }

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password })

    accessToken.value = res.data.accessToken
    user.value = res.data.user
    workspaces.value = res.data.workspaces

    setActiveWorkspace(res.data.activeWorkspace, res.data.activeWorkspace.role)

    localStorage.setItem('accessToken', res.data.accessToken)
    return res.data
  }

  async function logout() {
    await api.post('/auth/logout')
    accessToken.value = null
    user.value = null
    activeWorkspaceId.value = null
    userRole.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('activeWorkspaceId')
    localStorage.removeItem('userRole')
  }

  const isAdmin = computed(() => userRole.value === 'ADMIN')
  const isViewer = computed(() => userRole.value === 'VIEWER')
  const activeWorkspace = computed(() => {
  return workspaces.value.find(ws => ws.id === activeWorkspaceId.value) || null
  })
  const isOwner = computed(() => {
    return user.value?.id === activeWorkspace.value?.ownerId
  })

  const displayRole = computed(() => {
    return isOwner.value ? 'ADMIN' : userRole.value
  })
  return {
    user,
    activeWorkspaceId,
    workspaces,
    isAdmin,
    isViewer,
    isLoggedIn,
    register,
    login,
    logout,
    setActiveWorkspace,
    displayRole,
    activeWorkspace
  }
})
