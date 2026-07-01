<template>
  <div class="password-page">
    
    <!-- Ambient Background -->
    <div class="blob-1"></div>
    <div class="blob-2"></div>

    <v-container class="py-10 relative-content" style="max-width: 650px">
      
      <!-- ===== HEADER ===== -->
      <div class="d-flex align-center mb-8 anim-1">
        <v-btn icon variant="tonal" color="indigo-darken-4" @click="router.back()" class="me-4 shadow-sm back-btn">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <div>
          <h1 class="text-h4 font-weight-black text-indigo-darken-4 line-height-1 mb-1">เปลี่ยนรหัสผ่าน</h1>
          <p class="text-subtitle-2 text-blue-grey-darken-1 mb-0">อัปเดตรหัสผ่านใหม่เพื่อความปลอดภัยของบัญชีคุณ</p>
        </div>
      </div>

      <!-- ===== PASSWORD FORM CARD ===== -->
      <v-card border rounded="xl" class="glass-card overflow-hidden anim-2">
        
        <!-- Header Art -->
        <div class="security-header text-center py-8">
          <div class="security-icon-wrap mx-auto mb-4">
            <v-icon size="40" color="white">mdi-shield-lock-outline</v-icon>
            <div class="shield-pulse"></div>
          </div>
          <h2 class="text-h5 font-weight-black text-white">ตั้งค่ารหัสผ่านใหม่</h2>
          <p class="text-indigo-lighten-4 text-caption mb-0">รหัสผ่านควรมีความยาวอย่างน้อย 6 ตัวอักษร</p>
        </div>

        <div class="pa-6 pa-md-8">
          <v-form @submit.prevent="submitChangePassword" ref="formRef">
            
            <!-- Old Password -->
            <div class="form-group mb-5">
              <label class="field-label"><v-icon size="16" class="me-1 text-blue-grey">mdi-key-outline</v-icon> รหัสผ่านปัจจุบัน</label>
              <v-text-field 
                v-model="form.oldPassword" 
                :type="showOld ? 'text' : 'password'"
                placeholder="กรอกรหัสผ่านปัจจุบันของคุณ"
                variant="outlined" rounded="lg" color="indigo" bg-color="white" density="comfortable"
                :rules="[v => !!v || 'กรุณากรอกรหัสผ่านปัจจุบัน']"
                :append-inner-icon="showOld ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showOld = !showOld"
                class="premium-input mt-1"
              />
            </div>

            <v-divider class="my-6 border-opacity-10" />

            <!-- New Password -->
            <div class="form-group mb-5">
              <label class="field-label"><v-icon size="16" class="me-1 text-indigo">mdi-lock-reset</v-icon> รหัสผ่านใหม่</label>
              <v-text-field 
                v-model="form.newPassword" 
                :type="showNew ? 'text' : 'password'"
                placeholder="ตั้งรหัสผ่านใหม่"
                variant="outlined" rounded="lg" color="indigo" bg-color="white" density="comfortable"
                :rules="[
                  v => !!v || 'กรุณากรอกรหัสผ่านใหม่',
                  v => (v && v.length >= 6) || 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'
                ]"
                :append-inner-icon="showNew ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showNew = !showNew"
                class="premium-input mt-1"
              />
            </div>

            <!-- Confirm New Password -->
            <div class="form-group mb-8">
              <label class="field-label"><v-icon size="16" class="me-1 text-success">mdi-check-decagram-outline</v-icon> ยืนยันรหัสผ่านใหม่</label>
              <v-text-field 
                v-model="form.confirmPassword" 
                :type="showConfirm ? 'text' : 'password'"
                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                variant="outlined" rounded="lg" color="indigo" bg-color="white" density="comfortable"
                :rules="[
                  v => !!v || 'กรุณายืนยันรหัสผ่านใหม่',
                  v => v === form.newPassword || 'รหัสผ่านใหม่ไม่ตรงกัน'
                ]"
                :append-inner-icon="showConfirm ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showConfirm = !showConfirm"
                class="premium-input mt-1"
              />
            </div>

            <!-- Submit Button -->
            <v-btn block color="indigo-darken-4" size="x-large" rounded="xl" type="submit"
              prepend-icon="mdi-shield-check" class="submit-btn font-weight-black" 
              :loading="isSubmitting" height="54">
              ยืนยันการเปลี่ยนรหัสผ่าน
              <span class="btn-shine"></span>
            </v-btn>

          </v-form>
        </div>
      </v-card>
      
      <!-- Snackbar สำหรับแจ้งเตือน -->
      <v-snackbar v-model="snackbar.show" :color="snackbar.color" rounded="pill" elevation="24">
        <div class="d-flex align-center font-weight-bold">
          <v-icon start>{{ snackbar.icon }}</v-icon>
          {{ snackbar.text }}
        </div>
      </v-snackbar>

    </v-container>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
* { font-family: 'Inter', sans-serif !important; }

.password-page { min-height: 100vh; position: relative; overflow: hidden; background: radial-gradient(circle at top right, #f8fafc 0%, #eef2ff 50%, #e0e7ff 100%); }

/* Ambient */
.blob-1, .blob-2 { position: absolute; border-radius: 50%; filter: blur(100px); z-index: 0; opacity: 0.6; pointer-events: none; }
.blob-1 { top: -100px; left: -50px; width: 600px; height: 600px; background: rgba(165, 180, 252, 0.4); }
.blob-2 { bottom: 10%; right: -50px; width: 500px; height: 500px; background: rgba(56, 189, 248, 0.2); }
.relative-content { position: relative; z-index: 1; }

.line-height-1 { line-height: 1.2; }
.back-btn { transition: transform 0.2s; background: rgba(255,255,255,0.6) !important; backdrop-filter: blur(5px); }
.back-btn:hover { transform: translateX(-4px); background: white !important; }

/* Card Style */
.glass-card {
  background: rgba(255,255,255,0.9) !important; backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,1) !important;
  box-shadow: 0 20px 50px rgba(30,27,75,0.08) !important;
}

/* Security Header */
.security-header {
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);
  position: relative; overflow: hidden;
}
.security-header::before {
  content: ''; position: absolute; inset: 0;
  background-image: radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 20px 20px; opacity: 0.3;
}
.security-icon-wrap {
  width: 70px; height: 70px; border-radius: 50%; position: relative;
  background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center; z-index: 1;
}
.shield-pulse {
  position: absolute; inset: -10px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.4); animation: pulse 2s infinite; z-index: -1;
}
@keyframes pulse { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } }

/* Inputs */
.field-label { font-size: 13px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
.premium-input :deep(.v-field) {
  border-radius: 12px !important; box-shadow: 0 2px 6px rgba(0,0,0,0.03) inset !important;
  transition: all 0.2s; border: 1px solid transparent;
}
.premium-input :deep(.v-field--focused) { box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important; border-color: #6366f1; }

/* Button */
.submit-btn { position: relative; overflow: hidden; box-shadow: 0 10px 25px rgba(26,35,126,0.3) !important; transition: all 0.3s !important; }
.submit-btn:hover { transform: translateY(-2px); box-shadow: 0 15px 35px rgba(26,35,126,0.4) !important; }
.btn-shine {
  position: absolute; top: 0; left: -75%; width: 50%; height: 100%;
  background: linear-gradient(120deg, transparent, rgba(255,255,255,0.25), transparent);
  transform: skewX(-20deg); animation: btnShine 4s ease-in-out infinite;
}
@keyframes btnShine { 0% { left: -75%; } 30% { left: 125%; } 100% { left: 125%; } }

/* Animations */
.anim-1 { animation: slideUp 0.5s 0.1s ease-out both; }
.anim-2 { animation: slideUp 0.5s 0.2s ease-out both; }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const formRef = ref(null)

// สถานะการโชว์รหัสผ่าน
const showOld = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)

const isSubmitting = ref(false)

const form = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const snackbar = ref({
  show: false,
  text: '',
  color: '',
  icon: ''
})

const showToast = (text, type = 'success') => {
  snackbar.value = {
    show: true,
    text,
    color: type === 'success' ? 'success' : 'error',
    icon: type === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle'
  }
}

const submitChangePassword = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  isSubmitting.value = true
  const token = localStorage.getItem('auth_token')

  try {
    // ยิง API ไปอัปเดตรหัสผ่าน
    const response = await axios.put('http://localhost:7000/api/profile/changepassword', {
      old_password: form.value.oldPassword,
      new_password: form.value.newPassword
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (response.data.success) {
      showToast('เปลี่ยนรหัสผ่านสำเร็จ! กรุณาเข้าสู่ระบบใหม่', 'success')
      
      // หน่วงเวลาให้ User อ่านข้อความ แล้วเตะไปหน้า Login
      setTimeout(() => {
        localStorage.removeItem('auth_token')
        router.push('/login')
      }, 2000)
    }

  } catch (err) {
    console.error('Change password error', err)
    const errorMsg = err.response?.data?.message || 'เกิดข้อผิดพลาด ไม่สามารถเปลี่ยนรหัสผ่านได้'
    showToast(errorMsg, 'error')
    
    // หาก Token หมดอายุ ให้ดีดออกเลย
    if (err.response?.status === 401) {
      localStorage.removeItem('auth_token')
      router.push('/login')
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>