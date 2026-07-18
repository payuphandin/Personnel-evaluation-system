<template>
  <div class="report-page">
    <div class="blob-1"></div>
    <div class="blob-2"></div>

    <div class="page-header mb-6">
      <div class="header-left">
        <div class="page-icon-wrap">
          <v-icon icon="mdi-file-account-outline" size="22" color="white" />
        </div>
        <div>
          <h1 class="page-title">รายงานผลการประเมินรายบุคคล</h1>
          <p class="page-subtitle">สรุปสถานะ คะแนน และความเห็นของผู้ถูกประเมินแบบอ่านง่ายในหน้าเดียว</p>
        </div>
      </div>
      <div class="header-actions">
        <v-btn variant="tonal" color="indigo" rounded="xl" prepend-icon="mdi-refresh" :loading="loading" @click="fetchReport">
          รีเฟรช
        </v-btn>
        <v-btn variant="outlined" color="indigo-darken-2" rounded="xl" prepend-icon="mdi-printer-outline" :disabled="!hasData" @click="printReport">
          พิมพ์
        </v-btn>
        <v-btn variant="outlined" color="indigo-darken-2" rounded="xl" prepend-icon="mdi-arrow-left" @click="router.push('/overview')">
          กลับหน้าหลัก
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
              @update:model-value="onFilterChange"
            />
          </v-col>
          <v-col cols="12" md="5">
            <v-autocomplete
              v-model="selectedEvaluatee"
              :items="evaluatees"
              item-title="name_th"
              item-value="id"
              label="ผู้ถูกประเมิน"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              prepend-inner-icon="mdi-account-school"
              color="indigo"
              hide-details
              :disabled="!selectedPeriod"
              @update:model-value="onFilterChange"
            >
              <template #item="{ props, item }">
                <v-list-item v-bind="props" :title="item.raw.name_th" :subtitle="item.raw.email || item.raw.department_name || ''" />
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="12" md="3" class="d-flex align-center">
            <v-btn block color="indigo-darken-2" rounded="xl" size="large" class="font-weight-bold" :loading="loading" :disabled="!selectedPeriod || !selectedEvaluatee" @click="fetchReport">
              ดูรายงาน
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <div v-if="!hasData && !loading && !hasFetched" class="empty-state">
      <div class="empty-visual">
        <div class="empty-orbit o1"></div>
        <div class="empty-orbit o2"></div>
        <div class="empty-core">
          <v-icon size="44" color="indigo-lighten-1">mdi-file-search-outline</v-icon>
        </div>
      </div>
      <h3 class="empty-title mt-8">เลือกผู้ถูกประเมินและรอบประเมิน</h3>
      <p class="empty-sub">จากนั้นกดดูรายงานเพื่อแสดงข้อมูลแบบรายบุคคล</p>
    </div>

    <div v-else-if="loading" class="loading-state">
      <v-progress-circular indeterminate color="indigo" size="48" width="4" />
      <div class="loading-text">กำลังโหลดรายงาน...</div>
    </div>

    <template v-else-if="hasData">
      <div class="hero-card mb-6">
        <div class="hero-left">
          <v-avatar size="64" color="rgba(255,255,255,0.14)" class="hero-avatar">
            <span class="text-white font-weight-black text-h4">{{ (report.evaluatee?.evaluatee_name || '?')[0] }}</span>
          </v-avatar>
          <div>
            <div class="hero-title">{{ report.evaluatee?.evaluatee_name }}</div>
            <div class="hero-sub">{{ report.evaluatee?.evaluatee_email }}</div>
            <div class="hero-chips">
              <v-chip size="small" color="white" variant="flat" class="font-weight-bold text-indigo-darken-4">
                <v-icon start size="14">mdi-calendar-check</v-icon>
                {{ report.period?.name_th || '-' }}
              </v-chip>
              <v-chip size="small" color="white" variant="flat" class="font-weight-bold text-indigo-darken-4">
                <v-icon start size="14">mdi-office-building-outline</v-icon>
                {{ report.evaluatee?.department_name || 'ไม่ระบุแผนก' }}
              </v-chip>
              <v-chip size="small" color="white" variant="flat" class="font-weight-bold text-indigo-darken-4">
                <v-icon start size="14">mdi-briefcase-outline</v-icon>
                {{ report.evaluatee?.position || 'ไม่ระบุตำแหน่ง' }}
              </v-chip>
            </div>
          </div>
        </div>
        <div class="hero-right">
          <v-chip color="white" variant="flat" class="font-weight-black text-indigo-darken-4 mb-2">
            {{ report.summary?.overall_status || '-' }}
          </v-chip>
          <div class="hero-meta">อัปเดตล่าสุด {{ formatDateTime(report.summary?.last_activity_at) }}</div>
        </div>
      </div>

      <v-row dense class="mb-6">
        <v-col cols="12" sm="6" lg="3">
          <div class="stat-card stat-green">
            <div class="stat-icon"><v-icon icon="mdi-account-check-outline" /></div>
            <div class="stat-value">{{ report.summary?.self_progress || 0 }}%</div>
            <div class="stat-label">self-evaluation</div>
          </div>
        </v-col>
        <v-col cols="12" sm="6" lg="3">
          <div class="stat-card stat-blue">
            <div class="stat-icon"><v-icon icon="mdi-account-multiple-check-outline" /></div>
            <div class="stat-value">{{ report.summary?.committee_progress || 0 }}%</div>
            <div class="stat-label">กรรมการ</div>
          </div>
        </v-col>
        <v-col cols="12" sm="6" lg="3">
          <div class="stat-card stat-amber">
            <div class="stat-icon"><v-icon icon="mdi-check-decagram-outline" /></div>
            <div class="stat-value">{{ report.summary?.committee_completed || 0 }}</div>
            <div class="stat-label">กรรมการประเมินครบ</div>
          </div>
        </v-col>
        <v-col cols="12" sm="6" lg="3">
          <div class="stat-card stat-slate">
            <div class="stat-icon"><v-icon icon="mdi-format-list-bulleted-check" /></div>
            <div class="stat-value">{{ report.summary?.self_submitted_count || 0 }}/{{ report.summary?.self_total_count || 0 }}</div>
            <div class="stat-label">รายการ self ที่ส่งแล้ว</div>
          </div>
        </v-col>
      </v-row>

      <v-row dense class="mb-6">
        <v-col cols="12" lg="5">
          <v-card rounded="xl" elevation="0" class="panel-card">
            <div class="panel-header">
              <div>
                <div class="panel-title">สถานะ self-evaluation</div>
                <div class="panel-sub">ข้อมูลจากผู้ถูกประเมินโดยตรง</div>
              </div>
              <v-chip :color="selfStatusMeta(report.summary?.self_status).color" variant="tonal" class="font-weight-bold">
                {{ selfStatusMeta(report.summary?.self_status).label }}
              </v-chip>
            </div>
            <v-divider class="border-opacity-10" />
            <v-card-text class="pa-5">
              <div class="progress-block mb-4">
                <div class="d-flex justify-space-between align-center mb-2">
                  <span class="progress-label">ความคืบหน้า self-evaluation</span>
                  <span class="progress-value">{{ report.summary?.self_progress || 0 }}%</span>
                </div>
                <v-progress-linear
                  :model-value="report.summary?.self_progress || 0"
                  height="10"
                  rounded
                  :color="progressColor(report.summary?.self_progress || 0)"
                  bg-color="grey-lighten-3"
                />
              </div>
              <div class="detail-metric mb-3">
                <div class="detail-metric-label">ส่งเมื่อ</div>
                <div class="detail-metric-value">{{ formatDateTime(report.evaluatee?.self_submission?.signed_at) }}</div>
              </div>
              <div class="detail-metric">
                <div class="detail-metric-label">หมายเหตุ</div>
                <div class="detail-metric-value">{{ selfStatusMeta(report.summary?.self_status).label }}</div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="7">
          <v-card rounded="xl" elevation="0" class="panel-card">
            <div class="panel-header">
              <div>
                <div class="panel-title">กรรมการในรอบนี้</div>
                <div class="panel-sub">แสดงชื่อและความคืบหน้าแต่ละท่าน</div>
              </div>
              <v-chip color="indigo" variant="tonal" class="font-weight-bold">
                {{ report.evaluators?.length || 0 }} ท่าน
              </v-chip>
            </div>
            <v-divider class="border-opacity-10" />
            <v-card-text class="pa-5">
              <div class="evaluator-list">
                <div v-for="ev in report.evaluators || []" :key="ev.evaluator_id" class="evaluator-pill">
                  <div class="evaluator-pill-main">
                    <div class="evaluator-name">{{ ev.evaluator_name }}</div>
                    <div class="evaluator-sub">{{ roleLabel(ev.evaluator_role) }} · {{ ev.evaluator_email }}</div>
                  </div>
                  <div class="d-flex align-center gap-2">
                    <v-chip size="small" :color="statusMeta(ev.evaluator_status).color" variant="tonal" class="font-weight-bold">
                      {{ statusMeta(ev.evaluator_status).label }}
                    </v-chip>
                    <v-chip size="small" color="indigo" variant="outlined" class="font-weight-bold">
                      {{ ev.progress }}%
                    </v-chip>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-card rounded="xl" elevation="0" class="board-shell">
        <div class="board-header">
          <div>
            <div class="table-title">รายละเอียดรายหัวข้อ</div>
            <div class="table-subtitle">แยกเป็นการ์ดเพื่อให้เห็นผล self และกรรมการชัดเจน</div>
          </div>
          <v-chip color="indigo" variant="tonal" class="font-weight-bold">
            {{ report.indicators?.length || 0 }} ตัวชี้วัด
          </v-chip>
        </div>

        <v-divider class="border-opacity-10" />

        <v-card-text class="board-body">
          <v-expansion-panels variant="accordion" multiple>
            <v-expansion-panel v-for="topic in topicGroups" :key="topic.topic_id" class="topic-panel">
              <v-expansion-panel-title class="topic-title-wrap">
                <div class="d-flex align-center gap-3">
                  <div class="topic-badge">{{ topic.topicIndex }}</div>
                  <div>
                    <div class="topic-name">{{ topic.topic_title }}</div>
                    <div class="topic-sub">{{ topic.items.length }} ตัวชี้วัด</div>
                  </div>
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text class="pt-2">
                <v-row dense>
                  <v-col v-for="ind in topic.items" :key="ind.indicator_id" cols="12" md="6" xl="4">
                    <v-card class="indicator-card" rounded="xl" elevation="0">
                      <div class="indicator-head">
                        <div>
                          <div class="indicator-code">{{ ind.indicator_code }}</div>
                          <div class="indicator-name">{{ ind.indicator_name }}</div>
                        </div>
                        <v-chip size="x-small" color="indigo" variant="tonal" class="font-weight-bold">
                          {{ typeLabel(ind.indicator_type) }}
                        </v-chip>
                      </div>

                      <div class="indicator-grid mt-4">
                        <div class="result-block result-self">
                          <div class="result-label">self</div>
                          <template v-if="ind.self_result">
                            <div v-if="ind.indicator_type === 'score_1_4'" class="result-score">{{ formatScore(ind.self_result.score) }}</div>
                            <div v-else class="result-badge" :class="ind.self_result.value_yes_no ? 'pass' : 'fail'">
                              {{ ind.self_result.value_yes_no ? 'ผ่าน' : 'ไม่ผ่าน' }}
                            </div>
                            <div class="result-meta">{{ selfStatusMeta(ind.self_result.status).label }}</div>
                          </template>
                          <div v-else class="result-empty">ยังไม่มีข้อมูล</div>
                        </div>

                        <div class="result-block result-committee">
                          <div class="result-label">กรรมการ</div>
                          <div v-if="ind.indicator_type === 'score_1_4' && ind.committee_avg_score !== null" class="result-score">
                            {{ ind.committee_avg_score }}
                          </div>
                          <div v-else-if="ind.indicator_type !== 'score_1_4' && ind.committee_avg_yes_no !== null" class="result-score">
                            {{ ind.committee_avg_yes_no }}%
                          </div>
                          <div v-else class="result-empty">รอข้อมูล</div>
                          <div class="result-meta">{{ ind.committee_submitted_count }}/{{ ind.committee_total_count }} รายการ</div>
                        </div>
                      </div>

                      <div class="result-notes mt-4" v-if="ind.self_result?.notes || hasCommitteeNotes(ind)">
                        <div class="notes-title-sm">หมายเหตุ</div>
                        <div class="note-line" v-if="ind.self_result?.notes">
                          <strong>self:</strong> {{ ind.self_result.notes }}
                        </div>
                        <div
                          v-for="note in committeeNotes(ind)"
                          :key="`${ind.indicator_id}-${note.evaluator_id}`"
                          class="note-line"
                        >
                          <strong>{{ note.evaluator_name }}:</strong> {{ note.notes }}
                        </div>
                      </div>

                      <div class="committee-chips mt-4">
                        <v-chip
                          v-for="score in ind.committee_scores"
                          :key="`${ind.indicator_id}-${score.evaluator_id}`"
                          size="small"
                          variant="tonal"
                          :color="score.status === 'submitted' ? 'green' : 'blue-grey'"
                          class="committee-chip"
                        >
                          {{ score.evaluator_name }} · {{ scoreLabel(ind.indicator_type, score) }}
                        </v-chip>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
      </v-card>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const api = axios.create({ baseURL: 'http://localhost:7000/api' })
const getAuth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}` } })

const periods = ref([])
const evaluatees = ref([])
const selectedPeriod = ref(null)
const selectedEvaluatee = ref(null)
const loading = ref(false)
const hasFetched = ref(false)
const report = ref({})

const hasData = computed(() => Array.isArray(report.value?.indicators) && report.value.indicators.length > 0)

const topicGroups = computed(() => {
  const items = report.value?.indicators || []
  const map = new Map()
  items.forEach((item) => {
    if (!map.has(item.topic_id)) {
      map.set(item.topic_id, {
        topic_id: item.topic_id,
        topic_title: item.topic_title,
        items: [],
      })
    }
    map.get(item.topic_id).items.push(item)
  })
  return Array.from(map.values()).map((group, index) => ({
    ...group,
    topicIndex: index + 1,
  }))
})

function onFilterChange() {
  hasFetched.value = false
  report.value = {}
}

function statusMeta(status) {
  if (status === 'completed') return { label: 'เสร็จแล้ว', color: 'green' }
  if (status === 'evaluating') return { label: 'กำลังประเมิน', color: 'amber' }
  return { label: 'รอดำเนินการ', color: 'blue-grey' }
}

function selfStatusMeta(status) {
  if (status === 'submitted') return { label: 'ส่งแล้ว', color: 'green' }
  if (status === 'draft') return { label: 'บันทึกร่าง', color: 'amber' }
  if (status === 'pending') return { label: 'รอเริ่ม', color: 'blue-grey' }
  return { label: 'ไม่ระบุ', color: 'grey' }
}

function typeLabel(type) {
  return type === 'score_1_4' ? '1-4 คะแนน' : 'ใช่/ไม่ใช่'
}

function formatScore(score) {
  if (score === null || score === undefined || score === '') return '—'
  const n = Number(score)
  return Number.isFinite(n) ? n.toFixed(2).replace(/\.00$/, '') : String(score)
}

function scoreLabel(type, score) {
  if (!score || score.status !== 'submitted') return 'รอ'
  if (type === 'score_1_4') return formatScore(score.score)
  return score.value_yes_no ? 'ผ่าน' : 'ไม่ผ่าน'
}

function roleLabel(role) {
  if (role === 'chairman') return 'ประธาน'
  if (role === 'joint') return 'กรรมการร่วม'
  return role || '-'
}

function progressColor(value) {
  if (value >= 100) return 'green'
  if (value >= 50) return 'indigo'
  return 'amber'
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

function hasCommitteeNotes(ind) {
  return (ind.committee_scores || []).some((score) => score.notes)
}

function committeeNotes(ind) {
  return (ind.committee_scores || []).filter((score) => score.notes)
}

async function loadPeriods() {
  const { data } = await api.get('/admin/list_periods', getAuth())
  periods.value = data.data || []
  if (!selectedPeriod.value) {
    const active = periods.value.find((p) => p.is_active)
    selectedPeriod.value = active?.id || periods.value[0]?.id || null
  }
}

async function loadEvaluatees() {
  const { data } = await api.get('/admin/list_evaluatee?role=evaluatee', getAuth())
  evaluatees.value = data.data || []
}

async function fetchReport() {
  if (!selectedPeriod.value || !selectedEvaluatee.value) return
  loading.value = true
  hasFetched.value = false
  try {
    const { data } = await api.get('/admin/individual_report', {
      ...getAuth(),
      params: {
        period_id: selectedPeriod.value,
        evaluatee_id: selectedEvaluatee.value,
      },
    })
    report.value = data || {}
    hasFetched.value = true
  } catch (error) {
    console.error('โหลดรายงานรายบุคคลไม่สำเร็จ', error)
    hasFetched.value = true
  } finally {
    loading.value = false
  }
}

function printReport() {
  window.print()
}

onMounted(async () => {
  if (!localStorage.getItem("auth_token")) { router.push('/'); return }
  await Promise.all([loadPeriods(), loadEvaluatees()])

  if (route.query.period_id) selectedPeriod.value = Number(route.query.period_id)
  if (route.query.evaluatee_id) selectedEvaluatee.value = Number(route.query.evaluatee_id)

  if (selectedPeriod.value && selectedEvaluatee.value) {
    await fetchReport()
  }
})
</script>

<style scoped>
.report-page {
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
.hero-card,
.panel-card,
.board-shell,
.indicator-card {
  backdrop-filter: blur(14px);
  border: 1px solid rgba(99, 102, 241, 0.12);
  box-shadow: 0 18px 60px rgba(15, 23, 42, 0.08);
}

.hero-card {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 22px;
  border-radius: 24px;
  color: white;
  background: linear-gradient(135deg, #1e1b4b, #4338ca);
}

.hero-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.hero-title {
  font-size: 22px;
  font-weight: 900;
  line-height: 1.2;
}

.hero-sub {
  font-size: 13px;
  opacity: 0.9;
  margin-top: 2px;
}

.hero-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.hero-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
}

.hero-meta {
  font-size: 12px;
  opacity: 0.82;
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

.panel-card {
  background: rgba(255,255,255,0.86);
}

.panel-header,
.board-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
}

.panel-title,
.table-title {
  font-size: 18px;
  font-weight: 900;
  color: #1e1b4b;
}

.panel-sub,
.table-subtitle {
  font-size: 13px;
  color: #64748b;
}

.board-body {
  padding: 18px;
}

.progress-block {
  border: 1px solid rgba(99,102,241,0.08);
  background: #f8fafc;
  border-radius: 16px;
  padding: 12px 14px;
}

.progress-label,
.progress-value {
  font-size: 12px;
  font-weight: 700;
  color: #475569;
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

.evaluator-list {
  display: grid;
  gap: 10px;
}

.evaluator-pill {
  border: 1px solid rgba(99,102,241,0.1);
  background: #fff;
  border-radius: 16px;
  padding: 12px 14px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.evaluator-name {
  font-size: 14px;
  font-weight: 900;
  color: #1e1b4b;
}

.evaluator-sub {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.board-shell {
  background: rgba(255,255,255,0.86);
  border-radius: 24px;
}

.topic-panel {
  border: 1px solid rgba(99,102,241,0.08);
  border-radius: 18px;
  overflow: hidden;
  margin-bottom: 14px;
  background: white;
}

.topic-title-wrap {
  padding: 16px 18px;
}

.topic-badge {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #1e1b4b, #4338ca);
  color: white;
  font-weight: 900;
}

.topic-name {
  font-size: 16px;
  font-weight: 900;
  color: #1e1b4b;
}

.topic-sub {
  font-size: 12px;
  color: #64748b;
}

.indicator-card {
  height: 100%;
  border-radius: 20px;
  padding: 18px;
  background: white;
}

.indicator-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.indicator-code {
  font-size: 11px;
  font-weight: 900;
  color: #4f46e5;
  margin-bottom: 4px;
}

.indicator-name {
  font-size: 14px;
  font-weight: 800;
  color: #1e1b4b;
  line-height: 1.45;
}

.indicator-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.result-block {
  border-radius: 16px;
  padding: 12px;
  background: #f8fafc;
  border: 1px solid rgba(99,102,241,0.08);
}

.result-self {
  background: rgba(16,185,129,0.08);
}

.result-committee {
  background: rgba(79,70,229,0.08);
}

.result-label {
  font-size: 11px;
  font-weight: 900;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 8px;
}

.result-score {
  font-size: 24px;
  font-weight: 900;
  color: #1e293b;
  line-height: 1;
}

.result-badge {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.result-badge.pass {
  background: rgba(5,150,105,0.12);
  color: #059669;
}

.result-badge.fail {
  background: rgba(220,38,38,0.12);
  color: #dc2626;
}

.result-meta {
  margin-top: 8px;
  font-size: 11px;
  color: #64748b;
  font-weight: 700;
}

.result-empty {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 600;
}

.result-notes {
  border: 1px solid rgba(99,102,241,0.08);
  background: #f8fafc;
  border-radius: 16px;
  padding: 12px 14px;
}

.notes-title-sm {
  font-size: 11px;
  font-weight: 900;
  color: #4c1d95;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.note-line {
  font-size: 12px;
  color: #475569;
  line-height: 1.55;
}

.committee-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.committee-chip {
  max-width: 100%;
}

.empty-state,
.loading-state {
  text-align: center;
  padding: 64px 20px;
}

.loading-text {
  font-size: 14px;
  font-weight: 600;
  color: #5c6bc0;
  margin-top: 16px;
}

.empty-visual {
  position: relative;
  width: 140px;
  height: 140px;
  margin: 0 auto;
}

.empty-core {
  position: absolute;
  inset: 30px;
  border-radius: 50%;
  background: rgba(99,102,241,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-orbit {
  position: absolute;
  border-radius: 50%;
  border: 1.5px solid rgba(99,102,241,0.1);
}

.o1 { inset: 0; animation: orbitSpin 8s linear infinite; }
.o2 { inset: -20px; border-style: dashed; border-color: rgba(99,102,241,0.06); animation: orbitSpin 12s linear infinite reverse; }

.empty-title {
  font-size: 22px;
  font-weight: 800;
  color: #1e1b4b;
}

.empty-sub {
  font-size: 14px;
  color: #64748b;
  max-width: 420px;
  margin: 0 auto;
}

.blob-1, .blob-2 {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  z-index: 0;
  opacity: 0.35;
  pointer-events: none;
}

.blob-1 { top: -120px; left: -60px; width: 600px; height: 600px; background: rgba(165,180,252,0.3); }
.blob-2 { bottom: 5%; right: -60px; width: 500px; height: 500px; background: rgba(192,132,252,0.18); }

.page-header { display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 1; flex-wrap: wrap; gap: 12px; }
.header-left { display: flex; align-items: center; gap: 14px; }
.page-icon-wrap { width: 46px; height: 46px; border-radius: 14px; flex-shrink: 0; background: linear-gradient(135deg, #1a237e, #4338ca); display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(26,35,126,0.3); }
.page-title { font-size: 20px; font-weight: 800; color: #1a237e; letter-spacing: -0.4px; line-height: 1.2; }
.page-subtitle { font-size: 12.5px; color: #78909c; margin: 0; }

@keyframes orbitSpin { to { transform: rotate(360deg); } }

@media print {
  .header-actions,
  .filter-card {
    display: none !important;
  }
  .report-page {
    padding: 0;
  }
  .panel-card,
  .board-shell,
  .indicator-card,
  .hero-card {
    box-shadow: none !important;
  }
}

@media (max-width: 960px) {
  .hero-card,
  .panel-header,
  .board-header,
  .evaluator-pill {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-right {
    align-items: flex-start;
  }

  .indicator-grid {
    grid-template-columns: 1fr;
  }
}
</style>
