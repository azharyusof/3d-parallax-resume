export const skillCategoriesData = [
  { id: 'all', name: 'ALL TECH & SKILLS' },
  { id: 'frontend', name: 'FRONTEND & MOBILE' },
  { id: 'backend', name: 'BACKEND & DATABASES' },
  { id: 'devops', name: 'DEVOPS & CLOUD' },
  { id: 'ai', name: 'AI & AUTOMATION' }
]

export const skillsData = [
  // Frontend & Mobile
  {
    nodeId: 'vue',
    name: 'Vue.JS',
    category: 'frontend',
    level: 95,
    tag: 'FRONTEND DEVELOPMENT',
    color: '#42b883',
    svg: `<svg viewBox="0 0 128 128" width="28" height="28"><path fill="#42b883" d="M78.8 10L64 35.4 49.2 10H0l64 110L128 10z"/><path fill="#35495e" d="M78.8 10L64 35.4 49.2 10H25.6L64 76.8l38.4-66.8z"/></svg>`
  },
  {
    nodeId: 'react',
    name: 'React.JS',
    category: 'frontend',
    level: 90,
    tag: 'FRONTEND DEVELOPMENT',
    color: '#61dafb',
    svg: `<svg viewBox="0 0 100 100" width="28" height="28"><circle cx="50" cy="50" r="10" fill="#61dafb"/><ellipse cx="50" cy="50" rx="42" ry="16" fill="none" stroke="#61dafb" stroke-width="5" transform="rotate(0 50 50)"/><ellipse cx="50" cy="50" rx="42" ry="16" fill="none" stroke="#61dafb" stroke-width="5" transform="rotate(60 50 50)"/><ellipse cx="50" cy="50" rx="42" ry="16" fill="none" stroke="#61dafb" stroke-width="5" transform="rotate(120 50 50)"/></svg>`
  },
  {
    nodeId: 'flutter',
    name: 'Flutter',
    category: 'frontend',
    level: 88,
    tag: 'CROSS PLATFORM DEVELOPMENT',
    color: '#54c5f8',
    svg: `<svg viewBox="0 0 128 128" width="28" height="28"><path fill="#54c5f8" d="M74.3 0L24.7 49.6l24.8 24.8L124 0z"/><path fill="#02569b" d="M74.3 64.4L49.5 89.2l24.8 24.8 49.7-49.6z"/><path fill="#0175c2" d="M49.5 89.2l24.8 24.8H124L99.2 89.2z"/></svg>`
  },
  {
    nodeId: 'flutter',
    name: 'Android Native',
    category: 'frontend',
    level: 85,
    tag: 'MOBILE DEVELOPMENT',
    color: '#3ddc84',
    svg: `<svg viewBox="0 0 100 100" width="28" height="28"><path fill="#3ddc84" d="M25 40v35a5 5 0 0 0 5 5h40a5 5 0 0 0 5-5V40H25zm7-20l-5-8a2 2 0 0 1 3-2l5 8a35 35 0 0 1 30 0l5-8a2 2 0 0 1 3 2l-5 8a36 36 0 0 1 17 26H15a36 36 0 0 1 17-26z"/><circle cx="35" cy="30" r="3" fill="#fff"/><circle cx="65" cy="30" r="3" fill="#fff"/></svg>`
  },

  // Backend & Databases
  {
    nodeId: 'laravel',
    name: 'Laravel Framework',
    category: 'backend',
    level: 92,
    tag: 'BACKEND DEVELOPMENT',
    color: '#ff2d20',
    svg: `<svg viewBox="0 0 128 128" width="28" height="28"><path fill="#ff2d20" d="M105.7 32.5L78.2 16.6c-2.4-1.4-5.3-1.4-7.7 0L43 32.5c-2.4 1.4-3.9 4-3.9 6.8v31.9c0 2.8 1.5 5.4 3.9 6.8l27.5 15.9c2.4 1.4 5.3 1.4 7.7 0l27.5-15.9c2.4-1.4 3.9-4 3.9-6.8V39.3c0-2.8-1.5-5.4-3.9-6.8zM74.3 88.5L48.6 73.7V44.1l25.7 14.8v29.6zm28.6-14.8L77.2 88.5V58.9l25.7-14.8v29.6z"/></svg>`
  },
  {
    nodeId: 'net',
    name: '.NET Framework',
    category: 'backend',
    level: 94,
    tag: 'BACKEND DEVELOPMENT',
    color: '#512bd4',
    svg: `<svg viewBox="0 0 128 128" width="28" height="28"><path fill="#512bd4" d="M64 0C28.7 0 0 28.7 0 64s28.7 64 64 64 64-28.7 64-64S99.3 0 64 0zm-24 90H28V38h12v52zm36 0H64l-20-34V38h12v28l18 24h2zm28 0H92V38h12v52z"/></svg>`
  },
  {
    nodeId: 'net',
    name: 'Microsoft SQL Server',
    category: 'backend',
    level: 90,
    tag: 'RELATIONAL DATABASE',
    color: '#cc292b',
    svg: `<svg viewBox="0 0 100 100" width="28" height="28"><ellipse cx="50" cy="20" rx="36" ry="12" fill="#cc292b"/><path fill="#cc292b" d="M14 20v20c0 6.6 16.1 12 36 12s36-5.4 36-12V20H14zm0 25v20c0 6.6 16.1 12 36 12s36-5.4 36-12V45H14zm0 25v20c0 6.6 16.1 12 36 12s36-5.4 36-12V70H14z"/></svg>`
  },
  {
    nodeId: 'laravel',
    name: 'MySQL',
    category: 'backend',
    level: 88,
    tag: 'RELATIONAL DATABASE',
    color: '#00758f',
    svg: `<svg viewBox="0 0 100 100" width="28" height="28"><path fill="#00758f" d="M50 15C30 15 15 30 15 50c0 15 10 28 24 33l5-12c-8-3-14-11-14-21 0-12 10-22 20-22s20 10 20 22c0 10-6 18-14 21l5 12c14-5 24-18 24-33 0-20-15-35-35-35z"/></svg>`
  },
  {
    nodeId: 'net',
    name: 'PostgreSQL',
    category: 'backend',
    level: 88,
    tag: 'RELATIONAL DATABASE',
    color: '#336791',
    svg: `<svg viewBox="0 0 100 100" width="28" height="28"><path fill="#336791" d="M50 10C27.9 10 10 27.9 10 50s17.9 40 40 40 40-17.9 40-40S72.1 10 50 10zm-5 15c15 0 25 10 25 25s-10 25-25 25H30V25h15zm0 10H38v30h7c9 0 15-6 15-15s-6-15-15-15z"/></svg>`
  },
  {
    nodeId: 'laravel',
    name: 'MariaDB',
    category: 'backend',
    level: 88,
    tag: 'RELATIONAL DATABASE',
    color: '#c0765a',
    svg: `<svg viewBox="0 0 100 100" width="28" height="28"><path fill="#c0765a" d="M50 15C30 15 15 30 15 50s15 35 35 35 35-15 35-35-15-35-35-35zm0 12c12.7 0 23 10.3 23 23S62.7 73 50 73 27 62.7 27 50s10.3-23 23-23z"/></svg>`
  },

  // DevOps & Cloud
  {
    nodeId: 'devops',
    name: 'CI/CD GitHub Actions',
    category: 'devops',
    level: 92,
    tag: 'DEVOPS (AUTOMATED)',
    color: '#2088ff',
    svg: `<svg viewBox="0 0 100 100" width="28" height="28"><path fill="#2088ff" d="M50 10C27.9 10 10 27.9 10 50c0 17.7 11.5 32.7 27.4 38 2 .4 2.7-.9 2.7-1.9v-7c-11.2 2.4-13.5-4.8-13.5-4.8-1.8-4.6-4.4-5.8-4.4-5.8-3.6-2.5.3-2.4.3-2.4 4 .3 6.1 4.1 6.1 4.1 3.6 6.1 9.4 4.3 11.7 3.3.4-2.6 1.4-4.3 2.6-5.3-8.9-1-18.3-4.5-18.3-19.9 0-4.4 1.6-8 4.2-10.8-.4-1-.18-5.1.4-10.7 0 0 3.4-1.1 11.1 4.1 3.2-.9 6.7-1.3 10.1-1.3s6.9.4 10.1 1.3c7.7-5.2 11.1-4.1 11.1-4.1.6 5.6.2 9.7-.4 10.7 2.6 2.8 4.2 6.4 4.2 10.8 0 15.5-9.4 18.9-18.4 19.9 1.4 1.2 2.7 3.6 2.7 7.3v10.8c0 1 .7 2.3 2.8 1.9C78.5 82.7 90 67.7 90 50 90 27.9 72.1 10 50 10z"/></svg>`
  },
  {
    nodeId: 'devops',
    name: 'Docker Containerization',
    category: 'devops',
    level: 90,
    tag: 'CONTAINERIZATION',
    color: '#2496ed',
    svg: `<svg viewBox="0 0 100 100" width="28" height="28"><path fill="#2496ed" d="M90 48c-2.7.2-5.4 1.3-7.5 3.1-2.4-5-7.4-8.1-13.5-8.1h-7.8v-7h11v-10h-11v-3H49v13h-11v-13H26v13h-11v10h11v7h-12C6 43 0 51.5 0 60c0 15 12 25 35 25 24 0 45-12 51-26 2-1 4-2 6-2 3 0 6 1 8 3h2c0-5-5-12-12-12z"/></svg>`
  },
  {
    nodeId: 'devops',
    name: 'Sonarqube',
    category: 'devops',
    level: 85,
    tag: 'CODE QUALITY',
    color: '#4E9BCD',
    svg: `<svg viewBox="0 0 100 100" width="28" height="28"><path fill="#4E9BCD" d="M50 10C27.9 10 10 27.9 10 50s17.9 40 40 40 40-17.9 40-40S72.1 10 50 10zm-5 60L25 50l7-7 13 13 23-23 7 7-30 30z"/></svg>`
  },
  {
    nodeId: 'devops',
    name: 'HashiCorp Vault',
    category: 'devops',
    level: 88,
    tag: 'SECRET MANAGEMENT',
    color: '#00c7b7',
    svg: `<svg viewBox="0 0 100 100" width="28" height="28"><path fill="#00c7b7" d="M50 10L15 30v40l35 20 35-20V30L50 10zm0 15l22 13-22 13-22-13 22-13zm-22 25l20 12v22L28 72V50zm44 22L52 84V62l20-12v22z"/></svg>`
  },
  {
    nodeId: 'devops',
    name: 'Grafana',
    category: 'devops',
    level: 86,
    tag: 'MONITORING & TELEMETRY',
    color: '#F46800',
    svg: `<svg viewBox="0 0 100 100" width="28" height="28"><path fill="#F46800" d="M50 10C27.9 10 10 27.9 10 50s17.9 40 40 40 40-17.9 40-40S72.1 10 50 10zm-5 18a12 12 0 1 1 0 24 12 12 0 0 1 0-24zm15 44a24 24 0 0 1-30-5l7-7a14 14 0 0 0 18 3l5 9z"/></svg>`
  },
  {
    nodeId: 'devops',
    name: 'ELK Stack',
    category: 'devops',
    level: 86,
    tag: 'AUDIT & LOGGING MANAGEMENT',
    color: '#00BFB3',
    svg: `<svg viewBox="0 0 100 100" width="28" height="28"><path fill="#00BFB3" d="M45 20a25 25 0 1 0 16 44l16 16 6-6-16-16A25 25 0 0 0 45 20zm0 8a17 17 0 1 1 0 34 17 17 0 0 1 0-34z"/><rect x="35" y="38" width="20" height="4" fill="#00BFB3"/><rect x="35" y="46" width="12" height="4" fill="#00BFB3"/></svg>`
  },
  {
    nodeId: 'devops',
    name: 'Playwright',
    category: 'devops',
    level: 85,
    tag: 'E2E TESTING',
    color: '#2EAD33',
    svg: `<svg viewBox="0 0 100 100" width="28" height="28"><path fill="#2EAD33" d="M30 20h40v60H30z" opacity="0.3"/><path fill="#2EAD33" d="M20 30l30-15 30 15v40L50 85 20 70V30zm30 0L30 40v20l20 10 20-10V40L50 30z"/></svg>`
  },
  {
    nodeId: 'devops',
    name: 'K6',
    category: 'devops',
    level: 85,
    tag: 'PERFORMANCE TESTING',
    color: '#7D64FF',
    svg: `<svg viewBox="0 0 100 100" width="28" height="28"><path fill="#7D64FF" d="M20 20h20v60H20zm25 0l35 30-35 30V20z"/></svg>`
  },

  // AI & Automation
  {
    nodeId: 'devops',
    name: 'n8n Workflow Automation',
    category: 'ai',
    level: 90,
    tag: 'AI WORKFLOW AUTOMATION',
    color: '#FF6D5A',
    svg: `<svg viewBox="0 0 100 100" width="28" height="28"><path fill="#FF6D5A" d="M20 30h20v40H20zm25-10h20v60H45zm25 20h20v20H70z"/><circle cx="30" cy="50" r="5" fill="#fff"/><circle cx="55" cy="50" r="5" fill="#fff"/><circle cx="80" cy="50" r="5" fill="#fff"/></svg>`
  },
  {
    nodeId: 'devops',
    name: 'LLM & AI Agent Integration',
    category: 'ai',
    level: 88,
    tag: 'AI AGENT & LLM',
    color: '#10a37f',
    svg: `<svg viewBox="0 0 100 100" width="28" height="28"><circle cx="50" cy="50" r="35" fill="none" stroke="#10a37f" stroke-width="6"/><circle cx="50" cy="50" r="15" fill="#10a37f"/><path stroke="#10a37f" stroke-width="6" d="M50 5v10M50 85v10M5 50h10M85 50h10"/></svg>`
  }
]
