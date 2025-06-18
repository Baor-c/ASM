<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getAppState, getPostById, updatePost, navigateTo, addNotification } from '../../store';

const appState = getAppState();

// Redirect if not logged in
if (!appState.currentUser) {
  navigateTo('login');
}

const form = ref({
  content: '',
  imageUrl: ''
});

const errors = ref({
  content: '',
  imageUrl: '',
  form: ''
});

const isSubmitting = ref(false);
const isLoading = ref(true);

const postId = computed(() => appState.selectedPost);
const post = computed(() => {
  if (!postId.value) return null;
  return getPostById(postId.value);
});

onMounted(() => {
  // Load post data
  if (post.value) {
    form.value = {
      content: post.value.content,
      imageUrl: post.value.imageUrl || ''
    };
    
    // Verify ownership
    if (appState.currentUser && post.value.authorId !== appState.currentUser.id) {
      addNotification('Bạn chỉ có thể chỉnh sửa bài viết của riêng mình', 'danger');
      navigateTo('home');
    }
  } else {
    addNotification('Không tìm thấy bài viết', 'danger');
    navigateTo('home');
  }
  
  isLoading.value = false;
});

function validateForm(): boolean {
  errors.value = {
    content: '',
    imageUrl: '',
    form: ''
  };

  let isValid = true;

  if (!form.value.content.trim()) {
    errors.value.content = 'Nội dung là bắt buộc';
    isValid = false;
  }

  if (form.value.imageUrl && !form.value.imageUrl.match(/^https?:\/\/.+/)) {
    errors.value.imageUrl = 'Vui lòng nhập URL hợp lệ bắt đầu bằng http:// hoặc https://';
    isValid = false;
  }

  return isValid;
}

function handleSubmit() {
  if (!validateForm() || !postId.value) {
    return;
  }

  isSubmitting.value = true;

  const result = updatePost(
    postId.value,
    '', // không có tiêu đề
    form.value.content,
    form.value.imageUrl || undefined
  );

  if (result.success) {
    addNotification('Bài viết đã được cập nhật thành công', 'success');
    navigateTo('post-detail', { postId: postId.value });
  } else {
    errors.value.form = result.message || 'Không thể cập nhật bài viết';
    addNotification(errors.value.form, 'danger');
  }

  isSubmitting.value = false;
}
</script>

<template>
  <div v-if="isLoading" class="text-center py-5">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Đang tải...</span>
    </div>
  </div>

  <div v-else-if="post && appState.currentUser" class="edit-post-page">
    <div class="bg-white rounded p-4 x-card">
      <h2 class="mb-4">Chỉnh sửa bài viết</h2>
      
      <form @submit.prevent="handleSubmit">
        <!-- Form error alert -->
        <div v-if="errors.form" class="alert alert-danger" role="alert">
          {{ errors.form }}
        </div>
        
        <!-- Content input -->
        <div class="mb-3">
          <label for="content" class="form-label">Nội dung</label>
          <textarea
            id="content"
            v-model="form.content"
            class="form-control"
            :class="{ 'is-invalid': errors.content }"
            rows="8"
          ></textarea>
          <div class="invalid-feedback" v-if="errors.content">{{ errors.content }}</div>
        </div>
        
        <!-- Image URL input -->
        <div class="mb-4">
          <label for="imageUrl" class="form-label">URL hình ảnh (tùy chọn)</label>
          <input
            type="text"
            id="imageUrl"
            v-model="form.imageUrl"
            class="form-control"
            :class="{ 'is-invalid': errors.imageUrl }"
          >
          <div class="invalid-feedback" v-if="errors.imageUrl">{{ errors.imageUrl }}</div>
          
          <!-- Image preview -->
          <div v-if="form.imageUrl" class="mt-3">
            <p class="mb-2">Xem trước:</p>
            <img :src="form.imageUrl" alt="Preview" class="img-fluid post-image" style="max-height: 300px; border-radius: 12px;">
          </div>
        </div>
        
        <!-- Action buttons -->
        <div class="d-flex justify-content-between">
          <button
            type="button"
            class="btn btn-outline-secondary"
            @click="navigateTo('post-detail', { postId: postId })"
          >
            <i class="bi bi-arrow-left me-1"></i>
            Hủy
          </button>
          <button
            type="submit"
            class="btn btn-primary px-4"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting">
              <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              Đang cập nhật bài viết...
            </span>
            <span v-else>
              <i class="bi bi-check-circle me-1"></i> Cập nhật bài viết
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>