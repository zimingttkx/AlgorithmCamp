<template>
  <div class="music-player" :class="{ expanded: isExpanded, playing: isPlaying }">
    <!-- Mini Player -->
    <div class="player-mini" @click="toggleExpand">
      <div class="mini-disc" :class="{ spinning: isPlaying }">
        <div class="disc-inner">
          <div class="disc-artwork" :style="currentTrack.artwork ? `background-image: url(${currentTrack.artwork})` : ''">
            <div v-if="!currentTrack.artwork" class="disc-default">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><path d="M9 12h6M12 9v6"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div class="mini-info">
        <div class="mini-title">{{ currentTrack.title }}</div>
        <div class="mini-artist">{{ currentTrack.artist }}</div>
      </div>
      <button class="mini-play-btn" @click.stop="togglePlay">
        <svg v-if="!isPlaying" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
        </svg>
      </button>
      <button class="mini-close-btn" @click.stop="closePlayer">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- Expanded Player -->
    <Transition name="player-expand">
      <div v-if="isExpanded" class="player-expanded">
        <div class="exp-artwork" :style="currentTrack.artwork ? `background-image: url(${currentTrack.artwork})` : ''">
          <div v-if="!currentTrack.artwork" class="exp-artwork-default">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
            </svg>
          </div>
          <div class="artwork-overlay"></div>
        </div>
        <div class="exp-track-info">
          <div class="exp-track-title">{{ currentTrack.title }}</div>
          <div class="exp-track-artist">{{ currentTrack.artist }}</div>
        </div>
        <div class="exp-progress">
          <div class="progress-track" @click="seek">
            <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
            <div class="progress-thumb" :style="{ left: progressPercent + '%' }"></div>
          </div>
          <div class="progress-time">
            <span>{{ formatTime(currentTime) }}</span>
            <span>{{ formatTime(duration) }}</span>
          </div>
        </div>
        <div class="exp-controls">
          <button class="ctrl-btn" @click="prevTrack">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
          <button class="ctrl-btn play-btn" @click="togglePlay">
            <svg v-if="!isPlaying" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
            </svg>
          </button>
          <button class="ctrl-btn" @click="nextTrack">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
        <div class="exp-volume">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path v-if="volume > 0.5" d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            <path v-if="volume > 0" d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
          <input type="range" class="volume-slider" min="0" max="1" step="0.01" v-model="volume" @input="setVolume" />
        </div>
        <button class="exp-collapse-btn" @click="isExpanded = false">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 15 12 9 18 15"/>
          </svg>
        </button>
      </div>
    </Transition>

    <!-- Hidden Audio -->
    <audio
      ref="audioRef"
      :src="currentTrack.url"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @ended="onEnded"
      @play="isPlaying = true"
      @pause="isPlaying = false"
    ></audio>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const base = import.meta.env.BASE_URL || '/'
const tracks = ref([
  {
    id: 1,
    title: 'In Love',
    artist: 'Instrumental',
    url: base + 'music/Inlove.mp3',
    artwork: ''
  },
  {
    id: 2,
    title: 'Uma Mattina',
    artist: 'Instrumental',
    url: base + 'music/Uma%20Mattina.mp3',
    artwork: ''
  },
  {
    id: 3,
    title: 'Time To Love',
    artist: 'Instrumental',
    url: base + 'music/Time%20To%20Love.mp3',
    artwork: ''
  },
  {
    id: 4,
    title: 'Pain',
    artist: 'Instrumental',
    url: base + 'music/Pain.mp3',
    artwork: ''
  },
  {
    id: 5,
    title: 'The Truth That You Leave',
    artist: 'Instrumental',
    url: base + 'music/The%20Truth%20That%20you%20leave.mp3',
    artwork: ''
  }
])

const currentTrackIndex = ref(0)
const currentTrack = computed(() => tracks.value[currentTrackIndex.value])

const isPlaying = ref(false)
const isExpanded = ref(false)
const audioRef = ref(null)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.7)

const progressPercent = computed(() => {
  if (!duration.value) return 0
  return (currentTime.value / duration.value) * 100
})

function togglePlay() {
  if (!audioRef.value) return
  if (isPlaying.value) {
    audioRef.value.pause()
  } else {
    audioRef.value.play().catch(() => {})
  }
}

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

function closePlayer() {
  if (audioRef.value) {
    audioRef.value.pause()
    audioRef.value.currentTime = 0
  }
  isPlaying.value = false
  isExpanded.value = false
}

function playTrack(index) {
  if (!audioRef.value) return
  currentTrackIndex.value = index
  audioRef.value.pause()
  audioRef.value.currentTime = 0
  audioRef.value.src = tracks.value[index].url
  audioRef.value.load()
  audioRef.value.play().then(() => {
    isPlaying.value = true
  }).catch(() => {
    isPlaying.value = false
  })
}

function prevTrack() {
  const newIndex = (currentTrackIndex.value - 1 + tracks.value.length) % tracks.value.length
  playTrack(newIndex)
}

function nextTrack() {
  const newIndex = (currentTrackIndex.value + 1) % tracks.value.length
  playTrack(newIndex)
}

function seek(e) {
  if (!audioRef.value || !duration.value) return
  const rect = e.currentTarget.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  audioRef.value.currentTime = percent * duration.value
}

function setVolume() {
  if (audioRef.value) {
    audioRef.value.volume = volume.value
  }
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function onTimeUpdate() {
  if (audioRef.value) {
    currentTime.value = audioRef.value.currentTime
  }
}

function onLoadedMetadata() {
  if (audioRef.value) {
    duration.value = audioRef.value.duration
    audioRef.value.volume = volume.value
  }
}

function onEnded() {
  nextTrack()
}

onMounted(() => {
  setTimeout(() => {
    playTrack(0)
  }, 800)
})
</script>

<style scoped>
.music-player {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0;
}

/* ═══ MINI PLAYER ═══ */
.player-mini {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(19, 27, 46, 0.92);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-default);
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05);
}

.player-mini:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.5), 0 0 20px rgba(14,165,233,0.1);
  border-color: rgba(14,165,233,0.3);
}

.player-mini.playing {
  border-color: rgba(0,217,255,0.3);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(0,217,255,0.15);
}

.mini-disc {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1a1a2e, #0a0a15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid rgba(255,255,255,0.1);
}

.mini-disc.spinning {
  animation: discSpin 8s linear infinite;
}

@keyframes discSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.disc-inner {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--bg-surface);
}

.disc-artwork {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-color: var(--bg-elevated);
}

.disc-default {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.mini-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.mini-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary);
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-artist {
  font-size: 0.7rem;
  color: var(--text-muted);
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-play-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(14,165,233,0.4);
}

.mini-play-btn:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 16px rgba(14,165,233,0.5);
}

.mini-close-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.mini-close-btn:hover {
  color: var(--danger);
  background: rgba(239,68,68,0.1);
}

/* ═══ EXPANDED PLAYER ═══ */
.player-expand-enter-active,
.player-expand-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.player-expand-enter-from,
.player-expand-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.player-expanded {
  position: absolute;
  bottom: 60px;
  right: 0;
  width: 300px;
  background: rgba(13, 17, 30, 0.95);
  backdrop-filter: blur(30px);
  border: 1px solid var(--border-default);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05);
}

.exp-artwork {
  width: 100%;
  height: 200px;
  background-size: cover;
  background-position: center;
  background-color: var(--bg-elevated);
  position: relative;
}

.exp-artwork-default {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  background: linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-surface) 100%);
}

.artwork-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 40%, rgba(13,17,30,0.95) 100%);
}

.exp-track-info {
  padding: 16px 20px 8px;
  text-align: center;
}

.exp-track-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.exp-track-artist {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.exp-progress {
  padding: 12px 20px 8px;
}

.progress-track {
  height: 4px;
  background: var(--bg-surface);
  border-radius: 100px;
  cursor: pointer;
  position: relative;
  overflow: visible;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  border-radius: 100px;
  transition: width 0.1s linear;
}

.progress-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: var(--secondary);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(0,217,255,0.5);
  opacity: 0;
  transition: opacity 0.2s;
}

.progress-track:hover .progress-thumb {
  opacity: 1;
}

.progress-time {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  color: var(--text-muted);
}

.exp-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 8px 20px 12px;
}

.ctrl-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.ctrl-btn:hover {
  color: var(--text-primary);
  background: rgba(255,255,255,0.05);
}

.ctrl-btn.play-btn {
  width: 52px;
  height: 52px;
  background: var(--primary);
  color: white;
  box-shadow: 0 8px 24px rgba(14,165,233,0.4);
}

.ctrl-btn.play-btn:hover {
  transform: scale(1.08);
  box-shadow: 0 10px 30px rgba(14,165,233,0.5);
  color: white;
}

.exp-volume {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 20px 16px;
  color: var(--text-muted);
}

.volume-slider {
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--bg-surface);
  border-radius: 100px;
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--secondary);
  cursor: pointer;
  box-shadow: 0 0 8px rgba(0,217,255,0.4);
}

.volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--secondary);
  cursor: pointer;
  border: none;
  box-shadow: 0 0 8px rgba(0,217,255,0.4);
}

.exp-collapse-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.exp-collapse-btn:hover {
  background: rgba(0,0,0,0.7);
}

@media (max-width: 480px) {
  .music-player {
    bottom: 16px;
    right: 16px;
  }
  .player-expanded {
    width: 280px;
  }
  .mini-title, .mini-artist {
    max-width: 80px;
  }
}
</style>
