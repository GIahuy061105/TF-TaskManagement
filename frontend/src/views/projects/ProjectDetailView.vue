<template>
  <div v-if="showMemberModal" class="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/60 flex items-center justify-center z-50 px-4 backdrop-blur-sm transition-colors" @click.self="showMemberModal = false">
    <div class="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-8 border border-transparent dark:border-slate-700 transition-colors">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-black text-slate-900 dark:text-white transition-colors">Thành viên Dự án</h3>
        <button @click="showMemberModal = false" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold text-xl transition-colors">&times;</button>
      </div>

      <div class="space-y-3 max-h-60 overflow-y-auto mb-6 pr-2 custom-scrollbar">
        <div v-for="pm in project?.members" :key="pm.userId" class="group flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-600 hover:border-indigo-100 dark:hover:border-indigo-500/50 transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 dark:from-indigo-900/50 to-white dark:to-slate-800 border border-indigo-50 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black shadow-sm transition-colors">
              {{ pm.user?.fullName?.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="text-sm font-bold text-slate-800 dark:text-white transition-colors">{{ pm.user?.fullName }}</p>
              <p class="text-[10px] font-medium text-slate-400 dark:text-slate-500 transition-colors">{{ pm.user?.email }}</p>
            </div>
          </div>
          <button @click="handleRemoveMember(pm.userId)" class="opacity-0 group-hover:opacity-100 text-rose-500 dark:text-rose-400 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-900/30 px-3 py-1.5 rounded-lg transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-800/50">
            Gỡ
          </button>
        </div>

        <div v-if="!project?.members?.length" class="text-center py-6 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-2xl transition-colors">
          <p class="text-sm font-semibold text-slate-400 dark:text-slate-500">Dự án này chưa có ai tham gia.</p>
        </div>
      </div>

      <div v-if="authStore.isAdmin" class="pt-6 border-t border-slate-100 dark:border-slate-700 transition-colors">
        <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 transition-colors">Thêm từ Workspace</label>
        <div class="flex gap-2">
          <select v-model="selectedUserIdToAdd" class="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 font-medium transition-colors">
            <option value="" disabled>-- Chọn nhân sự --</option>
            <option v-for="user in availableUsersToAdd" :key="user.userId" :value="user.userId">
              {{ user.user.fullName }}
            </option>
          </select>
          <button @click="handleAddMember" :disabled="!selectedUserIdToAdd || loading" class="bg-indigo-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 dark:disabled:bg-slate-600 shadow-md transition-colors">
            Thêm
          </button>
        </div>
      </div>
    </div>
  </div>

  <AppLayout>
    <div class="p-8 max-w-[1600px] mx-auto h-full flex flex-col">
      <div v-if="!project" class="flex flex-col items-center justify-center flex-1 text-slate-400 dark:text-slate-500 gap-4 transition-colors">
        <div class="animate-spin text-4xl text-indigo-500 dark:text-indigo-400"><BaseIcon :path="mdiTimerSand" size="22"/></div>
        <p class="font-semibold tracking-wider">Đang tải dữ liệu dự án...</p>
      </div>

      <div v-else class="flex-1 flex flex-col">
        <ProjectHeader
          :project="project"
          :members="workspaceStore.members"
          :is-viewer="authStore.isViewer"
          :is-admin="authStore.isAdmin"
          @add-task="showModal = true"
          @change-status="handleChangeProjectStatus"
          @change-visibility="handleChangeProjectVisibility"
          @delete-project="handleDeleteProject"
          @manage-members="showMemberModal = true"
        />

        <div class="flex-1 mt-6">
          <KanbanBoard
            :tasks="project.tasks || []"
            :is-admin="authStore.isAdmin"
            @open-task="openTaskDetail"
            @move-task="handleMoveTask"
            @refresh="refreshProject"
          />
        </div>
      </div>
    </div>

    <TaskDetailModal
      v-if="showDetailModal && selectedTask"
      :task="selectedTask"
      :members="workspaceStore.members"
      :is-admin="authStore.isAdmin"
      :loading="loading"
      @close="closeTaskDetail"
      @update="handleUpdateTask"
      @delete-task="handleDeleteTask"
      @request-approval="handleRequestApproval"
      @approve-task="handleApproveTask"
    />

    <CreateTaskModal
      v-if="showModal"
      :members="workspaceStore.members"
      :loading="loading"
      @close="showModal = false"
      @submit="handleCreateTask"
    />
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/project.store.js'
import { useAuthStore } from '@/stores/auth.store.js'
import { useWorkspaceStore } from '@/stores/workspace.store.js'
import AppLayout from '@/components/common/AppLayout.vue'
import ProjectHeader from '@/components/project/ProjectHeader.vue'
import KanbanBoard from '@/components/project/KanbanBoard.vue'
import TaskDetailModal from '@/components/project/TaskDetailModal.vue'
import CreateTaskModal from '@/components/project/CreateTaskModal.vue'
import {mdiTimerSand , mdiHomeCityOutline ,mdiBank} from '@mdi/js'
import BaseIcon from '@/components/icon/BaseIcon.vue'
const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const authStore = useAuthStore()
const workspaceStore = useWorkspaceStore()
const showMemberModal = ref(false)
const selectedUserIdToAdd = ref('')
const project = computed(() => projectStore.currentProject)
const showModal = ref(false)
const showDetailModal = ref(false)
const selectedTask = ref(null)
const loading = ref(false)

onMounted(() => {
  Promise.all([
    projectStore.fetchProject(route.params.id),
    workspaceStore.fetchMembers()
  ])
})

async function refreshProject() {
  await projectStore.fetchProject(route.params.id)
}

function openTaskDetail(task) {
  selectedTask.value = JSON.parse(JSON.stringify(task))
  showDetailModal.value = true
}

function closeTaskDetail() {
  showDetailModal.value = false
  setTimeout(() => { selectedTask.value = null }, 200)
}

async function handleMoveTask({ taskId, status, position }) {
  await projectStore.moveTask(taskId, status, position)
}

async function handleCreateTask(payload) {
  loading.value = true
  try {
    await projectStore.createTask(route.params.id, payload)
    showModal.value = false
    await refreshProject()
  } catch (err) {
    alert(err.response?.data?.message || 'Có lỗi xảy ra khi tạo task')
  } finally {
    loading.value = false
  }
}

async function handleUpdateTask(payload) {
  loading.value = true
  try {
    await projectStore.updateTask(payload.id, payload)
    closeTaskDetail()
    await refreshProject()
  } catch (err) {
    alert(err.response?.data?.message || 'Lỗi khi cập nhật Task')
  } finally {
    loading.value = false
  }
}

async function handleDeleteTask(task) {
  if (!confirm('Bạn có chắc chắn muốn xóa Task này?')) return
  await projectStore.deleteTask(task.id)
  closeTaskDetail()
  await refreshProject()
}

async function handleRequestApproval(task) {
  loading.value = true
  try {
    await projectStore.requestTaskApprove(task.id)
    closeTaskDetail()
    await refreshProject()
  } catch (err) {
    alert(err.response?.data?.message || 'Lỗi khi yêu cầu phê duyệt')
  } finally {
    loading.value = false
  }
}

async function handleApproveTask(task) {
  loading.value = true
  try {
    await projectStore.approveTask(task.id)
    closeTaskDetail()
    await refreshProject()
  } catch (err) {
    alert(err.response?.data?.message || 'Lỗi khi phê duyệt Task')
  } finally {
    loading.value = false
  }
}
async function handleChangeProjectStatus(newStatus) {
  if (!confirm(`Bạn muốn đổi trạng thái dự án thành ${newStatus}?`)) return
  try {
    await projectStore.updateProject(route.params.id, { status: newStatus })
    await refreshProject()
  } catch (err) {
    alert('Lỗi khi đổi trạng thái: ' + err.message)
  }
}
async function handleChangeProjectVisibility(newVisibility) {
  const textMsg = newVisibility === 'PRIVATE'
    ? 'Riêng tư (Chỉ những người trong danh sách Team mới thấy)'
    : 'Công khai (Tất cả mọi người trong Workspace đều thấy)';

  if (!confirm(`Bạn muốn chuyển quyền truy cập dự án thành:\n${textMsg}?`)) return;

  try {
    await projectStore.updateProject(route.params.id, { visibility: newVisibility });
    await refreshProject();
  } catch (err) {
    alert('Lỗi khi đổi quyền truy cập: ' + err.message);
  }
}

async function handleDeleteProject() {
  if (!confirm('CẢNH BÁO: Xóa dự án này sẽ mất toàn bộ Task. Bạn chắc chắn chứ?')) return
  try {
    await projectStore.deleteProject(route.params.id)
    router.push('/projects') // Xóa xong thì điều hướng về danh sách
  } catch (err) {
    alert('Lỗi khi xóa dự án: ' + err.message)
  }
}
const availableUsersToAdd = computed(() => {
  if (!workspaceStore.members || !project.value?.members) return []
  const existingIds = project.value.members.map(m => m.userId)
  return workspaceStore.members.filter(m => !existingIds.includes(m.userId))
})

async function handleAddMember() {
  if (!selectedUserIdToAdd.value) return
  loading.value = true
  try {
    await projectStore.addProjectMember(route.params.id, selectedUserIdToAdd.value)
    selectedUserIdToAdd.value = '' // Reset thẻ select
    await refreshProject()
  } catch (err) {
    alert(err.response?.data?.message || 'Có lỗi khi thêm thành viên')
  } finally {
    loading.value = false
  }
}

async function handleRemoveMember(userId) {
  if (!confirm('Xóa người này khỏi dự án?')) return
  loading.value = true
  try {
    await projectStore.removeProjectMember(route.params.id, userId)
    await refreshProject()
  } catch (err) {
    alert(err.response?.data?.message || 'Có lỗi khi xóa thành viên')
  } finally {
    loading.value = false
  }
}
</script>
