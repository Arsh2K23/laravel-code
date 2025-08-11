import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('auth_token'),
    isAuthenticated: false,
    permissions: [],
    roles: [],
    tenant: null,
    restaurant: null,
    warehouse: null,
  }),

  getters: {
    isSuperAdmin: (state) => state.roles.includes('super-admin'),
    isTenantAdmin: (state) => state.roles.includes('tenant-admin'),
    isRestaurantManager: (state) => state.roles.includes('restaurant-manager'),
    isWarehouseManager: (state) => state.roles.includes('warehouse-manager'),
    
    canAccessSuperAdmin: (state) => state.roles.includes('super-admin'),
    canAccessTenantAdmin: (state) => 
      state.roles.includes('super-admin') || state.roles.includes('tenant-admin'),
    canAccessRestaurant: (state) => 
      state.roles.includes('super-admin') || 
      state.roles.includes('tenant-admin') || 
      state.roles.includes('restaurant-manager') || 
      state.roles.includes('restaurant-staff'),
    canAccessWarehouse: (state) => 
      state.roles.includes('super-admin') || 
      state.roles.includes('tenant-admin') || 
      state.roles.includes('warehouse-manager') || 
      state.roles.includes('warehouse-staff'),
  },

  actions: {
    async login(credentials) {
      try {
        const response = await axios.post('/api/auth/login', credentials)
        const { user, token, tenant, restaurant, warehouse } = response.data

        this.setAuthData({ user, token, tenant, restaurant, warehouse })
        
        return { success: true, user }
      } catch (error) {
        throw error.response?.data || { message: 'Login failed' }
      }
    },

    async logout() {
      try {
        if (this.token) {
          await axios.post('/api/auth/logout')
        }
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.clearAuthData()
      }
    },

    async checkAuth() {
      if (!this.token) {
        return false
      }

      try {
        const response = await axios.get('/api/auth/me')
        const { user, tenant, restaurant, warehouse } = response.data

        this.setAuthData({ 
          user, 
          token: this.token, 
          tenant, 
          restaurant, 
          warehouse 
        })
        
        return true
      } catch (error) {
        this.clearAuthData()
        return false
      }
    },

    async refreshUser() {
      try {
        const response = await axios.get('/api/auth/me')
        const { user, tenant, restaurant, warehouse } = response.data

        this.user = user
        this.tenant = tenant
        this.restaurant = restaurant
        this.warehouse = warehouse
        this.roles = user.roles || []
        this.permissions = user.permissions || []
      } catch (error) {
        console.error('Failed to refresh user:', error)
      }
    },

    setAuthData({ user, token, tenant, restaurant, warehouse }) {
      this.user = user
      this.token = token
      this.tenant = tenant
      this.restaurant = restaurant
      this.warehouse = warehouse
      this.isAuthenticated = true
      this.roles = user.roles || []
      this.permissions = user.permissions || []

      // Store token in localStorage
      localStorage.setItem('auth_token', token)
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    },

    clearAuthData() {
      this.user = null
      this.token = null
      this.tenant = null
      this.restaurant = null
      this.warehouse = null
      this.isAuthenticated = false
      this.roles = []
      this.permissions = []

      // Remove token from localStorage
      localStorage.removeItem('auth_token')
      
      // Remove axios default header
      delete axios.defaults.headers.common['Authorization']
    },

    hasPermission(permission) {
      return this.permissions.includes(permission) || this.isSuperAdmin
    },

    hasRole(role) {
      return this.roles.includes(role)
    },

    hasAnyRole(roles) {
      return roles.some(role => this.roles.includes(role))
    },

    canAccess(resource, action = 'view') {
      const permission = `${resource}.${action}`
      return this.hasPermission(permission)
    }
  }
})