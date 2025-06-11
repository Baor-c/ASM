<script setup lang="ts">
import { ref, computed } from 'vue';
import { getAppState, navigateTo, logoutUser } from '../../store';

const appState = getAppState();
const isNavCollapsed = ref(true);

const isLoggedIn = computed(() => !!appState.currentUser);

function toggleNavbar() {
  isNavCollapsed.value = !isNavCollapsed.value;
}

function handleLogout() {
  logoutUser();
  navigateTo('home');
}
</script>

<template>
  <nav class="navbar navbar-expand-lg sticky-top navbar-light bg-white border-bottom shadow ">
    <div class="container">
      <!-- Logo/Brand -->
      <a class="navbar-brand d-flex align-items-center" href="#" @click.prevent="navigateTo('home')">
        <i class="bi bi-twitter text-primary fs-4 me-2"></i>
        <span class="fw-bold">VueX Blog</span>
      </a>

      <button 
        class="navbar-toggler" 
        type="button" 
        @click="toggleNavbar"
        aria-controls="navbarContent" 
        aria-expanded="false" 
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" :class="{ 'show': !isNavCollapsed }" id="navbarContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <a class="nav-link" href="#" @click.prevent="navigateTo('home')">
              <i class="bi bi-house-door"></i> Home
            </a>
          </li>
          <li class="nav-item" v-if="isLoggedIn">
            <a class="nav-link" href="#" @click.prevent="navigateTo('profile', { userId: appState.currentUser?.id })">
              <i class="bi bi-person"></i> Profile
            </a>
          </li>
        </ul>

        <div class="d-flex">
          <template v-if="isLoggedIn">
            <div class="d-flex align-items-center me-3">
              <img 
                :src="appState.currentUser?.avatarUrl" 
                class="avatar-sm me-2 rounded-circle" 
                :alt="appState.currentUser?.displayName"
              >
              <span class="d-none d-sm-inline">{{ appState.currentUser?.displayName }}</span>
            </div>
            <button class="btn btn-outline-primary btn-sm" @click="handleLogout">
              <i class="bi bi-box-arrow-right"></i> Logout
            </button>
          </template>
          <template v-else>
            <button class="btn btn-outline-primary me-2" @click="navigateTo('login')">
              Login
            </button>
            <button class="btn btn-primary" @click="navigateTo('register')">
              Register
            </button>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.nav-link {
  color: var(--x-secondary);
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-link:hover, .nav-link:focus {
  color: var(--x-primary);
}

.navbar {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
</style>