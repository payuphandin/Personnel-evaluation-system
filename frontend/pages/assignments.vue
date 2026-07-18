<template>
  <div class="dashboard-page">
    <!-- ===== PAGE HEADER ===== -->
    <div class="page-header mb-8">
      <div class="header-left">
        <div class="page-icon-wrap" style="background: linear-gradient(135deg, #0f172a, #312e81)">
          <v-icon icon="mdi-account-switch-outline" size="24" color="white" />
        </div>
        <div>
          <h1 class="page-title">จัดการการจับคู่รอบประเมิน</h1>
          <p class="page-subtitle">
            กำหนดความสัมพันธ์ระหว่างผู้ประเมินและผู้รับการประเมินได้อย่างง่ายดาย
          </p>
        </div>
      </div>
      <div class="header-actions">
        <div class="summary-chip shadow-sm">
          <div class="pulse-dot"></div>
          <span class="chip-label">เชื่อมโยงแล้ว</span>
          <span class="chip-val text-indigo-darken-4">{{ assignments.length }} คู่</span>
        </div>
      </div>
    </div>

    <v-row>
      <!-- ===== LEFT: CONNECTION CARDS (รายการจับคู่) ===== -->
      <v-col cols="12" lg="8">
        <!-- Header Section -->
        <div class="d-flex align-center justify-space-between mb-4 px-2 anim-1">
          <div class="d-flex align-center">
            <v-icon color="indigo-darken-2" class="me-2" size="20">mdi-vector-link</v-icon>
            <h2 class="text-h6 font-weight-black text-indigo-darken-4 mb-0">
              รายการจับคู่ปัจจุบัน
            </h2>
          </div>

          <!-- Optional: Filter or Search could go here -->
          <div
            class="text-caption font-weight-bold text-blue-grey-darken-1 bg-white px-3 py-1 rounded-xl shadow-sm border">
            แสดงทั้งหมด {{ assignments.length }} คู่
            (จัดกลุ่มตามผู้รับการประเมิน {{ groupedAssignments.length }} กลุ่ม)
          </div>
        </div>

        <div v-if="groupedAssignments.length > 0" class="cards-container">
          <div v-for="(group, index) in groupedAssignments" :key="group.key" class="connection-card mb-4"
            :class="`anim-${(index % 5) + 2}`">
            <div class="connection-card-bg"></div>

            <div class="card-inner d-flex flex-column flex-sm-row align-start justify-space-between w-100 gap-6">
              <!-- Evaluators list on the left (ผู้ประเมินทุกคน) -->
              <div class="person-node evaluator-node text-center text-sm-left d-flex flex-column gap-3 w-100"
                style="flex: 1.2; min-width: 250px">
                <div v-for="evalr in group.evaluators" :key="evalr.id"
                  class="evaluator-sub-item pb-3 border-bottom-dashed">
                  <!-- Header: Role badge and assignment ID -->
                  <div class="d-flex align-center justify-center justify-sm-start flex-wrap mb-2">
                    <div class="role-badge me-2" :class="evalr.evaluator_role === 'chairman'
                        ? 'badge-chairman'
                        : 'badge-joint'
                      ">
                      <v-icon size="12" class="me-1">
                        {{
                          evalr.evaluator_role === "chairman"
                            ? "mdi-shield-crown"
                            : "mdi-account-multiple"
                        }}
                      </v-icon>
                      {{
                        evalr.evaluator_role === "chairman"
                          ? "ประธานกรรมการ"
                          : "กรรมการร่วม"
                      }}
                    </div>
                    <span
                      class="text-caption font-weight-bold text-blue-grey-darken-1 bg-grey-lighten-4 px-2 py-0.5 rounded-pill border"
                      style="font-size: 10px !important; line-height: 1">
                      ID: {{ evalr.id }}
                    </span>

                    <!-- Action buttons -->
                    <div class="ms-auto d-flex align-center">
                      <v-btn icon size="x-small" variant="text" color="indigo" class="me-1"
                        @click="openEdit(evalr.original)">
                        <v-icon size="16">mdi-pencil-outline</v-icon>
                        <v-tooltip activator="parent" location="top">แก้ไขรายการนี้</v-tooltip>
                      </v-btn>
                      <v-btn icon size="x-small" variant="text" color="error" @click="deleteAssignment(evalr.id)">
                        <v-icon size="16">mdi-delete-outline</v-icon>
                        <v-tooltip activator="parent" location="top">ลบรายการนี้</v-tooltip>
                      </v-btn>
                    </div>
                  </div>

                  <!-- Details: Avatar, Name, Status -->
                  <div class="d-flex align-center flex-column flex-sm-row">
                    <v-avatar size="46" class="shadow-sm border border-indigo-lighten-4 me-0 me-sm-3 mb-2 mb-sm-0"
                      color="indigo-lighten-5">
                      <v-img v-if="getAvatarUrl(evalr.evaluator_avatar)" :src="getAvatarUrl(evalr.evaluator_avatar)" cover />
                      <span v-else class="text-subtitle-1 font-weight-black text-indigo-darken-4">{{ (evalr.evaluator_name ||
                        "?")[0] }}</span>
                    </v-avatar>
                    <div>
                      <div class="text-subtitle-2 font-weight-black text-indigo-darken-4 line-height-1">
                        {{ evalr.evaluator_name }}
                      </div>
                      <div v-if="evalr.evaluator_position"
                        class="text-caption font-weight-bold text-teal mt-0.5 d-flex align-center justify-center justify-sm-start">
                        <v-icon size="11" class="me-1" color="teal">mdi-briefcase-outline</v-icon>
                        {{ evalr.evaluator_position }}
                      </div>
                      <div class="mt-1 d-flex align-center justify-center justify-sm-start flex-wrap gap-2">
                        <v-chip size="x-small" :color="getStatusBadge(evalr.evaluator_status, 'evaluator')
                            .color
                          " variant="flat" density="compact" class="font-weight-bold">
                          <v-icon start size="10">{{
                            getStatusBadge(evalr.evaluator_status, "evaluator")
                              .icon
                          }}</v-icon>
                          {{
                            getStatusBadge(evalr.evaluator_status, "evaluator")
                              .text
                          }}
                        </v-chip>
                        <div v-if="evalr.evaluator_signature" class="d-flex flex-column ms-2 align-center">
                          <img :src="evalr.evaluator_signature.startsWith('data:') || evalr.evaluator_signature.startsWith('http') ? evalr.evaluator_signature : 'http://localhost:7000' + evalr.evaluator_signature" alt="signature" style="height: 24px; object-fit: contain; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.1));" />
                          <span v-if="evalr.evaluator_signed_at" class="text-caption text-grey mt-1" style="font-size: 9px !important; line-height: 1;">
                            {{ new Date(evalr.evaluator_signed_at).toLocaleDateString('th-TH') }} {{ new Date(evalr.evaluator_signed_at).toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'}) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Flow Connection (จุดเชื่อมโยง) -->
              <div class="connection-flow text-center my-auto align-self-center py-4 py-sm-0"
                style="flex: 0.8; min-width: 150px">
                <div class="period-pill mb-1">
                  <v-icon size="12" class="me-1 text-white">mdi-calendar-star</v-icon>
                  <span>{{ group.period_name }} {{ group.buddhist_year ? `ปี ${group.buddhist_year}` : '' }}</span>
                </div>
                <div v-if="group.created_at" class="text-caption text-grey-darken-1 mb-2 font-weight-medium" style="font-size: 10px !important;">
                  <v-icon size="10" class="me-1">mdi-clock-time-four-outline</v-icon>สร้าง: {{ new Date(group.created_at).toLocaleDateString('th-TH') }}
                </div>
                <div class="flow-line-wrap">
                  <div class="flow-line"></div>
                  <div class="flow-particle"></div>
                  <v-icon class="flow-arrow" color="indigo-lighten-2" size="20">mdi-chevron-right</v-icon>
                </div>
              </div>

              <!-- Evaluatee (ผู้รับการประเมิน) -->
              <div class="person-node evaluatee-node text-center text-sm-right align-self-center"
                style="flex: 1; min-width: 200px">
                <div class="role-badge badge-evaluatee mb-2 mx-auto mx-sm-0 ms-sm-auto">
                  <v-icon size="12" class="me-1">mdi-account</v-icon>
                  ผู้รับการประเมิน
                </div>
                <div class="d-flex align-center flex-column flex-sm-row-reverse">
                  <v-avatar size="54" class="shadow-sm border border-cyan-lighten-4 ms-0 ms-sm-4 mb-3 mb-sm-0"
                    color="cyan-lighten-5">
                    <v-img v-if="getAvatarUrl(group.evaluatee_avatar)" :src="getAvatarUrl(group.evaluatee_avatar)" cover />
                    <span v-else class="text-h6 font-weight-black text-cyan-darken-4">{{ (group.evaluatee_name || "?")[0]
                      }}</span>
                  </v-avatar>
                  <div>
                    <div class="text-subtitle-1 font-weight-black text-indigo-darken-4 line-height-1">
                      {{ group.evaluatee_name }}
                    </div>
                    <div
                      class="text-caption font-weight-bold text-blue-grey mt-1 d-flex align-center justify-center justify-sm-end">
                      <v-icon size="12" class="me-1">mdi-office-building-outline</v-icon>
                      {{ group.department_name || "ไม่ระบุแผนก" }}
                    </div>
                    <div v-if="group.evaluatee_position"
                      class="text-caption font-weight-bold text-teal mt-1 d-flex align-center justify-center justify-sm-end">
                      <v-icon size="12" class="me-1" color="teal">mdi-briefcase-outline</v-icon>
                      {{ group.evaluatee_position }}
                    </div>
                    <div class="mt-1 d-flex align-center justify-center justify-sm-end flex-wrap gap-2">
                      <div class="d-flex flex-column align-end">
                        <v-chip size="small" :color="getStatusBadge(group.self_eval_status, 'evaluatee')
                            .color
                          " variant="flat" density="compact" class="font-weight-bold">
                          <v-icon start size="14">{{
                            getStatusBadge(group.self_eval_status, "evaluatee")
                              .icon
                          }}</v-icon>
                          {{
                            getStatusBadge(group.self_eval_status, "evaluatee")
                              .text
                          }}
                        </v-chip>
                        <span v-if="group.self_eval_signed_at" class="text-caption text-grey mt-1" style="font-size: 9px !important; line-height: 1;">
                          ส่งเมื่อ: {{ new Date(group.self_eval_signed_at).toLocaleDateString('th-TH') }} {{ new Date(group.self_eval_signed_at).toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'}) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state anim-2 mt-4">
          <div class="empty-icon-wrap">
            <div class="empty-ring r1"></div>
            <div class="empty-ring r2"></div>
            <v-icon size="40" color="indigo-lighten-1">mdi-link-variant-off</v-icon>
          </div>
          <h3 class="empty-title">ยังไม่มีการจับคู่</h3>
          <p class="empty-sub">
            สร้างการจับคู่ใหม่ที่ฟอร์มด้านขวามือ เพื่อเริ่มต้นการประเมิน
          </p>
        </div>
      </v-col>

      <!-- ===== RIGHT: CREATE FORM (ฟอร์มสร้าง) ===== -->
      <v-col cols="12" lg="4">
        <div class="sticky-form-wrapper anim-2">
          <div class="creation-card">
            <!-- Card Header -->
            <div class="creation-header">
              <div class="creation-header-bg"></div>
              <div class="d-flex align-center relative-z">
                <v-avatar color="rgba(255,255,255,0.25)" size="46" class="me-3 border">
                  <v-icon icon="mdi-link-plus" size="24" color="white" />
                </v-avatar>
                <div>
                  <h2 class="text-h6 font-weight-black text-white line-height-1">
                    สร้างจับคู่ใหม่
                  </h2>
                  <p class="text-caption text-indigo-lighten-4 mb-0 font-weight-medium">
                    เพิ่มความสัมพันธ์การประเมิน
                  </p>
                </div>
              </div>
            </div>

            <div class="creation-body pa-5">
              <!-- Period -->
              <div class="custom-field-group mb-4">
                <label class="field-label">
                  <v-icon size="14" color="indigo-darken-1" class="me-1">mdi-calendar-check</v-icon>
                  รอบประเมิน
                </label>
                <v-select v-model="form.period_id" :items="periods" item-title="name_th" item-value="id"
                  placeholder="เลือกรอบการประเมิน" variant="outlined" rounded="lg" color="indigo-darken-2"
                  bg-color="white" density="comfortable" hide-details class="premium-input" />
              </div>

              <!-- Dept -->
              <div class="custom-field-group mb-4">
                <label class="field-label">
                  <v-icon size="14" color="blue-grey-darken-1" class="me-1">mdi-office-building-outline</v-icon>
                  แผนก <span class="fw-normal text-grey">(ไม่บังคับ)</span>
                </label>
                <v-select v-model="form.dept_id" :items="departments" item-title="department_name" item-value="id"
                  placeholder="เลือกแผนก" variant="outlined" rounded="lg" color="indigo-darken-2" bg-color="white"
                  density="comfortable" hide-details clearable class="premium-input" />
              </div>

              <v-divider class="my-5 border-opacity-10" />

              <!-- ผู้รับการประเมิน (1 คน) -->
              <div class="custom-field-group mb-4">
                <label class="field-label">
                  <v-icon size="14" color="cyan-darken-2" class="me-1">mdi-account</v-icon>
                  ผู้รับการประเมิน
                  <span class="fw-normal text-grey">(บังคับ 1 คน)</span>
                </label>
                <v-select v-model="form.evaluatee_id" :items="availableEvaluatees" item-title="name_th" item-value="id"
                  placeholder="เลือกผู้รับการประเมิน" variant="outlined" rounded="lg" color="cyan-darken-2"
                  bg-color="white" density="comfortable" hide-details class="premium-input">
                  <template #item="{ item, props }">
                    <v-list-item v-bind="props" :subtitle="`${item.raw.department_name || 'ไม่ระบุแผนก'} · ${item.raw.position || 'ไม่ระบุตำแหน่ง'}`">
                      <template #prepend>
                        <v-avatar size="28" color="cyan-darken-2" class="mr-3 text-white shadow-sm font-weight-bold"
                          style="font-size: 12px">
                          <v-img v-if="getAvatarUrl(item.raw.avatar)" :src="getAvatarUrl(item.raw.avatar)" cover />
                          <span v-else>{{ (item.raw.name_th || "?")[0] }}</span>
                        </v-avatar>
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
              </div>

              <!-- ประธานกรรมการ (1 คน) -->
              <div class="custom-field-group mb-4">
                <label class="field-label">
                  <v-icon size="14" color="amber-darken-3" class="me-1">mdi-shield-crown</v-icon>
                  ประธานกรรมการ
                  <span class="fw-normal text-grey">(บังคับ 1 คน)</span>
                </label>
                <v-select v-model="form.evaluator_id" :items="availableEvaluatorsForChairman" item-title="name_th"
                  item-value="id" placeholder="เลือกประธานกรรมการ" variant="outlined" rounded="lg"
                  color="amber-darken-3" bg-color="amber-lighten-5" density="comfortable" hide-details
                  class="premium-input eval-input">
                  <template #item="{ item, props }">
                    <v-list-item v-bind="props" :subtitle="`${item.raw.department_name || 'ไม่ระบุแผนก'} · ${item.raw.position || 'ไม่ระบุตำแหน่ง'}`">
                      <template #prepend>
                        <v-avatar size="28" color="amber-darken-3" class="mr-3 text-white shadow-sm font-weight-bold"
                          style="font-size: 12px">
                          <v-img v-if="getAvatarUrl(item.raw.avatar)" :src="getAvatarUrl(item.raw.avatar)" cover />
                          <span v-else>{{ (item.raw.name_th || "?")[0] }}</span>
                        </v-avatar>
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
              </div>

              <!-- กรรมการร่วม (หลายคนได้) -->
              <div class="custom-field-group mb-4">
                <label class="field-label">
                  <v-icon size="14" color="teal-darken-2" class="me-1">mdi-account-multiple-plus-outline</v-icon>
                  กรรมการร่วม
                  <span class="fw-normal text-grey">(ไม่บังคับ / เลือกได้หลายคน)</span>
                </label>
                <v-select v-model="form.joint_evaluators" :items="availableEvaluatorsForJoint" item-title="name_th"
                  item-value="id" placeholder="เลือกกรรมการร่วม (เลือกได้มากกว่า 1)" variant="outlined" rounded="lg"
                  color="teal-darken-2" bg-color="white" density="comfortable" hide-details multiple chips
                  closable-chips class="premium-input">
                  <template #item="{ item, props }">
                    <v-list-item v-bind="props" :subtitle="`${item.raw.department_name || 'ไม่ระบุแผนก'} · ${item.raw.position || 'ไม่ระบุตำแหน่ง'}`">
                      <template #prepend>
                        <v-avatar size="28" color="teal-darken-2" class="mr-3 text-white shadow-sm font-weight-bold"
                          style="font-size: 12px">
                          <v-img v-if="getAvatarUrl(item.raw.avatar)" :src="getAvatarUrl(item.raw.avatar)" cover />
                          <span v-else>{{ (item.raw.name_th || "?")[0] }}</span>
                        </v-avatar>
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
              </div>

              <v-btn block color="indigo-darken-4" size="x-large" rounded="xl" prepend-icon="mdi-plus-circle"
                class="confirm-btn font-weight-black shadow-indigo" @click="createAssignment" height="54">
                สร้างการจับคู่
                <span class="btn-shine"></span>
              </v-btn>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- ===== DIALOG: EDIT ===== -->
    <v-dialog v-model="editDialog" max-width="600" persistent>
      <v-card class="dialog-card overflow-hidden pa-0" rounded="xl">
        <div class="dialog-header dialog-edit">
          <div class="dialog-header-bg"></div>
          <div class="d-flex align-center gap-3 relative-z">
            <v-avatar color="rgba(255,255,255,0.2)" size="48" class="border">
              <v-icon icon="mdi-pencil-box-multiple" size="24" color="white" />
            </v-avatar>
            <div>
              <div class="dialog-title">แก้ไขการจับคู่</div>
              <div class="dialog-sub">ปรับข้อมูลการจับคู่รอบประเมิน</div>
            </div>
          </div>
        </div>

        <div class="pa-6 pb-2 bg-grey-lighten-5">
          <v-row dense>
            <v-col cols="12" class="mb-3">
              <v-select v-model="editForm.period_id" :items="periods" item-title="name_th" item-value="id"
                label="รอบประเมิน" variant="outlined" rounded="lg" color="indigo" bg-color="white"
                prepend-inner-icon="mdi-calendar-check" density="comfortable" hide-details class="premium-input" />
            </v-col>
            <v-col cols="12" class="mb-3">
              <v-select v-model="editForm.dept_id" :items="departments" item-title="department_name" item-value="id"
                label="แผนก" variant="outlined" rounded="lg" color="indigo" bg-color="white"
                prepend-inner-icon="mdi-office-building-outline" density="comfortable" clearable hide-details
                class="premium-input" />
            </v-col>
            <v-col cols="12" md="6" class="mb-3">
              <v-select v-model="editForm.evaluator_id" :items="evaluators" item-title="name_th" item-value="id"
                label="ผู้ประเมิน" variant="outlined" rounded="lg" color="indigo" bg-color="white"
                prepend-inner-icon="mdi-account-tie" density="comfortable" hide-details class="premium-input">
                <template #item="{ item, props }">
                  <v-list-item v-bind="props" :subtitle="`${item.raw.department_name || 'ไม่ระบุแผนก'} · ${item.raw.position || 'ไม่ระบุตำแหน่ง'}`" />
                </template>
              </v-select>
            </v-col>
            <v-col cols="12" md="6" class="mb-3">
              <v-select v-model="editForm.evaluatee_id" :items="evaluatees" item-title="name_th" item-value="id"
                label="ผู้ถูกประเมิน" variant="outlined" rounded="lg" color="cyan-darken-2" bg-color="white"
                prepend-inner-icon="mdi-account" density="comfortable" hide-details class="premium-input">
                <template #item="{ item, props }">
                  <v-list-item v-bind="props" :subtitle="`${item.raw.department_name || 'ไม่ระบุแผนก'} · ${item.raw.position || 'ไม่ระบุตำแหน่ง'}`" />
                </template>
              </v-select>
            </v-col>
            <!-- 🟢 เพิ่มใน dialog แก้ไข ต่อจาก v-col evaluatee_id -->
            <v-col cols="12" md="6" class="mb-3">
              <v-select v-model="editForm.evaluator_role" :items="roleOptions" item-title="label" item-value="value"
                label="บทบาทผู้ประเมิน" variant="outlined" rounded="lg" color="amber-darken-3" bg-color="white"
                prepend-inner-icon="mdi-shield-crown" density="comfortable" hide-details class="premium-input" />
            </v-col>
            <v-col cols="12" md="6" class="mb-3">
              <v-select v-model="editForm.evaluator_status" :items="statusOptions" item-title="label" item-value="value"
                label="สถานะการประเมิน" variant="outlined" rounded="lg" color="indigo" bg-color="white"
                prepend-inner-icon="mdi-progress-clock" density="comfortable" hide-details class="premium-input" />
            </v-col>
          </v-row>
        </div>

        <v-divider class="border-opacity-10" />

        <div class="dialog-actions pa-4 bg-white">
          <v-spacer />
          <v-btn variant="text" rounded="xl" @click="editDialog = false" color="blue-grey-darken-1"
            class="font-weight-bold px-4">ยกเลิก</v-btn>
          <v-btn color="orange-darken-2" variant="elevated" rounded="xl" size="large"
            class="px-8 font-weight-black shadow-orange" @click="updateAssignment">
            <v-icon start>mdi-content-save</v-icon>
            อัปเดตข้อมูล
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap");

* {
  font-family: "Inter", sans-serif !important;
}

.dashboard-page {
  padding: 8px 0;
  min-height: 100vh;
}

/* ===== Page Header ===== */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  animation: fadeSlideDown 0.6s ease-out both;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-icon-wrap {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.25);
}

.page-title {
  font-size: 22px;
  font-weight: 900;
  color: #1e1b4b;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
  margin: 0;
}

.summary-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(199, 210, 254, 0.6);
  border-radius: 999px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #4f46e5;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7);
  }

  70% {
    box-shadow: 0 0 0 6px rgba(79, 70, 229, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
  }
}

.chip-label {
  color: #64748b;
}

.chip-val {
  font-weight: 800;
  font-size: 14px;
}

@keyframes fadeSlideDown {
  from {
    opacity: 0;
    transform: translateY(-12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== Connection Cards (รายการจับคู่แบบใหม่) ===== */
.cards-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.connection-card {
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(199, 210, 254, 0.5);
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(30, 27, 75, 0.03);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.connection-card:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 15px 35px rgba(49, 46, 129, 0.08);
  border-color: rgba(99, 102, 241, 0.4);
}

.connection-card-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg,
      transparent,
      rgba(255, 255, 255, 0.5),
      transparent);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
  pointer-events: none;
  z-index: 0;
}

.connection-card:hover .connection-card-bg {
  transform: translateX(100%);
}

.card-inner {
  position: relative;
  z-index: 1;
  padding: 24px;
}

.person-node {
  flex: 1;
  min-width: 0;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 99px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.badge-evaluator {
  background: #e0e7ff;
  color: #3730a3;
  border: 1px solid #c7d2fe;
}

.badge-evaluatee {
  background: #cffafe;
  color: #164e63;
  border: 1px solid #a5f3fc;
}

.badge-chairman {
  background: #fffbeb;
  color: #b45309;
  border: 1px solid #fde68a;
}

.badge-joint {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.border-bottom-dashed {
  border-bottom: 1px dashed rgba(148, 163, 184, 0.2);
}

.border-bottom-dashed:last-child {
  border-bottom: none;
}

.connection-flow {
  flex: 0 0 auto;
  width: 180px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.period-pill {
  background: linear-gradient(135deg, #4f46e5, #3730a3);
  color: white;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 99px;
  box-shadow: 0 4px 10px rgba(55, 48, 163, 0.3);
  z-index: 2;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.flow-line-wrap {
  position: relative;
  width: 100%;
  height: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flow-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: rgba(99, 102, 241, 0.2);
  border-radius: 2px;
}

.flow-particle {
  position: absolute;
  left: 0;
  width: 30px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #4f46e5, transparent);
  animation: flowAnim 2s infinite linear;
}

.flow-arrow {
  position: absolute;
  right: -10px;
}

@keyframes flowAnim {
  0% {
    left: 0%;
    opacity: 0;
  }

  20% {
    opacity: 1;
  }

  80% {
    opacity: 1;
  }

  100% {
    left: 100%;
    opacity: 0;
  }
}

.card-actions-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 10;
}

.connection-card:hover .card-actions-overlay {
  opacity: 1;
}

.action-btn-hover {
  transform: scale(0.8);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
}

.connection-card:hover .action-btn-hover {
  transform: scale(1);
}

.action-btn-hover:hover {
  transform: scale(1.1) !important;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15) !important;
}

/* ===== Sticky Form Wrapper (ฟอร์มด้านขวา) ===== */
.sticky-form-wrapper {
  position: sticky;
  top: 20px;
}

.creation-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(30, 27, 75, 0.06);
}

.creation-header {
  padding: 24px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #2e1065, #4338ca);
}

.creation-header-bg {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px,
      transparent 1px);
  background-size: 20px 20px;
  opacity: 0.5;
  pointer-events: none;
}

.custom-field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 12.5px;
  font-weight: 800;
  color: #334155;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Premium Input Styles */
.premium-input :deep(.v-field) {
  border-radius: 12px !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03) inset !important;
  transition: all 0.2s;
}

.premium-input :deep(.v-field--focused) {
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2) !important;
}

.eval-input :deep(.v-field) {
  border: 1px dashed rgba(99, 102, 241, 0.4);
}

/* Link Animator inside form */
.link-animator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.link-line {
  width: 2px;
  height: 16px;
  background: rgba(99, 102, 241, 0.2);
}

.link-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4338ca, #6366f1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(67, 56, 202, 0.4);
  animation: bounceSlow 2s infinite;
}

@keyframes bounceSlow {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(4px);
  }
}

/* Confirm Button */
.confirm-btn {
  position: relative;
  overflow: hidden;
  transition: all 0.3s !important;
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(26, 35, 126, 0.3) !important;
}

.shadow-indigo {
  box-shadow: 0 8px 20px rgba(26, 35, 126, 0.2) !important;
}

.shadow-orange {
  box-shadow: 0 8px 20px rgba(230, 81, 0, 0.2) !important;
}

/* ===== Dialog ===== */
.dialog-card {
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.2) !important;
}

.dialog-header {
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.dialog-edit {
  background: linear-gradient(135deg, #9a3412, #ea580c);
}

.dialog-header-bg {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.1) 2px,
      transparent 2px);
  background-size: 24px 24px;
  opacity: 0.3;
}

.dialog-title {
  font-size: 18px;
  font-weight: 900;
  color: white;
  line-height: 1.2;
}

.dialog-sub {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

/* ===== Empty State ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: rgba(255, 255, 255, 0.5);
  border: 1px dashed rgba(158, 168, 218, 0.5);
  border-radius: 20px;
}

.empty-icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  position: relative;
  background: rgba(99, 102, 241, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.empty-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.empty-ring.r1 {
  width: 110px;
  height: 110px;
  animation: pulseRing 3s infinite;
}

.empty-ring.r2 {
  width: 140px;
  height: 140px;
  border-style: dashed;
  animation: pulseRing 3s infinite reverse;
  opacity: 0.5;
}

@keyframes pulseRing {
  0% {
    transform: scale(0.9) rotate(0deg);
  }

  50% {
    transform: scale(1.1) rotate(180deg);
  }

  100% {
    transform: scale(0.9) rotate(360deg);
  }
}

.empty-title {
  font-size: 18px;
  font-weight: 800;
  color: #1a237e;
  margin-bottom: 4px;
}

.empty-sub {
  font-size: 13px;
  color: #78909c;
}

/* Utilities */
.line-height-1 {
  line-height: 1.2;
}

.relative-z {
  position: relative;
  z-index: 1;
}

.fw-normal {
  font-weight: 400;
}

/* Entrance Animations */
.anim-1 {
  animation: cardUp 0.5s 0.05s ease-out both;
}

.anim-2 {
  animation: cardUp 0.5s 0.15s ease-out both;
}

.anim-3 {
  animation: cardUp 0.5s 0.25s ease-out both;
}

.anim-4 {
  animation: cardUp 0.5s 0.35s ease-out both;
}

.anim-5 {
  animation: cardUp 0.5s 0.45s ease-out both;
}

.anim-6 {
  animation: cardUp 0.5s 0.55s ease-out both;
}

@keyframes cardUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 599px) {
  .connection-flow {
    margin: 20px 0;
    width: 100%;
    transform: rotate(90deg);
    height: 60px;
  }

  .card-inner {
    padding: 30px 20px;
  }
}
</style>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const router = useRouter();
const assignments = ref([]);
const periods = ref([]);
const evaluators = ref([]);
const evaluatees = ref([]);
const departments = ref([]);

const form = ref({
  period_id: null,
  evaluator_id: null,
  evaluatee_id: null,
  dept_id: null,
  evaluator_role: "chairman",
  joint_evaluators: [],
});
const editDialog = ref(false);
const editForm = ref({
  id: null,
  period_id: null,
  evaluator_id: null,
  evaluatee_id: null,
  dept_id: null,
  evaluator_role: "chairman",
  evaluator_status: "pending",
});

// 🟢 เพิ่มบรรทัดนี้
const roleOptions = [
  { label: "ประธาน (chairman)", value: "chairman" },
  { label: "กรรมการร่วม (joint)", value: "joint" },
];

const statusOptions = [
  { label: "รอดำเนินการ (pending)", value: "pending" },
  { label: "กำลังดำเนินการ (evaluating)", value: "evaluating" },
  { label: "ประเมินแล้ว (completed)", value: "completed" },
];

const availableEvaluatees = computed(() => {
  const selectedEvaluatorIds = [
    form.value.evaluator_id,
    ...(form.value.joint_evaluators || []),
  ].filter(Boolean);
  return evaluatees.value.filter((e) => !selectedEvaluatorIds.includes(e.id));
});

const availableEvaluatorsForChairman = computed(() => {
  const selectedEvaluateeId = form.value.evaluatee_id;
  const selectedJointIds = form.value.joint_evaluators || [];
  return evaluators.value.filter(
    (ev) => ev.id !== selectedEvaluateeId && !selectedJointIds.includes(ev.id),
  );
});

const availableEvaluatorsForJoint = computed(() => {
  const selectedEvaluateeId = form.value.evaluatee_id;
  const selectedChairmanId = form.value.evaluator_id;
  return evaluators.value.filter(
    (ev) => ev.id !== selectedEvaluateeId && ev.id !== selectedChairmanId,
  );
});

const groupedAssignments = computed(() => {
  const groups = {};

  assignments.value.forEach((item) => {
    const key = `${item.period_id}-${item.evaluatee_id}`;
    if (!groups[key]) {
      groups[key] = {
        key: key,
        period_id: item.period_id,
        period_name: item.period_name,
        buddhist_year: item.buddhist_year,
        evaluatee_id: item.evaluatee_id,
        evaluatee_name: item.evaluatee_name,
        evaluatee_avatar: item.evaluatee_avatar,
        evaluatee_position: item.evaluatee_position,
        department_name: item.department_name,
        dept_id: item.dept_id,
        self_eval_status: item.self_eval_status,
        self_eval_signed_at: item.self_eval_signed_at,
        created_at: item.created_at,
        evaluators: [],
      };
    }

    groups[key].evaluators.push({
      id: item.id,
      evaluator_id: item.evaluator_id,
      evaluator_name: item.evaluator_name,
      evaluator_avatar: item.evaluator_avatar,
      evaluator_position: item.evaluator_position,
      evaluator_role: item.evaluator_role,
      evaluator_status: item.evaluator_status,
      evaluator_signature: item.evaluator_signature,
      evaluator_signed_at: item.evaluator_signed_at,
      original: item,
    });
  });

  return Object.values(groups).map((group) => {
    group.evaluators.sort((a, b) => {
      if (a.evaluator_role === "chairman") return -1;
      if (b.evaluator_role === "chairman") return 1;
      return 0;
    });
    return group;
  });
});

const getStatusBadge = (status, role) => {
  if (status === "completed" || status === "submitted")
    return {
      color: "green-darken-1",
      text: role === "evaluatee" ? "ส่งประเมินตนเองแล้ว" : "ประเมินแล้ว",
      icon: "mdi-check-circle",
    };
  if (status === "evaluating" || status === "draft")
    return {
      color: "orange-darken-1",
      text: "กำลังดำเนินการ",
      icon: "mdi-progress-clock",
    };
  return {
    color: "blue-grey-lighten-1",
    text: "รอดำเนินการ",
    icon: "mdi-clock-outline",
  };
};

function getAvatarUrl(avatar) {
  if (!avatar) return "";
  if (/^https?:\/\//i.test(avatar)) return avatar;
  return `http://localhost:7000/uploads/avatars/${avatar}`;
}

let authChecker = null;

const forceLogout = () => {
  localStorage.removeItem("auth_token");
  router.push("/");
};

axios.interceptors.response.use(
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

const getAuth = () => ({
  headers: { Authorization: "Bearer " + localStorage.getItem("auth_token") },
});

onMounted(async () => {
  if (!localStorage.getItem("auth_token")) {
    forceLogout();
    return;
  }
  await fetchAssignments();
  await loadFormOptions();
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

async function fetchAssignments() {
  try {
    const { data } = await axios.get(
      "http://localhost:7000/api/admin/list_assignments",
      getAuth(),
    );
    assignments.value = data.data;
  } catch { }
}

async function loadFormOptions() {
  try {
    const auth = getAuth();
    const [p, evaee, evalr, dept] = await Promise.all([
      axios.get("http://localhost:7000/api/admin/list_periods", auth),
      axios.get("http://localhost:7000/api/admin/list_evaluatee", auth),
      axios.get("http://localhost:7000/api/admin/list_evaluator", auth),
      axios.get("http://localhost:7000/api/admin/list_departments", auth),
    ]);
    periods.value = p.data.data;
    evaluatees.value = evaee.data.data;
    evaluators.value = evalr.data.data;
    departments.value = dept.data.data;
  } catch (err) {
    console.error("Load Options Error", err);
  }
}

async function createAssignment() {
  if (
    !form.value.period_id ||
    !form.value.evaluator_id ||
    !form.value.evaluatee_id
  ) {
    alert("กรุณาเลือกรอบประเมิน, ประธานกรรมการ และผู้รับการประเมินให้ครบ");
    return;
  }
  if (form.value.evaluator_id === form.value.evaluatee_id) {
    alert("ประธานกรรมการและผู้รับการประเมินต้องไม่เป็นบุคคลเดียวกัน");
    return;
  }
  if (form.value.joint_evaluators?.includes(form.value.evaluatee_id)) {
    alert("กรรมการร่วมและผู้รับการประเมินต้องไม่เป็นบุคคลเดียวกัน");
    return;
  }

  try {
    // 1. สร้างประธานกรรมการก่อน
    await axios.post(
      "http://localhost:7000/api/admin/create_assignments",
      {
        period_id: form.value.period_id,
        evaluator_id: form.value.evaluator_id,
        evaluatee_id: form.value.evaluatee_id,
        dept_id: form.value.dept_id,
        evaluator_role: "chairman",
      },
      getAuth(),
    );

    // 2. สร้างกรรมการร่วม (ถ้ามี)
    if (form.value.joint_evaluators && form.value.joint_evaluators.length > 0) {
      const promises = form.value.joint_evaluators.map((jointId) => {
        return axios.post(
          "http://localhost:7000/api/admin/create_assignments",
          {
            period_id: form.value.period_id,
            evaluator_id: jointId,
            evaluatee_id: form.value.evaluatee_id,
            dept_id: form.value.dept_id,
            evaluator_role: "joint",
          },
          getAuth(),
        );
      });
      await Promise.all(promises);
    }

    await fetchAssignments();

    // รีเซ็ตฟอร์ม
    form.value = {
      period_id: null,
      evaluator_id: null,
      evaluatee_id: null,
      dept_id: null,
      evaluator_role: "chairman",
      joint_evaluators: [],
    };
  } catch (err) {
    if (err.response?.status !== 401) {
      alert(err.response?.data?.message || err.message);
    }
  }
}


async function updateAssignment() {
  if (editForm.value.evaluator_id === editForm.value.evaluatee_id) {
    alert("ผู้ประเมินและผู้รับการประเมินต้องไม่เป็นบุคคลเดียวกัน");
    return;
  }
  try {
    const { id, ...payload } = editForm.value;
    await axios.put(
      `http://localhost:7000/api/admin/update_assignments/${id}`,
      payload,
      getAuth(),
    );
    editDialog.value = false;
    await fetchAssignments();
  } catch (err) {
    if (err.response?.status !== 401) alert("แก้ไขไม่สำเร็จ");
  }
}

async function deleteAssignment(id) {
  if (!confirm("ต้องการลบรายการจับคู่นี้ใช่หรือไม่?")) return;
  try {
    await axios.delete(
      `http://localhost:7000/api/admin/delete_assignments/${id}`,
      getAuth(),
    );
    await fetchAssignments();
  } catch (err) {
    if (err.response?.status !== 401) alert("ลบไม่สำเร็จ");
  }
}

function openEdit(item) {
  editForm.value = { ...item };
  editDialog.value = true;
}
</script>
