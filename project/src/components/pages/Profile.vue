<script setup lang="ts">
import { computed } from 'vue';
import PostCard from '../posts/PostCard.vue';
import { getAppState, getUserById, getPostsByUser, navigateTo } from '../../store';
import { formatDate } from '../../utils';

const appState = getAppState();

const profileId = computed(() => appState.selectedProfile || (appState.currentUser ? appState.currentUser.id : null));

const profile = computed(() => {
  if (!profileId.value) {
    navigateTo('home');
    return null;
  }
  return getUserById(profileId.value);
});

const posts = computed(() => {
  if (!profileId.value) return [];
  return getPostsByUser(profileId.value);
});

const isOwnProfile = computed(() => {
  return appState.currentUser && profile.value && appState.currentUser.id === profile.value.id;
});
</script>

<template>
  <div v-if="profile" class="profile-page">
    <!-- Profile Header -->
    <div class="bg-white rounded mb-4 x-card overflow-hidden">
      <!-- Banner -->
      <div class="profile-banner bg-primary" style="height: 180px;"></div>
      
      <!-- Profile Info -->
      <div class="p-4 position-relative">
        <!-- Avatar (positioned to overlap banner) -->
        <img 
          :src="profile.avatarUrl" 
          :alt="profile.displayName" 
          class="avatar-lg border border-4 border-white position-absolute"
          style="top: -40px; left: 20px;"
        >
        
        <!-- Edit Profile Button (if own profile) -->
        <div class="d-flex justify-content-end mb-4">
          <button 
            v-if="isOwnProfile"
            class="btn btn-outline-primary"
            @click="navigateTo('edit-profile')"
          >
            <i class="bi bi-pencil me-1"></i> Edit Profile
          </button>
        </div>
        
        <!-- User Details -->
        <h3 class="mb-1">{{ profile.displayName }}</h3>
        <p class="text-secondary mb-2">{{ profile.email }}</p>
        <p class="mb-2">
          <i class="bi bi-calendar3 me-1"></i> Joined {{ formatDate(profile.createdAt) }}
        </p>
      </div>
    </div>
    
    <!-- User Posts -->
    <div class="bg-white rounded p-4 mb-4 x-card">
      <h4 class="mb-3">Posts</h4>
      
      <div v-if="posts.length > 0">
        <PostCard 
          v-for="post in posts" 
          :key="post.id" 
          :post="post"
        />
      </div>
      
      <!-- No Posts Message -->
      <div v-else class="text-center py-4 text-secondary">
        <i class="bi bi-journal-text fs-2 mb-2"></i>
        <p class="mb-1">No posts yet.</p>
        <button 
          v-if="isOwnProfile"
          class="btn btn-primary mt-2" 
          @click="navigateTo('create-post')"
        >
          <i class="bi bi-pencil-square me-1"></i> Create Post
        </button>
      </div>
    </div>
  </div>
  
  <div v-else class="text-center py-5">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
</template>

<style scoped>
.profile-banner {
  background-image: linear-gradient(to right, var(--x-primary), var(--x-primary-hover));
}
</style>