<template>
  <div class="auth-layout">
    <div class="blob-1"></div>
    <div class="blob-2"></div>

    <v-container class="fill-height d-flex align-center justify-center relative-content">
      <v-card border rounded="xl" class="glass-card overflow-hidden" max-width="1000" width="100%">
        <v-row no-gutters>

          <v-col cols="12" md="6" class="pa-8 pa-md-12 d-flex flex-column justify-center bg-white-opacity">
            <div class="mb-8">
              <h2 class="text-h4 font-weight-bold text-indigo-darken-4 mb-2">เข้าสู่ระบบ</h2>
              <p class="text-grey-darken-1">ยินดีต้อนรับกลับมา! กรุณาระบุข้อมูลบัญชีของคุณ</p>
            </div>

            <form class="flex flex-col gap-2" @submit.prevent="onSubmit">
              <v-text-field v-model="email" label="อีเมล" type="email" variant="outlined" rounded="lg" color="indigo"
                bg-color="white" prepend-inner-icon="mdi-email-outline" :error-messages="emailErr" />

              <v-text-field v-model="password" label="รหัสผ่าน" :type="showPw ? 'text' : 'password'" variant="outlined"
                rounded="lg" color="indigo" bg-color="white" prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPw ? 'mdi-eye-off' : 'mdi-eye'" @click:append-inner="showPw = !showPw"
                :error-messages="passwordErr" />

              <div class="d-flex align-center justify-space-between mt-n2 mb-4">
                <v-checkbox v-model="rememberMe" label="จดจำฉัน" density="comfortable" color="indigo" hide-details />
                <NuxtLink to="/forgot" class="text-indigo-darken-2 text-caption font-weight-bold decoration-none">
                  ลืมรหัสผ่าน?
                </NuxtLink>
              </div>

              <v-expand-transition>
                <v-alert v-if="errorMsg" type="error" density="comfortable" variant="tonal" class="mb-4 rounded-lg">
                  {{ errorMsg }}
                </v-alert>
              </v-expand-transition>

              <v-btn :loading="loading" color="indigo-darken-2" type="submit" block size="x-large" rounded="xl"
                class="font-weight-bold shadow-sm">
                เข้าสู่ระบบ
              </v-btn>
            </form>

            <div class="text-center mt-10">
              <p class="text-body-2 text-grey">
                ยังไม่มีบัญชีสมาชิก? <NuxtLink to="/register" class="text-indigo font-weight-bold decoration-none">
                  สมัครสมาชิก</NuxtLink>
              </p>
            </div>
          </v-col>

          <v-col cols="12" md="6" class="branding-side d-none d-md-flex align-center justify-center">
            
            <div class="mesh-gradient"></div>
            
            <div class="logo-aura"></div>

            <div class="floating-circles">
              <div class="circle c-1"></div>
              <div class="circle c-2"></div>
            </div>
            
            <div class="text-center pa-10 text-white z-10">
              <v-avatar size="155" class="mb-6 shadow-xl logo-box">
                <v-img src="/images/ctcda.png" alt="College Logo" cover class="pa-2" />
              </v-avatar>

              <h1 class="text-h4 font-weight-black mb-2 tracking-tighter">ระบบประเมินบุคลาการ</h1>
              <p class="font-weight-light opacity-80">ประเมินผลประสิทธิภาพการทำงาน</p>

              <div class="mt-8 branding-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
            
            <div class="branding-overlay"></div>
          </v-col>

        </v-row>
      </v-card>
    </v-container>
  </div>
</template>

<style scoped>
/* --- รักษาสไตล์เดิมของคุณไว้ --- */
.auth-layout {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  position: relative;
  overflow: hidden;
}

.branding-side {
  background: #1a237e;
  position: relative;
  overflow: hidden;
}

/* --- พื้นหลังขยับชัดๆ (Animated Mesh) --- */
.mesh-gradient {
  position: absolute;
  width: 200%; /* ใหญ่กว่าจอเพื่อให้วิ่งได้ไกล */
  height: 200%;
  background: 
    radial-gradient(circle at 20% 30%, #3949ab 0%, transparent 40%),
    radial-gradient(circle at 80% 70%, #283593 0%, transparent 40%),
    radial-gradient(circle at 50% 50%, #3f51b5 0%, transparent 50%),
    radial-gradient(circle at 10% 80%, #00bcd4 0%, transparent 30%);
  filter: blur(60px);
  animation: meshMove 15s ease infinite alternate;
}

@keyframes meshMove {
  0% { transform: translate(-25%, -25%) rotate(0deg); }
  100% { transform: translate(0%, 0%) rotate(10deg); }
}

/* --- รัศมีรอบโลโก้ (ขยับ) --- */
.logo-aura {
  position: absolute;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
  border-radius: 50%;
  z-index: 1;
  animation: auraPulse 4s ease-in-out infinite;
}

@keyframes auraPulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.4); opacity: 0.8; }
}

/* --- วงกลมลอย (ใหญ่และชัด) --- */
.circle {
  position: absolute;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  filter: blur(2px);
  animation: floatLarge 20s infinite linear;
}

.c-1 { width: 350px; height: 350px; top: -10%; right: -10%; }
.c-2 { width: 250px; height: 250px; bottom: -5%; left: -5%; animation-duration: 25s; animation-direction: reverse; }

@keyframes floatLarge {
  0% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(50px, 80px) rotate(180deg); }
  100% { transform: translate(0, 0) rotate(360deg); }
}

.z-10 { position: relative; z-index: 10; }

/* --- รักษาสไตล์จุดและการแสดงผลอื่นๆ --- */
.branding-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 30px 30px;
  opacity: 0.3;
  pointer-events: none;
}

.logo-box { 
  background: white;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3) !important; 
  border: 4px solid rgba(255, 255, 255, 0.2);
}

.branding-dots span {
  display: inline-block; width: 8px; height: 8px; background: white;
  margin: 0 4px; border-radius: 50%; opacity: 0.5;
  animation: dotPulse 2s infinite;
}

@keyframes dotPulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.3); }
}

/* อื่นๆ คงเดิม */
.blob-1, .blob-2 { position: absolute; border-radius: 50%; filter: blur(80px); z-index: 0; }
.blob-1 { top: -100px; right: -50px; width: 600px; height: 600px; background: rgba(63, 81, 181, 0.1); }
.blob-2 { bottom: -50px; left: -50px; width: 500px; height: 500px; background: rgba(0, 188, 212, 0.1); }
.glass-card {
  background: rgba(255, 255, 255, 0.4) !important;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.6) !important;
  animation: fadeInUp 0.8s ease-out;
}
.bg-white-opacity { background: rgba(255, 255, 255, 0.7); }
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

<script setup>
// Logic เดิมของคุณ
definePageMeta({ layout: 'auth-login', ssr: false })
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'

const { $api } = useNuxtApp()
const router = useRouter()
const auth = useAuthStore()

const errorMsg = ref('')
const showPw = ref(false)
const rememberMe = ref(false)
const loading = ref(false)

const schema = yup.object({
  email: yup.string().email('รูปแบบอีเมลไม่ถูกต้อง').required('กรุณากรอกอีเมล'),
  password: yup.string().min(6, 'รหัสผ่านอย่างน้อย 6 ตัว').required('กรุณากรอกรหัสผ่าน')
})

const { handleSubmit } = useForm({ validationSchema: schema })
const { value: email, errorMessage: emailErr } = useField('email')
const { value: password, errorMessage: passwordErr } = useField('password')

const onSubmit = handleSubmit(async (values) => {
  errorMsg.value = ''
  loading.value = true
  try {
    const { data } = await $api.post('/api/auth/login', { ...values, remember: rememberMe.value })
    if (data?.accessToken) {
      auth.setAuth(data.accessToken, data.user)
      const role = data.user?.role
      if (role === 'admin') await router.push('/overview')
      else if (role === 'evaluator') await router.push('/evaluator-evaluation')
      else if (role === 'evaluatee') await router.push('/evaluatee-upload')
      else await router.push('/')
    }
  } catch (e) {
    errorMsg.value = e.response?.data?.message || e.message || 'Login error'
  } finally {
    loading.value = false
  }
})
</script>