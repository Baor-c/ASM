<script setup lang="ts">
import { ref } from 'vue';
import { addComment, getAppState, addNotification, navigateTo } from '../../store';

const props = defineProps<{
  postId: string;
}>();

const commentContent = ref('');
const isSubmitting = ref(false);
const appState = getAppState();

function handleSubmit() {
  if (!appState.currentUser) {
    addNotification('Bạn phải đăng nhập để bình luận', 'warning');
    return;
  }
  
  if (commentContent.value.trim() === '') {
    addNotification('Bình luận không được để trống', 'warning');
    return;
  }
  
  isSubmitting.value = true;
  
  const result = addComment(
    props.postId,
    commentContent.value,
    appState.currentUser.id
  );
  
  if (result.success) {
    commentContent.value = '';
    addNotification('Đã thêm bình luận thành công', 'success');
  } else {
    addNotification(result.message || 'Không thể thêm bình luận', 'danger');
  }
  
  isSubmitting.value = false;
}
</script>

<template>
  <div class="comment-form mb-4">
    <h5 class="mb-3">Để lại bình luận</h5>
    
    <div v-if="!appState.currentUser" class="alert alert-warning">
      <i class="bi bi-info-circle me-2"></i>
      Vui lòng <a href="#" class="alert-link" @click.prevent="navigateTo('login')">đăng nhập</a> để bình luận.
    </div>
    
    <form v-else @submit.prevent="handleSubmit">
      <div class="d-flex">
        <img 
          :src="appState.currentUser.avatarUrl" 
          :alt="appState.currentUser.displayName"
          class="avatar-sm me-2"
        >
        <div class="flex-grow-1">
          <textarea 
            v-model="commentContent"
            class="form-control"
            rows="2"
            placeholder="Viết bình luận..."
            :disabled="isSubmitting"
          ></textarea>
        </div>
      </div>
      
      <div class="text-end mt-2">
        <button 
          type="submit" 
          class="btn btn-primary" 
          :disabled="isSubmitting || !commentContent.trim()"
        >
          <i class="bi bi-send me-1"></i>
          <span v-if="isSubmitting">Đang đăng...</span>
          <span v-else>Đăng bình luận</span>
        </button>
      </div>
    </form>
  </div>
</template>