import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/index.js'

export const useProjectStore = defineStore('project', () => {
  const projects = ref([])
  const currentProject = ref(null)

  async function fetchProjects() {
    const res = await api.get('/projects')
    projects.value = res.data
  }

  async function fetchProject(id) {
    const res = await api.get(`/projects/${id}`)
    currentProject.value = res.data
    return res.data
  }

  async function createProject(data) {
    const res = await api.post('/projects', data)
    projects.value.unshift(res.data)
    return res.data
  }

  async function createTask(projectId, data) {
    const res = await api.post(`/projects/${projectId}/tasks`, data)
    if (currentProject.value?.id === projectId) {
      currentProject.value.tasks.push(res.data)
    }
    return res.data
  }

  async function moveTask(taskId, status, position) {
    const res = await api.patch(`/tasks/${taskId}/move`, { status, position })
    return res.data
  }

  return {
    projects,
    currentProject,
    fetchProjects,
    fetchProject,
    createProject,
    createTask,
    moveTask
  }
})
