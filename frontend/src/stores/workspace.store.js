import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/index.js'

export const useWorkspaceStore = defineStore('workspace', () => {
  const members = ref([])
  async function fetchMembers() {
    try {
      const res = await api.get('/workspace/members')
      members.value = res.data
    } catch (err) {
      console.error('Không thể lấy danh sách thành viên:', err)
    }
  }
  return {
    members,
    fetchMembers
  }
})
