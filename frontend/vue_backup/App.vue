<template>
  <router-view></router-view>
  <SetPinModal 
    :is-open="isPinModalOpen" 
    :is-closable="true" 
    @close="isPinModalOpen = false"
    @success="isPinModalOpen = false"
  />
  <DesktopUpdater />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import SetPinModal from './components/SetPinModal.vue';
import DesktopUpdater from './components/DesktopUpdater.vue';

const route = useRoute();
const isPinModalOpen = ref(false);

const checkPinRequirement = () => {
  if (route.path === '/login' || route.path === '/') return;
  
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.has_pin_code === false) {
        isPinModalOpen.value = true;
      }
    } catch (e) {
      //
    }
  }
};

watch(() => route.path, () => {
  checkPinRequirement();
});

onMounted(() => {
  checkPinRequirement();
});
</script>

<style>
/* App wide styles */
</style>
