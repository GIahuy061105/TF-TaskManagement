<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <RouterLink to="/dashboard" class="text-xl font-bold text-indigo-600">TaskFlow</RouterLink>
        <span class="text-gray-300">/</span>
        <span class="text-gray-600 font-medium">Invoices</span>
      </div>
      <button @click="handleLogout" class="text-sm text-gray-500 hover:text-red-500 transition">
        Đăng xuất
      </button>
    </nav>

    <div class="max-w-6xl mx-auto px-6 py-8">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Invoices</h2>
        <button
          @click="showModal = true"
          class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition"
        >
          + Tạo invoice
        </button>
      </div>

      <!-- Summary cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div class="bg-white rounded-2xl border border-gray-200 p-6">
          <p class="text-sm text-gray-500 mb-1">Chờ thanh toán</p>
          <p class="text-2xl font-bold text-amber-500">
            ${{ totalByStatus('sent') }}
          </p>
        </div>
        <div class="bg-white rounded-2xl border border-gray-200 p-6">
          <p class="text-sm text-gray-500 mb-1">Đã thanh toán</p>
          <p class="text-2xl font-bold text-green-500">
            ${{ totalByStatus('paid') }}
          </p>
        </div>
        <div class="bg-white rounded-2xl border border-gray-200 p-6">
          <p class="text-sm text-gray-500 mb-1">Tổng invoices</p>
          <p class="text-2xl font-bold text-gray-900">{{ invoiceStore.invoices.length }}</p>
        </div>
      </div>

      <!-- Invoice list -->
      <div v-if="invoiceStore.invoices.length === 0" class="text-center py-20 text-gray-400">
        Chưa có invoice nào. Tạo invoice đầu tiên ngay!
      </div>

      <div v-else class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100 text-left">
              <th class="px-6 py-4 text-xs font-medium text-gray-400 uppercase">Số</th>
              <th class="px-6 py-4 text-xs font-medium text-gray-400 uppercase">Client</th>
              <th class="px-6 py-4 text-xs font-medium text-gray-400 uppercase">Tổng tiền</th>
              <th class="px-6 py-4 text-xs font-medium text-gray-400 uppercase">Trạng thái</th>
              <th class="px-6 py-4 text-xs font-medium text-gray-400 uppercase">Ngày tạo</th>
              <th class="px-6 py-4 text-xs font-medium text-gray-400 uppercase">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="invoice in invoiceStore.invoices"
              :key="invoice.id"
              class="border-b border-gray-50 hover:bg-gray-50 transition"
            >
              <td class="px-6 py-4 text-sm font-medium text-gray-900">
                {{ invoice.invoiceNumber }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ invoice.client?.name }}
              </td>
              <td class="px-6 py-4 text-sm font-medium text-gray-900">
                ${{ Number(invoice.total).toFixed(2) }}
              </td>
              <td class="px-6 py-4">
                <span
                  class="text-xs font-medium px-2.5 py-1 rounded-full"
                  :class="{
                    'bg-gray-100 text-gray-500': invoice.status === 'draft',
                    'bg-amber-100 text-amber-600': invoice.status === 'sent',
                    'bg-green-100 text-green-600': invoice.status === 'paid'
                  }"
                >
                  {{ statusLabel(invoice.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-400">
                {{ new Date(invoice.createdAt).toLocaleDateString('vi-VN') }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <button
                    v-if="invoice.status === 'draft'"
                    @click="handleSend(invoice.id)"
                    class="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition font-medium"
                  >
                    Gửi
                  </button>
                  <button
                    v-if="invoice.status === 'sent'"
                    @click="handleMarkPaid(invoice.id)"
                    class="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition font-medium"
                  >
                    Đã nhận tiền
                  </button>
                  <button
                    v-if="invoice.status === 'draft'"
                    @click="handleDelete(invoice.id)"
                    class="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition"
                  >
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal tạo invoice -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      @click.self="showModal = false"
    >
      <div class="bg-white rounded-2xl p-8 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-bold text-gray-900 mb-6">Tạo invoice mới</h3>

        <form @submit.prevent="handleCreate" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <select
              v-model="form.clientId"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 transition text-sm"
              required
            >
              <option value="">Chọn client</option>
              <option v-for="client in clientStore.clients" :key="client.id" :value="client.id">
                {{ client.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Deadline thanh toán</label>
            <input
              v-model="form.dueDate"
              type="date"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 transition text-sm"
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium text-gray-700">Danh mục dịch vụ</label>
              <button
                type="button"
                @click="addLineItem"
                class="text-xs text-indigo-600 hover:underline font-medium"
              >
                + Thêm dòng
              </button>
            </div>

            <div class="space-y-3">
              <div
                v-for="(item, index) in form.lineItems"
                :key="index"
                class="grid grid-cols-12 gap-2"
              >
                <input
                  v-model="item.description"
                  placeholder="Mô tả dịch vụ"
                  class="col-span-6 px-3 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 transition text-sm"
                  required
                />
                <input
                  v-model.number="item.quantity"
                  type="number"
                  min="1"
                  placeholder="SL"
                  class="col-span-2 px-3 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 transition text-sm"
                  required
                />
                <input
                  v-model.number="item.unitPrice"
                  type="number"
                  min="0"
                  placeholder="Giá"
                  class="col-span-3 px-3 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 transition text-sm"
                  required
                />
                <button
                  type="button"
                  @click="removeLineItem(index)"
                  class="col-span-1 text-red-400 hover:text-red-600 text-lg font-medium"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Thuế (%)</label>
            <input
              v-model.number="form.taxRate"
              type="number"
              min="0"
              max="100"
              placeholder="0"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 transition text-sm"
            />
          </div>

          <!-- Preview tổng tiền -->
          <div class="bg-gray-50 rounded-xl p-4 space-y-2">
            <div class="flex justify-between text-sm text-gray-600">
              <span>Tạm tính</span>
              <span>${{ subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm text-gray-600">
              <span>Thuế ({{ form.taxRate }}%)</span>
              <span>${{ tax.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-200 pt-2">
              <span>Tổng cộng</span>
              <span>${{ total.toFixed(2) }}</span>
            </div>
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
              {{ loading ? 'Đang tạo...' : 'Tạo invoice' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store.js'
import { useInvoiceStore } from '@/stores/invoice.store.js'
import { useClientStore } from '@/stores/client.store.js'

const router = useRouter()
const authStore = useAuthStore()
const invoiceStore = useInvoiceStore()
const clientStore = useClientStore()

const showModal = ref(false)
const loading = ref(false)

const form = ref({
  clientId: '',
  dueDate: '',
  taxRate: 0,
  lineItems: [{ description: '', quantity: 1, unitPrice: 0 }]
})

onMounted(() => {
  invoiceStore.fetchInvoices()
  clientStore.fetchClients()
})

const subtotal = computed(() =>
  form.value.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
)
const tax = computed(() => (subtotal.value * form.value.taxRate) / 100)
const total = computed(() => subtotal.value + tax.value)

function totalByStatus(status) {
  return invoiceStore.invoices
    .filter(i => i.status === status)
    .reduce((sum, i) => sum + Number(i.total), 0)
    .toFixed(2)
}

function statusLabel(status) {
  return { draft: 'Draft', sent: 'Đã gửi', paid: 'Đã thanh toán' }[status] || status
}

function addLineItem() {
  form.value.lineItems.push({ description: '', quantity: 1, unitPrice: 0 })
}

function removeLineItem(index) {
  if (form.value.lineItems.length > 1) {
    form.value.lineItems.splice(index, 1)
  }
}

async function handleCreate() {
  loading.value = true
  try {
    await invoiceStore.createInvoice(form.value)
    showModal.value = false
    form.value = {
      clientId: '',
      dueDate: '',
      taxRate: 0,
      lineItems: [{ description: '', quantity: 1, unitPrice: 0 }]
    }
  } finally {
    loading.value = false
  }
}

async function handleSend(id) {
  await invoiceStore.sendInvoice(id)
}

async function handleMarkPaid(id) {
  await invoiceStore.markAsPaid(id)
}

async function handleDelete(id) {
  if (!confirm('Xóa invoice này?')) return
  await invoiceStore.deleteInvoice(id)
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>
