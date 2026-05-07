<template>
  <AppLayout>
    <div class="p-8">
      <div v-if="!project" class="text-center py-20 text-gray-400">Đang tải...</div>

      <div v-else>
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">{{ project.name }}</h2>
            <p v-if="project.client" class="text-gray-400 mt-1">Client: {{ project.client.name }}</p>
          </div>
          <button
            v-if="!authStore.isViewer"
            @click="showModal = true"
            class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition shadow-sm"
          >
            + Thêm task
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div
            v-for="column in columns"
            :key="column.status"
            class="bg-slate-50 rounded-2xl border border-slate-200 p-4"
          >
            <div class="flex items-center gap-2 mb-4">
              <span class="w-2.5 h-2.5 rounded-full" :class="column.color"></span>
              <h3 class="font-bold text-slate-700">{{ column.label }}</h3>
              <span class="ml-auto text-xs font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full shadow-sm border border-slate-100">
                {{ taskColumns[column.status].length }}
              </span>
            </div>

            <draggable
              v-model="taskColumns[column.status]"
              :disabled="!authStore.isAdmin"
              group="tasks"
              item-key="id"
              class="space-y-3 min-h-[150px]"
              @change="(evt) => onChange(evt, column.status)"
            >
              <template #item="{ element: task }">
                <div
                  @click="openTaskDetail(task)"
                  class="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow transition cursor-grab active:cursor-grabbing">
                  <p class="font-bold text-slate-800 text-sm leading-snug">{{ task.title }}</p>

                  <p v-if="task.description" class="text-xs text-slate-500 mt-1.5 line-clamp-2">
                    {{ task.description }}
                  </p>

                  <div class="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span
                        class="text-[9px] px-2 py-0.5 rounded-md font-black tracking-wider uppercase"
                        :class="{
                          'bg-red-50 text-red-600': task.priority === 'HIGH' || task.priority === 'URGENT',
                          'bg-amber-50 text-amber-600': task.priority === 'MEDIUM',
                          'bg-slate-100 text-slate-500': task.priority === 'LOW'
                        }"
                      >
                        {{ task.priority }}
                      </span>

                      <span
                        v-if="task.dueDate"
                        class="text-[10px] font-bold flex items-center gap-1"
                        :class="isOverdue(task.dueDate) ? 'text-red-500' : 'text-slate-400'"
                      >
                        📅 {{ new Date(task.dueDate).toLocaleDateString('vi-VN') }}
                      </span>
                    </div>

                    <div
                      v-if="task.assignee"
                      class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-[10px] font-bold shrink-0 border border-white shadow-sm"
                      :title="task.assignee.fullName"
                    >
                      {{ task.assignee.fullName.charAt(0).toUpperCase() }}
                    </div>
                  </div>
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="showDetailModal && selectedTask"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 backdrop-blur-sm"
      @click.self="closeTaskDetail"
    >
      <div class="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <span
            class="text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider"
            :class="{
              'bg-slate-200 text-slate-600': selectedTask.status === 'TODO',
              'bg-blue-100 text-blue-600': selectedTask.status === 'IN_PROGRESS',
              'bg-emerald-100 text-emerald-600': selectedTask.status === 'DONE'
            }"
          >
            {{ selectedTask.status.replace('_', ' ') }}
          </span>
          <button @click="closeTaskDetail" class="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
        </div>

        <div class="p-6 overflow-y-auto">
          <h2 class="text-2xl font-bold text-slate-900 mb-4">{{ selectedTask.title }}</h2>

          <div class="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Người thực hiện</p>
              <div class="flex items-center gap-2" v-if="selectedTask.assignee">
                <div class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                  {{ selectedTask.assignee.fullName.charAt(0).toUpperCase() }}
                </div>
                <span class="text-sm font-semibold text-slate-700">{{ selectedTask.assignee.fullName }}</span>
              </div>
              <p v-else class="text-sm font-semibold text-slate-400 italic">Chưa giao</p>
            </div>

            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Hạn chót (Due Date)</p>
              <p class="text-sm font-semibold text-slate-700">
                {{ selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString('vi-VN') : 'Không có' }}
              </p>
            </div>

            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Độ ưu tiên</p>
              <span
                class="text-[10px] px-2 py-0.5 rounded-md font-black tracking-wider uppercase"
                :class="{
                  'bg-red-50 text-red-600': selectedTask.priority === 'HIGH' || selectedTask.priority === 'URGENT',
                  'bg-amber-50 text-amber-600': selectedTask.priority === 'MEDIUM',
                  'bg-slate-200 text-slate-600': selectedTask.priority === 'LOW'
                }"
              >
                {{ selectedTask.priority }}
              </span>
            </div>

            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Thời gian ước tính</p>
              <p class="text-sm font-semibold text-slate-700">
                {{ selectedTask.estimatedMins ? `${selectedTask.estimatedMins} phút` : 'Chưa ước lượng' }}
              </p>
            </div>
          </div>

          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase mb-2">Mô tả chi tiết</p>
            <div class="text-slate-600 text-sm whitespace-pre-wrap bg-white border border-slate-200 p-4 rounded-xl min-h-[100px]">
              {{ selectedTask.description || 'Chưa có mô tả cho công việc này.' }}
            </div>
          </div>
        </div>

      </div>
    </div>
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 backdrop-blur-sm"
      @click.self="showModal = false"
    >
      <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div class="p-6 border-b border-slate-100">
          <h3 class="text-lg font-bold text-slate-900">Thêm task mới</h3>
        </div>

        <form @submit.prevent="handleCreateTask" class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tiêu đề</label>
            <input
              v-model="taskForm.title"
              type="text"
              placeholder="Thiết kế UI trang chủ..."
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition text-sm outline-none"
              required
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mô tả chi tiết</label>
            <textarea
              v-model="taskForm.description"
              rows="3"
              placeholder="Nhập chi tiết công việc..."
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition text-sm resize-none outline-none"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Độ ưu tiên</label>
              <select
                v-model="taskForm.priority"
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition text-sm bg-white"
              >
                <option value="LOW">Thấp (Low)</option>
                <option value="MEDIUM">Trung bình (Medium)</option>
                <option value="HIGH">Cao (High)</option>
                <option value="URGENT">Khẩn cấp (Urgent)</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Hạn chót</label>
              <input
                v-model="taskForm.dueDate"
                type="date"
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition text-sm"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Người thực hiện</label>
              <select
                v-model="taskForm.assigneeId"
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition text-sm bg-white"
              >
                <option value="">Chưa giao cho ai</option>
                    <option
                      v-for="member in workspaceStore.members"
                      :key="member.userId"
                      :value="member.userId"
                    >
                      {{ member.user.fullName }} ({{ member.user.email }})
                    </option>
                </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Thời gian ước tính</label>
              <div class="relative">
                <input
                  v-model="taskForm.estimatedMins"
                  type="number"
                  placeholder="Ví dụ: 120"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition text-sm pr-12"
                />
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">phút</span>
              </div>
            </div>
          </div>

          <div class="flex gap-3 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              @click="showModal = false"
              class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition disabled:opacity-50"
            >
              {{ loading ? 'Đang tạo...' : 'Tạo Task' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectStore } from '@/stores/project.store.js'
import { useAuthStore } from '@/stores/auth.store.js'
import draggable from 'vuedraggable'
import AppLayout from '@/components/common/AppLayout.vue'
import { useWorkspaceStore } from '@/stores/workspace.store.js'
const route = useRoute()
const projectStore = useProjectStore()
const authStore = useAuthStore()
const project = computed(() => projectStore.currentProject)
const showDetailModal = ref(false)
const selectedTask = ref(null)
const showModal = ref(false)
const loading = ref(false)
const workspaceStore = useWorkspaceStore()
const taskForm = ref({
  title: '',
  description: '',
  priority: 'MEDIUM',
  dueDate: '',
  assigneeId: '',
  estimatedMins: ''
})

const columns = [
  { status: 'TODO', label: 'Cần làm', color: 'bg-slate-400' },
  { status: 'IN_PROGRESS', label: 'Đang làm', color: 'bg-blue-500' },
  { status: 'DONE', label: 'Hoàn thành', color: 'bg-emerald-500' }
]

const taskColumns = ref({
  TODO: [],
  IN_PROGRESS: [],
  DONE: []
})

function isOverdue(dateString) {
  if (!dateString) return false
  return new Date(dateString).setHours(0,0,0,0) < new Date().setHours(0,0,0,0)
}

watch(() => project.value?.tasks, (newTasks) => {
  if (!newTasks) {
    console.log("⚠️ Backend không trả về mảng tasks!")
    return
  }
  taskColumns.value = {
    TODO: newTasks.filter(t => t.status === 'TODO').sort((a, b) => a.position - b.position),
    IN_PROGRESS: newTasks.filter(t => t.status === 'IN_PROGRESS').sort((a, b) => a.position - b.position),
    DONE: newTasks.filter(t => t.status === 'DONE').sort((a, b) => a.position - b.position)
  }
}, { immediate: true, deep: true })

onMounted(() => {
  Promise.all([
    projectStore.fetchProject(route.params.id),
    workspaceStore.fetchMembers()
  ])
})

async function onChange(evt, newStatus) {
  if (!evt.added) return
  const task = evt.added.element
  const newIndex = evt.added.newIndex
  task.status = newStatus
  await projectStore.moveTask(task.id, newStatus, newIndex)
}

async function handleCreateTask() {
  loading.value = true
  try {
    const payload = { ...taskForm.value }
    if (!payload.dueDate) delete payload.dueDate
    if (!payload.assigneeId) delete payload.assigneeId
    if (!payload.estimatedMins) delete payload.estimatedMins

    await projectStore.createTask(route.params.id, payload)

    showModal.value = false
    taskForm.value = { title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeId: '', estimatedMins: '' }

    await projectStore.fetchProject(route.params.id)
  } catch (err) {
    alert(err.response?.data?.message || 'Có lỗi xảy ra khi tạo task')
  } finally {
    loading.value = false
  }
}
function openTaskDetail(task) {
  selectedTask.value = JSON.parse(JSON.stringify(task))
  showDetailModal.value = true
}

function closeTaskDetail() {
  showDetailModal.value = false
  setTimeout(() => {
    selectedTask.value = null
  }, 200)
}
</script>
