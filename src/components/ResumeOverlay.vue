<template>
  <div class="overlay-container">
    <!-- Sticky HUD Header -->
    <header class="hud-header">
      <div class="hud-logo">
        <Terminal class="logo-icon" />
        <span class="logo-text">AZHAR YUSOF</span>
      </div>
      <nav class="hud-nav d-none-mobile">
        <a 
          v-for="(sec, idx) in sections" 
          :key="idx" 
          :href="'#' + sec.id"
          class="hud-nav-link"
          :class="{ active: activeSection === idx }"
          @click="onNavClick(idx, $event)"
          @mouseenter="triggerHoverSound"
        >
          <span class="nav-num">0{{ idx }}</span>
          <span class="nav-name">{{ sec.name }}</span>
        </a>
      </nav>
      <div class="hud-controls"></div>
    </header>

    <!-- Side Navigation HUD Indicators -->
    <aside class="hud-side-nav">
      <div 
        v-for="(sec, idx) in sections" 
        :key="idx" 
        class="side-dot-container"
        @click="scrollToSection(idx)"
        @mouseenter="triggerHoverSound"
      >
        <span class="side-dot-label">{{ sec.name }}</span>
        <div class="side-dot" :class="{ active: activeSection === idx }"></div>
      </div>
    </aside>



    <!-- CONTENT SECTIONS -->
    
    <!-- Hero Section -->
    <section id="hero" class="section hero-section">
      <div class="hero-card-wrapper animated-float">
        <div 
          :ref="bindHeroCard"
          class="glass-panel hero-panel"
        >
          <!-- Liquid Drift Colors Background -->
          <div class="liquid-bg-layer"></div>

          <!-- Left Column: Profile Details -->
          <div class="hero-profile-pane">
            <!-- Profile Avatar Wrapper -->
            <div class="avatar-wrapper">
              <div class="avatar-glow"></div>
              <img :src="avatarImg" alt="Azhar Yusof Profile Picture" class="avatar-img" />
            </div>
            
            <div class="badge-row hero-badges">
              <span class="badge">
                <Briefcase class="icon-spacing" /> {{ heroData.availability }}
              </span>
              <span class="badge location-badge">
                <MapPin class="icon-spacing" /> {{ heroData.location }}
              </span>
            </div>

            <!-- Diagnostics dashboard -->
            <div class="hero-diagnostics">
              <div v-for="diag in liveDiagnostics" :key="diag.label" class="diag-item">
                <span class="diag-label">{{ diag.label }}</span>
                <span class="diag-value" :class="{ 'status-online': diag.isOnline }">{{ diag.value }}</span>
              </div>
            </div>
          </div>

          <!-- Right Column: Bio & Action -->
          <div class="hero-content-pane">
            <!-- <div class="panel-tag">// SYS_ACCESS_GRANTED</div> -->
            <h1 class="hero-name text-gradient">{{ heroData.name }}</h1>
            <h2 class="hero-title text-glow">{{ heroData.title }}</h2>

            <div class="terminal-text-box">
              <div class="terminal-header-bar">
                <div class="terminal-dots">
                  <span class="dot red"></span>
                  <span class="dot yellow"></span>
                  <span class="dot green"></span>
                </div>
                <span class="terminal-title">bash -- 80x24</span>
              </div>
              <div class="terminal-body">
                <Terminal class="box-icon" />
                <p ref="terminalCodeRef" class="terminal-code">
                  <span class="code-accent"></span>{{ typingText }}<span class="cursor-blink">_</span>
                </p>
              </div>
            </div>

            <div class="hero-action-row">
              <button 
                class="action-btn-primary" 
                @click="scrollToSection(1)"
                @mouseenter="triggerHoverSound"
              >
                {{ heroData.actions.primaryText }}
              </button>
              <a 
                href="#contact" 
                class="action-btn-secondary"
                @click="onNavClick(5, $event)"
                @mouseenter="triggerHoverSound"
              >
                {{ heroData.actions.secondaryText }}
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div class="scroll-prompt" @click="scrollToSection(1)">
        <span class="prompt-text">SCROLL FOR MORE INFORMATION</span>
        <div class="prompt-arrow"></div>
      </div>
    </section>

    <!-- Profile & Certificates Section -->
    <section id="about" class="section about-section">
      <div class="section-header">
        <span class="section-num">01</span>
        <h2 class="section-title">PROFESSIONAL CERTIFICATES</h2>
      </div>

      <!-- Three.js Coverflow Certificate Slider -->
      <CertSlider3D
        :certificates="certificates"
        :audioEnabled="isAudioEnabled"
        @cert-change="onCertChange"
      />
    </section>

    <!-- Skills Section -->
    <section id="skills" class="section skills-section">
      <div class="section-header">
        <span class="section-num">02</span>
        <h2 class="section-title">TECHNOLOGY & SKILLS</h2>
      </div>

      <div class="glass-panel skills-panel">
        <div class="skills-top-bar">
          <div class="panel-tag"></div>
          
          <!-- Category Filter Tabs -->
          <div class="skills-filter-tabs">
            <button 
              v-for="cat in skillCategories" 
              :key="cat.id"
              class="skills-tab-btn"
              :class="{ active: activeSkillCategory === cat.id }"
              @click="activeSkillCategory = cat.id; triggerClickSound()"
              @mouseenter="triggerHoverSound"
            >
              {{ cat.name }}
            </button>
          </div>
        </div>

        <!-- <p class="skills-info-text">
          Hover over any technology card below to align WebGL Quantum Core background nodes.
        </p> -->

        <!-- Interactive Skills Brand Slider Track -->
        <div class="skills-slider-container">
          <button 
            class="skills-arrow-btn prev"
            @click="scrollSkills(-1)"
            :disabled="isSkillsAtStart"
            @mouseenter="triggerHoverSound"
            aria-label="Previous skills"
          >
            <ChevronLeft class="arrow-icon" />
          </button>

          <div ref="skillsTrackRef" class="skills-slider-track" @scroll="checkSkillsScroll">
            <div class="skills-brand-grid">
              <div 
                v-for="s in filteredSkills" 
                :key="s.name"
                :ref="addSkillCard"
                class="skill-brand-card"
                :class="{ active: hoveredSkillName === s.name }"
                :style="{ '--brand-color': s.color }"
                @mouseenter="onSkillHover(s)"
                @mouseleave="onSkillLeave"
                @click="onSkillSelect(s)"
              >
                <div class="skill-brand-icon-wrapper">
                  <div class="brand-glow" :style="{ backgroundColor: s.color }"></div>
                  <div class="brand-svg-box" v-html="s.svg"></div>
                </div>
                
                <div class="skill-brand-info">
                  <div class="skill-brand-header">
                    <span class="skill-brand-name">{{ s.name }}</span>
                    <span class="skill-level-num" :style="{ color: s.color }">{{ s.level }}%</span>
                  </div>

                  <!-- Animated level progress bar -->
                  <div class="skill-progress-track">
                    <div 
                      class="skill-progress-fill" 
                      :style="{ width: s.level + '%', backgroundColor: s.color, boxShadow: `0 0 10px ${s.color}` }"
                    ></div>
                  </div>

                  <span class="skill-tag-pill" :style="{ borderColor: s.color, color: s.color }">{{ s.tag }}</span>
                </div>
              </div>
            </div>
          </div>

          <button 
            class="skills-arrow-btn next"
            @click="scrollSkills(1)"
            :disabled="isSkillsAtEnd"
            @mouseenter="triggerHoverSound"
            aria-label="Next skills"
          >
            <ChevronRight class="arrow-icon" />
          </button>
        </div>
      </div>
    </section>

    <!-- Work Experience Section -->
    <section id="experience" class="section experience-section">
      <div class="section-header">
        <span class="section-num">03</span>
        <h2 class="section-title">WORK EXPERIENCES</h2>
      </div>

      <!-- Horizontal HUD Nav Timeline Bar -->
      <div class="horizontal-nav-timeline">
        <div class="horiz-track-bg"></div>
        <div 
          class="horiz-track-active" 
          :style="{ width: activeJobIndex === 0 ? '0%' : (activeJobIndex === 1 ? '50%' : '100%') }"
        ></div>
        
        <button 
          v-for="(job, idx) in experiences" 
          :key="'nav-' + idx"
          class="horiz-node-btn"
          :class="{ active: idx === activeJobIndex, passed: idx <= activeJobIndex }"
          @click="scrollToJob(idx)"
          @mouseenter="triggerHoverSound"
        >
          <div class="node-dot-wrapper">
            <div class="node-dot"></div>
          </div>
          <span class="node-year">{{ getJobYearRange(job) }}</span>
          <span class="node-company-short">{{ getCompanyShort(job.company) }}</span>
        </button>
      </div>

      <div 
        class="timeline-console-wrapper"
        @touchstart="onExpTouchStart"
        @touchmove="onExpTouchMove"
        @touchend="onExpTouchEnd"
      >
        <Transition :name="transitionDirection" mode="out-in">
          <div 
            :key="activeJobIndex"
            :ref="bindTimelineCard"
            class="glass-panel timeline-card active"
            @mouseenter="emit('job-hover', activeJobIndex)"
            @mouseleave="emit('job-hover', null)"
          >
            <div class="job-card-header">
              <div class="job-main-info">
                <span class="system-record-tag">// WORK_EXPERIENCE: {{ activeJobIndex + 1 }} / 3</span>
                <h3 class="job-role text-glow">{{ currentJob.role }}</h3>
                <span class="job-company text-gradient">{{ currentJob.company }}</span>
              </div>
              <div class="job-meta-info">
                <span class="job-date"><Calendar class="meta-icon" /> {{ currentJob.period }}</span>
                <span class="job-location"><MapPin class="meta-icon" /> {{ currentJob.location }}</span>
              </div>
            </div>
            
            <div class="job-bullets-wrapper expanded">
              <ul class="job-bullets">
                <li v-for="(bullet, bIdx) in currentJob.bullets" :key="bIdx">
                  <span class="bullet-accent">></span> {{ bullet }}
                </li>
              </ul>
            </div>
          </div>
        </Transition>
      </div>
    </section>

    <!-- Projects Section -->
    <section id="projects" class="section projects-section">
      <div class="projects-header">
        <div class="section-header">
          <span class="section-num">04</span>
          <h2 class="section-title">FEATURED WORKS</h2>
        </div>
        
        <!-- Filter Tabs -->
        <div class="filter-bar">
          <button 
            v-for="filter in filters" 
            :key="filter"
            @click="activeFilter = filter"
            class="filter-tab"
            :class="{ active: activeFilter === filter }"
            @mouseenter="triggerHoverSound"
          >
            {{ filter }}
          </button>
        </div>
      </div>

      <!-- Interactive 3D Cover Flow Album Slider Container -->
      <div class="album-slider-container">
        <!-- Navigation Arrows -->
        <button 
          class="slider-arrow-btn prev-btn" 
          @click="prevSlide" 
          :disabled="activeIndex === 0"
          @mouseenter="triggerHoverSound"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2.5" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>

        <div class="album-slider-perspective">
          <div class="album-slider-track">
            <div 
              v-for="(proj, idx) in filteredProjects" 
              :key="proj.title" 
              :ref="addProjectCard"
              class="glass-panel project-card project-slide-card"
              :class="{ 
                active: idx === activeIndex,
                prev: idx === activeIndex - 1,
                next: idx === activeIndex + 1,
                'out-left': idx < activeIndex - 1,
                'out-right': idx > activeIndex + 1
              }"
              :style="getSlideStyle(idx)"
              @mouseenter="onProjectMouseEnter(proj)"
              @mouseleave="onProjectMouseLeave"
              @click="selectSlide(idx)"
            >
              <!-- Custom macOS browser mockup wrapper for screenshots -->
              <div class="browser-mockup">
                <div class="browser-bar">
                  <span class="dot red"></span>
                  <span class="dot yellow"></span>
                  <span class="dot green"></span>
                </div>

                <!-- Slideshow for screenshots -->
                <div v-if="proj.images && proj.images.length > 0" class="project-media-wrapper">
                  <img 
                    :src="proj.images[proj.activeIdx]" 
                    :alt="proj.title + ' Screenshot'" 
                    class="project-screenshot"
                    @click.stop="zoomImage(proj.images[proj.activeIdx])"
                  />
                  <span class="project-category-badge">{{ proj.category }}</span>
                  
                  <!-- Slide navigation controls -->
                  <div class="slide-nav-arrows" v-if="proj.images.length > 1">
                    <button class="slide-arrow prev" @click.stop="prevImage(proj)" title="Previous Screenshot">&lt;</button>
                    <button class="slide-arrow next" @click.stop="nextImage(proj)" title="Next Screenshot">&gt;</button>
                  </div>
                  <div class="slide-dots" v-if="proj.images.length > 1">
                    <span 
                      v-for="(img, imgIdx) in proj.images" 
                      :key="imgIdx" 
                      class="slide-dot-indicator" 
                      :class="{ active: proj.activeIdx === imgIdx }"
                      @click.stop="selectSlideImage(proj, imgIdx)"
                    ></span>
                  </div>
                </div>

                <!-- Solid Gradient Fallback -->
                <div v-else class="project-banner" :style="{ background: proj.gradient }">
                  <span class="project-category-badge">{{ proj.category }}</span>
                </div>
              </div>

              <div class="project-content">
                <span class="project-company-badge">{{ proj.company }}</span>
                <h3 class="project-title">{{ proj.title }}</h3>
                <p class="project-desc">{{ proj.description }}</p>
                
                <div class="project-tags">
                  <span v-for="tag in proj.tech" :key="tag" class="project-tag">{{ tag }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button 
          class="slider-arrow-btn next-btn" 
          @click="nextSlide" 
          :disabled="activeIndex === filteredProjects.length - 1"
          @mouseenter="triggerHoverSound"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2.5" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>

      <!-- Slider Indicators Dots -->
      <div class="slider-indicators-row">
        <span 
          v-for="(proj, idx) in filteredProjects" 
          :key="'ind-' + proj.title"
          class="slider-indicator-dot"
          :class="{ active: idx === activeIndex }"
          @click="selectSlide(idx)"
          @mouseenter="triggerHoverSound"
        ></span>
      </div>

      <!-- Fullscreen Lightbox Zoom Overlay -->
      <div v-if="zoomedImageUrl" class="lightbox-overlay" @click="zoomedImageUrl = null">
        <div class="lightbox-wrapper">
          <img :src="zoomedImageUrl" alt="Zoomed Screenshot" class="lightbox-img" />
          <button class="lightbox-close-btn" @click="zoomedImageUrl = null"><X class="lightbox-x" /></button>
        </div>
      </div>
    </section>

    <!-- Connect Section -->
    <section id="contact" class="section contact-section">
      <div class="section-header">
        <span class="section-num">05</span>
        <h2 class="section-title">Get In Touch</h2>
      </div>

      <!-- Mobile Contact Tab Switcher -->
      <div class="contact-tab-switcher">
        <button 
          class="contact-tab-btn" 
          :class="{ active: activeContactTab === 0 }"
          @click="activeContactTab = 0; playClick()"
        >
          CONTACT INFO
        </button>
        <button 
          class="contact-tab-btn" 
          :class="{ active: activeContactTab === 1 }"
          @click="activeContactTab = 1; playClick()"
        >
          VIRTUAL QR CARD
        </button>
      </div>

      <div 
        class="contact-grid"
        @touchstart="onContactTouchStart"
        @touchmove="onContactTouchMove"
        @touchend="onContactTouchEnd"
      >
        <div 
          class="glass-panel contact-details-panel"
          :class="{ 'mobile-hidden': activeContactTab !== 0 }"
        >
          <div class="panel-tag">// MY_CONTACT_DETAILS</div>
          <p class="contact-lead">
            {{ contactData.leadText }}
          </p>

          <div class="comms-cards-list">
            <!-- Email Copy Card -->
            <div :ref="addContactCard" class="glass-card info-card interactive-copy" @click="handleCopyEmail">
              <div class="info-icon-box">
                <Mail class="info-icon" />
              </div>
              <div class="info-details">
                <span class="info-label">Email</span>
                <span class="info-value">{{ email }}</span>
              </div>
              <button class="copy-btn" :class="{ copied: isCopied }" aria-label="Copy Email">
                <Check v-if="isCopied" class="icon-spacing" />
                <Copy v-else class="icon-spacing" />
                <span class="copy-tooltip" :class="{ show: isCopied }">Copied!</span>
              </button>
            </div>

            <!-- Phone Card -->
            <div :ref="addContactCard" class="glass-card info-card">
              <div class="info-icon-box">
                <Phone class="info-icon" />
              </div>
              <div class="info-details">
                <span class="info-label">Phone Number</span>
                <span class="info-value">{{ phone }}</span>
              </div>
            </div>

            <!-- Location Card -->
            <div :ref="addContactCard" class="glass-card info-card">
              <div class="info-icon-box">
                <MapPin class="info-icon" />
              </div>
              <div class="info-details">
                <span class="info-label">My Location</span>
                <span class="info-value">{{ contactData.location }}</span>
              </div>
            </div>
          </div>

          <div class="contact-links-grid">
            <a :href="contactData.links.github" target="_blank" class="comms-link" @click="triggerClickSound">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="comms-icon"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
              <span>GITHUB</span>
            </a>
            <a :href="contactData.links.linkedin" target="_blank" class="comms-link" @click="triggerClickSound">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="comms-icon"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              <span>LINKEDIN</span>
            </a>
          </div>
        </div>

        <!-- Integrated Contact QR & vCard Card -->
        <div 
          class="glass-panel contact-qr-card" 
          :class="{ 'mobile-hidden': activeContactTab !== 1 }"
          @mouseenter="triggerHoverSound"
        >
          <div class="qr-header">
            <QrCode class="qr-icon" />
            <h3 class="panel-title">VIRTUAL CODE CARD</h3>
          </div>
          
          <p class="qr-description">
            Scan the QR code to save my contact profile. Add to your device directory or communicate directly.
          </p>

          <div class="qr-display-container">
            <div class="qr-glow-layer"></div>
            <div class="qr-image-wrapper">
              <img :src="qrCodeUrl" alt="Virtual Card QR Code" class="qr-image" />
            </div>
          </div>

          <div class="qr-actions-row">
            <button 
              class="action-btn-primary full-width" 
              @click="handleSaveContact"
              @mouseenter="triggerHoverSound"
            >
              <Download class="icon-spacing" /> Add to Contacts
            </button>
            <a 
              :href="'https://wa.me/' + phone.replace(/[^0-9]/g, '')" 
              target="_blank"
              class="action-btn-secondary text-center full-width"
              @click="triggerClickSound"
              @mouseenter="triggerHoverSound"
            >
              <MessageSquare class="icon-spacing" /> WhatsApp Chat
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import CertSlider3D from './CertSlider3D.vue'
import { useLiquidGlass } from '../utils/useLiquidGlass'
import { 
  Volume2, 
  VolumeX, 
  Terminal, 
  Cpu, 
  Layers, 
  Send, 
  ExternalLink, 
  Code2, 
  Sparkles,
  Mail,
  Calendar,
  MapPin,
  Briefcase,
  Copy,
  Check,
  Phone,
  QrCode,
  Download,
  MessageSquare,
  X,
  ChevronLeft,
  ChevronRight
} from '@lucide/vue'

// Import assets & data
import avatarImg from '../assets/avatar.png'
import {
  heroData,
  sectionsData,
  certificatesData,
  skillCategoriesData,
  skillsData,
  experienceData,
  projectFiltersData,
  projectsData,
  contactData
} from '../data'

import { 
  playClick, 
  playHover, 
  playNodeSelect, 
  startAmbientHum, 
  stopAmbientHum 
} from '../utils/audio'

// ─── Liquid Glass Tilt Composables (per card group) ───────────────
const { bindCard: bindHeroCard } = useLiquidGlass({ maxTilt: 4, intensity: 0.22 })
const { addCard: addSkillCard } = useLiquidGlass({ maxTilt: 6, intensity: 0.30 })
const { bindCard: bindTimelineCard } = useLiquidGlass({ maxTilt: 4, intensity: 0.22 })
const { addCard: addProjectCard } = useLiquidGlass({ maxTilt: 5, intensity: 0.28 })
const { addCard: addContactCard } = useLiquidGlass({ maxTilt: 5, intensity: 0.25 })

const props = defineProps({
  scrollProgress: {
    type: Number,
    default: 0
  },
  activeSection: {
    type: Number,
    default: 0
  },
  highlightedSkill: {
    type: String,
    default: null
  },
  activeJobIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:highlightedSkill', 'audio-state-change', 'project-hover', 'job-hover', 'cert-hover'])

// Structured Section Data loaded from src/data/
const sections = sectionsData
const certificates = certificatesData
const skillCategories = skillCategoriesData
const allSkills = skillsData
const experiences = experienceData
const filters = projectFiltersData
const projects = ref(projectsData)

const activeSkillCategory = ref('all')
const hoveredSkillName = ref(null)
const activeFilter = ref('All')

// Skills slider track ref & scroll actions
const skillsTrackRef = ref(null)
const isSkillsAtStart = ref(true)
const isSkillsAtEnd = ref(false)

const checkSkillsScroll = () => {
  if (!skillsTrackRef.value) return
  const el = skillsTrackRef.value
  isSkillsAtStart.value = el.scrollLeft <= 10
  isSkillsAtEnd.value = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10
}

const scrollSkills = (direction) => {
  if (!skillsTrackRef.value) return
  triggerClickSound()
  const el = skillsTrackRef.value
  const scrollAmount = el.clientWidth * 0.75 * direction
  el.scrollBy({ left: scrollAmount, behavior: 'smooth' })
}

watch(activeSkillCategory, () => {
  if (skillsTrackRef.value) {
    skillsTrackRef.value.scrollLeft = 0
  }
  setTimeout(checkSkillsScroll, 100)
})

const onSkillHover = (skill) => {
  hoveredSkillName.value = skill.name
  highlightNode(skill.nodeId)
}

const onSkillLeave = () => {
  hoveredSkillName.value = null
  clearHighlight()
}

const onSkillSelect = (skill) => {
  hoveredSkillName.value = skill.name
  nodeSelect(skill.nodeId)
}

const filteredSkills = computed(() => {
  if (activeSkillCategory.value === 'all') return allSkills
  return allSkills.filter(s => s.category === activeSkillCategory.value)
})

const filteredProjects = computed(() => {
  if (activeFilter.value === 'All') return projects.value
  return projects.value.filter(p => p.category === activeFilter.value)
})

// Interactive 3D Cover Flow Album Slider Logic
const activeIndex = ref(0)

const updateCanvasTexture = () => {
  const list = filteredProjects.value
  if (list && list.length > 0) {
    const currentProj = list[activeIndex.value]
    if (currentProj) {
      let imgUrl = null
      if (currentProj.images && currentProj.images.length > 0) {
        imgUrl = currentProj.images[currentProj.activeIdx]
      }
      emit('project-hover', {
        image: imgUrl,
        category: currentProj.category
      })
    }
  } else {
    emit('project-hover', {
      image: null,
      category: null
    })
  }
}

// Watch activeIndex and activeFilter to update background 3D canvas
watch(activeIndex, () => {
  updateCanvasTexture()
})

watch(activeFilter, () => {
  activeIndex.value = 0
  updateCanvasTexture()
})

const prevSlide = () => {
  if (activeIndex.value > 0) {
    activeIndex.value--
    playClick()
  }
}

const nextSlide = () => {
  if (activeIndex.value < filteredProjects.value.length - 1) {
    activeIndex.value++
    playClick()
  }
}

const selectSlide = (idx) => {
  if (activeIndex.value !== idx) {
    activeIndex.value = idx
    playClick()
  }
}

// Custom 3D positions calculation for Cover Flow slider
const getSlideStyle = (idx) => {
  const offset = idx - activeIndex.value
  const absOffset = Math.abs(offset)
  const mobile = window.innerWidth <= 768
  
  if (absOffset > 2) {
    return {
      opacity: 0,
      pointerEvents: 'none',
      transform: `translateX(${offset * (mobile ? 60 : 130)}px) scale(0.4) translateZ(-350px)`
    }
  }
  
  const spacing = mobile ? 85 : 215
  const translateX = offset * spacing
  
  let scale = 1
  if (absOffset === 0) {
    scale = mobile ? 1.05 : 1.19 // Scale up selected card to spotlight size
  } else if (absOffset === 1) {
    scale = mobile ? 0.8 : 0.82
  } else {
    scale = mobile ? 0.6 : 0.65
  }
  
  const rotateY = mobile ? -offset * 18 : -offset * 32
  const translateZ = absOffset === 0 ? 0 : (absOffset === 1 ? -120 : -220)
  const zIndex = 100 - absOffset
  const opacity = absOffset === 0 ? 1 : (absOffset === 1 ? 0.55 : 0.2)
  
  return {
    transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg) translateZ(${translateZ}px)`,
    zIndex: zIndex,
    opacity: opacity,
    cursor: offset === 0 ? 'default' : 'pointer'
  }
}

// Slides controls (screenshot slideshow inside cards)
const prevImage = (proj) => {
  if (proj.images && proj.images.length > 1) {
    proj.activeIdx = (proj.activeIdx - 1 + proj.images.length) % proj.images.length
    triggerClickSound()
    updateCanvasTexture()
  }
}

const nextImage = (proj) => {
  if (proj.images && proj.images.length > 1) {
    proj.activeIdx = (proj.activeIdx + 1) % proj.images.length
    triggerClickSound()
    updateCanvasTexture()
  }
}

const selectSlideImage = (proj, imgIdx) => {
  proj.activeIdx = imgIdx
  triggerClickSound()
  updateCanvasTexture()
}

// Hover overrides: temporary show on ThreeJS background screen
const onProjectMouseEnter = (proj) => {
  triggerHoverSound()
  let imgUrl = null
  if (proj.images && proj.images.length > 0) {
    imgUrl = proj.images[proj.activeIdx]
  }
  emit('project-hover', {
    image: imgUrl,
    category: proj.category
  })
}

const onProjectMouseLeave = () => {
  // Revert back to active slide texture
  updateCanvasTexture()
}

// Experience timeline helper functions & scroll actions
const getJobYearRange = (job) => {
  if (job.company.includes('XOX')) return '2024 - 2026'
  if (job.company.includes('Edgenta')) return '2019 - 2024'
  return '2015 - 2019'
}

const getCompanyShort = (company) => {
  if (company.includes('XOX')) return 'XOX TECHNOLOGY BERHAD'
  if (company.includes('Edgenta')) return 'UEM EDGENTA BERHAD'
  return 'FELDA PRODATA SYSTEMS SDN BHD'
}

const currentJob = computed(() => experiences[props.activeJobIndex] || experiences[0])
const transitionDirection = ref('slide-next')

watch(() => props.activeJobIndex, (newVal, oldVal) => {
  if (newVal > oldVal) {
    transitionDirection.value = 'slide-next'
  } else {
    transitionDirection.value = 'slide-prev'
  }
})

let expTouchStartX = 0
let expTouchStartY = 0
let expIsSwiping = false

const onExpTouchStart = (e) => {
  if (e.touches && e.touches.length > 0) {
    expIsSwiping = true
    expTouchStartX = e.touches[0].clientX
    expTouchStartY = e.touches[0].clientY
  }
}

const onExpTouchMove = (e) => {
  if (!expIsSwiping || !e.touches || e.touches.length === 0) return
  const currentX = e.touches[0].clientX
  const currentY = e.touches[0].clientY
  const deltaX = currentX - expTouchStartX
  const deltaY = currentY - expTouchStartY

  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 35) {
    expIsSwiping = false
    if (deltaX < 0 && props.activeJobIndex < experiences.length - 1) {
      scrollToJob(props.activeJobIndex + 1)
    } else if (deltaX > 0 && props.activeJobIndex > 0) {
      scrollToJob(props.activeJobIndex - 1)
    }
  }
}

const onExpTouchEnd = () => {
  expIsSwiping = false
}

// Mobile Contact Section Touch & Tab Slider State
const activeContactTab = ref(0)
let contactTouchStartX = 0
let contactTouchStartY = 0
let contactIsSwiping = false

const onContactTouchStart = (e) => {
  if (e.touches && e.touches.length > 0) {
    contactIsSwiping = true
    contactTouchStartX = e.touches[0].clientX
    contactTouchStartY = e.touches[0].clientY
  }
}

const onContactTouchMove = (e) => {
  if (!contactIsSwiping || !e.touches || e.touches.length === 0) return
  const currentX = e.touches[0].clientX
  const currentY = e.touches[0].clientY
  const deltaX = currentX - contactTouchStartX
  const deltaY = currentY - contactTouchStartY

  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 35) {
    contactIsSwiping = false
    if (deltaX < 0 && activeContactTab.value === 0) {
      activeContactTab.value = 1
      playClick()
    } else if (deltaX > 0 && activeContactTab.value === 1) {
      activeContactTab.value = 0
      playClick()
    }
  }
}

const onContactTouchEnd = () => {
  contactIsSwiping = false
}

const scrollToJob = (idx) => {
  playClick()
  emit('job-hover', idx)
  
  const docHeight = document.documentElement.scrollHeight
  const winHeight = window.innerHeight
  const scrollable = docHeight - winHeight
  if (scrollable <= 0) return
  
  // Experience section is active between scroll progress 0.48 and 0.68.
  const targets = [0.51, 0.58, 0.65]
  const targetScrollY = targets[idx] * scrollable
  
  window.scrollTo({
    top: targetScrollY,
    behavior: 'smooth'
  })
}

// Contact credentials from data
const email = contactData.email
const phone = contactData.phone

const isCopied = ref(false)
const isAudioEnabled = ref(false)
const zoomedImageUrl = ref(null)

const activeCertIndex = ref(0)
const selectCert = (idx) => {
  activeCertIndex.value = idx
  emit('cert-hover', idx)
  triggerClickSound()
}

// Handler from CertSlider3D emit — wires into existing 3D canvas carousel rotation
const onCertChange = (idx) => {
  selectCert(idx)
}

const fullTypingText = heroData.bioTypingText
const typingText = ref('')
const terminalCodeRef = ref(null)

// Real-time dynamic metrics (Session Uptime, Frame Execution Load, Network Status)
const sessionStartTime = Date.now()
const realUptime = ref('00:00')
const realSysLoad = ref('0.00ms')
const isOnlineStatus = ref(navigator.onLine)

let diagInterval = null

const updateRealMetrics = () => {
  // 1. Live Session Uptime (MM:SS or HH:MM:SS)
  const elapsedSec = Math.floor((Date.now() - sessionStartTime) / 1000)
  const hrs = Math.floor(elapsedSec / 3600)
  const mins = String(Math.floor((elapsedSec % 3600) / 60)).padStart(2, '0')
  const secs = String(elapsedSec % 60).padStart(2, '0')
  
  if (hrs > 0) {
    realUptime.value = `${String(hrs).padStart(2, '0')}:${mins}:${secs}`
  } else {
    realUptime.value = `${mins}:${secs}`
  }

  // 2. Live JS Frame Execution Latency (SYS_LOAD)
  const t0 = performance.now()
  requestAnimationFrame(() => {
    const t1 = performance.now()
    const loadMs = (t1 - t0).toFixed(2)
    realSysLoad.value = `${loadMs}ms`
  })
}

const handleOnline = () => { isOnlineStatus.value = true }
const handleOffline = () => { isOnlineStatus.value = false }

const liveDiagnostics = computed(() => [
  { label: 'CORE_STATUS: ', value: isOnlineStatus.value ? 'ONLINE' : 'OFFLINE', isOnline: isOnlineStatus.value },
  { label: 'UPTIME: ', value: realUptime.value, isOnline: true },
  { label: 'SYS_LOAD: ', value: realSysLoad.value, isOnline: true }
])

const runTypingEffect = () => {
  let index = 0
  const interval = setInterval(() => {
    if (index < fullTypingText.length) {
      typingText.value += fullTypingText[index]
      index++
      if (terminalCodeRef.value) {
        terminalCodeRef.value.scrollTop = terminalCodeRef.value.scrollHeight
      }
    } else {
      clearInterval(interval)
    }
  }, 16)
}

const zoomImage = (imgUrl) => {
  zoomedImageUrl.value = imgUrl
  triggerClickSound()
}

// Nav Scroll Actions
const scrollToSection = (idx) => {
  playClick()
  const sec = sections[idx]
  const el = document.getElementById(sec.id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

const onNavClick = (idx, event) => {
  event.preventDefault()
  scrollToSection(idx)
}

const triggerHoverSound = () => {
  if (isAudioEnabled.value) {
    playHover()
  }
}

const triggerClickSound = () => {
  if (isAudioEnabled.value) {
    playClick()
  }
}

const toggleAudio = () => {
  isAudioEnabled.value = !isAudioEnabled.value
  emit('audio-state-change', isAudioEnabled.value)
  
  if (isAudioEnabled.value) {
    startAmbientHum()
    playClick()
  } else {
    stopAmbientHum()
  }
}

const highlightNode = (skillId) => {
  emit('update:highlightedSkill', skillId)
  if (isAudioEnabled.value) {
    playHover()
  }
}

const clearHighlight = () => {
  emit('update:highlightedSkill', null)
}

const nodeSelect = (skillId) => {
  if (isAudioEnabled.value) {
    playNodeSelect()
  }
}

const handleCopyEmail = async () => {
  try {
    triggerClickSound()
    await navigator.clipboard.writeText(email)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy text: ', err)
  }
}

// Virtual card links redirection QR code
const targetUrl = computed(() => {
  if (typeof window === 'undefined') return ''
  return window.location.origin + window.location.pathname + '#/contact-card'
})

const qrCodeUrl = computed(() => {
  if (!targetUrl.value) return ''
  // Indigo foreground color (#6366f1) and dark blue-card background (#0d111c)
  return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=6366f1&bgcolor=0d111c&data=${encodeURIComponent(targetUrl.value)}`
})

// Add to Contacts vCard Downloader
const handleSaveContact = () => {
  triggerClickSound()
  const vcard = `BEGIN:VCARD
VERSION:3.0
N:Yusof;Azhar;;;
FN:${contactData.vcard.fn}
ORG:${contactData.vcard.org}
TITLE:${contactData.vcard.title}
TEL;TYPE=CELL,VOICE:${phone.replace(/[^0-9+]/g, '')}
EMAIL;TYPE=PREF,INTERNET:${email}
ADR;TYPE=HOME:${contactData.vcard.address}
URL:${contactData.links.github}
END:VCARD`
  
  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'Azhar_Yusof_Contact.vcf'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  if (isAudioEnabled.value) {
    playNodeSelect()
  }
}

onMounted(() => {
  runTypingEffect()
  updateRealMetrics()
  diagInterval = setInterval(updateRealMetrics, 1000)
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
})

onBeforeUnmount(() => {
  if (diagInterval) clearInterval(diagInterval)
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})
</script>

<style scoped>
.overlay-container {
  width: 100%;
  position: relative;
  z-index: 10;
}

/* Header styling */
.hud-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: var(--header-height);
  padding: 0 5%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--glass-border);
  z-index: 100;
  background: rgba(8, 9, 15, 0.35);
}

.hud-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--accent-cyan);
  text-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
}

.logo-icon {
  width: 22px;
  height: 22px;
}

.hud-nav {
  display: flex;
  gap: 25px;
}

.hud-nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: var(--text-muted);
  font-family: var(--font-display);
  font-size: 0.82rem;
  transition: all 0.3s ease;
}

.nav-num {
  font-size: 0.65rem;
  color: var(--accent-indigo);
}

.hud-nav-link.active,
.hud-nav-link:hover {
  color: var(--accent-cyan);
  text-shadow: 0 0 8px rgba(6, 182, 212, 0.4);
}

/* Audio control toggle button */
.audio-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--glass-border);
  padding: 8px 16px;
  border-radius: 30px;
  color: var(--text-muted);
  cursor: pointer;
  font-family: var(--font-display);
  font-size: 0.75rem;
  transition: all 0.3s ease;
}

.audio-toggle-btn.active {
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.2);
}

.audio-toggle-btn:hover {
  background: rgba(6, 182, 212, 0.05);
  border-color: var(--accent-cyan);
}

.btn-icon {
  width: 16px;
  height: 16px;
}

/* Side navigation HUD circles */
.hud-side-nav {
  position: fixed;
  right: 4%;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 18px;
  z-index: 100;
}

.side-dot-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  cursor: pointer;
  position: relative;
}

.side-dot-label {
  font-family: var(--font-display);
  font-size: 0.7rem;
  color: var(--text-dark);
  opacity: 0;
  transition: all 0.3s ease;
  transform: translateX(10px);
  pointer-events: none;
}

.side-dot-container:hover .side-dot-label {
  opacity: 1;
  transform: translateX(0px);
  color: var(--accent-cyan);
}

.side-dot {
  width: 10px;
  height: 10px;
  border: 1px solid var(--text-dark);
  border-radius: 50%;
  background: transparent;
  transition: all 0.3s ease;
}

.side-dot.active {
  background: var(--accent-cyan);
  border-color: var(--accent-cyan);
  box-shadow: 0 0 10px var(--accent-cyan);
}

.side-dot-container:hover .side-dot {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 8px rgba(6, 182, 212, 0.5);
}

/* Bottom status bar */
.hud-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40px;
  padding: 0 5%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--glass-border);
  background: rgba(8, 9, 15, 0.8);
  font-family: var(--font-display);
  font-size: 0.7rem;
  color: var(--text-dark);
  z-index: 100;
}

.status-element {
  display: flex;
  gap: 6px;
}

.status-val {
  color: var(--text-muted);
}

.status-val.text-glow {
  color: var(--accent-cyan);
}

/* --- Hero Panel Section --- */
.hero-section {
  justify-content: center;
  align-items: center;
  text-align: center;
}

/* Card outer wrapper to isolate floating animation from 3D tilt transform */
.hero-card-wrapper {
  width: 100%;
  max-width: 1100px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-panel {
  max-width: 1100px;
  width: 100%;
  min-height: 480px;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 50px;
  padding: 50px 60px;
  text-align: left;
  position: relative;
  overflow: hidden;
  background: rgba(13, 17, 28, 0.65);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 
    inset 0 1.5px 0 0 rgba(255, 255, 255, 0.2),
    inset 0 -1px 0 0 rgba(255, 255, 255, 0.05),
    0 20px 40px rgba(0, 0, 0, 0.5),
    0 0 25px rgba(6, 182, 212, 0.08);
  will-change: transform;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, box-shadow 0.3s ease;
}

.hero-panel:hover {
  background: rgba(13, 17, 28, 0.72);
  border-color: rgba(6, 182, 212, 0.25);
  box-shadow: 
    inset 0 1.5px 0 0 rgba(255, 255, 255, 0.25),
    inset 0 -1px 0 0 rgba(255, 255, 255, 0.06),
    0 25px 50px rgba(0, 0, 0, 0.6),
    0 0 30px rgba(6, 182, 212, 0.15);
}

/* Spotlight Glow - follows cursor, clipped inside card via overflow:hidden */
.spotlight-glow {
  position: absolute;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(6, 182, 212, 0.12) 0%,
    rgba(99, 102, 241, 0.06) 40%,
    transparent 70%
  );
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 0;
  transition: opacity 0.35s ease;
  filter: blur(2px);
}

/* Animated background color drift behind glass */
.liquid-bg-layer {
  position: absolute;
  inset: -20px;
  background:
    radial-gradient(ellipse at 20% 80%, rgba(99, 102, 241, 0.08) 0%, transparent 55%),
    radial-gradient(ellipse at 80% 20%, rgba(6, 182, 212, 0.06) 0%, transparent 55%);
  pointer-events: none;
  z-index: 0;
  animation: liquidDrift 12s ease-in-out infinite alternate;
}

@keyframes liquidDrift {
  0% {
    background:
      radial-gradient(ellipse at 20% 80%, rgba(99, 102, 241, 0.09) 0%, transparent 55%),
      radial-gradient(ellipse at 80% 20%, rgba(6, 182, 212, 0.06) 0%, transparent 55%);
  }
  50% {
    background:
      radial-gradient(ellipse at 60% 30%, rgba(6, 182, 212, 0.08) 0%, transparent 55%),
      radial-gradient(ellipse at 30% 70%, rgba(99, 102, 241, 0.08) 0%, transparent 55%);
  }
  100% {
    background:
      radial-gradient(ellipse at 80% 60%, rgba(99, 102, 241, 0.07) 0%, transparent 55%),
      radial-gradient(ellipse at 20% 40%, rgba(6, 182, 212, 0.09) 0%, transparent 55%);
  }
}

.hero-card-wrapper:hover {
  animation-play-state: paused;
}

/* Hero profile and content panes sit above z:0 background layers */
.hero-profile-pane {
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  width: 240px;
}

.hero-content-pane {
  position: relative;
  z-index: 2;
  flex: 1;
  min-width: 0;
}

/* Ensure hero inner elements don't shift on 3D tilt — lock all children */
.hero-panel > * {
  position: relative;
  z-index: 1;
}
.hero-diagnostics {
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 10px 14px;
  font-family: var(--font-display);
  font-size: 0.65rem;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
}

.diag-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.diag-label {
  color: var(--text-dark);
}

.diag-value {
  color: var(--text-muted);
}

.diag-value.status-online {
  color: var(--accent-cyan);
  font-weight: 700;
  text-shadow: 0 0 5px rgba(6, 182, 212, 0.5);
  animation: pulse-online-status 2s infinite ease-in-out;
}

@keyframes pulse-online-status {
  0%, 100% { opacity: 0.75; }
  50% { opacity: 1; }
}

/* Profile Picture Layout */
.avatar-wrapper {
  position: relative;
  width: 130px;
  height: 130px;
  margin-bottom: 20px;
  transition: transform 0.4s ease;
}

.avatar-glow {
  position: absolute;
  inset: -4px;
  background: linear-gradient(135deg, var(--accent-indigo), var(--accent-cyan));
  border-radius: 50%;
  filter: blur(8px);
  opacity: 0.6;
  animation: pulse-avatar-glow 4s ease-in-out infinite;
}

@keyframes pulse-avatar-glow {
  0%, 100% { opacity: 0.45; transform: scale(0.98); }
  50% { opacity: 0.75; transform: scale(1.03); }
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.08);
  position: relative;
  z-index: 1;
  transition: all 0.4s ease;
}

.avatar-wrapper:hover .avatar-img {
  border-color: var(--accent-cyan);
}

.badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.hero-badges {
  margin-bottom: 25px;
  width: 100%;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
}

.hero-badges .badge {
  justify-content: flex-start;
  font-size: 0.72rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.panel-tag {
  font-family: var(--font-display);
  font-size: 0.75rem;
  color: var(--accent-indigo);
  margin-bottom: 12px;
  letter-spacing: 0.15em;
  text-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
}

.hero-name {
  font-size: clamp(1.8rem, 2.5vw, 2.5rem);
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 10px;
  white-space: nowrap;
  letter-spacing: -0.01em;
}

.hero-title {
  font-size: 1.05rem;
  color: var(--accent-cyan);
  font-weight: 500;
  letter-spacing: 0.05em;
  margin-bottom: 20px;
}

/* --- Terminal Text Box — fixed height so typing text never shifts layout --- */
.terminal-text-box {
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(6, 182, 212, 0.16);
  border-radius: 10px;
  text-align: left;
  font-family: var(--font-display);
  margin-bottom: 25px;
  display: flex;
  flex-direction: column;
  height: 140px;
  min-height: 140px;
  max-height: 140px;
  width: 100%;
  overflow: hidden;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(6, 182, 212, 0.08);
  position: relative;
}

.terminal-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.terminal-dots {
  display: flex;
  gap: 5px;
}

.terminal-dots .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.terminal-dots .dot.red { background: #ff5f56; }
.terminal-dots .dot.yellow { background: #ffbd2e; }
.terminal-dots .dot.green { background: #27c93f; }

.terminal-title {
  font-size: 0.62rem;
  color: var(--text-dark);
  font-family: monospace;
}

.terminal-body {
  display: flex;
  gap: 10px;
  padding: 10px 12px;
  flex: 1;
  overflow: hidden;
}

/* Blinking cursor line at the top of the terminal */
.terminal-text-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, var(--accent-cyan) 40%, var(--accent-indigo) 70%, transparent 100%);
  opacity: 0.5;
  border-radius: 4px 4px 0 0;
}

.box-icon {
  width: 18px;
  height: 18px;
  color: var(--accent-cyan);
  margin-top: 3px;
  flex-shrink: 0;
}

.terminal-code {
  color: var(--text-main);
  font-size: 0.85rem;
  line-height: 1.5;
  flex: 1;
  overflow-y: auto;
  max-height: 100%;
  padding-right: 6px;
  -webkit-overflow-scrolling: touch;
}

.terminal-code::-webkit-scrollbar {
  width: 4px;
}

.terminal-code::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.terminal-code::-webkit-scrollbar-thumb {
  background: rgba(6, 182, 212, 0.35);
  border-radius: 2px;
}

.terminal-code::-webkit-scrollbar-thumb:hover {
  background: var(--accent-cyan);
}

.code-accent {
  color: var(--accent-indigo);
}

.cursor-blink {
  animation: blink 0.8s infinite;
  color: var(--accent-cyan);
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.hero-action-row {
  display: flex;
  justify-content: flex-start;
  gap: 20px;
  width: 100%;
}

.action-btn-primary {
  background: linear-gradient(135deg, var(--accent-indigo) 0%, var(--accent-cyan) 100%);
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  color: #ffffff;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 25px rgba(99, 102, 241, 0.45);
}

.action-btn-secondary {
  border: 1px solid var(--accent-indigo);
  background: rgba(255, 255, 255, 0.02);
  padding: 12px 24px;
  border-radius: 8px;
  color: var(--text-main);
  text-decoration: none;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-btn-secondary:hover {
  background: rgba(99, 102, 241, 0.08);
  border-color: var(--accent-cyan);
  transform: translateY(-2px);
}

.full-width {
  width: 100% !important;
}

.text-center {
  text-align: center;
}

/* Scroll prompt */
.scroll-prompt {
  position: absolute;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.scroll-prompt:hover {
  opacity: 1;
}

.prompt-text {
  font-family: var(--font-display);
  font-size: 0.65rem;
  color: var(--text-dark);
  letter-spacing: 0.1em;
}

.prompt-arrow {
  width: 8px;
  height: 8px;
  border-bottom: 2px solid var(--accent-cyan);
  border-right: 2px solid var(--accent-cyan);
  transform: rotate(45deg);
  animation: promptBlink 1.5s infinite;
}

@keyframes promptBlink {
  0% { transform: translateY(0px) rotate(45deg); opacity: 0.2; }
  50% { transform: translateY(6px) rotate(45deg); opacity: 1; }
  100% { transform: translateY(0px) rotate(45deg); opacity: 0.2; }
}

/* Section Common Header */
.section-header {
  display: flex;
  align-items: baseline;
  gap: 15px;
  margin-bottom: 35px;
  width: 100%;
}

.section-num {
  font-family: var(--font-display);
  font-size: 1.15rem;
  color: var(--accent-indigo);
  font-weight: 700;
}

.section-title {
  font-size: 1.8rem;
  color: var(--text-main);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* --- Certificates Section Layout --- */
.about-section {
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* Indicators and Arrows */
.slider-indicators-row {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 25px;
  width: 100%;
}

.slider-indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;
}

.slider-indicator-dot.active {
  background: var(--accent-cyan);
  transform: scale(1.3);
  box-shadow: 0 0 8px var(--accent-cyan);
}

/* --- Skills Layout --- */
.skills-section {
  flex-direction: column;
  justify-content: center;
}

.skills-panel {
  width: 100%;
}

.skills-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
}

.skills-filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.skills-tab-btn {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text-muted);
  font-family: var(--font-display);
  font-size: 0.72rem;
  padding: 6px 14px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
}

.skills-tab-btn:hover,
.skills-tab-btn.active {
  background: rgba(6, 182, 212, 0.12);
  border-color: var(--accent-cyan);
  color: #ffffff;
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.25);
}

.skills-info-text {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-bottom: 24px;
}

/* Interactive Skills Slider Track */
.skills-slider-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.skills-slider-track {
  width: 100%;
  overflow-x: auto;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  padding: 8px 4px 16px 4px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.skills-slider-track::-webkit-scrollbar {
  display: none;
}

.skills-brand-grid {
  display: grid;
  grid-template-rows: repeat(4, auto);
  grid-auto-flow: column;
  grid-auto-columns: calc((100% - 28px) / 3);
  gap: 14px;
  width: max-content;
  min-width: 100%;
}

@media (max-width: 900px) {
  .skills-brand-grid {
    grid-auto-columns: calc((100% - 14px) / 2);
  }
}

@media (max-width: 580px) {
  .skills-brand-grid {
    grid-auto-columns: 100%;
  }
}

.skill-brand-card {
  width: 100%;
  box-sizing: border-box;
  scroll-snap-align: start;
}

.skills-arrow-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(13, 17, 28, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--accent-cyan);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
}

.skills-arrow-btn:hover:not(:disabled) {
  background: var(--accent-cyan);
  color: var(--bg-primary);
  box-shadow: 0 0 18px rgba(6, 182, 212, 0.45);
  transform: scale(1.12);
}

.skills-arrow-btn:disabled {
  opacity: 0.2;
  cursor: not-allowed;
}

.skill-brand-card {
  background: rgba(15, 23, 42, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
}

.skill-brand-card:hover,
.skill-brand-card.active {
  background: rgba(15, 23, 42, 0.82);
  border-color: var(--brand-color, var(--accent-cyan));
  box-shadow:
    0 8px 28px -6px rgba(0, 0, 0, 0.55),
    0 0 20px var(--brand-color, var(--accent-cyan)),
    inset 0 1px 0 rgba(255, 255, 255, 0.10);
}

.skill-brand-icon-wrapper {
  position: relative;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.brand-glow {
  position: absolute;
  inset: -2px;
  border-radius: 10px;
  opacity: 0.15;
  filter: blur(8px);
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.skill-brand-card:hover .brand-glow,
.skill-brand-card.active .brand-glow {
  opacity: 0.45;
}

.brand-svg-box {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.skill-brand-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
  overflow: hidden;
}

.skill-brand-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.skill-brand-name {
  font-family: var(--font-display);
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.skill-level-num {
  font-family: var(--font-display);
  font-size: 0.74rem;
  font-weight: 700;
  flex-shrink: 0;
}

.skill-progress-track {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  overflow: hidden;
}

.skill-progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.6s ease;
}

.skill-tag-pill {
  align-self: flex-start;
  font-family: var(--font-display);
  font-size: 0.58rem;
  letter-spacing: 0.5px;
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid;
  background: rgba(0, 0, 0, 0.2);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* --- Experience full-width layout --- */
.experience-section {
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

/* Horizontal HUD nav timeline — full width */
.horizontal-nav-timeline {
  display: flex;
  justify-content: space-between;
  position: relative;
  width: 100%;
  max-width: none;
  margin: 0 0 40px 0;
  padding: 0 60px;
  box-sizing: border-box;
}

.horiz-track-bg {
  position: absolute;
  top: 15px;
  left: 60px;
  right: 60px;
  height: 2px;
  background: rgba(255, 255, 255, 0.05);
  z-index: 0;
}

.horiz-track-active {
  position: absolute;
  top: 15px;
  left: 60px;
  right: 60px;
  height: 2px;
  background: linear-gradient(to right, var(--accent-indigo), var(--accent-cyan));
  box-shadow: 0 0 8px var(--accent-cyan);
  z-index: 1;
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.horiz-node-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: transparent;
  border: none;
  cursor: pointer;
  z-index: 2;
  position: relative;
  width: 140px;
  padding: 0;
  transition: all 0.3s ease;
}

.node-dot-wrapper {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--bg-primary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.node-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.node-year {
  font-family: var(--font-display);
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-top: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  letter-spacing: 0.03em;
}

.node-company-short {
  font-size: 0.7rem;
  color: var(--accent-indigo);
  margin-top: 3px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 700;
  transition: all 0.3s ease;
}

/* Passed nodes */
.horiz-node-btn.passed .node-dot-wrapper {
  border-color: var(--accent-indigo);
  background: rgba(99, 102, 241, 0.06);
}
.horiz-node-btn.passed .node-dot {
  background: var(--accent-indigo);
  box-shadow: 0 0 6px var(--accent-indigo);
}

/* Active node spotlight */
.horiz-node-btn.active .node-dot-wrapper {
  border-color: var(--accent-cyan);
  background: rgba(6, 182, 212, 0.08);
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.35), inset 0 0 10px rgba(6, 182, 212, 0.08);
  transform: scale(1.2);
}

.horiz-node-btn.active .node-dot {
  background: var(--accent-cyan);
  box-shadow: 0 0 12px var(--accent-cyan);
  width: 12px;
  height: 12px;
}

.horiz-node-btn.active .node-year {
  color: var(--text-main);
  font-weight: 700;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
}

.horiz-node-btn.active .node-company-short {
  color: var(--accent-cyan);
  text-shadow: 0 0 10px rgba(6, 182, 212, 0.6);
}

/* Hover effects */
.horiz-node-btn:hover .node-dot-wrapper {
  border-color: var(--accent-cyan);
  transform: scale(1.12);
  box-shadow: 0 0 12px rgba(6, 182, 212, 0.25);
}
.horiz-node-btn:hover .node-dot {
  background: var(--accent-cyan);
}
.horiz-node-btn:hover .node-year {
  color: var(--text-main);
}

@media (max-width: 600px) {
  .horizontal-nav-timeline {
    padding: 0 10px;
  }
  .horiz-track-bg, .horiz-track-active {
    left: 40px;
    right: 40px;
  }
  .horiz-node-btn {
    width: 80px;
  }
  .node-company-short {
    font-size: 0.6rem;
  }
}

/* Timeline card wrapper — full width */
.timeline-console-wrapper {
  width: 100%;
  max-width: none;
  min-height: 260px;
  position: relative;
  perspective: 1000px;
}

.timeline-card {
  width: 100%;
  position: relative;
  overflow: hidden;
  background: rgba(13, 17, 28, 0.55);
  border-color: rgba(6, 182, 212, 0.2);
  box-shadow: 0 12px 30px rgba(6, 182, 212, 0.05), var(--glass-glow);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
}

.timeline-card:hover {
  border-color: rgba(6, 182, 212, 0.5);
  box-shadow: 0 15px 35px rgba(6, 182, 212, 0.15), var(--glass-glow), inset 0 1px 0 rgba(255,255,255,0.12);
}

.system-record-tag {
  font-family: var(--font-display);
  font-size: 0.65rem;
  color: var(--accent-cyan);
  letter-spacing: 0.1em;
  margin-bottom: 4px;
  display: block;
  opacity: 0.85;
}

.bullet-accent {
  color: var(--accent-cyan);
  margin-right: 4px;
  font-weight: bold;
}

.job-role {
  font-size: 1.15rem;
  color: var(--text-main);
  transition: all 0.3s ease;
}

.job-role.text-glow {
  text-shadow: 0 0 12px rgba(6, 182, 212, 0.35);
}

.job-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  padding-bottom: 12px;
}

.job-main-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.job-company {
  font-size: 0.95rem;
  font-weight: 700;
  font-family: var(--font-display);
}

.job-meta-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  font-size: 0.78rem;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .job-meta-info {
    align-items: flex-start;
  }
}

.meta-icon {
  width: 12px;
  height: 12px;
  color: var(--accent-indigo);
  display: inline-block;
  vertical-align: middle;
  margin-right: 4px;
}

.job-bullets-wrapper {
  margin-top: 15px;
}

.job-bullets-wrapper::-webkit-scrollbar {
  width: 4px;
}

.job-bullets-wrapper::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.job-bullets-wrapper::-webkit-scrollbar-thumb {
  background: rgba(6, 182, 212, 0.35);
  border-radius: 2px;
}

.job-bullets-wrapper::-webkit-scrollbar-thumb:hover {
  background: var(--accent-cyan);
}

.job-bullets {
  list-style-type: none;
  padding-left: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.job-bullets li {
  position: relative;
  padding-left: 15px;
  font-size: 0.88rem;
  color: var(--text-muted);
  line-height: 1.5;
}

/* Directional Slide-fade Transitions */
.slide-next-enter-active, .slide-next-leave-active,
.slide-prev-enter-active, .slide-prev-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Next Slide: Card exits left (-30px), enters right (30px) */
.slide-next-enter-from {
  transform: translateX(30px);
  opacity: 0;
}
.slide-next-leave-to {
  transform: translateX(-30px);
  opacity: 0;
}

/* Prev Slide: Card exits right (30px), enters left (-30px) */
.slide-prev-enter-from {
  transform: translateX(-30px);
  opacity: 0;
}
.slide-prev-leave-to {
  transform: translateX(30px);
  opacity: 0;
}

/* --- Projects layout --- */
.projects-section {
  flex-direction: column;
  justify-content: center;
}

.projects-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.projects-header .section-header {
  margin-bottom: 0;
  width: auto;
}

/* Interactive 3D Cover Flow Slider Styles */
.album-slider-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  position: relative;
  margin: 8px 0;
  gap: 15px;
}

.album-slider-perspective {
  flex-grow: 1;
  perspective: 1200px;
  perspective-origin: 50% 50%;
  overflow: visible;
  height: 470px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.album-slider-track {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-style: preserve-3d;
}

.project-slide-card {
  position: absolute;
  width: 325px;
  height: 400px;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  border-radius: 12px;
  transform-style: preserve-3d;
  backface-visibility: hidden;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), 
              opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.4s ease, 
              border-color 0.4s ease;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
}

/* Inactive slides are slightly blurred and unclickable */
.project-slide-card:not(.active) {
  pointer-events: none;
  filter: blur(1px);
}

.project-slide-card.active {
  box-shadow: 0 20px 45px rgba(6, 182, 212, 0.15), var(--glass-glow);
  border-color: rgba(6, 182, 212, 0.3);
}

.project-slide-card.active:hover {
  border-color: var(--accent-cyan);
  box-shadow: 0 20px 50px rgba(6, 182, 212, 0.25), var(--glass-glow);
}

/* Navigation Arrow Buttons */
.slider-arrow-btn {
  background: rgba(13, 17, 28, 0.65);
  border: 1px solid var(--glass-border);
  color: var(--accent-cyan);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.slider-arrow-btn:hover:not(:disabled) {
  background: var(--accent-cyan);
  color: var(--bg-primary);
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.4);
  transform: scale(1.05);
}

.slider-arrow-btn:disabled {
  opacity: 0.25;
  cursor: not-allowed;
  color: var(--text-dark);
}

/* Slide Indicators Row */
.slider-indicators-row {
  display: flex;
  justify-content: center;
  gap: 10px;
  width: 100%;
  margin-top: 6px;
  z-index: 5;
}

.slider-indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid transparent;
}

.slider-indicator-dot:hover {
  background: rgba(6, 182, 212, 0.5);
}

.slider-indicator-dot.active {
  background: var(--accent-cyan);
  width: 24px;
  border-radius: 4px;
  box-shadow: 0 0 10px var(--accent-cyan);
}

.project-content {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

/* Browser Mockup screenshot container */
.browser-mockup {
  width: 100%;
  background: #0b0d19;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.browser-bar {
  display: flex;
  gap: 6px;
  padding: 8px 12px;
}

.browser-bar .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.browser-bar .dot.red { background: #ff5f56; }
.browser-bar .dot.yellow { background: #ffbd2e; }
.browser-bar .dot.green { background: #27c93f; }

.project-media-wrapper {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
}

.project-screenshot {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: zoom-in;
  transition: transform 0.4s ease;
}

.project-screenshot:hover {
  transform: scale(1.03);
}

.project-banner {
  width: 100%;
  height: 135px;
  position: relative;
}

.project-category-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-main);
  font-family: var(--font-display);
  font-size: 0.65rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 4px;
}

/* Custom slider arrows overlay */
.slide-nav-arrows {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.project-media-wrapper:hover .slide-nav-arrows {
  opacity: 1;
}

.slide-arrow {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  pointer-events: auto;
  font-size: 0.75rem;
  transition: all 0.2s;
}

.slide-arrow:hover {
  background: var(--accent-cyan);
  color: var(--bg-primary);
}

.slide-dots {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
}

.slide-dot-indicator {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.2s;
}

.slide-dot-indicator.active {
  background: var(--accent-cyan);
  width: 12px;
  border-radius: 3px;
}

.project-company-badge {
  font-family: var(--font-display);
  font-size: 0.65rem;
  color: var(--accent-indigo);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  margin-bottom: 5px;
}

.project-title {
  font-size: 1.02rem;
  margin-bottom: 6px;
  color: var(--text-main);
  line-height: 1.3;
}

.project-desc {
  font-size: 0.76rem;
  color: var(--text-muted);
  line-height: 1.4;
  margin-bottom: 8px;
  flex-grow: 1;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 0;
}

.project-tag {
  font-size: 0.65rem;
  font-family: var(--font-display);
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.15);
  color: var(--text-main);
  padding: 2px 6px;
  border-radius: 4px;
}

.project-btn {
  background: transparent;
  border: 1px solid var(--accent-cyan);
  border-radius: 6px;
  padding: 8px 0;
  color: var(--accent-cyan);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  width: 100%;
  text-decoration: none;
}

.project-btn:hover {
  background: var(--accent-cyan);
  color: var(--bg-primary);
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.3);
}

.btn-launch-icon {
  width: 12px;
  height: 12px;
}

/* Lightbox zoom wrapper */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(5, 6, 10, 0.9);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
}

.lightbox-wrapper {
  position: relative;
  max-width: 85%;
  max-height: 85%;
}

.lightbox-img {
  max-width: 100%;
  max-height: 85vh;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
}

.lightbox-close-btn {
  position: absolute;
  top: -45px;
  right: 0;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
}

.lightbox-close-btn:hover {
  color: white;
}

.lightbox-x {
  width: 28px;
  height: 28px;
}

/* --- Contact / Connect layout --- */
.contact-section {
  flex-direction: column;
  justify-content: center;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 30px;
  width: 100%;
}

.contact-details-panel {
  display: flex;
  flex-direction: column;
  padding: 30px;
}

.contact-lead {
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--text-muted);
  margin-top: 14px;
  margin-bottom: 26px;
}

.comms-cards-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 26px;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 16px 22px;
  position: relative;
}

.interactive-copy {
  cursor: pointer;
}

.interactive-copy:hover {
  border-color: var(--accent-indigo);
  background-color: rgba(99, 102, 241, 0.04);
}

.info-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(99, 102, 241, 0.08);
  color: var(--accent-indigo);
  flex-shrink: 0;
}

.info-icon {
  width: 20px;
  height: 20px;
}

.info-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent-cyan);
}

.info-value {
  font-size: 0.96rem;
  font-weight: 600;
  color: var(--text-main);
  word-break: break-word;
}

.copy-btn {
  margin-left: auto;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.copy-btn:hover {
  background: rgba(255, 255, 255, 0.03);
  color: var(--accent-cyan);
}

.copy-btn.copied {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.copy-tooltip {
  position: absolute;
  top: -30px;
  right: 1.5rem;
  background: #10b981;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  opacity: 0;
  transform: translateY(5px);
  transition: all 0.3s ease;
  pointer-events: none;
}

.copy-tooltip.show {
  opacity: 1;
  transform: translateY(0);
}

.contact-links-grid {
  display: flex;
  gap: 15px;
}

.comms-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--text-muted);
  font-family: var(--font-display);
  font-size: 0.8rem;
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.03);
  background: rgba(255, 255, 255, 0.01);
  transition: all 0.3s;
  flex-grow: 1;
  justify-content: center;
}

.comms-link:hover {
  background: rgba(6, 182, 212, 0.04);
  border-color: rgba(6, 182, 212, 0.12);
  color: var(--accent-cyan);
}

/* QR Code Card Styles */
.contact-qr-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 20px;
  padding: 30px;
}

.qr-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.qr-icon {
  color: var(--accent-cyan);
  width: 22px;
  height: 22px;
}

.qr-description {
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.5;
}

.qr-display-container {
  position: relative;
  width: 170px;
  height: 170px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 5px 0;
}

.qr-glow-layer {
  position: absolute;
  inset: -4px;
  background: linear-gradient(135deg, var(--accent-indigo), var(--accent-cyan));
  border-radius: 1rem;
  filter: blur(8px);
  opacity: 0.35;
}

.qr-image-wrapper {
  position: relative;
  background: #0d111c;
  border: 1px solid var(--glass-border);
  padding: 8px;
  border-radius: 12px;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.contact-qr-card:hover .qr-image-wrapper {
  transform: scale(1.03);
  border-color: var(--accent-indigo);
}

.qr-image {
  width: 130px;
  height: 130px;
  display: block;
}

.qr-actions-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.icon-spacing {
  margin-right: 6px;
  display: inline-block;
  vertical-align: middle;
}

.mt-4 {
  margin-top: 1rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

/* --- Media Queries and Responsive Styles --- */
@media (max-width: 1024px) {
  .contact-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .d-none-mobile {
    display: none !important;
  }
  .hud-side-nav {
    display: none !important;
  }
  .hud-header {
    display: none !important;
  }
  .hero-section {
    padding: 12px 14px !important;
    height: 100vh;
    height: 100dvh;
    max-height: 100vh;
    max-height: 100dvh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    overflow: hidden;
    gap: 6px;
  }
  .hero-card-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 0;
  }
  .hero-panel {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 16px 14px;
    gap: 10px;
    min-height: auto;
    max-height: calc(100vh - 65px);
    max-height: calc(100dvh - 65px);
    width: 100%;
    overflow-y: auto;
    box-sizing: border-box;
  }
  .hero-profile-pane {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    border-right: none;
    padding-right: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 8px;
  }
  .avatar-wrapper {
    width: 150px;
    height: 150px;
    margin: 0 auto 10px auto;
  }
  .avatar-img {
    width: 100%;
    height: 100%;
  }
  .hero-panel .hero-badges {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
    margin-bottom: 6px;
  }
  .hero-panel .hero-badges .badge {
    justify-content: center;
    padding: 3px 8px;
    font-size: 0.65rem;
  }
  .hero-diagnostics {
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    padding: 4px 8px;
    gap: 6px;
    font-size: 0.6rem;
  }
  .hero-content-pane {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .hero-name {
    font-size: clamp(1.15rem, 4.8vw, 1.45rem);
    text-align: center;
    white-space: normal;
    margin-bottom: 2px;
  }
  .hero-title {
    font-size: 0.85rem;
    text-align: center;
    line-height: 1.4;
    margin-bottom: 8px;
  }
  .terminal-text-box {
    height: 180px;
    min-height: 180px;
    max-height: 180px;
    margin-bottom: 10px;
  }
  .terminal-code {
    font-size: 0.78rem;
    line-height: 1.4;
  }
  .hero-action-row {
    flex-direction: row;
    gap: 8px;
    width: 100%;
  }
  .hero-action-row .action-btn-primary,
  .hero-action-row .action-btn-secondary {
    flex: 1;
    width: auto;
    text-align: center;
    min-height: 38px;
    padding: 8px 12px;
    font-size: 0.72rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .scroll-prompt {
    margin-top: 6px;
    padding: 0;
  }
  .scroll-prompt .prompt-text {
    font-size: 0.58rem;
    letter-spacing: 0.08em;
  }
  .scroll-prompt .prompt-arrow {
    margin-top: 2px;
    width: 12px;
    height: 12px;
  }
  .skills-top-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .skills-filter-tabs {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 4px;
    -webkit-overflow-scrolling: touch;
  }
  .skills-brand-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .skill-brand-card {
    min-height: 48px;
    padding: 12px 14px;
  }
  .album-slider-perspective {
    height: 440px;
  }
  .project-slide-card {
    width: 285px;
    height: 420px;
  }
  .slider-arrow-btn {
    width: 44px;
    height: 44px;
  }
}

@media (max-width: 768px) {
  .experience-section {
    padding: 16px 14px !important;
    height: 100vh;
    height: 100dvh;
    max-height: 100vh;
    max-height: 100dvh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-sizing: border-box;
    overflow: hidden;
  }
  .horizontal-nav-timeline {
    padding: 0 10px;
    margin: 0 0 18px 0;
  }
  .horiz-track-bg, .horiz-track-active {
    left: 30px;
    right: 30px;
    top: 13px;
  }
  .horiz-node-btn {
    width: 90px;
  }
  .node-dot-wrapper {
    width: 28px;
    height: 28px;
  }
  .node-dot {
    width: 8px;
    height: 8px;
  }
  .node-year {
    font-size: 0.68rem;
    margin-top: 6px;
  }
  .node-company-short {
    font-size: 0.58rem;
    margin-top: 2px;
  }
  .timeline-console-wrapper {
    min-height: auto;
    width: 100%;
  }
  .timeline-card {
    padding: 14px 14px;
    border-radius: 12px;
  }
  .job-card-header {
    gap: 8px;
    margin-bottom: 8px;
    padding-bottom: 8px;
  }
  .job-role {
    font-size: 0.95rem;
    line-height: 1.25;
  }
  .job-company {
    font-size: 0.82rem;
  }
  .system-record-tag {
    font-size: 0.58rem;
  }
  .job-meta-info {
    font-size: 0.7rem;
    gap: 2px;
  }
  .job-bullets-wrapper {
    margin-top: 8px;
    max-height: 190px;
    overflow-y: auto;
    padding-right: 6px;
    -webkit-overflow-scrolling: touch;
  }
  .job-bullets {
    gap: 6px;
  }
  .job-bullets li {
    font-size: 0.78rem;
    line-height: 1.4;
    padding-left: 12px;
  }
}

/* Mobile Contact Switcher Bar */
.contact-tab-switcher {
  display: none;
}

@media (max-width: 768px) {
  .contact-tab-switcher {
    display: flex;
    gap: 8px;
    width: 100%;
    margin-bottom: 12px;
    background: rgba(0, 0, 0, 0.4);
    padding: 4px;
    border-radius: 25px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .contact-tab-btn {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-family: var(--font-display);
    font-size: 0.72rem;
    font-weight: 700;
    padding: 8px 12px;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
  }

  .contact-tab-btn.active {
    background: linear-gradient(135deg, var(--accent-indigo), var(--accent-cyan));
    color: #ffffff;
    box-shadow: 0 0 12px rgba(6, 182, 212, 0.3);
  }

  .glass-panel.contact-details-panel.mobile-hidden,
  .glass-panel.contact-qr-card.mobile-hidden {
    display: none !important;
  }

  .contact-section {
    padding: 16px 14px !important;
    height: 100vh;
    height: 100dvh;
    max-height: 100vh;
    max-height: 100dvh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-sizing: border-box;
    overflow: hidden;
  }

  .contact-grid {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .contact-details-panel, .contact-qr-card {
    width: 100%;
    padding: 16px 14px;
  }

  .contact-lead, .qr-description {
    font-size: 0.78rem;
    margin-bottom: 12px;
  }

  .comms-cards-list {
    gap: 8px;
    margin-bottom: 12px;
  }

  .info-card {
    padding: 10px 12px;
  }

  .info-icon-box {
    width: 32px;
    height: 32px;
  }

  .info-label {
    font-size: 0.6rem;
  }

  .info-value {
    font-size: 0.76rem;
  }

  .qr-image {
    width: 110px;
    height: 110px;
  }

  .qr-display-container {
    margin: 10px 0 14px 0;
  }
}

@media (max-width: 480px) {
  .hud-header {
    display: none !important;
  }
  .horizontal-nav-timeline {
    padding: 0 4px;
    margin: 0 0 12px 0;
  }
  .horiz-track-bg, .horiz-track-active {
    left: 20px;
    right: 20px;
    top: 11px;
  }
  .horiz-node-btn {
    width: 75px;
  }
  .node-dot-wrapper {
    width: 24px;
    height: 24px;
  }
  .node-dot {
    width: 6px;
    height: 6px;
  }
  .node-year {
    font-size: 0.62rem;
    margin-top: 4px;
  }
  .node-company-short {
    font-size: 0.52rem;
  }
  .timeline-card {
    padding: 12px 10px;
  }
  .job-role {
    font-size: 0.9rem;
  }
  .job-bullets-wrapper {
    max-height: 175px;
    margin-top: 6px;
  }
  .job-bullets li {
    font-size: 0.74rem;
    line-height: 1.35;
  }
  .hero-panel {
    padding: 12px 10px;
    gap: 8px;
    min-height: auto;
    max-height: calc(100vh - 60px);
    max-height: calc(100dvh - 60px);
  }
  .avatar-wrapper {
    width: 95px;
    height: 95px;
    margin: 0 auto 8px auto;
  }
  .avatar-img {
    width: 100%;
    height: 100%;
  }
  .terminal-text-box {
    height: 145px;
    min-height: 145px;
    max-height: 145px;
    margin-bottom: 8px;
  }
  .terminal-code {
    font-size: 0.78rem;
    line-height: 1.4;
  }
  .hero-action-row .action-btn-primary,
  .hero-action-row .action-btn-secondary {
    padding: 6px 8px;
    font-size: 0.7rem;
    min-height: 36px;
  }
  .album-slider-perspective {
    height: 410px;
  }
  .project-slide-card {
    width: 260px;
    height: 400px;
  }
  .filter-bar {
    overflow-x: auto;
    width: 100%;
    padding-bottom: 6px;
    justify-content: flex-start;
  }
  .filter-tab {
    flex-shrink: 0;
    padding: 6px 12px;
    font-size: 0.7rem;
    min-height: 44px;
  }
}
</style>
