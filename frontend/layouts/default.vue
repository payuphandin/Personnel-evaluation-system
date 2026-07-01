<script setup>
import { ref, onMounted, computed } from 'vue'
import { useMenu } from '~/composables/useMenu'
import { useAuthStore } from '~/stores/auth'
import axios from 'axios'

const authStore = useAuthStore()

const role = computed(() => authStore.user?.role || 'user')
const userName = computed(() => authStore.user?.name_th || authStore.user?.name || '')
const userAvatar = computed(() => authStore.user?.avatar || '')

const { menu } = useMenu(role)
const drawer = ref(true)
const router = useRouter()
const route = useRoute()

const userInitial = computed(() => (userName.value || 'U')[0].toUpperCase())

onMounted(() => {
  authStore.hydrateFromStorage()
  fetchLatestProfile()
})

const roleLabel = computed(() => ({
  admin: 'ผู้ดูแลระบบ',
  evaluator: 'ผู้ประเมิน',
  evaluatee: 'ผู้รับการประเมิน',
}[role.value] || role.value))

async function fetchLatestProfile() {
  const token = localStorage.getItem('auth_token')
  if (!token) return
  try {
    const { data } = await axios.get('http://localhost:7000/api/profile/getprofile', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (data.success && data.data) {
      authStore.setAuth(token, data.data)
    }
  } catch (err) {
    console.error('Failed to fetch latest profile', err)
  }
}

async function logout() {
  const ok = window.confirm('คุณต้องการออกจากระบบใช่หรือไม่?')
  if (!ok) return
  authStore.logout()
  sessionStorage.clear()
  await router.push('/')
}
</script>

<template>
  <v-app class="main-layout-wrapper">

    <!-- Ambient background -->
    <div class="layout-blobs" aria-hidden="true">
      <div class="l-blob-1"></div>
      <div class="l-blob-2"></div>
      <div class="l-blob-3"></div>
    </div>

    <!-- ===== APP BAR ===== -->
    <v-app-bar class="glass-header" flat height="72">
      <div class="top-gradient-strip"></div>
      <div class="header-inner">

        <!-- Left: toggle + brand -->
        <div class="header-left">
          <v-btn icon="mdi-menu" variant="text" color="indigo-darken-3" rounded="lg"
            class="nav-toggle" @click="drawer = !drawer" />

          <div class="brand-block">
            <v-avatar size="42" class="brand-avatar" color="indigo-darken-4">
              <v-img src="/images/ctcda.png" alt="logo" />
            </v-avatar>
            <div class="brand-text">
              <div class="brand-name">ระบบประเมินบุคลากร</div>
              <div class="brand-sub">VEC Skills System</div>
            </div>
          </div>
        </div>

        <!-- Right: user menu -->
        <div class="header-right">
          
          <v-btn icon variant="text" color="indigo-darken-3" class="notif-btn mr-2" aria-label="Notifications">
            <v-icon size="22">mdi-bell-outline</v-icon>
            <span class="notif-badge"></span>
          </v-btn>

          <div class="header-divider"></div>

          <v-menu min-width="240px" rounded="xl" transition="slide-y-transition" offset-y>
            <template v-slot:activator="{ props }">
              <button v-bind="props" class="user-chip">
                <v-avatar size="34" color="indigo-darken-4" class="user-avatar-img">
                  <v-img v-if="userAvatar" :src="`http://localhost:7000/uploads/avatars/${userAvatar}`" cover />
                  <span v-else class="user-initial">{{ userInitial }}</span>
                </v-avatar>
                <div class="user-info d-none d-md-block">
                  <div class="user-name">{{ userName || 'ผู้ใช้งาน' }}</div>
                  <div class="user-role-label">{{ roleLabel }}</div>
                </div>
                <v-icon size="16" color="indigo-lighten-1" class="d-none d-md-block">mdi-chevron-down</v-icon>
              </button>
            </template>

            <v-card class="user-dropdown mt-2" elevation="0">
              <!-- Dropdown header -->
              <div class="dropdown-header">
                <v-avatar size="44" color="indigo-darken-4">
                  <v-img v-if="userAvatar" :src="`http://localhost:7000/uploads/avatars/${userAvatar}`" cover />
                  <span v-else class="text-white font-weight-bold">{{ userInitial }}</span>
                </v-avatar>
                <div class="ml-3">
                  <div class="font-weight-bold text-indigo-darken-4" style="font-size:14px">{{ userName || 'ผู้ใช้งาน' }}</div>
                  <div class="text-indigo-lighten-1" style="font-size:11px">{{ roleLabel }}</div>
                </div>
              </div>

              <v-divider class="border-opacity-10" />

              <v-list density="compact" bg-color="transparent" class="pa-2">
                <v-list-item prepend-icon="mdi-account-circle-outline" title="ข้อมูลส่วนตัว"
                  to="/my-profile" rounded="lg" class="dropdown-item mb-1" />
                <v-list-item prepend-icon="mdi-shield-key-outline" title="เปลี่ยนรหัสผ่าน"
                  to="/change-password" rounded="lg" class="dropdown-item" />
              </v-list>

              <v-divider class="border-opacity-10" />

              <div class="pa-2">
                <v-btn block variant="tonal" color="error" rounded="lg" size="small"
                  prepend-icon="mdi-logout-variant" class="font-weight-bold" @click="logout">
                  ออกจากระบบ
                </v-btn>
              </div>
            </v-card>
          </v-menu>
        </div>
      </div>
    </v-app-bar>

    <!-- ===== SIDEBAR ===== -->
    <v-navigation-drawer v-model="drawer" width="272" class="glass-sidebar" border="0" elevation="0">

      <!-- Profile card in sidebar -->
      <div class="sidebar-profile">
        <div class="profile-bg-art">
          <div class="art-ring r1"></div>
          <div class="art-ring r2"></div>
          <div class="art-glow"></div>
        </div>
        <div class="avatar-glow-wrap">
          <v-avatar size="68" color="white" class="profile-avatar shadow-glass">
            <v-img v-if="userAvatar" :src="`http://localhost:7000/uploads/avatars/${userAvatar}`" cover />
            <v-icon v-else size="38" color="indigo-darken-4">mdi-shield-account-outline</v-icon>
          </v-avatar>
        </div>
        <div class="profile-info">
          <div class="profile-name">{{ userName || 'ผู้ใช้งาน' }}</div>
          <v-chip size="x-small" color="white" variant="flat" class="profile-role-chip mt-1">
            <v-icon start size="10">mdi-circle</v-icon>
            {{ roleLabel }}
          </v-chip>
        </div>
      </div>

      <!-- Navigation menu -->
      <div class="sidebar-scroll">
        <v-list density="comfortable" nav class="px-3 pt-2">
          <template v-for="(section, i) in menu" :key="i">
            <div class="section-label">{{ section.label }}</div>

            <v-list-item
              v-for="(it, j) in section.items"
              :key="j"
              :to="it.to"
              :prepend-icon="it.icon"
              :title="it.label"
              rounded="xl"
              class="menu-item mb-1"
              active-class="active-menu-item"
            >
              <template v-slot:prepend="{ isActive }">
                <div class="menu-icon-wrap" :class="{ 'menu-icon-active': isActive }">
                  <v-icon :icon="it.icon" size="18" />
                </div>
              </template>
            </v-list-item>

            <div class="section-spacer" v-if="i < menu.length - 1"></div>
          </template>
        </v-list>
      </div>

      <!-- Sidebar footer -->
      <template v-slot:append>
        <div class="sidebar-footer">
          <div class="system-info">
            <v-icon size="13" color="indigo-lighten-2">mdi-information-outline</v-icon>
            <span>VEC Skills v2.0.1</span>
          </div>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- ===== MAIN CONTENT ===== -->
    <v-main class="main-content">
      <v-container fluid class="pa-6 pa-md-8 page-container">
        <slot />
      </v-container>

      <v-footer app color="transparent" class="footer-bar">
        <div class="footer-inner">
          <div class="footer-left">
            <v-icon size="13" color="indigo-lighten-2" class="mr-1">mdi-shield-check-outline</v-icon>
            <span>ระบบปลอดภัย — ข้อมูลถูกเข้ารหัส</span>
          </div>
          <div class="footer-right">
            © 2026 VEC Skills System — Excellence in Evaluation
          </div>
        </div>
      </v-footer>
    </v-main>

  </v-app>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

/* ===== Base ===== */
* { font-family: 'Inter', sans-serif !important; }

.main-layout-wrapper {
  background: linear-gradient(135deg, #f0f4ff 0%, #f8faff 50%, #eef2ff 100%) !important;
}

/* ===== Ambient Blobs ===== */
.layout-blobs {
  position: fixed; inset: 0;
  z-index: 0; overflow: hidden; pointer-events: none;
}
.l-blob-1 {
  position: absolute; top: -8%; right: -4%;
  width: 520px; height: 520px;
  background: radial-gradient(circle, rgba(165,180,252,0.35) 0%, transparent 70%);
  border-radius: 50%; filter: blur(80px);
  animation: blobDrift 20s ease-in-out infinite alternate;
}
.l-blob-2 {
  position: absolute; bottom: -6%; left: -4%;
  width: 420px; height: 420px;
  background: radial-gradient(circle, rgba(125,211,252,0.28) 0%, transparent 70%);
  border-radius: 50%; filter: blur(70px);
  animation: blobDrift 26s ease-in-out infinite alternate-reverse;
}
.l-blob-3 {
  position: absolute; top: 50%; left: 40%;
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(196,181,253,0.2) 0%, transparent 70%);
  border-radius: 50%; filter: blur(60px);
  animation: blobDrift 17s ease-in-out infinite alternate;
}
@keyframes blobDrift {
  0%   { transform: translate(0, 0) scale(1); }
  100% { transform: translate(30px, 40px) scale(1.12); }
}

/* ===== App Bar ===== */
.top-gradient-strip {
  position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, #3f51b5, #00bcd4, #8b5cf6, #3f51b5);
  background-size: 300% auto;
  animation: shimmerGradient 4s linear infinite;
  z-index: 10;
}
@keyframes shimmerGradient {
  to { background-position: 300% center; }
}

.glass-header {
  background: rgba(255, 255, 255, 0.75) !important;
  backdrop-filter: blur(28px) saturate(200%);
  -webkit-backdrop-filter: blur(28px) saturate(200%);
  border-bottom: 1px solid rgba(199, 210, 254, 0.6) !important;
  box-shadow: 0 4px 30px rgba(99,102,241,0.08) !important;
}

.header-inner {
  display: flex; align-items: center;
  width: 100%; padding: 0 16px; gap: 12px;
}

/* Brand */
.header-left { display: flex; align-items: center; gap: 10px; }
.brand-block { display: flex; align-items: center; gap: 10px; }
.brand-avatar {
  border: 2px solid rgba(255,255,255,0.9);
  box-shadow: 0 4px 12px rgba(57,73,171,0.2);
  flex-shrink: 0;
}
.brand-text { line-height: 1.2; }
.brand-name {
  font-size: 15px; font-weight: 900;
  background: linear-gradient(135deg, #1e1b4b 0%, #00838f 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.2px;
}
.brand-sub {
  font-size: 10px; color: #7986cb;
  font-weight: 500; letter-spacing: 0.5px;
  text-transform: uppercase;
}

.nav-toggle { opacity: 0.7; transition: opacity 0.2s; }
.nav-toggle:hover { opacity: 1; }

/* Breadcrumb */
.header-center { flex: 1; justify-content: center; }
.page-breadcrumb {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(99,102,241,0.06);
  border: 1px solid rgba(99,102,241,0.12);
  border-radius: 999px; padding: 4px 14px;
  font-size: 12px; color: #3f51b5; font-weight: 500;
}
.breadcrumb-sep { color: #c5cae9; font-size: 12px; }
.breadcrumb-current { font-weight: 600; color: #283593; }

/* Right controls */
.header-right { display: flex; align-items: center; gap: 6px; margin-left: auto; }
.header-divider {
  width: 1px; height: 28px;
  background: rgba(199,210,254,0.6);
  margin: 0 4px;
}

/* Notification */
.notif-btn { position: relative; }
.notif-badge {
  position: absolute; top: 10px; right: 10px;
  width: 7px; height: 7px; background: #ef4444;
  border-radius: 50%; border: 1.5px solid white;
  animation: notifPulse 2s ease-in-out infinite;
}
@keyframes notifPulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
  50%      { box-shadow: 0 0 0 5px rgba(239,68,68,0); }
}

/* User chip */
.user-chip {
  display: flex; align-items: center; gap: 8px;
  background: rgba(237,242,255,0.8);
  border: 1px solid rgba(199,210,254,0.6);
  border-radius: 999px; padding: 5px 14px 5px 5px;
  cursor: pointer; transition: all 0.25s;
  backdrop-filter: blur(8px);
  outline: none;
}
.user-chip:hover {
  background: rgba(224,231,255,0.9);
  border-color: rgba(99,102,241,0.3);
  box-shadow: 0 4px 12px rgba(99,102,241,0.12);
  transform: translateY(-1px);
}
.user-avatar-img { flex-shrink: 0; }
.user-initial { font-size: 14px; font-weight: 800; color: white; }
.user-info { text-align: left; }
.user-name  { font-size: 13px; font-weight: 700; color: #1a237e; line-height: 1.2; }
.user-role-label { font-size: 10px; color: #7986cb; font-weight: 500; }

/* Dropdown */
.user-dropdown {
  background: rgba(255,255,255,0.9) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(199,210,254,0.5) !important;
  box-shadow: 0 20px 50px rgba(57,73,171,0.15), 0 4px 15px rgba(0,0,0,0.08) !important;
}
.dropdown-header {
  display: flex; align-items: center;
  padding: 16px;
}
.dropdown-item { color: #1a237e !important; font-size: 13px !important; }
.dropdown-item:hover { background: rgba(99,102,241,0.06) !important; }

/* ===== Sidebar ===== */
.glass-sidebar {
  background: rgba(255, 255, 255, 0.5) !important;
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  border-right: 1px solid rgba(199, 210, 254, 0.4) !important;
  box-shadow: 2px 0 20px rgba(99,102,241,0.06) !important;
}

/* Sidebar profile area */
.sidebar-profile {
  position: relative; overflow: hidden;
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #3949ab 100%);
  padding: 32px 20px 28px;
  display: flex; flex-direction: column; align-items: center;
  text-align: center;
}
.art-glow {
  position: absolute; width: 150px; height: 150px;
  background: radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%);
  top: 50%; left: 50%; transform: translate(-50%, -50%);
  filter: blur(20px); animation: pulseGlow 4s infinite alternate;
}
@keyframes pulseGlow {
  from { opacity: 0.6; transform: translate(-50%, -50%) scale(0.9); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
}
.avatar-glow-wrap {
  position: relative; z-index: 2;
  border-radius: 50%;
  padding: 3px;
  background: linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1));
  box-shadow: 0 0 20px rgba(255,255,255,0.15);
}
.profile-bg-art {
  position: absolute; inset: 0; pointer-events: none;
}
.art-ring {
  position: absolute; border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.08);
}
.r1 {
  width: 200px; height: 200px;
  top: -40px; right: -40px;
  animation: artSpin 30s linear infinite;
}
.r2 {
  width: 140px; height: 140px;
  bottom: -30px; left: -30px;
  border-style: dashed;
  animation: artSpin 20s linear infinite reverse;
}
@keyframes artSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.profile-avatar {
  border: 3px solid rgba(255,255,255,0.25) !important;
  box-shadow: 0 12px 30px rgba(0,0,0,0.25) !important;
  animation: profileFloat 6s ease-in-out infinite;
  position: relative; z-index: 1;
}
@keyframes profileFloat {
  0%,100% { transform: translateY(0); }
  50%      { transform: translateY(-5px); }
}
.profile-info { position: relative; z-index: 1; margin-top: 10px; }
.profile-name {
  color: white; font-weight: 700; font-size: 14px;
  text-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
.profile-role-chip {
  font-size: 10px !important; font-weight: 700 !important;
  color: #1a237e !important;
  letter-spacing: 0.3px;
}
.shadow-glass {
  box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
}

/* Sidebar scroll area */
.sidebar-scroll {
  flex: 1; overflow-y: auto;
  padding-bottom: 8px;
}
.sidebar-scroll::-webkit-scrollbar { width: 4px; }
.sidebar-scroll::-webkit-scrollbar-thumb {
  background: rgba(99,102,241,0.15); border-radius: 10px;
}

/* Section labels */
.section-label {
  font-size: 9.5px; font-weight: 800;
  color: #7986cb; letter-spacing: 1.8px;
  text-transform: uppercase;
  padding: 12px 16px 6px;
}
.section-spacer { height: 4px; }

/* Menu items */
.menu-item {
  color: #283593 !important;
  font-weight: 500 !important;
  font-size: 13.5px !important;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
  min-height: 42px !important;
  position: relative;
  overflow: hidden;
}
.menu-item::before {
  content: ''; position: absolute; top: 0; left: 0; bottom: 0; width: 4px;
  background: #3949ab; transform: scaleY(0); transition: transform 0.3s ease;
  transform-origin: left center; border-radius: 4px;
}
.menu-item:hover {
  background: rgba(99,102,241,0.07) !important;
  color: #1a237e !important;
  transform: translateX(3px);
}
.menu-item:hover::before { transform: scaleY(0.7); }
.active-menu-item {
  background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%) !important;
  color: white !important;
  box-shadow: 0 6px 20px rgba(26,35,126,0.25) !important;
}
.active-menu-item::before { transform: scaleY(1); background: #82b1ff; }
.active-menu-item .menu-icon-active { color: white !important; }

/* Custom icon wrapper */
.menu-icon-wrap {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px;
  background: rgba(99,102,241,0.08);
  margin-right: 10px; flex-shrink: 0;
  transition: all 0.25s;
  color: #3949ab;
}
.menu-item:hover .menu-icon-wrap { background: rgba(99,102,241,0.14); }
.active-menu-item .menu-icon-wrap {
  background: rgba(255,255,255,0.18);
  color: white;
}

/* Sidebar footer */
.sidebar-footer {
  padding: 16px 20px 20px;
  border-top: 1px solid rgba(199,210,254,0.3);
}
.system-info {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; color: #9fa8da; font-weight: 500;
  margin-bottom: 2px;
}
.logout-btn {
  font-size: 13px !important;
  letter-spacing: 0.3px;
  box-shadow: 0 4px 12px rgba(239,68,68,0.15) !important;
  transition: all 0.25s !important;
}
.logout-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(239,68,68,0.25) !important;
}

/* ===== Main Content ===== */
.main-content { position: relative; z-index: 1; }
.page-container { max-width: 1600px; margin: 0 auto; }

/* ===== Footer ===== */
.footer-bar {
  background: rgba(255,255,255,0.4) !important;
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(199,210,254,0.3) !important;
  min-height: 44px !important;
}
.footer-inner {
  width: 100%; display: flex;
  align-items: center; justify-content: space-between;
  padding: 0 24px;
  font-size: 11px; color: #9fa8da; font-weight: 500;
}
.footer-left { display: flex; align-items: center; gap: 4px; }
</style>