<script setup lang="ts">
import { computed } from 'vue'
import { getAppState, logoutUser } from './store'
import Navbar from './components/layout/Navbar.vue'
import Home from './components/pages/Home.vue'
import Login from './components/pages/Login.vue'
import Register from './components/pages/Register.vue'
import PostDetail from './components/pages/PostDetail.vue'
import Profile from './components/pages/Profile.vue'
import EditProfile from './components/pages/EditProfile.vue'
import CreatePost from './components/pages/CreatePost.vue'
import EditPost from './components/pages/EditPost.vue'
import NotificationToast from './components/common/NotificationToast.vue'

// Get reactive app state
const appState = getAppState()

// Computed property to determine which page to display
const currentComponent = computed(() => {
  switch(appState.currentPage) {
    case 'home':
      return Home
    case 'login':
      return Login
    case 'register':
      return Register
    case 'post-detail':
      return PostDetail
    case 'profile':
      return Profile
    case 'edit-profile':
      return EditProfile
    case 'create-post':
      return CreatePost
    case 'edit-post':
      return EditPost
    default:
      return Home
  }
})
</script>

<template>
  <div class="app-container d-flex flex-column min-vh-100">
    <!-- Navbar at the top -->
    <Navbar />
    
    <!-- Main content area -->
    <main class="container py-4 flex-grow-1">
      <component :is="currentComponent" />
    </main>
    
    <!-- Footer -->
    <footer class="py-3 mt-auto bg-white border-top">
      <div class="container text-center text-muted">
        <p class="mb-0">&copy; {{ new Date().getFullYear() }} VueX Blog. All rights reserved.</p>
      </div>
    </footer>
    
    <!-- Notifications -->
    <div class="toast-container">
      <NotificationToast 
        v-for="notification in appState.notifications" 
        :key="notification.id" 
        :notification="notification" 
      />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  background-color: var(--x-light);
}
</style>