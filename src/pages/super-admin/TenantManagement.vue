<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Tenant Management</h1>
          <p class="text-gray-600 mt-1">Manage all tenants in the system</p>
        </div>
        <button
          @click="showCreateModal = true"
          class="btn-primary"
        >
          Add Tenant
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white shadow rounded-lg p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search tenants..."
            class="form-input"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select v-model="filters.type" class="form-select">
            <option value="">All Types</option>
            <option value="restaurant">Restaurant</option>
            <option value="warehouse">Warehouse</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select v-model="filters.status" class="form-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div class="flex items-end">
          <button @click="fetchTenants" class="btn-primary w-full">
            Apply Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Tenants Table -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Tenants</h3>
      </div>
      
      <div v-if="loading" class="p-6 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p class="mt-2 text-gray-500">Loading tenants...</p>
      </div>

      <div v-else-if="tenants.length === 0" class="p-6 text-center text-gray-500">
        No tenants found
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tenant
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Restaurants
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Warehouses
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Users
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="tenant in tenants" :key="tenant.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ tenant.name }}</div>
                  <div class="text-sm text-gray-500">{{ tenant.domain }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                      :class="tenant.type === 'restaurant' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'">
                  {{ tenant.type }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="tenant.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                  {{ tenant.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ tenant.restaurants_count || 0 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ tenant.warehouses_count || 0 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ tenant.users_count || 0 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(tenant.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <button
                    @click="viewTenant(tenant)"
                    class="text-indigo-600 hover:text-indigo-900"
                  >
                    View
                  </button>
                  <button
                    @click="editTenant(tenant)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    v-if="tenant.is_active"
                    @click="deactivateTenant(tenant)"
                    class="text-yellow-600 hover:text-yellow-900"
                  >
                    Deactivate
                  </button>
                  <button
                    v-else
                    @click="activateTenant(tenant)"
                    class="text-green-600 hover:text-green-900"
                  >
                    Activate
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.last_page > 1" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="changePage(pagination.current_page - 1)"
            :disabled="pagination.current_page <= 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            @click="changePage(pagination.current_page + 1)"
            :disabled="pagination.current_page >= pagination.last_page"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Showing
              <span class="font-medium">{{ (pagination.current_page - 1) * pagination.per_page + 1 }}</span>
              to
              <span class="font-medium">{{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }}</span>
              of
              <span class="font-medium">{{ pagination.total }}</span>
              results
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                @click="changePage(pagination.current_page - 1)"
                :disabled="pagination.current_page <= 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                @click="changePage(pagination.current_page + 1)"
                :disabled="pagination.current_page >= pagination.last_page"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ showCreateModal ? 'Create Tenant' : 'Edit Tenant' }}
          </h3>
          
          <form @submit.prevent="showCreateModal ? createTenant() : updateTenant()">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  v-model="tenantForm.name"
                  type="text"
                  required
                  class="form-input"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                <input
                  v-model="tenantForm.domain"
                  type="text"
                  required
                  class="form-input"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select v-model="tenantForm.type" required class="form-select">
                  <option value="">Select Type</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="warehouse">Warehouse</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Subscription Plan</label>
                <input
                  v-model="tenantForm.subscription_plan"
                  type="text"
                  class="form-input"
                />
              </div>
            </div>
            
            <div class="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                @click="closeModal"
                class="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="btn-primary"
              >
                {{ submitting ? 'Saving...' : (showCreateModal ? 'Create' : 'Update') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useToast } from 'vue-toastification'
import axios from 'axios'
import { format } from 'date-fns'

export default {
  name: 'TenantManagement',
  setup() {
    const toast = useToast()
    
    const tenants = ref([])
    const loading = ref(false)
    const submitting = ref(false)
    
    const filters = ref({
      search: '',
      type: '',
      status: ''
    })
    
    const pagination = ref({
      current_page: 1,
      per_page: 15,
      total: 0,
      last_page: 1
    })
    
    const showCreateModal = ref(false)
    const showEditModal = ref(false)
    const editingTenant = ref(null)
    
    const tenantForm = ref({
      name: '',
      domain: '',
      type: '',
      subscription_plan: ''
    })

    const fetchTenants = async (page = 1) => {
      loading.value = true
      try {
        const params = {
          page,
          per_page: pagination.value.per_page,
          ...filters.value
        }
        
        const response = await axios.get('/api/super-admin/tenants', { params })
        tenants.value = response.data.data
        pagination.value = response.data.meta
      } catch (error) {
        toast.error('Failed to fetch tenants')
        console.error('Error fetching tenants:', error)
      } finally {
        loading.value = false
      }
    }

    const createTenant = async () => {
      submitting.value = true
      try {
        await axios.post('/api/super-admin/tenants', tenantForm.value)
        toast.success('Tenant created successfully')
        closeModal()
        fetchTenants()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to create tenant')
      } finally {
        submitting.value = false
      }
    }

    const updateTenant = async () => {
      submitting.value = true
      try {
        await axios.put(`/api/super-admin/tenants/${editingTenant.value.id}`, tenantForm.value)
        toast.success('Tenant updated successfully')
        closeModal()
        fetchTenants()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to update tenant')
      } finally {
        submitting.value = false
      }
    }

    const activateTenant = async (tenant) => {
      try {
        await axios.post(`/api/super-admin/tenants/${tenant.id}/activate`)
        toast.success('Tenant activated successfully')
        fetchTenants()
      } catch (error) {
        toast.error('Failed to activate tenant')
      }
    }

    const deactivateTenant = async (tenant) => {
      try {
        await axios.post(`/api/super-admin/tenants/${tenant.id}/deactivate`)
        toast.success('Tenant deactivated successfully')
        fetchTenants()
      } catch (error) {
        toast.error('Failed to deactivate tenant')
      }
    }

    const editTenant = (tenant) => {
      editingTenant.value = tenant
      tenantForm.value = {
        name: tenant.name,
        domain: tenant.domain,
        type: tenant.type,
        subscription_plan: tenant.subscription_plan || ''
      }
      showEditModal.value = true
    }

    const viewTenant = (tenant) => {
      // TODO: Implement view tenant details
      toast.info('View tenant details - Coming soon')
    }

    const closeModal = () => {
      showCreateModal.value = false
      showEditModal.value = false
      editingTenant.value = null
      tenantForm.value = {
        name: '',
        domain: '',
        type: '',
        subscription_plan: ''
      }
    }

    const changePage = (page) => {
      if (page >= 1 && page <= pagination.value.last_page) {
        fetchTenants(page)
      }
    }

    const formatDate = (date) => {
      return format(new Date(date), 'MMM dd, yyyy')
    }

    // Watch filters for auto-search
    watch(filters, () => {
      fetchTenants(1)
    }, { deep: true })

    onMounted(() => {
      fetchTenants()
    })

    return {
      tenants,
      loading,
      submitting,
      filters,
      pagination,
      showCreateModal,
      showEditModal,
      tenantForm,
      fetchTenants,
      createTenant,
      updateTenant,
      activateTenant,
      deactivateTenant,
      editTenant,
      viewTenant,
      closeModal,
      changePage,
      formatDate
    }
  }
}
</script>