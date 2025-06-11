<script setup lang="ts">
import { computed, ref } from 'vue';
import PostCard from '../posts/PostCard.vue';
import { getPosts, getAppState, navigateTo, createPost, addNotification } from '../../store';

const posts = computed(() => getPosts());
const appState = getAppState();

const isLoggedIn = computed(() => !!appState.currentUser);

const form = ref({
  title: '',
  content: '',
  image: '' // base64 string
});

const errors = ref({
  title: '',
  content: '',
  image: '',
  form: ''
});

const isSubmitting = ref(false);
const imagePreview = ref('');

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
    title: '',
    content: '',
    image: '',
    form: ''
  };

  let isValid = true;

  // Không cần tiêu đề nữa, chỉ cần nội dung
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

  const result = createPost(
    '', // bỏ tiêu đề
    form.value.content,
    form.value.image || undefined,
    appState.currentUser.id
  );

  if (result.success) {
    addNotification('Tạo bài viết thành công', 'success');
    form.value = {
      title: '',
      content: '',
      image: ''
    };
    imagePreview.value = '';
  } else {
    errors.value.form = result.message || 'Không thể tạo bài viết';
    addNotification(errors.value.form, 'danger');
  }

  isSubmitting.value = false;
}
</script>

<template>
  <div class="home-page feed-container mx-auto ">
    <div v-if="isLoggedIn" class="feed-item p-4 bg-white">
      <div class="d-flex align-items-start mb-2">
        <img :src="appState.currentUser?.avatarUrl" class="avatar me-2" style="width:40px;height:40px;object-fit:cover;border-radius:50%" alt="avatar">
        <form class="flex-grow-1" @submit.prevent="handleSubmit">
          <textarea
            v-model="form.content"
            class="form-control border-0 shadow-none"
            rows="3"
            placeholder="Bạn đang nghĩ gì?"
            style="resize:none;font-size:1.1rem"
          ></textarea>
          <div class="invalid-feedback" v-if="errors.content">{{ errors.content }}</div>

          <div v-if="imagePreview" class="mt-2">
            <img :src="imagePreview" alt="Xem trước" style="max-width:100%;max-height:200px;border-radius:10px;" />
          </div>

          <div class="d-flex align-items-center justify-content-between mt-2">
            <div>
              <label class="btn btn-light btn-sm mb-0 me-2" style="cursor:pointer">
                <i class="bi bi-image text-primary"></i>
                <input type="file" accept="image/*" @change="handleFileChange" style="display:none">
              </label>
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
                Đăng
              </span>
            </button>
          </div>
        </form>
      </div>
      <div v-if="errors.form" class="alert alert-danger mt-2" role="alert">
        {{ errors.form }}
      </div>
    </div>
    
    <!-- Posts List -->
    <div v-if="posts.length > 0">
      <div v-for="post in posts" :key="post.id" class="feed-item bg-white">
        <PostCard :post="post" />
      </div>
    </div>
    
    <!-- No Posts Message -->
    <div v-else class="feed-item bg-white text-center p-4">
      <i class="bi bi-journal-text fs-1 text-secondary mb-3"></i>
      <h5>Chưa có bài viết nào</h5>
      <p class="text-muted">Hãy tạo bài viết đầu tiên của bạn</p>
      <button 
        v-if="isLoggedIn"
        class="btn btn-primary" 
        @click="navigateTo('create-post')"
      >
        <i class="bi bi-pencil-square me-1"></i> Tạo bài viết
      </button>
      <button 
        v-else
        class="btn btn-primary" 
        @click="navigateTo('login')"
      >
        <i class="bi bi-box-arrow-in-right me-1"></i> Đăng nhập
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
  border-radius: 0;
  box-shadow: none;
  margin-bottom: 0;
}
.bg-white {
  background: #fff;
}
.home-page {
  background: transparent;
  padding: 0;
}
</style>