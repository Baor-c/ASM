import { createApp } from 'vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './style.css'
import App from './App.vue'
import { initializeStore } from './store'

// Initialize data store with sample data
initializeStore()

// Import Bootstrap JS
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

createApp(App).mount('#app')