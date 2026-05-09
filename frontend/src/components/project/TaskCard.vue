<template>
  <div
    @click="$emit('click', task)"
    class="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow transition cursor-grab active:cursor-grabbing"
  >
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

      <div class="flex -space-x-1.5 overflow-hidden">
        <div
          v-for="assignee in task.assignees"
          :key="assignee.userId"
          class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-[10px] font-bold shrink-0 border border-white shadow-sm ring-2 ring-white"
          :title="assignee.user.fullName"
        >
          {{ assignee.user.fullName.charAt(0).toUpperCase() }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  task: { type: Object, required: true }
})

defineEmits(['click'])

function isOverdue(dateString) {
  if (!dateString) return false
  return new Date(dateString).setHours(0,0,0,0) < new Date().setHours(0,0,0,0)
}
</script>
