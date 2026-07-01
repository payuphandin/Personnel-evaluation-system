<template>
  <div class="dashboard-page">
    
    <!-- Ambient Background -->
    <div class="blob-1"></div>
    <div class="blob-2"></div>

    <!-- ===== PAGE HEADER ===== -->
    <div class="page-header mb-8 anim-1">
      <div class="header-left">
        <div class="page-icon-wrap" style="background: linear-gradient(135deg, #2563eb, #4f46e5);">
          <v-icon icon="mdi-shape-outline" size="26" color="white" />
        </div>
        <div>
          <h1 class="page-title">ประเภทสาขาอาชีพ</h1>
          <p class="page-subtitle">จัดการหมวดหมู่และรหัสสาขาอาชีพในระบบ</p>
        </div>
      </div>
      <div class="header-actions">
        <v-btn color="indigo-darken-3" size="x-large" rounded="xl" class="add-period-btn font-weight-black" @click="add">
          <v-icon start size="22">mdi-plus-box-multiple</v-icon>
          เพิ่มสาขาอาชีพ
          <span class="btn-shine"></span>
        </v-btn>
      </div>
    </div>

    <!-- ===== PREMIUM SUMMARY METRICS ===== -->
    <v-row class="mb-8 anim-2">
      <v-col cols="12" md="4">
        <div class="metric-card">
          <div class="metric-icon bg-indigo-lighten-5 text-indigo-darken-3"><v-icon>mdi-format-list-bulleted-type</v-icon></div>
          <div class="metric-data">
            <div class="metric-label">สาขาอาชีพทั้งหมด</div>
            <div class="metric-val text-indigo-darken-4">{{ categories.length }} <span class="metric-unit">รายการ</span></div>
          </div>
        </div>
      </v-col>
      <v-col cols="12" md="8">
        <div class="metric-card bg-gradient-indigo text-white px-6">
          <div class="d-flex align-center h-100">
            <div class="me-4"><v-icon size="40" color="white" style="opacity: 0.8">mdi-information-outline</v-icon></div>
            <div>
              <div class="font-weight-bold text-h6 mb-1">การจัดการสาขาอาชีพ</div>
              <div class="text-caption" style="opacity: 0.8">รหัสสาขาอาชีพใช้สำหรับอ้างอิงในการประเมินและจัดกลุ่มบุคลากร</div>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- ===== CARDS GRID ===== -->
    <div class="d-flex align-center mb-6 anim-3">
      <v-icon color="indigo-darken-2" class="me-2" size="20">mdi-view-grid-outline</v-icon>
      <h2 class="text-h6 font-weight-black text-indigo-darken-4 mb-0">รายการสาขาอาชีพในระบบ</h2>
      <v-spacer></v-spacer>
    </div>

    <v-row v-if="categories.length > 0">
      <v-col v-for="(item, index) in categories" :key="item.id" cols="12" md="6" lg="4" xl="3">
        <div class="period-card" :class="[`anim-${(index % 4) + 3}`]">
          <div class="card-glow-bg"></div>
          <div class="card-inner relative-z">
            
            <div class="d-flex justify-space-between align-start mb-5">
              <div class="d-flex align-center">
                <v-avatar color="indigo-lighten-5" size="48" class="shadow-sm me-3 text-indigo-darken-3 font-weight-bold">
                  <v-icon>mdi-briefcase-variant</v-icon>
                </v-avatar>
                <div>
                  <h3 class="text-h6 font-weight-black text-indigo-darken-4 line-height-1 mb-1">{{ item.name_th }}</h3>
                  <div class="text-caption font-weight-bold text-blue-grey-lighten-1 d-flex align-center">
                    <v-icon size="12" class="me-1">mdi-tag-outline</v-icon> รหัส: {{ item.code }}
                  </div>
                </div>
              </div>
            </div>

            <v-divider class="border-opacity-10 mb-5" />

            <div class="d-flex align-center justify-space-between text-caption text-grey-darken-1 mb-6">
              <div>
                <v-icon size="14" class="me-1">mdi-clock-outline</v-icon> สร้าง: {{ formatDateDisplay(item.created_at) }}
              </div>
              <div class="font-weight-bold text-indigo-lighten-2">
                ID: #{{ item.id }}
              </div>
            </div>

            <div class="card-actions-row mt-6">
              <v-btn variant="tonal" color="blue-grey-darken-2" rounded="lg" size="small" class="action-btn font-weight-bold flex-1-1 me-2" @click="edit(item.id)">
                <v-icon start size="16">mdi-pencil-outline</v-icon> แก้ไข
              </v-btn>
              <v-btn variant="tonal" color="error" rounded="lg" size="small" class="action-btn font-weight-bold flex-1-1 ms-2" @click="openConfirm(item.id)">
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
        <v-icon size="45" color="indigo-lighten-1">mdi-database-off</v-icon>
      </div>
      <h3 class="empty-title">ยังไม่มีสาขาอาชีพในระบบ</h3>
      <p class="empty-sub">เริ่มต้นสร้างสาขาอาชีพใหม่โดยคลิกปุ่มด้านขวาบน</p>
    </div>

    <!-- ===== DIALOG ===== -->
    <v-dialog v-model="dialog" max-width="500" persistent scrollable>
      <v-card class="dialog-card overflow-hidden pa-0" rounded="xl">
        <div class="dialog-header" :class="isEditing ? 'dialog-edit' : 'dialog-add'">
          <div class="dialog-header-bg"></div>
          <div class="d-flex align-center gap-3 relative-z">
            <v-avatar color="rgba(255,255,255,0.2)" size="50" class="border shadow-sm">
              <v-icon :icon="isEditing ? 'mdi-pencil-box-multiple' : 'mdi-plus-box-multiple'" size="26" color="white" />
            </v-avatar>
            <div>
              <div class="dialog-title">{{ isEditing ? 'แก้ไขสาขาอาชีพ' : 'เพิ่มสาขาอาชีพใหม่' }}</div>
              <div class="dialog-sub">{{ isEditing ? `กำลังแก้ไข ID: #${formModel.id}` : 'กำหนดชื่อและรหัสอ้างอิงสาขาอาชีพ' }}</div>
            </div>
          </div>
        </div>

        <v-card-text class="pa-6 bg-grey-lighten-5">
          <v-row dense>
            <v-col cols="12" class="mb-2">
              <label class="field-label mb-1 d-block"><v-icon size="14" color="indigo-darken-1" class="me-1">mdi-briefcase-outline</v-icon> ชื่อสาขาอาชีพ</label>
              <v-text-field v-model="formModel.name_th" placeholder="ระบุชื่อสาขาอาชีพ" variant="outlined" rounded="lg" color="indigo" bg-color="white" density="comfortable" hide-details class="premium-input" />
            </v-col>
            <v-col cols="12" md="6" class="mb-2">
              <label class="field-label mb-1 d-block"><v-icon size="14" color="indigo-darken-1" class="me-1">mdi-tag-outline</v-icon> รหัสอ้างอิง</label>
              <v-text-field v-model="formModel.code" placeholder="เช่น IT, MGMT" variant="outlined" rounded="lg" color="indigo" bg-color="white" density="comfortable" hide-details class="premium-input" />
            </v-col>
            <v-col cols="12" md="6" v-if="isEditing" class="mb-2">
              <label class="field-label mb-1 d-block"><v-icon size="14" color="grey-darken-1" class="me-1">mdi-identifier</v-icon> ID ระบบ</label>
              <v-text-field v-model="formModel.id" variant="filled" rounded="lg" color="grey" bg-color="grey-lighten-3" density="comfortable" hide-details readonly class="premium-input" />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider class="border-opacity-10" />

        <div class="dialog-actions pa-4 bg-white d-flex justify-end">
          <v-btn variant="text" color="blue-grey-darken-1" rounded="xl" class="font-weight-bold px-4" @click="dialog = false">
            ยกเลิก
          </v-btn>
          <v-btn :color="isEditing ? 'orange-darken-2' : 'indigo-darken-4'" variant="elevated" rounded="xl" size="large" class="px-8 ms-2 font-weight-black shadow-action" @click="save">
            <v-icon start>{{ isEditing ? 'mdi-content-save' : 'mdi-check-decagram' }}</v-icon>
            {{ isEditing ? 'บันทึกการแก้ไข' : 'สร้างสาขาอาชีพ' }}
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
.bg-gradient-indigo { background: linear-gradient(135deg, #312e81, #4f46e5) !important; border: none; box-shadow: 0 10px 30px rgba(49,46,129,0.2) !important; }

/* ===== Period Cards ===== */
.period-card {
  position: relative; overflow: hidden;
  background: rgba(255,255,255,0.9); backdrop-filter: blur(20px);
  border: 1px solid rgba(226,232,240,1); border-radius: 24px;
  padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.03);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%; display: flex; flex-direction: column;
}
.period-card:hover { transform: translateY(-4px); box-shadow: 0 15px 40px rgba(49,46,129,0.08); border-color: rgba(99,102,241,0.5); }
.card-glow-bg {
  position: absolute; inset: 0; opacity: 0; transition: opacity 0.4s;
  background: radial-gradient(circle at top right, rgba(99,102,241,0.1), transparent 60%); pointer-events: none;
}
.period-card:hover .card-glow-bg { opacity: 1; }
.card-inner { position: relative; z-index: 1; display: flex; flex-direction: column; flex: 1; }

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
.card-actions-row { display: flex; margin-top: auto; }

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
import { onMounted, ref, shallowRef, toRef } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const categories = ref([])
const dialog = shallowRef(false)
const formModel = ref({ code: '', name_th: '' })
const isEditing = toRef(() => !!formModel.value.id)

function formatDateDisplay(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('th-TH', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

let authChecker = null
const forceLogout = () => { localStorage.removeItem('auth_token'); router.push('/') }

const getAuth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` } })

async function load() {
  try {
    const { data } = await axios.get("http://localhost:7000/api/admin/list_category", getAuth())
    categories.value = data.data
  } catch (error) {
    console.error("Load error:", error)
  }
}

onMounted(() => {
  if (!localStorage.getItem('auth_token')) { forceLogout(); return }
  load()
})

function add() {
  formModel.value = { code: '', name_th: '' }
  dialog.value = true
}

function edit(id) {
  const found = categories.value.find(c => c.id === id)
  formModel.value = { ...found }
  dialog.value = true
}

async function save() {
  try {
    if (isEditing.value) {
      await axios.put(`http://localhost:7000/api/admin/update_cat/${formModel.value.id}`, formModel.value, getAuth())
    } else {
      await axios.post('http://localhost:7000/api/admin/create_cat/', formModel.value, getAuth())
    }
    dialog.value = false
    await load()
  } catch (error) {
    alert("ผิดพลาด: " + (error.response?.data?.message || error.message))
  }
}

function openConfirm(id) {
  if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) {
    remove(id)
  }
}

async function remove(id) {
  try {
    await axios.delete(`http://localhost:7000/api/admin/delete_cat/${id}`, getAuth())
    load()
  } catch (error) {
    console.error(error)
  }
}
</script>