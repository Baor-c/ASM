<script setup lang="ts">
import { ref } from 'vue';
import { LoginForm } from '../../types';
import { loginUser, navigateTo, addNotification } from '../../store';
import { isValidEmail } from '../../utils';

const form = ref<LoginForm>({
  email: '',
  password: ''
});

const errors = ref({
  email: '',
  password: '',
  form: ''
});

const isSubmitting = ref(false);

function validateForm(): boolean {
  errors.value = {
    email: '',
    password: '',
    form: ''
  };

  let isValid = true;

  // Email validation
  if (!form.value.email) {
    errors.value.email = 'Email is required';
    isValid = false;
  } else if (!isValidEmail(form.value.email)) {
    errors.value.email = 'Please enter a valid email address';
    isValid = false;
  }

  // Password validation
  if (!form.value.password) {
    errors.value.password = 'Password is required';
    isValid = false;
  }

  return isValid;
}

function handleSubmit() {
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  // Attempt to login
  const result = loginUser(form.value.email, form.value.password);

  if (result.success) {
    addNotification(`Welcome back, ${result.user.displayName}!`, 'success');
    navigateTo('home');
  } else {
    errors.value.form = result.message || 'Invalid login credentials';
    addNotification(errors.value.form, 'danger');
  }

  isSubmitting.value = false;
}
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-md-6 col-lg-5">
      <div class="x-card bg-white p-4">
        <div class="text-center mb-4">
          <i class="bi bi-twitter text-primary fs-1"></i>
          <h2 class="mt-2">Login to VueX Blog</h2>
          <p class="text-secondary">Enter your credentials to access your account</p>
        </div>

        <form @submit.prevent="handleSubmit">
          <!-- Form error alert -->
          <div v-if="errors.form" class="alert alert-danger" role="alert">
            {{ errors.form }}
          </div>

          <!-- Email input -->
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-envelope"></i></span>
              <input
                type="email"
                id="email"
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
          <div class="mb-4">
            <label for="password" class="form-label">Password</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-lock"></i></span>
              <input
                type="password"
                id="password"
                v-model="form.password"
                class="form-control"
                :class="{ 'is-invalid': errors.password }"
                placeholder="Enter your password"
                autocomplete="current-password"
              >
            </div>
            <div class="invalid-feedback" v-if="errors.password">{{ errors.password }}</div>
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            class="btn btn-primary w-100"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting">
              <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              Logging in...
            </span>
            <span v-else>
              <i class="bi bi-box-arrow-in-right me-1"></i> Login
            </span>
          </button>
        </form>

        <div class="text-center mt-3">
          <p class="mb-0">
            Don't have an account? 
            <a href="#" class="x-link" @click.prevent="navigateTo('register')">Register now</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>