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
    addNotification('You must be logged in to comment', 'warning');
    return;
  }
  
  if (commentContent.value.trim() === '') {
    addNotification('Comment cannot be empty', 'warning');
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
    addNotification('Comment added successfully', 'success');
  } else {
    addNotification(result.message || 'Failed to add comment', 'danger');
  }
  
  isSubmitting.value = false;
}
</script>

<template>
  <div class="comment-form mb-4">
    <h5 class="mb-3">Leave a comment</h5>
    
    <div v-if="!appState.currentUser" class="alert alert-warning">
      <i class="bi bi-info-circle me-2"></i>
      Please <a href="#" class="alert-link" @click.prevent="navigateTo('login')">login</a> to comment.
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
            placeholder="Write a comment..."
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
          <span v-if="isSubmitting">Posting...</span>
          <span v-else>Post Comment</span>
        </button>
      </div>
    </form>
  </div>
</template>