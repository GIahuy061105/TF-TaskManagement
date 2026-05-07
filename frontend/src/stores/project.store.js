import { defineStore } from 'pinia'
import { ref , computed } from 'vue'
import api from '../api/index.js'

export const useProjectStore = defineStore('project', () => {
  const projects = ref([])
  const currentProject = ref(null)
  const todoTasks = computed(() =>
      currentProject.value?.tasks?.filter(t => t.status === 'TODO') || []
  )
  const inProgressTasks = computed(() =>
      currentProject.value?.tasks?.filter(t => t.status === 'IN_PROGRESS') || []
  )
  const inReviewTasks = computed(() =>
      currentProject.value?.tasks?.filter(t => t.status === 'IN_REVIEW') || []
  )
  const doneTasks = computed(() =>
      currentProject.value?.tasks?.filter(t => t.status === 'DONE') || []
  )
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
      const normalizedStatus = status.toUpperCase()
      if (currentProject.value) {
        const task = currentProject.value.tasks.find(t => t.id === taskId)
        if (task) {
          task.status = normalizedStatus
          task.position = position
        }
      }
      const res = await api.patch(`/tasks/${taskId}/move`, {
        status: normalizedStatus,
        position
      })
      return res.data
  }

  return {
    projects,
    currentProject,
    todoTasks,
    inProgressTasks,
    inReviewTasks,
    doneTasks,
    fetchProjects,
    fetchProject,
    createProject,
    createTask,
    moveTask
  }
})
