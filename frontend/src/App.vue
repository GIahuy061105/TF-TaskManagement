<script setup>
import { RouterView } from 'vue-router'
import { Toaster } from 'vue-sonner'
import { useThemeStore } from '@/stores/theme.store.js'

const themeStore = useThemeStore()
</script>

<template>
  <RouterView />
  <Toaster position="top-right" richColors :theme="themeStore.isDark ? 'dark' : 'light'" :style="{ zIndex: 99999 }" expand />
</template>

<style>
@import './assets/main.css';

#app {
  width: 100%;
  margin: 0;
  padding: 0;
}
</style>
