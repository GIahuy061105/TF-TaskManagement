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
  async function updateTask(taskId , data){
      const res = await api.patch(`/tasks/${taskId} `,data)
      return res.data
  }
  // Gửi đơn yêu cầu duyệt hoàn thành
  async function requestTaskApprove(taskId , data){
      const res = await api.post(`/tasks/${taskId}/request-approval` , data)
      return res.data
  }
  // Phê duyệt hoàn thành task
  async function approveTask(taskId) {
      const res = await api.post(`/tasks/${taskId}/approve`)
      return res.data
  }
  //  Cập nhật dự án (Trạng thái)
  async function updateProject(projectId, data) {
      await api.patch(`/projects/${projectId}`, data)
  }

  //  Xóa dự án
  async function deleteProject(projectId) {
      await api.delete(`/projects/${projectId}`)
  }

  //  Thêm thành viên vào dự án
  async function addProjectMember(projectId, userId) {
      await api.post(`/projects/${projectId}/members`, { userId })
  }

  //  Xóa thành viên khỏi dự án
  async function removeProjectMember(projectId, userId) {
      await api.delete(`/projects/${projectId}/members/${userId}`)
  }

  //  Xóa Task
  async function deleteTask(taskId) {
      await api.delete(`/tasks/${taskId}`)
  }
  async function fetchComments(taskId) {
    const res = await api.get(`/tasks/${taskId}/comments`)
    return res.data
  }

  async function addComment(taskId, content) {
    const res = await api.post(`/tasks/${taskId}/comments`, { content })
    return res.data
  }
  async function fetchAttachments(taskId) {
    const res = await api.get(`/tasks/${taskId}/attachments`)
    return res.data
  }

  async function addAttachment(taskId, attachmentData) {
    const res = await api.post(`/tasks/${taskId}/attachments`, attachmentData)
    return res.data
  }

  async function deleteAttachment(taskId, attachmentId) {
    await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`)
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
    moveTask,
    updateTask,
    requestTaskApprove,
    approveTask,
    fetchComments,
    addComment,
    fetchAttachments,
    addAttachment,
    deleteAttachment,
    updateProject,
    deleteProject,
    addProjectMember,
    removeProjectMember,
    deleteTask
  }
})
