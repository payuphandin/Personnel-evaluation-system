<template>
  <div class="tracker-page">
    <div class="blob-1"></div>
    <div class="blob-2"></div>

    <div class="page-header mb-6">
      <div class="header-left">
        <div class="page-icon-wrap">
          <v-icon icon="mdi-timeline-check-outline" size="22" color="white" />
        </div>
        <div>
          <h1 class="page-title">ติดตามสถานะการประเมินรายกรรมการ</h1>
          <p class="page-subtitle">ดูว่ากรรมการแต่ละคนเริ่มทำไปแล้วกี่ข้อ ส่งครบหรือยัง และค้างอยู่ตรงไหน</p>
        </div>
      </div>
      <div class="header-actions">
        <v-btn variant="tonal" color="indigo" rounded="xl" prepend-icon="mdi-refresh" :loading="loading" @click="fetchTracking">
          รีเฟรช
        </v-btn>
        <v-btn variant="outlined" color="indigo-darken-2" rounded="xl" prepend-icon="mdi-arrow-left" @click="router.push('/overview')">
          กลับหน้าแรก
        </v-btn>
      </div>
    </div>

    <v-card class="filter-card mb-6" rounded="xl" elevation="0">
      <v-card-text class="pa-5">
        <v-row dense>
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedPeriod"
              :items="periods"
              item-title="name_th"
              item-value="id"
              label="รอบการประเมิน"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              prepend-inner-icon="mdi-calendar-clock"
              color="indigo"
              hide-details
              @update:model-value="fetchTracking"
            />
          </v-col>
          <v-col cols="12" md="5">
            <v-text-field
              v-model="searchQuery"
              label="ค้นหากรรมการหรือผู้รับการประเมิน"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              prepend-inner-icon="mdi-magnify"
              color="indigo"
              hide-details
              @keyup.enter="fetchTracking"
            />
          </v-col>
          <v-col cols="12" md="3" class="d-flex align-center">
            <v-btn block color="indigo-darken-2" rounded="xl" size="large" class="font-weight-bold" :loading="loading" @click="fetchTracking">
              ค้นหา
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-row dense class="mb-6">
      <v-col cols="12" sm="6" lg="3">
        <div class="stat-card stat-blue">
          <div class="stat-icon"><v-icon icon="mdi-account-group-outline" /></div>
          <div class="stat-value">{{ summary.total_evaluators || 0 }}</div>
          <div class="stat-label">กรรมการทั้งหมด</div>
        </div>
      </v-col>
      <v-col cols="12" sm="6" lg="3">
        <div class="stat-card stat-green">
          <div class="stat-icon"><v-icon icon="mdi-check-decagram-outline" /></div>
          <div class="stat-value">{{ summary.completed_assignments || 0 }}</div>
          <div class="stat-label">งานที่ส่งครบ</div>
        </div>
      </v-col>
      <v-col cols="12" sm="6" lg="3">
        <div class="stat-card stat-amber">
          <div class="stat-icon"><v-icon icon="mdi-progress-clock" /></div>
          <div class="stat-value">{{ summary.in_progress_assignments || 0 }}</div>
          <div class="stat-label">กำลังดำเนินการ</div>
        </div>
      </v-col>
      <v-col cols="12" sm="6" lg="3">
        <div class="stat-card stat-slate">
          <div class="stat-icon"><v-icon icon="mdi-clock-alert-outline" /></div>
          <div class="stat-value">{{ summary.pending_assignments || 0 }}</div>
          <div class="stat-label">ยังไม่เริ่ม</div>
        </div>
      </v-col>
    </v-row>

    <v-card rounded="xl" elevation="0" class="board-shell">
      <div class="board-header">
        <div>
          <div class="table-title">ภาพรวมรายกรรมการ</div>
          <div class="table-subtitle">การ์ดแต่ละใบแสดงชื่อกรรมการ ความคืบหน้า และงานที่กำลังรับผิดชอบ</div>
        </div>
        <v-chip color="indigo" variant="tonal" class="font-weight-bold">
          ความคืบหน้ารวม {{ summary.overall_progress || 0 }}%
        </v-chip>
      </div>

      <v-divider class="border-opacity-10" />

      <v-card-text class="board-body">
        <v-row v-if="filteredEvaluators.length" dense>
          <v-col v-for="ev in filteredEvaluators" :key="ev.evaluator_id" cols="12" md="6" xl="4">
            <v-card class="evaluator-card" rounded="xl" elevation="0">
              <div class="card-top" :style="{ background: cardGradient(ev.overall_progress || 0) }">
                <div class="card-top-row">
                  <v-avatar size="52" color="rgba(255,255,255,0.16)">
                    <span class="text-white font-weight-black text-h6">{{ (ev.evaluator_name || '?')[0] }}</span>
                  </v-avatar>
                  <div class="ml-3 flex-grow-1">
                    <div class="evaluator-name">{{ ev.evaluator_name }}</div>
                    <div class="evaluator-email">{{ ev.evaluator_email }}</div>
                  </div>
                  <v-chip color="white" variant="flat" class="font-weight-black text-indigo-darken-4">
                    {{ ev.overall_progress || 0 }}%
                  </v-chip>
                </div>

                <div class="mt-4 d-flex flex-wrap gap-2">
                  <v-chip size="small" color="white" variant="flat" class="mini-chip text-indigo-darken-4">
                    <v-icon start size="14">mdi-office-building-outline</v-icon>
                    {{ ev.department_name || 'ไม่ระบุแผนก' }}
                  </v-chip>
                  <v-chip size="small" color="white" variant="flat" class="mini-chip text-indigo-darken-4">
                    <v-icon start size="14">mdi-account-group-outline</v-icon>
                    {{ ev.org_group_name || 'ไม่ระบุฝ่าย' }}
                  </v-chip>
                </div>
              </div>

              <div class="card-body">
                <div class="mini-stats">
                  <div class="mini-stat mini-stat-done">
                    <div class="mini-stat-val">{{ ev.completed_assignments }}</div>
                    <div class="mini-stat-label">ส่งครบ</div>
                  </div>
                  <div class="mini-stat mini-stat-wip">
                    <div class="mini-stat-val">{{ ev.in_progress_assignments }}</div>
                    <div class="mini-stat-label">กำลังทำ</div>
                  </div>
                  <div class="mini-stat mini-stat-pending">
                    <div class="mini-stat-val">{{ ev.pending_assignments }}</div>
                    <div class="mini-stat-label">ยังไม่เริ่ม</div>
                  </div>
                </div>

                <div class="progress-block mt-4">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <span class="progress-label">ความคืบหน้า</span>
                    <span class="progress-value">{{ ev.overall_progress || 0 }}%</span>
                  </div>
                  <v-progress-linear
                    :model-value="ev.overall_progress || 0"
                    height="10"
                    rounded
                    :color="progressColor(ev.overall_progress || 0)"
                    bg-color="grey-lighten-3"
                  />
                </div>

                <div class="assignment-preview mt-4">
                  <div class="assignment-preview-head">
                    <span>งานล่าสุด</span>
                    <span>{{ formatDateTime(ev.last_activity_at) }}</span>
                  </div>
                  <div v-if="ev.assignments?.length" class="assignment-preview-item">
                    <div class="assignment-preview-name">{{ ev.assignments[0].evaluatee_name }}</div>
                    <div class="assignment-preview-meta">
                      <span>{{ statusMeta(ev.assignments[0].evaluator_status).label }}</span>
                      <span>{{ ev.assignments[0].progress }}%</span>
                    </div>
                  </div>
                  <div v-else class="assignment-preview-empty">ยังไม่มีรายการมอบหมาย</div>
                </div>

                <div class="card-actions">
                  <v-btn block rounded="xl" color="indigo-darken-2" variant="flat" prepend-icon="mdi-eye-outline" class="font-weight-bold" @click="openDetail(ev)">
                    ดูรายละเอียด
                  </v-btn>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <div v-else class="empty-board">
          <v-icon size="48" color="indigo-lighten-2">mdi-account-search-outline</v-icon>
          <div class="empty-board-title">ไม่พบข้อมูลกรรมการ</div>
          <div class="empty-board-sub">ลองเปลี่ยนรอบประเมินหรือคำค้นหา</div>
        </div>
      </v-card-text>
    </v-card>

    <v-dialog v-model="detailDialog" max-width="1040" scrollable>
      <v-card rounded="2xl" class="detail-card overflow-hidden">
        <div class="detail-header">
          <div>
            <div class="detail-title">รายละเอียดกรรมการ</div>
            <div class="detail-sub">{{ selectedEvaluator?.evaluator_name || '-' }}</div>
          </div>
          <v-chip color="white" variant="flat" class="font-weight-bold text-indigo-darken-4">
            ความคืบหน้า {{ selectedEvaluator?.overall_progress || 0 }}%
          </v-chip>
        </div>

        <v-card-text class="pa-5">
          <v-row dense class="mb-4">
            <v-col cols="12" md="4">
              <div class="detail-metric">
                <div class="detail-metric-label">แผนก</div>
                <div class="detail-metric-value">{{ selectedEvaluator?.department_name || 'ไม่ระบุ' }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="4">
              <div class="detail-metric">
                <div class="detail-metric-label">ฝ่าย</div>
                <div class="detail-metric-value">{{ selectedEvaluator?.org_group_name || 'ไม่ระบุ' }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="4">
              <div class="detail-metric">
                <div class="detail-metric-label">อัปเดตล่าสุด</div>
                <div class="detail-metric-value">{{ formatDateTime(selectedEvaluator?.last_activity_at) }}</div>
              </div>
            </v-col>
          </v-row>

          <v-divider class="mb-4" />

          <div class="assignment-list">
            <div v-for="asg in selectedEvaluator?.assignments || []" :key="asg.assignment_id" class="assignment-card">
              <div class="d-flex justify-space-between align-start flex-wrap gap-2">
                <div>
                  <div class="assignment-name">{{ asg.evaluatee_name }}</div>
                  <div class="cell-sub">{{ asg.evaluatee_email }}</div>
                </div>
                <div class="d-flex align-center gap-2">
                  <v-chip size="small" :color="statusMeta(asg.evaluator_status).color" variant="tonal" class="font-weight-bold">
                    {{ statusMeta(asg.evaluator_status).label }}
                  </v-chip>
                  <v-chip size="small" color="indigo" variant="outlined" class="font-weight-bold">
                    {{ asg.progress }}%
                  </v-chip>
                </div>
              </div>

              <div class="assignment-meta mt-2">
                <span>บทบาท: {{ asg.evaluator_role === 'chairman' ? 'ประธาน' : 'กรรมการร่วม' }}</span>
                <span>ทำแล้ว {{ asg.submitted_count }}/{{ asg.total_indicators }}</span>
                <span>ร่าง {{ asg.draft_count }}</span>
              </div>

              <v-progress-linear
                class="mt-3"
                :model-value="asg.progress"
                height="8"
                rounded
                :color="progressColor(asg.progress)"
                bg-color="grey-lighten-3"
              />

              <div class="cell-sub mt-2">อัปเดตล่าสุด: {{ formatDateTime(asg.last_activity_at) }}</div>
            </div>
          </div>
        </v-card-text>

        <v-divider />
        <div class="pa-4 d-flex justify-end">
          <v-btn color="grey-darken-1" variant="text" rounded="xl" @click="detailDialog = false">ปิด</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const api = axios.create({ baseURL: 'http://localhost:7000/api' })
const getAuth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}` } })

const periods = ref([])
const selectedPeriod = ref(null)
const searchQuery = ref('')
const loading = ref(false)
const summary = ref({})
const evaluators = ref([])
const detailDialog = ref(false)
const selectedEvaluator = ref(null)

const filteredEvaluators = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return evaluators.value
  return evaluators.value.filter((ev) => {
    const hay = [
      ev.evaluator_name,
      ev.evaluator_email,
      ev.department_name,
      ev.org_group_name,
      ...(ev.assignments || []).map(a => `${a.evaluatee_name} ${a.evaluatee_email}`),
    ].join(' ').toLowerCase()
    return hay.includes(q)
  })
})

function statusMeta(status) {
  if (status === 'completed') return { label: 'ส่งครบแล้ว', color: 'green' }
  if (status === 'evaluating') return { label: 'กำลังทำ', color: 'amber' }
  return { label: 'ยังไม่เริ่ม', color: 'blue-grey' }
}

function progressColor(value) {
  if (value >= 100) return 'green'
  if (value >= 50) return 'indigo'
  return 'amber'
}

function cardGradient(progress) {
  if (progress >= 100) return 'linear-gradient(135deg, #0f766e, #10b981)'
  if (progress >= 50) return 'linear-gradient(135deg, #1e3a8a, #4f46e5)'
  return 'linear-gradient(135deg, #5b21b6, #7c3aed)'
}

function formatDateTime(value) {
  if (!value) return 'ยังไม่มีข้อมูล'
  try {
    return new Date(value).toLocaleString('th-TH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return value
  }
}

async function loadPeriods() {
  const { data } = await api.get('/admin/list_periods', getAuth())
  periods.value = data.data || []
  if (!selectedPeriod.value) {
    const active = periods.value.find(p => p.is_active)
    selectedPeriod.value = active?.id || periods.value[0]?.id || null
  }
}

async function fetchTracking() {
  loading.value = true
  try {
    const { data } = await api.get('/admin/evaluator_tracking', {
      ...getAuth(),
      params: {
        period_id: selectedPeriod.value || undefined,
        search: searchQuery.value || undefined,
      },
    })
    summary.value = data.summary || {}
    evaluators.value = data.evaluators || []
  } catch (error) {
    console.error('โหลดสถานะกรรมการไม่สำเร็จ', error)
  } finally {
    loading.value = false
  }
}

function openDetail(item) {
  selectedEvaluator.value = item
  detailDialog.value = true
}

onMounted(async () => {
  await loadPeriods()
  await fetchTracking()
})
</script>

<style scoped>
.tracker-page {
  position: relative;
  min-height: 100vh;
  padding-bottom: 36px;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-card,
.board-shell,
.detail-card {
  backdrop-filter: blur(14px);
  border: 1px solid rgba(99, 102, 241, 0.12);
  box-shadow: 0 18px 60px rgba(15, 23, 42, 0.08);
}

.stat-card {
  border-radius: 22px;
  padding: 20px;
  color: white;
  min-height: 136px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.stat-card::after {
  content: '';
  position: absolute;
  inset: auto -30px -30px auto;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: rgba(255,255,255,0.12);
}

.stat-blue { background: linear-gradient(135deg, #3730a3, #4f46e5); }
.stat-green { background: linear-gradient(135deg, #047857, #10b981); }
.stat-amber { background: linear-gradient(135deg, #b45309, #f59e0b); }
.stat-slate { background: linear-gradient(135deg, #334155, #64748b); }

.stat-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: rgba(255,255,255,0.16);
  margin-bottom: 10px;
}

.stat-value {
  font-size: 28px;
  font-weight: 900;
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  font-weight: 600;
  opacity: 0.92;
}

.board-shell {
  background: rgba(255,255,255,0.86);
}

.board-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
}

.table-title {
  font-size: 18px;
  font-weight: 900;
  color: #1e1b4b;
}

.table-subtitle {
  font-size: 13px;
  color: #64748b;
}

.board-body {
  padding: 18px;
}

.evaluator-card {
  height: 100%;
  overflow: hidden;
  border: 1px solid rgba(99,102,241,0.12);
  background: white;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.evaluator-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08);
}

.card-top {
  padding: 18px;
  color: white;
  min-height: 136px;
}

.card-top-row {
  display: flex;
  align-items: center;
}

.evaluator-name {
  font-size: 16px;
  font-weight: 900;
  line-height: 1.2;
}

.evaluator-email {
  font-size: 12px;
  opacity: 0.9;
  word-break: break-word;
}

.mini-chip {
  font-size: 11px;
  font-weight: 700;
}

.card-body {
  padding: 16px 18px 18px;
}

.mini-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.mini-stat {
  border-radius: 16px;
  padding: 12px 10px;
  text-align: center;
  border: 1px solid rgba(99,102,241,0.08);
  background: #f8fafc;
}

.mini-stat-done { background: rgba(16,185,129,0.08); }
.mini-stat-wip { background: rgba(245,158,11,0.08); }
.mini-stat-pending { background: rgba(100,116,139,0.08); }

.mini-stat-val {
  font-size: 22px;
  font-weight: 900;
  line-height: 1;
  color: #1e293b;
}

.mini-stat-label {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  margin-top: 2px;
}

.progress-label,
.progress-value {
  font-size: 12px;
  font-weight: 700;
  color: #475569;
}

.assignment-preview {
  border: 1px solid rgba(99,102,241,0.08);
  background: #f8fafc;
  border-radius: 16px;
  padding: 12px 14px;
}

.assignment-preview-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: #64748b;
  font-weight: 700;
  margin-bottom: 10px;
}

.assignment-preview-name {
  font-size: 13px;
  font-weight: 800;
  color: #1e1b4b;
}

.assignment-preview-meta {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 11px;
  color: #475569;
  font-weight: 700;
  margin-top: 4px;
}

.assignment-preview-empty {
  font-size: 12px;
  color: #64748b;
}

.card-actions {
  margin-top: 14px;
}

.empty-board {
  min-height: 280px;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 24px;
}

.empty-board-title {
  margin-top: 10px;
  font-size: 16px;
  font-weight: 900;
  color: #1e1b4b;
}

.empty-board-sub {
  margin-top: 4px;
  font-size: 13px;
  color: #64748b;
}

.detail-header {
  padding: 18px 20px;
  color: white;
  background: linear-gradient(135deg, #1e1b4b, #4338ca);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.detail-title {
  font-size: 18px;
  font-weight: 900;
}

.detail-sub {
  font-size: 13px;
  opacity: 0.85;
}

.detail-metric {
  background: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 18px;
  padding: 14px 16px;
}

.detail-metric-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
}

.detail-metric-value {
  font-size: 14px;
  font-weight: 800;
  color: #1e293b;
}

.assignment-list {
  display: grid;
  gap: 14px;
}

.assignment-card {
  border: 1px solid rgba(99, 102, 241, 0.12);
  border-radius: 18px;
  padding: 16px;
  background: white;
}

.assignment-name {
  font-size: 15px;
  font-weight: 900;
  color: #1e1b4b;
}

.assignment-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  font-size: 12px;
  color: #475569;
  font-weight: 600;
}

@media (max-width: 960px) {
  .board-header,
  .detail-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .mini-stats {
    grid-template-columns: 1fr;
  }
}
</style>
