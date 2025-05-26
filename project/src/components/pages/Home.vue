<script setup lang="ts">
import { computed } from 'vue';
import PostCard from '../posts/PostCard.vue';
import { getPosts, getAppState, navigateTo } from '../../store';

const posts = computed(() => getPosts());
const appState = getAppState();

const isLoggedIn = computed(() => !!appState.currentUser);
</script>

<template>
  <div class="home-page">
    <div class="bg-white rounded p-4 mb-4 x-card">
      <h1 class="mb-0">Home</h1>
    </div>
    
    <div v-if="isLoggedIn" class="bg-white rounded p-4 mb-4 x-card">
      <div class="d-flex align-items-center">
        <img 
          :src="appState.currentUser?.avatarUrl" 
          :alt="appState.currentUser?.displayName"
          class="avatar me-3"
        >
        <div 
          class="form-control bg-light text-start"
          style="cursor: pointer"
          @click="navigateTo('create-post')"
        >
          Hãy chia sẻ điều gì đó với cộng đồng...
        </div>
      </div>
      <div class="d-flex justify-content-end mt-3">
        <button class="btn btn-primary" @click="navigateTo('create-post')">
          <i class="bi bi-pencil-square me-1"></i> Tạo bài Viết
        </button>
      </div>
    </div>
    
    <!-- Posts List -->
    <div v-if="posts.length > 0">
      <PostCard 
        v-for="post in posts" 
        :key="post.id" 
        :post="post"
      />
    </div>
    
    <!-- No Posts Message -->
    <div v-else class="bg-white rounded p-4 text-center x-card">
      <i class="bi bi-journal-text fs-1 text-secondary mb-3"></i>
      <h5>No Posts Yet</h5>
      <p class="text-muted">Hãy tạo blog nào</p>
      <button 
        v-if="isLoggedIn"
        class="btn btn-primary" 
        @click="navigateTo('create-post')"
      >
        <i class="bi bi-pencil-square me-1"></i> Tạo bài Viết
      </button>
      <button 
        v-else
        class="btn btn-primary" 
        @click="navigateTo('login')"
      >
        <i class="bi bi-box-arrow-in-right me-1"></i> Đăng Nhập
      </button>
    </div>
  </div>
</template>