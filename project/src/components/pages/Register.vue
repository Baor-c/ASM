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
  avatarUrl: '',
  form: ''
});

const isSubmitting = ref(false);

function validateForm(): boolean {
  errors.value = {
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatarUrl: '',
    form: ''
  };

  let isValid = true;

  // Display name validation
  if (!form.value.displayName) {
    errors.value.displayName = 'Display name is required';
    isValid = false;
  } else if (form.value.displayName.length < 3) {
    errors.value.displayName = 'Display name must be at least 3 characters';
    isValid = false;
  }

  // Email validation
  if (!form.value.email) {
    errors.value.email = 'Email is required';
    isValid = false;
  } else if (!isValidEmail(form.value.email)) {
    errors.value.email = 'Please enter a valid email address';
    isValid = false;
  }

  if (!form.value.password) {
    errors.value.password = 'Password is required';
    isValid = false;
  } else if (!isValidPassword(form.value.password)) {
    errors.value.password = 'Password must be at least 8 characters with letters and numbers';
    isValid = false;
  }

  if (!form.value.confirmPassword) {
    errors.value.confirmPassword = 'Please confirm your password';
    isValid = false;
  } else if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = 'Passwords do not match';
    isValid = false;
  }

  if (avatarUrl.value && !avatarUrl.value.match(/^https?:\/\/.+/)) {
    errors.value.avatarUrl = 'Please enter a valid URL starting with http:// or https://';
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
    addNotification(`Welcome, ${result.user.displayName}! Your account has been created.`, 'success');
    navigateTo('home');
  } else {
    errors.value.form = result.message || 'Registration failed';
    addNotification(errors.value.form, 'danger');
  }

  isSubmitting.value = false;
}
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-md-8 col-lg-6">
      <div class="x-card bg-white p-4">
        <div class="text-center mb-4">
          <i class="bi bi-twitter text-primary fs-1"></i>
          <h2 class="mt-2">Create an Account</h2>
          <p class="text-secondary">Join the VueX Blog community</p>
        </div>

        <form @submit.prevent="handleSubmit">
          <!-- Form error alert -->
          <div v-if="errors.form" class="alert alert-danger" role="alert">
            {{ errors.form }}
          </div>

          <!-- Display Name input -->
          <div class="mb-3">
            <label for="displayName" class="form-label">Display Name</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-person"></i></span>
              <input
                type="text"
                id="displayName"
                v-model="form.displayName"
                class="form-control"
                :class="{ 'is-invalid': errors.displayName }"
                placeholder="How you want to be known"
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
            <label for="registerPassword" class="form-label">Password</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-lock"></i></span>
              <input
                type="password"
                id="registerPassword"
                v-model="form.password"
                class="form-control"
                :class="{ 'is-invalid': errors.password }"
                placeholder="Create a strong password"
                autocomplete="new-password"
              >
            </div>
            <div class="invalid-feedback" v-if="errors.password">{{ errors.password }}</div>
            <div class="form-text">Password must be at least 8 characters with letters and numbers.</div>
          </div>

          <!-- Confirm Password input -->
          <div class="mb-3">
            <label for="confirmPassword" class="form-label">Confirm Password</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-lock-fill"></i></span>
              <input
                type="password"
                id="confirmPassword"
                v-model="form.confirmPassword"
                class="form-control"
                :class="{ 'is-invalid': errors.confirmPassword }"
                placeholder="Confirm your password"
                autocomplete="new-password"
              >
            </div>
            <div class="invalid-feedback" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</div>
          </div>

          <!-- Avatar URL input (optional) -->
          <div class="mb-4">
            <label for="avatarUrl" class="form-label">Avatar URL (optional)</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-image"></i></span>
              <input
                type="text"
                id="avatarUrl"
                v-model="avatarUrl"
                class="form-control"
                :class="{ 'is-invalid': errors.avatarUrl }"
                placeholder="https://example.com/your-avatar.jpg"
              >
            </div>
            <div class="invalid-feedback" v-if="errors.avatarUrl">{{ errors.avatarUrl }}</div>
            <div class="form-text">If left blank, a default avatar will be generated.</div>
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            class="btn btn-primary w-100"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting">
              <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              Creating Account...
            </span>
            <span v-else>
              <i class="bi bi-person-plus me-1"></i> Register
            </span>
          </button>
        </form>

        <div class="text-center mt-3">
          <p class="mb-0">
            Already have an account?
            <a href="#" class="x-link" @click.prevent="navigateTo('login')">Login</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>