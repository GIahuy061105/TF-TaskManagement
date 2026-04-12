<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h1 class="text-xl font-bold text-indigo-600">TaskFlow</h1>
      <div class="flex items-center gap-4">
        <RouterLink to="/projects" class="text-sm text-gray-600 hover:text-indigo-600 font-medium">
          Projects
        </RouterLink>
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
      </div>
    </nav>

    <div class="max-w-6xl mx-auto px-6 py-8">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900">
          Xin chào, {{ authStore.user?.fullName || 'bạn' }} 👋
        </h2>
        <p class="text-gray-500 mt-1">Đây là tổng quan công việc của bạn hôm nay.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div class="bg-white rounded-2xl border border-gray-200 p-6">
          <p class="text-sm text-gray-500 mb-1">Tổng dự án</p>
          <p class="text-3xl font-bold text-gray-900">{{ projectStore.projects.length }}</p>
        </div>
        <div class="bg-white rounded-2xl border border-gray-200 p-6">
          <p class="text-sm text-gray-500 mb-1">Đang hoạt động</p>
          <p class="text-3xl font-bold text-indigo-600">
            {{ projectStore.projects.filter(p => p.status === 'active').length }}
          </p>
        </div>
        <div class="bg-white rounded-2xl border border-gray-200 p-6">
          <p class="text-sm text-gray-500 mb-1">Tổng tasks</p>
          <p class="text-3xl font-bold text-gray-900">
            {{ projectStore.projects.reduce((sum, p) => sum + (p._count?.tasks || 0), 0) }}
          </p>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-5">
          <h3 class="font-semibold text-gray-900">Dự án gần đây</h3>
          <RouterLink
            to="/projects"
            class="text-sm text-indigo-600 hover:underline font-medium"
          >
            Xem tất cả
          </RouterLink>
        </div>

        <div v-if="projectStore.projects.length === 0" class="text-center py-10 text-gray-400">
          Chưa có dự án nào.
          <RouterLink to="/projects" class="text-indigo-600 ml-1 hover:underline">Tạo ngay</RouterLink>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="project in projectStore.projects.slice(0, 5)"
            :key="project.id"
            @click="router.push(`/projects/${project.id}`)"
            class="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 cursor-pointer transition"
          >
            <div>
              <p class="font-medium text-gray-900">{{ project.name }}</p>
              <p class="text-sm text-gray-400 mt-0.5">{{ project._count?.tasks || 0 }} tasks</p>
            </div>
            <span
              class="text-xs font-medium px-3 py-1 rounded-full"
              :class="project.status === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'"
            >
              {{ project.status === 'active' ? 'Đang chạy' : 'Hoàn thành' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store.js'
import { useProjectStore } from '@/stores/project.store.js'

const router = useRouter()
const authStore = useAuthStore()
const projectStore = useProjectStore()

onMounted(() => {
  projectStore.fetchProjects()
})

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>
