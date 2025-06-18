<script setup lang="ts">
import { ref } from 'vue';
import { getAppState, createPost, navigateTo, addNotification } from '../../store';

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
  if (!validateForm() || !appState.currentUser) {
    return;
  }

  isSubmitting.value = true;

  const result = createPost(
    '', // không có tiêu đề
    form.value.content,
    form.value.imageUrl || undefined,
    appState.currentUser.id
  );

  if (result.success) {
    addNotification('Bài viết đã được tạo thành công', 'success');
    navigateTo('post-detail', { postId: result.post.id });
  } else {
    errors.value.form = result.message || 'Không thể tạo bài viết';
    addNotification(errors.value.form, 'danger');
  }

  isSubmitting.value = false;
}
</script>

<template>
  <div v-if="appState.currentUser" class="create-post-page">
    <div class="bg-white rounded p-4 x-card">
      <h2 class="mb-4">Tạo bài viết mới</h2>
      
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
            placeholder="Chia sẻ suy nghĩ của bạn..."
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
            placeholder="https://example.com/your-image.jpg"
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
            @click="navigateTo('home')"
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
              Đang tạo bài viết...
            </span>
            <span v-else>
              <i class="bi bi-send me-1"></i> Đăng bài viết
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>