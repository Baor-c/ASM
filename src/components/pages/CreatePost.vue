<script setup lang="ts">
import { ref, computed } from 'vue';
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

// Phân tích nội dung để tách tiêu đề và nội dung
function parseContent(content: string) {
  const lines = content.trim().split('\n');
  
  // Kiểm tra dòng đầu tiên có bắt đầu bằng "# " không (cú pháp Markdown)
  if (lines[0] && lines[0].startsWith('# ')) {
    const title = lines[0].substring(2).trim(); // Bỏ "# " ở đầu
    const remainingContent = lines.slice(1).join('\n').trim();
    return { title, content: remainingContent };
  }
  
  // Kiểm tra dòng đầu tiên có bắt đầu bằng "Tiêu đề:" không
  if (lines[0] && lines[0].toLowerCase().startsWith('tiêu đề:')) {
    const title = lines[0].substring(8).trim(); // Bỏ "Tiêu đề:" ở đầu
    const remainingContent = lines.slice(1).join('\n').trim();
    return { title, content: remainingContent };
  }
  
  // Kiểm tra dòng đầu tiên có được bao quanh bởi ** ** không (bold)
  if (lines[0] && lines[0].startsWith('**') && lines[0].endsWith('**') && lines[0].length > 4) {
    const title = lines[0].substring(2, lines[0].length - 2).trim();
    const remainingContent = lines.slice(1).join('\n').trim();
    return { title, content: remainingContent };
  }
  
  return { title: '', content: content };
}

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

  // Phân tích nội dung để tách tiêu đề
  const { title, content } = parseContent(form.value.content);

  const result = createPost(
    title, // tiêu đề được phân tích từ nội dung
    content, // nội dung sau khi đã bỏ tiêu đề
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

// Computed để hiển thị preview tiêu đề
const contentPreview = computed(() => {
  if (!form.value.content.trim()) return { title: '', content: '' };
  return parseContent(form.value.content);
});
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
        
        <!-- Hướng dẫn cú pháp -->
        <div class="alert alert-info mb-3">
          <h6 class="mb-2"><i class="bi bi-lightbulb text-warning me-1"></i> Cách thêm tiêu đề cho bài viết:</h6>
          <div class="small">
            <div class="mb-1"><code># Tiêu đề của bạn</code> - Sử dụng dấu # ở đầu dòng đầu tiên</div>
            <div class="mb-1"><code>Tiêu đề: Tiêu đề của bạn</code> - Viết "Tiêu đề:" ở đầu dòng đầu tiên</div>
            <div class="mb-1"><code>**Tiêu đề của bạn**</code> - Bao quanh tiêu đề bằng ** **</div>
          </div>
        </div>
        
        <!-- Preview tiêu đề nếu có -->
        <div v-if="contentPreview.title" class="alert alert-success mb-3">
          <div class="d-flex align-items-center">
            <i class="bi bi-check-circle me-2"></i>
            <div>
              <strong>Tiêu đề được phát hiện:</strong> {{ contentPreview.title }}
            </div>
          </div>
        </div>
        
        <!-- Content input -->
        <div class="mb-3">
          <label for="content" class="form-label">Nội dung</label>
          <textarea
            id="content"
            v-model="form.content"
            class="form-control"
            :class="{ 'is-invalid': errors.content }"
            rows="10"
            placeholder="Chia sẻ suy nghĩ của bạn...

Ví dụ:
# Đây là tiêu đề bài viết
Đây là nội dung chính của bài viết..."
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

<style scoped>
code {
  background-color: #f8f9fa;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 0.875rem;
}
</style>