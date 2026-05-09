<template>
  <div
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <span
          class="text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider"
          :class="{
            'bg-slate-200 text-slate-600': task.status === 'TODO',
            'bg-blue-100 text-blue-600': task.status === 'IN_PROGRESS',
            'bg-emerald-100 text-emerald-600': task.status === 'DONE'
          }"
        >
          {{ task.status.replace('_', ' ') }}
        </span>

        <div class="flex items-center gap-3">
          <button
            v-if="!isEditing && isAdmin"
            @click="isEditing = true"
            class="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition"
          >
            ✏️ Chỉnh sửa
          </button>

          <button
            v-if="!isAdmin && task.status !== 'DONE' && !task.isPendingApproval"
            @click="$emit('request-approval', task)"
            class="bg-amber-100 text-amber-700 hover:bg-amber-200 text-xs font-bold px-3 py-1.5 rounded-lg transition"
          >
            ⏳ Gửi yêu cầu duyệt
          </button>

          <span v-if="task.isPendingApproval && !isAdmin" class="text-xs font-bold text-amber-500 italic">
            (Đang chờ Admin duyệt...)
          </span>

          <button
            v-if="isAdmin && task.isPendingApproval"
            @click="$emit('approve-task', task)"
            class="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-sm"
          >
            ✅ Phê duyệt Task này
          </button>

          <button
            v-if="isAdmin"
            @click="$emit('delete-task', task)"
            class="text-red-400 hover:text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
          >
            🗑 Xóa
          </button>

          <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 font-bold text-2xl leading-none">&times;</button>
        </div>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto">

        <!-- View mode -->
        <div v-if="!isEditing" class="space-y-4">
          <h2 class="text-2xl font-bold text-slate-900">{{ task.title }}</h2>

          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Người thực hiện</p>
            <div class="flex flex-wrap gap-2" v-if="task.assignees?.length">
              <div
                v-for="assignee in task.assignees"
                :key="assignee.userId"
                class="flex items-center gap-2 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100"
              >
                <div class="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-[10px] font-bold">
                  {{ assignee.user.fullName.charAt(0).toUpperCase() }}
                </div>
                <span class="text-xs font-semibold text-slate-700">{{ assignee.user.fullName }}</span>
              </div>
            </div>
            <p v-else class="text-sm font-semibold text-slate-400 italic">Chưa giao</p>
          </div>

          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Hạn chót</p>
            <p class="text-sm font-semibold text-slate-700">
              {{ task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : 'Không có' }}
            </p>
          </div>

          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Độ ưu tiên</p>
            <span
              class="text-[10px] px-2 py-0.5 rounded-md font-black tracking-wider uppercase"
              :class="{
                'bg-red-50 text-red-600': task.priority === 'HIGH' || task.priority === 'URGENT',
                'bg-amber-50 text-amber-600': task.priority === 'MEDIUM',
                'bg-slate-200 text-slate-600': task.priority === 'LOW'
              }"
            >
              {{ task.priority }}
            </span>
          </div>

          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Thời gian ước tính</p>
            <p class="text-sm font-semibold text-slate-700">
              {{ task.estimatedMins ? `${task.estimatedMins} phút` : 'Chưa ước lượng' }}
            </p>
          </div>

          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase mb-2">Mô tả chi tiết</p>
            <div class="text-slate-600 text-sm whitespace-pre-wrap bg-white border border-slate-200 p-4 rounded-xl min-h-[100px]">
              {{ task.description || 'Chưa có mô tả cho công việc này.' }}
            </div>
          </div>
        </div>

        <!-- Edit mode -->
        <form v-else @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tiêu đề</label>
            <input v-model="form.title" type="text" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm font-semibold text-slate-800" required />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mô tả chi tiết</label>
            <textarea v-model="form.description" rows="3" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm resize-none"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Trạng thái</label>
              <select v-model="form.status" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm bg-white">
                <option value="TODO">Cần làm</option>
                <option value="IN_PROGRESS">Đang làm</option>
                <option value="DONE">Hoàn thành</option>
              </select>
            </div>

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
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Thời gian ước tính</label>
              <div class="relative">
                <input v-model="form.estimatedMins" type="number" placeholder="120" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm pr-12" />
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">phút</span>
              </div>
            </div>
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

          <div class="flex gap-3 pt-4 border-t border-slate-100">
            <button type="button" @click="isEditing = false" class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition">Hủy</button>
            <button type="submit" :disabled="loading" class="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition disabled:opacity-50">
              {{ loading ? 'Đang lưu...' : 'Lưu thay đổi' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  task: { type: Object, required: true },
  members: { type: Array, default: () => [] },
  isAdmin: { type: Boolean, default: false },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'update', 'delete-task', 'request-approval', 'approve-task'])

const isEditing = ref(false)
const form = ref({})

watch(() => props.task, (val) => {
  form.value = {
    ...val,
    dueDate: val.dueDate ? val.dueDate.split('T')[0] : '',
    assigneeIds: val.assignees?.map(a => a.userId) || []
  }
}, { immediate: true })

function handleSubmit() {
  const payload = { ...form.value }
  if (!payload.dueDate) delete payload.dueDate
  if (!payload.estimatedMins) payload.estimatedMins = null
  emit('update', payload)
  isEditing.value = false
}
</script>
