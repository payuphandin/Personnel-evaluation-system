<template>
  <div class="profile-page">
    
    <div class="blob-1"></div>
    <div class="blob-2"></div>

    <v-container class="py-10 relative-content" style="max-width: 900px">
      
      <div class="d-flex align-center mb-8 anim-1">
        <v-btn icon variant="tonal" color="indigo-darken-4" @click="router.back()" class="me-4 shadow-sm back-btn">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <div>
          <h1 class="text-h4 font-weight-black text-indigo-darken-4 line-height-1 mb-1">ข้อมูลส่วนตัว</h1>
          <p class="text-subtitle-2 text-blue-grey-darken-1 mb-0">ตรวจสอบและจัดการโปรไฟล์ของคุณ</p>
        </div>
      </div>

      <v-card border rounded="xl" class="glass-card overflow-hidden anim-2 mb-6">
        
        <div class="profile-cover">
          <div class="cover-overlay"></div>
        </div>

        <div class="profile-content px-6 px-md-10 pb-10">
          <div class="d-flex flex-column flex-md-row align-center align-md-end" style="margin-top: -60px;">
            
            <div class="avatar-wrapper mb-4 mb-md-0 me-md-6">
  <v-avatar
    size="140"
    class="profile-avatar shadow-lg"
    :color="getRoleColor(profile.role)"
  >
    <v-img
      v-if="previewAvatarUrl || profile.avatar"
      :src="previewAvatarUrl || `http://localhost:7000/uploads/avatars/${profile.avatar}`"
      cover
    />
    <span v-else class="text-h2 font-weight-black text-white">
      {{ getInitials(profile.name_th) }}
    </span>
  </v-avatar>

  <v-btn
    v-if="isEditing"
  class="avatar-overlay"
  @click="triggerFileSelect"
>
  <v-icon size="36">mdi-camera</v-icon>
  <span>เปลี่ยนรูปโปรไฟล์</span>
  </v-btn>

  <input
    type="file"
    ref="fileInput"
    class="d-none"
    accept="image/jpeg,image/jpg,image/png"
    @change="onFileSelected"
  />
</div>

            <div class="text-center text-md-left flex-1-1 pb-2">
              <div class="d-flex align-center justify-center justify-md-start mb-2">
                <h2 class="text-h4 font-weight-black text-indigo-darken-4 me-3">{{ profile.name_th || 'กำลังโหลด...' }}</h2>
                <v-chip v-if="profile.role" size="small" :color="getRoleColor(profile.role)" variant="flat" class="font-weight-bold px-3 text-white text-uppercase shadow-sm">
                  <v-icon start size="14">{{ getRoleIcon(profile.role) }}</v-icon>
                  {{ profile.role }}
                </v-chip>
              </div>
              <p class="text-subtitle-1 text-blue-grey-darken-2 font-weight-medium mb-0 d-flex align-center justify-center justify-md-start">
                <v-icon size="16" class="me-2">mdi-email-outline</v-icon>
                {{ profile.email || 'กำลังโหลด...' }}
              </p>
            </div>
          </div>

          <v-divider class="my-8 border-opacity-10" />

          <div v-if="!loading">
            <div class="d-flex align-center justify-space-between mb-5">
              <h3 class="text-h6 font-weight-bold text-indigo-darken-3 d-flex align-center mb-0">
                <v-icon color="indigo-lighten-1" class="me-2">mdi-card-account-details-outline</v-icon>
                รายละเอียดข้อมูล
              </h3>
              <v-btn v-if="!isEditing" color="indigo-darken-2" variant="tonal" size="small" @click="startEdit">
                <v-icon start>mdi-pencil</v-icon> แก้ไขข้อมูล
              </v-btn>
            </div>
            
            <v-row>
              <v-col cols="12" md="6">
                <div class="info-group">
                  <div class="info-label">ชื่อ-นามสกุล</div>
                  <div v-if="!isEditing" class="info-val">{{ profile.name_th || '-' }}</div>
                  <v-text-field v-else v-model="editForm.name_th" density="compact" variant="outlined" hide-details bg-color="white"></v-text-field>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="info-group">
                  <div class="info-label">อีเมล</div>
                  <div v-if="!isEditing" class="info-val">{{ profile.email || '-' }}</div>
                  <v-text-field v-else v-model="editForm.email" density="compact" variant="outlined" hide-details bg-color="white" type="email"></v-text-field>
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <div class="info-group">
                  <div class="info-label">กลุ่มงาน / ฝ่าย</div>
                  <div v-if="!isEditing" class="info-val d-flex align-center">
                    <v-icon size="16" color="blue-grey-lighten-1" class="me-2">mdi-account-group-outline</v-icon>
                    {{ profile.org_group_name || 'ไม่ระบุฝ่าย' }}
                  </div>
                  <v-select v-else v-model="editForm.org_group_id" :items="orgGroups" item-title="name_th" item-value="id" placeholder="เลือกกลุ่มงาน" density="compact" variant="outlined" hide-details bg-color="white"></v-select>
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <div class="info-group">
                  <div class="info-label">สังกัด / แผนก</div>
                  <div v-if="!isEditing" class="info-val d-flex align-center">
                    <v-icon size="16" color="blue-grey-lighten-1" class="me-2">mdi-office-building-outline</v-icon>
                    {{ profile.department_name || 'ไม่ระบุสังกัด' }}
                  </div>
                  <v-select v-else v-model="editForm.department_id" :items="departments" item-title="name_th" item-value="id" placeholder="เลือกแผนก" density="compact" variant="outlined" hide-details bg-color="white"></v-select>
                </div>
              </v-col>
              
              <v-col cols="12" md="6">
                <div class="info-group">
                  <div class="info-label">สิทธิ์การใช้งาน (Role)</div>
                  <div class="info-val text-uppercase text-indigo-darken-2 font-weight-bold">{{ profile.role || '-' }}</div>
                </div>
              </v-col>
            </v-row>

            <v-slide-y-transition>
              <div v-if="isEditing" class="d-flex justify-end mt-6">
                <v-btn variant="text" color="blue-grey-darken-1" class="me-3" @click="cancelEdit" :disabled="saving">ยกเลิก</v-btn>
                <v-btn color="indigo-darken-2" @click="saveProfile" :loading="saving">บันทึกข้อมูล</v-btn>
              </div>
            </v-slide-y-transition>

          </div>
          
          <div v-else class="text-center py-10">
            <v-progress-circular indeterminate color="indigo-darken-2" size="50"></v-progress-circular>
          </div>

        </div>
      </v-card>
      
    </v-container>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="top right">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
* { font-family: 'Inter', sans-serif !important; }

.profile-page { min-height: 100vh; position: relative; overflow: hidden; background: radial-gradient(circle at top left, #f8fafc 0%, #e0e7ff 50%, #eef2ff 100%); }

/* Ambient */
.blob-1, .blob-2 { position: absolute; border-radius: 50%; filter: blur(100px); z-index: 0; opacity: 0.6; pointer-events: none; }
.blob-1 { top: -100px; left: -50px; width: 600px; height: 600px; background: rgba(165, 180, 252, 0.5); }
.blob-2 { bottom: 0; right: -50px; width: 500px; height: 500px; background: rgba(56, 189, 248, 0.3); }
.relative-content { position: relative; z-index: 1; }

.line-height-1 { line-height: 1.2; }
.flex-1-1 { flex: 1 1 auto; }

.back-btn { transition: transform 0.2s; background: rgba(255,255,255,0.6) !important; backdrop-filter: blur(5px); }
.back-btn:hover { transform: translateX(-4px); background: white !important; }

/* Profile Card */
.glass-card {
  background: rgba(255,255,255,0.85) !important; backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.9) !important;
  box-shadow: 0 15px 40px rgba(30,27,75,0.06) !important;
}

/* Cover */
.profile-cover {
  height: 180px; width: 100%; position: relative;
  background: linear-gradient(135deg, #1e1b4b, #4338ca, #38bdf8);
  background-size: 200% 200%; animation: gradientMove 10s ease infinite;
}
.cover-overlay {
  position: absolute; inset: 0;
  background-image: radial-gradient(rgba(255,255,255,0.1) 2px, transparent 2px);
  background-size: 24px 24px; opacity: 0.4; pointer-events: none;
}
@keyframes gradientMove { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }

/* Avatar */
.avatar-wrapper { position: relative; display: inline-block; }
.profile-avatar { border: 6px solid rgba(255,255,255,0.9); box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important; }
.avatar-edit-btn { position: absolute !important; bottom: 5px; right: 5px; background: white !important; z-index: 2; }
.avatar-edit-btn:hover { transform: scale(1.1); }

/* Info Box */
.info-group {
  background: rgba(99,102,241,0.04);
  border: 1px solid rgba(99,102,241,0.1);
  padding: 16px 20px; border-radius: 16px; min-height: 80px;
  transition: all 0.3s;
}
.info-group:hover { background: rgba(99,102,241,0.08); box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
.info-label { font-size: 12.5px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
.info-val { font-size: 16px; font-weight: 700; color: #1e293b; min-height: 24px; }

/* Animations */
.anim-1 { animation: slideUp 0.5s 0.1s ease-out both; }
.anim-2 { animation: slideUp 0.5s 0.2s ease-out both; }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }


.avatar-wrapper {
  position: relative;
  display: inline-block;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0,0,0,0.55);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  opacity: 0;
  transition: all 0.25s ease;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}
</style>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const profile = ref({})
const loading = ref(true)

// จัดการเรื่องอัปโหลดรูป
const fileInput = ref(null)
const selectedFile = ref(null)
const previewAvatarUrl = ref(null)

// สถานะการแก้ไข
const isEditing = ref(false)
const saving = ref(false)
const editForm = ref({
  name_th: '',
  email: '',
  department_id: null,
  org_group_id: null
})

// ตัวเลือกสำหรับ Dropdown
const departments = ref([])
const orgGroups = ref([])

// แจ้งเตือน
const snackbar = ref({ show: false, text: '', color: 'success' })

const showToast = (text, color = 'success') => {
  snackbar.value = { show: true, text, color }
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

const getRoleColor = (role) => {
  const roles = { 'admin': 'purple-darken-2', 'evaluator': 'indigo-darken-2', 'evaluatee': 'cyan-darken-2' }
  return roles[role?.toLowerCase()] || 'blue-grey-darken-1'
}

const getRoleIcon = (role) => {
  const icons = { 'admin': 'mdi-shield-crown', 'evaluator': 'mdi-account-tie', 'evaluatee': 'mdi-account' }
  return icons[role?.toLowerCase()] || 'mdi-account-circle'
}

// คลิกปุ่มกล้องให้ไปกระตุ้น input file ที่ซ่อนอยู่
const triggerFileSelect = () => {
  fileInput.value.click()
}

// เมื่อเลือกไฟล์รูปภาพ
const onFileSelected = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // ตรวจสอบขนาด 2MB
  if (file.size > 2 * 1024 * 1024) {
    showToast('ขนาดรูปภาพต้องไม่เกิน 2MB', 'error')
    return
  }

  selectedFile.value = file
  // สร้าง URL ชั่วคราวเพื่อนำไปแสดงผล Preview ทันที
  previewAvatarUrl.value = URL.createObjectURL(file)
}

// โหลดข้อมูลแผนกและกลุ่มงานจากฐานข้อมูล
const fetchOptions = async (token) => {
  try {
    const { data } = await axios.get('http://localhost:7000/api/profile/options', {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    if (data.success) {
      departments.value = data.departments
      orgGroups.value = data.orgGroups
    }
  } catch (err) {
    console.error('Failed to load options', err)
    showToast('ไม่สามารถดึงข้อมูลแผนกและกลุ่มงานได้', 'error')
  }
}

// ฟังก์ชันเริ่มการแก้ไข
const startEdit = () => {
  editForm.value = {
    name_th: profile.value.name_th,
    email: profile.value.email,
    department_id: profile.value.department_id,
    org_group_id: profile.value.org_group_id
  }
  selectedFile.value = null
  previewAvatarUrl.value = null
  isEditing.value = true
}

// ฟังก์ชันยกเลิก
const cancelEdit = () => {
  isEditing.value = false
  selectedFile.value = null
  previewAvatarUrl.value = null // เคลียร์รูป Preview ทิ้ง กลับไปใช้รูปใน DB
}

// ฟังก์ชันบันทึกการแก้ไข (เปลี่ยนมาใช้ FormData สำหรับส่งไฟล์)
const saveProfile = async () => {
  const token = localStorage.getItem('auth_token')
  if (!editForm.value.name_th || !editForm.value.email) {
    showToast('กรุณากรอกชื่อและอีเมลให้ครบถ้วน', 'error')
    return
  }

  saving.value = true

  // เตรียม FormData เพื่อส่งข้อมูลไปพร้อมกับไฟล์
  const formData = new FormData()
  formData.append('name_th', editForm.value.name_th)
  formData.append('email', editForm.value.email)
  formData.append('department_id', editForm.value.department_id || '')
  formData.append('org_group_id', editForm.value.org_group_id || '')

  if (selectedFile.value) {
    formData.append('avatar', selectedFile.value)
  }

  try {
    const { data } = await axios.put('http://localhost:7000/api/profile/updateprofile', formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data' // สำคัญมาก สำหรับการส่งไฟล์
      }
    })
    
    if (data.success) {
      profile.value = data.data
      authStore.setAuth(token, data.data) // อัปเดตข้อมูลลง Pinia Store และ LocalStorage
      isEditing.value = false
      selectedFile.value = null
      previewAvatarUrl.value = null
      showToast('บันทึกข้อมูลเรียบร้อยแล้ว')
    }
  } catch (err) {
    const errorMsg = err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
    showToast(errorMsg, 'error')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    router.push('/')
    return
  }

  try {
    // ดึงข้อมูลโปรไฟล์
    const { data } = await axios.get('http://localhost:7000/api/profile/getprofile', {
      headers: { Authorization: `Bearer ${token}` }
    })
    profile.value = data.data

    // โหลดตัวเลือกสำหรับ Dropdown จากฐานข้อมูล
    await fetchOptions(token)
    
  } catch (err) {
    if (err.response?.status === 401) {
      localStorage.removeItem('auth_token')
      router.push('/')
    }
  } finally {
    loading.value = false
  }
})
</script>