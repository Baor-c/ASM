<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getAppState, getPostById, updatePost, navigateTo, addNotification } from '../../store';

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
      title: post.value.title,
      content: post.value.content,
      imageUrl: post.value.imageUrl || ''
    };
    
    // Verify ownership
    if (appState.currentUser && post.value.authorId !== appState.currentUser.id) {
      addNotification('You can only edit your own posts', 'danger');
      navigateTo('home');
    }
  } else {
    addNotification('Post not found', 'danger');
    navigateTo('home');
  }
  
  isLoading.value = false;
});

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
  if (!validateForm() || !postId.value) {
    return;
  }

  isSubmitting.value = true;

  const result = updatePost(
    postId.value,
    form.value.title,
    form.value.content,
    form.value.imageUrl || undefined
  );

  if (result.success) {
    addNotification('Post updated successfully', 'success');
    navigateTo('post-detail', { postId: postId.value });
  } else {
    errors.value.form = result.message || 'Failed to update post';
    addNotification(errors.value.form, 'danger');
  }

  isSubmitting.value = false;
}
</script>

<template>
  <div v-if="isLoading" class="text-center py-5">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>

  <div v-else-if="post && appState.currentUser" class="edit-post-page">
    <div class="bg-white rounded p-4 x-card">
      <h2 class="mb-4">Edit Post</h2>
      
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
            @click="navigateTo('post-detail', { postId: postId })"
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
              Updating Post...
            </span>
            <span v-else>
              <i class="bi bi-check-circle me-1"></i> Update Post
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>