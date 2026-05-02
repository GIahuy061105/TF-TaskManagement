<template>
  <AppLayout>
    <div class="p-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p class="text-slate-400 text-sm mt-1">Xin chào, {{ authStore.user?.fullName }} 👋</p>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-5 mb-8">
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <div class="flex items-center justify-between mb-4">
            <div class="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-lg">📁</div>
            <span class="text-xs font-semibold bg-indigo-50 text-indigo-500 px-2.5 py-1 rounded-full">Total</span>
          </div>
          <p class="text-xs text-slate-400 mb-1">Projects</p>
          <p class="text-2xl font-bold text-indigo-500">{{ projectStore.projects.length }}</p>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <div class="flex items-center justify-between mb-4">
            <div class="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center text-lg">⚡</div>
            <span class="text-xs font-semibold bg-orange-50 text-orange-500 px-2.5 py-1 rounded-full">Active</span>
          </div>
          <p class="text-xs text-slate-400 mb-1">Tasks</p>
          <p class="text-2xl font-bold text-orange-500">
            {{ projectStore.projects.reduce((s, p) => s + (p._count?.tasks || 0), 0) }}
          </p>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <div class="flex items-center justify-between mb-4">
            <div class="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-lg">💰</div>
            <span class="text-xs font-semibold bg-emerald-50 text-emerald-500 px-2.5 py-1 rounded-full">This month</span>
          </div>
          <p class="text-xs text-slate-400 mb-1">Revenue</p>
          <p class="text-2xl font-bold text-emerald-500">$0</p>
        </div>
      </div>

      <!-- Recent projects -->
      <div class="bg-white rounded-xl border border-slate-200">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 class="font-semibold text-slate-800">Recent Projects</h2>
          <RouterLink to="/projects" class="text-xs text-indigo-500 hover:underline font-medium">
            View all
          </RouterLink>
        </div>

        <div v-if="projectStore.projects.length === 0" class="text-center py-12 text-slate-400 text-sm">
          Chưa có dự án nào.
          <RouterLink to="/projects" class="text-indigo-500 ml-1 hover:underline">Tạo ngay</RouterLink>
        </div>

        <div v-else>
          <div
            v-for="project in projectStore.projects.slice(0, 5)"
            :key="project.id"
            @click="router.push(`/projects/${project.id}`)"
            class="flex items-center justify-between px-6 py-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition last:border-0"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500 font-bold text-sm">
                {{ project.name.charAt(0) }}
              </div>
              <div>
                <p class="text-sm font-medium text-slate-800">{{ project.name }}</p>
                <p class="text-xs text-slate-400">{{ project._count?.tasks || 0 }} tasks</p>
              </div>
            </div>
            <span
              class="text-xs font-semibold px-2.5 py-1 rounded-full"
              :class="project.status === 'active' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-100 text-slate-400'"
            >
              {{ project.status === 'active' ? 'Active' : 'Done' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store.js'
import { useProjectStore } from '@/stores/project.store.js'
import AppLayout from '@/components/common/AppLayout.vue'

const router = useRouter()
const authStore = useAuthStore()
const projectStore = useProjectStore()

onMounted(() => projectStore.fetchProjects())
</script>
