<template>
  <div
    class="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/70 flex items-center justify-center z-50 px-4 backdrop-blur-sm transition-colors"
    @click.self="$emit('close')"
  >
    <div class="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col border border-transparent dark:border-slate-700 transition-colors">
      <div class="px-8 py-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between transition-colors">
        <h3 class="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 transition-colors">
            Thêm Task Mới <BaseIcon :path="mdiCreation" size="22" class="text-amber-400" />
        </h3>
        <button @click="$emit('close')" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold text-xl transition-colors">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-8 space-y-6">
        <div>
          <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">Tiêu đề công việc</label>
          <input v-model="form.title" type="text" placeholder="Ví dụ: Thiết kế UI trang chủ..." class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition text-sm outline-none font-medium" required />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">Mô tả chi tiết</label>
          <textarea v-model="form.description" rows="3" placeholder="Nhập chi tiết yêu cầu công việc..." class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition text-sm resize-none outline-none font-medium" />
        </div>

        <div class="grid grid-cols-2 gap-6">
          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">Độ ưu tiên</label>
            <select v-model="form.priority" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none text-sm font-bold cursor-pointer transition-colors">
              <option value="LOW">Thấp</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="HIGH">Cao</option>
              <option value="URGENT">Khẩn cấp</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">Hạn chót</label>
            <input v-model="form.dueDate" type="date" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none text-sm font-medium transition-colors" />
          </div>

          <div class="col-span-2 md:col-span-1">
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">Người thực hiện</label>
            <div class="max-h-36 overflow-y-auto border border-slate-200 dark:border-slate-600 rounded-xl p-2 bg-slate-50/50 dark:bg-slate-900/50 space-y-1 custom-scrollbar transition-colors">
              <label
                v-for="member in members"
                :key="member.userId"
                class="flex items-center gap-3 p-2.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg cursor-pointer transition border border-transparent hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm"
              >
                <input type="checkbox" :value="member.userId" v-model="form.assigneeIds" class="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-500 focus:ring-indigo-500" />
                <div class="flex items-center gap-2.5">
                  <div class="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-100 to-white dark:from-indigo-900/50 dark:to-slate-800 flex items-center justify-center text-[10px] font-black text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-100 dark:border-slate-700">
                    {{ member.user.fullName.charAt(0).toUpperCase() }}
                  </div>
                  <span class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ member.user.fullName }}</span>
                </div>
              </label>
            </div>
          </div>

          <div class="col-span-2 md:col-span-1">
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">Thời gian ước tính</label>
            <div class="relative">
              <input v-model="form.estimatedMins" type="number" placeholder="120" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none text-sm pr-12 font-medium transition-colors" />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">phút</span>
            </div>
          </div>
        </div>

        <div class="flex gap-4 pt-6 border-t border-slate-100 dark:border-slate-700 transition-colors">
          <button type="button" @click="$emit('close')" class="flex-1 py-3.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Hủy bỏ</button>
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
import BaseIcon from '@/components/icon/BaseIcon.vue'
import { mdiClose, mdiCreation } from '@mdi/js'
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
  if (payload.estimatedMins) {
    payload.estimatedMins = parseInt(payload.estimatedMins)
  } else {
    delete payload.estimatedMins
  }
  if (!payload.dueDate) delete payload.dueDate
  emit('submit', payload)
  form.value = { title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeIds: [], estimatedMins: '' }
}
</script>
