<template>
  <AppLayout>
      <div class="p-8">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Clients</h2>
        <button
          v-if="authStore.isAdmin"
          @click="showModal = true"
          class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition"
        >
          + Thêm client
        </button>
      </div>

      <div v-if="clientStore.clients.length === 0" class="text-center py-20 text-gray-400">
        Chưa có client nào. Thêm client đầu tiên ngay!
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="client in clientStore.clients"
          :key="client.id"
          class="bg-white rounded-2xl border border-gray-200 p-6 hover:border-indigo-300 hover:shadow-sm transition"
        >
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="font-semibold text-gray-900">{{ client.name }}</h3>
              <p v-if="client.company" class="text-sm text-gray-400 mt-0.5">{{ client.company }}</p>
            </div>
            <span class="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600">
              {{ client.currency }}
            </span>
          </div>

          <p v-if="client.email" class="text-sm text-gray-500 mb-4">{{ client.email }}</p>

          <div class="flex items-center gap-4 text-sm text-gray-400 mb-4">
            <span>{{ client._count?.projects || 0 }} projects</span>
            <span>{{ client._count?.invoices || 0 }} invoices</span>
          </div>
          <div v-if="authStore.isAdmin" class="flex gap-2">
            <button
              @click="openEdit(client)"
              class="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition"
            >
              Sửa
            </button>
            <button
              @click="handleDelete(client.id)"
              class="py-2 px-3 rounded-xl border border-red-100 text-red-400 text-sm hover:bg-red-50 transition"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal thêm/sửa client -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
        <h3 class="text-lg font-bold text-gray-900 mb-6">
          {{ editingClient ? 'Sửa client' : 'Thêm client mới' }}
        </h3>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tên</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="Nguyen Van A"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition text-sm"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="client@example.com"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition text-sm"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Công ty</label>
            <input
              v-model="form.company"
              type="text"
              placeholder="Công ty ABC"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition text-sm"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tiền tệ</label>
            <select
              v-model="form.currency"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 transition text-sm"
            >
              <option value="USD">USD</option>
              <option value="VND">VND</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          <div class="flex gap-3 pt-2">
            <button
              type="button"
              @click="closeModal"
              class="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition disabled:opacity-50"
            >
              {{ loading ? 'Đang lưu...' : (editingClient ? 'Cập nhật' : 'Thêm client') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store.js'
import { useClientStore } from '@/stores/client.store.js'
import AppLayout from '@/components/common/AppLayout.vue'
const router = useRouter()
const authStore = useAuthStore()
const clientStore = useClientStore()

const showModal = ref(false)
const loading = ref(false)
const editingClient = ref(null)
const form = ref({ name: '', email: '', company: '', currency: 'USD' })

onMounted(() => clientStore.fetchClients())

function openEdit(client) {
  editingClient.value = client
  form.value = {
    name: client.name,
    email: client.email || '',
    company: client.company || '',
    currency: client.currency || 'USD'
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingClient.value = null
  form.value = { name: '', email: '', company: '', currency: 'USD' }
}

async function handleSubmit() {
  loading.value = true
  try {
    if (editingClient.value) {
      await clientStore.updateClient(editingClient.value.id, form.value)
    } else {
      await clientStore.createClient(form.value)
    }
    closeModal()
  } finally {
    loading.value = false
  }
}

async function handleDelete(id) {
  if (!confirm('Bạn chắc chắn muốn xóa client này?')) return
  await clientStore.deleteClient(id)
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>
