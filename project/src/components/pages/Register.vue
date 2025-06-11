<script setup lang="ts">
import { ref } from 'vue';
import { RegisterForm } from '../../types';
import { registerUser, navigateTo, addNotification } from '../../store';
import { isValidEmail, isValidPassword } from '../../utils';

const form = ref<RegisterForm>({
  displayName: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const avatarUrl = ref('');
const errors = ref({
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
  form: ''
});

const isSubmitting = ref(false);

function validateForm(): boolean {
  errors.value = {
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    form: ''
  };

  let isValid = true;

  // Display name validation
  if (!form.value.displayName) {
    errors.value.displayName = 'Tên hiển thị là bắt buộc';
    isValid = false;
  } else if (form.value.displayName.length < 3) {
    errors.value.displayName = 'Tên hiển thị phải có ít nhất 3 ký tự';
    isValid = false;
  }

  // Email validation
  if (!form.value.email) {
    errors.value.email = 'Email là bắt buộc';
    isValid = false;
  } else if (!isValidEmail(form.value.email)) {
    errors.value.email = 'Vui lòng nhập địa chỉ email hợp lệ';
    isValid = false;
  }

  if (!form.value.password) {
    errors.value.password = 'Mật khẩu là bắt buộc';
    isValid = false;
  } else if (!isValidPassword(form.value.password)) {
    errors.value.password = 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ và số';
    isValid = false;
  }

  if (!form.value.confirmPassword) {
    errors.value.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    isValid = false;
  } else if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = 'Mật khẩu không khớp';
    isValid = false;
  }


  return isValid;
}

function handleSubmit() {
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  const result = registerUser(
    form.value.displayName,
    form.value.email,
    form.value.password,
    avatarUrl.value
  );

  if (result.success) {
    addNotification(`Chào mừng, ${result.user?.displayName}! Tài khoản của bạn đã được tạo.`, 'success');
    navigateTo('home');
  } else {
    errors.value.form = result.message || 'Đăng ký thất bại';
    addNotification(errors.value.form, 'danger');
  }

  isSubmitting.value = false;
}
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-md-12 col-lg-8 mt-3">
      <div class="x-card bg-white p-4">
        <div class="text-center mb-4">
          <i class="bi bi-twitter text-primary fs-1"></i>
          <h2 class="mt-2">Tạo tài khoản</h2>
          <p class="text-secondary">Tham gia cộng đồng VueX Blog</p>
        </div>

        <form @submit.prevent="handleSubmit">
          <!-- Form error alert -->
          <div v-if="errors.form" class="alert alert-danger" role="alert">
            {{ errors.form }}
          </div>

          <!-- Display Name input -->
          <div class="mb-3">
            <label for="displayName" class="form-label">Tên hiển thị</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-person"></i></span>
              <input
                type="text"
                id="displayName"
                v-model="form.displayName"
                class="form-control"
                :class="{ 'is-invalid': errors.displayName }"
                placeholder="Tên bạn muốn hiển thị"
                autocomplete="name"
              >
            </div>
            <div class="invalid-feedback" v-if="errors.displayName">{{ errors.displayName }}</div>
          </div>

          <!-- Email input -->
          <div class="mb-3">
            <label for="registerEmail" class="form-label">Email</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-envelope"></i></span>
              <input
                type="email"
                id="registerEmail"
                v-model="form.email"
                class="form-control"
                :class="{ 'is-invalid': errors.email }"
                placeholder="your.email@example.com"
                autocomplete="email"
              >
            </div>
            <div class="invalid-feedback" v-if="errors.email">{{ errors.email }}</div>
          </div>

          <!-- Password input -->
          <div class="mb-3">
            <label for="registerPassword" class="form-label">Mật khẩu</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-lock"></i></span>
              <input
                type="password"
                id="registerPassword"
                v-model="form.password"
                class="form-control"
                :class="{ 'is-invalid': errors.password }"
                placeholder="Tạo mật khẩu mạnh"
                autocomplete="new-password"
              >
            </div>
            <div class="invalid-feedback" v-if="errors.password">{{ errors.password }}</div>
            <div class="form-text">Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ và số.</div>
          </div>

          <!-- Confirm Password input -->
          <div class="mb-3">
            <label for="confirmPassword" class="form-label">Xác nhận mật khẩu</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-lock-fill"></i></span>
              <input
                type="password"
                id="confirmPassword"
                v-model="form.confirmPassword"
                class="form-control"
                :class="{ 'is-invalid': errors.confirmPassword }"
                placeholder="Xác nhận mật khẩu"
                autocomplete="new-password"
              >
            </div>
            <div class="invalid-feedback" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</div>
          </div>

    

          <!-- Submit button -->
          <button
            type="submit"
            class="btn btn-primary w-100"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting">
              <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              Đang tạo tài khoản...
            </span>
            <span v-else>
              <i class="bi bi-person-plus me-1"></i> Đăng ký
            </span>
          </button>
        </form>

        <div class="text-center mt-3">
          <p class="mb-0">
            Đã có tài khoản?
            <a href="#" class="x-link" @click.prevent="navigateTo('login')">Đăng nhập</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>