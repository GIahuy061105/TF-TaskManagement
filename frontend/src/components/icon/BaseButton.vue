<template>
  <button
    v-bind="$attrs"
    :type="type"
    :disabled="disabled || loading"
    class="relative flex items-center justify-center font-bold transition-all duration-200 outline-none disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
    :class="[
      variants[variant],
      sizes[size],
      block ? 'w-full' : ''
    ]"
    @click="$emit('click', $event)"
  >
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>

    <BaseIcon v-if="icon && !loading" :path="icon" :size="iconSize" class="mr-1.5" />

    <span :class="{ 'opacity-0': loading && hideTextOnLoad }" class="flex items-center justify-center gap-1.5 w-full">
      <slot />
    </span>
  </button>
</template>

<script setup>
import BaseIcon from '@/components/icon/BaseIcon.vue'

const props = defineProps({
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  block: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  icon: { type: String, default: null },
  iconSize: { type: [Number, String], default: 18 },
  hideTextOnLoad: { type: Boolean, default: false }
})

defineEmits(['click'])

const variants = {
  primary: 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/20 hover:shadow-lg',
  success: 'bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-md hover:shadow-lg',
  outline: 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300 hover:shadow-md transition-all shadow-sm',
  danger: 'bg-rose-500 hover:bg-rose-600 text-white shadow-md hover:shadow-lg',
  dangerOutline: 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 shadow-sm',
  softPrimary: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50',
  softWarning: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-100 dark:border-amber-800/50',
  ghost: 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300'
}

const sizes = {
  xs: 'px-3 py-1.5 text-[10px] uppercase tracking-wider rounded-lg',
  sm: 'px-4 py-2 text-xs rounded-xl',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-4 text-base rounded-2xl'
}
</script>
