import { useAuthStore } from '../stores/auth'

// Import layouts
import AuthLayout from '../layouts/AuthLayout.vue'
import SuperAdminLayout from '../layouts/SuperAdminLayout.vue'
import TenantLayout from '../layouts/TenantLayout.vue'
import RestaurantLayout from '../layouts/RestaurantLayout.vue'
import WarehouseLayout from '../layouts/WarehouseLayout.vue'

// Import pages
import Login from '../pages/auth/Login.vue'

// Super Admin pages
import SuperAdminDashboard from '../pages/super-admin/Dashboard.vue'
import TenantManagement from '../pages/super-admin/TenantManagement.vue'

// Tenant Admin pages
import TenantDashboard from '../pages/tenant/Dashboard.vue'

// Restaurant pages
import RestaurantDashboard from '../pages/restaurant/Dashboard.vue'

// Warehouse pages
import WarehouseDashboard from '../pages/warehouse/Dashboard.vue'

const routes = [
  // Auth routes
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      { path: 'login', name: 'login', component: Login },
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
    ]
  },

  // Tenant Admin routes
  {
    path: '/tenant',
    component: TenantLayout,
    meta: { requiresAuth: true, requiresRole: 'tenant-admin' },
    children: [
      { path: '', name: 'tenant.dashboard', component: TenantDashboard },
    ]
  },

  // Restaurant routes
  {
    path: '/restaurant',
    component: RestaurantLayout,
    meta: { requiresAuth: true, requiresRole: ['restaurant-manager', 'restaurant-staff'] },
    children: [
      { path: '', name: 'restaurant.dashboard', component: RestaurantDashboard },
    ]
  },

  // Warehouse routes
  {
    path: '/warehouse',
    component: WarehouseLayout,
    meta: { requiresAuth: true, requiresRole: ['warehouse-manager', 'warehouse-staff'] },
    children: [
      { path: '', name: 'warehouse.dashboard', component: WarehouseDashboard },
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

export default routes