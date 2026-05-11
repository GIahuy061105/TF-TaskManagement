<template>
  <AppLayout>
    <div class="p-8 max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">Khách hàng</h1>
          <p class="text-sm text-slate-500 mt-1">Quản lý danh bạ đối tác và thông tin xuất hóa đơn.</p>
        </div>
        <button
          v-if="authStore.isAdmin"
          @click="showModal = true"
          class="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5"
        >
          + Thêm đối tác
        </button>
      </div>

      <div v-if="clientStore.clients.length === 0" class="flex flex-col items-center justify-center py-24 bg-white/50 rounded-3xl border border-dashed border-slate-300">
        <div class="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-4xl mb-4">🤝</div>
        <h3 class="text-lg font-bold text-slate-800">Chưa có khách hàng</h3>
        <p class="text-slate-500 text-sm mt-1">Lưu trữ thông tin khách hàng để dễ dàng tạo hóa đơn.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div
          v-for="client in clientStore.clients"
          :key="client.id"
          class="group bg-white rounded-3xl border border-slate-100 p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col h-full relative"
        >
          <div v-if="authStore.isAdmin" class="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button @click="openEdit(client)" class="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm border border-slate-100 text-indigo-500 hover:bg-indigo-50 transition" title="Sửa">✏️</button>
            <button @click="handleDelete(client.id)" class="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm border border-slate-100 text-rose-500 hover:bg-rose-50 transition" title="Xóa">🗑</button>
          </div>

          <div class="flex items-center gap-4 mb-6">
            <div class="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-100 to-white border border-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl shrink-0 shadow-sm">
              {{ (client.company || client.name).charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0 pr-12">
              <h3 class="font-bold text-slate-900 text-lg truncate">{{ client.company || client.name }}</h3>
              <p v-if="client.company" class="text-xs font-semibold text-slate-500 truncate mt-0.5">ĐD: {{ client.name }}</p>
            </div>
          </div>

          <div class="space-y-3 mb-6 flex-1">
            <div class="flex items-center gap-3 text-sm text-slate-600">
              <div class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">📧</div>
              <span class="truncate font-medium">{{ client.email || '—' }}</span>
            </div>
            <div class="flex items-center gap-3 text-sm text-slate-600">
              <div class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">📞</div>
              <span class="font-medium">{{ client.phone || '—' }}</span>
            </div>
            <div class="flex items-center gap-3 text-sm text-slate-600">
              <div class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">🏛</div>
              <span class="font-medium">MST: {{ client.taxCode || '—' }}</span>
            </div>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-slate-50">
            <div class="flex items-center gap-3 text-xs font-bold text-slate-400">
              <span class="flex items-center gap-1"><span class="text-indigo-400">📁</span> {{ client._count?.projects || 0 }}</span>
              <span class="flex items-center gap-1"><span class="text-amber-400">🧾</span> {{ client._count?.invoices || 0 }}</span>
            </div>
            <span class="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-600">
              {{ client.currency }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4 backdrop-blur-sm" @click.self="closeModal">
      <div class="bg-white rounded-3xl p-8 w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
         <h3 class="text-xl font-black text-slate-900 mb-6">
          {{ editingClient ? 'Sửa thông tin Khách hàng' : 'Thêm Khách hàng mới' }}
        </h3>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div class="grid grid-cols-2 gap-5">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Người đại diện *</label>
              <input v-model="form.name" type="text" placeholder="Nguyễn Văn A" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition text-sm font-medium" required />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
              <input v-model="form.email" type="email" placeholder="client@example.com" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition text-sm font-medium" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-5">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Số điện thoại</label>
              <input v-model="form.phone" type="text" placeholder="0909..." class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition text-sm font-medium" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tiền tệ mặc định</label>
              <select v-model="form.currency" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition text-sm font-bold text-slate-700">
                <option value="VND">VND</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tên Công ty (Để xuất HĐ)</label>
            <input v-model="form.company" type="text" placeholder="Công ty TNHH ABC" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition text-sm font-medium" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Địa chỉ xuất hóa đơn</label>
            <input v-model="form.address" type="text" placeholder="Số 1, Đường ABC, Quận XYZ..." class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition text-sm font-medium" />
          </div>

          <div class="grid grid-cols-2 gap-5 border-t border-slate-100 pt-5">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mã số thuế (DN)</label>
              <input v-model="form.taxCode" type="text" placeholder="0312345678" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition text-sm font-medium" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Số CCCD (Cá nhân)</label>
              <input v-model="form.personalId" type="text" placeholder="079..." class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition text-sm font-medium" />
            </div>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="button" @click="closeModal" class="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition">Hủy</button>
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
