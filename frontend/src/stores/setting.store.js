import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/index.js'

export const useSettingStore = defineStore('setting', () => {
  const settings = ref(null)

  async function fetchSettings() {
    const res = await api.get('/settings')
    settings.value = res.data
    return res.data
  }

  async function updateSettings(data) {
    const res = await api.put('/settings', data)
    settings.value = res.data
    return res.data
  }

  return { settings, fetchSettings, updateSettings }
})
