<template>   <div class="dashboard-page">

    <!-- Ambient Background -->
    <div class="blob-1"></div>
    <div class="blob-2"></div>

    <!-- ===== PAGE HEADER ===== -->
    <div class="page-header mb-8 anim-1">
      <div class="header-left">
        <div class="page-icon-wrap" style="background: linear-gradient(135deg, #1a237e, #3f51b5);">
          <v-icon icon="mdi-format-list-checks" size="24" color="white" />
        </div>
        <div>
          <h1 class="page-title">จัดการตัวชี้วัด</h1>
          <p class="page-subtitle">กำหนดเกณฑ์และหัวข้อสำหรับการประเมินผลครู</p>
        </div>
      </div>
      <div class="header-actions">
        <div class="summary-chip">
          <v-icon size="14" color="indigo-darken-2" class="mr-1">mdi-chart-box-outline</v-icon>
          <span class="chip-label">ตัวชี้วัดทั้งหมด</span>
          <span class="chip-val">{{ indicators.length }} รายการ</span>
        </div>
      </div>
    </div>

    <!-- ===== PREMIUM SUMMARY METRICS ===== -->
    <v-row class="mb-8 anim-2">
      <v-col cols="12" md="4">
        <div class="metric-card">
          <div class="metric-icon bg-indigo-lighten-5 text-indigo-darken-3"><v-icon>mdi-format-list-numbered</v-icon></div>
          <div class="metric-data">
            <div class="metric-label">ตัวชี้วัดทั้งหมด</div>
            <div class="metric-val text-indigo-darken-4">{{ indicators.length }} <span class="metric-unit">รายการ</span></div>
          </div>
        </div>
      </v-col>
      <v-col cols="12" md="4">
        <div class="metric-card metric-active">
          <div class="metric-icon bg-green-lighten-5 text-success"><v-icon>mdi-check-circle-outline</v-icon></div>
          <div class="metric-data">
            <div class="metric-label">เปิดใช้งาน</div>
            <div class="metric-val text-success">{{ indicators.filter(i => i.active).length }} <span class="metric-unit">รายการ</span></div>
          </div>
          <div class="metric-glow"></div>
        </div>
      </v-col>
      <v-col cols="12" md="4">
        <div class="metric-card">
          <div class="metric-icon bg-grey-lighten-4 text-grey-darken-1"><v-icon>mdi-close-circle-outline</v-icon></div>
          <div class="metric-data">
            <div class="metric-label">ปิดใช้งาน</div>
            <div class="metric-val text-blue-grey-darken-2">{{ indicators.filter(i => !i.active).length }} <span class="metric-unit">รายการ</span></div>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <!-- ===== LEFT: INDICATOR CARDS ===== -->
      <v-col cols="12" lg="8">

        <div class="d-flex align-center justify-space-between mb-4 anim-3">
          <div class="section-title-group">
            <div class="section-icon-sm" style="background: linear-gradient(135deg, #0284c7, #38bdf8);">
              <v-icon icon="mdi-view-grid" size="16" color="white" />
            </div>
            <div>
              <div class="section-title">รายการตัวชี้วัดทั้งหมด</div>
              <div class="section-sub">เกณฑ์ที่ใช้ในระบบประเมินผลปัจจุบัน</div>
            </div>
          </div>
        </div>

        <v-row v-if="indicators.length > 0">
          <v-col cols="12" sm="6" v-for="(item, index) in indicators" :key="item.id">
            <div class="indicator-card" :class="[`anim-${(index % 5) + 1}`, item.active ? 'card-active' : '']">
              <!-- Accent bar -->
              <div class="card-accent" :class="item.active ? 'accent-green' : 'accent-grey'"></div>

              <!-- Card Header -->
              <div class="indicator-header">
                <div class="indicator-code">
                  <v-icon size="12" class="mr-1">mdi-tag-outline</v-icon>
                  {{ item.code }}
                </div>
                <div class="status-pill" :class="item.active ? 'pill-active' : 'pill-inactive'">
                  {{ item.active ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
                </div>
              </div>

              <!-- Card Body -->
              <div class="indicator-body">
                <h3 class="indicator-title">{{ item.name_th }}</h3>
                <p class="indicator-desc">{{ item.description || 'ไม่มีคำอธิบายเพิ่มเติม' }}</p>
              </div>

              <!-- Meta Row -->
              <div class="indicator-meta">
                <div class="meta-item">
                  <v-icon size="13" color="indigo-darken-2" class="mr-1">mdi-folder-outline</v-icon>
                  <span class="meta-label">หัวข้อ:</span>
                  <span class="meta-val">{{ getTopicName(item.topic_id) }}</span>
                </div>
                <div class="meta-item">
                  <v-icon size="13" :color="item.type === 'score_1_4' ? 'indigo-darken-2' : 'teal-darken-2'" class="mr-1">
                    {{ item.type === 'score_1_4' ? 'mdi-numeric' : 'mdi-check-decagram' }}
                  </v-icon>
                  <span class="type-badge" :class="item.type === 'score_1_4' ? 'type-score' : 'type-yesno'">
                    {{ item.type === 'score_1_4' ? 'คะแนน 1–4' : 'ผ่าน / ไม่ผ่าน' }}
                  </span>
                </div>
              </div>

              <!-- Card Footer -->
              <div class="indicator-footer">
                <div class="indicator-weight">
                  <v-icon size="14" color="amber-darken-2" class="mr-1">mdi-star-circle</v-icon>
                  น้ำหนัก <span class="weight-val">{{ item.weight }}</span>
                </div>
                <div class="indicator-actions">
                  <v-btn icon variant="text" color="indigo-darken-2" size="small" @click="editIndicator(item)" class="action-btn">
                    <v-icon size="17">mdi-pencil-outline</v-icon>
                    <v-tooltip activator="parent" location="top">แก้ไข</v-tooltip>
                  </v-btn>
                  <v-btn icon variant="text" color="error" size="small" @click="deleteIndicator(item.id)" class="action-btn">
                    <v-icon size="17">mdi-delete-outline</v-icon>
                    <v-tooltip activator="parent" location="top">ลบ</v-tooltip>
                  </v-btn>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- Empty State -->
        <div v-else class="empty-state anim-2">
          <div class="empty-icon"><v-icon size="40" color="indigo-lighten-2">mdi-text-box-search-outline</v-icon></div>
          <div class="empty-title">ยังไม่มีตัวชี้วัด</div>
          <div class="empty-sub">สร้างตัวชี้วัดใหม่ที่ฟอร์มด้านขวาเพื่อเริ่มต้นใช้งาน</div>
        </div>

      </v-col>

      <!-- ===== RIGHT: STICKY FORM ===== -->
      <v-col cols="12" lg="4">
        <div class="section-card sticky-form anim-2" :class="{'editing-mode': editingId}">

          <div class="section-header" :class="editingId ? 'header-edit' : 'header-add'">
            <div class="header-bg-art"></div>
            <div class="section-title-group relative-z">
              <div class="section-icon-sm bg-white" :class="editingId ? 'text-orange-darken-4' : 'text-indigo-darken-4'">
                <v-icon :icon="editingId ? 'mdi-pencil' : 'mdi-plus-circle'" size="16" />
              </div>
              <div>
                <div class="section-title text-white">{{ editingId ? 'แก้ไขตัวชี้วัด' : 'เพิ่มตัวชี้วัดใหม่' }}</div>
                <div class="section-sub text-white" style="opacity: 0.7;">{{ editingId ? 'อัปเดตข้อมูลเกณฑ์ตัวชี้วัด' : 'กรอกรายละเอียดเพื่อสร้างเกณฑ์ใหม่' }}</div>
              </div>
            </div>
          </div>

          <div class="pa-5">
            <!-- Topic -->
            <div class="form-group mb-4">
              <div class="form-group-label">หัวข้อการประเมิน (Topic)</div>
              <v-select 
                v-model="form.topic_id" :items="topics" item-title="title_th" item-value="id"
                placeholder="เลือกหัวข้อ..." variant="outlined" rounded="lg" color="indigo" 
                density="comfortable" hide-details class="premium-input"
                prepend-inner-icon="mdi-folder-outline" />
            </div>

            <!-- Code -->
            <div class="form-group mb-4">
              <div class="form-group-label">รหัสตัวชี้วัด</div>
              <v-text-field v-model="form.code" placeholder="เช่น T1-01" variant="outlined" rounded="lg" color="indigo"
                density="comfortable" hide-details class="premium-input"
                prepend-inner-icon="mdi-tag-text-outline" />
            </div>

            <!-- Name -->
            <div class="form-group mb-4">
              <div class="form-group-label">ชื่อตัวชี้วัด</div>
              <v-text-field v-model="form.name_th" placeholder="ระบุชื่อตัวชี้วัด" variant="outlined" rounded="lg" color="indigo"
                density="comfortable" hide-details class="premium-input"
                prepend-inner-icon="mdi-format-text" />
            </div>

            <!-- Description -->
            <div class="form-group mb-4">
              <div class="form-group-label">คำอธิบายเพิ่มเติม</div>
              <v-textarea v-model="form.description" placeholder="รายละเอียดของตัวชี้วัดนี้" variant="outlined" rounded="lg" rows="3" color="indigo" density="comfortable" hide-details class="premium-input" />
            </div>

            <!-- Type & Weight Row -->
            <v-row dense class="mb-4">
              <v-col cols="6">
                <div class="form-group-label">รูปแบบคะแนน</div>
                <v-select v-model="form.type" :items="typeOptions" variant="outlined" rounded="lg" color="indigo"
                  density="comfortable" hide-details class="premium-input"
                  prepend-inner-icon="mdi-poll" />
              </v-col>
              <v-col cols="6">
                <div class="form-group-label">น้ำหนัก</div>
                <v-text-field v-model="form.weight" type="number" variant="outlined" rounded="lg" color="indigo"
                  density="comfortable" hide-details class="premium-input"
                  prepend-inner-icon="mdi-weight" />
              </v-col>
            </v-row>

            <!-- Status Switch -->
            <div class="switch-wrap mb-6">
              <div>
                <div class="switch-label text-uppercase text-blue-grey-darken-2">สถานะ</div>
                <div class="switch-sub" :class="form.active ? 'text-success' : 'text-grey'">
                  <div class="status-dot-sm me-1" :class="form.active ? 'dot-green' : 'dot-grey'" style="display:inline-block;"></div>
                  {{ form.active ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
                </div>
              </div>
              <v-spacer />
              <v-switch v-model="form.active" :true-value="1" :false-value="0" color="success" hide-details density="compact" />
            </div>

            <!-- Action Buttons -->
            <div class="d-flex gap-2">
              <v-btn v-if="editingId" variant="tonal" color="grey-darken-1" rounded="xl" size="large" class="flex-1-0" @click="resetForm">
                ยกเลิก
              </v-btn>
              <v-btn :color="editingId ? 'orange-darken-1' : 'indigo-darken-1'" variant="elevated" rounded="xl" size="large" class="confirm-btn font-weight-bold flex-1-1" @click="saveIndicator">
                <v-icon start>{{ editingId ? 'mdi-content-save' : 'mdi-plus-circle' }}</v-icon>
                {{ editingId ? 'อัปเดตข้อมูล' : 'บันทึกข้อมูล' }}
                <span class="btn-shine"></span>
              </v-btn>
            </div>
          </div>

        </div>
      </v-col>
    </v-row>

    <!-- Toast Notification -->
    <v-snackbar v-model="toast.show" :color="toast.color" :timeout="3000" location="top right" rounded="pill" elevation="12" class="mt-4 me-4">
      <div class="d-flex align-center">
        <v-icon :icon="toast.icon" class="me-3" size="22"></v-icon>
        <span class="text-body-1 font-weight-bold text-white">{{ toast.text }}</span>
      </div>
    </v-snackbar>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue"
import axios from "axios"
import { useRouter } from 'vue-router'

const router = useRouter()
const indicators = ref([])
const topics = ref([])
const editingId = ref(null)

// Toast Notification State
const toast = ref({ show: false, text: '', color: 'success', icon: 'mdi-check-circle' })
function showToast(text, type = 'success') {
  toast.value.text = text
  toast.value.color = type === 'success' ? 'teal-darken-1' : (type === 'error' ? 'red-darken-2' : 'indigo-darken-1')
  toast.value.icon = type === 'success' ? 'mdi-check-circle' : (type === 'error' ? 'mdi-alert-circle' : 'mdi-information')
  toast.value.show = true
}

const form = ref({
  topic_id: null,
  code: "",
  name_th: "",
  description: "",
  type: "score_1_4",
  weight: 1,
  active: 1
})

const typeOptions = [
  { title: "คะแนน 1–4", value: "score_1_4" },
  { title: "ผ่าน / ไม่ผ่าน", value: "yes_no" }
]

let authChecker = null
const forceLogout = () => { localStorage.removeItem('auth_token'); router.push('/') }

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) forceLogout()
    return Promise.reject(error)
  }
)

const getAuth = () => ({ headers: { Authorization: 'Bearer ' + localStorage.getItem('auth_token') } })

onMounted(() => {
  if (!localStorage.getItem('auth_token')) { forceLogout(); return }
  Promise.all([loadIndicators(), loadTopics()])
  authChecker = setInterval(() => { if (!localStorage.getItem('auth_token')) forceLogout() }, 500)
  window.addEventListener('storage', e => { if (e.key === 'auth_token' && !e.newValue) forceLogout() })
})

onUnmounted(() => { if (authChecker) clearInterval(authChecker) })

async function loadIndicators() {
  try {
    const { data } = await axios.get("http://localhost:7000/api/admin/indicators", getAuth())
    indicators.value = data.data
  } catch {}
}

async function loadTopics() {
  try {
    const { data } = await axios.get("http://localhost:7000/api/admin/list_topics", getAuth())
    topics.value = data.data
  } catch {}
}

function getTopicName(id) {
  const topic = topics.value.find(t => t.id === id)
  return topic ? topic.title_th : 'ไม่ระบุ'
}

function editIndicator(item) {
  editingId.value = item.id
  form.value = { 
    topic_id: item.topic_id,
    code: item.code,
    name_th: item.name_th,
    description: item.description,
    type: item.type,
    weight: item.weight,
    active: item.active ? 1 : 0
  }
}

function resetForm() {
  editingId.value = null
  form.value = {
    topic_id: null, code: "", name_th: "", description: "",
    type: "score_1_4", weight: 1, active: 1
  }
}

async function saveIndicator() {
  if (!form.value.topic_id || !form.value.code || !form.value.name_th) {
    showToast("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน", "error")
    return
  }

  try {
    const isEdit = !!editingId.value
    if (isEdit) {
      await axios.put(`http://localhost:7000/api/admin/update_indicator/${editingId.value}`, form.value, getAuth())
    } else {
      await axios.post("http://localhost:7000/api/admin/create_indicator", form.value, getAuth())
    }
    showToast(isEdit ? "อัปเดตข้อมูลตัวชี้วัดสำเร็จ" : "สร้างตัวชี้วัดสำเร็จ", "success")
    await loadIndicators()
    resetForm()
  } catch (err) {
    if (err.response?.status !== 401) showToast("เกิดข้อผิดพลาดในการบันทึก", "error")
  }
}

async function deleteIndicator(id) {
  if (!confirm("ยืนยันการลบตัวชี้วัดนี้?")) return
  try {
    await axios.delete(`http://localhost:7000/api/admin/delete_indicator/${id}`, getAuth())
    showToast("ลบตัวชี้วัดสำเร็จ", "success")
    await loadIndicators()
  } catch (err) {
    if (err.response?.status !== 401) showToast("ลบไม่สำเร็จ", "error")
  }
}
</script>

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
.header-left { display: flex; align-items: center; gap: 14px; }
.page-icon-wrap {
  width: 50px; height: 50px; border-radius: 14px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 20px rgba(26,35,126,0.3);
}
.page-title { font-size: 22px; font-weight: 900; color: #1e1b4b; letter-spacing: -0.5px; line-height: 1.2; }
.page-subtitle { font-size: 13px; color: #64748b; font-weight: 500; margin: 0; }
.header-actions { display: flex; align-items: center; gap: 12px; }
.summary-chip {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,0.85); backdrop-filter: blur(12px);
  border: 1px solid rgba(199,210,254,0.5); border-radius: 999px; padding: 8px 16px;
  font-size: 13px; font-weight: 500; color: #455a64;
  box-shadow: 0 2px 8px rgba(99,102,241,0.07);
}
.chip-label { color: #78909c; }
.chip-val { font-weight: 800; color: #1a237e; margin-left: 2px; }
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

/* ===== Section Title Group ===== */
.section-title-group { display: flex; align-items: center; gap: 10px; }
.section-icon-sm {
  width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
.section-title { font-size: 14px; font-weight: 700; color: #1a237e; line-height: 1.2; }
.section-sub { font-size: 11px; color: #90a4ae; }

/* ===== Indicator Cards ===== */
.indicator-card {
  background: rgba(255,255,255,0.85); backdrop-filter: blur(16px);
  border: 1px solid rgba(199,210,254,0.4); border-radius: 16px;
  padding: 16px 18px; position: relative; overflow: hidden;
  box-shadow: 0 4px 15px rgba(99,102,241,0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex; flex-direction: column; height: 100%;
}
.indicator-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 28px rgba(99,102,241,0.12);
  border-color: rgba(159,168,218,0.6);
}
.card-active { border-color: rgba(16,185,129,0.25); }
.card-active:hover { box-shadow: 0 12px 28px rgba(16,185,129,0.12); }

.card-accent { position: absolute; top: 0; left: 0; width: 4px; height: 100%; }
.accent-green { background: #10b981; }
.accent-grey { background: #94a3b8; }

.indicator-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 12px;
}
.indicator-code {
  display: inline-flex; align-items: center;
  background: rgba(63,81,181,0.08); color: #3949ab;
  padding: 4px 10px; border-radius: 8px;
  font-size: 11px; font-weight: 800; letter-spacing: 0.5px;
}
.status-pill {
  font-size: 10.5px; font-weight: 700; padding: 4px 10px; border-radius: 99px;
}
.pill-active { background: rgba(16,185,129,0.12); color: #059669; }
.pill-inactive { background: rgba(148,163,184,0.15); color: #64748b; }

.indicator-body { flex: 1; margin-bottom: 10px; }
.indicator-title { font-size: 14px; font-weight: 700; color: #1a237e; margin-bottom: 4px; line-height: 1.4; }
.indicator-desc {
  font-size: 12px; color: #64748b; line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

.indicator-meta {
  display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px;
}
.meta-item {
  display: flex; align-items: center; font-size: 11.5px; color: #546e7a;
}
.meta-label { font-weight: 600; margin-right: 4px; }
.meta-val { font-weight: 700; color: #1a237e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px; }

.type-badge {
  display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 6px;
  font-size: 10.5px; font-weight: 700;
}
.type-score { background: rgba(63,81,181,0.1); color: #3949ab; }
.type-yesno { background: rgba(0,150,136,0.1); color: #00897b; }

.indicator-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 10px; border-top: 1px dashed rgba(199,210,254,0.5);
}
.indicator-weight {
  display: flex; align-items: center; font-size: 11.5px; font-weight: 600; color: #546e7a;
}
.weight-val { font-size: 15px; font-weight: 900; color: #1a237e; margin-left: 4px; }
.indicator-actions { display: flex; gap: 2px; }
.action-btn { transition: all 0.2s !important; }
.action-btn:hover { transform: scale(1.15); background: rgba(99,102,241,0.08) !important; }

/* ===== Empty state ===== */
.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 50px 20px; background: rgba(255,255,255,0.6);
  border: 1px dashed rgba(199,210,254,0.6); border-radius: 16px;
  text-align: center;
}
.empty-icon {
  width: 70px; height: 70px; border-radius: 50%;
  background: rgba(99,102,241,0.08); display: flex; align-items: center; justify-content: center;
  margin-bottom: 16px;
}
.empty-title { font-size: 16px; font-weight: 700; color: #1a237e; margin-bottom: 4px; }
.empty-sub { font-size: 13px; color: #78909c; }

/* ===== Sticky Form ===== */
.section-card {
  background: rgba(255,255,255,0.95); backdrop-filter: blur(20px);
  border: 1px solid rgba(199,210,254,0.4); border-radius: 20px; overflow: hidden;
  box-shadow: 0 4px 20px rgba(99,102,241,0.07);
  transition: all 0.3s;
}
.sticky-form { position: sticky; top: 20px; }
.editing-mode {
  border-color: rgba(245,158,11,0.4) !important;
  box-shadow: 0 8px 30px rgba(245,158,11,0.15) !important;
}
.section-header { padding: 18px 20px; position: relative; overflow: hidden; }
.header-add { background: linear-gradient(135deg, #1a237e, #3f51b5); }
.header-edit { background: linear-gradient(135deg, #78350f, #d97706); }
.header-bg-art {
  position: absolute; inset: 0;
  background-image: radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px);
  background-size: 16px 16px; pointer-events: none;
}
.relative-z { position: relative; z-index: 1; }

.form-group-label {
  font-size: 11.5px; font-weight: 700; color: #546e7a;
  margin-bottom: 6px; letter-spacing: 0.3px;
}

.premium-input :deep(.v-field) {
  border-radius: 12px !important; box-shadow: 0 2px 6px rgba(0,0,0,0.03) inset !important;
  transition: all 0.2s; border: 1px solid transparent;
}
.premium-input :deep(.v-field--focused) {
  box-shadow: 0 0 0 3px rgba(99,102,241,0.2) !important; border-color: #6366f1;
}

.switch-wrap {
  display: flex; align-items: center; gap: 12px;
  background: white; border: 1px solid #e2e8f0;
  border-radius: 14px; padding: 10px 14px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.02) inset;
}
.switch-label { font-size: 11px; font-weight: 800; letter-spacing: 0.5px; }
.switch-sub { font-size: 13px; display: flex; align-items: center; }

.status-dot-sm { width: 8px; height: 8px; border-radius: 50%; }
.dot-green { background: #10b981; box-shadow: 0 0 0 2px rgba(16,185,129,0.2); }
.dot-grey { background: #94a3b8; }

.gap-2 { gap: 10px; }
.flex-1-0 { flex: 1 0 auto; }
.flex-1-1 { flex: 1 1 auto; }

/* Confirm button */
.confirm-btn { position: relative; overflow: hidden; box-shadow: 0 4px 15px rgba(26,35,126,0.2) !important; transition: all 0.25s !important; }
.confirm-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(26,35,126,0.3) !important; }
.btn-shine {
  position: absolute; top: 0; left: -75%; width: 50%; height: 100%;
  background: linear-gradient(120deg, transparent, rgba(255,255,255,0.22), transparent);
  transform: skewX(-20deg); animation: btnShine 4s ease-in-out infinite;
}
@keyframes btnShine { 0% { left: -75%; } 30% { left: 125%; } 100% { left: 125%; } }

/* ===== Entrance Animations ===== */
.anim-1 { animation: cardUp 0.5s 0.05s ease-out both; }
.anim-2 { animation: cardUp 0.5s 0.15s ease-out both; }
.anim-3 { animation: cardUp 0.5s 0.25s ease-out both; }
.anim-4 { animation: cardUp 0.5s 0.35s ease-out both; }
.anim-5 { animation: cardUp 0.5s 0.45s ease-out both; }
.anim-6 { animation: cardUp 0.5s 0.55s ease-out both; }
@keyframes cardUp { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
</style>