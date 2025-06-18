<script setup lang="ts">
import { computed, ref } from 'vue';
import PostCard from '../posts/PostCard.vue';
import { getPosts, getAppState, navigateTo, createPost, addNotification } from '../../store';

const posts = computed(() => getPosts());
const appState = getAppState();

const isLoggedIn = computed(() => !!appState.currentUser);

const form = ref({
  content: '',
  image: '' // base64 string
});

const errors = ref({
  content: '',
  image: '',
  form: ''
});

const isSubmitting = ref(false);
const imagePreview = ref('');

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

function handleFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string;
      form.value.image = imagePreview.value;
    };
    reader.readAsDataURL(file);
  } else {
    imagePreview.value = '';
    form.value.image = '';
  }
}

function validateForm(): boolean {
  errors.value = {
    content: '',
    image: '',
    form: ''
  };

  let isValid = true;

  if (!form.value.content.trim()) {
    errors.value.content = 'Nội dung là bắt buộc';
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
    form.value.image || undefined,
    appState.currentUser.id
  );

  if (result.success) {
    addNotification('Đăng bài viết thành công', 'success');
    form.value = {
      content: '',
      image: ''
    };
    imagePreview.value = '';
    // Clear file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
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
  <div class="home-page feed-container mx-auto">
    <!-- Create Post Form -->
    <div v-if="isLoggedIn" class="feed-item p-4 bg-white mb-3">
      <div class="d-flex align-items-start mb-2">
        <img 
          :src="appState.currentUser?.avatarUrl" 
          class="avatar me-3" 
          style="width:48px;height:48px;object-fit:cover;border-radius:50%" 
          alt="avatar"
        >
        <form class="flex-grow-1" @submit.prevent="handleSubmit">
          <textarea
            v-model="form.content"
            class="form-control border-0 shadow-none mb-3"
            rows="4"
            placeholder="Bạn đang nghĩ gì?

💡 Mẹo: Để thêm tiêu đề cho bài viết, bạn có thể:
• Bắt đầu bằng: # Tiêu đề của bạn
• Hoặc: Tiêu đề: Tiêu đề của bạn  
• Hoặc: **Tiêu đề của bạn**"
            style="resize:none;font-size:1.1rem"
          ></textarea>
          <div class="invalid-feedback d-block" v-if="errors.content">{{ errors.content }}</div>

          <!-- Preview tiêu đề nếu có -->
          <div v-if="contentPreview.title" class="alert alert-info mb-3">
            <div class="d-flex align-items-center">
              <i class="bi bi-info-circle me-2"></i>
              <div>
                <strong>Tiêu đề được phát hiện:</strong> {{ contentPreview.title }}
              </div>
            </div>
          </div>

          <!-- Image Preview -->
          <div v-if="imagePreview" class="mb-3">
            <div class="position-relative d-inline-block">
              <img 
                :src="imagePreview" 
                alt="Xem trước" 
                style="max-width:100%;max-height:300px;border-radius:12px;object-fit:cover;" 
              />
              <button 
                type="button"
                class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                @click="imagePreview = ''; form.image = ''"
                style="border-radius:50%;width:32px;height:32px;padding:0;"
              >
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>

          <!-- Action Bar -->
          <div class="d-flex align-items-center justify-content-between pt-2 border-top">
            <div class="d-flex align-items-center">
              <label class="btn btn-light btn-sm mb-0 me-2" style="cursor:pointer">
                <i class="bi bi-image text-primary me-1"></i>
                Ảnh
                <input type="file" accept="image/*" @change="handleFileChange" style="display:none">
              </label>
              
              <!-- Nút trợ giúp cú pháp -->
              <button 
                type="button" 
                class="btn btn-light btn-sm mb-0"
                data-bs-toggle="collapse" 
                data-bs-target="#syntaxHelp"
                aria-expanded="false"
              >
                <i class="bi bi-question-circle text-info me-1"></i>
                Cú pháp
              </button>
            </div>
            <button
              type="submit"
              class="btn btn-primary px-4"
              :disabled="isSubmitting || !form.content.trim()"
            >
              <span v-if="isSubmitting">
                <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Đang đăng...
              </span>
              <span v-else>
                Đăng bài
              </span>
            </button>
          </div>

          <!-- Hướng dẫn cú pháp -->
          <div class="collapse mt-3" id="syntaxHelp">
            <div class="card card-body bg-light">
              <h6 class="mb-2"><i class="bi bi-lightbulb text-warning me-1"></i> Cách thêm tiêu đề cho bài viết:</h6>
              <div class="small">
                <div class="mb-2">
                  <code># Tiêu đề của bạn</code><br>
                  <span class="text-muted">Sử dụng dấu # ở đầu dòng đầu tiên</span>
                </div>
                <div class="mb-2">
                  <code>Tiêu đề: Tiêu đề của bạn</code><br>
                  <span class="text-muted">Viết "Tiêu đề:" ở đầu dòng đầu tiên</span>
                </div>
                <div class="mb-2">
                  <code>**Tiêu đề của bạn**</code><br>
                  <span class="text-muted">Bao quanh tiêu đề bằng ** **</span>
                </div>
                <div class="text-info">
                  <i class="bi bi-info-circle me-1"></i>
                  Nếu không sử dụng cú pháp trên, bài viết sẽ không có tiêu đề riêng.
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      <div v-if="errors.form" class="alert alert-danger mt-2" role="alert">
        {{ errors.form }}
      </div>
    </div>
    
    <!-- Posts List -->
    <div v-if="posts.length > 0">
      <div v-for="post in posts" :key="post.id" class="feed-item bg-white mb-3">
        <PostCard :post="post" />
      </div>
    </div>
    
    <!-- No Posts Message -->
    <div v-else class="feed-item bg-white text-center p-5">
      <i class="bi bi-journal-text fs-1 text-secondary mb-3"></i>
      <h5>Chưa có bài viết nào</h5>
      <p class="text-muted mb-3">Hãy là người đầu tiên chia sẻ suy nghĩ của bạn</p>
      <button 
        v-if="isLoggedIn"
        class="btn btn-primary" 
        @click="navigateTo('create-post')"
      >
        <i class="bi bi-pencil-square me-1"></i> Tạo bài viết đầu tiên
      </button>
      <button 
        v-else
        class="btn btn-primary" 
        @click="navigateTo('login')"
      >
        <i class="bi bi-box-arrow-in-right me-1"></i> Đăng nhập để bắt đầu
      </button>
    </div>
  </div>
</template>

<style scoped>
.feed-container {
  max-width: 700px;
  width: 100%;
  margin: 0 auto;
}

.feed-item {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--x-border);
}

.feed-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.home-page {
  background: transparent;
  padding: 20px 0;
}

.form-control:focus {
  box-shadow: none;
  border-color: transparent;
}

.form-control::placeholder {
  color: #657786;
  font-size: 1rem;
  line-height: 1.4;
}

code {
  background-color: #f8f9fa;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 0.875rem;
}
</style>