<template>
  <div
    class="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

      <div class="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
        <span
          class="text-[10px] font-black px-3 py-1.5 rounded-md uppercase tracking-wider border"
          :class="{
            'bg-slate-50 text-slate-500 border-slate-200': task.status === 'TODO',
            'bg-blue-50 text-blue-600 border-blue-200': task.status === 'IN_PROGRESS',
            'bg-emerald-50 text-emerald-600 border-emerald-200': task.status === 'DONE'
          }"
        >
          {{ task.status.replace('_', ' ') }}
        </span>

        <div class="flex items-center gap-3">
          <button v-if="!isEditing && isAdmin" @click="isEditing = true" class="text-sm font-bold text-indigo-500 hover:text-indigo-700 transition flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-lg">
            ✏️ Sửa
          </button>

          <button v-if="!isAdmin && task.status !== 'DONE' && !task.isPendingApproval" @click="$emit('request-approval', task)" class="bg-amber-100 text-amber-700 hover:bg-amber-200 text-xs font-bold px-4 py-2 rounded-lg transition shadow-sm">
            ⏳ Gửi yêu cầu duyệt
          </button>

          <span v-if="task.isPendingApproval && !isAdmin" class="text-xs font-bold text-amber-500 italic bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
            Đang chờ Admin duyệt...
          </span>

          <button v-if="isAdmin && task.isPendingApproval" @click="$emit('approve-task', task)" class="bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-sm">
            ✅ Phê duyệt Task
          </button>

          <button v-if="isAdmin" @click="$emit('delete-task', task)" class="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-rose-500 hover:bg-rose-50 transition shadow-sm" title="Xóa task">
            🗑
          </button>

          <button @click="$emit('close')" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 font-bold text-xl transition ml-2">&times;</button>
        </div>
      </div>

      <div class="p-8 overflow-y-auto flex-1 custom-scrollbar">

        <div v-if="!isEditing" class="space-y-6">
          <h2 class="text-3xl font-black text-slate-900 tracking-tight leading-tight">{{ task.title }}</h2>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
            <div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Assignee</p>
              <div class="flex flex-wrap gap-2" v-if="task.assignees?.length">
                <div v-for="assignee in task.assignees" :key="assignee.userId" class="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                  <div class="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center text-indigo-700 text-[10px] font-black ring-1 ring-slate-100">
                    {{ assignee.user.fullName.charAt(0).toUpperCase() }}
                  </div>
                  <span class="text-xs font-bold text-slate-700">{{ assignee.user.fullName.split(' ').pop() }}</span>
                </div>
              </div>
              <p v-else class="text-sm font-semibold text-slate-400 italic">Chưa giao</p>
            </div>

            <div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Hạn chót</p>
              <p class="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <span class="text-slate-400">📅</span> {{ task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : 'Không có' }}
              </p>
            </div>

            <div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Độ ưu tiên</p>
              <span class="text-[10px] px-2.5 py-1 rounded-md font-black tracking-wider uppercase"
                :class="{'bg-rose-50 text-rose-600': task.priority === 'HIGH' || task.priority === 'URGENT', 'bg-amber-50 text-amber-600': task.priority === 'MEDIUM', 'bg-slate-200 text-slate-600': task.priority === 'LOW'}">
                {{ task.priority }}
              </span>
            </div>

            <div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ước tính</p>
              <p class="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <span class="text-slate-400">⏱</span> {{ task.estimatedMins ? `${task.estimatedMins} phút` : '—' }}
              </p>
            </div>
          </div>

          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Mô tả công việc</p>
            <div class="text-slate-700 text-sm whitespace-pre-wrap bg-white border border-slate-100 p-5 rounded-2xl min-h-[100px] leading-relaxed shadow-sm font-medium">
              {{ task.description || 'Chưa có mô tả chi tiết cho công việc này.' }}
            </div>
          </div>

          <div class="mt-10 pt-8 border-t border-slate-100">
            <h4 class="text-sm font-black text-slate-800 mb-6 uppercase tracking-wider flex items-center gap-2">
              <span class="text-indigo-500 text-lg">💬</span> Thảo luận ({{ comments.length }})
            </h4>

            <div class="space-y-5 mb-8">
              <div v-if="comments.length === 0" class="text-sm font-medium text-slate-400 text-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                Chưa có bình luận nào. Bắt đầu thảo luận ngay!
              </div>

              <div v-for="comment in comments" :key="comment.id" class="flex gap-4 group">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-white border border-slate-100 shadow-sm flex items-center justify-center text-indigo-600 font-black shrink-0 mt-1">
                  {{ comment.user?.avatarUrl ? '' : comment.user?.fullName?.charAt(0).toUpperCase() || 'U' }}
                </div>

                <div class="flex-1">
                  <div class="flex items-baseline gap-2 mb-1">
                    <span class="text-sm font-bold text-slate-800">{{ comment.user?.fullName || 'Ẩn danh' }}</span>
                    <span class="text-[10px] font-medium text-slate-400">{{ timeAgo(comment.createdAt) }}</span>
                  </div>
                  <div class="inline-block bg-slate-50 p-4 rounded-2xl rounded-tl-sm border border-slate-100 shadow-sm">
                    <p class="text-sm text-slate-700 whitespace-pre-wrap font-medium leading-relaxed">{{ comment.content }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="!authStore.isViewer" class="flex gap-4 items-start bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shadow-md text-white flex items-center justify-center font-black shrink-0">
                {{ authStore.user?.fullName?.charAt(0).toUpperCase() || 'M' }}
              </div>
              <div class="flex-1 relative">
                <textarea
                  v-model="newComment"
                  @keydown.enter.prevent="submitComment"
                  rows="2"
                  placeholder="Viết bình luận... (Nhấn Enter để gửi)"
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none text-sm resize-none pr-14 transition bg-white font-medium shadow-sm"
                  :disabled="isSubmittingComment"
                ></textarea>
                <button
                  @click="submitComment"
                  :disabled="!newComment.trim() || isSubmittingComment"
                  class="absolute right-2 bottom-2 w-9 h-9 flex items-center justify-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
                >
                  <span class="font-bold text-lg leading-none transform -rotate-45 block mb-0.5 ml-0.5">➔</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <form v-else @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tiêu đề</label>
            <input v-model="form.title" type="text" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none text-sm font-semibold text-slate-800" required />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mô tả chi tiết</label>
            <textarea v-model="form.description" rows="3" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none text-sm resize-none font-medium text-slate-700"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Trạng thái</label>
              <select v-model="form.status" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none text-sm font-bold text-slate-700 bg-white">
                <option value="TODO">Cần làm</option>
                <option value="IN_PROGRESS">Đang làm</option>
                <option value="DONE">Hoàn thành</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Độ ưu tiên</label>
              <select v-model="form.priority" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none text-sm font-bold text-slate-700 bg-white">
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

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Thời gian ước tính</label>
              <div class="relative">
                <input v-model="form.estimatedMins" type="number" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none text-sm pr-12 font-medium text-slate-800" />
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">phút</span>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Người thực hiện</label>
            <div class="max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50/50 space-y-1 custom-scrollbar">
              <label v-for="member in members" :key="member.userId" class="flex items-center gap-3 p-2.5 hover:bg-white rounded-lg cursor-pointer transition border border-transparent hover:border-slate-200 hover:shadow-sm">
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

          <div class="flex gap-4 pt-6 border-t border-slate-100">
            <button type="button" @click="isEditing = false" class="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition">Hủy bỏ</button>
            <button type="submit" :disabled="loading" class="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-bold transition shadow-md hover:shadow-lg disabled:opacity-50 hover:-translate-y-0.5">
              {{ loading ? 'Đang lưu...' : 'Lưu thay đổi' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store.js'
import { useProjectStore } from '@/stores/project.store.js'

const props = defineProps({
  task: { type: Object, required: true },
  members: { type: Array, default: () => [] },
  isAdmin: { type: Boolean, default: false },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'update', 'delete-task', 'request-approval', 'approve-task'])

const authStore = useAuthStore()
const projectStore = useProjectStore()

const isEditing = ref(false)
const form = ref({})

// Comment logic
const comments = ref([])
const newComment = ref('')
const isSubmittingComment = ref(false)

watch(() => props.task, (val) => {
  form.value = {
    ...val,
    dueDate: val.dueDate ? val.dueDate.split('T')[0] : '',
    assigneeIds: val.assignees?.map(a => a.userId) || []
  }
}, { immediate: true })

onMounted(async () => {
  if (props.task?.id) {
    await loadComments()
  }
})

async function loadComments() {
  try {
    comments.value = await projectStore.fetchComments(props.task.id)
  } catch (error) {
    console.error("Failed to load comments:", error)
  }
}

async function submitComment() {
  if (!newComment.value.trim() || isSubmittingComment.value) return

  isSubmittingComment.value = true
  try {
    const created = await projectStore.addComment(props.task.id, newComment.value)
    comments.value.push(created)
    newComment.value = ''
  } catch (err) {
    alert('Lỗi khi gửi bình luận!')
  } finally {
    isSubmittingComment.value = false
  }
}

function timeAgo(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) return 'Vừa xong'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`
  return date.toLocaleDateString('vi-VN')
}

function handleSubmit() {
  const payload = { ...form.value }
  if (!payload.dueDate) delete payload.dueDate
  if (!payload.estimatedMins) payload.estimatedMins = null
  emit('update', payload)
  isEditing.value = false
}
</script>

<style scoped>
/* Thêm scrollbar tùy chỉnh cho đẹp (Tùy chọn) */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
</style>
