<template>
  <div class="summary-page">
    <div class="blob-1"></div>
    <div class="blob-2"></div>
    <div class="page-header mb-6">
      <div class="header-left">
        <div class="page-icon-wrap">
          <v-icon icon="mdi-chart-box-multiple-outline" size="22" color="white" />
        </div>
        <div>
          <h1 class="page-title">สรุปผลการประเมินรายกรรมการ</h1>
          <p class="page-subtitle">เปรียบเทียบคะแนนประเมินจากกรรมการแต่ละท่านต่อผู้รับการประเมินคนเดียวกัน</p>
        </div>
      </div>
      <button class="back-btn" @click="router.push('/overview')">
        <v-icon size="16" class="mr-1">mdi-arrow-left</v-icon>
        กลับหน้าหลัก
      </button>
    </div>
    <div class="filter-card mb-6 anim-1">
      <div class="filter-header">
        <v-icon icon="mdi-filter-outline" size="18" color="#4338ca" class="mr-2" />
        <span class="filter-title">เลือกข้อมูลที่ต้องการดู</span>
      </div>
      <v-row dense class="mt-2">
        <v-col cols="12" md="5">
          <v-select v-model="selectedPeriod" :items="periods" item-title="name_th" item-value="id" label="รอบการประเมิน" variant="outlined" rounded="lg" density="comfortable" prepend-inner-icon="mdi-calendar-clock" color="indigo" hide-details @update:model-value="onFilterChange" />
        </v-col>
        <v-col cols="12" md="5">
          <v-select v-model="selectedEvaluatee" :items="evaluatees" item-title="name_th" item-value="id" label="ผู้รับการประเมิน" variant="outlined" rounded="lg" density="comfortable" prepend-inner-icon="mdi-account-school" color="indigo" hide-details :disabled="!selectedPeriod" @update:model-value="onFilterChange" />
        </v-col>
        <v-col cols="12" md="2" class="d-flex align-center">
          <v-btn block color="indigo-darken-1" variant="elevated" rounded="lg" prepend-icon="mdi-magnify" :loading="loading" :disabled="!selectedPeriod || !selectedEvaluatee" class="font-weight-bold" style="height:40px" @click="fetchSummary">ค้นหา</v-btn>
        </v-col>
      </v-row>
    </div>
    <div v-if="!hasData && !loading && !hasFetched" class="empty-state anim-2">
      <div class="empty-art"><div class="empty-ring r1"></div><div class="empty-ring r2"></div><v-icon icon="mdi-chart-timeline-variant" size="52" color="indigo-lighten-3" /></div>
      <div class="empty-title">เลือกรอบประเมินและผู้รับการประเมิน</div>
      <div class="empty-sub">จากนั้นกดค้นหาเพื่อดูผลสรุปเปรียบเทียบรายกรรมการ</div>
    </div>
    <div v-else-if="!hasData && !loading && hasFetched" class="empty-state anim-2">
      <div class="empty-art"><div class="empty-ring r1"></div><div class="empty-ring r2"></div><v-icon icon="mdi-database-search-outline" size="52" color="amber-lighten-2" /></div>
      <div class="empty-title">ไม่พบข้อมูลการประเมิน</div>
      <div class="empty-sub">ยังไม่มีกรรมการที่ประเมินผู้รับการประเมินคนนี้ในรอบที่เลือก</div>
    </div>
    <div v-if="loading" class="loading-state">
      <v-progress-circular indeterminate color="indigo" size="48" width="4" />
      <div class="loading-text">กำลังโหลดข้อมูล...</div>
    </div>
    <template v-if="hasData && !loading">
      <div class="evaluatee-card mb-5 anim-2">
        <div class="evaluatee-avatar">{{ (selectedEvaluateeName || '?')[0] }}</div>
        <div class="evaluatee-info">
          <div class="evaluatee-name">{{ selectedEvaluateeName }}</div>
          <div class="evaluatee-meta">
            <v-chip size="x-small" color="white" variant="tonal" class="font-weight-bold mr-2"><v-icon start size="10">mdi-calendar-check</v-icon>{{ selectedPeriodName }}</v-chip>
            <v-chip size="x-small" color="white" variant="tonal" class="font-weight-bold"><v-icon start size="10">mdi-account-multiple-check</v-icon>กรรมการ {{ evaluators.length }} ท่าน</v-chip>
          </div>
        </div>
        <div class="ml-auto d-flex gap-2 flex-wrap">
          <v-btn variant="tonal" color="white" size="small" rounded="lg" prepend-icon="mdi-file-account-outline" @click="goToIndividualReport">รายงานรายบุคคล</v-btn>
          <v-btn variant="tonal" color="white" size="small" rounded="lg" prepend-icon="mdi-refresh" @click="fetchSummary">รีเฟรช</v-btn>
        </div>
      </div>
      <div class="legend-section mb-4 anim-3">
        <div class="legend-label">กรรมการในชุดประเมินนี้:</div>
        <div class="legend-items">
          <div v-for="(ev, idx) in evaluators" :key="ev.evaluator_id" class="legend-item" :style="{ '--ev-color': EVALUATOR_COLORS[idx % EVALUATOR_COLORS.length] }">
            <div class="legend-dot"></div>
            <div class="legend-name">{{ ev.evaluator_name }}</div>
            <div class="legend-role-badge" :class="ev.evaluator_role === 'chairman' ? 'role-chairman' : 'role-joint'">{{ ev.evaluator_role === 'chairman' ? 'ประธาน' : 'กรรมการร่วม' }}</div>
            <div class="legend-status-badge" :class="'status-' + ev.evaluator_status"><v-icon size="10" class="mr-1">{{ statusIcon(ev.evaluator_status) }}</v-icon>{{ statusLabel(ev.evaluator_status) }}</div>
          </div>
        </div>
      </div>
      <v-row dense class="mb-5">
        <v-col cols="6" sm="3" v-for="stat in statChips" :key="stat.label">
          <div class="stat-mini anim-4">
            <div class="stat-mini-icon" :style="{ background: stat.bg }"><v-icon :icon="stat.icon" size="16" :color="stat.color" /></div>
            <div class="stat-mini-value">{{ stat.value }}</div>
            <div class="stat-mini-label">{{ stat.label }}</div>
          </div>
        </v-col>
      </v-row>
      <div class="table-card anim-5">
        <div class="table-card-header">
          <div class="table-card-title-group">
            <div class="table-card-icon"><v-icon icon="mdi-table-eye" size="16" color="white" /></div>
            <div>
              <div class="table-card-title">ตารางเปรียบเทียบคะแนนรายตัวชี้วัด</div>
              <div class="table-card-sub">แสดงคะแนนของกรรมการแต่ละท่านต่อตัวชี้วัดแต่ละข้อ</div>
            </div>
          </div>
        </div>
        <div class="table-scroll-wrap">
          <table class="comparison-table">
            <thead>
              <tr>
                <th class="th-indicator sticky-col">ตัวชี้วัด</th>
                <th class="th-type">ประเภท</th>
                <th v-for="(ev, idx) in evaluators" :key="ev.evaluator_id" class="th-evaluator">
                  <div class="th-evaluator-inner">
                    <div class="th-avatar" :style="{ background: EVALUATOR_COLORS[idx % EVALUATOR_COLORS.length] }">{{ (ev.evaluator_name || '?')[0] }}</div>
                    <div>
                      <div class="th-name">{{ ev.evaluator_name }}</div>
                      <div class="th-role" :class="ev.evaluator_role === 'chairman' ? 'role-ch-text' : 'role-jt-text'">{{ ev.evaluator_role === 'chairman' ? 'ประธาน' : 'ร่วม' }}</div>
                    </div>
                  </div>
                </th>
                <th class="th-avg">ค่าเฉลี่ย</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(ind, iIdx) in indicators" :key="ind.id" class="data-row" :class="{ 'row-even': iIdx % 2 === 0 }">
                <td class="td-indicator sticky-col" :class="{ 'row-even-sticky': iIdx % 2 === 0 }">
                  <div class="indicator-code">{{ ind.code }}</div>
                  <div class="indicator-name">{{ ind.name_th }}</div>
                </td>
                <td class="td-type">
                  <div class="type-chip" :class="ind.type === 'score_1_4' ? 'type-score' : 'type-yesno'">{{ ind.type === 'score_1_4' ? '1-4 คะแนน' : 'ใช่/ไม่ใช่' }}</div>
                </td>
                <td v-for="(ev, eIdx) in evaluators" :key="ev.evaluator_id" class="td-score" :style="{ '--ev-color': EVALUATOR_COLORS[eIdx % EVALUATOR_COLORS.length] }">
                  <template v-if="ind.scores[ev.evaluator_id]">
                    <template v-if="ind.type === 'score_1_4'">
                      <div class="score-cell" :class="scoreClass(ind.scores[ev.evaluator_id].score)">
                        <div class="score-value">{{ ind.scores[ev.evaluator_id].score ?? '—' }}</div>
                        <div class="score-bar-wrap"><div class="score-bar" :style="{ width: ((ind.scores[ev.evaluator_id].score || 0) / 4 * 100) + '%' }"></div></div>
                      </div>
                    </template>
                    <template v-else>
                      <div class="yesno-cell" :class="ind.scores[ev.evaluator_id].value_yes_no ? 'yesno-yes' : 'yesno-no'">
                        <v-icon size="16">{{ ind.scores[ev.evaluator_id].value_yes_no ? 'mdi-check-circle' : 'mdi-close-circle' }}</v-icon>
                        <span>{{ ind.scores[ev.evaluator_id].value_yes_no ? 'ผ่าน' : 'ไม่ผ่าน' }}</span>
                      </div>
                    </template>
                    <div v-if="ind.scores[ev.evaluator_id].status === 'draft'" class="draft-tag">ร่าง</div>
                  </template>
                  <div v-else class="no-score">—</div>
                </td>
                <td class="td-avg">
                  <div class="avg-cell" v-if="indicatorAvg(ind) !== null">
                    <div class="avg-value">{{ indicatorAvg(ind) }}</div>
                    <div class="avg-bar-wrap"><div class="avg-bar" :style="{ width: (parseFloat(indicatorAvg(ind)) / 4 * 100) + '%' }"></div></div>
                  </div>
                  <div v-else class="no-score">—</div>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="foot-row">
                <td class="td-foot sticky-col" colspan="2">คะแนนรวม (score 1-4)</td>
                <td v-for="(ev, eIdx) in evaluators" :key="ev.evaluator_id" class="td-foot-score">
                  <div class="total-score" :style="{ color: EVALUATOR_COLORS[eIdx % EVALUATOR_COLORS.length] }">{{ evaluatorTotal(ev.evaluator_id) }}</div>
                  <div class="total-label">/ {{ maxTotal }}</div>
                </td>
                <td class="td-foot-score">
                  <div class="total-score" style="color:#0f766e">{{ overallAvgTotal }}</div>
                  <div class="total-label">เฉลี่ย</div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      <div class="notes-section mt-5 anim-6">
        <div class="notes-header"><v-icon icon="mdi-note-text-outline" size="16" color="#7c3aed" class="mr-2" /><span class="notes-title">หมายเหตุ / บันทึกเพิ่มเติมจากกรรมการ</span></div>
        <div class="notes-list">
          <template v-for="ind in indicators" :key="ind.id">
            <template v-for="ev in evaluators" :key="ev.evaluator_id">
              <div v-if="ind.scores[ev.evaluator_id] && ind.scores[ev.evaluator_id].notes" class="note-item">
                <div class="note-meta"><span class="note-code">{{ ind.code }}</span><span class="note-evaluator">{{ ev.evaluator_name }}</span></div>
                <div class="note-text">{{ ind.scores[ev.evaluator_id].notes }}</div>
              </div>
            </template>
          </template>
          <div v-if="!hasAnyNotes" class="no-notes">ไม่มีหมายเหตุเพิ่มเติมจากกรรมการ</div>
        </div>
      </div>
    </template>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
const EVALUATOR_COLORS = ['#4f46e5','#0891b2','#7c3aed','#059669','#d97706','#dc2626']
const periods = ref([])
const evaluatees = ref([])
const evaluators = ref([])
const indicators = ref([])
const selectedPeriod = ref(null)
const selectedEvaluatee = ref(null)
const loading = ref(false)
const hasFetched = ref(false)
const api = axios.create({ baseURL: 'http://localhost:7000/api' })
const getAuth = () => ({ headers: { Authorization: 'Bearer ' + localStorage.getItem('auth_token') } })
const hasData = computed(() => evaluators.value.length > 0)
const selectedEvaluateeName = computed(() => evaluatees.value.find(e => e.id === selectedEvaluatee.value)?.name_th || '')
const selectedPeriodName = computed(() => periods.value.find(p => p.id === selectedPeriod.value)?.name_th || '')
const indicatorAvg = (ind) => {
  if (ind.type !== 'score_1_4') return null
  const scores = evaluators.value.map(ev => ind.scores[ev.evaluator_id]?.score).filter(s => s !== undefined && s !== null)
  if (scores.length === 0) return null
  return (scores.reduce((a, b) => a + parseFloat(b), 0) / scores.length).toFixed(2)
}
const evaluatorTotal = (evId) => {
  return indicators.value.filter(i => i.type === 'score_1_4' && i.scores[evId]?.score !== null && i.scores[evId]?.score !== undefined)
    .reduce((sum, i) => sum + parseFloat(i.scores[evId].score || 0), 0).toFixed(2)
}
const maxTotal = computed(() => indicators.value.filter(i => i.type === 'score_1_4').length * 4)
const overallAvgTotal = computed(() => {
  if (evaluators.value.length === 0) return '—'
  const totals = evaluators.value.map(ev => parseFloat(evaluatorTotal(ev.evaluator_id)))
  return (totals.reduce((a, b) => a + b, 0) / totals.length).toFixed(2)
})
const hasAnyNotes = computed(() => {
  for (const ind of indicators.value)
    for (const ev of evaluators.value)
      if (ind.scores[ev.evaluator_id]?.notes) return true
  return false
})
const statChips = computed(() => {
  const completedCount = evaluators.value.filter(e => e.evaluator_status === 'completed').length
  const draftCount = evaluators.value.filter(e => e.evaluator_status !== 'completed').length
  return [
    { label: 'กรรมการทั้งหมด', value: evaluators.value.length, icon: 'mdi-account-group', color: 'indigo-darken-1', bg: 'rgba(79,70,229,0.1)' },
    { label: 'ลงนามแล้ว', value: completedCount, icon: 'mdi-check-decagram', color: 'green-darken-1', bg: 'rgba(5,150,105,0.1)' },
    { label: 'ยังดำเนินการ', value: draftCount, icon: 'mdi-clock-outline', color: 'amber-darken-2', bg: 'rgba(217,119,6,0.1)' },
    { label: 'จำนวนตัวชี้วัด', value: indicators.value.length, icon: 'mdi-format-list-checks', color: 'cyan-darken-1', bg: 'rgba(8,145,178,0.1)' },
  ]
})
function statusLabel(s) {
  if (s === 'completed') return 'ลงนามแล้ว'
  if (s === 'evaluating') return 'กำลังประเมิน'
  return 'รอดำเนินการ'
}
function statusIcon(s) {
  if (s === 'completed') return 'mdi-check-decagram'
  if (s === 'evaluating') return 'mdi-pencil-circle-outline'
  return 'mdi-clock-outline'
}
function scoreClass(score) {
  if (!score) return 'score-empty'
  const s = parseFloat(score)
  if (s >= 3.5) return 'score-high'
  if (s >= 2.5) return 'score-mid'
  return 'score-low'
}
function goToIndividualReport() {
  const query = {}
  if (selectedEvaluatee.value) query.evaluatee_id = selectedEvaluatee.value
  if (selectedPeriod.value) query.period_id = selectedPeriod.value
  router.push({ path: '/individual-report', query })
}
onMounted(async () => {
  if (!localStorage.getItem("auth_token")) { router.push('/'); return }
  await Promise.all([loadPeriods(), loadEvaluatees()])
  if (route.query.evaluatee_id && route.query.period_id) {
    selectedPeriod.value = parseInt(route.query.period_id)
    selectedEvaluatee.value = parseInt(route.query.evaluatee_id)
    await fetchSummary()
  }
})
async function loadPeriods() {
  try { const { data } = await api.get('/admin/list_periods', getAuth()); periods.value = data.data || [] } catch (e) {}
}
async function loadEvaluatees() {
  try { const { data } = await api.get('/admin/list_evaluatee?role=evaluatee', getAuth()); evaluatees.value = data.data || [] } catch (e) {}
}
function onFilterChange() { evaluators.value = []; indicators.value = []; hasFetched.value = false }
async function fetchSummary() {
  if (!selectedPeriod.value || !selectedEvaluatee.value) return
  loading.value = true; hasFetched.value = false; evaluators.value = []; indicators.value = []
  try {
    const { data } = await api.get('/admin/summary_by_evaluator', { ...getAuth(), params: { evaluatee_id: selectedEvaluatee.value, period_id: selectedPeriod.value } })
    evaluators.value = data.evaluators || []; indicators.value = data.indicators || []; hasFetched.value = true
  } catch (e) { hasFetched.value = true }
  finally { loading.value = false }
}
</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
* { font-family: 'Inter', sans-serif !important; }
.summary-page { padding: 8px 0 60px; min-height: 100vh; position: relative; overflow: hidden; }
.blob-1, .blob-2 { position: absolute; border-radius: 50%; filter: blur(100px); z-index: 0; opacity: 0.35; pointer-events: none; }
.blob-1 { top: -120px; left: -60px; width: 600px; height: 600px; background: rgba(165,180,252,0.3); }
.blob-2 { bottom: 5%; right: -60px; width: 500px; height: 500px; background: rgba(192,132,252,0.18); }
.page-header { display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 1; flex-wrap: wrap; gap: 12px; }
.header-left { display: flex; align-items: center; gap: 14px; }
.page-icon-wrap { width: 46px; height: 46px; border-radius: 14px; flex-shrink: 0; background: linear-gradient(135deg, #1a237e, #4338ca); display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(26,35,126,0.3); }
.page-title { font-size: 20px; font-weight: 800; color: #1a237e; letter-spacing: -0.4px; line-height: 1.2; }
.page-subtitle { font-size: 12.5px; color: #78909c; margin: 0; }
.back-btn { display: flex; align-items: center; gap: 4px; padding: 8px 16px; border-radius: 10px; border: 1px solid rgba(99,102,241,0.25); background: white; color: #4338ca; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.back-btn:hover { background: rgba(99,102,241,0.07); transform: translateY(-1px); }
.filter-card { background: rgba(255,255,255,0.9); backdrop-filter: blur(20px); border: 1px solid rgba(199,210,254,0.4); border-radius: 18px; padding: 20px 22px; box-shadow: 0 4px 20px rgba(99,102,241,0.07); position: relative; z-index: 1; }
.filter-header { display: flex; align-items: center; margin-bottom: 4px; }
.filter-title { font-size: 14px; font-weight: 700; color: #1a237e; }
.empty-state { text-align: center; padding: 60px 20px; position: relative; z-index: 1; }
.empty-art { position: relative; width: 100px; height: 100px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; }
.empty-ring { position: absolute; border-radius: 50%; border: 1px solid rgba(99,102,241,0.2); animation: pulseRing 3s infinite; }
.empty-ring.r1 { width: 90px; height: 90px; }
.empty-ring.r2 { width: 114px; height: 114px; border-style: dashed; animation-direction: reverse; opacity: 0.5; }
@keyframes pulseRing { 0% { transform: scale(0.9) rotate(0deg); } 50% { transform: scale(1.1) rotate(180deg); } 100% { transform: scale(0.9) rotate(360deg); } }
.empty-title { font-size: 17px; font-weight: 800; color: #1a237e; margin-bottom: 6px; }
.empty-sub { font-size: 13px; color: #90a4ae; }
.loading-state { text-align: center; padding: 60px 20px; position: relative; z-index: 1; }
.loading-text { font-size: 14px; font-weight: 600; color: #5c6bc0; margin-top: 16px; }
.evaluatee-card { display: flex; align-items: center; gap: 16px; background: linear-gradient(135deg, #1a237e, #4338ca); border-radius: 18px; padding: 18px 22px; box-shadow: 0 8px 30px rgba(26,35,126,0.25); position: relative; z-index: 1; flex-wrap: wrap; }
.evaluatee-avatar { width: 52px; height: 52px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 900; color: white; border: 2px solid rgba(255,255,255,0.3); flex-shrink: 0; }
.evaluatee-info { flex: 1; }
.evaluatee-name { font-size: 17px; font-weight: 800; color: white; margin-bottom: 6px; }
.evaluatee-meta { display: flex; gap: 8px; flex-wrap: wrap; }
.legend-section { background: white; border: 1px solid rgba(199,210,254,0.4); border-radius: 14px; padding: 14px 18px; position: relative; z-index: 1; box-shadow: 0 2px 12px rgba(99,102,241,0.06); }
.legend-label { font-size: 11px; font-weight: 800; color: #78909c; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px; }
.legend-items { display: flex; flex-wrap: wrap; gap: 10px; }
.legend-item { display: flex; align-items: center; gap: 8px; background: rgba(99,102,241,0.04); border: 1px solid rgba(199,210,254,0.3); border-radius: 10px; padding: 7px 12px; }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--ev-color); flex-shrink: 0; }
.legend-name { font-size: 13px; font-weight: 600; color: #1a237e; }
.legend-role-badge { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 99px; }
.role-chairman { background: rgba(217,119,6,0.12); color: #b45309; }
.role-joint { background: rgba(79,70,229,0.12); color: #3730a3; }
.legend-status-badge { display: flex; align-items: center; font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 99px; }
.status-completed { background: rgba(5,150,105,0.1); color: #059669; }
.status-evaluating { background: rgba(245,158,11,0.1); color: #d97706; }
.status-pending { background: rgba(100,116,139,0.1); color: #475569; }
.stat-mini { background: white; border: 1px solid rgba(199,210,254,0.35); border-radius: 14px; padding: 14px 14px 10px; display: flex; flex-direction: column; gap: 4px; box-shadow: 0 2px 10px rgba(99,102,241,0.06); position: relative; z-index: 1; transition: all 0.2s; }
.stat-mini:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(99,102,241,0.1); }
.stat-mini-icon { width: 32px; height: 32px; border-radius: 9px; display: flex; align-items: center; justify-content: center; margin-bottom: 4px; }
.stat-mini-value { font-size: 22px; font-weight: 900; color: #1a237e; line-height: 1.1; }
.stat-mini-label { font-size: 11px; font-weight: 600; color: #90a4ae; }
.table-card { background: white; border: 1px solid rgba(199,210,254,0.4); border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(99,102,241,0.08); position: relative; z-index: 1; }
.table-card-header { padding: 18px 22px; display: flex; align-items: center; background: rgba(99,102,241,0.03); border-bottom: 1px solid rgba(199,210,254,0.3); }
.table-card-title-group { display: flex; align-items: center; gap: 10px; }
.table-card-icon { width: 32px; height: 32px; border-radius: 9px; background: linear-gradient(135deg, #1a237e, #4338ca); display: flex; align-items: center; justify-content: center; }
.table-card-title { font-size: 14px; font-weight: 700; color: #1a237e; }
.table-card-sub { font-size: 11px; color: #90a4ae; }
.table-scroll-wrap { overflow-x: auto; }
.comparison-table { width: 100%; border-collapse: collapse; min-width: 700px; }
.comparison-table th { padding: 12px 14px; text-align: center; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #5c6bc0; background: rgba(99,102,241,0.04); border-bottom: 2px solid rgba(99,102,241,0.12); white-space: nowrap; }
.th-indicator { text-align: left !important; min-width: 220px; max-width: 260px; }
.th-type { min-width: 100px; }
.th-evaluator { min-width: 140px; border-left: 2px solid rgba(0,0,0,0.05); }
.th-evaluator-inner { display: flex; align-items: center; gap: 8px; justify-content: center; }
.th-avatar { width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 900; color: white; }
.th-name { font-size: 11px; font-weight: 700; color: #1a237e; line-height: 1.1; text-align: left; }
.th-role { font-size: 9px; font-weight: 700; text-align: left; }
.role-ch-text { color: #b45309; }
.role-jt-text { color: #4338ca; }
.th-avg { min-width: 120px; background: rgba(5,150,105,0.04) !important; border-left: 2px solid rgba(5,150,105,0.2); color: #0f766e !important; }
.data-row:hover td { background: rgba(99,102,241,0.025) !important; }
.row-even td { background: rgba(248,249,255,0.7); }
.td-indicator { padding: 12px 14px; border-bottom: 1px solid rgba(0,0,0,0.04); min-width: 220px; max-width: 260px; background: white; }
.row-even-sticky { background: rgba(248,249,255,0.98) !important; }
.indicator-code { font-size: 10px; font-weight: 800; color: #4338ca; margin-bottom: 2px; }
.indicator-name { font-size: 12.5px; font-weight: 500; color: #334155; line-height: 1.3; }
.td-type { padding: 12px 10px; text-align: center; border-bottom: 1px solid rgba(0,0,0,0.04); }
.type-chip { display: inline-block; padding: 3px 8px; border-radius: 99px; font-size: 10px; font-weight: 700; }
.type-score { background: rgba(79,70,229,0.1); color: #4338ca; }
.type-yesno { background: rgba(8,145,178,0.1); color: #0891b2; }
.td-score { padding: 10px 12px; text-align: center; border-bottom: 1px solid rgba(0,0,0,0.04); border-left: 1px solid rgba(0,0,0,0.04); position: relative; }
.score-cell { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.score-value { font-size: 18px; font-weight: 900; color: #1a237e; line-height: 1; }
.score-high .score-value { color: #059669; }
.score-mid .score-value { color: #d97706; }
.score-low .score-value { color: #dc2626; }
.score-bar-wrap { width: 50px; height: 4px; background: rgba(0,0,0,0.06); border-radius: 99px; overflow: hidden; }
.score-bar { height: 100%; border-radius: 99px; background: var(--ev-color, #4f46e5); transition: width 0.8s ease; }
.yesno-cell { display: flex; align-items: center; gap: 4px; justify-content: center; font-size: 12px; font-weight: 700; border-radius: 99px; padding: 3px 8px; }
.yesno-yes { color: #059669; background: rgba(5,150,105,0.1); }
.yesno-no { color: #dc2626; background: rgba(220,38,38,0.1); }
.draft-tag { position: absolute; top: 4px; right: 4px; font-size: 8px; font-weight: 800; padding: 1px 4px; border-radius: 4px; background: rgba(245,158,11,0.15); color: #b45309; }
.no-score { font-size: 16px; color: #d1d5db; font-weight: 600; }
.td-avg { padding: 10px 12px; text-align: center; border-bottom: 1px solid rgba(0,0,0,0.04); border-left: 2px solid rgba(5,150,105,0.15); background: rgba(240,253,244,0.5); }
.avg-cell { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.avg-value { font-size: 16px; font-weight: 900; color: #059669; }
.avg-bar-wrap { width: 50px; height: 4px; background: rgba(0,0,0,0.06); border-radius: 99px; overflow: hidden; }
.avg-bar { height: 100%; border-radius: 99px; background: #059669; transition: width 0.8s ease; }
.foot-row td { background: rgba(26,35,126,0.04) !important; }
.td-foot { padding: 12px 14px; font-size: 12px; font-weight: 800; color: #1a237e; border-top: 2px solid rgba(99,102,241,0.15); background: rgba(238,242,255,0.9) !important; }
.td-foot-score { padding: 12px 14px; text-align: center; border-top: 2px solid rgba(99,102,241,0.15); }
.total-score { font-size: 20px; font-weight: 900; line-height: 1; }
.total-label { font-size: 10px; color: #90a4ae; font-weight: 600; margin-top: 2px; }
.sticky-col { position: sticky; left: 0; z-index: 2; box-shadow: 2px 0 8px rgba(99,102,241,0.07); }
.notes-section { background: white; border: 1px solid rgba(199,210,254,0.4); border-radius: 18px; overflow: hidden; box-shadow: 0 4px 16px rgba(99,102,241,0.07); position: relative; z-index: 1; }
.notes-header { display: flex; align-items: center; padding: 14px 20px; background: rgba(124,58,237,0.04); border-bottom: 1px solid rgba(199,210,254,0.3); }
.notes-title { font-size: 13px; font-weight: 700; color: #4c1d95; }
.notes-list { padding: 4px 0; }
.note-item { display: flex; align-items: flex-start; gap: 12px; padding: 10px 16px; border-bottom: 1px solid rgba(0,0,0,0.04); }
.note-meta { display: flex; flex-direction: column; gap: 3px; min-width: 120px; }
.note-code { font-size: 10px; font-weight: 800; color: #4338ca; }
.note-evaluator { font-size: 11px; font-weight: 600; color: #334155; }
.note-text { font-size: 13px; color: #475569; flex: 1; line-height: 1.5; }
.no-notes { padding: 18px 20px; font-size: 13px; color: #90a4ae; text-align: center; }
.anim-1 { animation: cardUp 0.5s 0.05s ease-out both; }
.anim-2 { animation: cardUp 0.5s 0.12s ease-out both; }
.anim-3 { animation: cardUp 0.5s 0.19s ease-out both; }
.anim-4 { animation: cardUp 0.5s 0.26s ease-out both; }
.anim-5 { animation: cardUp 0.5s 0.33s ease-out both; }
.anim-6 { animation: cardUp 0.5s 0.40s ease-out both; }
@keyframes cardUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
</style>
