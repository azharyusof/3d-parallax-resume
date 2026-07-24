import mysirimScreenshot from '../assets/mysirim_screenshot.png'
import mysirimDashboard from '../assets/mysirim_dashboard.png'
import mysirimReporting from '../assets/mysirim_reporting.png'
import blmsDashboard from '../assets/blms_dashboard.png'
import blmsList from '../assets/blms_list.png'
import wmsDashboard from '../assets/wms_dashboard.png'
import wmsShift from '../assets/wms_shift.png'
import wmsOvertime from '../assets/wms_overtime.png'

export const projectFiltersData = ['All', 'Mobile', 'Full-Stack', 'IoT', 'DevOps']

export const projectsData = [
  {
    title: 'MYSIRIM',
    company: 'SIRIM QAS International Sdn Bhd',
    description: 'Cross-platform mobile application deployed on major stores, enabling consumers to verify product authenticity, certifications, and access detailed data sheets.',
    category: 'Mobile',
    tech: ['Flutter', '.NET 8', 'MSSQL', 'REST APIs'],
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    demoUrl: 'https://example.com',
    images: [mysirimScreenshot, mysirimDashboard, mysirimReporting],
    activeIdx: 0
  },
  {
    title: 'Vending Machine System (VMS)',
    company: 'XOX Technology Berhad',
    description: 'IoT vending machine integration managing payment gateways, digital product catalogs, remote hardware telemetry, and machine maintenance APIs.',
    category: 'IoT',
    tech: ['Android Native', 'Laravel', 'MySQL'],
    gradient: 'linear-gradient(135deg, #f59e0b, #eab308)',
    demoUrl: 'https://example.com',
    images: [],
    activeIdx: 0
  },
  {
    title: 'Workforce Management System (WMS)',
    company: 'XOX Technology Berhad',
    description: 'Enterprise team management platform for attendance logging, shift scheduling, overtime calculations, leave workflows, and analytical reporting services.',
    category: 'Full-Stack',
    tech: ['Vue.js', 'Laravel', 'MySQL'],
    gradient: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
    demoUrl: 'https://example.com',
    images: [wmsDashboard, wmsShift, wmsOvertime],
    activeIdx: 0
  },
  {
    title: 'Business License Management (BLMS)',
    company: 'UEM Edgenta Berhad',
    description: 'Centralized enterprise platform tracking and renewing business licenses across domestic and international UEM subsidiaries. Handles automatic expirations and multi-user verification audits.',
    category: 'Full-Stack',
    tech: ['React.js', '.NET Core', 'MSSQL'],
    gradient: 'linear-gradient(135deg, #6366f1, #3b82f6)',
    demoUrl: 'https://example.com',
    images: [blmsDashboard, blmsList],
    activeIdx: 0
  },
  {
    title: 'Travel Management (Edgenta Travel)',
    company: 'UEM Edgenta Berhad',
    description: 'Organisational travel booking portal streamlining flight, accommodation, transport scheduling, and claim workflows for corporate staff.',
    category: 'Full-Stack',
    tech: ['Vue.js', '.NET Core', 'MSSQL'],
    gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    demoUrl: 'https://example.com',
    images: [],
    activeIdx: 0
  },
  {
    title: 'DevOps & CI/CD Infrastructure',
    company: 'UEM Edgenta Berhad',
    description: 'Enterprise DevOps pipeline automating code quality audits, container builds, monitoring telemetry, security compliance, and credential storage.',
    category: 'DevOps',
    tech: ['GitHub Actions', 'Docker', 'ELK Stack', 'Grafana', 'Vault', 'K6', 'Playwright'],
    gradient: 'linear-gradient(135deg, #1f2937, #111827)',
    demoUrl: 'https://example.com',
    images: [],
    activeIdx: 0
  },
  {
    title: 'Gatepass Management System (GMS)',
    company: 'Felda Prodata System Sdn Bhd',
    description: 'Real-time monitoring and logistics control system tracking palm oil lorry movements, security clearing, and mill entry/exit gates.',
    category: 'Full-Stack',
    tech: ['.NET MVC', 'MSSQL'],
    gradient: 'linear-gradient(135deg, #8b5cf6, #d946ef)',
    demoUrl: 'https://example.com',
    images: [],
    activeIdx: 0
  },
  {
    title: 'Palm Fruit Grading System',
    company: 'Felda Prodata System Sdn Bhd',
    description: 'Weighing bridge integration and fruit grading system automating thermal receipt printing and regional management reporting.',
    category: 'Full-Stack',
    tech: ['.NET MVC', 'MSSQL', 'Hardware Integration'],
    gradient: 'linear-gradient(135deg, #f43f5e, #ec4899)',
    demoUrl: 'https://example.com',
    images: [],
    activeIdx: 0
  },
  {
    title: 'FELDA GIS Plantation System',
    company: 'Felda Prodata System Sdn Bhd',
    description: 'Geospatial plantation dashboard mapping oil palm trees, asset coordinates, and residential areas in FELDA sectors.',
    category: 'Full-Stack',
    tech: ['React.js', 'Laravel', 'MSSQL', 'GIS / Leaflet'],
    gradient: 'linear-gradient(135deg, #06b6d4, #10b981)',
    demoUrl: 'https://example.com',
    images: [],
    activeIdx: 0
  }
]
