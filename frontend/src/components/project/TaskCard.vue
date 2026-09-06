<template>
  <div
    class="bg-white dark:bg-slate-700 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-600 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500 transition-all cursor-pointer group space-y-3"
  >
    <!-- Badge: Đếm số lượng Subtask ở góc trên -->
    <div class="flex items-center justify-between gap-3">
      <div
        v-if="completionRatio"
        class="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-600 px-3 py-1 rounded-full flex items-center gap-1.5 transition-colors"
      >
        <BaseIcon :path="mdiClipboardTextOutline" size="16" />
        {{ completionRatio }}
      </div>
      <div v-else></div>
    </div>

    <!-- Thông tin chính của Task -->
    <div class="flex items-center gap-3">
      <div
        v-if="task.assignees && task.assignees.length > 0"
        class="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors"
      >
        {{ getUserInitials(task.assignees[0].user.fullName) }}
      </div>
      <div v-else class="text-xs font-medium text-slate-400 dark:text-slate-500 flex-shrink-0">
        Chưa giao
      </div>

      <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {{ task.title }}
      </h3>

      <div class="flex-1 flex justify-end gap-2">
        <span
          v-if="task.status === 'TODO'"
          class="text-xs font-bold px-3 py-1 rounded-lg shadow-sm border border-slate-200 dark:border-slate-500 bg-slate-50 dark:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
        >
          {{ getStatusLabel(task.status) }}
        </span>
        <span
          v-if="task.status === 'DONE'"
          class="text-xs font-bold px-3 py-1 rounded-lg shadow-sm border border-emerald-100 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 transition-colors"
        >
          {{ getStatusLabel(task.status) }}
        </span>
        <span
          v-else-if="task.status === 'IN_PROGRESS'"
          class="text-xs font-bold px-3 py-1 rounded-lg shadow-sm border border-blue-100 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
        >
          {{ getStatusLabel(task.status) }}
        </span>
      </div>
    </div>

    <!-- Hạn chót và Độ ưu tiên -->
    <div class="flex items-center justify-between gap-3">
      <span
        v-if="task.dueDate"
        class="text-[10px] font-bold flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors"
        :class="isOverdue
          ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
          : 'bg-slate-50 dark:bg-slate-600 text-slate-500 dark:text-slate-400'"
      >
        <BaseIcon :path="mdiCalendarMonth" size="14" />
        {{ formatDate(task.dueDate) }}
      </span>
      <span v-else></span>

      <div class="flex-1 flex justify-end gap-2 items-center">
        <span
          v-if="task.priority === 'HIGH' || task.priority === 'URGENT'"
          class="text-[10px] font-bold bg-rose-100/50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 px-2 py-1 rounded-md transition-colors"
        >
          {{ task.priority }}
        </span>
        <span
          v-else-if="task.priority === 'MEDIUM'"
          class="text-[10px] font-bold bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-md transition-colors"
        >
          MEDIUM
        </span>
      </div>
    </div>

    <!-- KHU VỰC SUBTASK CÓ NÚT THẢ XUỐNG -->
    <div v-if="task.subTasks && task.subTasks.length > 0" class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">

      <!-- Nút bấm đóng/mở -->
      <div
        class="flex items-center justify-between mb-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 p-1 -mx-1 rounded transition-colors"
        @click.stop="isExpanded = !isExpanded"
      >
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Checklist</span>
          <span class="text-[10px] font-bold text-indigo-500">
            {{ task.subTasks.filter(st => st.status === 'DONE').length }} / {{ task.subTasks.length }}
          </span>
        </div>

        <!-- Nút mũi tên -->
        <BaseButton variant="ghost" class="!w-6 !h-6 !p-0 pointer-events-none">
          <BaseIcon :path="isExpanded ? mdiChevronUp : mdiChevronDown" size="18" class="text-slate-400" />
        </BaseButton>
      </div>

      <!-- Danh sách subtask thả xuống -->
      <div v-show="isExpanded" class="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar pr-1">
        <div
          v-for="sub in task.subTasks"
          :key="sub.id"
          class="flex items-start gap-2 text-xs p-1"
          @click.stop
        >
          <BaseIcon
            :path="sub.status === 'DONE' ? mdiCheckCircle : mdiCircleOutline"
            size="14"
            class="shrink-0 mt-0.5"
            :class="sub.status === 'DONE' ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'"
          />
          <span
            class="font-medium transition-colors"
            :class="sub.status === 'DONE' ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-300'"
          >
            {{ sub.title }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  mdiCalendar,
  mdiCalendarMonth,
  mdiAccountGroup,
  mdiCheckCircle,
  mdiCircleOutline,
  mdiClipboardTextOutline,
  mdiChevronDown,
  mdiChevronUp
} from '@mdi/js'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import BaseButton from '@/components/icon/BaseButton.vue' // QUAN TRỌNG: Đã import BaseButton

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const isExpanded = ref(false)

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('vi-VN')
}

const isOverdue = computed(() => {
  if (!props.task.dueDate || props.task.status === 'DONE') return false
  return new Date(props.task.dueDate) < new Date()
})

const completionRatio = computed(() => {
  if (!props.task.subTasks || props.task.subTasks.length === 0) return null
  const total = props.task.subTasks.length
  const completed = props.task.subTasks.filter(st => st.status === 'DONE').length
  return `${completed}/${total} checklist`
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
