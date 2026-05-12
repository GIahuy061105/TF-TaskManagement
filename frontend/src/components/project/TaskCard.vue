<template>
  <div
    @click="$emit('click', task)"
    class="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 hover:-translate-y-1 cursor-grab active:cursor-grabbing relative overflow-hidden"
  >
    <div class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b opacity-0 group-hover:opacity-100 transition-opacity"
         :class="{'from-emerald-400 to-emerald-500': task.status === 'DONE', 'from-indigo-400 to-indigo-500': task.status !== 'DONE'}">
    </div>

    <p class="font-bold text-slate-800 text-sm leading-snug group-hover:text-indigo-600 transition-colors">{{ task.title }}</p>

    <p v-if="task.description" class="text-xs font-medium text-slate-500 mt-2 line-clamp-2 leading-relaxed">
      {{ task.description }}
    </p>

    <div class="mt-5 flex items-center justify-between border-t border-slate-50 pt-4">
      <div class="flex items-center gap-2 flex-wrap">
        <span
          class="text-[9px] px-2.5 py-1 rounded-md font-black tracking-wider uppercase"
          :class="{
            'bg-rose-50 text-rose-600': task.priority === 'HIGH' || task.priority === 'URGENT',
            'bg-amber-50 text-amber-600': task.priority === 'MEDIUM',
            'bg-slate-50 text-slate-500 border border-slate-100': task.priority === 'LOW'
          }"
        >
          {{ task.priority }}
        </span>

        <span
          v-if="task.dueDate"
          class="text-[10px] font-bold flex items-center gap-1.5 px-2 py-1 rounded-md"
          :class="isOverdue(task.dueDate) ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'"
        >
          <span class="text-xs">📅</span> {{ new Date(task.dueDate).toLocaleDateString('vi-VN') }}
        </span>
      </div>

      <div class="flex -space-x-2 overflow-hidden pl-2">
        <div
          v-for="assignee in task.assignees"
          :key="assignee.userId"
          class="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center text-indigo-700 text-[10px] font-black shrink-0 border-2 border-white shadow-sm ring-1 ring-slate-100"
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

