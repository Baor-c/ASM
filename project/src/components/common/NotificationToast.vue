<script setup lang="ts">
import { ref, onMounted, defineProps } from 'vue';
import { Notification } from '../../types';
import { removeNotification } from '../../store';

const props = defineProps<{
  notification: Notification
}>();

const show = ref(false);

onMounted(() => {
  // Animate in
  setTimeout(() => {
    show.value = true;
  }, 10);
});

const handleClose = () => {
  show.value = false;
  setTimeout(() => {
    removeNotification(props.notification.id);
  }, 300);
};
</script>

<template>
  <div 
    class="toast show mb-3" 
    :class="[
      show ? 'opacity-100' : 'opacity-0', 
      `bg-${notification.type === 'danger' ? 'danger' : notification.type === 'success' ? 'success' : 'light'}`
    ]"
    role="alert" 
    aria-live="assertive" 
    aria-atomic="true"
  >
    <div class="toast-header">
      <i 
        class="bi me-2" 
        :class="{
          'bi-check-circle-fill text-success': notification.type === 'success',
          'bi-exclamation-circle-fill text-warning': notification.type === 'warning',
          'bi-x-circle-fill text-danger': notification.type === 'danger',
          'bi-info-circle-fill text-primary': notification.type === 'info'
        }"
      ></i>
      <strong class="me-auto">{{ 
        notification.type === 'success' ? 'Success' : 
        notification.type === 'warning' ? 'Warning' : 
        notification.type === 'danger' ? 'Error' : 
        'Information' 
      }}</strong>
      <button 
        type="button" 
        class="btn-close" 
        @click="handleClose"
        aria-label="Close"
      ></button>
    </div>
    <div 
      class="toast-body" 
      :class="notification.type !== 'info' && notification.type !== 'danger' ? 'text-dark' : 'text-white'"
    >
      {{ notification.message }}
    </div>
  </div>
</template>

<style scoped>
.toast {
  transition: opacity 0.3s ease;
  min-width: 300px;
}

.bg-danger, .bg-success {
  color: white;
}
</style>