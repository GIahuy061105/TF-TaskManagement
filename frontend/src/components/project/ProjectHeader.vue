<template>
  <div class="mb-8">
    <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">

      <div class="flex-1">
        <div class="flex items-center gap-4 flex-wrap">
          <h2 class="text-3xl font-black text-slate-900 tracking-tight">{{ project.name }}</h2>

          <select
            v-if="isAdmin"
            :value="project.status"
            @change="e => $emit('change-status', e.target.value)"
            class="text-xs font-bold px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg outline-none cursor-pointer border border-transparent hover:border-slate-200 transition"
          >
            <option value="ACTIVE">⚡ ACTIVE</option>
            <option value="PAUSED">⏸ PAUSED</option>
            <option value="COMPLETED">✅ COMPLETED</option>
          </select>
          <select
            v-if="isAdmin"
            :value="project.visibility"
            @change="e => $emit('change-visibility', e.target.value)"
            class="text-xs font-bold px-3 py-1.5 rounded-lg outline-none cursor-pointer transition-all border"
            :class="project.visibility === 'PRIVATE' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-blue-50 border-blue-100 text-blue-600'"
          >
            <option value="PUBLIC">🌍 Công khai</option>
            <option value="PRIVATE">🔒 Riêng tư</option>
          </select>

          <button
            v-if="isAdmin"
            @click="$emit('delete-project')"
            class="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-rose-500 hover:bg-rose-50 transition shadow-sm ml-auto xl:ml-0"
            title="Xóa dự án"
          >
            🗑
          </button>
        </div>

        <div class="flex items-center gap-3 mt-3">
          <p v-if="project.client" class="text-sm font-medium text-slate-500 flex items-center gap-1.5">
            <span class="text-slate-300 text-lg">🏢</span> Khách hàng: <span class="text-slate-700 font-bold">{{ project.client.name }}</span>
          </p>
        </div>
      </div>

      <div class="flex items-center gap-6">
        <div class="flex items-center gap-3 pr-6 xl:border-r border-slate-100">
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:block">Team</span>
          <div class="flex items-center gap-2">
            <div class="flex -space-x-3 overflow-hidden p-1">
              <div
                v-for="member in members"
                :key="member.userId"
                class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center text-indigo-700 text-xs font-black border-2 border-white shadow-sm ring-1 ring-slate-100 cursor-help hover:-translate-y-1 transition-transform"
                :title="`${member.user.fullName} (${member.role})`"
              >
                {{ member.user.fullName.charAt(0).toUpperCase() }}
              </div>
            </div>

            <button
              v-if="isAdmin"
              @click="$emit('manage-members')"
              class="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 transition bg-white ml-2 shadow-sm font-bold text-lg"
              title="Quản lý thành viên"
            >
              +
            </button>
          </div>
        </div>

        <button
          v-if="!isViewer"
          @click="$emit('add-task')"
          class="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 hover:-translate-y-0.5 whitespace-nowrap flex items-center gap-2"
        >
          <span class="text-lg leading-none">+</span> Tạo công việc
        </button>
      </div>
    </div>

    <div v-if="contributions.length > 0" class="mb-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
      <h3 class="text-sm font-black text-slate-800 mb-5 flex items-center gap-2 uppercase tracking-wider">
        <span class="text-xl">🏆</span> Bảng xếp hạng đóng góp
      </h3>
      <div class="flex flex-wrap gap-8">
        <div
          v-for="stat in contributions"
          :key="stat.user.id"
          class="flex items-center gap-4"
        >
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-black shadow-md">
            {{ stat.user.fullName.charAt(0).toUpperCase() }}
          </div>
          <div class="flex flex-col min-w-[120px]">
            <span class="text-sm font-bold text-slate-700">{{ stat.user.fullName }}</span>
            <div class="flex items-center gap-3 mt-1.5">
              <div class="w-24 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div
                  class="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
                  :style="`width: ${stat.percentage}%`"
                ></div>
              </div>
              <span class="text-[10px] font-bold text-slate-500">
                {{ stat.percentage }}% ({{ stat.taskCount }})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  project: { type: Object, required: true },
  members: { type: Array, default: () => [] },
  isViewer: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false }
})

defineEmits(['add-task', 'change-status', 'delete-project', 'manage-members' ,'change-visibility'])

const contributions = computed(() => {
  if (!props.project?.tasks || !props.members) return []
  const doneTasks = props.project.tasks.filter(t => t.status === 'DONE')
  if (doneTasks.length === 0) return []

  return props.members
    .map(member => {
      const count = doneTasks.filter(t =>
        t.assignees?.some(a => a.userId === member.userId)
      ).length
      return {
        user: member.user,
        taskCount: count,
        percentage: Math.round((count / doneTasks.length) * 100)
      }
    })
    .filter(m => m.taskCount > 0)
    .sort((a, b) => b.percentage - a.percentage)
})
</script>
