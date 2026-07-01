<template>
  <div class="eval-layout" @mousemove="handleMouseMove" ref="layoutRef">
    <!-- Interactive Aura Cursor -->
    <div
      class="cursor-aura"
      :style="{ transform: `translate(${mouseX}px, ${mouseY}px)` }"
    ></div>

    <!-- 3D Floating Orbs Background -->
    <div class="bg-layer">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
      <div class="mesh-grid"></div>
    </div>

    <!-- Floating Particles -->
    <div class="particles">
      <div
        v-for="i in 30"
        :key="i"
        class="sparkle"
        :style="sparkleStyle(i)"
      ></div>
    </div>

    <v-container class="py-10 relative-content main-container">
      <v-fade-transition hide-on-leave>
        <!-- ============================================== -->
        <!-- VIEW 1: SELECTION LIST                         -->
        <!-- ============================================== -->
        <div v-if="selected === null" key="selection" class="view-wrapper">
          <div class="header-section mb-12 stagger-1">
            <div
              class="d-flex align-center justify-space-between flex-wrap gap-6"
            >
              <div class="d-flex align-center gap-6">
                <div class="hologram-icon-box">
                  <div class="hologram-ring"></div>
                  <v-icon
                    icon="mdi-account-star"
                    size="36"
                    color="white"
                    class="relative-z"
                  />
                </div>
                <div>
                  <h1
                    class="text-h3 font-weight-black gradient-text mb-2 tracking-tight"
                  >
                    ระบบประเมินบุคลากร
                  </h1>
                  <p
                    class="text-subtitle-1 font-weight-medium text-indigo-darken-1 mb-0 glass-badge inline-flex"
                  >
                    <v-icon size="18" class="mr-2">mdi-shield-account</v-icon>
                    รายชื่อผู้รับการประเมินในความรับผิดชอบ
                  </p>
                </div>
              </div>
              <div class="stats-glass-card">
                <div class="stat-value">{{ assignments.length }}</div>
                <div class="stat-label">รายการที่ต้องประเมิน</div>
                <div class="stat-glow"></div>
              </div>
            </div>
          </div>

          <v-row v-if="assignments.length > 0">
            <v-col
              v-for="(item, index) in assignments"
              :key="item.id"
              cols="12"
              md="6"
              lg="4"
            >
              <div class="ultra-card" :class="`stagger-${(index % 4) + 2}`">
                <div class="card-inner">
                  <!-- Decorative elements -->
                  <div class="card-gradient-overlay"></div>
                  <div class="card-noise"></div>
                  <div class="corner-accents">
                    <span></span><span></span><span></span><span></span>
                  </div>

                  <div class="d-flex align-start mb-6 relative-z">
                    <div class="avatar-container me-5">
                      <div class="avatar-ring-spin"></div>
                      <v-avatar size="72" class="premium-avatar">
                        <v-icon color="indigo-darken-3" size="36"
                          >mdi-account-tie</v-icon
                        >
                      </v-avatar>
                    </div>
                    <div class="pt-2">
                      <h3
                        class="text-h5 font-weight-black text-indigo-darken-4 mb-1 tracking-tight"
                      >
                        {{ item.evaluatee_name }}
                      </h3>
                      <div class="dept-badge">
                        <v-icon size="14" class="me-1">mdi-domain</v-icon>
                        {{ item.dept_name || "ไม่ระบุแผนก" }}
                      </div>
                    </div>
                  </div>

                  <div class="period-container relative-z mb-8">
                    <div class="period-label">รอบการประเมินปัจจุบัน</div>
                    <div class="period-value">
                      <v-icon size="18" color="indigo-accent-4" class="me-2"
                        >mdi-clock-outline</v-icon
                      >
                      {{ item.period_name }}
                    </div>
                  </div>

                  <button
                    class="cyber-btn w-100 relative-z"
                    @click="openEvaluate(item)"
                  >
                    <span class="btn-content">
                      เริ่มต้นประเมิน
                      <v-icon size="20" class="ms-2 arrow-icon"
                        >mdi-arrow-right</v-icon
                      >
                    </span>
                    <div class="btn-glare"></div>
                  </button>
                </div>
              </div>
            </v-col>
          </v-row>

          <div v-else class="empty-hologram stagger-2">
            <div class="empty-orb">
              <v-icon size="60" color="indigo-lighten-2"
                >mdi-folder-account-outline</v-icon
              >
              <div class="orbit-ring-1"></div>
              <div class="orbit-ring-2"></div>
            </div>
            <h2
              class="text-h4 font-weight-black text-indigo-darken-4 mt-8 mb-2"
            >
              ไม่มีข้อมูลการประเมิน
            </h2>
            <p class="text-h6 text-indigo-lighten-1">
              คุณทำรายการทั้งหมดเสร็จสิ้นแล้ว
            </p>
          </div>
        </div>

        <!-- ============================================== -->
        <!-- VIEW 2: EVALUATION FORM                        -->
        <!-- ============================================== -->
        <div v-else key="evaluation" class="view-wrapper">
          <!-- Floating Command Bar -->
          <div class="command-bar stagger-1">
            <div class="d-flex align-center w-100 gap-4 flex-wrap">
              <button class="icon-btn-glass back-btn" @click="back">
                <v-icon>mdi-arrow-left</v-icon>
              </button>

              <div class="eval-target-info">
                <div class="text-h5 font-weight-black gradient-text">
                  {{ selected.evaluatee_name }}
                </div>
                <div class="progress-indicator">
                  <div class="progress-text">
                    <span class="text-caption font-weight-bold text-indigo"
                      >ความคืบหน้า</span
                    >
                    <span class="text-subtitle-2 font-weight-black ms-2"
                      >{{ gradedCount }} / {{ totalIndicators }}</span
                    >
                  </div>
                  <div class="progress-bar-bg">
                    <div
                      class="progress-bar-fill"
                      :style="{
                        width: `${(gradedCount / totalIndicators) * 100}%`,
                      }"
                    >
                      <div class="progress-bar-glow"></div>
                    </div>
                  </div>
                </div>
              </div>

              <v-spacer></v-spacer>
              <div
                class="action-cluster"
                v-if="selected && selected.evaluator_status !== 'completed'"
              >
                <button class="action-btn-danger" @click="deleteAll">
                  <v-icon size="18" class="me-2">mdi-delete-sweep</v-icon>
                  ล้างทั้งหมด
                </button>
                <button class="action-btn-ghost" @click="save('draft')">
                  <v-icon size="18" class="me-2"
                    >mdi-content-save-outline</v-icon
                  >
                  ร่างทั้งหมด
                </button>
                <!-- ยืนยันผลและลงนาม -->
                <button
                  class="action-btn-primary"
                  @click="openSignatureDialog"
                >
                  ยืนยันผลและลงนาม
                </button>
              </div>
            </div>
          </div>

          <!-- Futuristic Accordion -->
          <div class="accordion-container mt-10">
            <v-expansion-panels
              multiple
              variant="accordion"
              class="ultra-panels"
            >
              <v-expansion-panel
                v-for="(topic, tIdx) in topicGroups"
                :key="topic.code"
                class="ultra-panel"
                :class="`stagger-${(tIdx % 3) + 2}`"
              >
                <v-expansion-panel-title class="ultra-panel-title">
                  <div class="d-flex align-center w-100">
                    <div class="topic-hex-icon">
                      <span>{{ topic.code.replace("TOP", "") }}</span>
                    </div>
                    <span
                      class="text-h6 font-weight-black text-indigo-darken-4 ms-4 tracking-tight"
                      >{{ topic.name }}</span
                    >
                    <v-spacer></v-spacer>
                    <div class="topic-counter">
                      <v-icon size="14" color="indigo-accent-4" class="me-1"
                        >mdi-bullseye-arrow</v-icon
                      >
                      {{ getIndicatorsByTopic(topic.code).length }} ข้อ
                    </div>
                  </div>
                </v-expansion-panel-title>

                <v-expansion-panel-text class="ultra-panel-content">
                  <div class="indicators-grid">
                    <div
                      v-for="(i, idx) in getIndicatorsByTopic(topic.code)"
                      :key="i.id"
                      class="neo-indicator-card"
                      :class="getCardStatusClass(i.id)"
                    >
                      <div class="card-status-glow"></div>

                      <div class="d-flex gap-6 relative-z">
                        <!-- Number Sphere -->
                        <div class="number-sphere-wrap">
                          <div
                            class="number-sphere"
                            :class="{ 'is-done': isGraded(i.id) }"
                          >
                            <span class="num">{{ i.display_idx }}</span>
                            <v-icon
                              v-if="isGraded(i.id)"
                              class="done-check"
                              size="18"
                              >mdi-check-bold</v-icon
                            >
                          </div>
                        </div>

                        <div class="flex-grow-1">
                          <h4
                            class="text-h6 font-weight-bold text-indigo-darken-4 mb-4"
                            style="line-height: 1.4"
                          >
                            {{ i.name_th }}
                          </h4>

                          <!-- Cyber Attachments (แยกส่วนไฟล์แนบ และ ลิงก์อ้างอิง) -->
                          <div
                            v-if="
                              filesByIndicator(i.id).length ||
                              linksByIndicator(i.id).length
                            "
                            class="cyber-attachments mb-6"
                          >
                            <v-row>
                              <!-- 📁 ช่องที่ 1: ไฟล์แนบเอกสาร -->
                              <v-col cols="12" md="6" class="border-end-md">
                                <div class="att-header mb-3">
                                  <v-icon
                                    size="16"
                                    color="indigo-accent-4"
                                    class="me-2"
                                    >mdi-file-document-outline</v-icon
                                  >
                                  ไฟล์แนบ (Files)
                                </div>
                                <div class="att-list">
                                  <a
                                    v-for="file in filesByIndicator(i.id)"
                                    :key="'file-' + file.id"
                                    :href="`http://localhost:7000/api/evaluator/download/${file.id}`"
                                    target="_blank"
                                    class="cyber-file-chip w-100 mb-2 justify-space-between"
                                  >
                                    <span
                                      class="file-name text-truncate"
                                      style="max-width: 80%"
                                    >
                                      {{ file.file_name }}
                                    </span>
                                    <div class="file-action">
                                      <v-icon size="14">mdi-download</v-icon>
                                    </div>
                                  </a>
                                  <div
                                    v-if="!filesByIndicator(i.id).length"
                                    class="text-caption text-grey py-2"
                                  >
                                    ไม่มีไฟล์แนบ
                                  </div>
                                </div>
                              </v-col>

                              <!-- 🔗 ช่องที่ 2: ลิงก์อ้างอิงภายนอก -->
                              <v-col cols="12" md="6">
                                <div class="att-header mb-3">
                                  <v-icon
                                    size="16"
                                    color="teal-accent-4"
                                    class="me-2"
                                    >mdi-link-variant</v-icon
                                  >
                                  ลิงก์อ้างอิง (Links)
                                </div>
                                <div class="att-list">
                                  <div
                                    v-for="link in linksByIndicator(i.id)"
                                    :key="'link-' + link.id"
                                    class="cyber-link-card mb-2 d-flex align-center justify-space-between pa-3 rounded-lg border w-100"
                                  >
                                    <div
                                      class="d-flex align-center overflow-hidden"
                                      style="max-width: 70%"
                                    >
                                      <v-icon
                                        size="16"
                                        color="teal"
                                        class="me-2"
                                        >mdi-earth</v-icon
                                      >
                                      <span
                                        class="text-caption text-truncate font-weight-medium text-teal-darken-3"
                                      >
                                        {{
                                          link.file_name || link.storage_path
                                        }}
                                      </span>
                                    </div>
                                    <div class="d-flex gap-2">
                                      <!-- ปุ่ม Copy ลิงก์ -->
                                      <v-btn
                                        icon="mdi-content-copy"
                                        size="x-small"
                                        color="teal"
                                        variant="tonal"
                                        title="คัดลอกลิงก์"
                                        @click.stop="copyLink(getLinkUrl(link))"
                                      ></v-btn>
                                      <!-- ปุ่มเปิดหน้าเว็บลิงก์ใหม่ -->
                                      <a
                                        :href="getLinkUrl(link)"
                                        target="_blank"
                                        style="text-decoration: none"
                                      >
                                        <v-btn
                                          icon="mdi-open-in-new"
                                          size="x-small"
                                          color="success"
                                          variant="tonal"
                                          title="เปิดลิงก์"
                                        ></v-btn>
                                      </a>
                                    </div>
                                  </div>
                                  <div
                                    v-if="!linksByIndicator(i.id).length"
                                    class="text-caption text-grey py-2"
                                  >
                                    ไม่มีลิงก์อ้างอิง
                                  </div>
                                </div>
                              </v-col>
                            </v-row>
                          </div>

                          <div class="divider-glow mb-6"></div>

                          <!-- Scoring Matrix -->
                          <div
                            v-if="form[i.id]"
                            class="scoring-matrix position-relative"
                          >
                            <!-- 🌟 โหมดสรุปผล (แสดงเมื่อลงนามแล้ว - สำหรับดูย้อนหลัง) -->
                            <div
                              v-if="
                                selected &&
                                selected.evaluator_status === 'completed'
                              "
                              class="readonly-mode bg-blue-grey-lighten-5 pa-4 rounded-xl mt-4"
                            >
                              <v-row class="align-center">
                                <!-- 1.1 ถ้าประเภทเป็น yes_no: แสดงผ่าน/ปรับปรุง -->
                                <v-col
                                  v-if="i.type === 'yes_no'"
                                  cols="12"
                                  md="8"
                                >
                                  <div
                                    class="matrix-label mb-2 text-indigo-darken-2"
                                  >
                                    ผลประเมินเบื้องต้น
                                  </div>
                                  <div class="d-flex align-center gap-2">
                                    <v-icon
                                      :color="
                                        form[i.id].value_yes_no == 1
                                          ? 'success'
                                          : 'error'
                                      "
                                    >
                                      {{
                                        form[i.id].value_yes_no == 1
                                          ? "mdi-check-circle"
                                          : "mdi-close-circle"
                                      }}
                                    </v-icon>
                                    <span
                                      :class="
                                        form[i.id].value_yes_no == 1
                                          ? 'text-success'
                                          : 'text-error'
                                      "
                                      class="font-weight-bold"
                                    >
                                      {{
                                        form[i.id].value_yes_no == 1
                                          ? "ผ่านเกณฑ์"
                                          : "ปรับปรุง"
                                      }}
                                    </span>
                                  </div>
                                </v-col>

                                <!-- 1.2 ถ้าประเภทเป็น score_1_4: แสดงคะแนนสไลเดอร์เดิม -->
                                <v-col
                                  v-if="i.type === 'score_1_4'"
                                  cols="12"
                                  md="8"
                                >
                                  <div
                                    class="matrix-label mb-2 text-indigo-darken-2"
                                  >
                                    ระดับคะแนนที่ได้
                                  </div>
                                  <div
                                    class="score-display-badge d-inline-block"
                                    :data-score="form[i.id].score"
                                  >
                                    {{ form[i.id].score }}
                                    {{ getScoreText(form[i.id].score) }}
                                  </div>
                                </v-col>

                                <!-- แสดงช่องข้อเสนอแนะเหมือนกัน -->
                                <v-col cols="12" md="4">
                                  <div
                                    class="matrix-label mb-2 text-indigo-darken-2"
                                  >
                                    ข้อเสนอแนะ
                                  </div>
                                  <div class="text-body-2 text-grey-darken-2">
                                    {{ form[i.id].notes || "-" }}
                                  </div>
                                </v-col>
                              </v-row>
                            </div>

                            <!-- ✍️ โหมดแก้ไข (แสดงเมื่อยังไม่ได้ลงนาม) -->
                            <div v-else>
                              <!-- ✅ เช็คว่ามีหลักฐานไหม -->
                              <div
                                v-if="!hasEvidence(i.id)"
                                class="no-evidence-overlay"
                              >
                                <div
                                  class="no-evidence-content text-center pa-6 rounded-xl bg-blue-grey-lighten-5 border border-dashed"
                                >
                                  <v-icon size="48" color="warning" class="mb-3"
                                    >mdi-file-hidden</v-icon
                                  >
                                  <div
                                    class="text-h6 font-weight-bold text-blue-grey-darken-3 mb-1"
                                  >
                                    รอหลักฐานประกอบการประเมิน
                                  </div>
                                  <div class="text-body-2 text-blue-grey">
                                    ผู้รับการประเมินต้องแนบไฟล์หรือลิงก์ในข้อนี้
                                    จึงจะสามารถทำการให้คะแนนได้
                                  </div>
                                </div>
                              </div>

                              <div v-else>
                                <v-row>
                                  <!-- 2.1 ถ้าประเภทเป็น yes_no: แสดงแค่ Pass / Fail Toggle -->
                                  <v-col v-if="i.type === 'yes_no'" cols="12">
                                    <div class="matrix-label">
                                      การประเมินเบื้องต้น
                                    </div>
                                    <div
                                      class="neo-toggle-group"
                                      style="max-width: 400px"
                                    >
                                      <label class="neo-toggle-btn pass">
                                        <input
                                          type="radio"
                                          v-model="form[i.id].value_yes_no"
                                          value="1"
                                          :name="`toggle_${i.id}`"
                                        />
                                        <div class="toggle-content">
                                          <v-icon size="18"
                                            >mdi-check-circle-outline</v-icon
                                          >
                                          <span>ผ่านเกณฑ์</span>
                                        </div>
                                      </label>
                                      <label class="neo-toggle-btn fail">
                                        <input
                                          type="radio"
                                          v-model="form[i.id].value_yes_no"
                                          value="0"
                                          :name="`toggle_${i.id}`"
                                        />
                                        <div class="toggle-content">
                                          <v-icon size="18"
                                            >mdi-close-circle-outline</v-icon
                                          >
                                          <span>ปรับปรุง</span>
                                        </div>
                                      </label>
                                    </div>
                                  </v-col>

                                  <!-- 2.2 ถ้าประเภทเป็น score_1_4: แสดงแค่สไลเดอร์ระดับคะแนน (0-4) -->
                                  <v-col
                                    v-if="i.type === 'score_1_4'"
                                    cols="12"
                                  >
                                    <div
                                      class="d-flex justify-space-between align-end mb-2"
                                    >
                                      <div class="matrix-label mb-0">
                                        ระดับคะแนน (0-4)
                                      </div>
                                      <div
                                        class="score-display-badge"
                                        :data-score="form[i.id].score"
                                      >
                                        {{ form[i.id].score }} -
                                        {{ getScoreText(form[i.id].score) }}
                                      </div>
                                    </div>
                                    <v-slider
                                      v-model="form[i.id].score"
                                      :min="0"
                                      :max="4"
                                      :step="1"
                                      color="indigo-accent-4"
                                      track-color="indigo-lighten-4"
                                      show-ticks="always"
                                      tick-size="6"
                                      hide-details
                                      class="neo-slider"
                                    >
                                      <template
                                        v-slot:thumb-label="{ modelValue }"
                                      >
                                        <div class="custom-thumb-label">
                                          {{ modelValue }}
                                        </div>
                                      </template>
                                    </v-slider>
                                    <div class="slider-markers">
                                      <span>0</span><span>1</span><span>2</span
                                      ><span>3</span><span>4</span>
                                    </div>
                                  </v-col>
                                </v-row>

                                <!-- Notes Field (ข้อเสนอแนะเพิ่มเติม) -->
                                <div class="mt-6">
                                  <div class="matrix-label">
                                    ข้อเสนอแนะเพิ่มเติม
                                  </div>
                                  <div class="neo-textarea-wrapper">
                                    <textarea
                                      v-model="form[i.id].notes"
                                      class="neo-textarea"
                                      placeholder="ระบุข้อเสนอแนะเพื่อการพัฒนา..."
                                      rows="2"
                                    ></textarea>
                                    <div class="textarea-focus-ring"></div>
                                  </div>
                                </div>

                                <!-- ปุ่มควบคุมรายข้อ -->
                                <div class="d-flex justify-end gap-3 mt-6">
                                  <button
                                    class="micro-btn-danger"
                                    @click="deleteSingle(i.id)"
                                  >
                                    <v-icon size="16"
                                      >mdi-trash-can-outline</v-icon
                                    >
                                  </button>
                                  <button
                                    class="micro-btn-ghost"
                                    @click="saveSingle(i.id, 'draft')"
                                  >
                                    <v-icon size="16" class="me-1"
                                      >mdi-content-save</v-icon
                                    >
                                    ร่าง
                                  </button>
                                  <!-- 🌟 ปุ่มยืนยัน: ถ้าเป็น score_1_4 บังคับไม่ให้ score เป็น 0, ถ้าเป็น yes_no กดยืนยันได้เลย -->
                                  <button
                                    class="micro-btn-success"
                                    :disabled="
                                      i.type === 'score_1_4' &&
                                      form[i.id].score === 0
                                    "
                                    @click="saveSingle(i.id, 'submitted')"
                                  >
                                    <v-icon size="16" class="me-1"
                                      >mdi-check</v-icon
                                    >
                                    ยืนยันข้อนี้
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <!-- สิ้นสุด Scoring Matrix -->
                        </div>
                      </div>
                    </div>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>

          <!-- ============================================== -->
          <!-- SIGNATURE DISPLAY -->
          <!-- ============================================== -->
          <div
            v-if="selected && selected.evaluator_status === 'completed'"
            class="signature-display-section mt-10 stagger-4"
          >
            <v-row justify="center">
              <v-col cols="12" md="6">
                <div class="cyber-sig-card">
                  <div class="card-glow-success"></div>
                  <div class="d-flex align-center gap-4 mb-4 relative-z">
                    <v-icon size="28" color="success"
                      >mdi-check-decagram</v-icon
                    >
                    <h3
                      class="text-h6 font-weight-black text-indigo-darken-4 mb-0"
                    >
                      ผลการประเมินถูกยืนยันแล้ว
                    </h3>
                  </div>

                  <div class="sig-box relative-z">
                    <img
                      v-if="selected.evaluator_signature"
                      :src="selected.evaluator_signature"
                      class="sig-img"
                      alt="ลายเซ็นกรรมการ"
                    />
                    <span v-else class="text-grey">ไม่พบรูปลายเซ็น</span>
                  </div>

                  <div class="sig-details relative-z mt-4 text-center">
                    <p class="font-weight-bold text-indigo-darken-4 mb-1">
                      ลงนามโดย:
                      {{ selected.evaluator_name || "กรรมการผู้ประเมิน" }}
                    </p>
                    <p
                      class="text-caption text-grey-darken-1 mb-0 d-flex align-center justify-center"
                    >
                      <v-icon size="14" class="mr-1">mdi-clock-outline</v-icon>
                      ลงนามเมื่อ:
                      {{
                        selected.evaluator_signed_at
                          ? new Date(
                              selected.evaluator_signed_at,
                            ).toLocaleString("th-TH")
                          : "ไม่ระบุ"
                      }}
                    </p>
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>
        </div>
      </v-fade-transition>
    </v-container>

    <!-- Custom Cyber Toasts -->
    <div class="toast-container">
      <transition-group name="toast-list">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="cyber-toast"
          :class="'toast-' + toast.type"
        >
          <div class="toast-glow"></div>
          <div class="toast-icon">
            <v-icon v-if="toast.type === 'success'" color="success"
              >mdi-check-decagram</v-icon
            >
            <v-icon v-if="toast.type === 'error'" color="error"
              >mdi-alert-circle</v-icon
            >
            <v-icon v-if="toast.type === 'warning'" color="warning"
              >mdi-alert</v-icon
            >
            <v-icon v-if="toast.type === 'info'" color="info"
              >mdi-information</v-icon
            >
          </div>
          <div class="toast-content">
            <div class="toast-title">{{ toast.title }}</div>
            <div class="toast-msg">{{ toast.msg }}</div>
          </div>
        </div>
      </transition-group>
    </div>

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
          กรุณาเซ็นชื่อเพื่อยืนยันผลการประเมิน
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
            <button
              type="button"
              class="dialog-btn-cancel"
              @click="closeSignatureDialog"
            >
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

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@500;700&display=swap");

* {
  font-family: "Prompt", sans-serif !important;
  box-sizing: border-box;
}

.tracking-tight {
  letter-spacing: -0.03em;
}
.relative-z {
  position: relative;
  z-index: 10;
}
.gap-3 {
  gap: 12px;
}
.gap-4 {
  gap: 16px;
}
.gap-6 {
  gap: 24px;
}

@media (min-width: 960px) {
  .border-end-md {
    border-right: 1px solid #e2e8f0;
  }
}

/* =========================================
   1. LAYOUT & HOLOGRAPHIC BACKGROUND
   ========================================= */
.eval-layout {
  min-height: 100vh;
  background-color: #f4f6fa;
  position: relative;
  overflow-x: hidden;
  color: #1e293b;
}

.bg-layer {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

/* 3D Floating Orbs */
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  mix-blend-mode: multiply;
  animation: floatOrb 20s ease-in-out infinite alternate;
}
.orb-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, #818cf8 0%, #c7d2fe 100%);
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}
.orb-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #38bdf8 0%, #bae6fd 100%);
  bottom: -50px;
  right: -50px;
  animation-delay: -5s;
}
.orb-3 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #a78bfa 0%, #ddd6fe 100%);
  top: 40%;
  left: 40%;
  animation-delay: -10s;
}

@keyframes floatOrb {
  0% {
    transform: translate(0, 0) scale(1) rotate(0deg);
  }
  50% {
    transform: translate(100px, 50px) scale(1.1) rotate(180deg);
  }
  100% {
    transform: translate(-50px, 100px) scale(0.9) rotate(360deg);
  }
}

/* Cyber Mesh Grid */
.mesh-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(99, 102, 241, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99, 102, 241, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
  transform: perspective(1000px) rotateX(60deg) translateY(-100px)
    translateZ(-200px);
  transform-origin: top center;
  opacity: 0.4;
  animation: gridMove 20s linear infinite;
}
@keyframes gridMove {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 0 1000px;
  }
}

/* Custom Cursor Aura */
.cursor-aura {
  position: fixed;
  top: -150px;
  left: -150px;
  width: 300px;
  height: 300px;
  background: radial-gradient(
    circle,
    rgba(99, 102, 241, 0.15) 0%,
    transparent 60%
  );
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  transition: transform 0.1s ease-out;
  mix-blend-mode: overlay;
}

/* Particles */
.particles {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}
.sparkle {
  position: absolute;
  width: var(--size);
  height: var(--size);
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 10px var(--color);
  opacity: 0;
  animation: sparkleAnim var(--duration) linear infinite;
  animation-delay: var(--delay);
}
@keyframes sparkleAnim {
  0% {
    transform: translateY(100vh) scale(0);
    opacity: 0;
  }
  50% {
    opacity: var(--max-opacity);
    transform: translateY(50vh) scale(1);
  }
  100% {
    transform: translateY(-10vh) scale(0);
    opacity: 0;
  }
}

.main-container {
  position: relative;
  z-index: 10;
  max-width: 1500px !important;
}

/* =========================================
   2. HEADER & TYPOGRAPHY
   ========================================= */
.hologram-icon-box {
  position: relative;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #3730a3, #4f46e5);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 10px 30px rgba(79, 70, 229, 0.3),
    inset 0 2px 0 rgba(255, 255, 255, 0.2);
}
.hologram-ring {
  position: absolute;
  inset: -4px;
  border-radius: 24px;
  border: 2px dashed rgba(99, 102, 241, 0.4);
  animation: spinSlow 10s linear infinite;
}
@keyframes spinSlow {
  100% {
    transform: rotate(360deg);
  }
}

.gradient-text {
  background: linear-gradient(135deg, #1e1b4b, #4338ca, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% auto;
  animation: shineText 5s linear infinite;
}
@keyframes shineText {
  to {
    background-position: 200% center;
  }
}

.glass-badge {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  padding: 6px 16px;
  border-radius: 99px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
}

.stats-glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.9);
  padding: 16px 32px;
  border-radius: 24px;
  text-align: right;
  position: relative;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(30, 27, 75, 0.05);
}
.stat-value {
  font-family: "Space Grotesk", sans-serif !important;
  font-size: 3rem;
  font-weight: 700;
  line-height: 1;
  color: #312e81;
  background: linear-gradient(to right, #312e81, #4f46e5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.stat-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.stat-glow {
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle,
    rgba(99, 102, 241, 0.15),
    transparent 70%
  );
}

/* =========================================
   3. ULTRA CARDS (Selection View)
   ========================================= */
.ultra-card {
  height: 100%;
  perspective: 1000px;
}
.card-inner {
  height: 100%;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(40px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 32px;
  padding: 32px;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.03),
    inset 0 0 0 1px rgba(255, 255, 255, 0.5);
  transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
  display: flex;
  flex-direction: column;
}
.ultra-card:hover .card-inner {
  transform: translateY(-10px) rotateX(5deg) rotateY(-5deg);
  box-shadow:
    0 30px 60px rgba(79, 70, 229, 0.15),
    inset 0 0 0 2px rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.85);
}

.card-gradient-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(99, 102, 241, 0.1),
    transparent 40%
  );
  opacity: 0;
  transition: opacity 0.5s;
}
.ultra-card:hover .card-gradient-overlay {
  opacity: 1;
}

.card-noise {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.03;
  mix-blend-mode: overlay;
  pointer-events: none;
}

.corner-accents span {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  transition: all 0.3s;
}
.corner-accents span:nth-child(1) {
  top: 20px;
  left: 20px;
  border-top-color: rgba(99, 102, 241, 0.3);
  border-left-color: rgba(99, 102, 241, 0.3);
  border-top-left-radius: 8px;
}
.corner-accents span:nth-child(2) {
  top: 20px;
  right: 20px;
  border-top-color: rgba(99, 102, 241, 0.3);
  border-right-color: rgba(99, 102, 241, 0.3);
  border-top-right-radius: 8px;
}
.corner-accents span:nth-child(3) {
  bottom: 20px;
  left: 20px;
  border-bottom-color: rgba(99, 102, 241, 0.3);
  border-left-color: rgba(99, 102, 241, 0.3);
  border-bottom-left-radius: 8px;
}
.corner-accents span:nth-child(4) {
  bottom: 20px;
  right: 20px;
  border-bottom-color: rgba(99, 102, 241, 0.3);
  border-right-color: rgba(99, 102, 241, 0.3);
  border-bottom-right-radius: 8px;
}
.ultra-card:hover .corner-accents span {
  width: 30px;
  height: 30px;
  border-color: rgba(99, 102, 241, 0.8);
}

.avatar-container {
  position: relative;
}
.premium-avatar {
  background: white;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 3px solid white;
}
.avatar-ring-spin {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    transparent,
    transparent,
    #4f46e5,
    #38bdf8
  );
  animation: spin 3s linear infinite;
  mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #fff 0);
  -webkit-mask: radial-gradient(
    farthest-side,
    transparent calc(100% - 2px),
    #fff 0
  );
  opacity: 0;
  transition: opacity 0.3s;
}
.ultra-card:hover .avatar-ring-spin {
  opacity: 1;
}

.dept-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(99, 102, 241, 0.1);
  color: #4f46e5;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
}

.period-container {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  padding: 16px;
  margin-top: auto;
}
.period-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 4px;
}
.period-value {
  font-size: 1rem;
  color: #1e1b4b;
  font-weight: 800;
  display: flex;
  align-items: center;
}

/* Cyber Button */
.cyber-btn {
  background: linear-gradient(135deg, #312e81, #4f46e5);
  color: white;
  border: none;
  padding: 18px 24px;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 700;
  position: relative;
  overflow: hidden;
  box-shadow: 0 15px 30px rgba(79, 70, 229, 0.3);
  transition: all 0.3s;
  cursor: pointer;
}
.cyber-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 40px rgba(79, 70, 229, 0.4);
}
.btn-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}
.arrow-icon {
  transition: transform 0.3s;
}
.cyber-btn:hover .arrow-icon {
  transform: translateX(8px);
}
.btn-glare {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transform: skewX(-20deg);
  transition: 0s;
}
.cyber-btn:hover .btn-glare {
  left: 200%;
  transition: 0.8s ease-in-out;
}

/* =========================================
   4. COMMAND BAR (EVALUATION VIEW)
   ========================================= */
.command-bar {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(30px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 24px;
  padding: 20px 30px;
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.05),
    inset 0 2px 0 rgba(255, 255, 255, 0.8);
  position: sticky;
  top: 20px;
  z-index: 100;
}
.icon-btn-glass {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.8);
  color: #312e81;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}
.icon-btn-glass:hover {
  background: white;
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(79, 70, 229, 0.15);
}

.eval-target-info {
  flex: 1;
  min-width: 250px;
}
.progress-indicator {
  margin-top: 8px;
}
.progress-bar-bg {
  height: 8px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 99px;
  overflow: hidden;
  margin-top: 6px;
  position: relative;
}
.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  border-radius: 99px;
  transition: width 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
  position: relative;
}
.progress-bar-glow {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 20px;
  background: #fff;
  filter: blur(4px);
  opacity: 0.5;
  animation: slideRight 2s infinite;
}
@keyframes slideRight {
  0% {
    transform: translateX(-100px);
  }
  100% {
    transform: translateX(50px);
  }
}

.action-cluster {
  display: flex;
  gap: 12px;
}
.action-btn-danger,
.action-btn-ghost,
.action-btn-primary {
  padding: 12px 24px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}
.action-btn-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}
.action-btn-danger:hover {
  background: #ef4444;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(239, 68, 68, 0.2);
}
.action-btn-ghost {
  background: rgba(255, 255, 255, 0.6);
  color: #4b5563;
  border: 1px solid rgba(203, 213, 225, 0.8);
}
.action-btn-ghost:hover {
  background: white;
  color: #1e293b;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}
.action-btn-primary {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
}
.action-btn-primary:hover {
  box-shadow: 0 15px 35px rgba(16, 185, 129, 0.4);
  transform: translateY(-2px) scale(1.02);
}

/* =========================================
   5. ULTRA PANELS & INDICATORS
   ========================================= */
.ultra-panels {
  background: transparent !important;
}
.ultra-panel {
  background: rgba(255, 255, 255, 0.6) !important;
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.8) !important;
  border-radius: 24px !important;
  margin-bottom: 24px !important;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.03) !important;
  transition: all 0.4s;
}
.ultra-panel:hover {
  border-color: rgba(165, 180, 252, 0.6) !important;
  box-shadow: 0 20px 45px rgba(79, 70, 229, 0.08) !important;
}
.ultra-panel-title {
  padding: 24px 32px !important;
  background: rgba(255, 255, 255, 0.4) !important;
}

.topic-hex-icon {
  width: 44px;
  height: 44px;
  background: #312e81;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 1.2rem;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.3);
}
.topic-counter {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.2);
  padding: 6px 16px;
  border-radius: 99px;
  font-weight: 700;
  color: #4f46e5;
  font-size: 0.85rem;
}

.ultra-panel-content {
  padding: 0 !important;
}
.indicators-grid {
  padding: 24px 32px;
  background: rgba(248, 250, 252, 0.4);
  border-top: 1px solid rgba(255, 255, 255, 0.5);
}

/* Individual Indicator Card */
.neo-indicator-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 24px;
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.02);
  transition: all 0.4s;
}
.neo-indicator-card:hover {
  transform: translateY(-4px) scale(1.005);
  box-shadow: 0 20px 40px rgba(79, 70, 229, 0.06);
  border-color: #cbd5e1;
}

.card-status-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 100%;
  background: #cbd5e1;
  transition: all 0.4s;
}
.card-done {
  border-color: #a7f3d0;
  background: linear-gradient(145deg, #ffffff, #f0fdf4);
}
.card-done .card-status-glow {
  background: #10b981;
  box-shadow: 0 0 15px #10b981;
}
.card-submitted {
  border-color: #bfdbfe;
  background: linear-gradient(145deg, #ffffff, #eff6ff);
}
.card-submitted .card-status-glow {
  background: #3b82f6;
  box-shadow: 0 0 15px #3b82f6;
}

/* Number Sphere */
.number-sphere-wrap {
  flex-shrink: 0;
  position: relative;
}
.number-sphere {
  width: 54px;
  height: 54px;
  background: #f1f5f9;
  border: 2px solid #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 900;
  color: #64748b;
  transition: all 0.4s;
  position: relative;
}
.number-sphere.is-done {
  background: #10b981;
  border-color: #059669;
  color: white;
  box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
}
.done-check {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: white;
  color: #10b981;
  border-radius: 50%;
  padding: 2px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* Cyber Attachments */
.cyber-attachments {
  background: rgba(241, 245, 249, 0.6);
  border: 1px dashed #cbd5e1;
  border-radius: 16px;
  padding: 16px;
}
.att-header {
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
}
.att-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.cyber-file-chip {
  display: inline-flex;
  align-items: center;
  background: white;
  border: 1px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 12px;
  text-decoration: none;
  color: #334155;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  transition: all 0.3s;
}
.cyber-file-chip:hover {
  border-color: #6366f1;
  background: #eef2ff;
  color: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(99, 102, 241, 0.1);
}
.file-action {
  margin-left: 12px;
  opacity: 0.5;
  transition: opacity 0.3s;
}
.cyber-file-chip:hover .file-action {
  opacity: 1;
  transform: translateY(2px);
}

.cyber-link-card {
  background: white;
  transition: all 0.3s;
}
.cyber-link-card:hover {
  border-color: #14b8a6 !important;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.1);
  transform: translateY(-2px);
}

.divider-glow {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(99, 102, 241, 0.2),
    transparent
  );
}

/* Scoring Matrix */
.matrix-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.readonly-mode {
  border-left: 4px solid #3b82f6;
}

.neo-toggle-group {
  display: flex;
  gap: 12px;
}
.neo-toggle-btn {
  flex: 1;
  cursor: pointer;
}
.neo-toggle-btn input {
  display: none;
}
.toggle-content {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 14px;
  text-align: center;
  font-weight: 700;
  color: #64748b;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.neo-toggle-btn:hover .toggle-content {
  background: #f1f5f9;
  border-color: #cbd5e1;
}
.neo-toggle-btn.pass input:checked + .toggle-content {
  background: #ecfdf5;
  border-color: #10b981;
  color: #059669;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.15);
}
.neo-toggle-btn.fail input:checked + .toggle-content {
  background: #fef2f2;
  border-color: #ef4444;
  color: #dc2626;
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.15);
}

.score-display-badge {
  background: #1e1b4b;
  color: white;
  font-weight: 800;
  font-size: 0.85rem;
  padding: 6px 16px;
  border-radius: 99px;
  box-shadow: 0 4px 15px rgba(30, 27, 75, 0.2);
}
.score-display-badge[data-score="0"] {
  background: #94a3b8;
}
.score-display-badge[data-score="1"] {
  background: #ef4444;
}
.score-display-badge[data-score="2"] {
  background: #f59e0b;
}
.score-display-badge[data-score="3"] {
  background: #3b82f6;
}
.score-display-badge[data-score="4"] {
  background: #10b981;
}

.neo-slider {
  margin-top: 24px;
}
.neo-slider :deep(.v-slider-thumb) {
  width: 24px;
  height: 24px;
  background: white;
  border: 4px solid #4f46e5;
  box-shadow:
    0 0 0 4px rgba(79, 70, 229, 0.1),
    0 4px 10px rgba(0, 0, 0, 0.2) !important;
  transition: transform 0.2s;
}
.neo-slider :deep(.v-slider-thumb:hover) {
  transform: scale(1.3);
}
.custom-thumb-label {
  background: #1e1b4b;
  color: white;
  font-weight: 900;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 14px;
}
.slider-markers {
  display: flex;
  justify-content: space-between;
  padding: 0 6px;
  margin-top: 8px;
}
.slider-markers span {
  font-size: 12px;
  font-weight: 800;
  color: #94a3b8;
  width: 20px;
  text-align: center;
}

.neo-textarea-wrapper {
  position: relative;
}
.neo-textarea {
  width: 100%;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px;
  font-size: 0.95rem;
  color: #1e293b;
  resize: none;
  transition: all 0.3s;
  outline: none;
}
.neo-textarea:focus {
  background: white;
  border-color: #6366f1;
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.1);
}

.micro-btn-danger,
.micro-btn-ghost,
.micro-btn-success {
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
}
.micro-btn-danger {
  color: #dc2626;
  background: transparent;
}
.micro-btn-danger:hover {
  background: #fef2f2;
}
.micro-btn-ghost {
  color: #4b5563;
  background: #f1f5f9;
}
.micro-btn-ghost:hover {
  background: #e2e8f0;
}
.micro-btn-success {
  background: #1e1b4b;
  color: white;
  box-shadow: 0 4px 15px rgba(30, 27, 75, 0.2);
}
.micro-btn-success:not(:disabled):hover {
  background: #312e81;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(49, 46, 129, 0.3);
}
.micro-btn-success:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

/* =========================================
   6. CUSTOM TOAST SYSTEM
   ========================================= */
.toast-container {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 16px;
  pointer-events: none;
}

.cyber-toast {
  pointer-events: auto;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 24px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow:
    0 15px 30px rgba(0, 0, 0, 0.2),
    0 0 0 1px inset rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
  min-width: 300px;
}
.toast-glow {
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
}
.toast-success .toast-glow {
  background: #10b981;
  box-shadow: 0 0 15px #10b981;
}
.toast-error .toast-glow {
  background: #ef4444;
  box-shadow: 0 0 15px #ef4444;
}
.toast-warning .toast-glow {
  background: #f59e0b;
  box-shadow: 0 0 15px #f59e0b;
}
.toast-info .toast-glow {
  background: #3b82f6;
  box-shadow: 0 0 15px #3b82f6;
}

.toast-icon {
  background: rgba(255, 255, 255, 0.05);
  padding: 8px;
  border-radius: 50%;
}

.toast-content {
  flex: 1;
}
.toast-title {
  font-weight: 800;
  font-size: 1rem;
  color: white;
  margin-bottom: 2px;
}
.toast-msg {
  font-size: 0.85rem;
  color: #94a3b8;
}

/* Toast Animations */
.toast-list-enter-active,
.toast-list-leave-active {
  transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.toast-list-enter-from {
  opacity: 0;
  transform: translateX(50px) scale(0.9);
}
.toast-list-leave-to {
  opacity: 0;
  transform: translateX(50px) scale(0.9);
}

/* =========================================
   7. CYBER CONFIRM DIALOG & SIGNATURE
   ========================================= */
.cyber-dialog :deep(.v-overlay__content) {
  border-radius: 28px !important;
}

.cyber-confirm-card {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 28px;
  padding: 40px 32px;
  position: relative;
  overflow: hidden;
}

.cyber-confirm-card.border-danger {
  box-shadow:
    inset 0 0 0 2px rgba(239, 68, 68, 0.3),
    0 20px 40px rgba(0, 0, 0, 0.5);
}
.cyber-confirm-card.border-warning {
  box-shadow:
    inset 0 0 0 2px rgba(245, 158, 11, 0.3),
    0 20px 40px rgba(0, 0, 0, 0.5);
}
.cyber-confirm-card.border-info {
  box-shadow:
    inset 0 0 0 2px rgba(59, 130, 246, 0.3),
    0 20px 40px rgba(0, 0, 0, 0.5);
}

.confirm-gradient-bg {
  position: absolute;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 200px;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.3;
  pointer-events: none;
}
.border-danger .confirm-gradient-bg {
  background: #ef4444;
}
.border-warning .confirm-gradient-bg {
  background: #f59e0b;
}
.border-info .confirm-gradient-bg {
  background: #3b82f6;
}

.confirm-icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.icon-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  animation: spin 8s linear infinite;
}
.icon-bg-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.2);
}
.icon-bg-warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.2);
}
.icon-bg-info {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
}

.dialog-btn-cancel,
.dialog-btn-confirm {
  padding: 12px 24px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dialog-btn-cancel {
  background: rgba(255, 255, 255, 0.05);
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.dialog-btn-cancel:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.dialog-btn-confirm.btn-danger {
  background: linear-gradient(135deg, #ef4444, #b91c1c);
  color: white;
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
  border: none;
}
.dialog-btn-confirm.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(239, 68, 68, 0.4);
}

.dialog-btn-confirm.btn-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
  border: none;
}
.dialog-btn-confirm.btn-warning:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(245, 158, 11, 0.4);
}

.dialog-btn-confirm.btn-info {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
  border: none;
}
.dialog-btn-confirm.btn-info:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(59, 130, 246, 0.4);
}

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

/* Signature Display Card */
.cyber-sig-card {
  background: white;
  border-radius: 20px;
  padding: 32px;
  position: relative;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
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

/* =========================================
   ANIMATIONS (Staggering)
   ========================================= */
.stagger-1 {
  animation: fadeUpSpin 0.8s 0.1s both cubic-bezier(0.2, 0.8, 0.2, 1);
}
.stagger-2 {
  animation: fadeUpSpin 0.8s 0.2s both cubic-bezier(0.2, 0.8, 0.2, 1);
}
.stagger-3 {
  animation: fadeUpSpin 0.8s 0.3s both cubic-bezier(0.2, 0.8, 0.2, 1);
}
.stagger-4 {
  animation: fadeUpSpin 0.8s 0.4s both cubic-bezier(0.2, 0.8, 0.2, 1);
}
.stagger-5 {
  animation: fadeUpSpin 0.8s 0.5s both cubic-bezier(0.2, 0.8, 0.2, 1);
}

@keyframes fadeUpSpin {
  0% {
    opacity: 0;
    transform: translateY(40px) scale(0.95) rotateX(-10deg);
    filter: blur(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1) rotateX(0);
    filter: blur(0);
  }
}
</style>

<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const router = useRouter();
const api = ref(null);
const assignments = ref([]);
const attachments = ref([]);
const indicators = ref([]);
const selected = ref(null);
const form = ref({});

// ✅ เพิ่ม: state สำหรับ copy link feedback
const copiedLinkId = ref(null);

// Custom Toast & Modal State
const toasts = ref([]);
let toastIdCounter = 0;

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

function showToast(title, msg, type = "info") {
  const id = toastIdCounter++;
  toasts.value.push({ id, title, msg, type });
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }, 4000);
}

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

// Cursor logic
const mouseX = ref(0);
const mouseY = ref(0);

function handleMouseMove(e) {
  mouseX.value = e.clientX;
  mouseY.value = e.clientY;

  document.querySelectorAll(".ultra-card").forEach((card) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  });
}

function sparkleStyle(n) {
  const rand = (min, max) => Math.random() * (max - min) + min;
  const colors = ["#818cf8", "#38bdf8", "#a78bfa", "#fbcfe8", "#ffffff"];
  return {
    "--size": rand(2, 6) + "px",
    "--color": colors[n % colors.length],
    "--duration": rand(8, 20) + "s",
    "--delay": rand(-20, 0) + "s",
    "--max-opacity": rand(0.3, 0.8),
    left: rand(0, 100) + "vw",
  };
}

let authChecker = null;

const forceLogout = () => {
  localStorage.clear();
  router.push("/");
};

// ตรวจสอบว่าข้อดังกล่าวประเมินเสร็จแล้วหรือยัง
function isGraded(indicatorId) {
  const i = indicators.value.find((ind) => ind.id === indicatorId);
  const f = form.value[indicatorId];
  if (!i || !f) return false;

  if (i.type === "score_1_4") {
    return f.score > 0;
  } else if (i.type === "yes_no") {
    return f.value_yes_no === "1" || f.value_yes_no === "0";
  }
  // ถ้าไม่มีประเภทที่ต้องให้คะแนน ถือว่าประเมินผ่าน (เช่น มีแค่ช่องให้อ่าน/แนบหลักฐาน)
  return true;
}

onMounted(() => {
  const token = localStorage.getItem("auth_token");
  if (!token) {
    forceLogout();
    return;
  }

  api.value = axios.create({
    baseURL: "http://localhost:7000/api/evaluator",
    headers: { Authorization: "Bearer " + token },
  });

  api.value.interceptors.response.use(
    (response) => response,
    (error) => {
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      )
        forceLogout();
      return Promise.reject(error);
    },
  );

  loadAssignments();

  authChecker = setInterval(() => {
    if (!localStorage.getItem("auth_token")) forceLogout();
  }, 500);

  window.addEventListener("storage", (e) => {
    if (e.key === "auth_token" && !e.newValue) forceLogout();
  });
});

onUnmounted(() => {
  if (authChecker) clearInterval(authChecker);
});

const topicGroups = [
  { code: "TOP1", name: "ด้านการจัดการเรียนการสอน" },
  { code: "TOP2", name: "ด้านการบริหารจัดการชั้นเรียน" },
  { code: "TOP3", name: "ด้านการพัฒนาตนเองและวิชาชีพ" },
  { code: "TOP4", name: "ด้านงานอื่นๆ ที่ได้รับมอบหมาย" },
];

const totalIndicators = computed(() => indicators.value.length);
const gradedCount = computed(
  () => indicators.value.filter((i) => isGraded(i.id)).length,
);

const getScoreText = (score) => {
  if (!score || score === 0) return "รอการประเมิน";
  const texts = {
    1: "ต่ำกว่าที่คาดหวังมาก",
    2: "ต่ำกว่าที่คาดหวัง",
    3: "ตรงตามที่คาดหวัง",
    4: "สูงกว่าที่คาดหวัง",
  };
  return texts[score];
};

const getCardStatusClass = (indicatorId) => {
  const f = form.value[indicatorId];
  const hasFiles = filesByIndicator(indicatorId).length > 0;
  if (f?.status === "submitted" || f?.status === "completed")
    return "card-submitted";
  if (isGraded(indicatorId)) return "card-done";
  if (hasFiles) return "card-pending-files";
  return "";
};

function getIndicatorsByTopic(topicCode) {
  return indicators.value.filter((ind) => ind.topic_code === topicCode);
}

// ✅ 1. เช็คว่าเป็น Web Link หรือไม่ (ตรวจจับคำคีย์เวิร์ดของลิงก์ และรองรับทั้ง Object และ String)
const isWebLink = (item) => {
  const pathVal = typeof item === "string" ? item : item?.storage_path || "";
  const nameVal = typeof item === "string" ? "" : item?.file_name || "";
  const mimeVal = typeof item === "string" ? "" : item?.mime_type || "";

  const path = String(pathVal).toLowerCase().trim();
  const name = String(nameVal).toLowerCase().trim();
  const mime = String(mimeVal).toLowerCase().trim();

  if (
    mime === "url" ||
    mime === "link" ||
    mime.includes("html") ||
    (item && item.size_bytes === 0)
  ) {
    return true;
  }

  const webPattern =
    /https?:\/\/|www\.|google\.|drive\.|docs\.|link|share|forms?/i;
  if (webPattern.test(path) || webPattern.test(name)) {
    return true;
  }

  const fileExtensions =
    /\.(pdf|docx?|xlsx?|pptx?|zip|rar|png|jpe?g|webp|gif|txt|csv)$/i;
  if (fileExtensions.test(path) || fileExtensions.test(name)) {
    return false;
  }

  return !path.includes(".");
};

// ✅ 2. ดึง URL ของลิงก์ที่สมบูรณ์
const getLinkUrl = (item) => {
  let url = item.link_url || item.storage_path || "";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }
  return url;
};

// ✅ 3. กรองเฉพาะ "ไฟล์แนบ"
function filesByIndicator(indicatorId) {
  return attachments.value.filter(
    (a) => a.indicator_id === indicatorId && !isWebLink(a),
  );
}

// ✅ 4. กรองเฉพาะ "ลิงก์แนบ"
function linksByIndicator(indicatorId) {
  return attachments.value.filter(
    (a) => a.indicator_id === indicatorId && isWebLink(a),
  );
}

// ✅ ฟังก์ชันเช็คว่ามีเอกสารอ้างอิงหรือไม่
function hasEvidence(indicatorId) {
  const files = filesByIndicator(indicatorId);
  const links = linksByIndicator(indicatorId);
  return files.length > 0 || links.length > 0;
}

// ✅ 5. คัดลอกลิงก์
async function copyLink(url) {
  try {
    await navigator.clipboard.writeText(url);
    showToast("สำเร็จ", "คัดลอกลิงก์อ้างอิงเรียบร้อยแล้ว", "success");
  } catch {
    const el = document.createElement("textarea");
    el.value = url;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    showToast("สำเร็จ", "คัดลอกลิงก์อ้างอิงเรียบร้อยแล้ว", "success");
  }
}

// ==========================================
// SIGNATURE LOGIC
// ==========================================
const signatureDialog = ref({ show: false });
const signatureCanvas = ref(null);
const hasDrawn = ref(false);
let isDrawing = false;
let ctx = null;

function openSignatureDialog() {
  const gradedCountNum = indicators.value.filter((i) => isGraded(i.id)).length;
  if (gradedCountNum === 0) {
    showConfirm(
      {
        title: "ไม่สามารถส่งข้อมูลได้",
        message: "คุณยังไม่ได้ประเมินคะแนนในข้อใดเลย ไม่สามารถดำเนินการยืนยันผลและลงนามได้",
        type: "warning",
        icon: "mdi-alert-circle-outline",
        confirmText: "ตกลง",
        confirmIcon: "mdi-check",
      },
      () => {
        closeConfirm();
      }
    );
    return;
  }
  if (gradedCountNum < totalIndicators.value) {
    showConfirm(
      {
        title: "ข้อมูลยังไม่ครบถ้วน",
        message: `คุณประเมินไปแล้ว ${gradedCountNum} จาก ${totalIndicators.value} ข้อ คุณแน่ใจหรือไม่ที่จะส่งยืนยันผลไปทั้งที่ยังไม่ครบ?`,
        type: "warning",
        icon: "mdi-alert-decagram",
        confirmText: "ดำเนินการต่อ",
        confirmIcon: "mdi-send-check",
      },
      () => {
        signatureDialog.value.show = true;
        setTimeout(initSignatureCanvas, 100);
      },
    );
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
  ctx = canvas.getContext("2d");
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#1e1b4b";
}

function getPos(e) {
  const rect = signatureCanvas.value.getBoundingClientRect();
  const clientX = e.clientX || (e.touches && e.touches[0].clientX);
  const clientY = e.clientY || (e.touches && e.touches[0].clientY);
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}

function startDrawing(e) {
  isDrawing = true;
  hasDrawn.value = true;
  const pos = getPos(e);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
}
function startDrawingTouch(e) {
  e.preventDefault();
  startDrawing(e);
}

function draw(e) {
  if (!isDrawing) return;
  const pos = getPos(e);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
}
function drawTouch(e) {
  e.preventDefault();
  draw(e);
}

function stopDrawing() {
  isDrawing = false;
}

function clearSignature() {
  if (!ctx || !signatureCanvas.value) return;
  ctx.clearRect(
    0,
    0,
    signatureCanvas.value.width,
    signatureCanvas.value.height,
  );
  hasDrawn.value = false;
}

async function submitSignature() {
  if (!hasDrawn.value) return;
  const dataUrl = signatureCanvas.value.toDataURL("image/png");
  await save("completed", dataUrl);
  closeSignatureDialog();
}

// ==========================================
// API LOGIC
// ==========================================
async function loadAssignments() {
  try {
    const { data } = await api.value.get("/my-assignments");
    assignments.value = data.data;
  } catch (error) {}
}

async function openEvaluate(row) {
  try {
    selected.value = { ...row };
    const [att, ind, res] = await Promise.all([
      api.value.get("/attachments", {
        params: { evaluatee_id: row.evaluatee_id, period_id: row.period_id },
      }),
      api.value.get("/indicators"),
      api.value.get("/results", {
        params: { evaluatee_id: row.evaluatee_id, period_id: row.period_id },
      }),
    ]);

    attachments.value = att.data.data;
    indicators.value = ind.data.data.map((item, index) => {
      let assignedTopic = "";
      const codeStr = String(item.code || "").trim();
      if (/^1/.test(codeStr)) assignedTopic = "TOP1";
      else if (/^2/.test(codeStr)) assignedTopic = "TOP2";
      else if (/^3/.test(codeStr)) assignedTopic = "TOP3";
      else if (/^4/.test(codeStr)) assignedTopic = "TOP4";

      if (!assignedTopic) {
        if (index < 8) assignedTopic = "TOP1";
        else if (index < 12) assignedTopic = "TOP2";
        else if (index < 15) assignedTopic = "TOP3";
        else assignedTopic = "TOP4";
      }
      return { ...item, topic_code: assignedTopic, display_idx: index + 1 };
    });

    form.value = {};
    indicators.value.forEach((i) => {
      const old = res.data.data.find((r) => r.indicator_id === i.id) || {};
      form.value[i.id] = {
        score: old.score || 0,
        value_yes_no:
          old.value_yes_no !== undefined && old.value_yes_no !== null
            ? old.value_yes_no.toString()
            : null,
        notes: old.notes || "",
        status: old.status || "draft",
      };
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    showToast("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลการประเมินได้", "error");
  }
}

async function saveSingle(indicatorId, statusType = "draft") {
  const i = indicators.value.find((ind) => ind.id === indicatorId);
  const f = form.value[indicatorId];

  if (!hasEvidence(indicatorId)) {
    showToast(
      "ไม่มีหลักฐาน",
      "กรุณาแนบไฟล์หรือลิงก์อ้างอิงก่อนบันทึกคะแนน",
      "warning",
    );
    return;
  }

  if (statusType === "submitted" && !isGraded(indicatorId)) {
    showToast(
      "ข้อมูลไม่ครบถ้วน",
      "กรุณาระบุระดับคะแนนก่อนกดยืนยันผล",
      "warning",
    );
    return;
  }

  const payload = [
    {
      period_id: selected.value.period_id,
      evaluatee_id: selected.value.evaluatee_id,
      topic_id: i.topic_id,
      indicator_id: i.id,
      score: i.type === "score_1_4" ? f.score || 0 : null,
      value_yes_no:
        i.type === "yes_no"
          ? f.value_yes_no !== undefined
            ? f.value_yes_no
            : null
          : null,
      notes: f.notes,
      status: statusType,
    },
  ];

  try {
    await api.value.post("/save", payload);
    f.status = statusType;
    showToast(
      "สำเร็จ",
      statusType === "draft"
        ? "บันทึกร่างข้อนี้เรียบร้อยแล้ว"
        : "ยืนยันผลการประเมินข้อนี้เรียบร้อยแล้ว",
      "success",
    );
  } catch (err) {
    if (err.response?.status !== 401) {
      showToast("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้", "error");
    }
  }
}

async function save(statusType = "submitted", signatureData = null) {
  const gradedCount = indicators.value.filter((i) => isGraded(i.id)).length;
  if (gradedCount === 0) {
    showConfirm(
      {
        title: "ไม่พบข้อมูลคะแนนประเมิน",
        message: statusType === "draft"
          ? "คุณยังไม่ได้ให้คะแนนประเมินในข้อใดเลย กรุณากรอกคะแนนอย่างน้อย 1 ข้อ ก่อนบันทึกร่าง"
          : "คุณยังไม่ได้ให้คะแนนประเมินในข้อใดเลย ไม่สามารถดำเนินการยืนยันผลได้",
        type: "warning",
        icon: "mdi-alert-circle-outline",
        confirmText: "ตกลง",
        confirmIcon: "mdi-check",
      },
      () => {
        closeConfirm();
      }
    );
    return;
  }

  // สำหรับการร่างข้อมูล สามารถบันทึกข้อที่ประเมินแล้วได้เลย (ไม่จำเป็นต้องมีเอกสารแนบพร้อม)
  // แต่สำหรับส่งผลจริง (submitted/completed) จะกรองตามกฎเดิม
  const rowsToSave = indicators.value.filter(
    (i) => isGraded(i.id) && (statusType === "draft" || hasEvidence(i.id))
  );

  if (
    rowsToSave.length === 0 &&
    (statusType === "submitted" || statusType === "completed")
  ) {
    showToast(
      "ไม่มีข้อมูล",
      "ยังไม่มีรายการใดที่ให้คะแนนและมีเอกสารแนบเลย",
      "warning",
    );
    return;
  }

  const doSave = async () => {
    const payload = rowsToSave.map((i) => ({
      period_id: selected.value.period_id,
      evaluatee_id: selected.value.evaluatee_id,
      topic_id: i.topic_id,
      indicator_id: i.id,
      score: i.type === "score_1_4" ? form.value[i.id].score || 0 : null,
      value_yes_no:
        i.type === "yes_no"
          ? form.value[i.id].value_yes_no !== undefined
            ? form.value[i.id].value_yes_no
            : null
          : null,
      notes: form.value[i.id].notes,
      status: statusType === "completed" ? "submitted" : statusType,
    }));

    try {
      // 1. บันทึกผลคะแนนรายข้อทั้งหมดเข้าฐานข้อมูล
      await api.value.post("/save", payload);

      // 2. ถ้าเป็นการยืนยันและลงนาม ให้ยิงไปที่ Endpoint สำหรับลงนามโดยเฉพาะ
      if (statusType === "completed" && signatureData) {
        await api.value.post("/submit", {
          evaluatee_id: selected.value.evaluatee_id,
          period_id: selected.value.period_id,
          signature: signatureData,
        });
      }

      showToast(
        "บันทึกสำเร็จ",
        statusType === "draft"
          ? "บันทึกร่างทั้งหมดเรียบร้อย"
          : "ส่งผลการประเมินเข้าระบบเรียบร้อย",
        "success",
      );
      if (statusType === "submitted" || statusType === "completed") {
        setTimeout(() => back(), 1500);
      }
    } catch (err) {
      if (err.response?.status !== 401) {
        showToast(
          "ผิดพลาด",
          err.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
          "error",
        );
      }
    }
  };

  if (statusType === "submitted" && rowsToSave.length < totalIndicators.value) {
    showConfirm(
      {
        title: "ข้อมูลยังไม่ครบถ้วน",
        message: `คุณประเมินไปแล้ว ${rowsToSave.length} จาก ${totalIndicators.value} ข้อ คุณแน่ใจหรือไม่ที่จะส่งยืนยันผลไปทั้งที่ยังไม่ครบ?`,
        type: "warning",
        icon: "mdi-alert-decagram",
        confirmText: "ส่งยืนยันผล",
        confirmIcon: "mdi-send-check",
      },
      doSave,
    );
  } else if (statusType === "submitted") {
    showConfirm(
      {
        title: "ยืนยันการส่งผลประเมิน",
        message:
          "ตรวจสอบข้อมูลครบถ้วนแล้วใช่หรือไม่ หากยืนยันแล้วผลประเมินจะถูกส่งเข้าระบบทันที",
        type: "info",
        icon: "mdi-check-decagram",
        confirmText: "ยืนยันและส่งผล",
        confirmIcon: "mdi-check-all",
      },
      doSave,
    );
  } else {
    // Draft or Completed (Signature already confirmed)
    doSave();
  }
}

async function deleteAll() {
  const gradedCount = indicators.value.filter((i) => isGraded(i.id)).length;
  if (gradedCount === 0) {
    showConfirm(
      {
        title: "ไม่พบข้อมูลคะแนนประเมิน",
        message: "คุณยังไม่ได้ระบุคะแนนในข้อใดเลย จึงไม่มีข้อมูลคะแนนประเมินสำหรับการล้างข้อมูล",
        type: "warning",
        icon: "mdi-alert-circle-outline",
        confirmText: "ตกลง",
        confirmIcon: "mdi-check",
      },
      () => {
        closeConfirm();
      }
    );
    return;
  }

  showConfirm(
    {
      title: "ยืนยันล้างข้อมูล",
      message:
        'การดำเนินการนี้จะล้างคะแนนที่คุณประเมินไว้ "ทั้งหมด" สำหรับบุคคลนี้ คุณแน่ใจหรือไม่?',
      type: "danger",
      icon: "mdi-delete-alert",
      confirmText: "ล้างข้อมูลทั้งหมด",
      confirmIcon: "mdi-delete-sweep",
    },
    async () => {
      try {
        await api.value.delete("/results/all", {
          params: {
            evaluatee_id: selected.value.evaluatee_id,
            period_id: selected.value.period_id,
          },
        });

        Object.keys(form.value).forEach((id) => {
          form.value[id] = {
            score: 0,
            value_yes_no: null,
            notes: "",
            status: "draft",
          };
        });

        showToast("สำเร็จ", "ล้างผลการประเมินทั้งหมดเรียบร้อยแล้ว", "success");
      } catch (err) {
        showToast(
          "เกิดข้อผิดพลาด",
          "ไม่สามารถล้างข้อมูลได้ กรุณาลองใหม่",
          "error",
        );
      }
    },
  );
}

async function deleteSingle(indicatorId) {
  showConfirm(
    {
      title: "ลบผลการประเมินข้อนี้",
      message: "ต้องการลบผลการให้คะแนนและคำแนะนำในข้อนี้ใช่หรือไม่?",
      type: "danger",
      icon: "mdi-trash-can",
      confirmText: "ลบข้อมูลข้อนี้",
      confirmIcon: "mdi-delete",
    },
    async () => {
      try {
        await api.value.delete(`/result/${indicatorId}`, {
          params: {
            evaluatee_id: selected.value.evaluatee_id,
            period_id: selected.value.period_id,
          },
        });

        form.value[indicatorId] = {
          score: 0,
          value_yes_no: null,
          notes: "",
          status: "draft",
        };

        showToast("สำเร็จ", "ลบข้อมูลข้อนี้เรียบร้อยแล้ว", "success");
      } catch (err) {
        showToast("ผิดพลาด", "ไม่สามารถลบข้อมูลได้", "error");
      }
    },
  );
}

function back() {
  selected.value = null;
  attachments.value = [];
  indicators.value = [];
  form.value = {};
}
</script>
