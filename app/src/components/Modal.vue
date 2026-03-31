<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content pixel-card">
        <button class="modal-close" @click="$emit('close')">×</button>
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { watch } from 'vue'

const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(['close'])

watch(() => props.visible, (val) => {
  const handleEsc = (e) => {
    if (e.key === 'Escape' && props.visible) emit('close')
  }
  if (val) {
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEsc)
  } else {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', handleEsc)
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
.modal-content {
  position: relative;
  max-width: 560px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 28px;
  animation: slideUp 0.3s ease;
}
@keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
.modal-close {
  position: absolute;
  top: 12px; right: 12px;
  width: 32px; height: 32px;
  border: 1px solid var(--border-pixel);
  background: transparent;
  color: var(--text-dim);
  font-size: 1.2rem;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.modal-close:hover { background: var(--neon-pink); color: #fff; border-color: var(--neon-pink); }

@media (max-width: 600px) {
  .modal-content { padding: 20px; }
}
</style>
