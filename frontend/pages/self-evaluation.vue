<template>
  <div class="self-assessment-page">
    <div class="blob-1"></div>
    <div class="blob-2"></div>
    <div class="blob-3"></div>

    <v-container class="py-8 relative-content" style="max-width: 1400px">
      <div class="page-header mb-8 anim-1">
        <div class="header-left">
          <div
            class="page-icon-wrap"
            style="background: linear-gradient(135deg, #059669, #10b981)"
          >
            <v-icon icon="mdi-clipboard-list" size="26" color="white" />
          </div>
          <div>
            <h1 class="page-title">ประเมินตนเอง (Self-Assessment)</h1>
            <p class="page-subtitle">
              {{ currentPeriodName }}
              <v-chip
                v-if="selectedPeriod"
                size="x-small"
                :color="assessmentStatus === 'submitted' ? 'info' : 'success'"
                class="ms-2 font-weight-bold"
              >
                {{
                  assessmentStatus === "submitted"
                    ? "ส่งผลแล้ว"
                    : "กำลังเปิดรับข้อมูล/ฉบับร่าง"
                }}
              </v-chip>
            </p>
          </div>
        </div>
        <div class="header-actions" v-if="selectedPeriod && topics.length > 0">
          <div class="overall-progress shadow-sm">
            <v-progress-circular
              :model-value="overallProgress"
              color="teal-darken-2"
              size="32"
              width="4"
              class="me-3"
            >
              <span class="text-caption font-weight-black"
                >{{ overallProgress }}%</span
              >
            </v-progress-circular>
            <div>
              <div
                class="text-caption text-blue-grey-darken-1 font-weight-bold text-uppercase line-height-1"
              >
                ความคืบหน้า
              </div>
              <div
                class="text-subtitle-2 font-weight-black text-teal-darken-4 line-height-1 mt-1"
              >
                {{ totalAnswered }} / {{ indicators.length }} ข้อ
              </div>
            </div>
          </div>
          <v-btn
            color="blue-grey-darken-1"
            rounded="xl"
            size="large"
            class="ms-4 px-6 font-weight-black submit-btn shadow-teal"
            :disabled="assessmentStatus === 'submitted'"
            @click="saveDraft"
          >
            <v-icon start>mdi-content-save</v-icon>
            บันทึกร่าง
          </v-btn>

          <v-btn
            color="teal-darken-3"
            rounded="xl"
            size="large"
            class="ms-2 px-6 font-weight-black submit-btn shadow-teal"
            :disabled="assessmentStatus === 'submitted'"
            @click="openSignatureDialog"
          >
            <v-icon start>mdi-draw-pen</v-icon>
            ยืนยันผลและลงนาม
          </v-btn>
        </div>
      </div>

      <div
        class="section-card anim-1 mb-6 glass-card border rounded-xl shadow-md pa-5"
      >
        <v-row align="center">
          <v-col cols="12" md="6">
            <v-select
              v-model="selectedPeriod"
              :items="periods"
              item-title="name_th"
              item-value="id"
              placeholder="เลือกปีการศึกษา / รอบการประเมิน"
              prepend-inner-icon="mdi-calendar-search"
              variant="outlined"
              rounded="lg"
              color="indigo-darken-2"
              hide-details
              @update:modelValue="loadAssessmentData"
              density="comfortable"
            />
          </v-col>
          <v-col
            v-if="!selectedPeriod"
            cols="12"
            md="6"
            class="text-md-right text-grey font-italic"
          >
            กรุณาเลือกรอบการประเมินก่อนเริ่มทำรายการ
          </v-col>
        </v-row>
      </div>

      <v-row v-if="selectedPeriod && topics.length > 0">
        <v-col cols="12" md="4" lg="3">
          <div class="sticky-sidebar anim-2">
            <v-card
              border
              rounded="xl"
              class="glass-card overflow-hidden shadow-md"
            >
              <div class="sidebar-header pa-5">
                <h3 class="text-h6 font-weight-black text-white line-height-1">
                  หัวข้อการประเมิน
                </h3>
                <p class="text-caption text-indigo-lighten-4 mb-0 mt-1">
                  เลือกหัวข้อเพื่อประเมินตนเอง
                </p>
              </div>

              <v-list class="bg-transparent pa-2">
                <div
                  v-for="(topic, index) in topics"
                  :key="topic.id"
                  class="topic-item"
                  :class="{ 'topic-active': activeTopicId === topic.id }"
                  @click="activeTopicId = topic.id"
                >
                  <div class="topic-item-bg"></div>

                  <div class="d-flex align-center w-100 relative-z">
                    <v-avatar
                      :color="
                        activeTopicId === topic.id
                          ? 'indigo-darken-2'
                          : 'indigo-lighten-5'
                      "
                      size="36"
                      class="me-3 shadow-sm transition-all font-weight-black"
                      :class="
                        activeTopicId === topic.id
                          ? 'text-white'
                          : 'text-indigo-darken-2'
                      "
                    >
                      {{ index + 1 }}
                    </v-avatar>
                    <div class="flex-1-1">
                      <div
                        class="topic-title line-height-1 mb-1"
                        :class="
                          activeTopicId === topic.id
                            ? 'text-indigo-darken-4 font-weight-black'
                            : 'text-blue-grey-darken-2 font-weight-bold'
                        "
                      >
                        {{ topic.title_th }}
                      </div>
                      <v-progress-linear
                        :model-value="getTopicProgress(topic.id)"
                        color="success"
                        height="4"
                        rounded
                        bg-color="blue-grey-lighten-4"
                      ></v-progress-linear>
                    </div>
                  </div>
                </div>
              </v-list>
            </v-card>

            <!-- SIGNATURE DISPLAY -->
            <div
              v-if="assessmentStatus === 'submitted' && signatureUrl"
              class="signature-display-section mt-6 stagger-4"
            >
              <div class="cyber-sig-card">
                <div class="card-glow-success"></div>
                <div class="d-flex align-center gap-4 mb-4 relative-z">
                  <v-icon size="28" color="success">mdi-check-decagram</v-icon>
                  <h3 class="text-subtitle-1 font-weight-black text-indigo-darken-4 mb-0">
                    ยืนยันผลการประเมินแล้ว
                  </h3>
                </div>

                <div class="sig-box relative-z">
                  <img
                    :src="signatureUrl"
                    class="sig-img"
                    alt="ลายเซ็นผู้ประเมิน"
                  />
                </div>

                <div class="sig-details relative-z mt-4 text-center">
                  <p class="font-weight-bold text-indigo-darken-4 mb-1">
                    ลงนามโดยคุณครู:
                  </p>
                  <p class="font-weight-black text-teal-darken-4 mb-0">
                    {{ userName }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </v-col>

        <v-col cols="12" md="8" lg="9">
          <div class="anim-3">
            <v-fade-transition mode="out-in">
              <div :key="activeTopicId" v-if="activeTopic">
                <div class="topic-header-card mb-6 pa-6">
                  <div class="topic-header-bg"></div>
                  <div class="relative-z d-flex align-center">
                    <div class="topic-icon-wrap me-4">
                      <v-icon size="30" color="white"
                        >mdi-format-list-checks</v-icon
                      >
                    </div>
                    <div>
                      <h2
                        class="text-h5 font-weight-black text-indigo-darken-4 mb-1"
                      >
                        {{ activeTopic.title_th }}
                      </h2>
                    </div>
                  </div>
                </div>

                <div
                  v-for="ind in currentIndicators"
                  :key="ind.indicator_id"
                  class="indicator-card mb-5"
                >
                  <div
                    class="indicator-accent"
                    :class="
                      isAnswered(ind.indicator_id)
                        ? 'bg-success'
                        : 'bg-grey-lighten-1'
                    "
                  ></div>

                  <div class="pa-5 pa-md-6">
                    <div class="d-flex align-start mb-4">
                      <div class="ind-code-badge me-3">
                        {{ ind.indicator_code }}
                      </div>
                      <div>
                        <h3
                          class="text-h6 font-weight-bold text-blue-grey-darken-4 line-height-1 mb-1"
                        >
                          {{ ind.indicator_name }}
                        </h3>
                        <p class="text-body-2 text-blue-grey-darken-1 mb-0">
                          {{ ind.indicator_desc }}
                        </p>
                      </div>
                    </div>

                    <v-divider class="my-5 border-opacity-10" />

                    <v-row align="center">
                      <v-col cols="12" xl="7">
                        <div
                          class="text-caption font-weight-black text-blue-grey-darken-2 text-uppercase letter-spacing-1 mb-3"
                        >
                          ระบุระดับการประเมินตนเอง
                        </div>

                        <div
                          v-if="ind.indicator_type === 'score_1_4'"
                          class="scoring-group"
                        >
                          <button
                            v-for="score in 4"
                            :key="score"
                            class="score-btn"
                            :disabled="assessmentStatus === 'submitted'"
                            :class="{
                              'score-active':
                                form[ind.indicator_id]?.score === score,
                            }"
                            @click="
                              setScore(ind.indicator_id, score, ind.topic_id)
                            "
                          >
                            <div class="score-num">{{ score }}</div>
                            <div class="score-label">
                              {{ getScoreLabel(score) }}
                            </div>
                            <div class="score-active-bg"></div>
                          </button>
                        </div>

                        <div
                          v-else-if="ind.indicator_type === 'yes_no'"
                          class="scoring-group yes-no-group"
                        >
                          <button
                            class="score-btn yn-btn"
                            :disabled="assessmentStatus === 'submitted'"
                            :class="{
                              'score-active yn-yes':
                                form[ind.indicator_id]?.value_yes_no === 1,
                            }"
                            @click="setYesNo(ind.indicator_id, 1, ind.topic_id)"
                          >
                            <v-icon size="20" class="mb-1"
                              >mdi-check-circle-outline</v-icon
                            >
                            <div class="score-label">มี / ปฏิบัติ</div>
                            <div class="score-active-bg bg-success"></div>
                          </button>
                          <button
                            class="score-btn yn-btn"
                            :disabled="assessmentStatus === 'submitted'"
                            :class="{
                              'score-active yn-no':
                                form[ind.indicator_id]?.value_yes_no === 0,
                            }"
                            @click="setYesNo(ind.indicator_id, 0, ind.topic_id)"
                          >
                            <v-icon size="20" class="mb-1"
                              >mdi-close-circle-outline</v-icon
                            >
                            <div class="score-label">ไม่มี / ไม่ปฏิบัติ</div>
                            <div class="score-active-bg bg-error"></div>
                          </button>
                        </div>
                      </v-col>

                      <v-col
                        cols="12"
                        xl="5"
                        class="border-start-xl ps-xl-6 mt-4 mt-xl-0"
                      >
                        <div
                          class="text-caption font-weight-black text-blue-grey-darken-2 text-uppercase letter-spacing-1 mb-3 d-flex align-center"
                        >
                          <v-icon size="14" class="me-1"
                            >mdi-comment-text-outline</v-icon
                          >
                          คำอธิบายเพิ่มเติม (ถ้ามี)
                        </div>
                        <v-textarea
                          v-if="form[ind.indicator_id]"
                          v-model="form[ind.indicator_id].notes"
                          placeholder="ระบุเหตุผล หรือรายละเอียดเพิ่มเติมประกอบการพิจารณา..."
                          :disabled="assessmentStatus === 'submitted'"
                          variant="outlined"
                          class="custom-textarea"
                          rows="2"
                          auto-grow
                          hide-details
                          color="teal-darken-2"
                        />
                      </v-col>
                    </v-row>
                  </div>
                </div>

                <div class="d-flex justify-end mt-6" v-if="hasNextTopic">
                  <v-btn
                    color="indigo-darken-4"
                    variant="tonal"
                    rounded="xl"
                    class="font-weight-bold px-6 shadow-sm"
                    @click="goToNextTopic"
                  >
                    ถัดไป: {{ nextTopicName }}
                    <v-icon end>mdi-arrow-right</v-icon>
                  </v-btn>
                </div>
              </div>
            </v-fade-transition>
          </div>
        </v-col>
      </v-row>

      <div v-else class="empty-state text-center py-12 anim-2 mt-8">
        <div class="empty-icon-wrap mx-auto mb-4">
          <v-icon size="48" color="indigo-lighten-2">mdi-calendar-alert</v-icon>
        </div>
        <h3 class="text-h6 font-weight-bold text-indigo-darken-4">
          {{
            selectedPeriod
              ? "ไม่พบข้อมูลหัวข้อประเมินในรอบนี้"
              : "กรุณาเลือกรอบการประเมิน"
          }}
        </h3>
        <p class="text-body-2 text-grey">
          เลือกปีการศึกษาด้านบน เพื่อดึงชุดข้อคำถามประเมินตนเองจากระบบฐานข้อมูล
        </p>
      </div>
    </v-container>

    <!-- Custom Cyber Confirm Dialog -->
    <v-dialog
      v-model="confirmDialog.show"
      max-width="450"
      persistent
      class="cyber-dialog"
    >
      <div class="cyber-confirm-card" :class="'border-' + confirmDialog.type">
        <div class="confirm-gradient-bg"></div>
        <div class="confirm-icon-wrap" :class="'icon-bg-' + confirmDialog.type">
          <v-icon size="40">{{ confirmDialog.icon }}</v-icon>
          <div class="icon-ring"></div>
        </div>
        <h3 class="text-h5 font-weight-black mt-6 text-center text-white">
          {{ confirmDialog.title }}
        </h3>
        <p
          class="text-center mt-2 text-blue-grey-lighten-4"
          style="line-height: 1.6"
        >
          {{ confirmDialog.message }}
        </p>

        <div class="d-flex justify-center gap-4 mt-8">
          <button type="button" class="dialog-btn-cancel" @click="closeConfirm">
            ยกเลิก
          </button>
          <button
            type="button"
            class="dialog-btn-confirm"
            :class="'btn-' + confirmDialog.type"
            @click="executeConfirm"
          >
            <v-icon size="18" class="me-2">{{
              confirmDialog.confirmIcon
            }}</v-icon>
            {{ confirmDialog.confirmText }}
          </button>
        </div>
      </div>
    </v-dialog>

    <!-- SIGNATURE DIALOG -->
    <v-dialog
      v-model="signatureDialog.show"
      max-width="600"
      persistent
      class="cyber-dialog"
    >
      <div class="cyber-confirm-card border-info">
        <div class="confirm-gradient-bg"></div>
        <div class="d-flex align-center gap-4 mb-6 relative-z">
          <div
            class="hologram-icon-box"
            style="width: 48px; height: 48px; border-radius: 12px"
          >
            <v-icon icon="mdi-draw-pen" size="24" color="white" />
          </div>
          <h3 class="text-h5 font-weight-black text-white mb-0">
            ลงลายมือชื่อ
          </h3>
        </div>

        <p class="text-blue-grey-lighten-4 mb-4 relative-z">
          กรุณาเซ็นชื่อเพื่อยืนยันผลการประเมินตนเอง
          การดำเนินการนี้จะไม่สามารถแก้ไขคะแนนได้อีก
        </p>

        <!-- Signature Canvas -->
        <div class="signature-wrapper mb-6 relative-z">
          <canvas
            ref="signatureCanvas"
            class="signature-pad"
            @mousedown="startDrawing"
            @mousemove="draw"
            @mouseup="stopDrawing"
            @mouseleave="stopDrawing"
            @touchstart="startDrawingTouch"
            @touchmove="drawTouch"
            @touchend="stopDrawing"
          ></canvas>
          <div class="signature-placeholder" v-if="!hasDrawn">
            เซ็นชื่อของคุณที่นี่
          </div>
        </div>

        <div class="d-flex justify-space-between align-center relative-z">
          <button
            type="button"
            class="micro-btn-ghost bg-transparent text-blue-grey-lighten-3"
            @click="clearSignature"
          >
            <v-icon size="16" class="me-1">mdi-eraser</v-icon> ล้างลายเซ็น
          </button>

          <div class="d-flex gap-3">
            <button type="button" class="dialog-btn-cancel" @click="closeSignatureDialog">
              ยกเลิก
            </button>
            <button
              type="button"
              class="dialog-btn-confirm btn-info"
              @click="submitSignature"
              :disabled="!hasDrawn"
            >
              <v-icon size="18" class="me-2">mdi-check-circle</v-icon>
              ยืนยันและส่งผล
            </button>
          </div>
        </div>
      </div>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";

// ==========================================
// 1. API Configuration & Reactive States
// ==========================================
const BASE_URL = "http://localhost:7000/api/evaluatee"; // พอร์ตตรงกับ API ใหม่

const periods = ref([]);
const selectedPeriod = ref(null);
const topics = ref([]);
const indicators = ref([]);
const activeTopicId = ref(null);
const form = ref({});
const assessmentStatus = ref("draft");
const signatureUrl = ref(null);

const authStore = useAuthStore();
if (process.client && !authStore.user) {
  authStore.hydrateFromStorage();
}
const userName = computed(() => authStore.user?.name_th || 'คุณครูผู้ประเมิน');

const currentPeriodName = computed(() => {
  const p = periods.value.find((item) => item.id === selectedPeriod.value);
  return p ? p.name_th : "กรุณาเลือกรอบการประเมิน";
});

// ==========================================
// 2. Lifecycle Hook
// ==========================================
onMounted(async () => {
  await loadPeriods();
});

const loadPeriods = async () => {
  try {
    const token = localStorage.getItem("auth_token");
    const response = await axios.get(`${BASE_URL}/periods-list`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    periods.value = response.data;

    if (periods.value.length > 0) {
      selectedPeriod.value = periods.value[0].id;
      await loadAssessmentData();
    }
  } catch (error) {
    console.error("Error loading periods:", error);
  }
};

// ==========================================
// 3. API Data Fetching (ปรับเข้ากับ API ใหม่สุดๆ)
// ==========================================
const loadAssessmentData = async () => {
  if (!selectedPeriod.value) return;

  try {
    const token = localStorage.getItem("auth_token");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // ยิง API ใหม่ที่ดึงทั้งโครงสร้างหัวข้อและคำตอบเก่ามาพร้อมกัน
    const res = await axios.get(
      `${BASE_URL}/self-evaluation-form/?period_id=${selectedPeriod.value}`,
      config,
    );
    
    // ✨ แยกข้อมูลภาพรวม (submission) และรายละเอียด (indicators) ออกจากกัน
    const { submission, indicators: rawData } = res.data;

    const uniqueTopicsMap = new Map();
    const newForm = {};

    rawData.forEach((row) => {
      // สกัดหัวข้อหลัก (Topic) แบบไม่ซ้ำ
      if (!uniqueTopicsMap.has(row.topic_id)) {
        uniqueTopicsMap.set(row.topic_id, {
          id: row.topic_id,
          title_th: row.topic_title,
          description: "", // ไม่มีใน API แต่โครงสร้างคุณรองรับไว้
        });
      }

      // เอาคำตอบมายัดใส่ Form ให้ตรงกับ ID
      newForm[row.indicator_id] = {
        topic_id: row.topic_id,
        indicator_id: row.indicator_id,
        score: (row.score !== undefined && row.score !== null) ? Number(row.score) : null,
        value_yes_no: row.value_yes_no !== undefined ? row.value_yes_no : null,
        notes: row.notes || "",
      };
    });

    // อัปเดตตัวแปรสำหรับ UI
    topics.value = Array.from(uniqueTopicsMap.values()).sort(
      (a, b) => a.id - b.id,
    );
    indicators.value = rawData;
    form.value = newForm;

    // ✨ หา Status ภาพรวมจาก submission
    assessmentStatus.value = submission?.status || "draft";
    signatureUrl.value = submission?.signature || null;

    // เปิดหัวข้อแรกอัตโนมัติ
    if (topics.value.length > 0) {
      activeTopicId.value = topics.value[0].id;
    }
  } catch (error) {
    console.error("Error fetching dynamic assessment data:", error);
    topics.value = [];
    indicators.value = [];
    form.value = {};
  }
};

// ==========================================
// 4. Computed Properties
// ==========================================
const activeTopic = computed(() =>
  topics.value.find((t) => t.id === activeTopicId.value),
);

const currentIndicators = computed(() => {
  return indicators.value.filter((ind) => ind.topic_id === activeTopicId.value);
});

const totalAnswered = computed(() => {
  return Object.values(form.value).filter(
    (val) => val.score !== null || val.value_yes_no !== null,
  ).length;
});

const overallProgress = computed(() => {
  if (indicators.value.length === 0) return 0;
  return Math.round((totalAnswered.value / indicators.value.length) * 100);
});

const nextTopicName = computed(() => {
  const currentIndex = topics.value.findIndex(
    (t) => t.id === activeTopicId.value,
  );
  if (currentIndex < topics.value.length - 1)
    return topics.value[currentIndex + 1].title_th;
  return null;
});

// ==========================================
// Signature & Dialog Modal State
// ==========================================
const confirmDialog = ref({
  show: false,
  title: "",
  message: "",
  type: "info",
  icon: "",
  confirmText: "ยืนยัน",
  confirmIcon: "mdi-check",
  actionCallback: null,
});

function showConfirm(options, callback) {
  confirmDialog.value = {
    show: true,
    title: options.title || "ยืนยันการทำรายการ",
    message: options.message || "",
    type: options.type || "info",
    icon: options.icon || "mdi-help-circle-outline",
    confirmText: options.confirmText || "ยืนยัน",
    confirmIcon: options.confirmIcon || "mdi-check",
    actionCallback: callback,
  };
}

function closeConfirm() {
  confirmDialog.value.show = false;
  confirmDialog.value.actionCallback = null;
}

function executeConfirm() {
  if (confirmDialog.value.actionCallback) {
    confirmDialog.value.actionCallback();
  }
  confirmDialog.value.show = false;
}

const signatureDialog = ref({ show: false });
const signatureCanvas = ref(null);
const hasDrawn = ref(false);
let isDrawing = false;
let ctx = null;

function openSignatureDialog() {
  if (overallProgress.value < 100) {
    showConfirm({
      title: 'ข้อมูลยังไม่ครบถ้วน',
      message: `คุณประเมินไปแล้ว ${totalAnswered.value} จาก ${indicators.value.length} ข้อ คุณแน่ใจหรือไม่ที่จะส่งยืนยันผลไปทั้งที่ยังไม่ครบ?`,
      type: 'warning',
      icon: 'mdi-alert-decagram',
      confirmText: 'ดำเนินการต่อ',
      confirmIcon: 'mdi-send-check'
    }, () => {
      signatureDialog.value.show = true;
      setTimeout(initSignatureCanvas, 100);
    });
    return;
  }
  
  signatureDialog.value.show = true;
  setTimeout(initSignatureCanvas, 100);
}

function closeSignatureDialog() {
  signatureDialog.value.show = false;
  clearSignature();
}

function initSignatureCanvas() {
  const canvas = signatureCanvas.value;
  if (!canvas) return;
  canvas.width = canvas.offsetWidth || 500;
  canvas.height = canvas.offsetHeight || 200;
  ctx = canvas.getContext('2d');
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#1e1b4b';
}

function getPos(e) {
  const rect = signatureCanvas.value.getBoundingClientRect();
  const clientX = e.clientX || (e.touches && e.touches[0].clientX);
  const clientY = e.clientY || (e.touches && e.touches[0].clientY);
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

function startDrawing(e) {
  isDrawing = true;
  hasDrawn.value = true;
  const pos = getPos(e);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
}
function startDrawingTouch(e) { e.preventDefault(); startDrawing(e); }

function draw(e) {
  if (!isDrawing) return;
  const pos = getPos(e);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
}
function drawTouch(e) { e.preventDefault(); draw(e); }

function stopDrawing() {
  isDrawing = false;
}

function clearSignature() {
  if (!ctx || !signatureCanvas.value) return;
  ctx.clearRect(0, 0, signatureCanvas.value.width, signatureCanvas.value.height);
  hasDrawn.value = false;
}

async function submitSignature() {
  if (!hasDrawn.value) return;
  const dataUrl = signatureCanvas.value.toDataURL('image/png');
  await saveAssessment('submitted', dataUrl);
  closeSignatureDialog();
}

// ==========================================
// 5. Methods & Actions
// ==========================================
const setScore = (indId, score, topicId) => {
  if (assessmentStatus.value === "submitted") return;
  if (!form.value[indId])
    form.value[indId] = { topic_id: topicId, indicator_id: indId, notes: "" };
  form.value[indId].score = score;
  form.value[indId].value_yes_no = null;
};

const setYesNo = (indId, val, topicId) => {
  if (assessmentStatus.value === "submitted") return;
  if (!form.value[indId])
    form.value[indId] = { topic_id: topicId, indicator_id: indId, notes: "" };
  form.value[indId].value_yes_no = val;
  form.value[indId].score = null;
};

const isAnswered = (indId) => {
  const f = form.value[indId];
  return f && (f.score !== null || f.value_yes_no !== null);
};

const getScoreLabel = (score) => {
  const labels = { 1: "ปรับปรุง", 2: "พอใช้", 3: "ดี", 4: "ดีเยี่ยม" };
  return labels[score] || "";
};

const getTopicProgress = (topicId) => {
  const indsInTopic = indicators.value.filter(
    (ind) => ind.topic_id === topicId,
  );
  if (indsInTopic.length === 0) return 0;
  const answered = indsInTopic.filter((ind) =>
    isAnswered(ind.indicator_id),
  ).length;
  return (answered / indsInTopic.length) * 100;
};

const goToNextTopic = () => {
  const currentIndex = topics.value.findIndex(
    (t) => t.id === activeTopicId.value,
  );
  if (currentIndex < topics.value.length - 1) {
    activeTopicId.value = topics.value[currentIndex + 1].id;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

// ยิงข้อมูลไปบันทึกที่ API หลังบ้าน (ใช้ Endpoint ตัวใหม่ของคุณ)
const submitAssessment = async () => {

  if (overallProgress.value < 100) {
    alert('กรุณาประเมินให้ครบทุกข้อก่อนส่งผลประเมิน')
    return
  }

  await saveAssessment('submitted')
}

const saveDraft = async () => {
  await saveAssessment('draft')
}

const saveAssessment = async (status, signature = null) => {
  try {
    const token = localStorage.getItem('auth_token')

    const answersPayload = Object.values(form.value).map(f => ({
      topic_id: f.topic_id,
      indicator_id: f.indicator_id,
      score: f.score,
      value_yes_no: f.value_yes_no,
      notes: f.notes
    }))

    const payload = {
      period_id: selectedPeriod.value,
      status,
      answers: answersPayload,
      signature
    }

    const response = await axios.post(
      `${BASE_URL}/self-evaluation-save/`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.data.success) {
      alert(response.data.message)
      await loadAssessmentData()
    }
  } catch (error) {
    console.error(error)
    alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
  }
}


</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap");
* {
  font-family: "Inter", sans-serif !important;
}

.self-assessment-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: radial-gradient(
    circle at top left,
    #f8fafc 0%,
    #eef2ff 40%,
    #e0f2fe 100%
  );
}

/* Ambient */
.blob-1,
.blob-2,
.blob-3 {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  z-index: 0;
  opacity: 0.5;
  pointer-events: none;
}
.blob-1 {
  top: -100px;
  left: -50px;
  width: 600px;
  height: 600px;
  background: rgba(52, 211, 153, 0.3);
}
.blob-2 {
  bottom: -100px;
  right: -50px;
  width: 500px;
  height: 500px;
  background: rgba(129, 140, 248, 0.25);
}
.blob-3 {
  top: 40%;
  right: 30%;
  width: 400px;
  height: 400px;
  background: rgba(56, 189, 248, 0.2);
}
.relative-content {
  position: relative;
  z-index: 1;
}

/* ===== Headers ===== */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.page-icon-wrap {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px rgba(5, 150, 105, 0.35);
}
.page-title {
  font-size: 26px;
  font-weight: 900;
  color: #064e3b;
  letter-spacing: -0.5px;
  line-height: 1.2;
}
.page-subtitle {
  font-size: 14px;
  color: #0f766e;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}
.overall-progress {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 1);
  border-radius: 999px;
  padding: 6px 20px 6px 10px;
}

/* Buttons */
.submit-btn {
  position: relative;
  overflow: hidden;
  transition: all 0.3s !important;
}
.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(13, 148, 136, 0.4) !important;
}
.shadow-teal {
  box-shadow: 0 8px 25px rgba(13, 148, 136, 0.25) !important;
}
.btn-shine {
  position: absolute;
  top: 0;
  left: -75%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    120deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transform: skewX(-20deg);
  animation: btnShine 4s infinite;
}
@keyframes btnShine {
  0% {
    left: -75%;
  }
  20% {
    left: 125%;
  }
  100% {
    left: 125%;
  }
}

/* ===== Left Sidebar ===== */
.sticky-sidebar {
  position: sticky;
  top: 24px;
}
.glass-card {
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 1) !important;
}
.sidebar-header {
  background: linear-gradient(135deg, #1e1b4b, #3730a3);
  position: relative;
  overflow: hidden;
}
.sidebar-header::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: radial-gradient(
    rgba(255, 255, 255, 0.1) 1px,
    transparent 1px
  );
  background-size: 15px 15px;
  opacity: 0.5;
}

.topic-item {
  position: relative;
  padding: 12px 16px;
  margin-bottom: 4px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}
.topic-item-bg {
  position: absolute;
  inset: 0;
  background: rgba(99, 102, 241, 0.08);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}
.topic-item:hover .topic-item-bg {
  transform: translateX(0);
}
.topic-active {
  background: white;
  box-shadow: 0 4px 15px rgba(49, 46, 129, 0.05);
}
.topic-active .topic-item-bg {
  display: none;
}
.topic-title {
  font-size: 13.5px;
  transition: color 0.3s;
}

/* ===== Right Form ===== */
.topic-header-card {
  position: relative;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(199, 210, 254, 0.6);
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(49, 46, 129, 0.03);
}
.topic-header-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    rgba(238, 242, 255, 0.8) 0%,
    rgba(224, 231, 255, 0.3) 100%
  );
  z-index: 0;
}
.topic-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4338ca, #6366f1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(67, 56, 202, 0.3);
}

/* Indicator Card */
.indicator-card {
  position: relative;
  background: white;
  border-radius: 20px;
  border: 1px solid rgba(226, 232, 240, 1);
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
  transition: all 0.3s;
}
.indicator-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.05);
}
.indicator-accent {
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 100%;
  transition: background 0.3s;
}
.ind-code-badge {
  background: rgba(99, 102, 241, 0.1);
  color: #3949ab;
  font-size: 12px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

/* Scoring Segmented Buttons */
.scoring-group {
  display: flex;
  gap: 8px;
  background: #f1f5f9;
  padding: 6px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}
.score-btn {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 4px;
  border-radius: 12px;
  cursor: pointer;
  border: none;
  background: transparent;
  transition: all 0.3s;
  overflow: hidden;
}
.score-num {
  font-size: 20px;
  font-weight: 900;
  color: #64748b;
  line-height: 1;
  margin-bottom: 4px;
  position: relative;
  z-index: 2;
  transition: color 0.3s;
}
.score-label {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  position: relative;
  z-index: 2;
  transition: color 0.3s;
}
.score-active-bg {
  position: absolute;
  inset: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  opacity: 0;
  transform: scale(0.9);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 1;
}

.score-btn:hover:not(.score-active):not(:disabled) {
  background: rgba(255, 255, 255, 0.5);
}
.score-active .score-active-bg {
  opacity: 1;
  transform: scale(1);
}
.score-active .score-num {
  color: #1e1b4b;
}
.score-active .score-label {
  color: #4338ca;
}

/* Yes/No specific styles */
.yes-no-group .score-btn {
  flex-direction: row;
  gap: 8px;
  padding: 14px 8px;
}
.yes-no-group .score-label {
  font-size: 13px;
  font-weight: 800;
}
.yn-btn .v-icon {
  color: #64748b;
  position: relative;
  z-index: 2;
  transition: color 0.3s;
}
.score-active.yn-yes .v-icon,
.score-active.yn-yes .score-label {
  color: white;
}
.score-active.yn-no .v-icon,
.score-active.yn-no .score-label {
  color: white;
}

/* Textarea */
.custom-textarea :deep(.v-field) {
  background: #f8fafc !important;
  border-radius: 14px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02) inset !important;
  transition: all 0.2s;
  border: 1px solid transparent;
}
.custom-textarea :deep(.v-field--focused) {
  background: white !important;
  border-color: #0d9488;
}

/* Utilities */
.line-height-1 {
  line-height: 1.2;
}
.relative-z {
  position: relative;
  z-index: 1;
}
.flex-1-1 {
  flex: 1 1 auto;
}
.letter-spacing-1 {
  letter-spacing: 0.5px;
}

@media (min-width: 1200px) {
  .border-start-xl {
    border-left: 1px dashed rgba(0, 0, 0, 0.1);
  }
}

/* Entrance Animations */
.anim-1 {
  animation: slideUp 0.5s 0.05s ease-out both;
}
.anim-2 {
  animation: slideUp 0.5s 0.15s ease-out both;
}
.anim-3 {
  animation: slideUp 0.5s 0.25s ease-out both;
}
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* =========================================
   7. CYBER CONFIRM DIALOG & SIGNATURE
   ========================================= */
.cyber-dialog :deep(.v-overlay__content) {
  border-radius: 28px !important;
}

.cyber-confirm-card {
  background: #0f172a;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 28px;
  padding: 40px 32px;
  position: relative;
  overflow: hidden;
}

.cyber-confirm-card.border-danger { box-shadow: inset 0 0 0 2px rgba(239, 68, 68, 0.3), 0 20px 40px rgba(0,0,0,0.5); }
.cyber-confirm-card.border-warning { box-shadow: inset 0 0 0 2px rgba(245, 158, 11, 0.3), 0 20px 40px rgba(0,0,0,0.5); }
.cyber-confirm-card.border-info { box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.3), 0 20px 40px rgba(0,0,0,0.5); }

.confirm-gradient-bg {
  position: absolute; top: -50px; left: 50%; transform: translateX(-50%);
  width: 200px; height: 200px; border-radius: 50%; filter: blur(60px); opacity: 0.3; pointer-events: none;
}
.border-danger .confirm-gradient-bg { background: #ef4444; }
.border-warning .confirm-gradient-bg { background: #f59e0b; }
.border-info .confirm-gradient-bg { background: #3b82f6; }

.confirm-icon-wrap {
  width: 80px; height: 80px; border-radius: 50%;
  margin: 0 auto; display: flex; align-items: center; justify-content: center;
  position: relative;
}
.icon-ring {
  position: absolute; inset: -4px; border-radius: 50%;
  border: 2px dashed rgba(255,255,255,0.3);
  animation: spin 8s linear infinite;
}
.icon-bg-danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; box-shadow: 0 0 20px rgba(239, 68, 68, 0.2); }
.icon-bg-warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; box-shadow: 0 0 20px rgba(245, 158, 11, 0.2); }
.icon-bg-info { background: rgba(59, 130, 246, 0.1); color: #3b82f6; box-shadow: 0 0 20px rgba(59, 130, 246, 0.2); }

.dialog-btn-cancel, .dialog-btn-confirm {
  padding: 12px 24px; border-radius: 14px; font-weight: 700; font-size: 1rem;
  cursor: pointer; transition: all 0.3s; flex: 1; display: flex; align-items: center; justify-content: center;
}
.dialog-btn-cancel {
  background: rgba(255,255,255,0.05); color: #cbd5e1; border: 1px solid rgba(255,255,255,0.1);
}
.dialog-btn-cancel:hover { background: rgba(255,255,255,0.1); color: white; }

.dialog-btn-confirm.btn-danger { background: linear-gradient(135deg, #ef4444, #b91c1c); color: white; box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3); border: none; }
.dialog-btn-confirm.btn-danger:hover { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(239, 68, 68, 0.4); }

.dialog-btn-confirm.btn-warning { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3); border: none; }
.dialog-btn-confirm.btn-warning:hover { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(245, 158, 11, 0.4); }

.dialog-btn-confirm.btn-info { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3); border: none; }
.dialog-btn-confirm.btn-info:hover { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(59, 130, 246, 0.4); }

/* Signature Canvas */
.signature-wrapper {
  background: white;
  border-radius: 12px;
  border: 2px dashed #cbd5e1;
  position: relative;
  overflow: hidden;
  height: 200px;
}
.signature-pad {
  width: 100%;
  height: 100%;
  cursor: crosshair;
}
.signature-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: color 0.3s;
}


/* =========================================
   7. CYBER CONFIRM DIALOG & SIGNATURE
   ========================================= */
.cyber-dialog :deep(.v-overlay__content) {
  border-radius: 28px !important;
}

.cyber-confirm-card {
  background: #0f172a;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 28px;
  padding: 40px 32px;
  position: relative;
  overflow: hidden;
}

.cyber-confirm-card.border-danger { box-shadow: inset 0 0 0 2px rgba(239, 68, 68, 0.3), 0 20px 40px rgba(0,0,0,0.5); }
.cyber-confirm-card.border-warning { box-shadow: inset 0 0 0 2px rgba(245, 158, 11, 0.3), 0 20px 40px rgba(0,0,0,0.5); }
.cyber-confirm-card.border-info { box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.3), 0 20px 40px rgba(0,0,0,0.5); }

.confirm-gradient-bg {
  position: absolute; top: -50px; left: 50%; transform: translateX(-50%);
  width: 200px; height: 200px; border-radius: 50%; filter: blur(60px); opacity: 0.3; pointer-events: none;
}
.border-danger .confirm-gradient-bg { background: #ef4444; }
.border-warning .confirm-gradient-bg { background: #f59e0b; }
.border-info .confirm-gradient-bg { background: #3b82f6; }

.confirm-icon-wrap {
  width: 80px; height: 80px; border-radius: 50%;
  margin: 0 auto; display: flex; align-items: center; justify-content: center;
  position: relative;
}
.icon-ring {
  position: absolute; inset: -4px; border-radius: 50%;
  border: 2px dashed rgba(255,255,255,0.3);
  animation: spin 8s linear infinite;
}
.icon-bg-danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; box-shadow: 0 0 20px rgba(239, 68, 68, 0.2); }
.icon-bg-warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; box-shadow: 0 0 20px rgba(245, 158, 11, 0.2); }
.icon-bg-info { background: rgba(59, 130, 246, 0.1); color: #3b82f6; box-shadow: 0 0 20px rgba(59, 130, 246, 0.2); }

.dialog-btn-cancel, .dialog-btn-confirm {
  padding: 12px 24px; border-radius: 14px; font-weight: 700; font-size: 1rem;
  cursor: pointer; transition: all 0.3s; flex: 1; display: flex; align-items: center; justify-content: center;
}
.dialog-btn-cancel {
  background: rgba(255,255,255,0.05); color: #cbd5e1; border: 1px solid rgba(255,255,255,0.1);
}
.dialog-btn-cancel:hover { background: rgba(255,255,255,0.1); color: white; }

.dialog-btn-confirm.btn-danger { background: linear-gradient(135deg, #ef4444, #b91c1c); color: white; box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3); border: none; }
.dialog-btn-confirm.btn-danger:hover { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(239, 68, 68, 0.4); }

.dialog-btn-confirm.btn-warning { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3); border: none; }
.dialog-btn-confirm.btn-warning:hover { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(245, 158, 11, 0.4); }

.dialog-btn-confirm.btn-info { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3); border: none; }
.dialog-btn-confirm.btn-info:hover { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(59, 130, 246, 0.4); }

/* Signature Canvas */
.signature-wrapper {
  background: white;
  border-radius: 12px;
  border: 2px dashed #cbd5e1;
  position: relative;
  overflow: hidden;
  height: 200px;
}
.signature-pad {
  width: 100%;
  height: 100%;
  cursor: crosshair;
}
.signature-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #94a3b8;
  pointer-events: none;
  font-weight: 500;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

/* Signature Display Card */
.cyber-sig-card {
  background: white;
  border-radius: 20px;
  padding: 32px;
  position: relative;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}
.card-glow-success {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 150px;
  height: 150px;
  background: #10b981;
  filter: blur(50px);
  opacity: 0.1;
}
.sig-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.sig-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
