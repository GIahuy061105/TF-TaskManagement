<template>
  <div class="flex min-h-screen bg-slate-50">
    <!-- Sidebar -->
    <aside class="w-56 bg-white border-r border-slate-200 flex flex-col fixed h-full z-30">
      <!-- Logo & Notification -->
      <div class="px-5 py-5 border-b border-slate-100 flex justify-between items-center ">
        <span class="text-lg font-bold text-slate-900">Task<span class="text-indigo-500">Flow</span></span>
        <button v-if="invitations.length > 0" @click="showInviteModal = true" class="relative p-1">
                  <span class="text-lg">🔔</span>
                  <span class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
      </div>


      <!-- Nav -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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
        <div class="mt-4 pt-4 border-t border-slate-200">
          <button
            @click="showInviteForm = true"
            class="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <span>+</span> Mời thành viên
          </button>
        </div>

        <div v-if="showInviteForm" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 class="font-bold text-lg text-slate-900 mb-4">Mời vào Workspace</h3>

            <div class="space-y-4">
              <div>
                <label class="text-[10px] font-bold text-slate-400 uppercase">Email người nhận</label>
                <input
                  v-model="inviteEmail"
                  type="email"
                  placeholder="email@example.com"
                  class="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label class="text-[10px] font-bold text-slate-400 uppercase">Vai trò</label>
                <select
                  v-model="inviteRole"
                  class="mt-1 px-3 py-2 bg-slate-100 text-slate-600 text-sm rounded-lg font-medium"
                >
                  <option value="MEMBER"> MEMBER (Thành viên) </option>
                  <option value="VIEWER"> VIEWER (Người xem) </option>
                  </select>
              </div>

              <div class="flex gap-3 pt-2">
                <button
                  @click="handleSendInvite"
                  :disabled="isSending"
                  class="flex-1 bg-indigo-600 text-white py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:bg-slate-300"
                >
                  {{ isSending ? 'Đang gửi...' : 'Gửi lời mời' }}
                </button>
                <button
                  @click="showInviteForm = false"
                  class="px-4 py-2 text-slate-500 font-medium text-sm hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>

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
        <!--  Workspace (Switcher) -->
                  <div class="mb-4">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      Chuyển không gian làm việc
                    </label>
                    <select
                      :value="authStore.activeWorkspace?.id"
                      @change="e => authStore.switchWorkspace(e.target.value)"
                      class="w-full text-xs bg-white border border-slate-200 rounded-lg p-1.5 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                    >
                      <option v-for="ws in authStore.workspaces" :key="ws.id" :value="ws.id">
                        {{ ws.name }} ({{ ws.role }})
                      </option>
                    </select>
                  </div>
          <!-- Avatar và Nút Logout -->
          <div class="flex items-center justify-between mb-3 pt-3 border-t border-slate-200">
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
            <div class="mt-2">
              <p class="text-[10px] font-black text-indigo-600 uppercase tracking-wider mb-0.5">
                Workspace
              </p>
              <p class="text-xs font-medium text-slate-600 leading-tight break-words mb-1">
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
    <!-- Invitation -->
        <div v-if="showInviteModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-bold text-lg text-slate-900">Lời mời tham gia</h3>
              <button @click="showInviteModal = false" class="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>

            <div class="space-y-3 max-h-96 overflow-y-auto pr-1">
              <div
                v-for="invite in invitations"
                :key="invite.id"
                class="p-4 border border-slate-100 rounded-xl flex items-center justify-between bg-slate-50"
              >
                <div class="min-w-0 flex-1 mr-3">
                  <p class="text-sm font-bold">{{ invite.workspace?.name }}</p>
                      <p class="text-[10px] text-slate-500 italic">
                        Được mời bởi: {{ invite.inviter?.fullName || 'Người dùng hệ thống' }}
                      </p>
                  <p class="text-[10px] text-slate-500 uppercase font-semibold">Quyền: {{ invite.role }}</p>
                </div>

                <div class="flex gap-2 shrink-0">
                  <button
                    @click="acceptInvite(invite.token)"
                    class="bg-indigo-600 text-white text-[10px] px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-700 transition shadow-sm"
                  >
                    Chấp nhận
                  </button>
                  <button
                    @click="declineInvite(invite.token)"
                    class="bg-white border border-slate-200 text-slate-600 text-[10px] px-3 py-1.5 rounded-lg font-bold hover:bg-slate-50 transition"
                  >
                    Từ chối
                  </button>
                </div>
              </div>

              <div v-if="invitations.length === 0" class="text-center py-8">
                <p class="text-slate-400 text-sm italic">Không có lời mời nào đang chờ xử lý</p>
              </div>
            </div>
          </div>
        </div>

    <!-- Main content -->
    <main class="flex-1 ml-56 min-h-screen">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store.js'
import api from '@/api/index.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const invitations = ref([])
const showInviteModal = ref(false)
const navItems = computed(() => {
  const allItems = [
    { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
    { to: '/projects', icon: '◫', label: 'Projects' },
    { to: '/clients', icon: '◎', label: 'Clients' },
    { to: '/invoices', icon: '≡', label: 'Invoices', adminOnly: true }
  ]
  return allItems.filter(item => !item.adminOnly || authStore.isAdmin)
})
const showInviteForm = ref(false)
const inviteEmail = ref('')
const inviteRole = ref('MEMBER')
const isSending = ref(false)
onMounted(async () => {
  try {
    const res = await api.get('/my-invitations')
    invitations.value = res.data
  } catch (err) {
    console.error('Không thể lấy danh sách lời mời:', err)
  }
})
const initial = computed(() => {
  const name = authStore.user?.fullName || 'User'
  return name.charAt(0).toUpperCase()
})
function isActive(path) {
  return route.path === path || route.path.startsWith(path + '/')
}
async function acceptInvite(token) {
  try {
    await api.post(`/invitations/${token}/accept`)
    await authStore.checkAuth()
    alert('Đã gia nhập Workspace mới!')
    showInviteModal.value = false
    window.location.reload()
  } catch (err) {
    alert(err.response?.data?.message || 'Lỗi khi chấp nhận')
  }
}
async function declineInvite(token) {
  try {
    await api.post(`/invitations/${token}/decline`)
    invitations.value = invitations.value.filter(i => i.token !== token)
    if (invitations.value.length === 0) {
      showInviteModal.value = false
    }
  } catch (err) {
    alert(err.response?.data?.message || 'Lỗi khi từ chối lời mời')
  }
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
async function handleSendInvite() {
  if (!inviteEmail.value) return alert('Vui lòng nhập email')

  isSending.value = true
  try {
    await api.post('/workspace/invite', {
      email: inviteEmail.value,
      role: inviteRole.value
    })
    alert('Đã gửi lời mời thành công!')
    inviteEmail.value = ''
    inviteRole.value = 'MEMBER'
    showInviteForm.value = false
  } catch (err) {
    alert(err.response?.data?.message || 'Không thể gửi lời mời')
  } finally {
    isSending.value = false
  }
}
</script>
