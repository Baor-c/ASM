<script setup lang="ts">
import { ref, computed } from 'vue';
import { getAppState, updateUserProfile, updateUserPassword, navigateTo, addNotification } from '../../store';
import { isValidPassword } from '../../utils';

const appState = getAppState();

// Redirect if not logged in
if (!appState.currentUser) {
  navigateTo('login');
}

const profileForm = ref({
  displayName: appState.currentUser?.displayName || '',
  avatarUrl: appState.currentUser?.avatarUrl || ''
});

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const errors = ref({
  displayName: '',
  avatarUrl: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const isUpdatingProfile = ref(false);
const isUpdatingPassword = ref(false);

function validateProfileForm(): boolean {
  errors.value.displayName = '';
  errors.value.avatarUrl = '';
  
  let isValid = true;
  
  if (!profileForm.value.displayName.trim()) {
    errors.value.displayName = 'Display name is required';
    isValid = false;
  } else if (profileForm.value.displayName.length < 3) {
    errors.value.displayName = 'Display name must be at least 3 characters';
    isValid = false;
  }
  
  if (profileForm.value.avatarUrl && !profileForm.value.avatarUrl.match(/^https?:\/\/.+/)) {
    errors.value.avatarUrl = 'Please enter a valid URL starting with http:// or https://';
    isValid = false;
  }
  
  return isValid;
}

function validatePasswordForm(): boolean {
  errors.value.currentPassword = '';
  errors.value.newPassword = '';
  errors.value.confirmPassword = '';
  
  let isValid = true;
  
  if (!passwordForm.value.currentPassword) {
    errors.value.currentPassword = 'Current password is required';
    isValid = false;
  }
  
  if (!passwordForm.value.newPassword) {
    errors.value.newPassword = 'New password is required';
    isValid = false;
  } else if (!isValidPassword(passwordForm.value.newPassword)) {
    errors.value.newPassword = 'Password must be at least 8 characters with letters and numbers';
    isValid = false;
  }
  
  if (!passwordForm.value.confirmPassword) {
    errors.value.confirmPassword = 'Please confirm your password';
    isValid = false;
  } else if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    errors.value.confirmPassword = 'Passwords do not match';
    isValid = false;
  }
  
  return isValid;
}

function handleUpdateProfile() {
  if (!validateProfileForm() || !appState.currentUser) {
    return;
  }
  
  isUpdatingProfile.value = true;
  
  const result = updateUserProfile(
    appState.currentUser.id,
    profileForm.value.displayName,
    profileForm.value.avatarUrl
  );
  
  if (result.success) {
    addNotification('Profile updated successfully', 'success');
  } else {
    addNotification(result.message || 'Failed to update profile', 'danger');
  }
  
  isUpdatingProfile.value = false;
}

function handleUpdatePassword() {
  if (!validatePasswordForm() || !appState.currentUser) {
    return;
  }
  
  isUpdatingPassword.value = true;
  
  const result = updateUserPassword(
    appState.currentUser.id,
    passwordForm.value.currentPassword,
    passwordForm.value.newPassword
  );
  
  if (result.success) {
    addNotification('Password updated successfully', 'success');
    // Clear password fields
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  } else {
    addNotification(result.message || 'Failed to update password', 'danger');
  }
  
  isUpdatingPassword.value = false;
}
</script>

<template>
  <div v-if="appState.currentUser" class="edit-profile-page">
    <div class="bg-white rounded p-4 mb-4 x-card">
      <h2 class="mb-4">Edit Profile</h2>
      
      <!-- Profile Form -->
      <form @submit.prevent="handleUpdateProfile">
        <h4 class="mb-3">Profile Information</h4>
        
        <div class="mb-3">
          <label for="displayName" class="form-label">Display Name</label>
          <input
            type="text"
            id="displayName"
            v-model="profileForm.displayName"
            class="form-control"
            :class="{ 'is-invalid': errors.displayName }"
          >
          <div class="invalid-feedback" v-if="errors.displayName">{{ errors.displayName }}</div>
        </div>
        
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input
            type="email"
            id="email"
            :value="appState.currentUser.email"
            class="form-control"
            disabled
          >
          <div class="form-text">Email cannot be changed</div>
        </div>
        
        <div class="mb-3">
          <label for="avatarUrl" class="form-label">Avatar URL</label>
          <input
            type="text"
            id="avatarUrl"
            v-model="profileForm.avatarUrl"
            class="form-control"
            :class="{ 'is-invalid': errors.avatarUrl }"
            placeholder="https://example.com/your-avatar.jpg"
          >
          <div class="invalid-feedback" v-if="errors.avatarUrl">{{ errors.avatarUrl }}</div>
        </div>
        
        <div class="mb-4">
          <div class="d-flex align-items-center">
            <span class="me-3">Preview:</span>
            <img
              :src="profileForm.avatarUrl || appState.currentUser.avatarUrl"
              alt="Avatar Preview"
              class="avatar"
            >
          </div>
        </div>
        
        <div class="d-flex justify-content-between">
          <button
            type="button"
            class="btn btn-outline-secondary"
            @click="navigateTo('profile', { userId: appState.currentUser.id })"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isUpdatingProfile"
          >
            <span v-if="isUpdatingProfile">
              <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              Updating...
            </span>
            <span v-else>
              <i class="bi bi-check-circle me-1"></i> Save Changes
            </span>
          </button>
        </div>
      </form>
    </div>
    
    <!-- Password Change Form -->
    <div class="bg-white rounded p-4 mb-4 x-card">
      <form @submit.prevent="handleUpdatePassword">
        <h4 class="mb-3">Change Password</h4>
        
        <div class="mb-3">
          <label for="currentPassword" class="form-label">Current Password</label>
          <input
            type="password"
            id="currentPassword"
            v-model="passwordForm.currentPassword"
            class="form-control"
            :class="{ 'is-invalid': errors.currentPassword }"
            placeholder="Enter your current password"
          >
          <div class="invalid-feedback" v-if="errors.currentPassword">{{ errors.currentPassword }}</div>
        </div>
        
        <div class="mb-3">
          <label for="newPassword" class="form-label">New Password</label>
          <input
            type="password"
            id="newPassword"
            v-model="passwordForm.newPassword"
            class="form-control"
            :class="{ 'is-invalid': errors.newPassword }"
            placeholder="Create a new password"
          >
          <div class="invalid-feedback" v-if="errors.newPassword">{{ errors.newPassword }}</div>
          <div class="form-text">Password must be at least 8 characters with letters and numbers.</div>
        </div>
        
        <div class="mb-4">
          <label for="confirmPassword" class="form-label">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="passwordForm.confirmPassword"
            class="form-control"
            :class="{ 'is-invalid': errors.confirmPassword }"
            placeholder="Confirm your new password"
          >
          <div class="invalid-feedback" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</div>
        </div>
        
        <div class="d-flex justify-content-end">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isUpdatingPassword"
          >
            <span v-if="isUpdatingPassword">
              <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              Updating Password...
            </span>
            <span v-else>
              <i class="bi bi-lock me-1"></i> Change Password
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>