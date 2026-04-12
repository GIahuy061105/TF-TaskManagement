import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/index.js'

export const useInvoiceStore = defineStore('invoice', () => {
  const invoices = ref([])

  async function fetchInvoices() {
    const res = await api.get('/invoices')
    invoices.value = res.data
  }

  async function createInvoice(data) {
    const res = await api.post('/invoices', data)
    invoices.value.unshift(res.data)
    return res.data
  }

  async function sendInvoice(id) {
    const res = await api.post(`/invoices/${id}/send`)
    const index = invoices.value.findIndex(i => i.id === id)
    if (index !== -1) invoices.value[index] = res.data
    return res.data
  }

  async function markAsPaid(id) {
    const res = await api.post(`/invoices/${id}/mark-paid`)
    const index = invoices.value.findIndex(i => i.id === id)
    if (index !== -1) invoices.value[index] = res.data
    return res.data
  }

  async function deleteInvoice(id) {
    await api.delete(`/invoices/${id}`)
    invoices.value = invoices.value.filter(i => i.id !== id)
  }

  return { invoices, fetchInvoices, createInvoice, sendInvoice, markAsPaid, deleteInvoice }
})
