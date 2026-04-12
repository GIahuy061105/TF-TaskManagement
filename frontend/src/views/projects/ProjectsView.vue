<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <RouterLink to="/dashboard" class="text-xl font-bold text-indigo-600">TaskFlow</RouterLink>
        <span class="text-gray-300">/</span>
        <span class="text-gray-600 font-medium">Projects</span>
      </div>
      <RouterLink to="/clients" class="text-sm text-gray-600 hover:text-indigo-600 font-medium">
        Clients
      </RouterLink>
      <RouterLink to="/invoices" class="text-sm text-gray-600 hover:text-indigo-600 font-medium">
        Invoices
      </RouterLink>
      <button
        @click="handleLogout"
        class="text-sm text-gray-500 hover:text-red-500 transition"
      >
        Đăng xuất
      </button>
    </nav>

    <div class="max-w-6xl mx-auto px-6 py-8">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Dự án</h2>
        <button
          @click="showModal = true"
          class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition"
        >
          + Tạo dự án
        </button>
      </div>

      <div v-if="projectStore.projects.length === 0" class="text-center py-20 text-gray-400">
        Chưa có dự án nào. Tạo dự án đầu tiên ngay!
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="project in projectStore.projects"
          :key="project.id"
          @click="router.push(`/projects/${project.id}`)"
          class="bg-white rounded-2xl border border-gray-200 p-6 hover:border-indigo-300 hover:shadow-sm cursor-pointer transition"
        >
          <div class="flex items-start justify-between mb-3">
            <h3 class="font-semibold text-gray-900">{{ project.name }}</h3>
            <span
              class="text-xs font-medium px-2.5 py-1 rounded-full"
              :class="project.status === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'"
            >
              {{ project.status === 'active' ? 'Active' : 'Done' }}
            </span>
          </div>
          <p class="text-sm text-gray-400">{{ project._count?.tasks || 0 }} tasks</p>
          <p v-if="project.client" class="text-sm text-gray-400 mt-1">
            Client: {{ project.client.name }}
          </p>
          <p v-if="project.deadline" class="text-sm text-gray-400 mt-1">
            Deadline: {{ new Date(project.deadline).toLocaleDateString('vi-VN') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Modal tạo project -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      @click.self="showModal = false"
    >
      <div class="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
        <h3 class="text-lg font-bold text-gray-900 mb-6">Tạo dự án mới</h3>

        <form @submit.prevent="handleCreate" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tên dự án</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="Website bán hàng..."
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition text-sm"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Giá theo giờ ($)</label>
            <input
              v-model="form.hourlyRate"
              type="number"
              placeholder="25"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition text-sm"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
            <input
              v-model="form.deadline"
              type="date"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition text-sm"
            />
          </div>

          <div class="flex gap-3 pt-2">
            <button
              type="button"
              @click="showModal = false"
              class="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition disabled:opacity-50"
            >
              {{ loading ? 'Đang tạo...' : 'Tạo dự án' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store.js'
import { useProjectStore } from '@/stores/project.store.js'

const router = useRouter()
const authStore = useAuthStore()
const projectStore = useProjectStore()

const showModal = ref(false)
const loading = ref(false)
const form = ref({ name: '', hourlyRate: '', deadline: '' })

onMounted(() => projectStore.fetchProjects())

async function handleCreate() {
  loading.value = true
  try {
    await projectStore.createProject(form.value)
    showModal.value = false
    form.value = { name: '', hourlyRate: '', deadline: '' }
  } finally {
    loading.value = false
  }
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>
