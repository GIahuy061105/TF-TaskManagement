<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
/* Đảm bảo toàn bộ ứng dụng sử dụng font và reset từ main.css của bạn */
@import './assets/main.css';

#app {
  width: 100%;
  margin: 0;
  padding: 0;
}
</style>
