// ~/composables/useMenu.js
import { ref, computed } from 'vue'

function normalizeRole(r) {
  const x = (r || '').toString().toLowerCase()
  if (x === 'evaluatee') return 'user'
  return ['admin', 'evaluator', 'user'].includes(x) ? x : 'user'
}

const MAP = {
  admin: [
    {
      label: 'MAIN',
      items: [
        { label: 'ภาพรวมการประเมิน', to: '/overview', icon: 'mdi-view-dashboard' },
        { label: 'จัดการรอบประเมิน', to: '/list_periods', icon: 'mdi-alarm-panel' },
        { label: 'จับคู่การประเมิน', to: '/assignments', icon: 'mdi-account-multiple-outline' },
        { label: 'ติดตามสถานะกรรมการ', to: '/evaluator-tracking', icon: 'mdi-timeline-check-outline' },
        { label: 'ติดตามสถานะผู้ถูกประเมิน', to: '/evaluatee-tracking', icon: 'mdi-account-eye-outline' },
        { label: 'รายงานรายบุคคล', to: '/individual-report', icon: 'mdi-file-account-outline' },
        { label: 'สรุปผลรายกรรมการ', to: '/evaluator-summary', icon: 'mdi-chart-box-multiple-outline' },
        { label: 'หัวข้อการประเมิน', to: '/list_topics', icon: 'mdi-book' },
        { label: 'ตัวชี้วัด', to: '/list_indicators', icon: 'mdi-chart-bar' },
        { label: 'ประเภทสาขาอาชีพ', to: '/list_categories', icon: 'mdi-chart-pie' },
      ]
    }
  ],

  evaluator: [
    {
      label: 'การประเมินบุคลาการ',
      items: [
        { label: 'ประเมินบุคลการ', to: '/evaluator-evaluation', icon: 'mdi-view-dashboard-outline' },
      ]
    }
  ],

  user: [
    {
      label: 'ส่งเอกสารการประเมิน',
      items: [
        { label: 'ส่งหลักฐานการประเมิน', to: '/evaluatee-upload', icon: 'mdi-tray-arrow-up' },
        { label: 'ประเมินตัวเอง', to: '/self-evaluation', icon: 'mdi-account-arrow-up' }
      ]
    }
  ]
}

// ===== ฟังก์ชันสำคัญ =====
export function useMenu() {

  const role = ref('user')

  function loadRoleFromStorage() {
    try {
      const userRaw = localStorage.getItem('auth_user')

      if (!userRaw) {
        role.value = 'user'
        return
      }

      const user = JSON.parse(userRaw)

      role.value = normalizeRole(user.role)

    } catch (err) {
      console.error('useMenu parse error:', err)
      role.value = 'user'
    }
  }

  // โหลด role ตอนเริ่มต้น (client side)
  if (process.client) {
    loadRoleFromStorage()
  }

  const menu = computed(() => {
    return MAP[role.value] || MAP.user
  })

  return {
    menu,
    role,
    reloadRole: loadRoleFromStorage
  }
}
