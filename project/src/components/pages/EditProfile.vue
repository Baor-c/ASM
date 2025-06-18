<script setup lang="ts">
import { ref, computed } from 'vue';
import { getAppState, updateUserProfile, updateUserPassword, navigateTo, addNotification } from '../../store';
import { isValidPassword } from '../../utils';

const appState = getAppState();

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
    errors.value.displayName = 'Tên hiển thị là bắt buộc';
    isValid = false;
  } else if (profileForm.value.displayName.length < 3) {
    errors.value.displayName = 'Tên hiển thị phải có ít nhất 3 ký tự';
    isValid = false;
  }
  
  if (profileForm.value.avatarUrl && !profileForm.value.avatarUrl.match(/^https?:\/\/.+/)) {
    errors.value.avatarUrl = 'Vui lòng nhập URL hợp lệ bắt đầu bằng http:// hoặc https://';
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
    errors.value.currentPassword = 'Mật khẩu hiện tại là bắt buộc';
    isValid = false;
  }
  
  if (!passwordForm.value.newPassword) {
    errors.value.newPassword = 'Mật khẩu mới là bắt buộc';
    isValid = false;
  } else if (!isValidPassword(passwordForm.value.newPassword)) {
    errors.value.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ và số';
    isValid = false;
  }
  
  if (!passwordForm.value.confirmPassword) {
    errors.value.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    isValid = false;
  } else if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    errors.value.confirmPassword = 'Mật khẩu không khớp';
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
    addNotification('Cập nhật hồ sơ thành công', 'success');
  } else {
    addNotification(result.message || 'Không thể cập nhật hồ sơ', 'danger');
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
    addNotification('Cập nhật mật khẩu thành công', 'success');
    // Clear password fields
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  } else {
    addNotification(result.message || 'Không thể cập nhật mật khẩu', 'danger');
  }
  
  isUpdatingPassword.value = false;
}
</script>

<template>
  <div v-if="appState.currentUser" class="edit-profile-page">
    <div class="bg-white rounded p-4 mb-4 x-card">
      <h2 class="mb-4">Chỉnh sửa hồ sơ</h2>
      
      <!-- Profile Form -->
      <form @submit.prevent="handleUpdateProfile">
        <h4 class="mb-3">Thông tin hồ sơ</h4>
        
        <div class="mb-3">
          <label for="displayName" class="form-label">Tên hiển thị</label>
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
          <div class="form-text">Không thể thay đổi email</div>
        </div>
        
    
        
        <div class="d-flex justify-content-between">
          <button
            type="button"
            class="btn btn-outline-secondary"
            @click="navigateTo('profile', { userId: appState.currentUser.id })"
          >
            Hủy
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isUpdatingProfile"
          >
            <span v-if="isUpdatingProfile">
              <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              Đang cập nhật...
            </span>
            <span v-else>
              <i class="bi bi-check-circle me-1"></i> Lưu thay đổi
            </span>
          </button>
        </div>
      </form>
    </div>
    
    <!-- Password Change Form -->
    <div class="bg-white rounded p-4 mb-4 x-card">
      <form @submit.prevent="handleUpdatePassword">
        <h4 class="mb-3">Đổi mật khẩu</h4>
        
        <div class="mb-3">
          <label for="currentPassword" class="form-label">Mật khẩu hiện tại</label>
          <input
            type="password"
            id="currentPassword"
            v-model="passwordForm.currentPassword"
            class="form-control"
            :class="{ 'is-invalid': errors.currentPassword }"
            placeholder="Nhập mật khẩu hiện tại"
          >
          <div class="invalid-feedback" v-if="errors.currentPassword">{{ errors.currentPassword }}</div>
        </div>
        
        <div class="mb-3">
          <label for="newPassword" class="form-label">Mật khẩu mới</label>
          <input
            type="password"
            id="newPassword"
            v-model="passwordForm.newPassword"
            class="form-control"
            :class="{ 'is-invalid': errors.newPassword }"
            placeholder="Tạo mật khẩu mới"
          >
          <div class="invalid-feedback" v-if="errors.newPassword">{{ errors.newPassword }}</div>
          <div class="form-text">Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ và số.</div>
        </div>
        
        <div class="mb-4">
          <label for="confirmPassword" class="form-label">Xác nhận mật khẩu mới</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="passwordForm.confirmPassword"
            class="form-control"
            :class="{ 'is-invalid': errors.confirmPassword }"
            placeholder="Xác nhận mật khẩu mới"
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
              Đang cập nhật mật khẩu...
            </span>
            <span v-else>
              <i class="bi bi-lock me-1"></i> Đổi mật khẩu
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>