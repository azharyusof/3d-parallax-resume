<template>
  <div class="card-screen animate-fade-in">

    <!-- Modern Floating Back Button -->
    <a href="#" class="btn-back-home" title="Back to Resume">
      <ArrowLeft :size="18" />
    </a>

    <!-- Virtual Business Card Panel -->
    <div class="glass-card business-card-panel">
      <!-- Mockup window traffic light decor -->
      <div class="window-decor">
        <span class="decor-dot red"></span>
        <span class="decor-dot yellow"></span>
        <span class="decor-dot green"></span>
      </div>

      <!-- Card Header -->
      <div class="card-profile">
        <div class="avatar-container">
          <div class="avatar-glow"></div>
          <img :src="avatarImg" alt="Azhar Yusof" class="profile-img" />
        </div>
        
        <h2 class="profile-name">{{ name }}</h2>
        
        <!-- Divider border between name and location badge -->
        <div class="profile-divider"></div>
        
        <span class="location-badge">
          <MapPin :size="14" class="icon-spacing" /> {{ location }}
        </span>
      </div>

      <!-- Action Buttons -->
      <div class="actions-group">
        <!-- Save to Contacts (vCard) -->
        <button @click="handleSaveContact" class="btn-save-contact" :class="{ success: isSaved }">
          <component :is="isSaved ? Check : Download" :size="18" class="btn-icon" />
          <span>{{ isSaved ? 'Saved to Downloads!' : 'Add to Contacts' }}</span>
        </button>

        <!-- Direct Communication Options -->
        <div class="communication-grid">
          <a :href="'tel:' + rawPhone" class="communication-btn" title="Call Mobile">
            <div class="comm-icon-box call-color">
              <Phone :size="20" />
            </div>
            <span>Call</span>
          </a>

          <a :href="'https://wa.me/' + rawPhone.replace('+', '')" target="_blank" rel="noopener" class="communication-btn" title="WhatsApp Chat">
            <div class="comm-icon-box whatsapp-color">
              <MessageSquare :size="20" />
            </div>
            <span>WhatsApp</span>
          </a>

          <a :href="'mailto:' + email" class="communication-btn" title="Send Email">
            <div class="comm-icon-box email-color">
              <Mail :size="20" />
            </div>
            <span>Email</span>
          </a>
        </div>
      </div>

      <!-- Social & Repository Links -->
      <div class="social-links-footer">
        <a href="https://github.com/azharyusof" target="_blank" rel="noopener" class="social-footer-btn" aria-label="GitHub">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="brand-svg"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
        </a>
        <a href="https://www.linkedin.com/in/azharyusof" target="_blank" rel="noopener" class="social-footer-btn" aria-label="LinkedIn">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="brand-svg"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Mail, Phone, MapPin, ArrowLeft, Download, Check, MessageSquare } from '@lucide/vue'
import avatarImg from '../assets/avatar.png'

const name = 'Azhar Yusof'
const title = 'Assistant Team Lead, Software R&D'
const company = 'XOX Technology Berhad'
const email = 'nazhar.myusof@gmail.com'
const phone = '(+60) 19-687 0771'
const rawPhone = '+60196870771'
const location = 'Selangor, Malaysia'

const isSaved = ref(false)

const handleSaveContact = () => {
  const vcard = `BEGIN:VCARD
VERSION:3.0
N:Yusof;Azhar;;;
FN:Azhar Yusof
ORG:${company}
TITLE:${title}
TEL;TYPE=CELL,VOICE:${rawPhone}
EMAIL;TYPE=PREF,INTERNET:${email}
ADR;TYPE=HOME:;;Bandar Puncak Alam;Selangor;;Malaysia
URL:https://github.com/azharyusof
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

  isSaved.value = true
  setTimeout(() => {
    isSaved.value = false
  }, 3000)
}
</script>

<style scoped>
.card-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  padding: 2rem 10% 2rem 1.5rem;
  background: transparent;
  position: relative;
  overflow: hidden;
  z-index: 100;
}

@media (max-width: 768px) {
  .card-screen {
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 2rem 1.5rem;
  }
}

.btn-back-home {
  position: absolute;
  top: 2rem;
  left: 2rem;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text-muted, #94a3b8);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  text-decoration: none;
}

.btn-back-home:hover {
  background: var(--accent-indigo, #6366f1);
  border-color: var(--accent-indigo, #6366f1);
  color: #fff;
  transform: translateX(-4px);
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
}

.business-card-panel {
  width: 100%;
  max-width: 400px;
  padding: 3.5rem 2rem 2.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border-radius: 1.5rem;
  position: relative;
  overflow: hidden;
  background: rgba(13, 17, 28, 0.45);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.business-card-panel:hover {
  transform: translateY(-6px);
  box-shadow: 0 25px 50px rgba(99, 102, 241, 0.18);
  border-color: rgba(99, 102, 241, 0.35);
}

/* macOS traffic light mockup window controls */
.window-decor {
  position: absolute;
  top: 1.25rem;
  left: 1.25rem;
  display: flex;
  gap: 6px;
}

.decor-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  display: inline-block;
  opacity: 0.7;
}

.decor-dot.red { background-color: #ef4444; }
.decor-dot.yellow { background-color: #f59e0b; }
.decor-dot.green { background-color: #10b981; }

.card-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.profile-img {
  width: 104px;
  height: 104px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.15);
  position: relative;
  z-index: 2;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  padding: 4px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(4px);
}

.business-card-panel:hover .profile-img {
  transform: scale(1.05) rotate(2deg);
}

.avatar-glow {
  position: absolute;
  width: 116px;
  height: 116px;
  background: linear-gradient(135deg, var(--accent-indigo, #6366f1), var(--accent-cyan, #06b6d4));
  border-radius: 50%;
  filter: blur(10px);
  opacity: 0.5;
  animation: spin-glow 6s linear infinite;
  z-index: 1;
}

@keyframes spin-glow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.profile-name {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--text-main, #f8fafc);
  line-height: 1.2;
}

/* Horizontal border divider between name and location */
.profile-divider {
  width: 80px;
  height: 3px;
  background: linear-gradient(135deg, var(--accent-indigo, #6366f1), var(--accent-cyan, #06b6d4));
  border-radius: 9999px;
  margin: 1rem 0;
  opacity: 0.85;
}

.location-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(99, 102, 241, 0.08);
  color: var(--text-muted, #94a3b8);
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 550;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.icon-spacing {
  margin-right: 0.25rem;
}

.actions-group {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.btn-save-contact {
  width: 100%;
  justify-content: center;
  font-size: 1.05rem;
  padding: 0.9rem;
  border-radius: 0.75rem;
  border: none;
  font-family: 'Space Grotesk', monospace;
  font-weight: 600;
  cursor: pointer;
  background: linear-gradient(135deg, var(--accent-indigo, #6366f1), var(--accent-cyan, #06b6d4));
  color: #fff;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-save-contact:hover {
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35);
  transform: translateY(-2px);
}

.btn-save-contact.success {
  background: #10b981;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
  border-color: transparent;
}

.btn-icon {
  flex-shrink: 0;
}

.communication-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.communication-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted, #94a3b8);
  transition: all 0.3s ease;
}

.communication-btn:hover {
  color: var(--text-main, #f8fafc);
  transform: translateY(-3px);
}

.comm-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: var(--text-main, #f8fafc);
  backdrop-filter: blur(4px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Custom platform hover coloring with glow */
.communication-btn:hover .comm-icon-box.call-color {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.35);
}

.communication-btn:hover .comm-icon-box.whatsapp-color {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.4);
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.35);
}

.communication-btn:hover .comm-icon-box.email-color {
  color: #ec4899;
  background: rgba(236, 72, 153, 0.1);
  border-color: rgba(236, 72, 153, 0.4);
  box-shadow: 0 0 15px rgba(236, 72, 153, 0.35);
}

.social-links-footer {
  display: flex;
  justify-content: center;
  gap: 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 1.5rem;
}

.social-footer-btn {
  color: var(--text-muted, #94a3b8);
  transition: all 0.3s;
}

.social-footer-btn:hover {
  color: var(--accent-indigo, #6366f1);
  transform: translateY(-2px) scale(1.08);
}
</style>
