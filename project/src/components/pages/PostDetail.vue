<script setup lang="ts">
import { computed } from 'vue';
import PostCard from '../posts/PostCard.vue';
import CommentCard from '../comments/CommentCard.vue';
import CommentForm from '../comments/CommentForm.vue';
import { getAppState, getPostById, getCommentsByPostId, navigateTo } from '../../store';

const appState = getAppState();

const post = computed(() => {
  if (!appState.selectedPost) {
    navigateTo('home');
    return null;
  }
  return getPostById(appState.selectedPost);
});

const comments = computed(() => {
  if (!appState.selectedPost) return [];
  return getCommentsByPostId(appState.selectedPost);
});
</script>

<template>
  <div v-if="post" class="post-detail-page">
    <!-- Back Button -->
    <button class="btn btn-outline-secondary mb-3" @click="navigateTo('home')">
      <i class="bi bi-arrow-left me-1"></i> Back to Feed
    </button>
    
    <!-- Post Content -->
    <PostCard :post="post" :detailed="true" />
    
    <!-- Comments Section -->
    <div class="comments-section bg-white rounded p-4 x-card mt-4">
      <h3 class="mb-4">Comments <span class="badge bg-secondary">{{ comments.length }}</span></h3>
      
      <!-- Comment Form -->
      <CommentForm :postId="post.id" />
      
      <!-- Comments List -->
      <div v-if="comments.length > 0" class="comments-list mt-4">
        <CommentCard 
          v-for="comment in comments" 
          :key="comment.id" 
          :comment="comment"
        />
      </div>
      
      <!-- No Comments Message -->
      <div v-else class="text-center py-4 text-secondary">
        <i class="bi bi-chat-square-text fs-2 mb-2"></i>
        <p>No comments yet. Be the first to share your thoughts!</p>
      </div>
    </div>
  </div>
  
  <div v-else class="text-center py-5">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
</template>