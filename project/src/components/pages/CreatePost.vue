<script setup lang="ts">
import { ref } from 'vue';
import { getAppState, createPost, navigateTo, addNotification } from '../../store';

const appState = getAppState();

// Redirect if not logged in
if (!appState.currentUser) {
  navigateTo('login');
}

const form = ref({
  title: '',
  content: '',
  imageUrl: ''
});

const errors = ref({
  title: '',
  content: '',
  imageUrl: '',
  form: ''
});

const isSubmitting = ref(false);

function validateForm(): boolean {
  errors.value = {
    title: '',
    content: '',
    imageUrl: '',
    form: ''
  };

  let isValid = true;

  if (!form.value.title.trim()) {
    errors.value.title = 'Title is required';
    isValid = false;
  }

  if (!form.value.content.trim()) {
    errors.value.content = 'Content is required';
    isValid = false;
  }

  if (form.value.imageUrl && !form.value.imageUrl.match(/^https?:\/\/.+/)) {
    errors.value.imageUrl = 'Please enter a valid URL starting with http:// or https://';
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
    form.value.title,
    form.value.content,
    form.value.imageUrl || undefined,
    appState.currentUser.id
  );

  if (result.success) {
    addNotification('Post created successfully', 'success');
    navigateTo('post-detail', { postId: result.post.id });
  } else {
    errors.value.form = result.message || 'Failed to create post';
    addNotification(errors.value.form, 'danger');
  }

  isSubmitting.value = false;
}
</script>

<template>
  <div v-if="appState.currentUser" class="create-post-page">
    <div class="bg-white rounded p-4 x-card">
      <h2 class="mb-4">Create New Post</h2>
      
      <form @submit.prevent="handleSubmit">
        <!-- Form error alert -->
        <div v-if="errors.form" class="alert alert-danger" role="alert">
          {{ errors.form }}
        </div>
        
        <!-- Title input -->
        <div class="mb-3">
          <label for="title" class="form-label">Title</label>
          <input
            type="text"
            id="title"
            v-model="form.title"
            class="form-control"
            :class="{ 'is-invalid': errors.title }"
            placeholder="Enter a compelling title"
          >
          <div class="invalid-feedback" v-if="errors.title">{{ errors.title }}</div>
        </div>
        
        <!-- Content input -->
        <div class="mb-3">
          <label for="content" class="form-label">Content</label>
          <textarea
            id="content"
            v-model="form.content"
            class="form-control"
            :class="{ 'is-invalid': errors.content }"
            rows="6"
            placeholder="Share your thoughts..."
          ></textarea>
          <div class="invalid-feedback" v-if="errors.content">{{ errors.content }}</div>
        </div>
        
        <!-- Image URL input -->
        <div class="mb-4">
          <label for="imageUrl" class="form-label">Image URL (optional)</label>
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
          <div v-if="form.imageUrl" class="mt-2">
            <p class="mb-1">Preview:</p>
            <img :src="form.imageUrl" alt="Preview" class="img-fluid post-image">
          </div>
        </div>
        
        <!-- Action buttons -->
        <div class="d-flex justify-content-between">
          <button
            type="button"
            class="btn btn-outline-secondary"
            @click="navigateTo('home')"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting">
              <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              Creating Post...
            </span>
            <span v-else>
              <i class="bi bi-send me-1"></i> Publish Post
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>