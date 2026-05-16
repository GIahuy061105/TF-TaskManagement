<template>
  <div
    class="bg-white p-4 rounded-2xl shadow-sm border border-slate-900 hover:shadow-md transition-all cursor-pointer group space-y-3"
  >
    <div class="flex items-center justify-between gap-3">
      <div
        v-if="completionRatio"
        class="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full flex items-center gap-1.5"
      >
        <BaseIcon :path="mdiClipboardTextOutline" size="16" />
        {{ completionRatio }}
      </div>
    </div>

    <div class="flex items-center gap-3">
      <div
        v-if="task.assignees && task.assignees.length > 0"
        class="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold"
      >
        {{ getUserInitials(task.assignees[0].user.fullName) }}
      </div>
      <div v-else class="text-xs font-medium text-slate-500">
        Chưa có người giao
      </div>

      <h3 class="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
        {{ task.title }}
      </h3>

      <div class="flex-1 flex justify-end gap-2">
        <span
          v-if="task.status === 'TODO'"
          class="text-xs font-bold px-3 py-1 rounded-lg shadow-sm border border-blue-100 bg-slate-50 text-slate-600"
        >
        {{ getStatusLabel(task.status) }}
        </span>
        <span
          v-if="task.status === 'DONE'"
          class="text-xs font-bold px-3 py-1 rounded-lg shadow-sm border border-emerald-100 bg-emerald-50 text-emerald-600 flex items-center gap-1.5"
        >
          {{ getStatusLabel(task.status) }}
        </span>
        <span
          v-else-if="task.status === 'IN_PROGRESS'"
          class="text-xs font-bold px-3 py-1 rounded-lg shadow-sm border border-blue-100 bg-blue-50 text-blue-600"
        >
          {{ getStatusLabel(task.status) }}
        </span>
      </div>
    </div>

    <div class="flex items-center justify-between gap-3">
      <span
        v-if="task.dueDate"
        class="text-[10px] font-bold flex items-center gap-1.5 px-2 py-1 rounded-md"
        :class="isOverdue ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'"
      >
        <BaseIcon :path="mdiCalendarMonth" size="14" />
        {{ formatDate(task.dueDate) }}
      </span>

      <div class="flex-1 flex justify-end gap-2 items-center">
        <span
          v-if="task.priority === 'HIGH'"
          class="text-[10px] font-bold bg-rose-100/50 text-rose-700 px-2 py-1 rounded-md"
        >
          HIGH
        </span>
        <span
          v-else-if="task.priority === 'MEDIUM'"
          class="text-[10px] font-bold bg-amber-100/50 text-amber-700 px-2 py-1 rounded-md"
        >
          MEDIUM
        </span>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import {
  mdiCalendar,
  mdiCalendarMonth,
  mdiAccountGroup
} from '@mdi/js'
import BaseIcon from '@/components/icon/BaseIcon.vue'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('vi-VN')
}

const isOverdue = computed(() => {
  if (!props.task.dueDate || props.task.status === 'DONE') return false
  return new Date(props.task.dueDate) < new Date()
})

const completionRatio = computed(() => {
  if (!props.task.subtasks || props.task.subtasks.length === 0) return null
  const total = props.task.subtasks.length
  const completed = props.task.subtasks.filter(st => st.isDone).length
  return `${completed}/${total} subtasks`
})

const getUserInitials = (fullName) => {
  if (!fullName) return ''
  const names = fullName.split(' ')
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  }
  return fullName[0].toUpperCase()
}
const getStatusLabel = (status) => {
  switch (status) {
    case 'TODO': return 'Cần Làm'
    case 'IN_PROGRESS': return 'Đang Làm'
    case 'DONE': return 'Hoàn Thành'
    default: return status
  }
}
</script>

