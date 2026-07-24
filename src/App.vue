<template>
  <div class="app-container">
    <!-- WebGL Background Canvas Wrapper (Always active, morphs based on contact card route) -->
    <div class="canvas-wrapper">
      <ResumeCanvas 
        :scrollProgress="scrollProgress"
        :highlightedSkill="highlightedSkill"
        :isContactCard="currentHash === '#/contact-card'"
        :activeProjectImage="activeProjectImage"
        :activeProjectCategory="activeProjectCategory"
        :activeJobIndex="activeJobIndex"
        :activeCertIndex="activeCertIndex"
      />
    </div>

    <!-- Standalone Contact Card (Fullscreen View) -->
    <ResumeContactCard v-if="currentHash === '#/contact-card'" />

    <!-- Main Resume Site Overlay -->
    <ResumeOverlay 
      v-else
      v-model:highlightedSkill="highlightedSkill"
      :scrollProgress="scrollProgress"
      :activeSection="activeSection"
      :activeJobIndex="activeJobIndex"
      @audio-state-change="onAudioStateChange"
      @project-hover="onProjectHover"
      @job-hover="onJobHover"
      @cert-hover="onCertHover"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import ResumeCanvas from './components/ResumeCanvas.vue'
import ResumeOverlay from './components/ResumeOverlay.vue'
import ResumeContactCard from './components/ResumeContactCard.vue'
import { stopAmbientHum } from './utils/audio'

const scrollProgress = ref(0)
const highlightedSkill = ref(null)
const isAudioActive = ref(false)
const currentHash = ref(window.location.hash)

// Track active hovered certificate index for 3D model interaction
const activeCertIndex = ref(null)

const onCertHover = (idx) => {
  activeCertIndex.value = idx
}

// Track active hovered project details for 3D model screen texture rendering
const activeProjectImage = ref(null)
const activeProjectCategory = ref(null)

const onProjectHover = (hoverDetails) => {
  activeProjectImage.value = hoverDetails.image
  activeProjectCategory.value = hoverDetails.category
}

// Track active timeline job index (0 = XOX Technology, 1 = UEM Edgenta, 2 = Felda Prodata)
const selectedJobIndex = ref(0)

const activeJobIndex = computed(() => {
  return selectedJobIndex.value
})

const onJobHover = (idx) => {
  if (typeof idx === 'number' && idx !== null) {
    selectedJobIndex.value = idx
  }
}

// Active Section calculator (6 sections mapping)
const activeSection = computed(() => {
  const p = scrollProgress.value
  if (p < 0.16) return 0      // Hero (Core Unit)
  if (p < 0.32) return 1      // Certificates (Profile)
  if (p < 0.48) return 2      // Skills (Core Matrix)
  if (p < 0.68) return 3      // Experience (Timeline)
  if (p < 0.88) return 4      // Projects (Works)
  return 5                    // Connect (Outbound Port)
})

// Calculate vertical scroll progress ratio (0.0 to 1.0)
const handleScroll = () => {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight
  const winHeight = window.innerHeight
  const scrollable = docHeight - winHeight
  
  if (scrollable > 0) {
    scrollProgress.value = scrollTop / scrollable
  } else {
    scrollProgress.value = 0
  }
}

const updateHash = () => {
  currentHash.value = window.location.hash
}

const onAudioStateChange = (state) => {
  isAudioActive.value = state
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('hashchange', updateHash)
  handleScroll() // Trigger initial check
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('hashchange', updateHash)
  // Stop audio in case of hot reloading
  stopAmbientHum()
})
</script>

<style>
/* Global App Container layout setup */
.app-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
}
</style>
