<template>
  <div class="auth-layout" @pointermove="handlePointerMove" @pointerleave="handlePointerLeave">
    <div class="scene-grid"></div>
    <div class="scene-sweep"></div>
    <div class="aurora aurora-1"></div>
    <div class="aurora aurora-2"></div>
    <div class="aurora aurora-3"></div>

    <div class="floating-marks" aria-hidden="true">
      <span class="mark mark-1"></span>
      <span class="mark mark-2"></span>
      <span class="mark mark-3"></span>
      <span class="mark mark-4"></span>
    </div>

    <v-container class="fill-height d-flex align-center justify-center relative-content">
      <v-card
        border
        rounded="xl"
        class="glass-card overflow-hidden"
        max-width="1180"
        width="100%"
        :style="cardStyle"
      >
        <div class="card-spotlight"></div>

        <v-row no-gutters class="auth-card-row">
          <v-col cols="12" md="5" class="branding-side d-none d-md-flex align-center justify-center">
            <div class="mesh-gradient"></div>
            <div class="holo-grid"></div>
            <div class="scan-lines"></div>
            <canvas ref="particleCanvas" class="particle-canvas"></canvas>

            <div class="ring ring-1"></div>
            <div class="ring ring-2"></div>
            <div class="ring ring-3"></div>
            <div class="logo-aura"></div>

            <div class="data-stream stream-1">
              <span></span><span></span><span></span>
            </div>
            <div class="data-stream stream-2">
              <span></span><span></span><span></span>
            </div>

            <div class="branding-content">
              <div class="logo-wrapper">
                <v-avatar size="120" class="logo-box mb-4">
                  <v-img src="/images/ctcda.png" alt="College Logo" cover class="pa-2" />
                </v-avatar>
                <div class="logo-ring-outer"></div>
                <div class="logo-ring-inner"></div>
              </div>

              <h1 class="brand-title mb-2 text-uppercase">ระบบประเมินผล</h1>
              <p class="brand-subtitle mb-0">เริ่มต้นใช้งานระบบประเมินผลบุคลากร</p>

              <div class="stat-chips">
                <div class="chip chip-1">
                  <v-icon size="14" class="mr-1">mdi-shield-check</v-icon>
                  ปลอดภัย
                </div>
                <div class="chip chip-2">
                  <v-icon size="14" class="mr-1">mdi-lightning-bolt</v-icon>
                  รวดเร็ว
                </div>
                <div class="chip chip-3">
                  <v-icon size="14" class="mr-1">mdi-hand-wave</v-icon>
                  ง่ายดาย
                </div>
              </div>

              <!-- ===== Signal Wave Panel (เอกลักษณ์หน้า Register) ===== -->
              <div class="signal-panel">
                <div class="signal-border"></div>
                <div class="signal-scan-line"></div>

                <div class="wave-container">
                  <div class="wave-line wave-1"></div>
                  <div class="wave-line wave-2"></div>
                  <div class="wave-line wave-3"></div>
                  <div class="wave-center-dot"></div>
                </div>

                <div class="signal-status-bar">
                  <span class="signal-dot"></span>
                  <span class="signal-label">กำลังเตรียมระบบให้คุณ</span>
                </div>

                <div class="signal-corner corner-tl"></div>
                <div class="signal-corner corner-tr"></div>
                <div class="signal-corner corner-bl"></div>
                <div class="signal-corner corner-br"></div>
              </div>
              <!-- ===== /Signal Wave Panel ===== -->

              <div class="mt-6 step-indicators">
                <div class="step-item step-active">
                  <div class="step-dot"><v-icon size="14">mdi-account-plus</v-icon></div>
                  <span>ลงทะเบียน</span>
                </div>
                <div class="step-connector"></div>
                <div class="step-item">
                  <div class="step-dot"><v-icon size="14">mdi-login-variant</v-icon></div>
                  <span>เข้าสู่ระบบ</span>
                </div>
                <div class="step-connector"></div>
                <div class="step-item">
                  <div class="step-dot"><v-icon size="14">mdi-rocket-launch</v-icon></div>
                  <span>เริ่มใช้งาน</span>
                </div>
              </div>

              <div class="status-row">
                <div class="status-item">
                  <v-icon size="15">mdi-account-edit-outline</v-icon>
                  <span>ข้อมูลส่วนตัว</span>
                </div>
                <div class="status-item">
                  <v-icon size="15">mdi-domain</v-icon>
                  <span>แผนก/ฝ่าย</span>
                </div>
                <div class="status-item">
                  <v-icon size="15">mdi-rocket-launch-outline</v-icon>
                  <span>เริ่มใช้งาน</span>
                </div>
              </div>
            </div>

            <div class="branding-overlay"></div>
          </v-col>

          <v-col cols="12" md="7" class="form-side register-form pa-7 pa-sm-9 pa-md-10 d-flex flex-column justify-center">
            
            <div class="mobile-brand-strip mb-7 d-md-none">
              <v-avatar size="48" class="mobile-logo">
                <v-img src="/images/ctcda.png" alt="College Logo" cover />
              </v-avatar>
              <div>
                <p class="mobile-kicker mb-0">สร้างบัญชีใหม่</p>
                <p class="mobile-copy mb-0">เข้าร่วมระบบประเมินผลของเรา</p>
              </div>
            </div>

            <div class="mb-6 form-header">
              <div class="brand-badge mb-3">
                <span class="badge-dot"></span>
                <span class="badge-text">ลงทะเบียน</span>
              </div>
              <h2 class="login-title mb-2">สร้างบัญชีใหม่</h2>
              <p class="login-copy mb-0">กรุณากรอกข้อมูลด้านล่างให้ครบถ้วนเพื่อลงทะเบียน</p>
            </div>

            <form @submit.prevent="onSubmit" class="d-flex flex-column ga-2 form-fields">
              <div class="field-wrap field-1">
                <v-text-field
                  v-model="name_th"
                  label="ชื่อ-นามสกุล"
                  variant="outlined"
                  rounded="lg"
                  color="indigo"
                  bg-color="white"
                  prepend-inner-icon="mdi-account-outline"
                  class="premium-field"
                  hide-details="auto"
                  :error-messages="nameErr"
                />
              </div>

              <div class="field-wrap field-2">
                <v-text-field
                  v-model="email"
                  label="อีเมล"
                  type="email"
                  variant="outlined"
                  rounded="lg"
                  color="indigo"
                  bg-color="white"
                  prepend-inner-icon="mdi-email-outline"
                  class="premium-field"
                  hide-details="auto"
                  :error-messages="emailErr"
                />
              </div>

              <v-row no-gutters class="ga-3 field-wrap field-3">
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="department_id"
                    :items="departments"
                    item-title="department_name"
                    item-value="id"
                    label="แผนกวิชา"
                    variant="outlined"
                    rounded="lg"
                    color="indigo"
                    bg-color="white"
                    prepend-inner-icon="mdi-domain"
                    class="premium-field"
                    hide-details="auto"
                    :error-messages="deptErr"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="position"
                    label="ตำแหน่งการทำงาน"
                    variant="outlined"
                    rounded="lg"
                    color="indigo"
                    bg-color="white"
                    prepend-inner-icon="mdi-briefcase-outline"
                    class="premium-field"
                    hide-details="auto"
                    :error-messages="positionErr"
                  />
                </v-col>
              </v-row>

              <v-row no-gutters class="ga-3 field-wrap field-4">
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="password"
                    label="รหัสผ่าน"
                    :type="showPw ? 'text' : 'password'"
                    variant="outlined"
                    rounded="lg"
                    color="indigo"
                    bg-color="white"
                    prepend-inner-icon="mdi-lock-outline"
                    :append-inner-icon="showPw ? 'mdi-eye-off' : 'mdi-eye'"
                    class="premium-field"
                    hide-details="auto"
                    :error-messages="passwordErr"
                    @click:append-inner="showPw = !showPw"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="confirmPassword"
                    label="ยืนยันรหัสผ่าน"
                    :type="showPw ? 'text' : 'password'"
                    variant="outlined"
                    rounded="lg"
                    color="indigo"
                    bg-color="white"
                    prepend-inner-icon="mdi-lock-check-outline"
                    :append-inner-icon="showPw ? 'mdi-eye-off' : 'mdi-eye'"
                    class="premium-field"
                    hide-details="auto"
                    :error-messages="confirmPasswordErr"
                    @click:append-inner="showPw = !showPw"
                  />
                </v-col>
              </v-row>

              <v-expand-transition>
                <div class="field-wrap field-5" v-if="password">
                  <div class="strength-panel pa-3 mb-2 rounded-lg">
                    <div class="d-flex align-center justify-space-between mb-2">
                      <span class="strength-label">ความปลอดภัยรหัสผ่าน</span>
                      <span class="strength-text" :class="`strength-${pwStrength}`">
                        {{ ['', 'เสี่ยง (อ่อนเกินไป)', 'ปานกลาง (พอใช้ได้)', 'ปลอดภัย (แข็งแกร่ง)'][pwStrength] }}
                      </span>
                    </div>
                    <div class="strength-bars">
                      <div class="s-bar" :class="{ active: pwStrength >= 1, weak: pwStrength === 1 }"></div>
                      <div class="s-bar" :class="{ active: pwStrength >= 2, medium: pwStrength === 2 }"></div>
                      <div class="s-bar" :class="{ active: pwStrength >= 3, strong: pwStrength >= 3 }"></div>
                    </div>
                  </div>
                </div>
              </v-expand-transition>

              <v-expand-transition>
                <v-alert v-if="errorMsg" type="error" density="comfortable" variant="tonal" class="mb-4 rounded-lg alert-shake">
                  {{ errorMsg }}
                </v-alert>
              </v-expand-transition>

              <div class="field-wrap field-6 mt-2">
                <v-btn
                  :loading="loading"
                  type="submit"
                  block
                  size="x-large"
                  rounded="xl"
                  class="font-weight-bold submit-btn"
                >
                  <span class="btn-glow"></span>
                  <v-icon start size="22">mdi-account-plus</v-icon>
                  <span class="btn-text">สร้างบัญชีผู้ใช้</span>
                  <span class="btn-shine"></span>
                </v-btn>
              </div>
            </form>

            <div class="text-center mt-8 field-wrap field-7">
              <div class="divider-line">
                <span>หรือ</span>
              </div>
              <p class="register-copy mt-4 mb-0">
                มีบัญชีผู้ใช้งานอยู่แล้ว?
                <NuxtLink to="/" class="register-link">
                  เข้าสู่ระบบ
                </NuxtLink>
              </p>
            </div>
          </v-col>
        </v-row>
      </v-card>
    </v-container>

    <v-dialog v-model="showSuccessModal" max-width="440" persistent>
      <v-card class="success-glass-card text-center pa-8" rounded="xl">
        <div class="success-animation mb-6">
          <div class="success-circle">
            <v-icon color="white" size="48">mdi-check-all</v-icon>
          </div>
        </div>
        <h3 class="success-title mb-2">ลงทะเบียนสำเร็จ!</h3>
        <p class="success-subtitle mb-8">ระบบได้สร้างบัญชีของคุณเรียบร้อยแล้ว<br>ยินดีต้อนรับเข้าสู่ระบบประเมินผล</p>
        <v-btn color="indigo-darken-2" size="x-large" rounded="xl" block class="font-weight-bold submit-btn" @click="goToLogin">
          <span class="btn-text">ดำเนินการเข้าสู่ระบบ</span>
          <v-icon end>mdi-arrow-right</v-icon>
        </v-btn>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Noto+Sans+Thai:wght@300;400;500;600;700;800;900&display=swap');

* {
  font-family: 'Inter', 'Noto Sans Thai', sans-serif;
}

/* =========================================
   Base Layout & Background
   ========================================= */
.auth-layout {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #eef3ff 0%, #fbfdff 38%, #eff6ff 68%, #f8f5ff 100%);
  position: relative;
  overflow: hidden;
  padding: 28px 16px;
  isolation: isolate;
}

.scene-grid, .scene-sweep, .aurora, .floating-marks, .mark {
  position: absolute; pointer-events: none;
}
.scene-grid {
  inset: 0; z-index: 0;
  background-image: linear-gradient(rgba(67, 56, 202, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(30, 58, 138, 0.06) 1px, transparent 1px);
  background-size: 58px 58px;
  mask-image: radial-gradient(circle at center, black 0%, transparent 74%);
}
.scene-sweep {
  inset: -30%; z-index: 0;
  background: linear-gradient(115deg, transparent 20%, rgba(255, 255, 255, 0.72) 42%, transparent 58%),
              linear-gradient(65deg, transparent 40%, rgba(59, 130, 246, 0.12) 50%, transparent 62%);
  transform: translateX(-32%) rotate(2deg);
  animation: sweepMove 12s ease-in-out infinite;
}
.aurora { opacity: 0.72; filter: blur(58px); mix-blend-mode: multiply; z-index: 0; }
.aurora-1 {
  inset: -22% 52% 48% -14%;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.35), rgba(96, 165, 250, 0.18));
  border-radius: 38% 62% 52% 48%; animation: auroraFlow 20s ease-in-out infinite alternate;
}
.aurora-2 {
  inset: 58% -16% -24% 42%;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.25), rgba(125, 211, 252, 0.12));
  border-radius: 58% 42% 45% 55%; animation: auroraFlow 22s ease-in-out infinite alternate-reverse;
}
.aurora-3 {
  inset: 18% 14% 18% 58%;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.18), rgba(56, 189, 248, 0.16));
  border-radius: 42% 58% 60% 40%; animation: auroraPulse 16s ease-in-out infinite;
}
.floating-marks { inset: 0; z-index: 1; }
.mark {
  width: 90px; height: 2px; background: linear-gradient(90deg, transparent, rgba(67, 56, 202, 0.26), transparent);
  transform: rotate(-28deg); animation: markFloat 9s ease-in-out infinite;
}
.mark-1 { top: 18%; left: 9%; animation-delay: 0s; }
.mark-2 { top: 72%; left: 18%; width: 130px; animation-delay: 1.3s; }
.mark-3 { top: 24%; right: 12%; width: 120px; animation-delay: 2.1s; }
.mark-4 { right: 21%; bottom: 16%; width: 74px; animation-delay: 3s; }

.relative-content { position: relative; z-index: 2; }

/* =========================================
   Glass Card & 3D Effect
   ========================================= */
.glass-card {
  --tilt-x: 0deg; --tilt-y: 0deg; --spot-x: 50%; --spot-y: 50%;
  background: rgba(255, 255, 255, 0.58) !important;
  backdrop-filter: blur(26px); -webkit-backdrop-filter: blur(26px);
  border: 1px solid rgba(255, 255, 255, 0.78) !important;
  box-shadow: 0 30px 80px rgba(31, 41, 55, 0.16), 0 16px 35px rgba(67, 56, 202, 0.09), 0 0 0 1px rgba(255, 255, 255, 0.58) inset !important;
  transform: perspective(1300px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y));
  transform-style: preserve-3d; transition: transform 0.18s ease, box-shadow 0.25s ease;
  animation: cardEntrance 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.glass-card::before {
  content: ''; position: absolute; inset: -1px; border-radius: inherit; z-index: -1; pointer-events: none;
  background: linear-gradient(130deg, rgba(79, 70, 229, 0.42), rgba(255, 255, 255, 0), rgba(59, 130, 246, 0.34), rgba(125, 211, 252, 0.18), rgba(255, 255, 255, 0));
  background-size: 320% 320%; animation: borderShimmer 7s ease infinite;
}
.card-spotlight {
  position: absolute; inset: 0; pointer-events: none; z-index: 2; opacity: 0.8;
  background: radial-gradient(circle at var(--spot-x) var(--spot-y), rgba(255, 255, 255, 0.45), transparent 36%);
}
.auth-card-row { position: relative; z-index: 3; }

/* =========================================
   Form Side (Right Side)
   ========================================= */
.form-side {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.72));
  min-height: 660px; position: relative;
}
.form-side.register-form::after {
  content: ''; position: absolute; inset: 18px 0 18px auto; width: 4px;
  border-radius: 999px; background: linear-gradient(180deg, #4f46e5, #3b82f6, #60a5fa); opacity: 0.75;
}

.mobile-brand-strip {
  display: none; align-items: center; gap: 14px; padding: 12px;
  border: 1px solid rgba(79, 70, 229, 0.13); border-radius: 20px;
  background: rgba(255, 255, 255, 0.72); box-shadow: 0 16px 34px rgba(67, 56, 202, 0.09);
}
.mobile-logo { background: #fff; box-shadow: 0 8px 24px rgba(31, 41, 55, 0.12); }
.mobile-kicker { color: #312e81; font-weight: 800; font-size: 14px; }
.mobile-copy { color: #64748b; font-size: 12px; }

.brand-badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.09), rgba(59, 130, 246, 0.08));
  border: 1px solid rgba(79, 70, 229, 0.18); border-radius: 999px;
  padding: 6px 13px; font-size: 12px; color: #3730a3; font-weight: 800;
  box-shadow: 0 10px 28px rgba(67, 56, 202, 0.08);
}
.badge-dot {
  width: 8px; height: 8px; background: #3b82f6; border-radius: 50%;
  animation: badgePulse 2s ease-in-out infinite;
}
.login-title {
  color: #1e1b4b; font-size: clamp(26px, 3vw, 36px); line-height: 1.1; font-weight: 900;
}
.login-copy { color: #64748b; line-height: 1.6; max-width: 390px; font-size: 14px; }

/* Stagger Animations (From Right) */
.form-header { animation: slideInRight 0.7s 0.16s ease-out both; }
.field-wrap { animation: slideInRight ease-out both; }
.field-1 { animation-duration: 0.58s; animation-delay: 0.28s; }
.field-2 { animation-duration: 0.58s; animation-delay: 0.36s; }
.field-3 { animation-duration: 0.58s; animation-delay: 0.46s; }
.field-4 { animation-duration: 0.58s; animation-delay: 0.56s; }
.field-5 { animation-duration: 0.58s; animation-delay: 0.66s; }
.field-6 { animation-duration: 0.58s; animation-delay: 0.76s; }
.field-7 { animation-duration: 0.58s; animation-delay: 0.86s; }

.premium-field :deep(.v-field) {
  border-radius: 18px; background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.premium-field :deep(.v-field:hover) { transform: translateY(-1px); box-shadow: 0 16px 34px rgba(67, 56, 202, 0.11); }
.premium-field :deep(.v-field--focused) {
  background: #fff; box-shadow: 0 18px 38px rgba(67, 56, 202, 0.14), 0 0 0 4px rgba(99, 102, 241, 0.08);
}
.premium-field :deep(.v-field__prepend-inner) { color: #4f46e5; }

/* Premium Password Strength */
.strength-panel {
  background: rgba(255, 255, 255, 0.6); border: 1px solid rgba(79, 70, 229, 0.1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}
.strength-label { font-size: 12px; font-weight: 600; color: #475569; }
.strength-text { font-size: 12px; font-weight: 800; transition: color 0.3s; }
.strength-1 { color: #f43f5e; }
.strength-2 { color: #f59e0b; }
.strength-3 { color: #10b981; }

.strength-bars { display: flex; gap: 6px; width: 100%; }
.s-bar {
  height: 6px; flex: 1; border-radius: 99px; background: rgba(226, 232, 240, 0.8);
  transition: background 0.4s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.s-bar.active.weak { background: #f43f5e; box-shadow: 0 2px 8px rgba(244, 63, 94, 0.3); transform: scaleY(1.2); }
.s-bar.active.medium { background: #f59e0b; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3); transform: scaleY(1.2); }
.s-bar.active.strong { background: #10b981; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3); transform: scaleY(1.2); }

.submit-btn {
  position: relative; overflow: hidden; min-height: 56px; color: white !important;
  background: linear-gradient(135deg, #312e81 0%, #4f46e5 48%, #2563eb 100%) !important;
  transition: transform 0.22s ease, box-shadow 0.22s ease, filter 0.22s ease !important;
  box-shadow: 0 16px 34px rgba(49, 46, 129, 0.34), 0 0 0 1px rgba(255, 255, 255, 0.18) inset !important;
}
.submit-btn:hover {
  transform: translateY(-3px) !important; filter: saturate(1.08);
  box-shadow: 0 24px 44px rgba(49, 46, 129, 0.42), 0 0 0 1px rgba(255, 255, 255, 0.2) inset !important;
}
.submit-btn:active { transform: translateY(0) scale(0.99) !important; }
.btn-glow {
  position: absolute; inset: 1px; border-radius: inherit; pointer-events: none;
  background: radial-gradient(circle at 20% 0%, rgba(255, 255, 255, 0.34), transparent 32%);
}
.btn-text { position: relative; z-index: 1; }
.btn-shine {
  position: absolute; top: 0; left: -75%; width: 46%; height: 100%;
  background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.32), transparent);
  transform: skewX(-20deg); animation: btnShine 3.9s ease-in-out infinite;
}

.divider-line { position: relative; text-align: center; color: #94a3b8; font-size: 12px; font-weight: 700; }
.divider-line::before, .divider-line::after {
  content: ''; position: absolute; top: 50%; width: 40%; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(79, 70, 229, 0.18));
}
.divider-line::before { left: 0; }
.divider-line::after { right: 0; transform: rotate(180deg); }
.divider-line span { background: rgba(255, 255, 255, 0.82); padding: 0 12px; position: relative; }

.register-copy { color: #64748b; font-size: 14px; }
.register-link {
  color: #3730a3; text-decoration: none; font-weight: 800; position: relative;
  white-space: nowrap; transition: color 0.2s ease;
}
.register-link::after {
  content: ''; position: absolute; left: 0; right: 100%; bottom: -2px; height: 2px;
  border-radius: 99px; background: linear-gradient(90deg, #4f46e5, #3b82f6); transition: right 0.25s ease;
}
.register-link:hover { color: #1d4ed8; }
.register-link:hover::after { right: 0; }

.alert-shake { animation: shake 0.4s ease; }

/* =========================================
   Branding Side (Left Side)
   ========================================= */
.branding-side {
  background: linear-gradient(145deg, #111827 0%, #1e1b4b 42%, #1e40af 100%);
  position: relative; overflow: hidden; min-height: 660px;
}
.mesh-gradient {
  position: absolute; width: 170%; height: 170%; filter: blur(44px);
  background: radial-gradient(circle at 18% 30%, rgba(79, 70, 229, 0.78) 0%, transparent 34%),
              radial-gradient(circle at 82% 68%, rgba(37, 99, 235, 0.62) 0%, transparent 34%),
              radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.35) 0%, transparent 42%);
  animation: meshMove 18s ease infinite alternate;
}
.holo-grid {
  position: absolute; inset: 0; opacity: 0.55; z-index: 1; transform-origin: bottom center;
  background-image: linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
  background-size: 34px 34px; transform: perspective(500px) rotateX(58deg) translateY(38%);
}
.scan-lines {
  position: absolute; inset: 0; opacity: 0.45; mix-blend-mode: soft-light; pointer-events: none; z-index: 2;
  background: repeating-linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0, rgba(255, 255, 255, 0.04) 1px, transparent 1px, transparent 8px);
}
.particle-canvas { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 3; pointer-events: none; }

.ring { position: absolute; border-radius: 50%; border: 1px solid rgba(255, 255, 255, 0.1); z-index: 4; }
.ring-1 { width: 480px; height: 480px; top: 46%; left: 50%; transform: translate(-50%, -50%); animation: ringRotate 28s linear infinite; }
.ring-2 { width: 334px; height: 334px; top: 46%; left: 50%; transform: translate(-50%, -50%); border-style: dashed; border-color: rgba(255, 255, 255, 0.09); animation: ringRotate 19s linear infinite reverse; }
.ring-3 { width: 210px; height: 210px; top: 46%; left: 50%; transform: translate(-50%, -50%); border-color: rgba(250, 204, 21, 0.16); animation: ringRotate 13s linear infinite; }

.logo-aura {
  position: absolute; top: calc(50% - 100px); left: 50%; width: 300px; height: 300px; z-index: 4;
  transform: translate(-50%, -50%); border-radius: 48%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.22) 0%, rgba(59, 130, 246, 0.12) 38%, transparent 72%);
  animation: auraPulse 4.6s ease-in-out infinite;
}

/* Data Streams */
.data-stream {
  position: absolute;
  display: grid;
  gap: 10px;
  z-index: 5;
  opacity: 0.62;
}

.data-stream span {
  display: block;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.74), transparent);
  animation: streamPulse 2.8s ease-in-out infinite;
}

.data-stream span:nth-child(2) { animation-delay: 0.35s; }
.data-stream span:nth-child(3) { animation-delay: 0.7s; }

.stream-1 {
  width: 100px;
  top: 14%;
  right: 8%;
  transform: rotate(-22deg);
}

.stream-2 {
  width: 120px;
  bottom: 16%;
  left: 6%;
  transform: rotate(20deg);
}

.branding-content {
  position: relative; z-index: 10; display: flex; width: min(420px, 88%);
  align-items: center; flex-direction: column; text-align: center; color: white; padding: 34px 20px;
}
.logo-wrapper { position: relative; display: inline-block; }
.logo-ring-outer, .logo-ring-inner { position: absolute; border-radius: 50%; border: 2px solid rgba(255, 255, 255, 0.16); top: 50%; left: 50%; }
.logo-ring-outer { width: 160px; height: 160px; transform: translate(-50%, -50%); animation: ringRotate 10s linear infinite; }
.logo-ring-inner { width: 140px; height: 140px; border-style: dashed; border-color: rgba(255, 255, 255, 0.14); transform: translate(-50%, -50%); animation: ringRotate 7s linear infinite reverse; }
.logo-box {
  background: white; position: relative; z-index: 1;
  box-shadow: 0 22px 54px rgba(0, 0, 0, 0.36), 0 0 0 3px rgba(255, 255, 255, 0.16), 0 0 48px rgba(59, 130, 246, 0.24) !important;
  animation: logoFloat 6s ease-in-out infinite;
}

.brand-title {
  font-size: 32px; line-height: 1.25; font-weight: 900; letter-spacing: 2px;
  text-shadow: 0 2px 22px rgba(0, 0, 0, 0.3); animation: textGlow 3s ease-in-out infinite alternate;
}
.brand-subtitle { font-size: 15px; color: rgba(255, 255, 255, 0.78); animation: fadeInUp 0.8s 0.5s ease-out both; }

/* Stat Chips */
.stat-chips {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 20px;
}

.chip {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: white;
  font-size: 12px;
  font-weight: 800;
  padding: 6px 12px;
  border-radius: 999px;
  transition: transform 0.24s ease, background 0.24s ease, box-shadow 0.24s ease;
  cursor: default;
}

.chip:hover {
  background: rgba(255, 255, 255, 0.22);
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
}

.chip-1 { animation: chipEntrance 0.6s 0.8s ease-out both; }
.chip-2 { animation: chipEntrance 0.6s 0.95s ease-out both; }
.chip-3 { animation: chipEntrance 0.6s 1.1s ease-out both; }

/* =========================================
   SIGNAL WAVE PANEL
   (เอกลักษณ์หน้า Register — ต่างจาก Hex ของ Login)
   ========================================= */

.signal-panel {
  position: relative;
  width: min(340px, 100%);
  margin-top: 24px;
  padding: 24px 20px 18px;
  border-radius: 20px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.04));
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow:
    0 20px 44px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset,
    0 0 50px rgba(56, 189, 248, 0.06) inset;
  backdrop-filter: blur(18px);
  overflow: hidden;
  animation: signalEntrance 0.8s 1.2s ease-out both;
}

/* Animated conic border */
.signal-border {
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background:
    conic-gradient(
      from var(--border-angle, 0deg),
      transparent 0%,
      rgba(56, 189, 248, 0.55) 12%,
      transparent 22%,
      transparent 48%,
      rgba(168, 85, 247, 0.45) 58%,
      transparent 68%
    );
  z-index: 0;
  animation: borderRotate 7s linear infinite;
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask-composite: xor;
  padding: 1.5px;
}

/* Scan line */
.signal-scan-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.7), rgba(168, 85, 247, 0.8), rgba(56, 189, 248, 0.7), transparent);
  box-shadow: 0 0 18px rgba(56, 189, 248, 0.35), 0 0 50px rgba(168, 85, 247, 0.15);
  z-index: 5;
  animation: scanDown 4s ease-in-out infinite;
  opacity: 0.85;
}

/* Wave animation container */
.wave-container {
  position: relative;
  height: 80px;
  margin: 0 auto 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wave-line {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 2px solid transparent;
  border-radius: 50%;
  left: 50%;
  top: 50%;
}

.wave-line.wave-1 {
  width: 100px;
  height: 100px;
  border-color: rgba(56, 189, 248, 0.3);
  transform: translate(-50%, -50%);
  animation: wavePulse 3s ease-out infinite;
}

.wave-line.wave-2 {
  width: 100px;
  height: 100px;
  border-color: rgba(129, 140, 248, 0.25);
  transform: translate(-50%, -50%);
  animation: wavePulse 3s 0.8s ease-out infinite;
}

.wave-line.wave-3 {
  width: 100px;
  height: 100px;
  border-color: rgba(168, 85, 247, 0.2);
  transform: translate(-50%, -50%);
  animation: wavePulse 3s 1.6s ease-out infinite;
}

.wave-center-dot {
  position: relative;
  z-index: 2;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: radial-gradient(circle, #38bdf8, #818cf8);
  box-shadow:
    0 0 16px rgba(56, 189, 248, 0.6),
    0 0 40px rgba(56, 189, 248, 0.2);
  animation: dotBreath 2.4s ease-in-out infinite;
}

.wave-center-dot::after {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 1.5px solid rgba(56, 189, 248, 0.3);
  animation: dotRingPulse 2.4s ease-in-out infinite;
}

/* Status bar */
.signal-status-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 7px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.signal-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 8px rgba(56, 189, 248, 0.6);
  animation: signalBlink 2s ease-in-out infinite;
}

.signal-label {
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.78);
  letter-spacing: 0.4px;
}

/* Corner HUD accents */
.signal-corner {
  position: absolute;
  width: 16px;
  height: 16px;
  z-index: 4;
}

.signal-corner::before,
.signal-corner::after {
  content: '';
  position: absolute;
  background: rgba(56, 189, 248, 0.45);
}

.signal-corner::before { width: 100%; height: 2px; }
.signal-corner::after { width: 2px; height: 100%; }

.corner-tl { top: 7px; left: 7px; }
.corner-tl::before { top: 0; left: 0; }
.corner-tl::after { top: 0; left: 0; }

.corner-tr { top: 7px; right: 7px; }
.corner-tr::before { top: 0; right: 0; }
.corner-tr::after { top: 0; right: 0; }

.corner-bl { bottom: 7px; left: 7px; }
.corner-bl::before { bottom: 0; left: 0; }
.corner-bl::after { bottom: 0; left: 0; }

.corner-br { bottom: 7px; right: 7px; }
.corner-br::before { bottom: 0; right: 0; }
.corner-br::after { bottom: 0; right: 0; }

/* =========================================
   Step Indicators
   ========================================= */
.step-indicators {
  display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
  animation: fadeInUp 0.8s 0.7s ease-out both;
}
.step-item {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  opacity: 0.6; transition: all 0.3s;
}
.step-item.step-active { opacity: 1; transform: scale(1.05); }
.step-dot {
  width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center;
  color: white; transition: all 0.3s;
}
.step-active .step-dot {
  background: rgba(59, 130, 246, 0.2); border-color: #60a5fa; color: #93c5fd;
  box-shadow: 0 0 16px rgba(59, 130, 246, 0.4), inset 0 0 8px rgba(59, 130, 246, 0.2);
  animation: stepPulse 2.5s ease-in-out infinite;
}
.step-item span { font-size: 11px; font-weight: 700; color: white; letter-spacing: 0.5px; }
.step-connector {
  width: 30px; height: 2px; margin-bottom: 20px; background: rgba(255,255,255,0.15);
  position: relative; overflow: hidden; border-radius: 2px;
}
.step-connector::after {
  content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
  animation: connectorFlow 2.5s ease-in-out infinite;
}

/* Status Row */
.status-row {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  flex-wrap: wrap;
  justify-content: center;
  animation: fadeInUp 0.8s 0.9s ease-out both;
}

.status-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  padding: 0 11px;
  border-radius: 11px;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(15, 23, 42, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 11px;
  font-weight: 800;
}

.branding-overlay {
  position: absolute; inset: 0; pointer-events: none; z-index: 6;
  background: radial-gradient(circle at 50% 38%, transparent 0%, rgba(15, 23, 42, 0.26) 70%),
              linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 22%, rgba(0, 0, 0, 0.16));
}

/* =========================================
   Success Modal
   ========================================= */
.success-glass-card {
  background: rgba(255, 255, 255, 0.95) !important; backdrop-filter: blur(25px);
  border: 1px solid rgba(45, 212, 191, 0.3) !important; box-shadow: 0 30px 60px rgba(15, 23, 42, 0.2) !important;
  animation: modalPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.success-animation { display: flex; justify-content: center; }
.success-circle {
  width: 96px; height: 96px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #34d399 0%, #059669 100%);
  box-shadow: 0 12px 32px rgba(16, 185, 129, 0.3); animation: pulseSuccess 2s infinite;
}
.success-title { color: #064e3b; font-size: 28px; font-weight: 900; }
.success-subtitle { color: #64748b; font-size: 15px; line-height: 1.6; }

/* =========================================
   Keyframes
   ========================================= */
@keyframes sweepMove { 0%, 100% { transform: translateX(-32%) rotate(2deg); opacity: 0.55; } 50% { transform: translateX(18%) rotate(2deg); opacity: 0.82; } }
@keyframes auroraFlow { from { transform: translate3d(0, 0, 0) scale(1); } to { transform: translate3d(48px, 36px, 0) scale(1.08); } }
@keyframes auroraPulse { 0%, 100% { transform: scale(1); opacity: 0.48; } 50% { transform: scale(1.14); opacity: 0.78; } }
@keyframes markFloat { 0%, 100% { transform: translateY(0) rotate(-28deg); opacity: 0.22; } 50% { transform: translateY(-18px) rotate(-28deg); opacity: 0.48; } }
@keyframes borderShimmer { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
@keyframes cardEntrance { from { opacity: 0; transform: perspective(1300px) translateY(34px) scale(0.97); } to { opacity: 1; transform: perspective(1300px) translateY(0) scale(1); } }
@keyframes badgePulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.46); } 50% { box-shadow: 0 0 0 7px rgba(59, 130, 246, 0); } }
@keyframes slideInRight { from { opacity: 0; transform: translateX(22px); } to { opacity: 1; transform: translateX(0); } }
@keyframes btnShine { 0% { left: -75%; } 30% { left: 126%; } 100% { left: 126%; } }
@keyframes shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }
@keyframes meshMove { 0% { transform: translate(-22%, -24%) rotate(0deg) scale(1); } 50% { transform: translate(-14%, -18%) rotate(5deg) scale(1.04); } 100% { transform: translate(-2%, -2%) rotate(10deg) scale(1.02); } }
@keyframes ringRotate { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
@keyframes auraPulse { 0%, 100% { opacity: 0.48; scale: 1; } 50% { opacity: 0.88; scale: 1.2; } }
@keyframes logoFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
@keyframes textGlow { from { text-shadow: 0 2px 22px rgba(0, 0, 0, 0.3); } to { text-shadow: 0 2px 30px rgba(255, 255, 255, 0.18), 0 0 54px rgba(59, 130, 246, 0.34); } }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
@keyframes stepPulse { 0%,100% { box-shadow: 0 0 12px rgba(59, 130, 246, 0.3); } 50% { box-shadow: 0 0 22px rgba(59, 130, 246, 0.6); } }
@keyframes connectorFlow { 0% { left: -100%; } 50% { left: 100%; } 100% { left: 100%; } }
@keyframes modalPop { 0% { opacity: 0; transform: scale(0.85) translateY(20px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
@keyframes pulseSuccess { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); } 70% { transform: scale(1); box-shadow: 0 0 0 25px rgba(16, 185, 129, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
@keyframes chipEntrance { from { opacity: 0; transform: translateY(10px) scale(0.92); } to { opacity: 1; transform: translateY(0) scale(1); } }

/* Stream Pulse */
@keyframes streamPulse {
  0%, 100% { transform: scaleX(0.42); opacity: 0.26; }
  50% { transform: scaleX(1); opacity: 0.86; }
}

/* Signal Panel Keyframes */
@keyframes signalEntrance {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.95);
    filter: blur(3px);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@property --border-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

@keyframes borderRotate {
  to { --border-angle: 360deg; }
}

@keyframes scanDown {
  0% { top: -2px; opacity: 0; }
  10% { opacity: 0.85; }
  90% { opacity: 0.85; }
  100% { top: calc(100% + 2px); opacity: 0; }
}

@keyframes wavePulse {
  0% {
    transform: translate(-50%, -50%) scale(0.3);
    opacity: 0.8;
    border-width: 3px;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.8);
    opacity: 0;
    border-width: 1px;
  }
}

@keyframes dotBreath {
  0%, 100% { transform: scale(1); box-shadow: 0 0 16px rgba(56, 189, 248, 0.6), 0 0 40px rgba(56, 189, 248, 0.2); }
  50% { transform: scale(1.2); box-shadow: 0 0 24px rgba(56, 189, 248, 0.8), 0 0 60px rgba(56, 189, 248, 0.3); }
}

@keyframes dotRingPulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.4); opacity: 0.1; }
}

@keyframes signalBlink {
  0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(56, 189, 248, 0.6); }
  50% { opacity: 0.35; box-shadow: 0 0 4px rgba(56, 189, 248, 0.2); }
}

/* =========================================
   Media Queries
   ========================================= */
@media (max-width: 959px) {
  .auth-layout { align-items: flex-start; padding: 20px 14px; overflow-y: auto; }
  .glass-card { transform: none !important; }
  .form-side { min-height: auto; }
  .form-side.register-form::after { inset: 18px auto 18px 0; width: 4px; }
  .mobile-brand-strip { display: flex; }
  .login-title { font-size: 28px; }
}

@media (max-width: 520px) {
  .auth-layout { padding: 12px; }
  .form-side { padding: 26px 22px !important; }
  .divider-line::before, .divider-line::after { width: 34%; }
  .mobile-brand-strip { border-radius: 18px; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
  .glass-card { transform: none !important; }
}
</style>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'

definePageMeta({ layout: 'auth-login', ssr: false })

const { $api } = useNuxtApp()
const router = useRouter()

const errorMsg = ref('')
const showPw = ref(false)
const loading = ref(false)
const showSuccessModal = ref(false)
const departments = ref([])
const orgGroups = ref([])

// 3D Card Animation Refs
const particleCanvas = ref(null)
const tiltX = ref(0)
const tiltY = ref(0)
const spotX = ref(50)
const spotY = ref(50)

let animId = 0
let resizeHandler = null
let particles = []

// Computes style for 3D glass card
const cardStyle = computed(() => ({
  '--tilt-x': `${tiltX.value}deg`,
  '--tilt-y': `${tiltY.value}deg`,
  '--spot-x': `${spotX.value}%`,
  '--spot-y': `${spotY.value}%`
}))

// Mouse Tracking for 3D Card
const handlePointerMove = (event) => {
  if (window.matchMedia('(max-width: 959px)').matches) return
  const card = event.currentTarget.querySelector('.glass-card')
  if (!card) return

  const rect = card.getBoundingClientRect()
  const x = (event.clientX - rect.left) / rect.width
  const y = (event.clientY - rect.top) / rect.height

  spotX.value = Math.round(x * 100)
  spotY.value = Math.round(y * 100)
  // Subtle tilt limits
  tiltX.value = (0.5 - y) * 5
  tiltY.value = (x - 0.5) * 5
}

const handlePointerLeave = () => {
  tiltX.value = 0
  tiltY.value = 0
  spotX.value = 50
  spotY.value = 50
}

// Particle Canvas Logic (Synced from Login)
const makeParticles = (canvas) => {
  const count = canvas.offsetWidth > 420 ? 72 : 44
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.offsetWidth,
    y: Math.random() * canvas.offsetHeight,
    r: Math.random() * 2 + 0.6,
    dx: (Math.random() - 0.5) * 0.55,
    dy: (Math.random() - 0.5) * 0.55,
    alpha: Math.random() * 0.48 + 0.22,
    pulse: Math.random() * Math.PI * 2
  }))
}

onMounted(async () => {
  // Fetch initial select data
  try {
    const resDept = await $api.get('http://localhost:7000/api/users/list_departments')
    departments.value = resDept.data?.data || resDept.data
    const resOrg = await $api.get('http://localhost:7000/api/users/list_org_groups')
    orgGroups.value = resOrg.data?.data || resOrg.data
  } catch (e) {
    console.error('Failed to fetch initial data', e)
  }

  // Setup Canvas Particles
  const canvas = particleCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const resize = () => {
    const dpr = window.devicePixelRatio || 1
    const width = canvas.offsetWidth
    const height = canvas.offsetHeight

    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    makeParticles(canvas)
  }

  resize()
  resizeHandler = resize
  window.addEventListener('resize', resize)

  const draw = () => {
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

    particles.forEach((p) => {
      p.x += p.dx
      p.y += p.dy
      p.pulse += 0.024

      if (p.x < 0) p.x = canvas.offsetWidth
      if (p.x > canvas.offsetWidth) p.x = 0
      if (p.y < 0) p.y = canvas.offsetHeight
      if (p.y > canvas.offsetHeight) p.y = 0

      const alpha = p.alpha * (0.68 + 0.32 * Math.sin(p.pulse))
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${alpha})`
      ctx.fill()
    })

    // Draw connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 92) {
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.strokeStyle = `rgba(255,255,255,${0.07 * (1 - dist / 92)})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }
    }

    animId = requestAnimationFrame(draw)
  }

  draw()
})

onBeforeUnmount(() => {
  if (animId) cancelAnimationFrame(animId)
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
})

// Password Strength Logic
const pwStrength = computed(() => {
  const pw = password.value || ''
  if (pw.length === 0) return 0
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw) || /[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) score++
  return Math.min(score, 3)
})

// Form Validation Schema
const schema = yup.object({
  name_th: yup.string().required('กรุณากรอกชื่อ-นามสกุล'),
  email: yup.string().email('รูปแบบอีเมลไม่ถูกต้อง').required('กรุณากรอกอีเมล'),
  department_id: yup.number().required('กรุณาเลือกแผนก'),
  position: yup.string().required('กรุณากรอกตำแหน่งการทำงาน'),
  password: yup.string().min(6, 'รหัสผ่านอย่างน้อย 6 ตัว').required('กรุณากรอกรหัสผ่าน'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'รหัสผ่านไม่ตรงกัน')
    .required('กรุณายืนยันรหัสผ่าน')
})

const { handleSubmit } = useForm({ validationSchema: schema })

const { value: name_th, errorMessage: nameErr } = useField('name_th')
const { value: email, errorMessage: emailErr } = useField('email')
const { value: department_id, errorMessage: deptErr } = useField('department_id')
const { value: position, errorMessage: positionErr } = useField('position')
const { value: password, errorMessage: passwordErr } = useField('password')
const { value: confirmPassword, errorMessage: confirmPasswordErr } = useField('confirmPassword')

// Submit Handler
const onSubmit = handleSubmit(async (values) => {
  errorMsg.value = ''
  loading.value = true
  try {
    await $api.post('/api/users/create_user', {
      name_th: values.name_th,
      email: values.email,
      department_id: values.department_id,
      position: values.position,
      password: values.password,
      role: 'evaluatee',
      status: 'active'
    })
    
    // เปิด Success Modal
    showSuccessModal.value = true
  } catch (e) {
    errorMsg.value = e.response?.data?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก'
  } finally {
    loading.value = false
  }
})

// นำทางกลับไปหน้า Login เมื่อกดปุ่มใน Modal
const goToLogin = () => {
  showSuccessModal.value = false
  router.push('/')
}
</script>
