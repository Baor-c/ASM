<script setup lang="ts">
import { computed, ref } from 'vue';
import { getAppState, getUserPostActivities, getUserCommentActivities, getUserLikeActivities, navigateTo } from '../../store';
import { formatDate } from '../../utils';

const appState = getAppState();

// Redirect if not logged in
if (!appState.currentUser) {
  navigateTo('login');
}

const activeTab = ref<'posts' | 'comments' | 'likes'>('posts');

const postActivities = computed(() => {
  if (!appState.currentUser) return [];
  return getUserPostActivities(appState.currentUser.id);
});

const commentActivities = computed(() => {
  if (!appState.currentUser) return [];
  return getUserCommentActivities(appState.currentUser.id);
});

const likeActivities = computed(() => {
  if (!appState.currentUser) return [];
  return getUserLikeActivities(appState.currentUser.id);
});

function getActivityIcon(type: string) {
  switch (type) {
    case 'create':
      return 'bi-plus-circle text-success';
    case 'update':
      return 'bi-pencil-square text-warning';
    case 'delete':
      return 'bi-trash text-danger';
    case 'like':
      return 'bi-heart-fill text-danger';
    case 'unlike':
      return 'bi-heart text-secondary';
    default:
      return 'bi-circle';
  }
}

function getActivityText(type: string, context: string) {
  switch (type) {
    case 'create':
      return context === 'post' ? 'Đã tạo bài viết' : 'Đã bình luận';
    case 'update':
      return context === 'post' ? 'Đã cập nhật bài viết' : 'Đã cập nhật bình luận';
    case 'delete':
      return context === 'post' ? 'Đã xóa bài viết' : 'Đã xóa bình luận';
    case 'like':
      return 'Đã thích bài viết';
    case 'unlike':
      return 'Đã bỏ thích bài viết';
    default:
      return 'Hoạt động không xác định';
  }
}
</script>

<template>
  <div v-if="appState.currentUser" class="history-page">
    <div class="bg-white rounded p-4 x-card">
      <h2 class="mb-4">
        <i class="bi bi-clock-history me-2"></i>
        Lịch sử hoạt động
      </h2>
      
      <!-- Tab Navigation -->
      <ul class="nav nav-tabs mb-4">
        <li class="nav-item">
          <button 
            class="nav-link" 
            :class="{ active: activeTab === 'posts' }"
            @click="activeTab = 'posts'"
          >
            <i class="bi bi-journal-text me-1"></i>
            Bài viết ({{ postActivities.length }})
          </button>
        </li>
        <li class="nav-item">
          <button 
            class="nav-link" 
            :class="{ active: activeTab === 'comments' }"
            @click="activeTab = 'comments'"
          >
            <i class="bi bi-chat-square-text me-1"></i>
            Bình luận ({{ commentActivities.length }})
          </button>
        </li>
        <li class="nav-item">
          <button 
            class="nav-link" 
            :class="{ active: activeTab === 'likes' }"
            @click="activeTab = 'likes'"
          >
            <i class="bi bi-heart me-1"></i>
            Lượt thích ({{ likeActivities.length }})
          </button>
        </li>
      </ul>
      
      <!-- Post Activities Tab -->
      <div v-if="activeTab === 'posts'" class="tab-content">
        <div v-if="postActivities.length > 0" class="activity-list">
          <div 
            v-for="activity in postActivities" 
            :key="activity.id"
            class="activity-item d-flex align-items-start p-3 border-bottom"
          >
            <div class="activity-icon me-3 mt-1">
              <i :class="['bi', getActivityIcon(activity.type)]"></i>
            </div>
            <div class="flex-grow-1">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h6 class="mb-0">{{ getActivityText(activity.type, 'post') }}</h6>
                <small class="text-muted">{{ formatDate(activity.createdAt) }}</small>
              </div>
              <div class="activity-content">
                <h6 class="text-primary mb-1">{{ activity.postTitle || 'Không có tiêu đề' }}</h6>
                <p class="text-muted mb-0 small">{{ activity.postContent.substring(0, 100) }}...</p>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-5 text-muted">
          <i class="bi bi-journal-text fs-1 mb-3"></i>
          <p>Chưa có hoạt động nào với bài viết</p>
        </div>
      </div>
      
      <!-- Comment Activities Tab -->
      <div v-if="activeTab === 'comments'" class="tab-content">
        <div v-if="commentActivities.length > 0" class="activity-list">
          <div 
            v-for="activity in commentActivities" 
            :key="activity.id"
            class="activity-item d-flex align-items-start p-3 border-bottom"
          >
            <div class="activity-icon me-3 mt-1">
              <i :class="['bi', getActivityIcon(activity.type)]"></i>
            </div>
            <div class="flex-grow-1">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h6 class="mb-0">{{ getActivityText(activity.type, 'comment') }}</h6>
                <small class="text-muted">{{ formatDate(activity.createdAt) }}</small>
              </div>
              <div class="activity-content">
                <p class="mb-1">
                  <strong>Bài viết:</strong> 
                  <span class="text-primary">{{ activity.postTitle }}</span>
                </p>
                <p class="text-muted mb-0 small">
                  <strong>Bình luận:</strong> {{ activity.commentContent }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-5 text-muted">
          <i class="bi bi-chat-square-text fs-1 mb-3"></i>
          <p>Chưa có hoạt động nào với bình luận</p>
        </div>
      </div>
      
      <!-- Like Activities Tab -->
      <div v-if="activeTab === 'likes'" class="tab-content">
        <div v-if="likeActivities.length > 0" class="activity-list">
          <div 
            v-for="activity in likeActivities" 
            :key="activity.id"
            class="activity-item d-flex align-items-start p-3 border-bottom"
          >
            <div class="activity-icon me-3 mt-1">
              <i :class="['bi', getActivityIcon(activity.type)]"></i>
            </div>
            <div class="flex-grow-1">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h6 class="mb-0">{{ getActivityText(activity.type, 'like') }}</h6>
                <small class="text-muted">{{ formatDate(activity.createdAt) }}</small>
              </div>
              <div class="activity-content">
                <p class="mb-1">
                  <strong>Bài viết:</strong> 
                  <span class="text-primary">{{ activity.postTitle }}</span>
                </p>
                <p class="text-muted mb-0 small">
                  <strong>Tác giả:</strong> {{ activity.postAuthor }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-5 text-muted">
          <i class="bi bi-heart fs-1 mb-3"></i>
          <p>Chưa có hoạt động nào với lượt thích</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nav-tabs .nav-link {
  color: var(--x-secondary);
  border: none;
  border-bottom: 2px solid transparent;
  background: none;
  padding: 0.75rem 1rem;
}

.nav-tabs .nav-link:hover {
  color: var(--x-primary);
  border-bottom-color: var(--x-primary);
  background: none;
}

.nav-tabs .nav-link.active {
  color: var(--x-primary);
  border-bottom-color: var(--x-primary);
  background: none;
  font-weight: 600;
}

.activity-item {
  transition: background-color 0.2s;
}

.activity-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 24px;
  text-align: center;
}

.activity-content {
  font-size: 0.9rem;
}
</style>