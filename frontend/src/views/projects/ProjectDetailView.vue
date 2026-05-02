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
            class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition"
          >
            + Thêm task
          </button>
        </div>

        <!-- Kanban Board -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div
            v-for="column in columns"
            :key="column.status"
            class="bg-white rounded-2xl border border-gray-200 p-4"
          >
            <div class="flex items-center gap-2 mb-4">
              <span class="w-2.5 h-2.5 rounded-full" :class="column.color"></span>
              <h3 class="font-semibold text-gray-700">{{ column.label }}</h3>
              <span class="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {{ taskColumns[column.status].length }}
              </span>
            </div>

            <draggable
              v-model="taskColumns[column.status]"
              :disabled="authStore.isViewer"
              group="tasks"
              item-key="id"
              class="space-y-3 min-h-20"
              @change="(evt) => onChange(evt, column.status)"
            >
              <template #item="{ element: task }">
                <div class="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-indigo-200 transition cursor-grab active:cursor-grabbing">
                  <p class="font-medium text-gray-900 text-sm">{{ task.title }}</p>
                  <p v-if="task.description" class="text-xs text-gray-400 mt-1.5">
                    {{ task.description }}
                  </p>
                  <div class="mt-3">
                    <span
                      class="text-xs px-2 py-0.5 rounded-full font-medium"
                      :class="{
                        'bg-red-100 text-red-600': task.priority === 'high',
                        'bg-yellow-100 text-yellow-600': task.priority === 'medium',
                        'bg-gray-100 text-gray-500': task.priority === 'low'
                      }"
                    >
                      {{ task.priority }}
                    </span>
                  </div>
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal thêm task -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      @click.self="showModal = false"
    >
      <div class="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
        <h3 class="text-lg font-bold text-gray-900 mb-6">Thêm task mới</h3>

        <form @submit.prevent="handleCreateTask" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
            <input
              v-model="taskForm.title"
              type="text"
              placeholder="Thiết kế UI trang chủ..."
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition text-sm"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              v-model="taskForm.description"
              rows="3"
              placeholder="Chi tiết task..."
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition text-sm resize-none"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              v-model="taskForm.priority"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 transition text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
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
              {{ loading ? 'Đang tạo...' : 'Tạo task' }}
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
const route = useRoute()
const projectStore = useProjectStore()

const project = computed(() => projectStore.currentProject)
const showModal = ref(false)
const loading = ref(false)
const taskForm = ref({ title: '', description: '', priority: 'medium' })

const columns = [
  { status: 'todo', label: 'To Do', color: 'bg-gray-400' },
  { status: 'in_progress', label: 'In Progress', color: 'bg-indigo-400' },
  { status: 'done', label: 'Done', color: 'bg-green-400' }
]

const taskColumns = ref({
  todo: [],
  in_progress: [],
  done: []
})

watch(project, (val) => {
  if (!val?.tasks) return
  taskColumns.value = {
    todo: val.tasks.filter(t => t.status === 'todo'),
    in_progress: val.tasks.filter(t => t.status === 'in_progress'),
    done: val.tasks.filter(t => t.status === 'done')
  }
}, { immediate: true })

onMounted(() => projectStore.fetchProject(route.params.id))

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
    await projectStore.createTask(route.params.id, taskForm.value)
    showModal.value = false
    taskForm.value = { title: '', description: '', priority: 'medium' }
    await projectStore.fetchProject(route.params.id)
  } finally {
    loading.value = false
  }
}
</script>
