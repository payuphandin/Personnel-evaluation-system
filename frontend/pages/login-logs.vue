<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

definePageMeta({
  layout: 'default'
})

const router = useRouter()
const logs = ref([])
const totalLogs = ref(0)
const page = ref(1)
const limit = ref(15)
const search = ref('')
const statusFilter = ref('')
const roleFilter = ref('')
const loading = ref(false)

const roleOptions = [
  { title: 'ทั้งหมด', value: '' },
  { title: 'ผู้ดูแลระบบ (Admin)', value: 'admin' },
  { title: 'ผู้ประเมิน (Evaluator)', value: 'evaluator' },
  { title: 'ผู้รับการประเมิน (Evaluatee)', value: 'evaluatee' }
]

const statusOptions = [
  { title: 'ทั้งหมด', value: '' },
  { title: 'สำเร็จ (Success)', value: 'success' },
  { title: 'ล้มเหลว (Fail)', value: 'fail' }
]

onMounted(() => {
  // ตรวจสอบความปลอดภัยเบื้องต้น
  const userRaw = localStorage.getItem('auth_user')
  if (userRaw) {
    const user = JSON.parse(userRaw)
    if (user.role !== 'admin') {
      router.push('/')
      return
    }
  } else {
    router.push('/')
    return
  }

  fetchLogs()
})

async function fetchLogs() {
  const token = localStorage.getItem('auth_token')
  if (!token) return

  loading.value = true
  try {
    const { data } = await axios.get('http://localhost:7000/api/admin/login_logs', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        page: page.value,
        limit: limit.value,
        search: search.value,
        role: roleFilter.value,
        status: statusFilter.value
      }
    })
    if (data.success) {
      logs.value = data.data || []
      totalLogs.value = data.total || 0
    }
  } catch (err) {
    console.error('Failed to fetch login logs', err)
  } finally {
    loading.value = false
  }
}

// โหลดข้อมูลใหม่เมื่อหน้าหรือตัวกรองเปลี่ยน
watch([page, statusFilter, roleFilter], () => {
  fetchLogs()
})

// ค้นหาแบบดีเลย์
let searchTimeout = null
function handleSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    fetchLogs()
  }, 500)
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }) + ' น.'
}

function getStatusBadge(status) {
  if (status === 'success') {
    return { color: 'success', label: 'สำเร็จ', icon: 'mdi-check-circle-outline' }
  }
  return { color: 'error', label: 'ล้มเหลว', icon: 'mdi-alert-circle-outline' }
}

function getRoleLabel(role) {
  const labels = {
    admin: 'ผู้ดูแลระบบ',
    evaluator: 'ผู้ประเมิน',
    evaluatee: 'ผู้รับการประเมิน',
    unknown: 'ไม่ทราบผู้ใช้งาน'
  }
  return labels[role] || role
}

function getRoleColor(role) {
  const colors = {
    admin: 'indigo-darken-3',
    evaluator: 'amber-darken-3',
    evaluatee: 'cyan-darken-2'
  }
  return colors[role] || 'grey'
}

const pageCount = computed(() => Math.ceil(totalLogs.value / limit.value))
</script>

<template>
  <div class="login-logs-page">
    <!-- Header Area -->
    <div class="d-flex flex-column flex-sm-row justify-between align-start align-sm-center mb-6 gap-3">
      <div>
        <h1 class="text-h4 font-weight-black text-indigo-darken-4 tracking-tight d-flex align-center">
          <v-icon color="indigo-darken-4" class="me-2" size="32">mdi-history</v-icon>
          ประวัติการเข้าใช้งานระบบ
        </h1>
        <div class="text-subtitle-2 text-grey-darken-1 mt-1">
          ระบบตรวจสอบประวัติและสถิติการล็อกอินเข้าใช้งานของบุคลากรทั้งหมด
        </div>
      </div>
      <v-btn color="indigo-darken-4" variant="elevated" rounded="xl" prepend-icon="mdi-refresh"
        @click="fetchLogs" :loading="loading" class="font-weight-bold px-5 shadow-indigo">
        โหลดข้อมูลใหม่
      </v-btn>
    </div>

    <!-- Filter Card -->
    <v-card class="glass-card mb-6 pa-5" border="0" elevation="0">
      <v-row dense>
        <v-col cols="12" md="6" lg="5">
          <v-text-field v-model="search" placeholder="ค้นหาชื่อผู้ใช้งานหรืออีเมล..."
            prepend-inner-icon="mdi-magnify" variant="outlined" rounded="lg" color="indigo"
            bg-color="white" density="comfortable" hide-details clearable @input="handleSearchInput" />
        </v-col>
        <v-col cols="12" sm="6" md="3" lg="3">
          <v-select v-model="roleFilter" :items="roleOptions" item-title="title" item-value="value"
            label="บทบาทผู้ใช้งาน" variant="outlined" rounded="lg" color="indigo" bg-color="white"
            density="comfortable" hide-details />
        </v-col>
        <v-col cols="12" sm="6" md="3" lg="4">
          <v-select v-model="statusFilter" :items="statusOptions" item-title="title" item-value="value"
            label="สถานะการล็อกอิน" variant="outlined" rounded="lg" color="indigo" bg-color="white"
            density="comfortable" hide-details />
        </v-col>
      </v-row>
    </v-card>

    <!-- Table Card -->
    <v-card class="glass-card table-card overflow-hidden" border="0" elevation="0">
      <div v-if="loading" class="d-flex justify-center align-center py-12">
        <v-progress-circular indeterminate color="indigo-darken-4" size="50" width="4" />
      </div>

      <div v-else-if="logs.length === 0" class="d-flex flex-column align-center justify-center py-12 text-grey">
        <v-icon size="64" color="grey-lighten-1" class="mb-3">mdi-database-off-outline</v-icon>
        <div class="font-weight-bold text-subtitle-1">ไม่พบข้อมูลประวัติการล็อกอิน</div>
        <div class="text-caption">โปรดลองเปลี่ยนคำค้นหาหรือตั้งค่าตัวกรองใหม่</div>
      </div>

      <div v-else class="table-responsive">
        <table class="premium-table">
          <thead>
            <tr>
              <th class="text-left py-4 px-4 font-weight-bold text-indigo-darken-4"># ID Log</th>
              <th class="text-left py-4 px-4 font-weight-bold text-indigo-darken-4">ชื่อผู้ใช้งาน / อีเมล</th>
              <th class="text-left py-4 px-4 font-weight-bold text-indigo-darken-4">บทบาท</th>
              <th class="text-left py-4 px-4 font-weight-bold text-indigo-darken-4">IP Address</th>
              <th class="text-center py-4 px-4 font-weight-bold text-indigo-darken-4" style="width: 130px;">สถานะ</th>
              <th class="text-right py-4 px-4 font-weight-bold text-indigo-darken-4">วันเวลาล็อกอิน</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log.id" class="table-row">
              <td class="py-4 px-4 text-grey-darken-1 font-weight-bold">
                {{ log.id }}
              </td>
              <td class="py-4 px-4">
                <div class="font-weight-black text-indigo-darken-4">{{ log.username }}</div>
              </td>
              <td class="py-4 px-4">
                <v-chip size="small" :color="getRoleColor(log.role)" class="font-weight-bold text-white px-3" density="compact">
                  {{ getRoleLabel(log.role) }}
                </v-chip>
              </td>
              <td class="py-4 px-4 font-mono text-grey-darken-2" style="font-family: monospace !important;">
                {{ log.ip_address || '-' }}
              </td>
              <td class="py-4 px-4 text-center">
                <v-chip size="small" :color="getStatusBadge(log.status).color" variant="flat" class="font-weight-bold px-3 w-100 justify-center" density="compact">
                  <v-icon start size="14" class="mr-1">{{ getStatusBadge(log.status).icon }}</v-icon>
                  {{ getStatusBadge(log.status).label }}
                </v-chip>
              </td>
              <td class="py-4 px-4 text-right font-weight-bold text-blue-grey-darken-1">
                {{ formatDate(log.created_at) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div v-if="pageCount > 1" class="d-flex justify-center border-t py-4 bg-white">
        <v-pagination v-model="page" :length="pageCount" total-visible="6" color="indigo" rounded="xl" />
      </div>
    </v-card>
  </div>
</template>

<style scoped>
.login-logs-page {
  position: relative;
  z-index: 1;
}

.glass-card {
  background: rgba(255, 255, 255, 0.7) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(199, 210, 254, 0.5) !important;
  border-radius: 20px !important;
  box-shadow: 0 8px 30px rgba(99, 102, 241, 0.04) !important;
}

.shadow-indigo {
  box-shadow: 0 4px 14px rgba(26, 35, 126, 0.25) !important;
}

.table-card {
  background: rgba(255, 255, 255, 0.8) !important;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.premium-table {
  width: 100%;
  border-collapse: collapse;
}

.premium-table th {
  background: rgba(237, 242, 255, 0.4);
  font-size: 13px;
  letter-spacing: 0.5px;
  border-bottom: 2px solid rgba(199, 210, 254, 0.4);
}

.premium-table td {
  font-size: 13.5px;
}

.table-row {
  border-bottom: 1px solid rgba(199, 210, 254, 0.2);
  transition: background-color 0.2s;
}

.table-row:hover {
  background-color: rgba(99, 102, 241, 0.03);
}

.font-mono {
  font-family: 'Courier New', Courier, monospace;
}
</style>
