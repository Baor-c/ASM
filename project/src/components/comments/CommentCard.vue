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
    addNotification('Bình luận không được để trống', 'warning');
    return;
  }
  
  const result = updateComment(props.comment.id, editedContent.value);
  
  if (result.success) {
    isEditing.value = false;
    addNotification('Cập nhật bình luận thành công', 'success');
  } else {
    addNotification(result.message || 'Không thể cập nhật bình luận', 'danger');
  }
}

function handleCancelEdit() {
  editedContent.value = props.comment.content;
  isEditing.value = false;
}

function handleDeleteComment() {
  if (confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
    const result = deleteComment(props.comment.id);
    
    if (result.success) {
      addNotification('Xóa bình luận thành công', 'success');
    } else {
      addNotification(result.message || 'Không thể xóa bình luận', 'danger');
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
                  <i class="bi bi-pencil me-2"></i> Chỉnh sửa
                </a>
              </li>
              <li>
                <a class="dropdown-item text-danger" href="#" @click.prevent="handleDeleteComment">
                  <i class="bi bi-trash me-2"></i> Xóa
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
            placeholder="Chỉnh sửa bình luận của bạn..."
          ></textarea>
          <div class="d-flex">
            <button class="btn btn-sm btn-primary me-2" @click="handleSaveComment">Lưu</button>
            <button class="btn btn-sm btn-outline-secondary" @click="handleCancelEdit">Hủy</button>
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