<script setup lang="ts">
import { defineProps, ref } from 'vue';
import { CommentWithAuthor } from '../../types';
import { getAppState, updateComment, deleteComment, addNotification } from '../../store';
import { formatDate } from '../../utils';

const props = defineProps<{
  comment: CommentWithAuthor
}>();

const appState = getAppState();
const isEditing = ref(false);
const editedContent = ref(props.comment.content);

function handleEditComment() {
  isEditing.value = true;
}

function handleSaveComment() {
  if (editedContent.value.trim() === '') {
    addNotification('Comment cannot be empty', 'warning');
    return;
  }
  
  const result = updateComment(props.comment.id, editedContent.value);
  
  if (result.success) {
    isEditing.value = false;
    addNotification('Comment updated successfully', 'success');
  } else {
    addNotification(result.message || 'Failed to update comment', 'danger');
  }
}

function handleCancelEdit() {
  editedContent.value = props.comment.content;
  isEditing.value = false;
}

function handleDeleteComment() {
  if (confirm('Are you sure you want to delete this comment?')) {
    const result = deleteComment(props.comment.id);
    
    if (result.success) {
      addNotification('Comment deleted successfully', 'success');
    } else {
      addNotification(result.message || 'Failed to delete comment', 'danger');
    }
  }
}
</script>

<template>
  <div class="comment-card mb-3 border-bottom pb-3">
    <div class="d-flex">
      <!-- Avatar -->
      <img :src="comment.author.avatarUrl" :alt="comment.author.displayName" class="avatar-sm me-2">
      
      <!-- Comment content -->
      <div class="flex-grow-1">
        <div class="d-flex align-items-center mb-1">
          <span class="fw-bold me-2">{{ comment.author.displayName }}</span>
          <small class="text-secondary">{{ formatDate(comment.createdAt) }}</small>
          
          <!-- Edit/Delete dropdown for comment owner -->
          <div class="dropdown ms-auto" v-if="appState.currentUser && appState.currentUser.id === comment.author.id">
            <button class="btn btn-sm text-secondary p-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-three-dots"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <a class="dropdown-item" href="#" @click.prevent="handleEditComment">
                  <i class="bi bi-pencil me-2"></i> Edit
                </a>
              </li>
              <li>
                <a class="dropdown-item text-danger" href="#" @click.prevent="handleDeleteComment">
                  <i class="bi bi-trash me-2"></i> Delete
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <!-- Comment text (editable) -->
        <div v-if="!isEditing">
          <p class="mb-0">{{ comment.content }}</p>
        </div>
        <div v-else class="mt-2">
          <textarea 
            v-model="editedContent" 
            class="form-control mb-2" 
            rows="2" 
            placeholder="Edit your comment..."
          ></textarea>
          <div class="d-flex">
            <button class="btn btn-sm btn-primary me-2" @click="handleSaveComment">Save</button>
            <button class="btn btn-sm btn-outline-secondary" @click="handleCancelEdit">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comment-card {
  transition: background-color 0.2s;
}

.comment-card:hover {
  background-color: rgba(0, 0, 0, 0.01);
}
</style>