<script setup lang="ts">
import { defineProps, computed } from 'vue';
import { navigateTo, deletePost, addNotification, getAppState, likePost, unlikePost } from '../../store';
import { formatDate, truncateText } from '../../utils';

const props = defineProps<{
  post: {
    id: string;
    title: string;
    content: string;
    imageUrl?: string;
    createdAt: Date;
    author: {
      id: string;
      displayName: string;
      avatarUrl: string;
    };
    commentCount: number;
    likes?: string[];
  },
  detailed?: boolean
}>();

const appState = getAppState();

const likeCount = computed(() => props.post.likes ? props.post.likes.length : 0);
const isLiked = computed(() => appState.currentUser && props.post.likes && props.post.likes.includes(appState.currentUser.id));

function handleLike() {
  if (!appState.currentUser) {
    addNotification('Bạn cần đăng nhập để thả tim', 'warning');
    return;
  }
  if (isLiked.value) {
    unlikePost(props.post.id, appState.currentUser.id);
  } else {
    likePost(props.post.id, appState.currentUser.id);
  }
}

function handleDeletePost() {
  if (confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
    const result = deletePost(props.post.id);
    
    if (result.success) {
      addNotification('Đã xóa bài viết thành công', 'success');
      if (appState.currentPage === 'post-detail') {
        navigateTo('home');
      }
    } else {
      addNotification(result.message || 'Không thể xóa bài viết', 'danger');
    }
  }
}
</script>

<template>
  <div class="x-card bg-white mb-3 overflow-hidden post-card">
    <!-- Post Header with Author Info -->
    <div class="d-flex p-3">
      <img :src="post.author.avatarUrl" :alt="post.author.displayName" class="avatar me-3">
      <div>
        <div 
          class="fw-bold x-link" 
          @click="navigateTo('profile', { userId: post.author.id })"
        >{{ post.author.displayName }}</div>
        <div class="text-secondary small">{{ formatDate(post.createdAt) }}</div>
      </div>
      
      <!-- Edit/Delete dropdown for post owner -->
      <div class="dropdown ms-auto" v-if="appState.currentUser && appState.currentUser.id === post.author.id">
        <button class="btn btn-sm btn-link text-secondary" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          <i class="bi bi-three-dots"></i>
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li>
            <a class="dropdown-item" href="#" @click.prevent="navigateTo('edit-post', { postId: post.id })">
              <i class="bi bi-pencil me-2"></i> Chỉnh sửa
            </a>
          </li>
          <li>
            <a class="dropdown-item text-danger" href="#" @click.prevent="handleDeletePost">
              <i class="bi bi-trash me-2"></i> Xóa
            </a>
          </li>
        </ul>
      </div>
    </div>
    
    <!-- Post Content -->
    <div class="p-3 pt-0">
      <h5 class="mb-2">{{ post.title }}</h5>
      <p v-if="detailed">{{ post.content }}</p>
      <p v-else>{{ truncateText(post.content, 150) }}</p>
      
      <a 
        v-if="!detailed && post.content.length > 150" 
        href="#" 
        class="x-link"
        @click.prevent="navigateTo('post-detail', { postId: post.id })"
      >Xem thêm</a>
    </div>
    
    <!-- Post Image if exists -->
    <div v-if="post.imageUrl" class="px-3 pb-3">
      <div class="post-image-container">
        <img :src="post.imageUrl" :alt="post.title" class="post-image">
      </div>
    </div>
    
    <!-- Post Actions -->
    <div class="post-actions d-flex border-top p-2">
      <button 
        class="btn flex-fill d-flex align-items-center justify-content-center"
        @click="navigateTo('post-detail', { postId: post.id })"
      >
        <i class="bi bi-chat me-1"></i>
        <span>{{ post.commentCount }} bình luận</span>
      </button>
      <button
        class="btn flex-fill d-flex align-items-center justify-content-center"
        :class="{ liked: isLiked }"
        @click="handleLike"
      >
        <i :class="['bi', isLiked ? 'bi-heart-fill text-danger' : 'bi-heart']"></i>
        <span class="ms-1">{{ likeCount }} lượt thích</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.post-card {
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
}

.post-image-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding-top: 0;
  overflow: hidden;
}

.post-image {
  position: relative;
  width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
}

.post-actions button {
  padding: 8px;
  color: var(--x-secondary);
  background: transparent;
  border: none;
  transition: all 0.2s;
}

.post-actions button.liked,
.post-actions button.liked:hover {
  color: #e0245e;
}

.post-actions button:hover {
  background-color: rgba(29, 161, 242, 0.1);
  color: var(--x-primary);
}
</style>