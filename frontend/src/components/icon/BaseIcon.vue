<script setup>
defineProps(['path', 'size', 'color'])
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    :width="size || 24"
    :height="size || 24"
    :fill="color || 'currentColor'"
  >
    <path :d="path" />
  </svg>
</template>
