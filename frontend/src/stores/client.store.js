import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/index.js'

export const useClientStore = defineStore('clients', () => {
  const clients = ref([])
  const currentClient = ref(null)

  async function fetchClients() {
    const res = await api.get('/clients')
    clients.value = res.data
  }
  async function fetchClientById(id) {
      const res = await api.get(`/clients/${id}`)
      currentClient.value = res.data
      return res.data
  }

  async function createClient(data) {
    const res = await api.post('/clients', data)
    clients.value.unshift(res.data)
    return res.data
  }

  async function updateClient(id, data) {
    const res = await api.patch(`/clients/${id}`, data)
    const index = clients.value.findIndex(c => c.id === id)
    if (index !== -1) clients.value[index] = res.data
    return res.data
  }

  async function deleteClient(id) {
    await api.delete(`/clients/${id}`)
    clients.value = clients.value.filter(c => c.id !== id)
  }

  return { clients, currentClient, fetchClients ,fetchClientById, createClient, updateClient, deleteClient }
})
