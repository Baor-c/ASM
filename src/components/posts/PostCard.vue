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
  <div class="post-card p-4">
    <!-- Post Header with Author Info -->
    <div class="d-flex mb-3">
      <img 
        :src="post.author.avatarUrl" 
        :alt="post.author.displayName" 
        class="avatar me-3"
        style="cursor: pointer;"
        @click="navigateTo('profile', { userId: post.author.id })"
      >
      <div class="flex-grow-1">
        <div class="d-flex align-items-center justify-content-between">
          <div>
            <span 
              class="fw-bold x-link" 
              @click="navigateTo('profile', { userId: post.author.id })"
              style="cursor: pointer;"
            >{{ post.author.displayName }}</span>
            <span class="text-secondary ms-2 small">{{ formatDate(post.createdAt) }}</span>
          </div>
          
          <!-- Edit/Delete dropdown for post owner -->
          <div class="dropdown" v-if="appState.currentUser && appState.currentUser.id === post.author.id">
            <button class="btn btn-sm btn-link text-secondary p-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
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
      </div>
    </div>
    
    <!-- Post Content -->
    <div class="mb-3">
      <!-- Chỉ hiển thị title nếu có -->
      <h5 v-if="post.title" class="mb-2">{{ post.title }}</h5>
      
      <!-- Post text content -->
      <div class="post-content">
        <p v-if="detailed" class="mb-0" style="white-space: pre-wrap;">{{ post.content }}</p>
        <p v-else class="mb-0" style="white-space: pre-wrap;">{{ truncateText(post.content, 280) }}</p>
        
        <a 
          v-if="!detailed && post.content.length > 280" 
          href="#" 
          class="x-link d-block mt-2"
          @click.prevent="navigateTo('post-detail', { postId: post.id })"
        >Xem thêm</a>
      </div>
    </div>
    
    <!-- Post Image if exists -->
    <div v-if="post.imageUrl" class="mb-3">
      <div class="post-image-container">
        <img 
          :src="post.imageUrl" 
          :alt="post.title || 'Hình ảnh bài viết'" 
          class="post-image"
          @click="navigateTo('post-detail', { postId: post.id })"
          style="cursor: pointer;"
        >
      </div>
    </div>
    
    <!-- Post Actions -->
    <div class="post-actions d-flex border-top pt-2 mt-3">
      <button 
        class="btn flex-fill d-flex align-items-center justify-content-center post-action-btn"
        @click="navigateTo('post-detail', { postId: post.id })"
      >
        <i class="bi bi-chat me-2"></i>
        <span>{{ post.commentCount }}</span>
      </button>
      
      <button
        class="btn flex-fill d-flex align-items-center justify-content-center post-action-btn"
        :class="{ 'liked': isLiked }"
        @click="handleLike"
      >
        <i :class="['bi me-2', isLiked ? 'bi-heart-fill text-danger' : 'bi-heart']"></i>
        <span>{{ likeCount }}</span>
      </button>
      
      <button 
        class="btn flex-fill d-flex align-items-center justify-content-center post-action-btn"
        @click="navigateTo('post-detail', { postId: post.id })"
      >
        <i class="bi bi-share me-2"></i>
        <span>Chia sẻ</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.post-card {
  transition: all 0.2s ease;
}

.post-image-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 12px;
}

.post-image {
  width: 100%;
  height: auto;
  max-height: 500px;
  object-fit: cover;
  border-radius: 12px;
  transition: transform 0.2s ease;
}

.post-image:hover {
  transform: scale(1.02);
}

.post-content {
  font-size: 1rem;
  line-height: 1.5;
  color: var(--x-dark);
}

.post-action-btn {
  padding: 8px 12px;
  color: var(--x-secondary);
  background: transparent;
  border: none;
  border-radius: 20px;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.post-action-btn:hover {
  background-color: rgba(29, 161, 242, 0.1);
  color: var(--x-primary);
}

.post-action-btn.liked {
  color: #e0245e;
}

.post-action-btn.liked:hover {
  background-color: rgba(224, 36, 94, 0.1);
  color: #e0245e;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  transition: opacity 0.2s ease;
}

.avatar:hover {
  opacity: 0.8;
}
</style>