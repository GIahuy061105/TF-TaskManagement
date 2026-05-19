<template>
  <AppLayout>
    <div class="p-8 max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-black text-slate-900 dark:text-white transition-colors tracking-tight">Khách hàng</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Quản lý danh bạ đối tác và thông tin xuất hóa đơn.</p>
        </div>
        <button
          v-if="authStore.isAdmin"
          @click="showModal = true"
          class="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-200 dark:shadow-indigo-900/20 hover:shadow-lg hover:-translate-y-0.5"
        >
          + Thêm đối tác
        </button>
      </div>

      <div v-if="clientStore.clients.length === 0" class="flex flex-col items-center justify-center py-24 bg-white/50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 transition-colors">
        <div class="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-500 dark:text-indigo-400 mb-4 transition-colors">
          <BaseIcon :path="mdiHandshakeOutline" size="40"/>
        </div>
        <h3 class="text-lg font-bold text-slate-800 dark:text-slate-200 transition-colors">Chưa có khách hàng</h3>
        <p class="text-slate-500 dark:text-slate-400 text-sm mt-1 transition-colors">Lưu trữ thông tin khách hàng để dễ dàng tạo hóa đơn.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div
          v-for="client in clientStore.clients"
          :key="client.id"
          class="group bg-white dark:bg-slate-800 rounded-3xl border border-slate-500 dark:border-slate-700 p-6 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 flex flex-col h-full relative"
        >
          <div v-if="authStore.isAdmin" class="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button @click="openEdit(client)" class="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-600 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors" title="Sửa"><BaseIcon :path="mdiPencil" size="20"/></button>
            <button @click="handleDelete(client.id)" class="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-600 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors" title="Xóa"><BaseIcon :path="mdiTrashCan" size="20"/></button>
          </div>

          <div class="flex items-center gap-4 mb-6">
            <div class="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-100 dark:from-indigo-900/50 to-white dark:to-slate-800 border border-indigo-50 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xl shrink-0 shadow-sm transition-colors">
              {{ (client.company || client.name).charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0 pr-12">
              <h3 class="font-bold text-slate-900 dark:text-white text-lg truncate transition-colors">{{ client.company || client.name }}</h3>
              <p v-if="client.company" class="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate mt-0.5 transition-colors">ĐD: {{ client.name }}</p>
            </div>
          </div>

          <div class="space-y-3 mb-6 flex-1">
            <div class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 transition-colors">
              <div class="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0 transition-colors"><BaseIcon :path="mdiEmail" size="20"/></div>
              <span class="truncate font-medium">{{ client.email || '—' }}</span>
            </div>
            <div class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 transition-colors">
              <div class="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0 transition-colors"><BaseIcon :path="mdiPhone" size="20"/></div>
              <span class="font-medium">{{ client.phone || '—' }}</span>
            </div>
            <div class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 transition-colors">
              <div class="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0 transition-colors"><BaseIcon :path="mdiTownHall" size="20"/></div>
              <span class="font-medium">MST: {{ client.taxCode || '—' }}</span>
            </div>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700 transition-colors">
            <div class="flex items-center gap-3 text-xs font-bold text-slate-400 dark:text-slate-500 transition-colors">
              <span class="flex items-center gap-1"><span class="text-indigo-400"><BaseIcon :path="mdiFolder" size="17"/></span> {{ client._count?.projects || 0 }}</span>
              <span class="flex items-center gap-1"><span class="text-amber-400"><BaseIcon :path="mdiInvoice" size="17"/></span> {{ client._count?.invoices || 0 }}</span>
            </div>
            <span class="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 transition-colors">
              {{ client.currency }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/60 flex items-center justify-center z-50 px-4 backdrop-blur-sm transition-colors" @click.self="closeModal">
      <div class="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar border border-transparent dark:border-slate-700 transition-colors">
         <h3 class="text-xl font-black text-slate-900 dark:text-white mb-6 transition-colors">
          {{ editingClient ? 'Sửa thông tin Khách hàng' : 'Thêm Khách hàng mới' }}
        </h3>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div class="grid grid-cols-2 gap-5">
            <div>
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">Người đại diện *</label>
              <input v-model="form.name" type="text" placeholder="Nguyễn Văn A" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 outline-none transition-colors text-sm font-medium" required />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">Email</label>
              <input v-model="form.email" type="email" placeholder="client@example.com" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 outline-none transition-colors text-sm font-medium" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-5">
            <div>
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">Số điện thoại</label>
              <input v-model="form.phone" type="text" placeholder="0909..." class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 outline-none transition-colors text-sm font-medium" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">Tiền tệ mặc định</label>
              <select v-model="form.currency" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 outline-none transition-colors text-sm font-bold">
                <option value="VND">VND</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">Tên Công ty (Để xuất HĐ)</label>
            <input v-model="form.company" type="text" placeholder="Công ty TNHH ABC" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 outline-none transition-colors text-sm font-medium" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">Địa chỉ xuất hóa đơn</label>
            <input v-model="form.address" type="text" placeholder="Số 1, Đường ABC, Quận XYZ..." class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 outline-none transition-colors text-sm font-medium" />
          </div>

          <div class="grid grid-cols-2 gap-5 border-t border-slate-100 dark:border-slate-700 pt-5 transition-colors">
            <div>
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">Mã số thuế (DN)</label>
              <input v-model="form.taxCode" type="text" placeholder="0312345678" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 outline-none transition-colors text-sm font-medium" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">Số CCCD (Cá nhân)</label>
              <input v-model="form.personalId" type="text" placeholder="079..." class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 outline-none transition-colors text-sm font-medium" />
            </div>
          </div>
          <div class="flex gap-3 pt-4">
            <button type="button" @click="closeModal" class="flex-1 py-3.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Hủy</button>
            <button type="submit" :disabled="loading" class="flex-1 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition shadow-md hover:shadow-lg disabled:opacity-50">
              {{ loading ? 'Đang lưu...' : (editingClient ? 'Cập nhật' : 'Lưu khách hàng') }}
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
import { mdiHandshakeOutline , mdiEmail , mdiPhone , mdiTownHall , mdiFolder ,mdiInvoice , mdiTrashCan, mdiPencil} from '@mdi/js'
import BaseIcon from '@/components/icon/BaseIcon.vue'


const router = useRouter()
const authStore = useAuthStore()
const clientStore = useClientStore()

const showModal = ref(false)
const loading = ref(false)
const editingClient = ref(null)

const defaultForm = { name: '', email: '', phone: '', company: '', address: '', taxCode: '', personalId: '', currency: 'VND' }
const form = ref({ ...defaultForm })

onMounted(() => clientStore.fetchClients())

function openEdit(client) {
  editingClient.value = client
  form.value = {
    name: client.name,
    email: client.email || '',
    phone: client.phone || '',
    company: client.company || '',
    address: client.address || '',
    taxCode: client.taxCode || '',
    personalId: client.personalId || '',
    currency: client.currency || 'VND'
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingClient.value = null
  form.value = { ...defaultForm }
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
  if (!confirm('Bạn chắc chắn muốn xóa khách hàng này? Mọi hóa đơn liên quan cũng sẽ bị xóa.')) return
  await clientStore.deleteClient(id)
}
</script>
