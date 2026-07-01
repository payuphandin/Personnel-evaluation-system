<template>
  <div>
  <!-- ===== SPACE INTRO SPLASH ===== -->
  <Transition name="intro-warp">
    <div v-if="showIntro" class="intro-overlay" aria-hidden="true">
      <!-- Canvas: hyperspace warp starfield -->
      <canvas ref="introCanvas" class="intro-stars-canvas"></canvas>

      <!-- Nebula blobs -->
      <div class="intro-nebula n1"></div>
      <div class="intro-nebula n2"></div>
      <div class="intro-nebula n3"></div>
      <div class="intro-nebula n4"></div>

      <!-- Scan line -->
      <div class="intro-scan-line" :class="{ 'scan-active': introPhase >= 1 }"></div>

      <!-- Grid -->
      <div class="intro-grid"></div>

      <!-- HUD corners -->
      <div class="hud-corner hud-tl"></div>
      <div class="hud-corner hud-tr"></div>
      <div class="hud-corner hud-bl"></div>
      <div class="hud-corner hud-br"></div>

      <!-- HUD side labels -->
      <div class="hud-label hud-label-top" :class="{ 'hud-show': introPhase >= 2 }">
        <span class="hud-line-text">SYS.INIT &nbsp; ◆ &nbsp; AUTHENTICATION READY</span>
      </div>
      <div class="hud-label hud-label-bottom" :class="{ 'hud-show': introPhase >= 3 }">
        <span class="hud-line-text">CTCDA &nbsp; ◆ &nbsp; VEC SKILLS SYSTEM &nbsp; ◆ &nbsp; v2.0</span>
      </div>

      <!-- Planet / orb decoration -->
      <div class="intro-planet" :class="{ 'planet-show': introPhase >= 1 }">
        <div class="planet-ring pr-1"></div>
        <div class="planet-ring pr-2"></div>
        <div class="planet-glow"></div>
        <div class="planet-surface"></div>
      </div>

      <!-- Central content -->
      <div class="intro-center" :class="{ 'intro-ready': introPhase >= 1 }">

        <!-- Logo -->
        <div class="intro-logo-wrap" :class="{ 'logo-pop': introPhase >= 1 }">
          <div class="intro-ring ir-1"></div>
          <div class="intro-ring ir-2"></div>
          <div class="intro-ring ir-3"></div>
          <div class="intro-ring ir-4"></div>
          <div class="intro-logo-bg"></div>
          <div class="intro-logo-pulse"></div>
          <img src="/images/ctcda.png" alt="CTCDA" class="intro-logo-img" />
          <div class="intro-orbit-dot od-1"></div>
          <div class="intro-orbit-dot od-2"></div>
          <div class="intro-orbit-dot od-3"></div>
          <div class="intro-orbit-dot od-4"></div>
        </div>

        <!-- Text -->
        <div class="intro-text" :class="{ 'text-appear': introPhase >= 2 }">
          <div class="intro-badge">V E C &nbsp;·&nbsp; S K I L L S &nbsp;·&nbsp; S Y S T E M</div>
          <h1 class="intro-title" :class="{ 'title-glitch': glitching }">
            <span class="title-main">ระบบประเมินบุคลากร</span>
            <span class="title-glitch-copy" aria-hidden="true">ระบบประเมินบุคลากร</span>
          </h1>
          <p class="intro-sub">{{ typedText }}<span class="cursor-blink">|</span></p>
        </div>

        <!-- Phase 3 stat chips -->
        <div class="intro-stats" :class="{ 'stats-show': introPhase >= 3 }">
          <div class="istat">
            <span class="istat-icon">◈</span>
            <span class="istat-label">SECURE</span>
          </div>
          <div class="istat-sep">|</div>
          <div class="istat">
            <span class="istat-icon">◈</span>
            <span class="istat-label">ACCURATE</span>
          </div>
          <div class="istat-sep">|</div>
          <div class="istat">
            <span class="istat-icon">◈</span>
            <span class="istat-label">FAST</span>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="intro-progress" :class="{ 'progress-run': introPhase >= 2 }">
          <div class="intro-progress-labels">
            <span>LOADING SYSTEM</span>
            <span>{{ Math.round(progressWidth) }}%</span>
          </div>
          <div class="intro-progress-track">
            <div class="intro-progress-bar" :style="{ width: progressWidth + '%' }"></div>
            <div class="intro-progress-glow"></div>
          </div>
        </div>

        <!-- Skip button -->
        <button class="intro-skip" :class="{ 'skip-show': introPhase >= 1 }" @click="skipIntro">[ SKIP INTRO ]</button>
      </div>
    </div>
  </Transition>

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
        max-width="1080"
        width="100%"
        :style="cardStyle"
      >
        <div class="card-spotlight"></div>

        <v-row no-gutters class="auth-card-row">
          <v-col cols="12" md="6" class="form-side pa-7 pa-sm-9 pa-md-12 d-flex flex-column justify-center">
            <div class="mobile-brand-strip mb-7">
              <v-avatar size="48" class="mobile-logo">
                <v-img src="/images/ctcda.png" alt="College Logo" cover />
              </v-avatar>
              <div>
                <p class="mobile-kicker mb-0">ระบบประเมินบุคลากร</p>
                <p class="mobile-copy mb-0">พร้อมเข้าสู่แดชบอร์ดของคุณ</p>
              </div>
            </div>

            <div class="mb-8 form-header">
              <div class="brand-badge mb-4">
                <span class="badge-dot"></span>
                <span class="badge-text">ระบบปลอดภัย</span>
              </div>
              <h2 class="login-title mb-3">เข้าสู่ระบบ</h2>
              <p class="login-copy mb-0">ยินดีต้อนรับกลับมา กรุณาระบุข้อมูลบัญชีของคุณเพื่อดำเนินการต่อ</p>
            </div>

            <div class="mini-metrics field-wrap field-1 mb-7">
              <div class="metric-pill">
                <v-icon size="16">mdi-shield-lock-outline</v-icon>
                <span>เข้ารหัส</span>
              </div>
              <div class="metric-pill">
                <v-icon size="16">mdi-timeline-check-outline</v-icon>
                <span>ติดตามผล</span>
              </div>
              <div class="metric-pill">
                <v-icon size="16">mdi-chart-box-outline</v-icon>
                <span>รายงานเร็ว</span>
              </div>
            </div>

            <form class="form-fields" @submit.prevent="onSubmit">
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

              <div class="field-wrap field-3">
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
              </div>

              <div class="form-options field-wrap field-4">
                <v-checkbox v-model="rememberMe" label="จดจำฉัน" density="comfortable" color="indigo" hide-details />
                <NuxtLink to="/forgot" class="forgot-link">
                  ลืมรหัสผ่าน?
                </NuxtLink>
              </div>

              <v-expand-transition>
                <v-alert v-if="errorMsg" type="error" density="comfortable" variant="tonal" class="mb-4 rounded-lg alert-shake">
                  {{ errorMsg }}
                </v-alert>
              </v-expand-transition>

              <div class="field-wrap field-5">
                <v-btn
                  :loading="loading"
                  type="submit"
                  block
                  size="x-large"
                  rounded="xl"
                  class="font-weight-bold submit-btn"
                >
                  <span class="btn-glow"></span>
                  <span class="btn-text">เข้าสู่ระบบ</span>
                  <v-icon end size="20">mdi-login-variant</v-icon>
                  <span class="btn-shine"></span>
                </v-btn>
              </div>
            </form>

            <div class="text-center mt-10 field-wrap field-6">
              <div class="divider-line">
                <span>หรือ</span>
              </div>
              <p class="register-copy mt-4 mb-0">
                ยังไม่มีบัญชีสมาชิก?
                <NuxtLink to="/register" class="register-link">
                  สมัครสมาชิก
                </NuxtLink>
              </p>
            </div>
          </v-col>

          <v-col cols="12" md="6" class="branding-side d-none d-md-flex align-center justify-center">
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
                <v-avatar size="136" class="logo-box">
                  <v-img src="/images/ctcda.png" alt="College Logo" cover class="pa-2" />
                </v-avatar>
                <div class="logo-ring-outer"></div>
                <div class="logo-ring-inner"></div>
              </div>

              <h1 class="brand-title mb-2">ระบบประเมินบุคลากร</h1>
              <p class="brand-subtitle mb-0">ประเมินผลประสิทธิภาพการทำงานอย่างเป็นระบบ</p>

              <div class="stat-chips">
                <div class="chip chip-1">
                  <v-icon size="14" class="mr-1">mdi-shield-check</v-icon>
                  ปลอดภัย
                </div>
                <div class="chip chip-2">
                  <v-icon size="14" class="mr-1">mdi-chart-line</v-icon>
                  แม่นยำ
                </div>
                <div class="chip chip-3">
                  <v-icon size="14" class="mr-1">mdi-lightning-bolt</v-icon>
                  รวดเร็ว
                </div>
              </div>

              <!-- ===== Cyber Holo Interface (แทน insight-panel เดิม) ===== -->
              <div class="cyber-holo">
                <div class="cyber-holo-border"></div>
                <div class="cyber-scan-line"></div>

                <div class="hex-container">
                  <div class="hex-frame hex-outer-frame"></div>
                  <div class="hex-frame hex-inner-frame"></div>
                  <div class="hex-core">
                    <v-icon size="30" color="white">mdi-shield-lock-outline</v-icon>
                  </div>
                </div>

                <div class="orbit-ring">
                  <span class="orbit-node node-a"></span>
                  <span class="orbit-node node-b"></span>
                  <span class="orbit-node node-c"></span>
                  <span class="orbit-node node-d"></span>
                </div>

                <div class="cyber-status-bar">
                  <span class="cyber-dot"></span>
                  <span class="cyber-label">ระบบพร้อมใช้งาน</span>
                </div>

                <div class="holo-corner corner-tl"></div>
                <div class="holo-corner corner-tr"></div>
                <div class="holo-corner corner-bl"></div>
                <div class="holo-corner corner-br"></div>
              </div>
              <!-- ===== /Cyber Holo Interface ===== -->

              <div class="status-row">
                <div class="status-item">
                  <v-icon size="15">mdi-account-check-outline</v-icon>
                  <span>ผู้ประเมิน</span>
                </div>
                <div class="status-item">
                  <v-icon size="15">mdi-file-upload-outline</v-icon>
                  <span>หลักฐาน</span>
                </div>
                <div class="status-item">
                  <v-icon size="15">mdi-chart-donut</v-icon>
                  <span>สรุปผล</span>
                </div>
              </div>
            </div>

            <div class="branding-overlay"></div>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Noto+Sans+Thai:wght@300;400;500;600;700;800;900&family=Orbitron:wght@400;700;900&display=swap');

/* ===========================
   INTRO SPLASH OVERLAY
   =========================== */
.intro-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #010814;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.intro-stars-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* Nebula blobs */
.intro-nebula {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  pointer-events: none;
  animation: nebulaDrift 18s ease-in-out infinite alternate;
}
.n1 { width: 700px; height: 700px; top: -180px; left: -120px; background: radial-gradient(circle, rgba(80,40,200,0.4) 0%, transparent 70%); animation-duration: 18s; }
.n2 { width: 600px; height: 600px; bottom: -120px; right: -100px; background: radial-gradient(circle, rgba(10,80,200,0.35) 0%, transparent 70%); animation-duration: 24s; animation-direction: alternate-reverse; }
.n3 { width: 400px; height: 400px; top: 25%; left: 38%; background: radial-gradient(circle, rgba(180,30,130,0.2) 0%, transparent 70%); animation-duration: 13s; }
.n4 { width: 300px; height: 300px; bottom: 20%; left: 10%; background: radial-gradient(circle, rgba(0,180,200,0.15) 0%, transparent 70%); animation-duration: 20s; animation-direction: alternate-reverse; }
@keyframes nebulaDrift { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(50px,40px) scale(1.2); } }

/* Scan line sweep */
.intro-scan-line {
  position: absolute;
  left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(100,200,255,0.6) 40%, rgba(160,120,255,0.4) 60%, transparent);
  box-shadow: 0 0 20px 4px rgba(100,200,255,0.25);
  top: -10px;
  transition: none;
  pointer-events: none;
  z-index: 5;
}
.intro-scan-line.scan-active {
  animation: scanSweep 4s ease-in-out infinite;
}
@keyframes scanSweep {
  0%   { top: 0%;    opacity: 0; }
  5%   { opacity: 1; }
  95%  { opacity: 1; }
  100% { top: 100%;  opacity: 0; }
}

/* Grid overlay */
.intro-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(80,120,255,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(80,120,255,0.05) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse at center, black 0%, transparent 72%);
  pointer-events: none;
}

/* HUD corner brackets */
.hud-corner {
  position: absolute;
  width: 60px; height: 60px;
  border-color: rgba(80,160,255,0.5);
  border-style: solid;
  z-index: 8;
  pointer-events: none;
  animation: hudPulse 3s ease-in-out infinite;
}
.hud-tl { top: 20px; left: 20px; border-width: 2px 0 0 2px; border-radius: 4px 0 0 0; }
.hud-tr { top: 20px; right: 20px; border-width: 2px 2px 0 0; border-radius: 0 4px 0 0; animation-delay: 0.5s; }
.hud-bl { bottom: 20px; left: 20px; border-width: 0 0 2px 2px; border-radius: 0 0 0 4px; animation-delay: 1s; }
.hud-br { bottom: 20px; right: 20px; border-width: 0 2px 2px 0; border-radius: 0 0 4px 0; animation-delay: 1.5s; }
@keyframes hudPulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; border-color: rgba(120,200,255,0.8); } }

/* HUD horizontal labels */
.hud-label {
  position: absolute;
  left: 0; right: 0;
  text-align: center;
  font-family: 'Orbitron', monospace;
  font-size: 10px;
  letter-spacing: 4px;
  color: rgba(100,180,255,0.4);
  z-index: 8;
  pointer-events: none;
  opacity: 0;
  transition: opacity 1s ease;
}
.hud-label-top  { top: 30px; }
.hud-label-bottom { bottom: 30px; }
.hud-label.hud-show { opacity: 1; }
.hud-line-text { display: inline-block; animation: hudScroll 12s linear infinite; }
@keyframes hudScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-30px); } }

/* Planet decoration */
.intro-planet {
  position: absolute;
  right: 6%; bottom: 8%;
  width: 120px; height: 120px;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 1.2s ease 0.5s, transform 1.2s ease 0.5s;
  pointer-events: none;
}
.intro-planet.planet-show { opacity: 1; transform: translateY(0); }
.planet-surface {
  width: 100%; height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, rgba(120,160,255,0.6) 0%, rgba(30,50,120,0.9) 50%, rgba(10,20,60,1) 100%);
  box-shadow: inset -20px -10px 30px rgba(0,0,30,0.8), 0 0 30px rgba(80,120,255,0.3);
  animation: planetRotate 20s linear infinite;
}
.planet-glow {
  position: absolute;
  inset: -15px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(80,120,255,0.15) 0%, transparent 70%);
  animation: planetPulse 4s ease-in-out infinite;
}
.planet-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(120,160,255,0.25);
  top: 50%; left: 50%;
  transform: translate(-50%,-50%) rotateX(72deg);
}
.pr-1 { width: 160px; height: 160px; }
.pr-2 { width: 190px; height: 190px; border-style: dashed; opacity: 0.4; }
@keyframes planetRotate { 100% { filter: hue-rotate(30deg); } }
@keyframes planetPulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }

/* Center content */
.intro-center {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.9s ease, transform 0.9s ease;
}
.intro-center.intro-ready { opacity: 1; transform: translateY(0); }

/* Logo wrap */
.intro-logo-wrap {
  position: relative;
  width: 170px; height: 170px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(0.4) rotate(-20deg);
  opacity: 0;
  transition: transform 1.1s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.8s ease;
}
.intro-logo-wrap.logo-pop { transform: scale(1) rotate(0deg); opacity: 1; }

.intro-logo-bg {
  position: absolute;
  inset: 22px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(80,100,255,0.3) 0%, rgba(1,8,20,0.7) 100%);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(120,160,255,0.35);
}
.intro-logo-pulse {
  position: absolute;
  inset: 15px;
  border-radius: 50%;
  border: 1px solid rgba(100,180,255,0.4);
  animation: logoPulse 2.5s ease-in-out infinite;
}
@keyframes logoPulse {
  0%,100% { transform: scale(1);   opacity: 0.4; }
  50%      { transform: scale(1.1); opacity: 1; }
}

.intro-logo-img {
  width: 96px; height: 96px;
  object-fit: contain;
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 0 25px rgba(120,160,255,0.7));
  animation: logoFloat 5s ease-in-out infinite;
}
@keyframes logoFloat { 0%,100% { transform: translateY(0);   } 50% { transform: translateY(-10px); } }

/* Orbital rings */
.intro-ring { position: absolute; border-radius: 50%; border-style: solid; }
.ir-1 { inset: -12px; border-width: 1px; border-color: rgba(100,160,255,0.35); animation: orbitSpin 7s linear infinite; }
.ir-2 { inset: -30px; border-width: 1px; border-color: rgba(180,100,255,0.25); border-style: dashed; animation: orbitSpin 13s linear infinite reverse; }
.ir-3 { inset: -52px; border-width: 1px; border-color: rgba(100,220,255,0.18); animation: orbitSpin 19s linear infinite; }
.ir-4 { inset: -70px; border-width: 1px; border-color: rgba(255,100,180,0.12); border-style: dotted; animation: orbitSpin 28s linear infinite reverse; }
@keyframes orbitSpin { 100% { transform: rotate(360deg); } }

/* Orbit dots */
.intro-orbit-dot { position: absolute; border-radius: 50%; }
.od-1 { width: 8px; height: 8px; background: rgba(140,200,255,1); box-shadow: 0 0 12px 4px rgba(100,180,255,0.7); animation: dotOrbit1 7s linear infinite; }
.od-2 { width: 6px; height: 6px; background: rgba(210,100,255,1); box-shadow: 0 0 10px 3px rgba(200,80,255,0.6); animation: dotOrbit2 13s linear infinite; }
.od-3 { width: 5px; height: 5px; background: rgba(100,240,200,1); box-shadow: 0 0 10px 3px rgba(80,220,180,0.5); animation: dotOrbit3 19s linear infinite; }
.od-4 { width: 4px; height: 4px; background: rgba(255,160,100,1); box-shadow: 0 0 8px 2px rgba(255,140,80,0.5); animation: dotOrbit4 28s linear infinite reverse; }
@keyframes dotOrbit1 { 0% { transform: rotate(0deg) translateX(85px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(85px) rotate(-360deg); } }
@keyframes dotOrbit2 { 0% { transform: rotate(60deg) translateX(103px) rotate(-60deg); } 100% { transform: rotate(420deg) translateX(103px) rotate(-420deg); } }
@keyframes dotOrbit3 { 0% { transform: rotate(180deg) translateX(125px) rotate(-180deg); } 100% { transform: rotate(540deg) translateX(125px) rotate(-540deg); } }
@keyframes dotOrbit4 { 0% { transform: rotate(270deg) translateX(143px) rotate(-270deg); } 100% { transform: rotate(-90deg) translateX(143px) rotate(90deg); } }

/* Text */
.intro-text {
  text-align: center;
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.9s ease 0.3s, transform 0.9s ease 0.3s;
}
.intro-text.text-appear { opacity: 1; transform: translateY(0); }

.intro-badge {
  font-family: 'Orbitron', monospace !important;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 6px;
  color: rgba(120,180,255,0.7);
  margin-bottom: 14px;
  text-transform: uppercase;
}

/* Glitch title */
.intro-title {
  position: relative;
  font-family: 'Noto Sans Thai', sans-serif !important;
  font-size: clamp(28px, 5vw, 50px);
  font-weight: 900;
  line-height: 1.1;
  margin: 0 0 14px;
  color: #fff;
  text-shadow: 0 0 50px rgba(100,160,255,0.6);
  display: inline-block;
}
.title-main { display: block; }
.title-glitch-copy {
  position: absolute;
  top: 0; left: 0;
  color: rgba(100,200,255,0.5);
  display: none;
}
.intro-title.title-glitch .title-glitch-copy {
  display: block;
  animation: glitchCopy 0.3s steps(2,end) forwards;
}
@keyframes glitchCopy {
  0%   { clip-path: inset(10% 0 85% 0); transform: translate(-4px, 2px); }
  25%  { clip-path: inset(50% 0 30% 0); transform: translate(4px, -2px); }
  50%  { clip-path: inset(70% 0 5%  0); transform: translate(-2px, 4px); }
  75%  { clip-path: inset(25% 0 55% 0); transform: translate(2px, -4px); }
  100% { clip-path: inset(0);           transform: translate(0); }
}

.intro-sub {
  font-family: 'Orbitron', monospace !important;
  font-size: clamp(11px, 1.8vw, 14px);
  color: rgba(140,190,255,0.65);
  letter-spacing: 2px;
  margin: 0;
  min-height: 26px;
}
.cursor-blink { animation: blink 1s step-end infinite; color: rgba(100,220,255,0.9); }
@keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }

/* Stat chips */
.intro-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s;
}
.intro-stats.stats-show { opacity: 1; transform: translateY(0); }
.istat { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.istat-icon { font-size: 16px; color: rgba(100,200,255,0.8); animation: iconPulse 2s ease-in-out infinite; }
.istat-label { font-family: 'Orbitron', monospace; font-size: 9px; letter-spacing: 2px; color: rgba(140,180,255,0.6); }
.istat-sep { color: rgba(80,120,200,0.3); font-size: 24px; font-weight: 100; }
@keyframes iconPulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; text-shadow: 0 0 8px rgba(100,200,255,0.8); } }

/* Progress */
.intro-progress {
  width: min(420px, 82vw);
  opacity: 0;
  transition: opacity 0.6s ease 0.4s;
}
.intro-progress.progress-run { opacity: 1; }
.intro-progress-labels {
  display: flex;
  justify-content: space-between;
  font-family: 'Orbitron', monospace;
  font-size: 9px;
  letter-spacing: 2px;
  color: rgba(100,160,255,0.5);
  margin-bottom: 6px;
}
.intro-progress-track {
  position: relative;
  height: 3px;
  background: rgba(60,80,160,0.25);
  border-radius: 99px;
  overflow: visible;
}
.intro-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #3050ff, #9040ff, #40c0ff, #3050ff);
  background-size: 200% 100%;
  border-radius: 99px;
  transition: width 0.12s linear;
  box-shadow: 0 0 14px 3px rgba(80,160,255,0.55);
  animation: progressShimmer 2s linear infinite;
}
@keyframes progressShimmer { 0% { background-position: 0% 0; } 100% { background-position: 200% 0; } }
.intro-progress-glow {
  position: absolute;
  inset: -6px -10px;
  background: linear-gradient(90deg, #3050ff40, #9040ff40, #40c0ff40);
  filter: blur(10px);
  border-radius: 99px;
  pointer-events: none;
}

/* Skip button */
.intro-skip {
  font-family: 'Orbitron', monospace;
  font-size: 9px;
  letter-spacing: 3px;
  color: rgba(100,150,255,0.4);
  border: 1px solid rgba(100,150,255,0.18);
  background: transparent;
  padding: 7px 20px;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.6s ease 2s, transform 0.6s ease 2s, color 0.25s, border-color 0.25s, box-shadow 0.25s;
}
.intro-skip.skip-show { opacity: 1; transform: translateY(0); }
.intro-skip:hover {
  color: rgba(180,220,255,0.9);
  border-color: rgba(140,200,255,0.5);
  box-shadow: 0 0 12px rgba(100,180,255,0.2);
}

/* Warp-out transition */
.intro-warp-leave-active { transition: all 1.2s cubic-bezier(0.4, 0, 1, 1); }
.intro-warp-leave-to {
  opacity: 0;
  transform: scale(4);
  filter: blur(60px) brightness(3);
}

/* ===========================
   END INTRO — original styles
   =========================== */

* {
  font-family: 'Inter', 'Noto Sans Thai', sans-serif;
}

.auth-layout {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    linear-gradient(135deg, #eef3ff 0%, #fbfdff 38%, #eff6ff 68%, #f8f5ff 100%);
  position: relative;
  overflow: hidden;
  padding: 28px 16px;
  isolation: isolate;
}

.scene-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(67, 56, 202, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(30, 58, 138, 0.06) 1px, transparent 1px);
  background-size: 58px 58px;
  mask-image: radial-gradient(circle at center, black 0%, transparent 74%);
  pointer-events: none;
  z-index: 0;
}

.scene-sweep {
  position: absolute;
  inset: -30%;
  background:
    linear-gradient(115deg, transparent 20%, rgba(255, 255, 255, 0.72) 42%, transparent 58%),
    linear-gradient(65deg, transparent 40%, rgba(59, 130, 246, 0.12) 50%, transparent 62%);
  transform: translateX(-32%) rotate(2deg);
  animation: sweepMove 12s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

.aurora {
  position: absolute;
  pointer-events: none;
  opacity: 0.72;
  filter: blur(58px);
  mix-blend-mode: multiply;
  z-index: 0;
}

.aurora-1 {
  inset: -22% 52% 48% -14%;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.35), rgba(96, 165, 250, 0.18));
  border-radius: 38% 62% 52% 48%;
  animation: auroraFlow 20s ease-in-out infinite alternate;
}

.aurora-2 {
  inset: 58% -16% -24% 42%;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.25), rgba(125, 211, 252, 0.12));
  border-radius: 58% 42% 45% 55%;
  animation: auroraFlow 22s ease-in-out infinite alternate-reverse;
}

.aurora-3 {
  inset: 18% 14% 18% 58%;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.18), rgba(56, 189, 248, 0.16));
  border-radius: 42% 58% 60% 40%;
  animation: auroraPulse 16s ease-in-out infinite;
}

.floating-marks {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.mark {
  position: absolute;
  width: 90px;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(67, 56, 202, 0.26), transparent);
  transform: rotate(-28deg);
  animation: markFloat 9s ease-in-out infinite;
}

.mark-1 { top: 18%; left: 9%; animation-delay: 0s; }
.mark-2 { top: 72%; left: 18%; width: 130px; animation-delay: 1.3s; }
.mark-3 { top: 24%; right: 12%; width: 120px; animation-delay: 2.1s; }
.mark-4 { right: 21%; bottom: 16%; width: 74px; animation-delay: 3s; }

.relative-content {
  position: relative;
  z-index: 2;
}

.glass-card {
  --tilt-x: 0deg;
  --tilt-y: 0deg;
  --spot-x: 50%;
  --spot-y: 50%;
  background: rgba(255, 255, 255, 0.58) !important;
  backdrop-filter: blur(26px);
  -webkit-backdrop-filter: blur(26px);
  border: 1px solid rgba(255, 255, 255, 0.78) !important;
  box-shadow:
    0 30px 80px rgba(31, 41, 55, 0.16),
    0 16px 35px rgba(67, 56, 202, 0.09),
    0 0 0 1px rgba(255, 255, 255, 0.58) inset !important;
  position: relative;
  transform: perspective(1300px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y));
  transform-style: preserve-3d;
  transition: transform 0.18s ease, box-shadow 0.25s ease;
  animation: cardEntrance 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.glass-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background:
    linear-gradient(130deg, rgba(79, 70, 229, 0.42), rgba(255, 255, 255, 0), rgba(59, 130, 246, 0.34), rgba(125, 211, 252, 0.18), rgba(255, 255, 255, 0));
  background-size: 320% 320%;
  animation: borderShimmer 7s ease infinite;
  z-index: -1;
  pointer-events: none;
}

.card-spotlight {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at var(--spot-x) var(--spot-y), rgba(255, 255, 255, 0.45), transparent 36%);
  opacity: 0.8;
  pointer-events: none;
  z-index: 2;
}

.auth-card-row {
  position: relative;
  z-index: 3;
}

.form-side {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.72));
  min-height: 660px;
  position: relative;
}

.form-side::after {
  content: '';
  position: absolute;
  inset: 18px auto 18px 0;
  width: 4px;
  border-radius: 999px;
  background: linear-gradient(180deg, #4f46e5, #3b82f6, #60a5fa);
  opacity: 0.75;
}

.mobile-brand-strip {
  display: none;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border: 1px solid rgba(79, 70, 229, 0.13);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 16px 34px rgba(67, 56, 202, 0.09);
}

.mobile-logo {
  background: #fff;
  box-shadow: 0 8px 24px rgba(31, 41, 55, 0.12);
}

.mobile-kicker {
  color: #312e81;
  font-weight: 800;
  font-size: 14px;
}

.mobile-copy {
  color: #64748b;
  font-size: 12px;
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.09), rgba(59, 130, 246, 0.08));
  border: 1px solid rgba(79, 70, 229, 0.18);
  border-radius: 999px;
  padding: 6px 13px;
  font-size: 12px;
  color: #3730a3;
  font-weight: 800;
  box-shadow: 0 10px 28px rgba(67, 56, 202, 0.08);
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border-radius: 50%;
  animation: badgePulse 2s ease-in-out infinite;
  box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.46);
}

.login-title {
  color: #1e1b4b;
  font-size: clamp(30px, 4vw, 42px);
  line-height: 1.08;
  font-weight: 900;
  letter-spacing: 0;
}

.login-copy {
  color: #64748b;
  line-height: 1.8;
  max-width: 390px;
}

.form-header {
  animation: slideInLeft 0.7s 0.16s ease-out both;
}

.mini-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.metric-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 44px;
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(248, 250, 252, 0.78));
  border: 1px solid rgba(99, 102, 241, 0.12);
  color: #334155;
  font-size: 12px;
  font-weight: 800;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
  transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
}

.metric-pill :deep(.v-icon) {
  color: #4f46e5;
}

.metric-pill:hover {
  transform: translateY(-3px);
  border-color: rgba(59, 130, 246, 0.28);
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.09);
}

.field-wrap {
  animation: slideInLeft ease-out both;
}

.field-1 { animation-duration: 0.58s; animation-delay: 0.28s; }
.field-2 { animation-duration: 0.58s; animation-delay: 0.36s; }
.field-3 { animation-duration: 0.58s; animation-delay: 0.46s; }
.field-4 { animation-duration: 0.58s; animation-delay: 0.56s; }
.field-5 { animation-duration: 0.58s; animation-delay: 0.66s; }
.field-6 { animation-duration: 0.58s; animation-delay: 0.76s; }

.premium-field {
  margin-bottom: 14px;
}

.premium-field :deep(.v-field) {
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.premium-field :deep(.v-field:hover) {
  transform: translateY(-1px);
  box-shadow: 0 16px 34px rgba(67, 56, 202, 0.11);
}

.premium-field :deep(.v-field--focused) {
  background: #fff;
  box-shadow:
    0 18px 38px rgba(67, 56, 202, 0.14),
    0 0 0 4px rgba(99, 102, 241, 0.08);
}

.premium-field :deep(.v-field__prepend-inner) {
  color: #4f46e5;
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: -6px 0 18px;
}

.forgot-link,
.register-link {
  color: #3730a3;
  text-decoration: none;
  font-weight: 800;
  position: relative;
  white-space: nowrap;
  transition: color 0.2s ease;
}

.forgot-link {
  font-size: 12px;
}

.forgot-link::after,
.register-link::after {
  content: '';
  position: absolute;
  left: 0;
  right: 100%;
  bottom: -2px;
  height: 2px;
  border-radius: 99px;
  background: linear-gradient(90deg, #4f46e5, #3b82f6);
  transition: right 0.25s ease;
}

.forgot-link:hover,
.register-link:hover {
  color: #1d4ed8;
}

.forgot-link:hover::after,
.register-link:hover::after {
  right: 0;
}

.submit-btn {
  position: relative;
  overflow: hidden;
  min-height: 56px;
  color: white !important;
  background:
    linear-gradient(135deg, #312e81 0%, #4f46e5 48%, #2563eb 100%) !important;
  transition: transform 0.22s ease, box-shadow 0.22s ease, filter 0.22s ease !important;
  box-shadow:
    0 16px 34px rgba(49, 46, 129, 0.34),
    0 0 0 1px rgba(255, 255, 255, 0.18) inset !important;
}

.submit-btn:hover {
  transform: translateY(-3px) !important;
  filter: saturate(1.08);
  box-shadow:
    0 24px 44px rgba(49, 46, 129, 0.42),
    0 0 0 1px rgba(255, 255, 255, 0.2) inset !important;
}

.submit-btn:active {
  transform: translateY(0) scale(0.99) !important;
}

.btn-glow {
  position: absolute;
  inset: 1px;
  border-radius: inherit;
  background: radial-gradient(circle at 20% 0%, rgba(255, 255, 255, 0.34), transparent 32%);
  pointer-events: none;
}

.btn-text {
  position: relative;
  z-index: 1;
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -75%;
  width: 46%;
  height: 100%;
  background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.32), transparent);
  transform: skewX(-20deg);
  animation: btnShine 3.9s ease-in-out infinite;
}

.divider-line {
  position: relative;
  text-align: center;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 700;
}

.divider-line::before,
.divider-line::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(79, 70, 229, 0.18));
}

.divider-line::before { left: 0; }
.divider-line::after {
  right: 0;
  transform: rotate(180deg);
}

.divider-line span {
  background: rgba(255, 255, 255, 0.82);
  padding: 0 12px;
  position: relative;
}

.register-copy {
  color: #64748b;
  font-size: 14px;
}

.alert-shake {
  animation: shake 0.4s ease;
}

/* ==============================
   BRANDING SIDE
   ============================== */

.branding-side {
  background:
    linear-gradient(145deg, #111827 0%, #1e1b4b 42%, #1e40af 100%);
  position: relative;
  overflow: hidden;
  min-height: 660px;
}

.mesh-gradient {
  position: absolute;
  width: 170%;
  height: 170%;
  background:
    radial-gradient(circle at 18% 30%, rgba(79, 70, 229, 0.78) 0%, transparent 34%),
    radial-gradient(circle at 82% 68%, rgba(37, 99, 235, 0.62) 0%, transparent 34%),
    radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.35) 0%, transparent 42%),
    radial-gradient(circle at 90% 8%, rgba(56, 189, 248, 0.22) 0%, transparent 24%);
  filter: blur(44px);
  animation: meshMove 18s ease infinite alternate;
}

.holo-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
  background-size: 34px 34px;
  transform: perspective(500px) rotateX(58deg) translateY(38%);
  transform-origin: bottom center;
  opacity: 0.55;
  z-index: 1;
}

.scan-lines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.04) 0,
    rgba(255, 255, 255, 0.04) 1px,
    transparent 1px,
    transparent 8px
  );
  opacity: 0.45;
  mix-blend-mode: soft-light;
  pointer-events: none;
  z-index: 2;
}

.particle-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  pointer-events: none;
}

.ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 4;
}

.ring-1 {
  width: 480px;
  height: 480px;
  top: 46%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: ringRotate 28s linear infinite;
}

.ring-2 {
  width: 334px;
  height: 334px;
  top: 46%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-style: dashed;
  border-color: rgba(255, 255, 255, 0.09);
  animation: ringRotate 19s linear infinite reverse;
}

.ring-3 {
  width: 210px;
  height: 210px;
  top: 46%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-color: rgba(250, 204, 21, 0.16);
  animation: ringRotate 13s linear infinite;
}

.logo-aura {
  position: absolute;
  top: calc(50% - 74px);
  left: 50%;
  width: 300px;
  height: 300px;
  transform: translate(-50%, -50%);
  background:
    radial-gradient(circle, rgba(255, 255, 255, 0.22) 0%, rgba(59, 130, 246, 0.12) 38%, transparent 72%);
  border-radius: 48%;
  z-index: 4;
  animation: auraPulse 4.6s ease-in-out infinite;
}

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
  width: 120px;
  top: 18%;
  right: 10%;
  transform: rotate(-18deg);
}

.stream-2 {
  width: 150px;
  bottom: 20%;
  left: 7%;
  transform: rotate(16deg);
}

.branding-content {
  position: relative;
  z-index: 10;
  display: flex;
  width: min(420px, 88%);
  align-items: center;
  flex-direction: column;
  text-align: center;
  color: white;
  padding: 34px 20px;
}

.logo-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 28px;
}

.logo-ring-outer,
.logo-ring-inner {
  position: absolute;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.16);
  top: 50%;
  left: 50%;
}

.logo-ring-outer {
  width: 178px;
  height: 178px;
  transform: translate(-50%, -50%);
  animation: ringRotate 10s linear infinite;
}

.logo-ring-inner {
  width: 158px;
  height: 158px;
  border-style: dashed;
  border-color: rgba(255, 255, 255, 0.14);
  transform: translate(-50%, -50%);
  animation: ringRotate 7s linear infinite reverse;
}

.logo-box {
  background: white;
  box-shadow:
    0 22px 54px rgba(0, 0, 0, 0.36),
    0 0 0 3px rgba(255, 255, 255, 0.16),
    0 0 48px rgba(59, 130, 246, 0.24) !important;
  animation: logoFloat 6s ease-in-out infinite;
  position: relative;
  z-index: 1;
}

.brand-title {
  font-size: 29px;
  line-height: 1.25;
  font-weight: 900;
  letter-spacing: 0;
  text-shadow: 0 2px 22px rgba(0, 0, 0, 0.3);
  animation: textGlow 3s ease-in-out infinite alternate;
}

.brand-subtitle {
  font-size: 15px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.78);
  animation: fadeInUp 0.8s 0.5s ease-out both;
}

.stat-chips {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 22px;
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

/* ==============================
   CYBER HOLO INTERFACE
   (แทนที่ insight-panel เดิม)
   ============================== */

.cyber-holo {
  position: relative;
  width: min(360px, 100%);
  margin-top: 28px;
  padding: 28px 24px 22px;
  border-radius: 22px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.04));
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow:
    0 22px 48px rgba(0, 0, 0, 0.22),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset,
    0 0 60px rgba(99, 102, 241, 0.08) inset;
  backdrop-filter: blur(18px);
  overflow: hidden;
  animation: holoEntrance 0.8s 1.2s ease-out both;
}

/* Animated border glow */
.cyber-holo-border {
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background:
    conic-gradient(
      from var(--border-angle, 0deg),
      transparent 0%,
      rgba(99, 102, 241, 0.6) 10%,
      transparent 20%,
      transparent 50%,
      rgba(56, 189, 248, 0.5) 60%,
      transparent 70%
    );
  z-index: 0;
  animation: borderRotate 6s linear infinite;
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask-composite: xor;
  padding: 1.5px;
}

/* Scanning line */
.cyber-scan-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.8), rgba(56, 189, 248, 0.9), rgba(99, 102, 241, 0.8), transparent);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.4), 0 0 60px rgba(56, 189, 248, 0.2);
  z-index: 5;
  animation: scanDown 3.4s ease-in-out infinite;
  opacity: 0.9;
}

/* Hexagonal frames */
.hex-container {
  position: relative;
  width: 110px;
  height: 110px;
  margin: 0 auto 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hex-frame {
  position: absolute;
  inset: 0;
  clip-path: polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%);
}

.hex-outer-frame {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(56, 189, 248, 0.3));
  animation: hexRotate 12s linear infinite;
}

.hex-outer-frame::after {
  content: '';
  position: absolute;
  inset: 2px;
  clip-path: polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%);
  background: linear-gradient(145deg, rgba(17, 24, 39, 0.95), rgba(30, 27, 75, 0.9));
}

.hex-inner-frame {
  inset: 14px;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.5), rgba(168, 85, 247, 0.4));
  animation: hexRotate 8s linear infinite reverse;
}

.hex-inner-frame::after {
  content: '';
  position: absolute;
  inset: 2px;
  clip-path: polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%);
  background: linear-gradient(145deg, rgba(17, 24, 39, 0.92), rgba(30, 27, 75, 0.88));
}

.hex-core {
  position: relative;
  z-index: 2;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.3), transparent 70%);
  animation: corePulse 2.8s ease-in-out infinite;
}

.hex-core::before {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%);
  animation: coreGlow 2.8s ease-in-out infinite 0.4s;
}

/* Orbiting nodes */
.orbit-ring {
  position: absolute;
  width: 180px;
  height: 180px;
  top: 28px;
  left: 50%;
  transform: translateX(-50%);
  animation: orbitSpin 16s linear infinite;
  z-index: 3;
}

.orbit-node {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: radial-gradient(circle, #818cf8, #6366f1);
  box-shadow: 0 0 12px rgba(99, 102, 241, 0.6), 0 0 24px rgba(99, 102, 241, 0.2);
}

.orbit-node::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 1px solid rgba(129, 140, 248, 0.3);
  animation: nodeRipple 2s ease-out infinite;
}

.node-a { top: -4px; left: 50%; transform: translateX(-50%); }
.node-b { bottom: -4px; left: 50%; transform: translateX(-50%); }
.node-c { left: -4px; top: 50%; transform: translateY(-50%); }
.node-d { right: -4px; top: 50%; transform: translateY(-50%); }

.node-a::after { animation-delay: 0s; }
.node-b::after { animation-delay: 0.5s; }
.node-c::after { animation-delay: 1s; }
.node-d::after { animation-delay: 1.5s; }

/* Status bar */
.cyber-status-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 4px;
}

.cyber-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 8px rgba(52, 211, 153, 0.6);
  animation: dotBlink 2.4s ease-in-out infinite;
}

.cyber-label {
  font-size: 12px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.82);
  letter-spacing: 0.5px;
}

/* Corner accents */
.holo-corner {
  position: absolute;
  width: 18px;
  height: 18px;
  z-index: 4;
}

.holo-corner::before,
.holo-corner::after {
  content: '';
  position: absolute;
  background: rgba(99, 102, 241, 0.5);
}

.holo-corner::before {
  width: 100%;
  height: 2px;
}

.holo-corner::after {
  width: 2px;
  height: 100%;
}

.corner-tl { top: 8px; left: 8px; }
.corner-tl::before { top: 0; left: 0; }
.corner-tl::after { top: 0; left: 0; }

.corner-tr { top: 8px; right: 8px; }
.corner-tr::before { top: 0; right: 0; }
.corner-tr::after { top: 0; right: 0; }

.corner-bl { bottom: 8px; left: 8px; }
.corner-bl::before { bottom: 0; left: 0; }
.corner-bl::after { bottom: 0; left: 0; }

.corner-br { bottom: 8px; right: 8px; }
.corner-br::before { bottom: 0; right: 0; }
.corner-br::after { bottom: 0; right: 0; }

/* ==============================
   /CYBER HOLO INTERFACE
   ============================== */

.status-row {
  display: flex;
  gap: 9px;
  margin-top: 18px;
  flex-wrap: wrap;
  justify-content: center;
}

.status-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.88);
  background: rgba(15, 23, 42, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 12px;
  font-weight: 800;
}

.branding-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 38%, transparent 0%, rgba(15, 23, 42, 0.26) 70%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 22%, rgba(0, 0, 0, 0.16));
  pointer-events: none;
  z-index: 6;
}

/* ==============================
   KEYFRAMES
   ============================== */

@keyframes sweepMove {
  0%, 100% { transform: translateX(-32%) rotate(2deg); opacity: 0.55; }
  50% { transform: translateX(18%) rotate(2deg); opacity: 0.82; }
}

@keyframes auroraFlow {
  from { transform: translate3d(0, 0, 0) scale(1); }
  to { transform: translate3d(48px, 36px, 0) scale(1.08); }
}

@keyframes auroraPulse {
  0%, 100% { transform: scale(1); opacity: 0.48; }
  50% { transform: scale(1.14); opacity: 0.78; }
}

@keyframes markFloat {
  0%, 100% { transform: translateY(0) rotate(-28deg); opacity: 0.22; }
  50% { transform: translateY(-18px) rotate(-28deg); opacity: 0.48; }
}

@keyframes borderShimmer {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes cardEntrance {
  from { opacity: 0; transform: perspective(1300px) translateY(34px) scale(0.97); }
  to { opacity: 1; transform: perspective(1300px) translateY(0) scale(1); }
}

@keyframes badgePulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.46); }
  50% { box-shadow: 0 0 0 7px rgba(59, 130, 246, 0); }
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-22px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes btnShine {
  0% { left: -75%; }
  30% { left: 126%; }
  100% { left: 126%; }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

@keyframes meshMove {
  0% { transform: translate(-22%, -24%) rotate(0deg) scale(1); }
  50% { transform: translate(-14%, -18%) rotate(5deg) scale(1.04); }
  100% { transform: translate(-2%, -2%) rotate(10deg) scale(1.02); }
}

@keyframes ringRotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes auraPulse {
  0%, 100% { opacity: 0.48; scale: 1; }
  50% { opacity: 0.88; scale: 1.2; }
}

@keyframes streamPulse {
  0%, 100% { transform: scaleX(0.42); opacity: 0.26; }
  50% { transform: scaleX(1); opacity: 0.86; }
}

@keyframes logoFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-9px); }
}

@keyframes textGlow {
  from { text-shadow: 0 2px 22px rgba(0, 0, 0, 0.3); }
  to { text-shadow: 0 2px 30px rgba(255, 255, 255, 0.18), 0 0 54px rgba(59, 130, 246, 0.34); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes chipEntrance {
  from { opacity: 0; transform: translateY(10px) scale(0.92); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* Cyber Holo Keyframes */

@keyframes holoEntrance {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.94);
    filter: blur(4px);
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
  10% { opacity: 0.9; }
  90% { opacity: 0.9; }
  100% { top: calc(100% + 2px); opacity: 0; }
}

@keyframes hexRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes corePulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.12); opacity: 1; }
}

@keyframes coreGlow {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.4); opacity: 0.7; }
}

@keyframes orbitSpin {
  from { transform: translateX(-50%) rotate(0deg); }
  to { transform: translateX(-50%) rotate(360deg); }
}

@keyframes nodeRipple {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(2.8); opacity: 0; }
}

@keyframes dotBlink {
  0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(52, 211, 153, 0.6); }
  50% { opacity: 0.4; box-shadow: 0 0 4px rgba(52, 211, 153, 0.2); }
}

/* ==============================
   RESPONSIVE
   ============================== */

@media (max-width: 959px) {
  .auth-layout {
    align-items: flex-start;
    padding: 20px 14px;
    overflow-y: auto;
  }

  .glass-card {
    transform: none !important;
  }

  .form-side {
    min-height: auto;
  }

  .form-side::after {
    inset: 0 18px auto 18px;
    width: auto;
    height: 4px;
  }

  .mobile-brand-strip {
    display: flex;
  }

  .login-title {
    font-size: 32px;
  }

  .mini-metrics {
    grid-template-columns: 1fr;
  }

  .metric-pill {
    justify-content: flex-start;
    padding: 0 14px;
  }
}

@media (max-width: 520px) {
  .auth-layout {
    padding: 12px;
  }

  .form-side {
    padding: 26px 22px !important;
  }

  .form-options {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 18px;
  }

  .divider-line::before,
  .divider-line::after {
    width: 34%;
  }

  .mobile-brand-strip {
    border-radius: 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }

  .glass-card {
    transform: none !important;
  }
}
</style>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'

definePageMeta({ layout: 'auth-login', ssr: false })

const { $api } = useNuxtApp()
const router = useRouter()
const auth = useAuthStore()

const errorMsg = ref('')
const showPw = ref(false)
const rememberMe = ref(false)
const loading = ref(false)
const particleCanvas = ref(null)
const tiltX = ref(0)
const tiltY = ref(0)
const spotX = ref(50)
const spotY = ref(50)

// ===== INTRO SPLASH =====
const showIntro = ref(false)
const introPhase = ref(0)
const progressWidth = ref(0)
const typedText = ref('')
const introCanvas = ref(null)
const glitching = ref(false)

const INTRO_DURATION = 9200   // 9.2 seconds total

// Multiple typewriter messages shown in sequence
const introMessages = [
  'Connecting to secure server...',
  'Authenticating credentials...',
  'Loading personnel database...',
  'System ready.',
]

function skipIntro() {
  sessionStorage.setItem('intro_done', '1')
  showIntro.value = false
}

let introStarAnimId = null

function runIntroStars() {
  const canvas = introCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  let W = canvas.width = window.innerWidth
  let H = canvas.height = window.innerHeight

  // Warp-speed stars — start slow, speed up over 4 sec, then slow
  const STARS = Array.from({ length: 300 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    z: Math.random() * W,
    r: Math.random() * 1.5 + 0.3,
    px: 0, py: 0
  }))

  // Shooting stars pool
  const shooters = []
  function spawnShooter() {
    if (!showIntro.value) return
    shooters.push({
      x: Math.random() * W * 0.8,
      y: Math.random() * H * 0.6,
      len: Math.random() * 180 + 80,
      speed: Math.random() * 12 + 10,
      alpha: 1,
      angle: Math.PI / 6 + (Math.random() - 0.5) * 0.5,
      width: Math.random() * 1.5 + 0.8
    })
    setTimeout(spawnShooter, Math.random() * 2000 + 800)
  }
  spawnShooter()

  let warpSpeed = 0.3
  let frameCount = 0

  const draw = () => {
    frameCount++
    // Speed up from frame 120 to 240 (2-4s), then back down
    if (frameCount > 60 && frameCount < 200)  warpSpeed = Math.min(2.5, warpSpeed + 0.04)
    if (frameCount >= 200 && frameCount < 280) warpSpeed = Math.max(0.5, warpSpeed - 0.06)

    ctx.fillStyle = `rgba(1,8,20,${frameCount < 200 ? 0.15 : 0.22})`
    ctx.fillRect(0, 0, W, H)

    STARS.forEach(s => {
      const cx = W / 2, cy = H / 2
      s.px = (s.x - cx) * (W / s.z) + cx
      s.py = (s.y - cy) * (W / s.z) + cy
      s.z -= warpSpeed
      if (s.z <= 0) { s.z = W; s.x = Math.random() * W; s.y = Math.random() * H }

      const nx = (s.x - cx) * (W / s.z) + cx
      const ny = (s.y - cy) * (W / s.z) + cy
      const size = (1 - s.z / W) * s.r * 3
      const alpha = (1 - s.z / W) * 0.85

      if (warpSpeed > 0.8) {
        // Draw streaks
        ctx.beginPath()
        ctx.moveTo(s.px, s.py)
        ctx.lineTo(nx, ny)
        const streak = ctx.createLinearGradient(s.px, s.py, nx, ny)
        streak.addColorStop(0, `rgba(150,200,255,0)`)
        streak.addColorStop(1, `rgba(200,230,255,${alpha})`)
        ctx.strokeStyle = streak
        ctx.lineWidth = size * 0.6
        ctx.stroke()
      } else {
        ctx.beginPath()
        ctx.arc(nx, ny, Math.max(0.2, size), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200,225,255,${alpha})`
        ctx.fill()
      }
    })

    // Shooting stars
    for (let i = shooters.length - 1; i >= 0; i--) {
      const s = shooters[i]
      ctx.save()
      ctx.globalAlpha = s.alpha
      const tx = s.x - Math.cos(s.angle) * s.len
      const ty = s.y - Math.sin(s.angle) * s.len
      ctx.beginPath()
      ctx.moveTo(s.x, s.y)
      ctx.lineTo(tx, ty)
      const sg = ctx.createLinearGradient(s.x, s.y, tx, ty)
      sg.addColorStop(0, 'rgba(220,240,255,1)')
      sg.addColorStop(0.4, 'rgba(150,200,255,0.6)')
      sg.addColorStop(1, 'rgba(80,140,255,0)')
      ctx.strokeStyle = sg
      ctx.lineWidth = s.width
      ctx.stroke()
      ctx.restore()
      s.x += Math.cos(s.angle) * s.speed
      s.y += Math.sin(s.angle) * s.speed
      s.alpha -= 0.012
      if (s.alpha <= 0) shooters.splice(i, 1)
    }

    introStarAnimId = requestAnimationFrame(draw)
  }
  draw()
}

function startIntroSequence() {
  // Phase 1: logo pop in
  setTimeout(() => { introPhase.value = 1 }, 400)
  // Phase 2: text appear
  setTimeout(() => { introPhase.value = 2 }, 1200)
  // Phase 3: stat chips
  setTimeout(() => { introPhase.value = 3 }, 2800)

  // Glitch effect every ~3 seconds
  const glitchTimes = [3200, 5500, 7800]
  glitchTimes.forEach(t => {
    setTimeout(() => {
      glitching.value = true
      setTimeout(() => { glitching.value = false }, 350)
    }, t)
  })

  // Typewriter sequence — cycle through messages
  const typeMessage = (msgIndex) => {
    if (msgIndex >= introMessages.length) return
    const msg = introMessages[msgIndex]
    typedText.value = ''
    let i = 0
    const t = setInterval(() => {
      if (i < msg.length) {
        typedText.value += msg[i++]
      } else {
        clearInterval(t)
        // Pause then show next message
        setTimeout(() => typeMessage(msgIndex + 1), 900)
      }
    }, msgIndex === 0 ? 50 : 45)
  }
  setTimeout(() => typeMessage(0), 1400)

  // Progress bar over INTRO_DURATION
  const START = Date.now()
  const progInterval = setInterval(() => {
    const elapsed = Date.now() - START
    progressWidth.value = Math.min(100, (elapsed / INTRO_DURATION) * 100)
    if (progressWidth.value >= 100) {
      clearInterval(progInterval)
      sessionStorage.setItem('intro_done', '1')
      setTimeout(() => { showIntro.value = false }, 300)
    }
  }, 40)
}

// ===== END INTRO =====

let animId = 0
let resizeHandler = null
let particles = []

const cardStyle = computed(() => ({
  '--tilt-x': `${tiltX.value}deg`,
  '--tilt-y': `${tiltY.value}deg`,
  '--spot-x': `${spotX.value}%`,
  '--spot-y': `${spotY.value}%`
}))

const handlePointerMove = (event) => {
  if (window.matchMedia('(max-width: 959px)').matches) return
  const card = event.currentTarget.querySelector('.glass-card')
  if (!card) return

  const rect = card.getBoundingClientRect()
  const x = (event.clientX - rect.left) / rect.width
  const y = (event.clientY - rect.top) / rect.height

  spotX.value = Math.round(x * 100)
  spotY.value = Math.round(y * 100)
  tiltX.value = (0.5 - y) * 5
  tiltY.value = (x - 0.5) * 5
}

const handlePointerLeave = () => {
  tiltX.value = 0
  tiltY.value = 0
  spotX.value = 50
  spotY.value = 50
}

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

onMounted(() => {
  // Show intro only once per session
  if (!sessionStorage.getItem('intro_done')) {
    showIntro.value = true
    nextTick(() => {
      runIntroStars()
      startIntroSequence()
    })
  }

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
  if (introStarAnimId) cancelAnimationFrame(introStarAnimId)
  if (animId) cancelAnimationFrame(animId)
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
})

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