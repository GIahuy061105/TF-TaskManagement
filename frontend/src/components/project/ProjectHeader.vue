<template>
  <div>
    <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">

      <div>
        <div class="flex items-center gap-3">
          <h2 class="text-2xl font-bold text-gray-900">{{ project.name }}</h2>

          <select
            v-if="isAdmin"
            :value="project.status"
            @change="e => $emit('change-status', e.target.value)"
            class="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-lg outline-none cursor-pointer"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="PAUSED">PAUSED</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
          <select
            v-if="isAdmin"
            :value="project.visibility"
            @change="e => $emit('change-visibility', e.target.value)"
            class="text-xs font-bold px-2 py-1 rounded-lg outline-none cursor-pointer transition-colors"
            :class="project.visibility === 'PRIVATE' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'"
          >
            <option value="PUBLIC">🌍 Công khai</option>
             <option value="PRIVATE">🔒 Riêng tư</option>
          </select>

          <button
            v-if="isAdmin"
            @click="$emit('delete-project')"
            class="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition"
            title="Xóa dự án"
          >
            🗑️
          </button>
        </div>

        <div class="flex items-center gap-3 mt-1">
          <p v-if="project.client" class="text-sm font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
            Khách hàng: <span class="text-slate-700 font-bold">{{ project.client.name }}</span>
          </p>
        </div>
      </div>

      <div class="flex items-center gap-6 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
        <div class="flex items-center gap-3 border-r border-slate-100 pr-6">
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Team</span>
          <div class="flex items-center gap-2">
            <div class="flex -space-x-2 overflow-hidden p-1">
              <div
                v-for="member in members"
                :key="member.userId"
                class="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 text-xs font-bold border-2 border-white shadow-sm cursor-help hover:-translate-y-1 transition-transform"
                :title="`${member.user.fullName} (${member.role})`"
              >
                {{ member.user.fullName.charAt(0).toUpperCase() }}
              </div>
            </div>

            <button
              v-if="isAdmin"
              @click="$emit('manage-members')"
              class="w-8 h-8 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-50 transition ml-1"
              title="Quản lý thành viên"
            >
              +
            </button>
          </div>
        </div>

        <button
          v-if="!isViewer"
          @click="$emit('add-task')"
          class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition shadow-sm whitespace-nowrap flex items-center gap-2"
        >
          <span>+</span> Thêm task
        </button>
      </div>
    </div>

    <!-- Member Contributions -->
    <div v-if="contributions.length > 0" class="mb-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <h3 class="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
        🏆 Đóng góp cho dự án
      </h3>
      <div class="flex flex-wrap gap-6">
        <div
          v-for="stat in contributions"
          :key="stat.user.id"
          class="flex items-center gap-3"
        >
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {{ stat.user.fullName.charAt(0).toUpperCase() }}
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-bold text-slate-700">{{ stat.user.fullName }}</span>
            <div class="flex items-center gap-2 mt-1">
              <div class="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  :style="`width: ${stat.percentage}%`"
                ></div>
              </div>
              <span class="text-[10px] font-bold text-slate-500">
                {{ stat.percentage }}% ({{ stat.taskCount }} task)
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
