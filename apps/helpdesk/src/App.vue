<script setup lang="ts">
import { state } from './store';
import TopNav from './components/TopNav.vue';
</script>

<template>
  <TopNav v-if="state.currentUser" />
  <main class="page">
    <router-view />
  </main>
  <footer class="site-footer">
    CAMT Help Desk — teaching application for 495 Automated Test. Data resets on every page load.
  </footer>
</template>
