<script setup lang="ts">
import { computed, ref } from 'vue';
import { getAppState, getUserPostActivities, getUserCommentActivities, getUserLikeActivities, navigateTo, getPostById } from '../../store';
import { formatDate } from '../../utils';

const appState = getAppState();

// Redirect if not logged in
if (!appState.currentUser) {
  navigateTo('login');
}

const activeTab = ref<'all' | 'posts' | 'comments' | 'likes'>('all');

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

// Tất cả hoạt động được sắp xếp theo thời gian
const allActivities = computed(() => {
  const activities = [];
  
  // Thêm hoạt động bài viết
  postActivities.value.forEach(activity => {
    activities.push({
      ...activity,
      category: 'post',
      icon: getActivityIcon(activity.type, 'post'),
      text: getActivityText(activity.type, 'post'),
      title: activity.postTitle || 'Bài viết không có tiêu đề',
      content: activity.postContent
    });
  });
  
  // Thêm hoạt động bình luận
  commentActivities.value.forEach(activity => {
    activities.push({
      ...activity,
      category: 'comment',
      icon: getActivityIcon(activity.type, 'comment'),
      text: getActivityText(activity.type, 'comment'),
      title: activity.postTitle,
      content: activity.commentContent
    });
  });
  
  // Thêm hoạt động thích
  likeActivities.value.forEach(activity => {
    activities.push({
      ...activity,
      category: 'like',
      icon: getActivityIcon(activity.type, 'like'),
      text: getActivityText(activity.type, 'like'),
      title: activity.postTitle,
      content: `Tác giả: ${activity.postAuthor}`
    });
  });
  
  return activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
});

function getActivityIcon(type: string, category: string) {
  if (category === 'like') {
    return type === 'like' ? 'bi-heart-fill text-danger' : 'bi-heart text-secondary';
  }
  
  switch (type) {
    case 'create':
      return 'bi-plus-circle text-success';
    case 'update':
      return 'bi-pencil-square text-warning';
    case 'delete':
      return 'bi-trash text-danger';
    default:
      return 'bi-circle';
  }
}

function getActivityText(type: string, category: string) {
  if (category === 'like') {
    return type === 'like' ? 'Đã thích bài viết' : 'Đã bỏ thích bài viết';
  }
  
  switch (type) {
    case 'create':
      return category === 'post' ? 'Đã tạo bài viết' : 'Đã bình luận';
    case 'update':
      return category === 'post' ? 'Đã cập nhật bài viết' : 'Đã cập nhật bình luận';
    case 'delete':
      return category === 'post' ? 'Đã xóa bài viết' : 'Đã xóa bình luận';
    default:
      return 'Hoạt động không xác định';
  }
}

function handleActivityClick(activity: any) {
  if (activity.category === 'post' && activity.type !== 'delete') {
    // Kiểm tra xem bài viết còn tồn tại không
    const post = getPostById(activity.postId);
    if (post) {
      navigateTo('post-detail', { postId: activity.postId });
    }
  } else if (activity.category === 'comment' && activity.type !== 'delete') {
    // Chuyển đến bài viết chứa bình luận
    const post = getPostById(activity.postId);
    if (post) {
      navigateTo('post-detail', { postId: activity.postId });
    }
  } else if (activity.category === 'like') {
    // Chuyển đến bài viết được thích
    const post = getPostById(activity.postId);
    if (post) {
      navigateTo('post-detail', { postId: activity.postId });
    }
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
            :class="{ active: activeTab === 'all' }"
            @click="activeTab = 'all'"
          >
            <i class="bi bi-list-ul me-1"></i>
            Tất cả ({{ allActivities.length }})
          </button>
        </li>
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
      
      <!-- All Activities Tab -->
      <div v-if="activeTab === 'all'" class="tab-content">
        <div v-if="allActivities.length > 0" class="activity-list">
          <div 
            v-for="activity in allActivities" 
            :key="`${activity.category}-${activity.id}`"
            class="activity-item d-flex align-items-start p-3 border-bottom"
            :class="{ 'clickable': activity.type !== 'delete' }"
            @click="activity.type !== 'delete' ? handleActivityClick(activity) : null"
          >
            <div class="activity-icon me-3 mt-1">
              <i :class="['bi', activity.icon]"></i>
            </div>
            <div class="flex-grow-1">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h6 class="mb-0">{{ activity.text }}</h6>
                <small class="text-muted">{{ formatDate(activity.createdAt) }}</small>
              </div>
              <div class="activity-content">
                <h6 class="text-primary mb-1">{{ activity.title }}</h6>
                <p class="text-muted mb-0 small">
                  {{ activity.category === 'post' ? activity.content.substring(0, 100) + '...' : activity.content }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-5 text-muted">
          <i class="bi bi-clock-history fs-1 mb-3"></i>
          <p>Chưa có hoạt động nào</p>
          <button class="btn btn-primary" @click="navigateTo('home')">
            <i class="bi bi-house-door me-1"></i>
            Về trang chủ
          </button>
        </div>
      </div>
      
      <!-- Post Activities Tab -->
      <div v-if="activeTab === 'posts'" class="tab-content">
        <div v-if="postActivities.length > 0" class="activity-list">
          <div 
            v-for="activity in postActivities" 
            :key="activity.id"
            class="activity-item d-flex align-items-start p-3 border-bottom"
            :class="{ 'clickable': activity.type !== 'delete' }"
            @click="activity.type !== 'delete' ? navigateTo('post-detail', { postId: activity.postId }) : null"
          >
            <div class="activity-icon me-3 mt-1">
              <i :class="['bi', getActivityIcon(activity.type, 'post')]"></i>
            </div>
            <div class="flex-grow-1">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h6 class="mb-0">{{ getActivityText(activity.type, 'post') }}</h6>
                <small class="text-muted">{{ formatDate(activity.createdAt) }}</small>
              </div>
              <div class="activity-content">
                <h6 class="text-primary mb-1">{{ activity.postTitle || 'Bài viết không có tiêu đề' }}</h6>
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
            :class="{ 'clickable': activity.type !== 'delete' }"
            @click="activity.type !== 'delete' ? navigateTo('post-detail', { postId: activity.postId }) : null"
          >
            <div class="activity-icon me-3 mt-1">
              <i :class="['bi', getActivityIcon(activity.type, 'comment')]"></i>
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
            class="activity-item d-flex align-items-start p-3 border-bottom clickable"
            @click="navigateTo('post-detail', { postId: activity.postId })"
          >
            <div class="activity-icon me-3 mt-1">
              <i :class="['bi', getActivityIcon(activity.type, 'like')]"></i>
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
  transition: all 0.2s ease;
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
  transition: background-color 0.2s ease;
}

.activity-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.activity-item.clickable {
  cursor: pointer;
}

.activity-item.clickable:hover {
  background-color: rgba(29, 161, 242, 0.05);
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