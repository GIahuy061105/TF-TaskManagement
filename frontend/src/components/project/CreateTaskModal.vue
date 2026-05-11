<template>
  <div
    class="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
      <div class="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
        <h3 class="text-xl font-black text-slate-900">Thêm Task mới ✨</h3>
        <button @click="$emit('close')" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 font-bold text-xl transition">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-8 space-y-6">
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tiêu đề công việc</label>
          <input v-model="form.title" type="text" placeholder="Ví dụ: Thiết kế UI trang chủ..." class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition text-sm outline-none font-medium text-slate-800" required />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mô tả chi tiết</label>
          <textarea v-model="form.description" rows="3" placeholder="Nhập chi tiết yêu cầu công việc..." class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition text-sm resize-none outline-none font-medium text-slate-800" />
        </div>

        <div class="grid grid-cols-2 gap-6">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Độ ưu tiên</label>
            <select v-model="form.priority" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none text-sm font-bold text-slate-700 bg-white cursor-pointer">
              <option value="LOW">Thấp</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="HIGH">Cao</option>
              <option value="URGENT">Khẩn cấp</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Hạn chót</label>
            <input v-model="form.dueDate" type="date" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none text-sm font-medium text-slate-600" />
          </div>

          <div class="col-span-2 md:col-span-1">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Người thực hiện</label>
            <div class="max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50/50 space-y-1 custom-scrollbar">
              <label
                v-for="member in members"
                :key="member.userId"
                class="flex items-center gap-3 p-2.5 hover:bg-white rounded-lg cursor-pointer transition border border-transparent hover:border-slate-200 hover:shadow-sm"
              >
                <input type="checkbox" :value="member.userId" v-model="form.assigneeIds" class="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                <div class="flex items-center gap-2.5">
                  <div class="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center text-[10px] font-black text-indigo-700 shadow-sm border border-slate-100">
                    {{ member.user.fullName.charAt(0).toUpperCase() }}
                  </div>
                  <span class="text-sm font-semibold text-slate-700">{{ member.user.fullName }}</span>
                </div>
              </label>
            </div>
          </div>

          <div class="col-span-2 md:col-span-1">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Thời gian ước tính</label>
            <div class="relative">
              <input v-model="form.estimatedMins" type="number" placeholder="120" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none text-sm pr-12 font-medium text-slate-800" />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">phút</span>
            </div>
          </div>
        </div>

        <div class="flex gap-4 pt-6 border-t border-slate-100">
          <button type="button" @click="$emit('close')" class="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition">Hủy bỏ</button>
          <button type="submit" :disabled="loading" class="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-bold transition shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50">
            {{ loading ? 'Hệ thống đang xử lý...' : 'Tạo Task' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  members: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'submit'])

const form = ref({
  title: '',
  description: '',
  priority: 'MEDIUM',
  dueDate: '',
  assigneeIds: [],
  estimatedMins: ''
})

function handleSubmit() {
  const payload = { ...form.value }
  if (!payload.dueDate) delete payload.dueDate
  if (!payload.estimatedMins) delete payload.estimatedMins
  emit('submit', payload)
  form.value = { title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeIds: [], estimatedMins: '' }
}
</script>
