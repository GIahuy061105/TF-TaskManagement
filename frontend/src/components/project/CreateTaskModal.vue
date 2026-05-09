<template>
  <div
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
      <div class="p-6 border-b border-slate-100">
        <h3 class="text-lg font-bold text-slate-900">Thêm task mới</h3>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tiêu đề</label>
          <input v-model="form.title" type="text" placeholder="Thiết kế UI trang chủ..." class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition text-sm outline-none" required />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mô tả chi tiết</label>
          <textarea v-model="form.description" rows="3" placeholder="Nhập chi tiết công việc..." class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 transition text-sm resize-none outline-none" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Độ ưu tiên</label>
            <select v-model="form.priority" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm bg-white">
              <option value="LOW">Thấp</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="HIGH">Cao</option>
              <option value="URGENT">Khẩn cấp</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Hạn chót</label>
            <input v-model="form.dueDate" type="date" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Người thực hiện</label>
            <div class="max-h-32 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-white space-y-1">
              <label
                v-for="member in members"
                :key="member.userId"
                class="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition"
              >
                <input type="checkbox" :value="member.userId" v-model="form.assigneeIds" class="w-4 h-4 text-indigo-600 rounded border-slate-300" />
                <div class="flex items-center gap-2">
                  <div class="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                    {{ member.user.fullName.charAt(0).toUpperCase() }}
                  </div>
                  <span class="text-sm font-semibold text-slate-700">{{ member.user.fullName }}</span>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Thời gian ước tính</label>
            <div class="relative">
              <input v-model="form.estimatedMins" type="number" placeholder="120" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm pr-12" />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">phút</span>
            </div>
          </div>
        </div>

        <div class="flex gap-3 pt-4 border-t border-slate-100">
          <button type="button" @click="$emit('close')" class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition">Hủy</button>
          <button type="submit" :disabled="loading" class="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition disabled:opacity-50">
            {{ loading ? 'Đang tạo...' : 'Tạo Task' }}
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
