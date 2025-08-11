<template>
  <form @submit.prevent="handleLogin" class="mt-8 space-y-6">
    <div class="rounded-md shadow-sm -space-y-px">
      <div>
        <label for="email" class="sr-only">Email address</label>
        <input
          id="email"
          v-model="form.email"
          name="email"
          type="email"
          autocomplete="email"
          required
          class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
          placeholder="Email address"
        />
      </div>
      <div>
        <label for="password" class="sr-only">Password</label>
        <input
          id="password"
          v-model="form.password"
          name="password"
          type="password"
          autocomplete="current-password"
          required
          class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
          placeholder="Password"
        />
      </div>
    </div>

    <div>
      <button
        type="submit"
        :disabled="loading"
        class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        </span>
        {{ loading ? 'Signing in...' : 'Sign in' }}
      </button>
    </div>

    <!-- Demo credentials -->
    <div class="mt-6 p-4 bg-blue-50 rounded-md">
      <h3 class="text-sm font-medium text-blue-800 mb-2">Demo Credentials:</h3>
      <div class="text-xs text-blue-700 space-y-1">
        <p><strong>Super Admin:</strong> admin@restaurant-inventory.com / admin123</p>
        <p><strong>Tenant Admin:</strong> admin@demo.restaurant-inventory.local / admin123</p>
        <p><strong>Restaurant Manager:</strong> manager@demo.restaurant-inventory.local / admin123</p>
        <p><strong>Warehouse Manager:</strong> warehouse@demo.restaurant-inventory.local / admin123</p>
      </div>
    </div>
  </form>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '../../stores/auth'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const toast = useToast()
    const authStore = useAuthStore()

    const form = ref({
      email: '',
      password: ''
    })

    const loading = ref(false)

    const handleLogin = async () => {
      loading.value = true
      
      try {
        await authStore.login(form.value)
        toast.success('Login successful!')
        
        // Redirect based on user role
        if (authStore.isSuperAdmin) {
          router.push('/super-admin')
        } else if (authStore.isTenantAdmin) {
          router.push('/tenant')
        } else if (authStore.isRestaurantManager || authStore.hasRole('restaurant-staff')) {
          router.push('/restaurant')
        } else if (authStore.isWarehouseManager || authStore.hasRole('warehouse-staff')) {
          router.push('/warehouse')
        } else {
          router.push('/')
        }
      } catch (error) {
        toast.error(error.message || 'Login failed')
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      handleLogin
    }
  }
}
</script>