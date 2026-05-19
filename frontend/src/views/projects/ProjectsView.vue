<template>
  <AppLayout>
    <div class="p-8 max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Dự án</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Quản lý và theo dõi tiến độ các dự án của bạn.</p>
        </div>
        <button
          v-if="authStore.isAdmin"
          @click="showModal = true"
          class="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-200 dark:shadow-indigo-900/20 hover:shadow-lg hover:shadow-indigo-300 dark:hover:shadow-indigo-900/40 hover:-translate-y-0.5"
        >
          + Tạo dự án mới
        </button>
      </div>

      <div v-if="projectStore.projects.length === 0" class="flex flex-col items-center justify-center py-24 bg-white/50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 transition-colors">
        <div class="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-4xl mb-4 text-indigo-500 dark:text-indigo-400 transition-colors"> <BaseIcon :path="mdiRocketLaunch" size="40"/></div>
        <h3 class="text-lg font-bold text-slate-800 dark:text-slate-200 transition-colors">Chưa có dự án nào</h3>
        <p class="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-4 transition-colors">Bắt đầu bằng cách tạo dự án đầu tiên cho team của bạn.</p>
        <button v-if="authStore.isAdmin" @click="showModal = true" class="text-indigo-600 dark:text-indigo-400 font-bold text-sm bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">Tạo ngay</button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="project in projectStore.projects"
          :key="project.id"
          @click="router.push(`/projects/${project.id}`)"
          class="group bg-white dark:bg-slate-800 rounded-3xl border border-slate-500 dark:border-slate-700 p-6 hover:border-indigo-200 dark:hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-50/50 dark:hover:shadow-indigo-900/20 cursor-pointer transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex flex-col h-full"
        >
          <div class="absolute top-0 right-0 w-32 h-32 rounded-bl-full -z-0 opacity-20 dark:opacity-30 transition-transform group-hover:scale-110" :style="{ backgroundColor: project.color || '#6366f1' }"></div>

          <div class="flex items-start justify-between mb-5 relative z-10">
            <div
              :style="{ backgroundColor: (project.color || '#6366f1') + (themeStore?.isDark ? '30' : '20'), color: project.color || '#6366f1' }"
              class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm transition-colors"
            >
                <span v-if="project.icon">{{ project.icon }}</span>
               <BaseIcon v-else :path="mdiFolder" size="24" />
            </div>

            <div class="flex flex-col items-end gap-2">
              <span
                class="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full transition-colors"
                :class="project.status === 'ACTIVE' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50' : 'bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600'"
              >
                {{ project.status === 'ACTIVE' ? 'Đang chạy' : 'Đã đóng' }}
              </span>
              <span
                class="text-[10px] px-2 py-0.5 rounded font-bold border shrink-0 flex items-center gap-1 bg-white dark:bg-slate-800 transition-colors"
                :class="project.visibility === 'PRIVATE' ? 'text-rose-500 dark:text-rose-400 border-rose-100 dark:border-rose-800/50' : 'text-blue-500 dark:text-blue-400 border-blue-100 dark:border-blue-800/50'"
              >
                <BaseIcon :path="project.visibility === 'PRIVATE' ? mdiLockOutline : mdiEarth" size="14" />
                {{ project.visibility === 'PRIVATE' ? 'Private' : 'Public' }}
              </span>
            </div>
          </div>

          <div class="relative z-10 flex-1">
            <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{{ project.name }}</h3>
            <p v-if="project.client" class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5 transition-colors">
              <span class="text-slate-300 dark:text-slate-500 transition-colors"> <BaseIcon :path="mdiClipboardAccount" size="22"/></span> {{ project.client.name }}
            </p>
            <p v-else class="text-sm font-medium text-slate-400 dark:text-slate-500 mb-4 italic transition-colors">Dự án nội bộ</p>
          </div>

          <div class="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 relative z-10 transition-colors">
            <div class="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700/50 px-2.5 py-1.5 rounded-lg transition-colors">
              <span class="text-indigo-400 dark:text-indigo-500 text-sm transition-colors"> <BaseIcon :path="mdiScriptTextOutline" size="22"/></span>
              <span>{{ project._count?.tasks || 0 }} Tasks</span>
            </div>
            <div v-if="project.deadline" class="flex items-center gap-1.5 bg-rose-50/50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-2.5 py-1.5 rounded-lg transition-colors">
              <span> <BaseIcon :path="mdiTimerSand" size="22"/></span>
              <span>{{ new Date(project.deadline).toLocaleDateString('vi-VN') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/60 flex items-center justify-center z-50 px-4 backdrop-blur-sm transition-colors" @click.self="showModal = false">
      <div class="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-transparent dark:border-slate-700 transition-colors">
        <h3 class="flex items-center gap-2 text-xl font-black text-slate-900 dark:text-white mb-6 transition-colors">Tạo dự án mới  <BaseIcon :path="mdiCreation" size="22" class="text-indigo-500 dark:text-indigo-400"/></h3>

        <form @submit.prevent="handleCreate" class="space-y-5">
          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">Tên dự án</label>
            <input v-model="form.name" type="text" placeholder="Website bán hàng..." class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 text-sm transition-colors outline-none font-medium" required />
          </div>

          <div class="flex gap-4">
            <div class="w-1/3">
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">Icon</label>
              <input v-model="form.icon" type="text" placeholder="📁" class="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-sm text-center text-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 transition-colors outline-none" maxlength="2" />
            </div>
            <div class="flex-1">
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">Màu sắc</label>
              <div class="flex items-center gap-2">
                <input v-model="form.color" type="color" class="w-12 h-11 rounded-xl cursor-pointer border-0 p-0 shadow-sm shrink-0 bg-transparent" />
                <input v-model="form.color" type="text" placeholder="#6366f1" class="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-sm uppercase font-mono focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 transition-colors outline-none font-medium" />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">Truy cập</label>
                <select v-model="form.visibility" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 text-sm transition-colors font-semibold outline-none">
                   <option value="PUBLIC">🌍 Công khai</option>
                   <option value="PRIVATE">🔒 Riêng tư</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">Khách hàng</label>
                <select v-model="form.clientId" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 text-sm transition-colors font-medium outline-none">
                  <option value="">Nội bộ</option>
                  <option v-for="client in clientStore.clients" :key="client.id" :value="client.id">{{ client.name }}</option>
                </select>
              </div>
          </div>

          <div class="flex gap-4">
            <div class="flex-1">
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">Giá / Giờ</label>
              <input v-model="form.hourlyRate" type="number" min="0" step="0.1" placeholder="25" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 text-sm transition-colors outline-none font-medium" />
            </div>
            <div class="flex-1">
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">Hạn chót</label>
              <input v-model="form.deadline" type="date" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 text-sm transition-colors outline-none font-medium" />
            </div>
          </div>

          <div class="flex gap-3 pt-6 border-t border-slate-100 dark:border-slate-700 transition-colors">
            <button type="button" @click="showModal = false" class="flex-1 py-3.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Hủy</button>
            <button type="submit" :disabled="loading" class="flex-1 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition shadow-md hover:shadow-lg disabled:opacity-50">
              {{ loading ? 'Hệ thống đang xử lý...' : 'Tạo dự án' }}
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
import { mdiRocketLaunch , mdiFolder , mdiClipboardAccount, mdiTimerSand,mdiCreation ,mdiScriptTextOutline,mdiEarth, mdiLockOutline } from '@mdi/js'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import AppLayout from '@/components/common/AppLayout.vue'

const router = useRouter()
const projectStore = useProjectStore()
const clientStore = useClientStore()
const authStore = useAuthStore()
const showModal = ref(false)
const loading = ref(false)
const form = ref({ name: '', clientId: '', hourlyRate: '', deadline: '',color: '#6366f1', icon: '📁', description: '',visibility: 'PUBLIC' })

onMounted(() => {
  projectStore.fetchProjects()
  clientStore.fetchClients()
})

async function handleCreate() {
  loading.value = true
  try {
    await projectStore.createProject(form.value)
    showModal.value = false
    form.value = { name: '', clientId: '', hourlyRate: '', deadline: '', color: '#6366f1', icon: '📁', description: '', visibility: 'PUBLIC' }
  } finally {
    loading.value = false
  }
}
</script>
