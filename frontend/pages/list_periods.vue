<template>
  <div class="dashboard-page">
    
    <!-- Ambient Background -->
    <div class="blob-1"></div>
    <div class="blob-2"></div>

    <!-- ===== PAGE HEADER ===== -->
    <div class="page-header mb-8 anim-1">
      <div class="header-left">
        <div class="page-icon-wrap" style="background: linear-gradient(135deg, #4c1d95, #6d28d9);">
          <v-icon icon="mdi-calendar-sync" size="26" color="white" />
        </div>
        <div>
          <h1 class="page-title">จัดการรอบประเมิน</h1>
          <p class="page-subtitle">กำหนดช่วงเวลาและควบคุมสถานะการประเมินผลบุคลากร</p>
        </div>
      </div>
      <div class="header-actions">
        <v-btn color="indigo-darken-3" size="x-large" rounded="xl" class="add-period-btn font-weight-black" @click="openAdd">
          <v-icon start size="22">mdi-plus-box-multiple</v-icon>
          เปิดรอบประเมินใหม่
          <span class="btn-shine"></span>
        </v-btn>
      </div>
    </div>

    <!-- ===== PREMIUM SUMMARY METRICS ===== -->
    <v-row class="mb-8 anim-2">
      <v-col cols="12" md="4">
        <div class="metric-card">
          <div class="metric-icon bg-indigo-lighten-5 text-indigo-darken-3"><v-icon>mdi-calendar-multiple</v-icon></div>
          <div class="metric-data">
            <div class="metric-label">รอบประเมินทั้งหมด</div>
            <div class="metric-val text-indigo-darken-4">{{ items.length }} <span class="metric-unit">รอบ</span></div>
          </div>
        </div>
      </v-col>
      <v-col cols="12" md="4">
        <div class="metric-card metric-active">
          <div class="metric-icon bg-green-lighten-5 text-success"><v-icon>mdi-check-circle-outline</v-icon></div>
          <div class="metric-data">
            <div class="metric-label">กำลังเปิดใช้งาน</div>
            <div class="metric-val text-success">{{ items.filter(i => i.is_active).length }} <span class="metric-unit">รอบ</span></div>
          </div>
          <div class="metric-glow"></div>
        </div>
      </v-col>
      <v-col cols="12" md="4">
        <div class="metric-card">
          <div class="metric-icon bg-grey-lighten-4 text-grey-darken-1"><v-icon>mdi-archive-cancel-outline</v-icon></div>
          <div class="metric-data">
            <div class="metric-label">ปิดใช้งาน / หมดเวลา</div>
            <div class="metric-val text-blue-grey-darken-2">{{ items.filter(i => !i.is_active).length }} <span class="metric-unit">รอบ</span></div>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- ===== PERIOD CARDS GRID ===== -->
    <div class="d-flex align-center mb-6 anim-3">
      <v-icon color="indigo-darken-2" class="me-2" size="20">mdi-clock-time-four-outline</v-icon>
      <h2 class="text-h6 font-weight-black text-indigo-darken-4 mb-0">รายการรอบประเมินในระบบ</h2>
      <v-spacer></v-spacer>
    </div>

    <v-row v-if="items.length > 0">
      <v-col v-for="(item, index) in items" :key="item.id" cols="12" lg="6" xl="4">
        
        <div class="period-card" :class="[`anim-${(index % 4) + 3}`, item.is_active ? 'card-active' : 'card-inactive']">
          
          <div class="card-glow-bg"></div>
          
          <div class="card-inner relative-z">
            
            <!-- Header: Title & Status -->
            <div class="d-flex justify-space-between align-start mb-5">
              <div class="d-flex align-center">
                <v-avatar :color="item.is_active ? 'indigo-darken-3' : 'grey-darken-1'" size="48" class="shadow-sm me-3 text-white font-weight-bold">
                  {{ item.buddhist_year }}
                </v-avatar>
                <div>
                  <h3 class="text-h6 font-weight-black text-indigo-darken-4 line-height-1 mb-1">{{ item.name_th }}</h3>
                  <div class="text-caption font-weight-bold text-blue-grey-lighten-1 d-flex align-center">
                    <v-icon size="12" class="me-1">mdi-barcode-scan</v-icon> รหัส: {{ item.code }}
                  </div>
                </div>
              </div>
              
              <div class="status-badge" :class="item.is_active ? 'badge-active' : 'badge-inactive'">
                <div class="status-dot"></div>
                {{ item.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
              </div>
            </div>

            <v-divider class="border-opacity-10 mb-5" />

            <!-- Body: Timeline Representation -->
            <div class="timeline-visual">
              <div class="time-node">
                <div class="time-label text-indigo-lighten-1">วันที่เริ่มต้น</div>
                <div class="time-val">{{ formatDateDisplay(item.start_date) }}</div>
              </div>
              
              <div class="time-connector" :class="{'connector-active': item.is_active}">
                <div class="time-line"></div>
                <v-icon size="16" class="time-arrow" :color="item.is_active ? 'indigo' : 'grey'">mdi-chevron-double-right</v-icon>
              </div>

              <div class="time-node text-right">
                <div class="time-label text-pink-lighten-2">วันที่สิ้นสุด</div>
                <div class="time-val">{{ formatDateDisplay(item.end_date) }}</div>
              </div>
            </div>

            <!-- Hover Actions -->
            <div class="card-actions-row mt-6">
              <v-btn variant="tonal" color="blue-grey-darken-2" rounded="lg" size="small" class="action-btn font-weight-bold flex-1-1 me-2" @click="openEdit(item)">
                <v-icon start size="16">mdi-pencil-outline</v-icon> แก้ไข
              </v-btn>
              <v-btn variant="tonal" color="error" rounded="lg" size="small" class="action-btn font-weight-bold flex-1-1 ms-2" @click="remove(item)">
                <v-icon start size="16">mdi-delete-outline</v-icon> ลบ
              </v-btn>
            </div>

          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Empty State -->
    <div v-else class="empty-state anim-3 mt-4">
      <div class="empty-icon-wrap">
        <div class="empty-ring r1"></div>
        <div class="empty-ring r2"></div>
        <v-icon size="45" color="indigo-lighten-1">mdi-calendar-blank-multiple</v-icon>
      </div>
      <h3 class="empty-title">ยังไม่มีรอบประเมินในระบบ</h3>
      <p class="empty-sub">เริ่มต้นสร้างรอบประเมินใหม่โดยคลิกปุ่มด้านขวาบน</p>
    </div>

    <!-- ===== DIALOG ===== -->
    <v-dialog v-model="dialog" max-width="650" persistent scrollable>
      <v-card class="dialog-card overflow-hidden pa-0" rounded="xl">

        <!-- Dialog header -->
        <div class="dialog-header" :class="editMode ? 'dialog-edit' : 'dialog-add'">
          <div class="dialog-header-bg"></div>
          <div class="d-flex align-center gap-3 relative-z">
            <v-avatar color="rgba(255,255,255,0.2)" size="50" class="border shadow-sm">
              <v-icon :icon="editMode ? 'mdi-calendar-edit' : 'mdi-calendar-plus'" size="26" color="white" />
            </v-avatar>
            <div>
              <div class="dialog-title">{{ editMode ? 'แก้ไขรอบประเมิน' : 'สร้างรอบประเมินใหม่' }}</div>
              <div class="dialog-sub">{{ editMode ? `กำลังแก้ไข: ${form.name_th}` : 'กำหนดข้อมูลและช่วงเวลาสำหรับการประเมิน' }}</div>
            </div>
          </div>
        </div>

        <!-- Form body -->
        <v-card-text class="pa-6 bg-grey-lighten-5">
          <v-row dense>
            <v-col cols="12" md="8" class="mb-2">
              <label class="field-label mb-1 d-block"><v-icon size="14" color="indigo-darken-1" class="me-1">mdi-calendar-text</v-icon> ชื่อรอบประเมิน</label>
              <v-text-field v-model="form.name_th" placeholder="ระบุชื่อรอบประเมิน" variant="outlined" rounded="lg" color="indigo" bg-color="white" density="comfortable" hide-details class="premium-input" />
            </v-col>
            <v-col cols="12" md="4" class="mb-2">
              <label class="field-label mb-1 d-block"><v-icon size="14" color="indigo-darken-1" class="me-1">mdi-identifier</v-icon> รหัส</label>
              <v-text-field v-model="form.code" placeholder="เช่น 1/2569" variant="outlined" rounded="lg" color="indigo" bg-color="white" density="comfortable" hide-details class="premium-input" />
            </v-col>
            
            <v-col cols="12" md="6" class="mb-2">
              <label class="field-label mb-1 d-block"><v-icon size="14" color="indigo-darken-1" class="me-1">mdi-calendar-badge</v-icon> ปีการศึกษา (พ.ศ.)</label>
              <v-text-field v-model="form.buddhist_year" type="number" placeholder="เช่น 2569" variant="outlined" rounded="lg" color="indigo" bg-color="white" density="comfortable" hide-details class="premium-input" />
            </v-col>
            <v-col cols="12" md="6" class="mb-2 d-flex align-end">
              <div class="switch-wrap w-100 mb-1">
                <v-switch v-model="form.is_active" color="success" inset hide-details density="compact" class="ms-2" />
                <div>
                  <div class="switch-label text-uppercase text-blue-grey-darken-1">สถานะรอบประเมิน</div>
                  <div class="switch-sub font-weight-bold" :class="form.is_active ? 'text-success' : 'text-grey'">
                    {{ form.is_active ? 'กำลังเปิดใช้งาน' : 'ปิดใช้งาน' }}
                  </div>
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="6" class="mt-2">
              <label class="field-label mb-1 d-block"><v-icon size="14" color="indigo-lighten-1" class="me-1">mdi-calendar-start</v-icon> วันที่เริ่มต้น</label>
              <v-text-field v-model="form.start_date" type="date" variant="outlined" rounded="lg" color="indigo" bg-color="white" density="comfortable" hide-details class="premium-input" />
            </v-col>
            <v-col cols="12" md="6" class="mt-2">
              <label class="field-label mb-1 d-block"><v-icon size="14" color="pink-lighten-2" class="me-1">mdi-calendar-end</v-icon> วันที่สิ้นสุด</label>
              <v-text-field v-model="form.end_date" type="date" variant="outlined" rounded="lg" color="indigo" bg-color="white" density="comfortable" hide-details class="premium-input" />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider class="border-opacity-10" />

        <div class="dialog-actions pa-4 bg-white">
          <v-spacer />
          <v-btn variant="text" rounded="xl" @click="dialog = false" color="blue-grey-darken-1" class="font-weight-bold px-4">ยกเลิก</v-btn>
          <v-btn :color="editMode ? 'orange-darken-2' : 'indigo-darken-4'"
            variant="elevated" rounded="xl" size="large" class="px-8 font-weight-black shadow-action" @click="save">
            <v-icon start>{{ editMode ? 'mdi-content-save' : 'mdi-check-decagram' }}</v-icon>
            {{ editMode ? 'บันทึกการแก้ไข' : 'สร้างรอบประเมิน' }}
          </v-btn>
        </div>

      </v-card>
    </v-dialog>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
* { font-family: 'Inter', sans-serif !important; }

.dashboard-page { padding: 8px 0; min-height: 100vh; position: relative; overflow: hidden; }

/* Ambient */
.blob-1, .blob-2 { position: absolute; border-radius: 50%; filter: blur(100px); z-index: 0; opacity: 0.5; pointer-events: none; }
.blob-1 { top: -100px; left: -50px; width: 600px; height: 600px; background: rgba(165, 180, 252, 0.3); }
.blob-2 { bottom: 10%; right: -50px; width: 500px; height: 500px; background: rgba(192, 132, 252, 0.2); }
.anim-1, .anim-2, .anim-3, .anim-4, .anim-5, .anim-6 { position: relative; z-index: 1; }

/* ===== Page Header ===== */
.page-header { display: flex; align-items: center; justify-content: space-between; animation: fadeSlideDown 0.6s ease-out both; }
.header-left  { display: flex; align-items: center; gap: 16px; }
.page-icon-wrap {
  width: 54px; height: 54px; border-radius: 16px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 10px 25px rgba(76,29,149,0.35);
}
.page-title { font-size: 26px; font-weight: 900; color: #1e1b4b; letter-spacing: -0.5px; line-height: 1.2; }
.page-subtitle { font-size: 14px; color: #64748b; font-weight: 500; margin: 0; }

.add-period-btn { position: relative; overflow: hidden; box-shadow: 0 8px 25px rgba(49,46,129,0.25) !important; transition: all 0.3s !important; }
.add-period-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(49,46,129,0.35) !important; letter-spacing: 0.5px; }
.btn-shine {
  position: absolute; top: 0; left: -75%; width: 50%; height: 100%;
  background: linear-gradient(120deg, transparent, rgba(255,255,255,0.25), transparent);
  transform: skewX(-20deg); animation: btnShine 4s ease-in-out infinite;
}
@keyframes btnShine { 0% { left: -75%; } 30% { left: 125%; } 100% { left: 125%; } }
@keyframes fadeSlideDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }

/* ===== Premium Summary Metrics ===== */
.metric-card {
  display: flex; align-items: center; gap: 16px; padding: 20px;
  background: rgba(255,255,255,0.85); backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.9); border-radius: 20px;
  box-shadow: 0 8px 25px rgba(30,27,75,0.04); position: relative; overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}
.metric-card:hover { transform: translateY(-3px); box-shadow: 0 12px 35px rgba(30,27,75,0.08); }
.metric-icon { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
.metric-icon .v-icon { font-size: 28px; }
.metric-label { font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
.metric-val { font-size: 28px; font-weight: 900; line-height: 1.1; }
.metric-unit { font-size: 14px; font-weight: 600; color: #94a3b8; }
.metric-active { border-color: rgba(34,197,94,0.3); }
.metric-glow {
  position: absolute; top: 0; right: 0; width: 100px; height: 100px;
  background: radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%); border-radius: 50%;
  transform: translate(30%, -30%); pointer-events: none;
}

/* ===== Period Cards (Timeline style) ===== */
.period-card {
  position: relative; overflow: hidden;
  background: rgba(255,255,255,0.9); backdrop-filter: blur(20px);
  border: 1px solid rgba(226,232,240,1); border-radius: 24px;
  padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.03);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.period-card:hover { transform: translateY(-4px); box-shadow: 0 15px 40px rgba(49,46,129,0.08); }
.card-active { border-color: rgba(99,102,241,0.5); }
.card-active:hover { box-shadow: 0 15px 40px rgba(99,102,241,0.15); }
.card-glow-bg {
  position: absolute; inset: 0; opacity: 0; transition: opacity 0.4s;
  background: radial-gradient(circle at top right, rgba(99,102,241,0.1), transparent 60%); pointer-events: none;
}
.card-active .card-glow-bg { opacity: 1; }
.card-inner { position: relative; z-index: 1; }

.status-badge {
  display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px;
  border-radius: 99px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;
}
.badge-active { background: rgba(34,197,94,0.1); color: #15803d; border: 1px solid rgba(34,197,94,0.2); }
.badge-inactive { background: rgba(100,116,139,0.1); color: #475569; border: 1px solid rgba(100,116,139,0.2); }
.status-dot { width: 6px; height: 6px; border-radius: 50%; }
.badge-active .status-dot { background: #22c55e; box-shadow: 0 0 0 2px rgba(34,197,94,0.3); animation: pulseDot 2s infinite; }
.badge-inactive .status-dot { background: #94a3b8; }
@keyframes pulseDot { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } }

/* Timeline Visual */
.timeline-visual {
  display: flex; align-items: center; justify-content: space-between;
  background: #f8fafc; padding: 16px 20px; border-radius: 16px;
  border: 1px dashed #cbd5e1;
}
.card-active .timeline-visual { background: rgba(238,242,255,0.5); border-color: rgba(199,210,254,0.8); }
.time-node { display: flex; flex-direction: column; gap: 4px; }
.time-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
.time-val { font-size: 14px; font-weight: 900; color: #1e293b; }
.time-connector { flex: 1; margin: 0 16px; position: relative; display: flex; align-items: center; }
.time-line { width: 100%; height: 2px; background: #e2e8f0; border-radius: 2px; }
.connector-active .time-line { background: rgba(99,102,241,0.3); }
.time-arrow { position: absolute; left: 50%; transform: translateX(-50%); background: #f8fafc; padding: 0 4px; }
.connector-active .time-arrow { background: rgba(238,242,255,1); animation: arrowMove 2s infinite ease-in-out; }
@keyframes arrowMove { 0% { transform: translateX(-80%); opacity: 0.3; } 50% { transform: translateX(0%); opacity: 1; } 100% { transform: translateX(80%); opacity: 0.3; } }

.action-btn { transition: all 0.2s; }
.action-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.05); }

/* ===== Dialog Form ===== */
.dialog-card { box-shadow: 0 30px 80px rgba(0,0,0,0.2) !important; }
.dialog-header { padding: 24px; position: relative; overflow: hidden; }
.dialog-add  { background: linear-gradient(135deg, #312e81, #4f46e5); }
.dialog-edit { background: linear-gradient(135deg, #78350f, #ea580c); }
.dialog-header-bg { position: absolute; inset: 0; background-image: radial-gradient(rgba(255,255,255,0.1) 2px, transparent 2px); background-size: 24px 24px; opacity: 0.4; }
.dialog-title { font-size: 20px; font-weight: 900; color: white; line-height: 1.2; }
.dialog-sub   { font-size: 13px; color: rgba(255,255,255,0.8); }

.field-label { font-size: 12.5px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
.premium-input :deep(.v-field) { border-radius: 12px !important; box-shadow: 0 2px 6px rgba(0,0,0,0.03) inset !important; transition: all 0.2s; border: 1px solid transparent; }
.premium-input :deep(.v-field--focused) { box-shadow: 0 0 0 3px rgba(99,102,241,0.2) !important; border-color: #6366f1; }

.switch-wrap {
  display: flex; align-items: center; gap: 12px;
  background: white; border: 1px solid #e2e8f0;
  border-radius: 14px; padding: 10px 14px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.02) inset;
}
.switch-label { font-size: 11px; font-weight: 800; letter-spacing: 0.5px; }
.switch-sub { font-size: 13px; }
.shadow-action { box-shadow: 0 8px 25px rgba(0,0,0,0.2) !important; transition: all 0.3s !important; }
.shadow-action:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(0,0,0,0.3) !important; }

/* Empty state */
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; text-align: center; background: rgba(255,255,255,0.5); border: 1px dashed rgba(158,168,218,0.5); border-radius: 20px; }
.empty-icon-wrap { width: 90px; height: 90px; border-radius: 50%; position: relative; background: rgba(99,102,241,0.08); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; }
.empty-ring { position: absolute; border-radius: 50%; border: 1px solid rgba(99,102,241,0.2); }
.empty-ring.r1 { width: 130px; height: 130px; animation: spin 10s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
.empty-title { font-size: 20px; font-weight: 900; color: #1a237e; margin-bottom: 6px; }
.empty-sub   { font-size: 14px; color: #78909c; font-weight: 500; }

/* Utilities */
.line-height-1 { line-height: 1.2; }
.relative-z { position: relative; z-index: 1; }
.flex-1-1 { flex: 1 1 0; }

/* Entrance Animations */
.anim-1 { animation: cardUp 0.5s 0.05s ease-out both; }
.anim-2 { animation: cardUp 0.5s 0.15s ease-out both; }
.anim-3 { animation: cardUp 0.5s 0.25s ease-out both; }
.anim-4 { animation: cardUp 0.5s 0.35s ease-out both; }
.anim-5 { animation: cardUp 0.5s 0.45s ease-out both; }
.anim-6 { animation: cardUp 0.5s 0.55s ease-out both; }
@keyframes cardUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const items = ref([])
const dialog = ref(false)
const editMode = ref(false)
const form = ref({ id: null, code: '', name_th: '', buddhist_year: '', start_date: '', end_date: '', is_active: true })

let authChecker = null
const forceLogout = () => { localStorage.removeItem('auth_token'); router.push('/') }

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) forceLogout()
    return Promise.reject(error)
  }
)

const getAuth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` } })

onMounted(() => {
  if (!localStorage.getItem('auth_token')) { forceLogout(); return }
  load()
  authChecker = setInterval(() => { if (!localStorage.getItem('auth_token')) forceLogout() }, 500)
  window.addEventListener('storage', e => { if (e.key === 'auth_token' && !e.newValue) forceLogout() })
})
onUnmounted(() => { if (authChecker) clearInterval(authChecker) })

async function load() {
  try {
    const { data } = await axios.get('http://localhost:7000/api/admin/list_periods', getAuth())
    items.value = data.data
  } catch {}
}

async function save() {
  try {
    const payload = { ...form.value, start_date: formatDate(form.value.start_date), end_date: formatDate(form.value.end_date) }
    if (editMode.value) await axios.put(`http://localhost:7000/api/admin/update_periods/${form.value.id}`, payload, getAuth())
    else await axios.post('http://localhost:7000/api/admin/create_periods', payload, getAuth())
    dialog.value = false; load()
  } catch (err) {
    if (err.response?.status !== 401) alert('พลาด: ' + (err.response?.data?.message || err.message))
  }
}

async function remove(item) {
  if (!confirm(`ต้องการลบ "${item.name_th}" หรือไม่?`)) return
  try {
    await axios.delete(`http://localhost:7000/api/admin/delete_periods/${item.id}`, getAuth())
    load()
  } catch (err) {
    if (err.response?.status !== 401) alert('ลบไม่ได้')
  }
}

function formatDate(d) { return d ? d.toString().split('T')[0] : '' }

function formatDateDisplay(d) {
  if (!d) return '—'
  const date = new Date(d)
  return date.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })
}

const openAdd = () => {
  editMode.value = false
  form.value = { id: null, code: '', name_th: '', buddhist_year: new Date().getFullYear() + 543, start_date: '', end_date: '', is_active: true }
  dialog.value = true
}
const openEdit = (item) => { editMode.value = true; form.value = { ...item }; dialog.value = true }
</script>