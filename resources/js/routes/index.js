import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Import layouts
import AuthLayout from '../layouts/AuthLayout.vue'
import SuperAdminLayout from '../layouts/SuperAdminLayout.vue'
import TenantLayout from '../layouts/TenantLayout.vue'
import RestaurantLayout from '../layouts/RestaurantLayout.vue'
import WarehouseLayout from '../layouts/WarehouseLayout.vue'

// Import pages
import Login from '../pages/auth/Login.vue'
import Register from '../pages/auth/Register.vue'
import ForgotPassword from '../pages/auth/ForgotPassword.vue'

// Super Admin pages
import SuperAdminDashboard from '../pages/super-admin/Dashboard.vue'
import TenantManagement from '../pages/super-admin/TenantManagement.vue'
import SystemSettings from '../pages/super-admin/SystemSettings.vue'

// Tenant Admin pages
import TenantDashboard from '../pages/tenant/Dashboard.vue'
import RestaurantManagement from '../pages/tenant/RestaurantManagement.vue'
import WarehouseManagement from '../pages/tenant/WarehouseManagement.vue'

// Restaurant pages
import RestaurantDashboard from '../pages/restaurant/Dashboard.vue'
import RestaurantInventory from '../pages/restaurant/Inventory.vue'
import RestaurantOrders from '../pages/restaurant/Orders.vue'

// Warehouse pages
import WarehouseDashboard from '../pages/warehouse/Dashboard.vue'
import WarehouseInventory from '../pages/warehouse/Inventory.vue'
import WarehouseOrders from '../pages/warehouse/Orders.vue'

const routes = [
  // Auth routes
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      { path: 'login', name: 'login', component: Login },
      { path: 'register', name: 'register', component: Register },
      { path: 'forgot-password', name: 'forgot-password', component: ForgotPassword },
    ]
  },

  // Super Admin routes
  {
    path: '/super-admin',
    component: SuperAdminLayout,
    meta: { requiresAuth: true, requiresRole: 'super-admin' },
    children: [
      { path: '', name: 'super-admin.dashboard', component: SuperAdminDashboard },
      { path: 'tenants', name: 'super-admin.tenants', component: TenantManagement },
      { path: 'settings', name: 'super-admin.settings', component: SystemSettings },
    ]
  },

  // Tenant Admin routes
  {
    path: '/tenant',
    component: TenantLayout,
    meta: { requiresAuth: true, requiresRole: 'tenant-admin' },
    children: [
      { path: '', name: 'tenant.dashboard', component: TenantDashboard },
      { path: 'restaurants', name: 'tenant.restaurants', component: RestaurantManagement },
      { path: 'warehouses', name: 'tenant.warehouses', component: WarehouseManagement },
    ]
  },

  // Restaurant routes
  {
    path: '/restaurant',
    component: RestaurantLayout,
    meta: { requiresAuth: true, requiresRole: ['restaurant-manager', 'restaurant-staff'] },
    children: [
      { path: '', name: 'restaurant.dashboard', component: RestaurantDashboard },
      { path: 'inventory', name: 'restaurant.inventory', component: RestaurantInventory },
      { path: 'orders', name: 'restaurant.orders', component: RestaurantOrders },
    ]
  },

  // Warehouse routes
  {
    path: '/warehouse',
    component: WarehouseLayout,
    meta: { requiresAuth: true, requiresRole: ['warehouse-manager', 'warehouse-staff'] },
    children: [
      { path: '', name: 'warehouse.dashboard', component: WarehouseDashboard },
      { path: 'inventory', name: 'warehouse.inventory', component: WarehouseInventory },
      { path: 'orders', name: 'warehouse.orders', component: WarehouseOrders },
    ]
  },

  // Default redirect
  {
    path: '/',
    redirect: () => {
      const authStore = useAuthStore()
      
      if (!authStore.isAuthenticated) {
        return '/auth/login'
      }

      if (authStore.isSuperAdmin) {
        return '/super-admin'
      }

      if (authStore.isTenantAdmin) {
        return '/tenant'
      }

      if (authStore.isRestaurantManager || authStore.hasRole('restaurant-staff')) {
        return '/restaurant'
      }

      if (authStore.isWarehouseManager || authStore.hasRole('warehouse-staff')) {
        return '/warehouse'
      }

      return '/auth/login'
    }
  },

  // 404 page
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../pages/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/auth/login')
  }

  // Check role requirements
  if (to.meta.requiresRole) {
    const requiredRoles = Array.isArray(to.meta.requiresRole) 
      ? to.meta.requiresRole 
      : [to.meta.requiresRole]

    if (!authStore.hasAnyRole(requiredRoles) && !authStore.isSuperAdmin) {
      return next('/')
    }
  }

  // Redirect authenticated users away from auth pages
  if (to.path.startsWith('/auth') && authStore.isAuthenticated) {
    return next('/')
  }

  next()
})

export default router