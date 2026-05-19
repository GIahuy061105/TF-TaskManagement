<template>
  <div class="mb-8">
    <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-400 dark:border-slate-700 shadow-sm transition-colors">

      <div class="flex-1">
        <div class="flex items-center gap-4 flex-wrap">
          <h2 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">{{ project.name }}</h2>

          <select
            v-if="isAdmin"
            :value="project.status"
            @change="e => $emit('change-status', e.target.value)"
            class="text-xs font-bold px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg outline-none cursor-pointer border border-transparent dark:border-slate-600 hover:border-slate-200 dark:hover:border-slate-500 transition-colors"
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
            :class="project.visibility === 'PRIVATE'
              ? 'bg-rose-50 dark:bg-rose-900/30 border-rose-100 dark:border-rose-800 text-rose-600 dark:text-rose-400'
              : 'bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400'"
          >
            <option value="PUBLIC">🌍 Công khai</option>
            <option value="PRIVATE">🔒 Riêng tư</option>
          </select>

          <button
            v-if="isAdmin"
            @click="$emit('delete-project')"
            class="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors shadow-sm ml-auto xl:ml-0"
            title="Xóa dự án"
          >
            <BaseIcon :path="mdiDeleteOutline" size="18" />
          </button>
        </div>

        <div class="flex items-center gap-3 mt-3">
          <p v-if="project.client" class="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 transition-colors">
            <BaseIcon :path="mdiOfficeBuilding" size="18" class="text-slate-400 dark:text-slate-500" />
            Khách hàng: <span class="text-slate-700 dark:text-slate-200 font-bold">{{ project.client.name }}</span>
          </p>
        </div>
      </div>

      <div class="flex items-center gap-6">
        <div class="flex items-center gap-3 pr-6 xl:border-r border-slate-100 dark:border-slate-700">
          <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden md:block">Team</span>
          <div class="flex items-center gap-2">
            <div class="flex -space-x-3 overflow-hidden p-1">
              <div
                v-for="member in members"
                :key="member.userId"
                class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-white dark:from-indigo-900/50 dark:to-slate-700 flex items-center justify-center text-indigo-700 dark:text-indigo-300 text-xs font-black border-2 border-white dark:border-slate-800 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700 cursor-help hover:-translate-y-1 transition-transform"
                :title="`${member.user.fullName} (${member.role})`"
              >
                {{ member.user.fullName.charAt(0).toUpperCase() }}
              </div>
            </div>

            <button
              v-if="isAdmin"
              @click="$emit('manage-members')"
              class="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors bg-white dark:bg-slate-800 ml-2 shadow-sm"
              title="Quản lý thành viên"
            >
              <BaseIcon :path="mdiAccountPlusOutline" size="20" />
            </button>
          </div>
        </div>

        <button
          v-if="!isViewer"
          @click="$emit('add-task')"
          class="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-indigo-200 dark:shadow-indigo-900/30 hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap flex items-center gap-2"
        >
          <BaseIcon :path="mdiPlus" size="20" /> Tạo công việc
        </button>
      </div>
    </div>

    <!-- Contributions -->
    <div v-if="contributions.length > 0" class="mb-6 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
      <h3 class="text-sm font-black text-slate-800 dark:text-white mb-5 flex items-center gap-2 uppercase tracking-wider transition-colors">
        <BaseIcon :path="mdiTrophy" size="22" class="text-amber-500" /> Bảng xếp hạng đóng góp
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
            <span class="text-sm font-bold text-slate-700 dark:text-slate-200 transition-colors">{{ stat.user.fullName }}</span>
            <div class="flex items-center gap-3 mt-1.5">
              <div class="w-24 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner transition-colors">
                <div
                  class="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
                  :style="`width: ${stat.percentage}%`"
                ></div>
              </div>
              <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 transition-colors">
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
import { mdiDeleteOutline, mdiOfficeBuilding, mdiPlus, mdiTrophy, mdiAccountPlusOutline } from '@mdi/js'
import BaseIcon from '@/components/icon/BaseIcon.vue' // Điều chỉnh đường dẫn nếu cần

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
