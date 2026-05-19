<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div
      v-for="column in columns"
      :key="column.status"
      class="rounded-3xl border p-5 flex flex-col transition-colors duration-300 shadow-sm border-slate-400 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
      :class="column.columnBg"
    >
      <div class="flex items-center justify-between mb-5 px-1">
        <div class="flex items-center gap-3">
          <BaseIcon :path="mdiCircle" size="12" :class="column.color.replace('bg-', 'text-')" />
          <h3 class="font-black text-slate-800 dark:text-white tracking-tight">{{ column.label }}</h3>
        </div>
        <span class="text-xs font-black text-slate-500 dark:text-slate-300 bg-white dark:bg-slate-700 px-3 py-1 rounded-lg shadow-sm border border-slate-400 dark:border-slate-600">
          {{ taskColumns[column.status].length }}
        </span>
      </div>
      <draggable
        v-model="taskColumns[column.status]"
        :disabled="!isAdmin"
        group="tasks"
        item-key="id"
        class="space-y-4 min-h-[200px] flex-1 custom-scrollbar"
        @change="(evt) => onChange(evt, column.status)"
        ghost-class="opacity-50"
      >
        <template #item="{ element: task }">
          <TaskCard :task="task" @click="$emit('open-task', task)" />
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'
import TaskCard from './TaskCard.vue'
import { mdiCircle } from '@mdi/js'
import BaseIcon from '@/components/icon/BaseIcon.vue'
const props = defineProps({
  tasks: { type: Array, default: () => [] },
  isAdmin: { type: Boolean, default: false }
})

const emit = defineEmits(['open-task', 'move-task'])

const columns = [
  { status: 'TODO', label: 'Cần làm', color: 'bg-slate-400',columnBg: 'bg-slate-100' },
  { status: 'IN_PROGRESS', label: 'Đang làm', color: 'bg-blue-500',columnBg: 'bg-blue-50 border-blue-100' },
  { status: 'DONE', label: 'Hoàn thành', color: 'bg-emerald-500' ,columnBg: 'bg-emerald-50 border-emerald-100'}
]

const taskColumns = ref({ TODO: [], IN_PROGRESS: [], DONE: [] })

watch(() => props.tasks, (newTasks) => {
  if (!newTasks) return
  taskColumns.value = {
    TODO: newTasks.filter(t => t.status === 'TODO').sort((a, b) => a.position - b.position),
    IN_PROGRESS: newTasks.filter(t => t.status === 'IN_PROGRESS').sort((a, b) => a.position - b.position),
    DONE: newTasks.filter(t => t.status === 'DONE').sort((a, b) => a.position - b.position)
  }
}, { immediate: true, deep: true })

async function onChange(evt, newStatus) {
  if (!evt.added) return
  if (newStatus === 'DONE' && !props.isAdmin) {
    alert('Bạn không có quyền tự chuyển Task sang Hoàn thành. Vui lòng bấm vào Task và chọn "Gửi yêu cầu duyệt"!')
    emit('refresh')
    return
  }
  const task = evt.added.element
  emit('move-task', { taskId: task.id, status: newStatus, position: evt.added.newIndex })
}
</script>
