<template>
  <AppLayout>
    <div class="p-8">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-bold text-slate-900">Projects</h1>
        <button
          v-if="!authStore.isViewer"
          @click="showModal = true"
          class="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition"
        >
          + New project
        </button>
      </div>

      <div v-if="projectStore.projects.length === 0" class="text-center py-20 text-slate-400 text-sm">
        Chưa có dự án nào. Tạo dự án đầu tiên ngay!
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="project in projectStore.projects"
          :key="project.id"
          @click="router.push(`/projects/${project.id}`)"
          class="bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-sm cursor-pointer transition"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 font-bold text-base">
              {{ project.name.charAt(0) }}
            </div>
            <span
              class="text-xs font-semibold px-2.5 py-1 rounded-full"
              :class="project.status === 'active' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-400'"
            >
              {{ project.status === 'active' ? 'Active' : 'Done' }}
            </span>
          </div>
          <h3 class="font-semibold text-slate-800 mb-1">{{ project.name }}</h3>
          <p class="text-xs text-slate-400 mb-3">{{ project._count?.tasks || 0 }} tasks</p>
          <div class="flex items-center gap-3 text-xs text-slate-400">
            <span v-if="project.client">👤 {{ project.client.name }}</span>
            <span v-if="project.deadline">📅 {{ new Date(project.deadline).toLocaleDateString('vi-VN') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4" @click.self="showModal = false">
      <div class="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
        <h3 class="text-lg font-bold text-slate-900 mb-6">Tạo dự án mới</h3>
        <form @submit.prevent="handleCreate" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Tên dự án</label>
            <input v-model="form.name" type="text" placeholder="Website bán hàng..." class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm transition" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Client</label>
            <select v-model="form.clientId" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-400 text-sm transition">
              <option value="">Không có</option>
              <option v-for="client in clientStore.clients" :key="client.id" :value="client.id">{{ client.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Giá theo giờ ($)</label>
            <input v-model="form.hourlyRate" type="number" placeholder="25" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-400 text-sm transition" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
            <input v-model="form.deadline" type="date" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-400 text-sm transition" />
          </div>
          <div class="flex gap-3 pt-2">
            <button type="button" @click="showModal = false" class="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition">Hủy</button>
            <button type="submit" :disabled="loading" class="flex-1 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition disabled:opacity-50">
              {{ loading ? 'Đang tạo...' : 'Tạo dự án' }}
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
import { useProjectStore } from '@/stores/project.store.js'
import { useAuthStore } from '@/stores/auth.store.js'
import { useClientStore } from '@/stores/client.store.js'
import AppLayout from '@/components/common/AppLayout.vue'

const router = useRouter()
const projectStore = useProjectStore()
const clientStore = useClientStore()
const authStore = useAuthStore()
const showModal = ref(false)
const loading = ref(false)
const form = ref({ name: '', clientId: '', hourlyRate: '', deadline: '' })

onMounted(() => {
  projectStore.fetchProjects()
  clientStore.fetchClients()
})

async function handleCreate() {
  loading.value = true
  try {
    await projectStore.createProject(form.value)
    showModal.value = false
    form.value = { name: '', clientId: '', hourlyRate: '', deadline: '' }
  } finally {
    loading.value = false
  }
}
</script>
