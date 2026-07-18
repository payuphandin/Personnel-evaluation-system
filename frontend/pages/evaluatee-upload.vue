<template>
  <div class="eval-upload-page" @mousemove="onMouseMove" ref="pageRef">
    <!-- ===== AMBIENT BACKGROUND ===== -->
    <div class="bg-layer">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
      <div class="mesh-grid"></div>
    </div>
    <div class="cursor-glow" :style="{ left: mouseX + 'px', top: mouseY + 'px' }"></div>

    <v-container class="py-8 relative-content" style="max-width: 1300px">

      <!-- ===== PAGE HEADER ===== -->
      <div class="page-header mb-8 anim-fade-down">
        <div class="header-left">
          <div class="page-icon-wrap">
            <v-icon icon="mdi-folder-upload" size="28" color="white" class="icon-z" />
            <div class="icon-pulse"></div>
          </div>
          <div>
            <h1 class="page-title">ระบบจัดการเอกสารหลักฐาน</h1>
            <p class="page-subtitle">สำหรับการตรวจสอบและประเมินผลแยกตามด้านการปฏิบัติงาน</p>
          </div>
        </div>
        <div class="header-right" v-if="selectedPeriod">
          <div class="stat-chip">
            <div class="stat-icon-wrap">
              <v-icon size="18" color="white">mdi-cloud-check-outline</v-icon>
            </div>
            <div>
              <div class="stat-label">ส่งเอกสารแล้ว</div>
              <div class="stat-value">{{ uploadedCount }} <span class="stat-divider">/</span> {{ evidences.length }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== PERIOD SELECTOR CARD ===== -->
      <div class="neo-card anim-rise-1 mb-7">
        <div class="neo-card-header">
          <div class="neo-card-title-group">
            <div class="neo-icon gradient-sapphire">
              <v-icon icon="mdi-calendar-multiselect" size="18" color="white" />
            </div>
            <div>
              <div class="neo-card-title">เลือกรอบการประเมิน</div>
              <div class="neo-card-sub">เพื่อดูเอกสารและผลการประเมิน</div>
            </div>
          </div>
        </div>
        <v-divider class="neo-divider" />
        <div class="pa-6">
          <v-row align="center">
            <v-col cols="12" md="6">
              <v-select v-model="selectedPeriod" :items="periods" item-title="display_name" item-value="id"
                placeholder="เลือกปีการศึกษา / รอบการประเมิน" prepend-inner-icon="mdi-calendar-search" variant="outlined"
                rounded="xl" color="indigo-darken-2" hide-details @update:modelValue="loadData" density="comfortable" class="neo-input" />
            </v-col>
            <v-col v-if="selectedPeriod" cols="12" md="6">
              <div class="progress-block">
                <div class="progress-info">
                  <div class="progress-label">ภาพรวมการส่งเอกสาร</div>
                  <div class="progress-percent">
                    {{ evidences.length > 0 ? Math.round((uploadedCount / evidences.length) * 100) : 0 }}<span class="percent-sign">%</span>
                  </div>
                </div>
                <div class="progress-bar-wrap">
                  <div class="progress-bar-bg">
                    <div class="progress-bar-fill" :style="{ width: (evidences.length > 0 ? (uploadedCount / evidences.length) * 100 : 0) + '%' }"></div>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </div>
      </div>

      <!-- ===== MAIN CONTENT ===== -->
      <div v-if="selectedPeriod">

        <!-- Alert when period is closed -->
        <v-alert
          v-if="isPeriodClosed"
          type="error"
          variant="tonal"
          class="mb-6 rounded-xl anim-rise-2 font-weight-bold"
          icon="mdi-clock-alert-outline"
        >
          รอบการประเมินนี้ปิดการใช้งานแล้ว หรือเลยกำหนดเวลาการส่งเอกสารหลักฐานแล้ว (ไม่สามารถอัปโหลด แก้ไข หรือลบข้อมูลได้)
        </v-alert>

        <!-- Upload Section Title -->
        <div class="section-badge anim-rise-2 mb-5">
          <v-icon icon="mdi-file-document-edit" size="20" class="me-2" />
          <span>รายการส่งเอกสารแยกตามด้าน</span>
        </div>

        <!-- Expansion Panels for Upload -->
        <v-expansion-panels multiple variant="accordion" class="mb-8 anim-rise-3">
          <v-expansion-panel v-for="(topic, tIdx) in topicGroups" :key="topic.code" class="neo-panel mb-5" elevation="0">
            <v-expansion-panel-title class="pa-5">
              <div class="d-flex align-center w-100">
                <div class="topic-number-wrap" :style="{ background: topic.gradient }">
                  <span>{{ topic.code.replace('TOP', '') }}</span>
                </div>
                <div class="ms-4">
                  <div class="topic-name">{{ topic.name }}</div>
                  <div class="topic-count">{{ getEvidencesByTopic(topic.code).length }} รายการ</div>
                </div>
                <v-spacer />
                <div class="topic-progress-ring" :style="{ '--ring-color': topic.ringColor }">
                  <svg viewBox="0 0 36 36">
                    <path class="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path class="ring-fg" :stroke="topic.ringColor" :stroke-dasharray="getTopicProgress(topic.code) + ', 100'" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <span class="ring-text">{{ getTopicProgress(topic.code) }}%</span>
                </div>
              </div>
            </v-expansion-panel-title>

            <v-expansion-panel-text class="pa-0">
              <v-divider class="neo-divider" />
              <v-data-table :headers="headers" :items="getEvidencesByTopic(topic.code)" class="neo-table" hover
                hide-default-footer :items-per-page="-1" no-data-text="ไม่มีรายการเอกสารในด้านนี้">
                
                <template #item.code="{ value }">
                  <span class="code-chip">{{ value }}</span>
                </template>
                
                <template #item.name_th="{ value }">
                  <span class="evidence-name">{{ value }}</span>
                </template>

                <template #item.file="{ item }">
                  <div v-if="item.uploaded" class="d-flex flex-column gap-2 my-3" style="min-width: 260px;">
                    <v-btn-toggle v-model="item.uploadMode" mandatory color="indigo-accent-2" density="compact" class="elevation-0 rounded-lg border bg-white" disabled>
                      <v-btn value="file" size="small" class="flex-grow-1 font-weight-bold"><v-icon start size="16">mdi-cloud-upload-outline</v-icon> ไฟล์</v-btn>
                      <v-btn value="link" size="small" class="flex-grow-1 font-weight-bold"><v-icon start size="16">mdi-link-variant</v-icon> ลิงก์</v-btn>
                    </v-btn-toggle>
                    <v-text-field v-if="item.uploadMode === 'link'" v-model="item.link_url" readonly density="compact" hide-details variant="outlined" rounded="lg" color="indigo" prepend-inner-icon="mdi-web" append-inner-icon="mdi-content-copy" @click:append-inner="copyToClipboard(item.link_url)" class="neo-input cursor-pointer" />
                    <v-text-field v-else :model-value="item.file_name || 'ไฟล์หลักฐานแนบ'" readonly density="compact" hide-details variant="outlined" rounded="lg" color="indigo" prepend-inner-icon="mdi-file-document-outline" class="neo-input" />
                  </div>
                  <div v-else class="d-flex flex-column gap-2 my-3" style="min-width: 260px;">
                    <v-btn-toggle v-model="item.uploadMode" mandatory color="indigo-accent-2" density="compact" class="elevation-0 rounded-lg border bg-white" :disabled="item.uploaded || isPeriodClosed">
                      <v-btn value="file" size="small" class="flex-grow-1 font-weight-bold"><v-icon start size="16">mdi-cloud-upload-outline</v-icon> ไฟล์</v-btn>
                      <v-btn value="link" size="small" class="flex-grow-1 font-weight-bold"><v-icon start size="16">mdi-link-variant</v-icon> ลิงก์</v-btn>
                    </v-btn-toggle>
                    <v-file-input v-if="item.uploadMode === 'file'" v-model="item.file" density="compact" placeholder="อัปโหลดไฟล์..." hide-details
                      variant="outlined" rounded="lg" accept=".pdf,.jpg,.png,.doc,.docx" color="indigo"
                      prepend-inner-icon="mdi-paperclip" class="neo-input" :disabled="item.uploaded || isPeriodClosed" />
                    <v-text-field v-else v-model="item.link_url" density="compact" placeholder="วางลิงก์ (URL) ที่นี่..." hide-details variant="outlined" rounded="lg" color="indigo" prepend-inner-icon="mdi-web" class="neo-input" :disabled="item.uploaded || isPeriodClosed" />
                  </div>
                </template>

                <template #item.status="{ item }">
                  <div class="status-badge" :class="item.uploaded ? 'status-done' : 'status-pending'">
                    <div class="status-dot"></div>
                    <span>{{ item.uploaded ? 'ส่งแล้ว' : 'รอส่ง' }}</span>
                  </div>
                </template>

                <template #item.action="{ item }">
                  <v-btn v-if="item.uploaded" icon variant="text" color="error" size="small" class="del-btn" @click="deleteFile(item)" :disabled="isPeriodClosed">
                    <v-icon size="20">mdi-trash-can-outline</v-icon>
                    <v-tooltip activator="parent" location="top">ลบข้อมูล</v-tooltip>
                  </v-btn>
                </template>
              </v-data-table>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <!-- Submit Button -->
        <div class="text-center mb-14 anim-rise-4">
          <button class="submit-btn" @click="uploadAll" :disabled="uploadingAll || isPeriodClosed">
            <span class="btn-bg"></span>
            <span class="btn-content">
              <v-progress-circular v-if="uploadingAll" indeterminate size="22" width="2" color="white" class="me-3" />
              <v-icon v-else class="me-2" size="22">mdi-rocket-launch</v-icon>
              ยืนยันการส่งเอกสารทั้งหมดที่เลือก
            </span>
            <span class="btn-shine-sweep"></span>
          </button>
        </div>

        <!-- ===== EVALUATION RESULTS (Card Layout) ===== -->
        <div v-if="evaluationResults.length > 0" class="anim-rise-5">
          <div class="section-badge section-badge-teal mb-6">
            <v-icon icon="mdi-shield-check" size="20" class="me-2" />
            <span>ผลการประเมินจากกรรมการ</span>
          </div>

          <v-row>
            <v-col v-for="(item, idx) in evaluationResults" :key="idx" cols="12" md="6" lg="4">
              <div class="eval-card" :class="{ 'eval-submitted': item.evaluation_result?.status === 'submitted' }" :style="{ animationDelay: (idx * 0.06) + 's' }">
                <!-- Card Header -->
                <div class="eval-card-header">
                  <span class="eval-code">{{ item.code }}</span>
                  <div class="eval-status-dot" :class="item.evaluation_result?.status === 'submitted' ? 'es-done' : 'es-wait'">
                    <v-tooltip activator="parent" location="top">
                      {{ item.evaluation_result?.status === 'submitted' ? 'ประกาศผลแล้ว' : 'รอยืนยัน' }}
                    </v-tooltip>
                  </div>
                </div>

                <!-- Indicator Name -->
                <div class="eval-indicator-name">{{ item.name_th }}</div>

                <!-- People Row -->
                <div class="eval-people">
                  <div class="eval-person">
                    <v-icon size="14" class="me-1" color="blue-grey-lighten-1">mdi-account</v-icon>
                    <span class="person-label">ผู้ถูกประเมิน:</span>
                    <span class="person-name">{{ item.evaluatee_name }}</span>
                  </div>
                  <div class="eval-person">
                    <v-icon size="14" class="me-1" color="blue-grey-lighten-1">mdi-account-tie</v-icon>
                    <span class="person-label">ผู้ประเมิน:</span>
                    <span class="person-name">{{ item.evaluator_name }}</span>
                  </div>
                </div>

                <!-- Result Display -->
                <div class="eval-result-box">
                  <!-- Yes/No Type -->
                  <template v-if="item.type === 'yes_no'">
                    <div v-if="item.evaluation_result?.value_yes_no !== null" class="result-pass-fail" :class="item.evaluation_result.value_yes_no ? 'rf-pass' : 'rf-fail'">
                      <v-icon size="20" class="me-2">{{ item.evaluation_result.value_yes_no ? 'mdi-check-circle' : 'mdi-close-circle' }}</v-icon>
                      {{ item.evaluation_result.value_yes_no ? 'ผ่านเกณฑ์' : 'ปรับปรุง' }}
                    </div>
                    <div v-else class="result-waiting">
                      <v-icon size="18" class="me-1">mdi-clock-outline</v-icon> รอการประเมิน
                    </div>
                  </template>
                  <!-- Score Type -->
                  <template v-else>
                    <div v-if="item.evaluation_result?.score !== null" class="result-score-wrap">
                      <div class="score-number">{{ item.evaluation_result.score }}</div>
                      <div class="score-bar-track">
                        <div class="score-bar-fill" :style="{ width: (Number(item.evaluation_result.score) / 4 * 100) + '%' }"></div>
                      </div>
                      <div class="score-max">/ 4</div>
                    </div>
                    <div v-else class="result-waiting">
                      <v-icon size="18" class="me-1">mdi-clock-outline</v-icon> รอการประเมิน
                    </div>
                  </template>
                </div>

                <!-- Notes -->
                <div class="eval-notes" v-if="item.evaluation_result?.notes">
                  <v-icon size="14" class="me-1" color="indigo-lighten-2">mdi-comment-text-outline</v-icon>
                  <span>{{ item.evaluation_result.notes }}</span>
                </div>
                <div class="eval-notes eval-notes-empty" v-else>
                  <v-icon size="14" class="me-1">mdi-comment-off-outline</v-icon>
                  <span>ไม่มีข้อเสนอแนะ</span>
                </div>
              </div>
            </v-col>
          </v-row>
        </div>
      </div>

      <!-- ===== EMPTY STATE ===== -->
      <div v-else class="empty-state anim-rise-2">
        <div class="empty-visual">
          <div class="empty-orbit o1"></div>
          <div class="empty-orbit o2"></div>
          <div class="empty-core">
            <v-icon size="44" color="indigo-lighten-1">mdi-satellite-variant</v-icon>
          </div>
        </div>
        <h3 class="empty-title mt-8">กรุณาเลือกรอบการประเมิน</h3>
        <p class="empty-sub">เลือกปีการศึกษาด้านบน เพื่อเริ่มต้นการทำงานและดูข้อมูลการประเมิน</p>
      </div>

    </v-container>

    <!-- Toast Notification -->
    <v-snackbar v-model="toast.show" :color="toast.color" :timeout="3000" location="top right" rounded="pill" elevation="12" class="mt-4 me-4">
      <div class="d-flex align-center">
        <v-icon :icon="toast.icon" class="me-3" size="22"></v-icon>
        <span class="text-body-1 font-weight-bold text-white">{{ toast.text }}</span>
      </div>
    </v-snackbar>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800;900&display=swap');
* { font-family: 'Prompt', sans-serif !important; }

/* ===== PAGE BASE ===== */
.eval-upload-page {
  min-height: 100vh; position: relative; overflow: hidden;
  background: #ffffff;
}
.relative-content { position: relative; z-index: 2; }

/* ===== ANIMATED BACKGROUND ===== */
.bg-layer { position: absolute; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.orb {
  position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.15;
  animation: orbFloat 20s ease-in-out infinite;
}
.orb-1 { width: 600px; height: 600px; top: -150px; left: -100px; background: #818cf8; }
.orb-2 { width: 500px; height: 500px; bottom: -100px; right: -80px; background: #22d3ee; animation-delay: -7s; animation-duration: 25s; }
.orb-3 { width: 350px; height: 350px; top: 40%; left: 50%; background: #c084fc; animation-delay: -14s; animation-duration: 18s; }
@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(40px, -30px) scale(1.1); }
  66% { transform: translate(-30px, 20px) scale(0.95); }
}
.mesh-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px);
  background-size: 60px 60px;
}
.cursor-glow {
  position: absolute; width: 400px; height: 400px; border-radius: 50%; pointer-events: none; z-index: 1;
  background: radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%);
  transform: translate(-50%, -50%); transition: left 0.3s ease, top 0.3s ease;
}

/* ===== PAGE HEADER ===== */
.page-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
.header-left { display: flex; align-items: center; gap: 18px; }
.page-icon-wrap {
  width: 58px; height: 58px; border-radius: 18px; position: relative;
  background: linear-gradient(135deg, #312e81, #6366f1);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 30px rgba(99,102,241,0.3);
}
.icon-z { position: relative; z-index: 2; }
.icon-pulse {
  position: absolute; inset: -6px; border-radius: 22px; z-index: 0;
  background: linear-gradient(135deg, #312e81, #6366f1);
  animation: iconPulse 3s ease-in-out infinite; opacity: 0;
}
@keyframes iconPulse {
  0%, 100% { opacity: 0; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(1.15); }
}
.page-title { font-size: 26px; font-weight: 800; color: #1e1b4b; letter-spacing: -0.3px; line-height: 1.2; }
.page-subtitle { font-size: 13px; color: #475569; margin: 2px 0 0; font-weight: 400; }

.stat-chip {
  display: flex; align-items: center; gap: 12px;
  background: rgba(99,102,241,0.06); border: 1px solid rgba(99,102,241,0.15);
  border-radius: 16px; padding: 10px 18px;
  backdrop-filter: blur(12px);
}
.stat-icon-wrap {
  width: 36px; height: 36px; border-radius: 10px;
  background: linear-gradient(135deg, #4f46e5, #06b6d4);
  display: flex; align-items: center; justify-content: center;
}
.stat-label { font-size: 11px; color: #475569; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
.stat-value { font-size: 20px; font-weight: 800; color: #312e81; line-height: 1; }
.stat-divider { color: #6366f1; font-weight: 400; margin: 0 2px; }

/* ===== NEO CARD (Period Selector) ===== */
.neo-card {
  background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(24px) saturate(150%);
  border: 1px solid rgba(99,102,241,0.12); border-radius: 24px;
  box-shadow: 0 8px 30px rgba(99,102,241,0.04), inset 0 1px 0 rgba(255,255,255,0.6);
  overflow: hidden;
}
.neo-card-header { padding: 20px 24px; display: flex; align-items: center; }
.neo-card-title-group { display: flex; align-items: center; gap: 14px; }
.neo-icon {
  width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.gradient-sapphire { background: linear-gradient(135deg, #1e40af, #38bdf8); box-shadow: 0 4px 15px rgba(56,189,248,0.2); }
.neo-card-title { font-size: 17px; font-weight: 800; color: #1e1b4b; }
.neo-card-sub { font-size: 12px; color: #475569; font-weight: 400; }
.neo-divider { border-color: rgba(99,102,241,0.08) !important; }

.neo-input :deep(.v-field) {
  background: #ffffff !important; border-radius: 14px !important;
  border-color: rgba(99,102,241,0.15) !important; color: #1e293b !important;
  transition: all 0.3s;
}
.neo-input :deep(.v-field:hover), .neo-input :deep(.v-field--focused) {
  background: #ffffff !important;
  border-color: rgba(99,102,241,0.4) !important;
  box-shadow: 0 0 20px rgba(99,102,241,0.06) !important;
}
.neo-input :deep(.v-field input), .neo-input :deep(.v-field .v-select__selection-text) { color: #1e293b !important; }
.neo-input :deep(.v-field input::placeholder) { color: #94a3b8 !important; }
.neo-input :deep(.v-icon) { color: #4f46e5 !important; }

/* ===== PROGRESS BLOCK ===== */
.progress-block { display: flex; align-items: center; gap: 20px; justify-content: flex-end; }
.progress-info { text-align: right; }
.progress-label { font-size: 11px; font-weight: 700; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.5px; }
.progress-percent { font-size: 36px; font-weight: 900; color: #312e81; line-height: 1; }
.percent-sign { font-size: 18px; color: #6366f1; }
.progress-bar-wrap { width: 200px; }
.progress-bar-bg { height: 10px; border-radius: 99px; background: rgba(99,102,241,0.08); overflow: hidden; }
.progress-bar-fill {
  height: 100%; border-radius: 99px;
  background: linear-gradient(90deg, #4f46e5, #06b6d4);
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 12px rgba(99,102,241,0.2);
}

/* ===== SECTION BADGE ===== */
.section-badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(99,102,241,0.06); border: 1px solid rgba(99,102,241,0.15);
  border-radius: 99px; padding: 8px 20px;
  font-size: 15px; font-weight: 700; color: #4f46e5;
}
.section-badge-teal {
  background: rgba(20,184,166,0.06); border-color: rgba(20,184,166,0.15);
  color: #0d9488;
}
.section-badge-teal .v-icon { color: #0d9488 !important; }

/* ===== EXPANSION PANELS ===== */
.neo-panel {
  background: rgba(255, 255, 255, 0.7) !important; backdrop-filter: blur(16px) !important;
  border: 1px solid rgba(99,102,241,0.1) !important; border-radius: 20px !important;
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
}
.neo-panel:hover {
  border-color: rgba(99,102,241,0.22) !important;
  box-shadow: 0 8px 30px rgba(99,102,241,0.06) !important;
}
.neo-panel :deep(.v-expansion-panel-title__icon) {
  color: #4f46e5 !important;
}

.topic-number-wrap {
  width: 46px; height: 46px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 900; color: white;
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}
.topic-name { font-size: 15px; font-weight: 700; color: #1e1b4b; }
.topic-count { font-size: 12px; color: #64748b; font-weight: 500; }

/* Topic Progress Ring */
.topic-progress-ring { width: 48px; height: 48px; position: relative; }
.topic-progress-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.ring-bg { fill: none; stroke: rgba(99,102,241,0.08); stroke-width: 3; }
.ring-fg { fill: none; stroke-width: 3; stroke-linecap: round; transition: stroke-dasharray 0.8s ease; }
.ring-text {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 800; color: #4f46e5;
}

/* ===== NEO TABLE ===== */
.neo-table { background: transparent !important; }
.neo-table :deep(.v-data-table__thead th) {
  font-size: 12px !important; font-weight: 800 !important; color: #4f46e5 !important;
  background: rgba(99,102,241,0.04) !important; padding: 14px 16px !important;
  border-bottom: 1px solid rgba(99,102,241,0.08) !important;
  text-transform: uppercase; letter-spacing: 0.3px;
}
.neo-table :deep(td) {
  padding: 14px 16px !important; border-bottom: 1px solid rgba(99,102,241,0.05) !important;
  color: #334155 !important;
}
.neo-table :deep(tr:hover td) { background: rgba(99,102,241,0.03) !important; }

.code-chip {
  display: inline-block; background: rgba(99,102,241,0.08); color: #4f46e5;
  font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 8px;
  border: 1px solid rgba(99,102,241,0.15);
}
.evidence-name { font-weight: 600; color: #334155; }

/* Status Badge */
.status-badge {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 5px 14px; border-radius: 99px; font-size: 12px; font-weight: 700;
}
.status-done { background: rgba(5, 150, 105, 0.08); color: #059669; border: 1px solid rgba(5, 150, 105, 0.18); }
.status-pending { background: rgba(217, 119, 6, 0.08); color: #d97706; border: 1px solid rgba(217, 119, 6, 0.18); }
.status-dot { width: 7px; height: 7px; border-radius: 50%; }
.status-done .status-dot { background: #059669; box-shadow: 0 0 8px rgba(5, 150, 105, 0.3); }
.status-pending .status-dot { background: #d97706; }

.del-btn { transition: all 0.2s !important; }
.del-btn:hover { transform: scale(1.15) rotate(8deg) !important; background: rgba(239,68,68,0.08) !important; }

/* ===== SUBMIT BUTTON ===== */
.submit-btn {
  position: relative; display: inline-flex; align-items: center; justify-content: center;
  padding: 18px 48px; border: none; border-radius: 99px; cursor: pointer;
  font-size: 16px; font-weight: 800; color: white; overflow: hidden;
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  font-family: 'Prompt', sans-serif;
}
.submit-btn:hover { transform: translateY(-4px) scale(1.02); }
.submit-btn:active { transform: translateY(-1px) scale(0.99); }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.btn-bg {
  position: absolute; inset: 0; border-radius: 99px;
  background: linear-gradient(135deg, #312e81, #4f46e5, #7c3aed);
  background-size: 200% 200%; animation: gradientShift 4s ease infinite;
  box-shadow: 0 10px 40px rgba(79,70,229,0.3);
}
@keyframes gradientShift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
.btn-content { position: relative; z-index: 2; display: flex; align-items: center; }
.btn-shine-sweep {
  position: absolute; top: 0; left: -100%; width: 60%; height: 100%; z-index: 3;
  background: linear-gradient(120deg, transparent, rgba(255,255,255,0.2), transparent);
  transform: skewX(-20deg); animation: shineSweep 4s ease-in-out infinite;
}
@keyframes shineSweep { 0%,100% { left: -100%; } 30% { left: 200%; } }

/* ===== EVALUATION RESULT CARDS ===== */
.eval-card {
  background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(16px);
  border: 1px solid rgba(99,102,241,0.1); border-radius: 20px;
  padding: 22px; position: relative; overflow: hidden;
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  box-shadow: 0 6px 24px rgba(99,102,241,0.02);
  animation: cardReveal 0.5s ease-out both;
}
.eval-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent);
  opacity: 0; transition: opacity 0.3s;
}
.eval-card:hover {
  border-color: rgba(99,102,241,0.22);
  box-shadow: 0 12px 40px rgba(99,102,241,0.06);
  transform: translateY(-4px);
}
.eval-card:hover::before { opacity: 1; }
.eval-submitted { border-color: rgba(20,184,166,0.18); }
.eval-submitted::before { background: linear-gradient(90deg, transparent, rgba(20,184,166,0.3), transparent); }

@keyframes cardReveal {
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.eval-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.eval-code {
  display: inline-block; background: rgba(99,102,241,0.08); color: #4f46e5;
  font-weight: 800; font-size: 11px; padding: 4px 12px; border-radius: 8px;
  border: 1px solid rgba(99,102,241,0.15); letter-spacing: 0.3px;
}
.eval-status-dot {
  width: 10px; height: 10px; border-radius: 50%;
  transition: all 0.3s;
}
.es-done { background: #059669; box-shadow: 0 0 10px rgba(5, 150, 105, 0.4); }
.es-wait { background: #94a3b8; }

.eval-indicator-name { font-size: 14px; font-weight: 700; color: #1e1b4b; margin-bottom: 14px; line-height: 1.5; }

.eval-people { margin-bottom: 14px; display: flex; flex-direction: column; gap: 4px; }
.eval-person { display: flex; align-items: center; font-size: 12px; color: #64748b; }
.person-label { margin-right: 4px; font-weight: 500; }
.person-name { font-weight: 700; color: #475569; }

/* Result Box */
.eval-result-box {
  background: rgba(99,102,241,0.03); border: 1px solid rgba(99,102,241,0.06);
  border-radius: 14px; padding: 14px 16px; margin-bottom: 12px;
}
.result-pass-fail {
  display: flex; align-items: center; font-weight: 800; font-size: 14px; border-radius: 10px; padding: 8px 14px;
}
.rf-pass { background: rgba(5, 150, 105, 0.08); color: #059669; border: 1px solid rgba(5, 150, 105, 0.18); }
.rf-fail { background: rgba(220, 38, 38, 0.08); color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.18); }

.result-score-wrap { display: flex; align-items: center; gap: 12px; }
.score-number { font-size: 28px; font-weight: 900; color: #1e1b4b; line-height: 1; min-width: 36px; }
.score-bar-track {
  flex: 1; height: 8px; border-radius: 99px;
  background: rgba(99,102,241,0.08); overflow: hidden;
}
.score-bar-fill {
  height: 100%; border-radius: 99px;
  background: linear-gradient(90deg, #4f46e5, #818cf8);
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 10px rgba(99,102,241,0.2);
}
.score-max { font-size: 14px; color: #94a3b8; font-weight: 600; }

.result-waiting {
  display: flex; align-items: center; color: #64748b; font-size: 13px; font-weight: 600; font-style: italic;
}

/* Notes */
.eval-notes { font-size: 12px; color: #4f46e5; display: flex; align-items: flex-start; gap: 4px; line-height: 1.5; }
.eval-notes-empty { color: #94a3b8; font-style: italic; }

/* ===== EMPTY STATE ===== */
.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 35px; text-align: center;
}
.empty-visual { position: relative; width: 140px; height: 140px; }
.empty-core {
  position: absolute; inset: 30px; border-radius: 50%;
  background: rgba(99,102,241,0.05); display: flex; align-items: center; justify-content: center;
}
.empty-orbit {
  position: absolute; border-radius: 50%; border: 1.5px solid rgba(99,102,241,0.1);
}
.o1 { inset: 0; animation: orbitSpin 8s linear infinite; }
.o2 { inset: -20px; border-style: dashed; border-color: rgba(99,102,241,0.06); animation: orbitSpin 12s linear infinite reverse; }
@keyframes orbitSpin { to { transform: rotate(360deg); } }
.empty-title { font-size: 22px; font-weight: 800; color: #1e1b4b; }
.empty-sub { font-size: 14px; color: #64748b; max-width: 400px; }

/* ===== ANIMATIONS ===== */
.anim-fade-down { animation: fadeDown 0.6s ease-out both; }
.anim-rise-1 { animation: riseUp 0.6s 0.1s ease-out both; }
.anim-rise-2 { animation: riseUp 0.6s 0.15s ease-out both; }
.anim-rise-3 { animation: riseUp 0.6s 0.2s ease-out both; }
.anim-rise-4 { animation: riseUp 0.6s 0.25s ease-out both; }
.anim-rise-5 { animation: riseUp 0.6s 0.3s ease-out both; }
@keyframes fadeDown { from { opacity: 0; transform: translateY(-15px); } to { opacity: 1; transform: translateY(0); } }
@keyframes riseUp { from { opacity: 0; transform: translateY(25px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
</style>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const { $api } = useNuxtApp()

// Mouse tracking
const pageRef = ref(null)
const mouseX = ref(0)
const mouseY = ref(0)
function onMouseMove(e) { mouseX.value = e.clientX; mouseY.value = e.clientY; }

// --- State Management ---
const periods = ref([])
const selectedPeriod = ref(null)
const evidences = ref([]) 
const evaluationResults = ref([]) 
const uploadingAll = ref(false)

// Toast
const toast = ref({ show: false, text: '', color: 'success', icon: 'mdi-check-circle' })
function showToast(text, type = 'success') {
  toast.value.text = text
  toast.value.color = type === 'success' ? 'teal-darken-1' : (type === 'error' ? 'red-darken-2' : 'indigo-darken-1')
  toast.value.icon = type === 'success' ? 'mdi-check-circle' : (type === 'error' ? 'mdi-alert-circle' : 'mdi-information')
  toast.value.show = true
}

const topicGroups = [
  { code: 'TOP1', name: 'ด้านที่ 1 การจัดการเรียนรู้', gradient: 'linear-gradient(135deg, #312e81, #6366f1)', ringColor: '#818cf8' },
  { code: 'TOP2', name: 'ด้านที่ 2 การบริหารจัดการชั้นเรียน', gradient: 'linear-gradient(135deg, #134e4a, #14b8a6)', ringColor: '#2dd4bf' },
  { code: 'TOP3', name: 'ด้านที่ 3 การพัฒนาตนเองและวิชาชีพ', gradient: 'linear-gradient(135deg, #581c87, #a855f7)', ringColor: '#c084fc' },
  { code: 'TOP4', name: 'ด้านที่ 4 ภาระงานอื่นๆ', gradient: 'linear-gradient(135deg, #7c2d12, #f97316)', ringColor: '#fb923c' }
]

const headers = [
  { title: 'รหัส', key: 'code', width: '80px', sortable: false },
  { title: 'รายการเอกสารหลักฐาน', key: 'name_th', sortable: false },
  { title: 'สถานะ', key: 'status', width: '130px', sortable: false },
  { title: 'แนบเอกสาร (ไฟล์ / ลิงก์)', key: 'file', width: '320px', sortable: false },
  { title: '', key: 'action', width: '56px', align: 'center', sortable: false }
]

// --- Computed Properties ---
const uploadedCount = computed(() => evidences.value.filter(e => e.uploaded).length)

const isPeriodClosed = computed(() => {
  const p = periods.value.find(x => x.id === selectedPeriod.value);
  return p ? p.is_closed : false;
})

function getTopicProgress(topicCode) {
  const items = getEvidencesByTopic(topicCode)
  if (items.length === 0) return 0
  return Math.round(items.filter(i => i.uploaded).length / items.length * 100)
}

// --- Logic Functions ---

async function loadPeriods() {
  try {
    const token = localStorage.getItem("auth_token");
    const { data } = await $api.get('/api/evaluatee/periods-list', {
      headers: { Authorization: `Bearer ${token}` }
    })
    periods.value = data.map(p => {
      const now = new Date();
      const isClosed = p.is_active === 0 || (p.start_date && now < new Date(p.start_date)) || (p.end_date && now > new Date(p.end_date));
      return {
        ...p,
        is_closed: isClosed,
        display_name: isClosed ? `${p.name_th} (ปิดใช้งาน)` : p.name_th
      }
    })
  } catch (e) {
    if (e.response?.status === 401) { localStorage.clear(); router.push('/login') }
  }
}

async function loadData() {
  if (!selectedPeriod.value) return
  await Promise.all([ loadEvidences(), loadEvaluationResults() ])
}

async function loadEvidences() {
  try {
    const token = localStorage.getItem("auth_token");
    const { data } = await $api.get('/api/evaluatee/evidence-list', {
      params: { period_id: selectedPeriod.value },
      headers: { Authorization: `Bearer ${token}` }
    })

    evidences.value = data.map(e => {
      let assignedTopic = '';
      
      if (e.topic_code) {
        assignedTopic = e.topic_code;
      } else if (e.topic_id) {
        assignedTopic = `TOP${e.topic_id}`;
      } else {
        const codeStr = String(e.code || '');
        if (codeStr.startsWith('T1') || codeStr.includes('T1') || codeStr.includes('ด้านที่ 1')) {
          assignedTopic = 'TOP1';
        } else if (codeStr.startsWith('T2') || codeStr.includes('T2') || codeStr.includes('ด้านที่ 2')) {
          assignedTopic = 'TOP2';
        } else if (codeStr.startsWith('T3') || codeStr.includes('T3') || codeStr.includes('ด้านที่ 3')) {
          assignedTopic = 'TOP3';
        } else if (codeStr.startsWith('T4') || codeStr.includes('T4') || codeStr.includes('ด้านที่ 4')) {
          assignedTopic = 'TOP4';
        } else {
          const id = parseInt(e.indicator_id);
          if (id >= 1 && id <= 5) assignedTopic = 'TOP1';
          else if (id >= 6 && id <= 9) assignedTopic = 'TOP2';
          else if (id >= 10 && id <= 14) assignedTopic = 'TOP3';
          else if (id >= 15 && id <= 17) assignedTopic = 'TOP4';
          else assignedTopic = 'TOP1';
        }
      }

      const isLink = e.attachment_type === 'link' || (e.storage_path && e.storage_path.startsWith('http'));

      return {
        ...e,
        topic_code: assignedTopic,
        file: null,
        link_url: isLink ? e.storage_path : '',
        uploadMode: isLink ? 'link' : 'file',
        uploaded: !!e.uploaded,
        file_name: e.file_name || null,
        id: e.attachment_id
      }
    })
  } catch (e) { console.error("Evidence Load failed:", e) }
}

function copyToClipboard(text) {
  if (!text) return;
  navigator.clipboard.writeText(text)
    .then(() => showToast("คัดลอกลิงก์เรียบร้อยแล้ว!", "success"))
    .catch(() => showToast("ไม่สามารถคัดลอกลิงก์ได้", "error"));
}

async function loadEvaluationResults() {
  try {
    const token = localStorage.getItem("auth_token");
    const { data } = await $api.get('/api/evaluatee/evaluation_result', {
      params: { period_id: selectedPeriod.value },
      headers: { Authorization: `Bearer ${token}` }
    });
    evaluationResults.value = data; 
  } catch (e) { console.error("Evaluation Results Load failed:", e); }
}

function getEvidencesByTopic(topicCode) {
  return evidences.value.filter(e => e.topic_code === topicCode)
}

async function uploadAll() {
  const pending = evidences.value.filter(item => 
    ((item.uploadMode === 'file' && item.file) || (item.uploadMode === 'link' && item.link_url)) && !item.uploaded
  );

  if (pending.length === 0) return showToast("ไม่พบไฟล์หรือลิงก์ที่รอการอัปโหลด", "info");
  
  uploadingAll.value = true;
  const token = localStorage.getItem("auth_token");
  
  try {
    for (const item of pending) {
      const fd = new FormData();
      fd.append("period_id", selectedPeriod.value);
      fd.append("indicator_id", item.indicator_id);
      fd.append("evidence_type_id", item.evidence_type_id);
      fd.append("upload_mode", item.uploadMode); 

      if (item.uploadMode === 'file') {
        fd.append("file", item.file);
      } else {
        fd.append("link_url", item.link_url);
      }

      if (item.id) {
        await $api.put(`/api/upload/${item.id}/file`, fd, {
          headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}` }
        });
      } else {
        await $api.post("/api/upload/upload_evidence", fd, {
          headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}` }
        });
      }
    }
    showToast("ดำเนินการส่งเอกสาร/ลิงก์สำเร็จ", "success");
    await loadData();
  } catch (e) { 
    showToast("การอัปโหลดขัดข้อง", "error");
  }
  finally { uploadingAll.value = false; }
}

async function deleteFile(item) {
  if (!confirm(`ยืนยันการลบข้อมูล: ${item.file_name || 'ลิงก์ที่แนบ'}?`)) return;
  try {
    const token = localStorage.getItem("auth_token");
    await $api.delete(`/api/upload/${item.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    showToast("ลบข้อมูลสำเร็จ", "success");
    await loadData();
  } catch (e) { 
    showToast("ลบไม่สำเร็จ", "error");
  }
}

onMounted(async () => {
  if (!localStorage.getItem("auth_token")) { router.push('/'); return }
  await loadPeriods()
})
</script>
