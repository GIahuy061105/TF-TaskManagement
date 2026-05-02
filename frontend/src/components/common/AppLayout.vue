<template>
  <div class="flex min-h-screen bg-slate-50">
    <!-- Sidebar -->
    <aside class="w-56 bg-white border-r border-slate-200 flex flex-col fixed h-full z-30">
      <!-- Logo -->
      <div class="px-5 py-5 border-b border-slate-100">
        <span class="text-lg font-bold text-slate-900">Task<span class="text-indigo-500">Flow</span></span>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-3 py-4 space-y-1">
        <p class="text-xs font-semibold text-slate-400 uppercase tracking-widest px-2 mb-2">Workspace</p>

        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          :class="isActive(item.to)
            ? 'bg-indigo-50 text-indigo-600'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'"
        >
          <span class="text-base">{{ item.icon }}</span>
          {{ item.label }}
        </RouterLink>

        <div class="pt-4">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-widest px-2 mb-2">Account</p>
          <RouterLink
            to="/settings"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all"
          >
            <span class="text-base">⚙️</span> Settings
          </RouterLink>
        </div>
      </nav>

      <!-- User -->
      <div class="px-3 py-6 border-t border-slate-100 mt-auto">
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
          <!-- Hàng trên: Avatar và Nút Logout -->
          <div class="flex items-center justify-between mb-3">
            <div v-if="authStore.user?.avatarUrl" class="w-10 h-10 rounded-xl overflow-hidden shadow-sm">
              <img :src="authStore.user.avatarUrl" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-base font-bold shadow-sm">
              {{ initial }}
            </div>

            <button
              @click="handleLogout"
              class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Đăng xuất"
            >
              <span class="text-xl">↩</span>
            </button>
          </div>
          <div class="space-y-1">
            <p class="text-sm font-bold text-slate-900 truncate">
              {{ authStore.user?.fullName }}
            </p>
            <div class="mt-2 pt-2 border-t border-slate-200">
              <p class="text-[10px] font-black text-indigo-600 uppercase tracking-wider mb-0.5">
                Workspace
              </p>
              <p class="text-xs font-medium text-slate-600 leading-tight break-words">
                {{ authStore.activeWorkspace?.name || 'Đang tải...' }}
              </p>
              <span class="inline-block mt-1 text-[9px] px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded font-bold uppercase">
                {{ authStore.displayRole }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 ml-56 min-h-screen">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const navItems = [
  { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { to: '/projects', icon: '◫', label: 'Projects' },
  { to: '/clients', icon: '◎', label: 'Clients' },
  { to: '/invoices', icon: '≡', label: 'Invoices' }
]

const initial = computed(() => {
  const name = authStore.user?.fullName || 'User'
  return name.charAt(0).toUpperCase()
})
function isActive(path) {
  return route.path === path || route.path.startsWith(path + '/')
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>
