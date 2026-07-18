<template>
  <div class="dashboard-page">
    
    <div class="blob-1"></div>
    <div class="blob-2"></div>

    <div class="page-header mb-8">
      <div class="header-left">
        <div class="page-icon-wrap">
          <v-icon icon="mdi-view-dashboard" size="22" color="white" />
        </div>
        <div>
          <h1 class="page-title">ภาพรวมระบบประเมิน</h1>
          <p class="page-subtitle">
            ข้อมูลสถิติและความคืบหน้าการประเมินจากระบบ
            <span v-if="dashboardData.activePeriod" class="period-badge">
              รอบปีการศึกษา {{ dashboardData.activePeriod.buddhist_year }}
            </span>
          </p>
        </div>
      </div>
      <div class="header-actions">
        <v-btn variant="tonal" color="indigo" rounded="xl" size="small"
          prepend-icon="mdi-refresh" @click="fetchDashboardData" class="refresh-btn">
          รีเฟรชข้อมูล
        </v-btn>
      </div>
    </div>

    <v-row class="mb-6" dense>
      <v-col cols="12" sm="6" lg="3">
        <div class="stat-card anim-1">
          <div class="stat-accent" style="background: #3b82f6;"></div>
          <div class="stat-icon-wrap" style="background: rgba(59,130,246,0.1); color: #1e40af;">
            <v-icon icon="mdi-account-school" size="20" />
          </div>
          <div class="stat-value">{{ summary.totalEvaluatees }}<span class="stat-unit">คน</span></div>
          <div class="stat-label">ครูผู้รับการประเมิน</div>
        </div>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <div class="stat-card anim-2">
          <div class="stat-accent" style="background: #f59e0b;"></div>
          <div class="stat-icon-wrap" style="background: rgba(245,158,11,0.1); color: #b45309;">
            <v-icon icon="mdi-clock-outline" size="20" />
          </div>
          <div class="stat-value">{{ waitingEvaluationCount }}<span class="stat-unit">คน</span></div>
          <div class="stat-label">รอการประเมิน</div>
        </div>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <div class="stat-card anim-3">
          <div class="stat-accent" style="background: #10b981;"></div>
          <div class="stat-icon-wrap" style="background: rgba(16,185,129,0.1); color: #065f46;">
            <v-icon icon="mdi-check-circle" size="20" />
          </div>
          <div class="stat-value">{{ completedEvaluationCount }}<span class="stat-unit">คน</span></div>
          <div class="stat-label">ประเมินเสร็จสิ้น</div>
        </div>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <div class="stat-card anim-4">
          <div class="stat-accent" style="background: #8b5cf6;"></div>
          <div class="stat-icon-wrap" style="background: rgba(139,92,246,0.1); color: #4c1d95;">
            <v-icon icon="mdi-star-circle" size="20" />
          </div>
          <div class="stat-value">{{ summary.averageScore }}<span class="stat-unit">คะแนน</span></div>
          <div class="stat-label">คะแนนเฉลี่ยรวม</div>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="8">
        <div class="section-card anim-5">
          <div class="section-header">
            <div class="section-title-group">
              <div class="section-icon-sm">
                <v-icon icon="mdi-account-group" size="16" color="white" />
              </div>
              <div>
                <div class="section-title">รายชื่อบุคลากร</div>
                <div class="section-sub">ผู้รับการประเมินทั้งหมดในระบบ</div>
              </div>
            </div>
          </div>

          <v-divider class="border-opacity-10 mb-2" />

          <v-data-table
            :headers="personnelHeaders"
            :items="personnelList"
            hover
            class="custom-table"
            :items-per-page="6"
            hide-default-footer
            no-data-text="ไม่พบข้อมูลบุคลากรในขณะนี้"
          >
            <template #item.name_th="{ value, item }">
              <div class="d-flex align-center gap-3 py-1">
                <v-avatar size="34" color="indigo-lighten-4" class="table-avatar border border-white">
                  <v-img v-if="getAvatarUrl(item.avatar)" :src="getAvatarUrl(item.avatar)" cover />
                  <span v-else class="text-indigo-darken-3 font-weight-black" style="font-size:12px">
                    {{ (value || '?')[0] }}
                  </span>
                </v-avatar>
                <div>
                  <div class="font-weight-semibold text-indigo-darken-3" style="font-size:13.5px">{{ value }}</div>
                  <div class="text-caption text-grey">{{ item.email }}</div>
                </div>
              </div>
            </template>

            <template #item.status="{ item }">
              <div class="status-wrap">
                <div class="status-dot" :class="checkStatus(item) === 'เสร็จสมบูรณ์' ? 'dot-green' : 'dot-amber'"></div>
                <span class="status-text" :class="checkStatus(item) === 'เสร็จสมบูรณ์' ? 'text-success' : 'text-amber-darken-2'">
                  {{ checkStatus(item) }}
                </span>
              </div>
            </template>

            <template #item.actions="{ item }">
              <v-btn icon variant="text" color="indigo-darken-2" size="small"
                rounded="lg" @click="editUser(item.id)" class="action-btn">
                <v-icon size="17">mdi-pencil-outline</v-icon>
                <v-tooltip activator="parent" location="top">แก้ไขข้อมูล</v-tooltip>
              </v-btn>
            </template>

            <template #bottom>
              <div class="table-footer-note">
                <v-icon size="13" color="indigo-lighten-2" class="mr-1">mdi-information-outline</v-icon>
                แสดงข้อมูล {{ Math.min(personnelList.length, 6) }} จาก {{ personnelList.length }} รายการ
              </div>
            </template>
          </v-data-table>
        </div>
      </v-col>

      <v-col cols="12" lg="4">
        <div class="section-card anim-6 mb-4">
          <div class="section-header">
            <div class="section-title-group">
              <div class="section-icon-sm" style="background: linear-gradient(135deg,#7c3aed,#a78bfa)">
                <v-icon icon="mdi-lightning-bolt" size="16" color="white" />
              </div>
              <div>
                <div class="section-title">เมนูด่วน</div>
                <div class="section-sub">Quick Actions</div>
              </div>
            </div>
          </div>
          <v-divider class="border-opacity-10 mb-4" />

          <div class="quick-actions">
            <button class="qa-btn qa-indigo" @click="openUsersManager">
              <div class="qa-icon"><v-icon icon="mdi-account-cog-outline" size="22" /></div>
              <span>จัดการผู้ใช้งาน</span>
            </button>
            <button class="qa-btn qa-amber" @click="openPeriodManager">
              <div class="qa-icon"><v-icon icon="mdi-calendar-edit" size="22" /></div>
              <span>ตั้งค่ารอบประเมิน</span>
            </button>
          </div>
        </div>

        <div class="export-card anim-7 mb-4">
          <div class="export-bg-art">
            <div class="export-ring r1"></div>
            <div class="export-ring r2"></div>
          </div>
          <div class="export-content">
            <div class="export-icon-wrap">
              <v-icon icon="mdi-file-chart-outline" size="30" color="white" />
            </div>
            <div class="export-text">
              <div class="export-title">รายงานภาพรวม</div>
              <div class="export-sub">ผลการประเมินประจำรอบปีนี้</div>
            </div>
          </div>
          <v-btn block color="white" variant="flat" rounded="xl" size="large"
            prepend-icon="mdi-download" class="export-btn font-weight-bold"
            :loading="exportingPdf" :disabled="exportingPdf" @click="exportReport">
            {{ exportingPdf ? 'กำลังสร้าง PDF...' : 'ดาวน์โหลดรายงาน PDF' }}
          </v-btn>
        </div>

        <div class="section-card anim-8" v-if="departmentStats.length > 0">
          <div class="section-header">
            <div class="section-title-group">
              <div class="section-icon-sm" style="background: linear-gradient(135deg,#0891b2,#67e8f9)">
                <v-icon icon="mdi-domain" size="16" color="white" />
              </div>
              <div>
                <div class="section-title">สถิติรายแผนก</div>
                <div class="section-sub">ความคืบหน้าแต่ละแผนก</div>
              </div>
            </div>
          </div>
          <v-divider class="border-opacity-10 mb-3" />

          <div class="dept-list">
            <div v-for="(dept, i) in departmentStats" :key="i" class="dept-item">
              <div class="dept-info">
                <div class="dept-code">{{ dept.code }}</div>
                <div class="dept-details">
                  <div class="dept-name">{{ dept.name_th }}</div>
                  <div class="dept-progress-bar">
                    <div class="dept-bar-track">
                      <div class="dept-bar-fill"
                        :style="{ width: (dept.total > 0 ? (dept.submitted / dept.total) * 100 : 0) + '%' }">
                      </div>
                    </div>
                    <span class="dept-count">{{ dept.submitted }}/{{ dept.total }} คน</span>
                  </div>
                </div>
              </div>
              <div class="dept-pct" :class="(dept.submitted / dept.total) >= 1 ? 'pct-done' : 'pct-wip'">
                {{ dept.total > 0 ? Math.round((dept.submitted / dept.total) * 100) : 0 }}%
              </div>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-dialog v-model="periodManagerDialog" max-width="1100" scrollable transition="dialog-bottom-transition">
      <v-card rounded="2xl" class="dialog-card bg-grey-lighten-4 pa-0 overflow-hidden" style="max-height: 90vh;">
        <div class="dialog-header dialog-add d-flex justify-between align-center" style="background: linear-gradient(135deg, #1e1b4b, #312e81);">
          <div class="dialog-header-bg"></div>
          <div class="d-flex align-center gap-3 relative-z">
            <v-avatar color="rgba(255,255,255,0.15)" size="48">
              <v-icon icon="mdi-calendar-sync" color="white" size="24" />
            </v-avatar>
            <div>
              <div class="dialog-title text-h6 font-weight-black">จัดการรอบประเมินในระบบ</div>
              <div class="dialog-sub text-white-opacity-70">ควบคุม เปิด-ปิด และแก้ไขช่วงเวลาการประเมินทั้งหมด</div>
            </div>
          </div>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" color="white" @click="periodManagerDialog = false" class="relative-z" />
        </div>

        <v-card-text class="pa-6 relative-z">
          <v-row class="mb-6" dense>
            <v-col cols="12" md="4">
              <div class="metric-card pa-4">
                <div class="metric-icon bg-indigo-lighten-5 text-indigo-darken-3"><v-icon>mdi-calendar-multiple</v-icon></div>
                <div class="metric-data">
                  <div class="metric-label">รอบทั้งหมด</div>
                  <div class="metric-val text-indigo-darken-4 text-h5 font-weight-bold">{{ periods.length }} <span class="metric-unit">รอบ</span></div>
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="4">
              <div class="metric-card metric-active pa-4">
                <div class="metric-icon bg-green-lighten-5 text-success"><v-icon>mdi-check-circle-outline</v-icon></div>
                <div class="metric-data">
                  <div class="metric-label">กำลังเปิดใช้งาน</div>
                  <div class="metric-val text-success text-h5 font-weight-bold">{{ periods.filter(i => i.is_active).length }} <span class="metric-unit">รอบ</span></div>
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="4">
              <div class="metric-card pa-4">
                <div class="metric-icon bg-grey-lighten-4 text-grey-darken-1"><v-icon>mdi-archive-cancel-outline</v-icon></div>
                <div class="metric-data">
                  <div class="metric-label">ปิดใช้งาน</div>
                  <div class="metric-val text-blue-grey-darken-2 text-h5 font-weight-bold">{{ periods.filter(i => !i.is_active).length }} <span class="metric-unit">รอบ</span></div>
                </div>
              </div>
            </v-col>
          </v-row>

          <div class="d-flex align-center justify-space-between mb-4">
            <div class="d-flex align-center">
              <v-icon color="indigo-darken-4" class="me-2">mdi-clock-time-four-outline</v-icon>
              <span class="font-weight-black text-indigo-darken-4">รายการรอบปีการศึกษา</span>
            </div>
            <v-btn color="indigo-darken-3" rounded="xl" size="small" prepend-icon="mdi-plus-box-multiple" @click="openAddPeriod">
              เปิดรอบประเมินใหม่
            </v-btn>
          </div>

          <v-row v-if="periods.length > 0">
            <v-col v-for="item in periods" :key="item.id" cols="12" md="6">
              <div class="period-card shadow-sm pa-4 mb-2" :class="item.is_active ? 'card-active' : 'card-inactive'">
                <div class="d-flex justify-space-between align-start mb-3">
                  <div class="d-flex align-center">
                    <v-avatar :color="item.is_active ? 'indigo-darken-3' : 'grey-darken-1'" size="40" class="text-white font-weight-bold me-3" style="font-size:12px;">
                      {{ item.buddhist_year }}
                    </v-avatar>
                    <div>
                      <h4 class="font-weight-black text-indigo-darken-4 mb-0" style="font-size:14px;">{{ item.name_th }}</h4>
                      <div class="text-caption font-weight-bold text-grey d-flex align-center">
                        รหัส: {{ item.code }}
                      </div>
                    </div>
                  </div>
                  <div class="status-badge" :class="item.is_active ? 'badge-active' : 'badge-inactive'">
                    <div class="status-dot"></div> {{ item.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
                  </div>
                </div>

                <v-divider class="border-opacity-10 mb-3" />

                <div class="timeline-visual py-2 px-3">
                  <div class="time-node">
                    <span class="text-indigo-lighten-1" style="font-size:10px; font-weight:800;">เริ่มต้น</span>
                    <span style="font-size:12px;" class="font-weight-bold">{{ formatDateDisplay(item.start_date) }}</span>
                  </div>
                  <v-icon size="14" color="grey">mdi-chevron-double-right</v-icon>
                  <div class="time-node text-right">
                    <span class="text-pink-lighten-2" style="font-size:10px; font-weight:800;">สิ้นสุด</span>
                    <span style="font-size:12px;" class="font-weight-bold">{{ formatDateDisplay(item.end_date) }}</span>
                  </div>
                </div>

                <div class="d-flex gap-2 mt-3">
                  <v-btn variant="tonal" color="blue-grey-darken-2" rounded="lg" size="x-small" class="flex-grow-1" @click="openEditPeriod(item)">
                    <v-icon start size="12">mdi-pencil-outline</v-icon> แก้ไข
                  </v-btn>
                  <v-btn variant="tonal" color="error" rounded="lg" size="x-small" class="flex-grow-1" @click="removePeriod(item)">
                    <v-icon start size="12">mdi-delete-outline</v-icon> ลบ
                  </v-btn>
                </div>
              </div>
            </v-col>
          </v-row>

          <div v-else class="text-center py-8 text-grey">
            <v-icon size="40" class="mb-2">mdi-calendar-blank-multiple</v-icon>
            <div>ยังไม่มีรอบประเมินในระบบ</div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>


    <v-dialog v-model="periodFormDialog" max-width="580" persistent>
      <v-card class="dialog-card overflow-hidden pa-0" rounded="xl">
        <div class="dialog-header" :class="periodEditMode ? 'dialog-edit' : 'dialog-add'">
          <div class="dialog-header-bg"></div>
          <div class="d-flex align-center gap-3 relative-z">
            <v-avatar color="rgba(255,255,255,0.2)" size="46">
              <v-icon :icon="periodEditMode ? 'mdi-calendar-edit' : 'mdi-calendar-plus'" size="22" color="white" />
            </v-avatar>
            <div>
              <div class="dialog-title font-weight-black" style="font-size:16px;">{{ periodEditMode ? 'แก้ไขรอบประเมิน' : 'สร้างรอบประเมินใหม่' }}</div>
              <div class="dialog-sub text-white-opacity-70" style="font-size:12px;">{{ periodEditMode ? `กำลังแก้ไข: ${periodForm.name_th}` : 'กำหนดข้อมูลช่วงเวลาสำหรับการประเมิน' }}</div>
            </div>
          </div>
        </div>

        <v-card-text class="pa-6 bg-grey-lighten-5">
          <v-row dense>
            <v-col cols="12" md="8" class="mb-2">
              <label class="field-label mb-1 d-block"><v-icon size="13" color="indigo">mdi-calendar-text</v-icon> ชื่อรอบประเมิน</label>
              <v-text-field v-model="periodForm.name_th" placeholder="ระบุชื่อรอบประเมิน" variant="outlined" rounded="lg" color="indigo" bg-color="white" density="comfortable" hide-details class="premium-input" />
            </v-col>
            <v-col cols="12" md="4" class="mb-2">
              <label class="field-label mb-1 d-block"><v-icon size="13" color="indigo">mdi-identifier</v-icon> รหัส</label>
              <v-text-field v-model="periodForm.code" placeholder="เช่น 1/2569" variant="outlined" rounded="lg" color="indigo" bg-color="white" density="comfortable" hide-details class="premium-input" />
            </v-col>
            <v-col cols="12" md="6" class="mb-2">
              <label class="field-label mb-1 d-block"><v-icon size="13" color="indigo">mdi-calendar-badge</v-icon> ปีการศึกษา (พ.ศ.)</label>
              <v-text-field v-model="periodForm.buddhist_year" type="number" placeholder="เช่น 2569" variant="outlined" rounded="lg" color="indigo" bg-color="white" density="comfortable" hide-details class="premium-input" />
            </v-col>
            <v-col cols="12" md="6" class="mb-2 d-flex align-end">
              <div class="switch-wrap w-100 mb-1">
                <v-switch v-model="periodForm.is_active" color="success" inset hide-details density="compact" />
                <div>
                  <div class="switch-label text-blue-grey-darken-1" style="font-size:10px;">สถานะรอบประเมิน</div>
                  <div class="switch-sub font-weight-bold" :class="periodForm.is_active ? 'text-success' : 'text-grey'" style="font-size:12px;">
                    {{ periodForm.is_active ? 'กำลังเปิดใช้งาน' : 'ปิดใช้งาน' }}
                  </div>
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="6" class="mt-2">
              <label class="field-label mb-1 d-block"><v-icon size="13" color="indigo">mdi-calendar-start</v-icon> วันที่เริ่มต้น</label>
              <v-text-field v-model="periodForm.start_date" type="date" variant="outlined" rounded="lg" color="indigo" bg-color="white" density="comfortable" hide-details class="premium-input" />
            </v-col>
            <v-col cols="12" md="6" class="mt-2">
              <label class="field-label mb-1 d-block"><v-icon size="13" color="pink">mdi-calendar-end</v-icon> วันที่สิ้นสุด</label>
              <v-text-field v-model="periodForm.end_date" type="date" variant="outlined" rounded="lg" color="indigo" bg-color="white" density="comfortable" hide-details class="premium-input" />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider class="border-opacity-10" />
        <div class="dialog-actions pa-4 bg-white">
          <v-spacer />
          <v-btn variant="text" rounded="xl" @click="periodFormDialog = false" color="blue-grey-darken-1" class="font-weight-bold">ยกเลิก</v-btn>
          <v-btn :color="periodEditMode ? 'orange-darken-2' : 'indigo-darken-4'" variant="elevated" rounded="xl" class="px-6 font-weight-black" @click="savePeriod">
            {{ periodEditMode ? 'บันทึกการแก้ไข' : 'สร้างรอบประเมิน' }}
          </v-btn>
        </div>
      </v-card>
    </v-dialog>


    <v-dialog v-model="usersManagerDialog" max-width="1100" scrollable transition="dialog-bottom-transition">
      <v-card rounded="2xl" class="dialog-card bg-grey-lighten-4 pa-0 overflow-hidden" style="max-height: 90vh;">
        <div class="dialog-header dialog-add d-flex justify-between align-center" style="background: linear-gradient(135deg, #1e1b4b, #312e81);">
          <div class="dialog-header-bg"></div>
          <div class="d-flex align-center gap-3 relative-z">
            <v-avatar color="rgba(255,255,255,0.15)" size="48">
              <v-icon icon="mdi-account-cog-outline" color="white" size="24" />
            </v-avatar>
            <div>
              <div class="dialog-title text-h6 font-weight-black">จัดการผู้ใช้งาน</div>
              <div class="dialog-sub text-white-opacity-70">ดูรายชื่อทั้งหมด แก้ไข หรือเพิ่มผู้ใช้งานใหม่ได้จากหน้านี้</div>
            </div>
          </div>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" color="white" @click="usersManagerDialog = false" class="relative-z" />
        </div>

        <v-card-text class="pa-6 relative-z">
          <div class="d-flex align-center justify-space-between mb-4 flex-wrap gap-3">
            <div class="d-flex align-center gap-2 flex-wrap">
              <v-chip color="indigo" variant="tonal" class="font-weight-bold rounded-pill">
                รวม {{ allUsersList.length }} คน
              </v-chip>
              <v-chip color="green" variant="tonal" class="font-weight-bold rounded-pill">
                เปิดใช้งาน {{ allUsersList.filter(u => u.status === 'active').length }} คน
              </v-chip>
              <v-chip color="grey" variant="tonal" class="font-weight-bold rounded-pill">
                ระงับ {{ allUsersList.filter(u => u.status !== 'active').length }} คน
              </v-chip>
            </div>
            <v-btn color="indigo-darken-3" rounded="xl" size="small" prepend-icon="mdi-account-plus" class="px-4 font-weight-bold" @click="addUser">
              เพิ่มผู้ใช้งาน
            </v-btn>
          </div>

          <v-data-table
            :headers="allUsersHeaders"
            :items="allUsersList"
            hover
            class="custom-table bg-white rounded-xl elevation-1"
            :items-per-page="-1"
            hide-default-footer
            no-data-text="ไม่พบข้อมูลผู้ใช้งาน"
          >
            <template #item.name_th="{ value, item }">
              <div class="d-flex align-center gap-3 py-1">
                <v-avatar size="36" color="indigo-lighten-4" class="table-avatar border border-white">
                  <v-img v-if="getAvatarUrl(item.avatar)" :src="getAvatarUrl(item.avatar)" cover />
                  <span v-else class="text-indigo-darken-3 font-weight-black" style="font-size:12px">
                    {{ (value || '?')[0] }}
                  </span>
                </v-avatar>
                <div>
                  <div class="font-weight-semibold text-indigo-darken-3" style="font-size:13.5px">{{ value }}</div>
                  <div class="text-caption text-grey">{{ item.email }}</div>
                </div>
              </div>
            </template>

            <template #item.role="{ item }">
              <v-chip size="small" :color="item.role === 'admin' ? 'red' : (item.role === 'evaluator' ? 'orange' : 'green')" variant="tonal" class="font-weight-bold rounded-pill">
                {{ item.role === 'admin' ? 'แอดมิน' : (item.role === 'evaluator' ? 'กรรมการ' : 'ผู้ถูกประเมิน') }}
              </v-chip>
            </template>

            <template #item.status="{ item }">
              <v-chip size="small" :color="item.status === 'active' ? 'success' : 'grey'" variant="tonal" class="font-weight-bold rounded-pill">
                {{ item.status === 'active' ? 'ใช้งานอยู่' : 'ระงับ' }}
              </v-chip>
            </template>

            <template #item.actions="{ item }">
              <v-btn icon variant="text" color="indigo-darken-2" size="small" rounded="lg" @click="editUser(item.id)" class="action-btn">
                <v-icon size="17">mdi-pencil-outline</v-icon>
                <v-tooltip activator="parent" location="top">แก้ไขข้อมูล</v-tooltip>
              </v-btn>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>


    <v-dialog v-model="userDialog" max-width="680" persistent>
      <v-card rounded="2xl" class="dialog-card overflow-hidden pa-0">
        <div class="dialog-header" :class="userEditMode ? 'dialog-edit' : 'dialog-add'">
          <div class="dialog-header-bg"></div>
          <div class="d-flex align-center gap-3 relative-content">
            <div class="dialog-header-icon">
              <v-icon :icon="userEditMode ? 'mdi-account-edit' : 'mdi-account-plus'" size="22" color="white" />
            </div>
            <div>
              <div class="dialog-title font-weight-bold">{{ userEditMode ? 'แก้ไขข้อมูลผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่' }}</div>
              <div class="dialog-sub">{{ userEditMode ? `ID: ${userForm.id}` : 'กรอกข้อมูลให้ครบถ้วน' }}</div>
            </div>
          </div>
        </div>

        <div class="pa-6">
          <v-row dense>
            <v-col cols="12">
              <v-text-field v-model="userForm.email" label="อีเมลผู้ใช้งาน" variant="outlined" rounded="lg" prepend-inner-icon="mdi-email-outline" color="indigo" density="comfortable" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="userForm.name_th" label="ชื่อ-นามสกุล" variant="outlined" rounded="lg" prepend-inner-icon="mdi-account-outline" color="indigo" density="comfortable" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="userForm.password" label="รหัสผ่าน" placeholder="กรอกเฉพาะเมื่อต้องการเปลี่ยน" variant="outlined" rounded="lg" type="password" prepend-inner-icon="mdi-lock-outline" color="indigo" density="comfortable" />
            </v-col>
            <v-col cols="12" md="6">
              <v-select v-model="userForm.role" :items="[{title:'ผู้ดูแลระบบ', value:'admin'},{title:'ผู้รับการประเมิน', value:'evaluatee'},{title:'ผู้ประเมิน', value:'evaluator'}]" item-title="title" item-value="value" label="บทบาท (Role)" variant="outlined" rounded="lg" prepend-inner-icon="mdi-shield-account-outline" color="indigo" density="comfortable" />
            </v-col>
            <v-col cols="12" md="6">
              <v-select v-model="userForm.department_id" :items="departments" item-title="department_name" item-value="id" label="แผนกวิชา" variant="outlined" rounded="lg" prepend-inner-icon="mdi-office-building-outline" color="indigo" density="comfortable" :loading="departments.length === 0" />
            </v-col>
            <v-col cols="12" md="6">
              <v-select v-model="userForm.status" :items="[{title:'ใช้งานอยู่', value:'active'},{title:'ระงับการใช้งาน', value:'disabled'}]" item-title="title" item-value="value" label="สถานะการใช้งาน" variant="outlined" rounded="lg" prepend-inner-icon="mdi-check-circle-outline" color="indigo" density="comfortable" />
            </v-col>
          </v-row>
        </div>

        <v-divider class="border-opacity-10" />
        <div class="dialog-actions">
          <v-btn v-if="userEditMode" variant="tonal" color="error" rounded="xl" prepend-icon="mdi-delete-outline" @click="confirmDeleteUser" size="small">ลบผู้ใช้</v-btn>
          <v-spacer />
          <v-btn variant="text" rounded="xl" @click="userDialog = false" color="grey-darken-1">ยกเลิก</v-btn>
          <v-btn :color="userEditMode ? 'orange-darken-1' : 'indigo-darken-1'" variant="elevated" rounded="xl" class="px-8 font-weight-bold save-btn" @click="saveUser">
            {{ userEditMode ? 'อัปเดตข้อมูล' : 'บันทึกข้อมูล' }}
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
// ===== STATE MANAGEMENT =====
const dashboardData = ref({ activePeriod: null })
const summary = ref({ totalEvaluatees: 0, totalEvaluators: 0, totalEvidences: 0, evaluationProgress: 0, averageScore: 0 })
const departmentStats = ref([])
const personnelList = ref([])
const departments = ref([])
const allUsersList = ref([])

// [Dialog Trigger States]
const userDialog = ref(false)
const userEditMode = ref(false)
const periodManagerDialog = ref(false)
const periodFormDialog = ref(false)
const periodEditMode = ref(false)
const usersManagerDialog = ref(false)
const exportingPdf = ref(false)

// [Forms Reference Models]
const userForm = ref({ email: '', name_th: '', role: 'evaluatee', status: 'active', department_id: null })
const periodForm = ref({ id: null, code: '', name_th: '', buddhist_year: '', start_date: '', end_date: '', is_active: true })
const periods = ref([])

const personnelHeaders = [
  { title: 'ชื่อ-สกุล', key: 'name_th' },
  { title: 'สถานะ', key: 'status', align: 'center' },
  { title: '', key: 'actions', align: 'end', sortable: false },
]

const allUsersHeaders = [
  { title: 'ผู้ใช้งาน', key: 'name_th' },
  { title: 'บทบาท', key: 'role', align: 'center' },
  { title: 'สถานะ', key: 'status', align: 'center' },
  { title: '', key: 'actions', align: 'end', sortable: false },
]

// Computed Metrics for dashboard
const waitingEvaluationCount = computed(() => personnelList.value.filter(item => checkStatus(item) === 'รอดำเนินการ').length)
const completedEvaluationCount = computed(() => personnelList.value.filter(item => checkStatus(item) === 'เสร็จสมบูรณ์').length)

// Axios Instance Helper configuration
const api = axios.create({ baseURL: 'http://localhost:7000/api' })
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token')
  return { headers: { Authorization: token ? `Bearer ${token}` : '' } }
}

onMounted(async () => {
  if (!localStorage.getItem("auth_token")) { router.push('/'); return }
  await fetchDashboardData()
  await loadDepartments()
})

// Check user status mapping logic
function checkStatus(item) {
  const results = item.evaluation_result || []
  const submittedCount = results.filter(doc => doc.status === 'submitted').length
  return (results.length === 17 && submittedCount === 17) ? 'เสร็จสมบูรณ์' : 'รอดำเนินการ'
}

function formatDate(d) { return d ? d.toString().split('T')[0] : '' }
function formatDateDisplay(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })
}
function getAvatarUrl(avatar) {
  return avatar ? `http://localhost:7000/uploads/avatars/${avatar}` : ''
}

// ===== READ MAIN DASHBOARD DATA =====
async function fetchDashboardData() {
  try {
    const opt = getAuthHeaders()
    const resEvaluatee = await api.get('/admin/list_evaluatee?role=evaluatee', opt)
    if (resEvaluatee.data?.total !== undefined) {
      summary.value.totalEvaluatees = resEvaluatee.data.total
      personnelList.value = resEvaluatee.data.data
    }
    const resEvaluator = await api.get('/admin/list_evaluatee?role=evaluator', opt)
    if (resEvaluator.data?.total !== undefined) summary.value.totalEvaluators = resEvaluator.data.total

    const resAllUsers = await api.get('/users/list_all', opt).catch(() => null)
    if (resAllUsers?.data?.success) allUsersList.value = resAllUsers.data.data

    const resPeriod = await api.get('/admin/dashboard/active_period', opt).catch(() => null)
    if (resPeriod?.data?.success) dashboardData.value.activePeriod = resPeriod.data.data

    const resAvg = await api.get('/admin/average_score', opt).catch(() => ({ data: { data: { averageScore: 0 } } }))
    summary.value.averageScore = resAvg.data?.data?.averageScore || 0

    const resDept = await api.get('/admin/dashboard/department_stats', opt).catch(() => null)
    if (resDept?.data?.success) departmentStats.value = resDept.data.data
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลแดชบอร์ด:', error)
  }
}

async function loadAllUsers() {
  try {
    const { data } = await api.get('/users/list_all', getAuthHeaders())
    if (data?.success) {
      allUsersList.value = data.data || []
    }
  } catch (error) {
    console.error('โหลดผู้ใช้งานทั้งหมดไม่สำเร็จ:', error)
  }
}

async function loadDepartments() {
  try {
    const { data } = await api.get('/users/list_departments', getAuthHeaders())
    departments.value = data.data
  } catch (error) {
    console.error('โหลดแผนกไม่สำเร็จ:', error)
  }
}

// ===== INTERACTING 1: USER MANAGEMENT =====
function addUser() {
  userEditMode.value = false
  userForm.value = { email: '', name_th: '', role: 'evaluatee', status: 'active', department_id: null }
  userDialog.value = true
}
function openUsersManager() {
  loadAllUsers().finally(() => {
    usersManagerDialog.value = true
  })
}
function editUser(id) {
  const found = personnelList.value.find(u => u.id === id) || allUsersList.value.find(u => u.id === id)
  if (found) {
    userEditMode.value = true
    userForm.value = { ...found, password: '', department_id: found.department_id }
    usersManagerDialog.value = false
    userDialog.value = true
  }
}
async function saveUser() {
  try {
    const opt = getAuthHeaders()
    if (userEditMode.value) {
      await api.put(`/admin/update_user/${userForm.value.id}`, userForm.value, opt)
    } else {
      await api.post('/users/create_user', userForm.value, opt)
    }
    userDialog.value = false
    await fetchDashboardData()
    if (usersManagerDialog.value) await loadAllUsers()
  } catch (error) {
    alert('เกิดข้อผิดพลาดผู้ใช้งาน: ' + (error.response?.data?.message || error.message))
  }
}
async function confirmDeleteUser() {
  if (confirm(`ยืนยันการลบผู้ใช้งาน: ${userForm.value.name_th} ใช่หรือไม่?`)) {
    try {
      await api.delete(`/admin/delete_user/${userForm.value.id}`, getAuthHeaders())
      userDialog.value = false
      await fetchDashboardData()
      if (usersManagerDialog.value) await loadAllUsers()
    } catch (error) {
      alert('ไม่สามารถลบได้: ' + (error.response?.data?.message || error.message))
    }
  }
}

// ===== INTERACTING 2: PERIOD MANAGER (MODAL ENGINE) =====
async function openPeriodManager() {
  await fetchPeriodsList()
  periodManagerDialog.value = true
}
async function fetchPeriodsList() {
  try {
    const { data } = await api.get('/admin/list_periods', getAuthHeaders())
    periods.value = data.data
  } catch (err) {
    console.error('โหลดข้อมูลรอบประเมินผิดพลาด')
  }
}
function openAddPeriod() {
  periodEditMode.value = false
  periodForm.value = { id: null, code: '', name_th: '', buddhist_year: new Date().getFullYear() + 543, start_date: '', end_date: '', is_active: true }
  periodFormDialog.value = true
}
function openEditPeriod(item) {
  periodEditMode.value = true
  periodForm.value = { ...item, start_date: formatDate(item.start_date), end_date: formatDate(item.end_date) }
  periodFormDialog.value = true
}
async function savePeriod() {
  try {
    const opt = getAuthHeaders()
    const payload = { ...periodForm.value }
    if (periodEditMode.value) {
      await api.put(`/admin/update_periods/${payload.id}`, payload, opt)
    } else {
      await api.post('/admin/create_periods', payload, opt)
    }
    periodFormDialog.value = false
    await fetchPeriodsList()
    await fetchDashboardData() // อัปเดตเมทริกซ์และหัวข้อรอบปัจจุบันที่หน้าแรกด้วย
  } catch (err) {
    alert('พลาด: ' + (err.response?.data?.message || err.message))
  }
}
async function removePeriod(item) {
  if (!confirm(`ต้องการลบ "${item.name_th}" หรือไม่?`)) return
  try {
    await api.delete(`/admin/delete_periods/${item.id}`, getAuthHeaders())
    await fetchPeriodsList()
    await fetchDashboardData()
  } catch (err) {
    alert('ไม่สามารถลบข้อมูลรอบประเมินนี้ได้')
  }
}

// Export PDF functionality
async function exportReport() {
  exportingPdf.value = true
  try {
    const params = {}
    if (dashboardData.value.activePeriod?.id) params.period_id = dashboardData.value.activePeriod.id
    const response = await api.get('/admin/export_report', {
      ...getAuthHeaders(),
      responseType: 'blob',
      params,
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    const periodSuffix = dashboardData.value.activePeriod?.buddhist_year || 'current'
    link.setAttribute('download', `overview_report_${periodSuffix}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    alert('ไม่สามารถออกรายงานได้')
  } finally {
    exportingPdf.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
* { font-family: 'Inter', sans-serif !important; }

.dashboard-page { padding: 8px 0; min-height: 100vh; position: relative; overflow: hidden; }

/* Ambient Effect */
.blob-1, .blob-2 { position: absolute; border-radius: 50%; filter: blur(100px); z-index: 0; opacity: 0.4; pointer-events: none; }
.blob-1 { top: -100px; left: -50px; width: 600px; height: 600px; background: rgba(165, 180, 252, 0.25); }
.blob-2 { bottom: 10%; right: -50px; width: 500px; height: 500px; background: rgba(192, 132, 252, 0.15); }

/* ===== Page Header ===== */
.page-header { display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 1; }
.header-left { display: flex; align-items: center; gap: 14px; }
.page-icon-wrap {
  width: 46px; height: 46px; border-radius: 14px; flex-shrink: 0;
  background: linear-gradient(135deg, #1a237e, #3f51b5);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 20px rgba(26,35,126,0.3);
}
.page-title { font-size: 20px; font-weight: 800; color: #1a237e; letter-spacing: -0.4px; line-height: 1.2; }
.page-subtitle { font-size: 12.5px; color: #78909c; margin: 0; font-weight: 400; }
.period-badge {
  display: inline-block; background: linear-gradient(135deg, rgba(63,81,181,0.12), rgba(99,102,241,0.08));
  color: #3949ab; font-weight: 700; font-size: 11px; padding: 1px 8px; border-radius: 999px; border: 1px solid rgba(99,102,241,0.2);
}

/* ===== Stat / Metric Cards ===== */
.stat-card, .metric-card {
  background: rgba(255,255,255,0.85); backdrop-filter: blur(16px);
  border: 1px solid rgba(199,210,254,0.35); border-radius: 16px;
  padding: 18px 18px 16px; position: relative; overflow: hidden;
  display: flex; flex-direction: column; gap: 8px;
  box-shadow: 0 2px 12px rgba(99,102,241,0.07); transition: all 0.25s; cursor: default;
}
.stat-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(99,102,241,0.13); }
.stat-accent { position: absolute; top: 0; left: 0; width: 4px; height: 100%; border-radius: 16px 0 0 16px; }
.stat-icon-wrap, .metric-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-value, .metric-val { font-size: 26px; font-weight: 900; color: #1a237e; letter-spacing: -0.8px; line-height: 1; }
.stat-unit, .metric-unit { font-size: 12px; font-weight: 500; color: #90a4ae; margin-left: 4px; }
.stat-label, .metric-label { font-size: 12px; font-weight: 600; color: #78909c; }
.metric-card { flex-direction: row; align-items: center; gap: 16px; width: 100%; background: white;}
.metric-active { border-color: rgba(34,197,94,0.4); }

/* ===== Section Cards & Tables ===== */
.section-card {
  background: rgba(255,255,255,0.8); backdrop-filter: blur(20px);
  border: 1px solid rgba(199,210,254,0.4); border-radius: 20px; overflow: hidden;
  box-shadow: 0 4px 20px rgba(99,102,241,0.07); position: relative; z-index: 1;
}
.section-header { padding: 18px 20px 14px; display: flex; align-items: center; justify-content: space-between; }
.section-title-group { display: flex; align-items: center; gap: 10px; }
.section-icon-sm {
  width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
  background: linear-gradient(135deg, #1a237e, #3f51b5); display: flex; align-items: center; justify-content: center;
}
.section-title { font-size: 14px; font-weight: 700; color: #1a237e; line-height: 1.2; }
.section-sub { font-size: 11px; color: #90a4ae; }

.custom-table { background: transparent !important; }
:deep(.custom-table .v-data-table__thead) { background: rgba(99,102,241,0.04) !important; }
:deep(.custom-table .v-data-table__thead th) {
  font-size: 11px !important; font-weight: 800 !important; color: #5c6bc0 !important;
  text-transform: uppercase !important; border-bottom: 1px solid rgba(99,102,241,0.1) !important;
}
:deep(.custom-table td) { font-size: 13px !important; border-bottom: 1px solid rgba(0,0,0,0.04) !important; }

/* Status Dot Styles */
.status-wrap { display: flex; align-items: center; gap: 6px; }
.status-dot { width: 7px; height: 7px; border-radius: 50%; }
.dot-green { background: #22c55e; box-shadow: 0 0 0 2px rgba(34,197,94,0.2); }
.dot-amber { background: #f59e0b; box-shadow: 0 0 0 2px rgba(245,158,11,0.2); }
.status-text { font-size: 12.5px; font-weight: 600; }
.table-footer-note { display: flex; align-items: center; padding: 10px 16px; font-size: 11px; color: #90a4ae; background: rgba(99,102,241,0.03); }

/* ===== Quick Actions Buttons ===== */
.quick-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 0 4px 4px; }
.qa-btn {
  display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 8px; border-radius: 14px; border: none;
  cursor: pointer; transition: all 0.25s; font-weight: 600; font-size: 12px; position: relative; overflow: hidden;
}
.qa-btn:hover { transform: translateY(-3px); }
.qa-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.25); }
.qa-indigo { background: linear-gradient(135deg, #1a237e, #3f51b5); color: white; box-shadow: 0 6px 18px rgba(26,35,126,0.25); }
.qa-amber { background: linear-gradient(135deg, #b45309, #f59e0b); color: white; box-shadow: 0 6px 18px rgba(245,158,11,0.25); }

/* ===== Export Report Card ===== */
.export-card {
  border-radius: 20px; padding: 22px; background: linear-gradient(135deg, #0f766e, #14b8a6); position: relative; overflow: hidden;
}
.export-content { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; position: relative; z-index: 1; }
.export-icon-wrap { width: 52px; height: 52px; border-radius: 14px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; }
.export-title { font-size: 15px; font-weight: 800; color: white; }
.export-sub { font-size: 11.5px; color: rgba(255,255,255,0.7); }
.export-btn { color: #0f766e !important; font-weight: 800 !important; font-size: 13px !important; }

/* ===== Department Progress Metrics ===== */
.dept-list { padding: 0 4px 4px; display: flex; flex-direction: column; gap: 10px; }
.dept-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-radius: 12px; background: rgba(99,102,241,0.04); border: 1px solid rgba(199,210,254,0.3); }
.dept-code { width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #e8eaf6, #c5cae9); display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 900; color: #1a237e; }
.dept-name { font-size: 12.5px; font-weight: 600; color: #1a237e; }
.dept-progress-bar { display: flex; align-items: center; gap: 6px; margin-top: 4px; }
.dept-bar-track { flex: 1; height: 4px; background: rgba(99,102,241,0.12); border-radius: 99px; overflow: hidden; }
.dept-bar-fill { height: 100%; background: linear-gradient(90deg, #3f51b5, #7986cb); transition: width 0.8s ease; }
.dept-count { font-size: 10px; color: #90a4ae; }
.dept-pct { font-size: 13px; font-weight: 800; min-width: 38px; text-align: right; }
.pct-done { color: #10b981; }
.pct-wip { color: #3949ab; }

/* ===== [Dialog Framework Layouts] ===== */
.dialog-card { background: rgba(255,255,255,0.98) !important; box-shadow: 0 30px 80px rgba(0,0,0,0.2) !important; }
.dialog-header { padding: 24px; position: relative; overflow: hidden; }
.dialog-add { background: linear-gradient(135deg, #1a237e, #3f51b5); }
.dialog-edit { background: linear-gradient(135deg, #78350f, #d97706); }
.dialog-header-bg { position: absolute; inset: 0; background-image: radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px); background-size: 24px 24px; }
.dialog-title { font-size: 16px; font-weight: 800; color: white; }
.dialog-sub { font-size: 11px; color: rgba(255,255,255,0.7); }
.dialog-actions { display: flex; align-items: center; padding: 14px 20px; gap: 8px; }

/* ===== Period Manager Timeline Visual Inside Dialog ===== */
.period-card { border: 1px solid #e2e8f0; border-radius: 16px; background: white; transition: all 0.3s; }
.card-active { border-color: rgba(99,102,241,0.5); background: rgba(238,242,255,0.4); }
.status-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 800; }
.badge-active { background: rgba(34,197,94,0.1); color: #15803d; }
.badge-inactive { background: rgba(100,116,139,0.1); color: #475569; }
.badge-active .status-dot { background: #22c55e; }
.badge-inactive .status-dot { background: #94a3b8; }
.timeline-visual { display: flex; align-items: center; justify-content: space-between; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; }
.time-node { display: flex; flex-direction: column; }
.field-label { font-size: 12px; font-weight: 800; color: #475569; text-transform: uppercase; }
.switch-wrap { display: flex; align-items: center; gap: 10px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 6px 12px; }

/* Entrance Animations triggers */
.anim-1 { animation: cardUp 0.55s 0.05s both; }
.anim-2 { animation: cardUp 0.55s 0.12s both; }
.anim-3 { animation: cardUp 0.55s 0.19s both; }
.anim-4 { animation: cardUp 0.55s 0.26s both; }
.anim-5 { animation: cardUp 0.55s 0.33s both; }
.anim-6 { animation: cardUp 0.55s 0.40s both; }
.anim-7 { animation: cardUp 0.55s 0.47s both; }
.anim-8 { animation: cardUp 0.55s 0.54s both; }
@keyframes cardUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
.relative-z { position: relative; z-index: 1; }
.gap-3 { gap: 12px; }
.gap-2 { gap: 8px; }
</style>
