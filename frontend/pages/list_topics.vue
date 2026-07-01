<template>
  <div class="dashboard-page">

    <!-- ===== PAGE HEADER ===== -->
    <div class="page-header mb-8">
      <div class="header-left">
        <div class="page-icon-wrap">
          <v-icon icon="mdi-format-list-bulleted-type" size="22" color="white" />
        </div>
        <div>
          <h1 class="page-title">จัดการหัวข้อประเมิน</h1>
          <p class="page-subtitle">สร้างและแก้ไขหัวข้อหลักที่ใช้ในการประเมินผล</p>
        </div>
      </div>
      <div class="header-actions">
        <div class="summary-chip">
          <v-icon size="14" color="indigo-darken-2" class="mr-1">mdi-format-list-checks</v-icon>
          <span class="chip-label">หัวข้อทั้งหมด</span>
          <span class="chip-val">{{ topics.length }} รายการ</span>
        </div>
      </div>
    </div>

    <v-row>
      <!-- ===== LEFT: TOPIC CARDS GRID ===== -->
      <v-col cols="12" lg="8">
        
        <div class="d-flex align-center justify-space-between mb-4 anim-1">
          <div class="section-title-group">
            <div class="section-icon-sm" style="background: linear-gradient(135deg, #0284c7, #38bdf8);">
              <v-icon icon="mdi-view-grid" size="16" color="white" />
            </div>
            <div>
              <div class="section-title">รายการหัวข้อปัจจุบัน</div>
              <div class="section-sub">หัวข้อการประเมินทั้งหมดในระบบ</div>
            </div>
          </div>
        </div>

        <v-row v-if="topics.length > 0">
          <v-col cols="12" sm="6" v-for="(item, index) in topics" :key="item.id">
            <div class="topic-card" :class="`anim-${(index % 5) + 1}`">
              <!-- เส้นสีเน้นสถานะ -->
              <div class="topic-accent" :class="(item.active === 'active' || item.active === 1) ? 'accent-green' : 'accent-grey'"></div>
              
              <!-- Card Header -->
              <div class="topic-header">
                <div class="topic-code">
                  <v-icon size="12" class="mr-1">mdi-tag-outline</v-icon>
                  {{ item.code }}
                </div>
                <div class="status-pill" :class="(item.active === 'active' || item.active === 1) ? 'pill-active' : 'pill-inactive'">
                  {{ (item.active === 'active' || item.active === 1) ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
                </div>
              </div>

              <!-- Card Body -->
              <div class="topic-body">
                <h3 class="topic-title">{{ item.title_th }}</h3>
                <p class="topic-desc">{{ item.description || 'ไม่มีคำอธิบายเพิ่มเติม' }}</p>
              </div>

              <!-- Card Footer -->
              <div class="topic-footer">
                <div class="topic-weight">
                  <v-icon size="14" color="amber-darken-2" class="mr-1">mdi-star-circle</v-icon>
                  น้ำหนัก <span class="weight-val">{{ item.weight }}%</span>
                </div>
                <div class="topic-actions">
                  <v-btn icon variant="text" color="indigo-darken-2" size="small" @click="editTopic(item)" class="action-btn">
                    <v-icon size="17">mdi-pencil-outline</v-icon>
                    <v-tooltip activator="parent" location="top">แก้ไข</v-tooltip>
                  </v-btn>
                  <v-btn icon variant="text" color="error" size="small" @click="deleteTopic(item.id)" class="action-btn">
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
          <div class="empty-title">ยังไม่มีหัวข้อประเมิน</div>
          <div class="empty-sub">สร้างหัวข้อใหม่ที่ฟอร์มด้านขวาเพื่อเริ่มต้นใช้งาน</div>
        </div>

      </v-col>

      <!-- ===== RIGHT: STICKY FORM ===== -->
      <v-col cols="12" lg="4">
        <div class="section-card sticky-form anim-2" :class="{'editing-mode': editingId}">
          
          <div class="section-header" :class="editingId ? 'header-edit' : 'header-add'">
            <div class="header-bg-art"></div>
            <div class="section-title-group relative-z">
              <div class="section-icon-sm bg-white" :class="editingId ? 'text-orange-darken-4' : 'text-indigo-darken-4'">
                <v-icon :icon="editingId ? 'mdi-pencil-circle' : 'mdi-plus-circle'" size="18" />
              </div>
              <div>
                <div class="section-title text-white" style="font-size:15px">{{ editingId ? "แก้ไขหัวข้อ" : "เพิ่มหัวข้อใหม่" }}</div>
                <div class="section-sub text-white opacity-80">{{ editingId ? `กำลังแก้ไข: ${form.code}` : "ระบุรายละเอียดหัวข้อประเมิน" }}</div>
              </div>
            </div>
          </div>

          <div class="form-body pa-5">
            <div class="form-group mb-4">
              <div class="form-group-label">รหัสหัวข้อ</div>
              <v-text-field v-model="form.code" placeholder="เช่น TOP1, P1" variant="outlined" rounded="lg" color="indigo" density="comfortable" hide-details prepend-inner-icon="mdi-identifier" />
            </div>
            
            <div class="form-group mb-4">
              <div class="form-group-label">ชื่อหัวข้อ</div>
              <v-text-field v-model="form.title_th" placeholder="ชื่อหัวข้อ (ภาษาไทย)" variant="outlined" rounded="lg" color="indigo" density="comfortable" hide-details prepend-inner-icon="mdi-format-title" />
            </div>

            <v-row dense class="mb-4">
              <v-col cols="6">
                <div class="form-group">
                  <div class="form-group-label">น้ำหนักคะแนน (%)</div>
                  <v-text-field v-model.number="form.weight" type="number" placeholder="0-100" variant="outlined" rounded="lg" color="indigo" density="comfortable" hide-details>
                    <template #append-inner><v-icon color="grey" size="18">mdi-percent</v-icon></template>
                  </v-text-field>
                </div>
              </v-col>
              <v-col cols="6">
                <div class="form-group">
                  <div class="form-group-label">สถานะการใช้งาน</div>
                  <v-select
                    v-model="form.active"
                    :items="[{ title: 'เปิดใช้งาน', value: 1 }, { title: 'ปิดใช้งาน', value: 0 }]"
                    item-title="title" item-value="value"
                    variant="outlined" rounded="lg" color="indigo" density="comfortable" hide-details
                  >
                    <template #selection="{ item }">
                      <div class="d-flex align-center gap-2">
                        <div class="status-dot-sm" :class="item.value === 1 ? 'dot-green' : 'dot-grey'"></div>
                        <span style="font-size:13px; font-weight:600">{{ item.title }}</span>
                      </div>
                    </template>
                  </v-select>
                </div>
              </v-col>
            </v-row>

            <div class="form-group mb-6">
              <div class="form-group-label">คำอธิบายเพิ่มเติม</div>
              <v-textarea v-model="form.description" placeholder="รายละเอียดของหัวข้อนี้" variant="outlined" rounded="lg" rows="3" color="indigo" density="comfortable" hide-details />
            </div>

            <div class="d-flex gap-2">
              <v-btn v-if="editingId" variant="tonal" color="grey-darken-1" rounded="xl" size="large" class="flex-1-0" @click="resetForm">
                ยกเลิก
              </v-btn>
              <v-btn :color="editingId ? 'orange-darken-1' : 'indigo-darken-1'" variant="elevated" rounded="xl" size="large" class="confirm-btn font-weight-bold flex-1-1" @click="saveTopic">
                <v-icon start>{{ editingId ? 'mdi-content-save' : 'mdi-plus-circle' }}</v-icon>
                {{ editingId ? 'อัปเดตข้อมูล' : 'บันทึกข้อมูล' }}
                <span class="btn-shine"></span>
              </v-btn>
            </div>
          </div>

        </div>
      </v-col>
    </v-row>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
* { font-family: 'Inter', sans-serif !important; }

.dashboard-page { padding: 8px 0; }

/* ===== Page Header ===== */
.page-header {
  display: flex; align-items: center; justify-content: space-between;
  animation: fadeSlideDown 0.6s ease-out both;
}
.header-left { display: flex; align-items: center; gap: 14px; }
.page-icon-wrap {
  width: 46px; height: 46px; border-radius: 14px; flex-shrink: 0;
  background: linear-gradient(135deg, #1a237e, #3f51b5);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 20px rgba(26,35,126,0.3);
}
.page-title { font-size: 20px; font-weight: 800; color: #1a237e; letter-spacing: -0.4px; line-height: 1.2; }
.page-subtitle { font-size: 12.5px; color: #78909c; margin: 0; }

.summary-chip {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,0.8); backdrop-filter: blur(12px);
  border: 1px solid rgba(199,210,254,0.5); border-radius: 999px; padding: 6px 14px;
  font-size: 12.5px; font-weight: 500; color: #455a64;
  box-shadow: 0 2px 8px rgba(99,102,241,0.07);
}
.chip-label { color: #78909c; }
.chip-val   { font-weight: 800; color: #1a237e; margin-left: 2px; }

@keyframes fadeSlideDown {
  from { opacity: 0; transform: translateY(-12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ===== Topic Cards Grid ===== */
.section-title-group { display: flex; align-items: center; gap: 10px; }
.section-icon-sm {
  width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
.section-title { font-size: 14px; font-weight: 700; color: #1a237e; line-height: 1.2; }
.section-sub   { font-size: 11px; color: #90a4ae; }

.topic-card {
  background: rgba(255,255,255,0.85); backdrop-filter: blur(16px);
  border: 1px solid rgba(199,210,254,0.4); border-radius: 16px;
  padding: 16px 18px; position: relative; overflow: hidden;
  box-shadow: 0 4px 15px rgba(99,102,241,0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex; flex-direction: column; height: 100%;
}
.topic-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 28px rgba(99,102,241,0.12);
  border-color: rgba(159,168,218,0.6);
}

.topic-accent { position: absolute; top: 0; left: 0; width: 4px; height: 100%; }
.accent-green { background: #10b981; }
.accent-grey  { background: #94a3b8; }

.topic-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 12px;
}
.topic-code {
  display: inline-flex; align-items: center;
  background: rgba(63,81,181,0.08); color: #3949ab;
  padding: 4px 10px; border-radius: 8px;
  font-size: 11px; font-weight: 800; letter-spacing: 0.5px;
}
.status-pill {
  font-size: 10.5px; font-weight: 700; padding: 4px 10px; border-radius: 99px;
}
.pill-active   { background: rgba(16,185,129,0.12); color: #059669; }
.pill-inactive { background: rgba(148,163,184,0.15); color: #64748b; }

.topic-body { flex: 1; margin-bottom: 16px; }
.topic-title { font-size: 15px; font-weight: 700; color: #1a237e; margin-bottom: 6px; line-height: 1.3; }
.topic-desc {
  font-size: 12px; color: #64748b; line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

.topic-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 12px; border-top: 1px dashed rgba(199,210,254,0.5);
}
.topic-weight {
  display: flex; align-items: center; font-size: 11.5px; font-weight: 600; color: #546e7a;
}
.weight-val { font-size: 15px; font-weight: 900; color: #1a237e; margin-left: 4px; }
.action-btn { transition: all 0.2s !important; }
.action-btn:hover { transform: scale(1.15); background: rgba(99,102,241,0.08) !important; }

/* Empty state */
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
.header-add  { background: linear-gradient(135deg, #1a237e, #3f51b5); }
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

.status-dot-sm { width: 8px; height: 8px; border-radius: 50%; }
.dot-green { background: #10b981; box-shadow: 0 0 0 2px rgba(16,185,129,0.2); }
.dot-grey  { background: #94a3b8; }

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
@keyframes btnShine {
  0%  { left: -75%; }
  30% { left: 125%; }
  100%{ left: 125%; }
}

/* ===== Entrance Animations ===== */
.anim-1 { animation: cardUp 0.5s 0.05s ease-out both; }
.anim-2 { animation: cardUp 0.5s 0.15s ease-out both; }
.anim-3 { animation: cardUp 0.5s 0.25s ease-out both; }
.anim-4 { animation: cardUp 0.5s 0.35s ease-out both; }
.anim-5 { animation: cardUp 0.5s 0.45s ease-out both; }
@keyframes cardUp {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
</style>

<script setup>
import { ref, onMounted, onUnmounted } from "vue"
import axios from "axios"
import { useRouter } from 'vue-router'

const router = useRouter()
const topics = ref([])
const editingId = ref(null)

const form = ref({ code: "", title_th: "", description: "", weight: 0, active: 1 })
let authChecker = null

const forceLogout = () => {
    localStorage.removeItem("auth_token")
    router.push('/')
}

// Interceptor ดัก Token หมดอายุ
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) forceLogout()
        return Promise.reject(error)
    }
)

const getAuth = () => ({ headers: { Authorization: "Bearer " + localStorage.getItem("auth_token") } })

onMounted(() => {
    if (!localStorage.getItem("auth_token")) { forceLogout(); return }
    loadTopics()
    
    authChecker = setInterval(() => { if (!localStorage.getItem("auth_token")) forceLogout() }, 500)
    window.addEventListener('storage', e => { if (e.key === 'auth_token' && !e.newValue) forceLogout() })
})

onUnmounted(() => {
    if (authChecker) clearInterval(authChecker)
})

async function loadTopics() {
  try {
    const { data } = await axios.get("http://localhost:7000/api/admin/list_topics", getAuth())
    topics.value = data.data
  } catch (err) { /* interceptor handles 401 */ }
}

function editTopic(item) {
  editingId.value = item.id
  form.value = { 
    code: item.code,
    title_th: item.title_th,
    description: item.description,
    weight: item.weight,
    active: (item.active === 'active' || item.active === 1) ? 1 : 0
  }
}

function resetForm() {
  editingId.value = null;
  form.value = { code: "", title_th: "", description: "", weight: 0, active: 1 };
}

async function saveTopic() {
  if (!form.value.title_th || !form.value.code) return alert("กรุณากรอกรหัสและชื่อหัวข้อให้ครบถ้วน")
  
  try {
    if (editingId.value) {
      await axios.put(`http://localhost:7000/api/admin/update_topics/${editingId.value}`, form.value, getAuth())
    } else {
      await axios.post("http://localhost:7000/api/admin/create_topics", form.value, getAuth())
    }
    await loadTopics()
    resetForm()
  } catch (err) {
    if (err.response?.status !== 401) alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล")
  }
}

async function deleteTopic(id) {
  if (!confirm("ต้องการลบหัวข้อนี้หรือไม่?")) return
  try {
    await axios.delete(`http://localhost:7000/api/admin/delete_topic/${id}`, getAuth())
    await loadTopics()
  } catch (err) {
    if (err.response?.status !== 401) alert("ลบไม่สำเร็จ")
  }
}
</script>