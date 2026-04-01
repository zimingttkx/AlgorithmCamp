<template>
  <div class="login-page">
    <div class="login-bg-glow"></div>
    <div class="login-container card">
      <div class="login-header">
        <router-link to="/" class="login-logo">
          <span class="logo-bracket">[</span>
          <span class="logo-text">ZMT</span>
          <span class="logo-bracket">]</span>
        </router-link>
        <p class="login-subtitle">{{ isZh ? '开始你的算法之旅' : 'Start Your Algorithm Journey' }}</p>
      </div>

      <!-- Tab Switcher -->
      <div class="tab-switch">
        <button
          class="tab-btn"
          :class="{ active: mode === 'login' }"
          @click="mode = 'login'"
        >
          {{ isZh ? '登录' : 'LOGIN' }}
        </button>
        <button
          class="tab-btn"
          :class="{ active: mode === 'register' }"
          @click="mode = 'register'"
        >
          {{ isZh ? '注册' : 'REGISTER' }}
        </button>
        <div class="tab-indicator" :style="{ left: mode === 'login' ? '4px' : 'calc(50% + 4px)' }"></div>
      </div>

      <!-- Error Display -->
      <Transition name="error">
        <div v-if="errorMsg" class="error-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ errorMsg }}
        </div>
      </Transition>

      <!-- Login Form -->
      <form v-if="mode === 'login'" @submit.prevent="handleLogin" class="login-form">
        <!-- GitHub Login Button -->
        <button type="button" @click="handleGithubLogin" class="btn btn-github submit-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          {{ isZh ? '用 GitHub 登录' : 'Login with GitHub' }}
        </button>

        <div class="divider">
          <span>{{ isZh ? '或' : 'OR' }}</span>
        </div>

        <div class="form-group">
          <label class="form-label">{{ isZh ? '用户名' : 'USERNAME' }}</label>
          <input
            v-model="username"
            type="text"
            class="form-input"
            :placeholder="isZh ? '输入用户名' : 'Enter username'"
            autocomplete="username"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">{{ isZh ? '密码' : 'PASSWORD' }}</label>
          <input
            v-model="password"
            type="password"
            class="form-input"
            :placeholder="isZh ? '输入密码' : 'Enter password'"
            autocomplete="current-password"
            required
          />
        </div>

        <button type="submit" class="btn btn-primary submit-btn" :disabled="loading">
          <span v-if="loading" class="loading-spinner"></span>
          <span v-else>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            {{ isZh ? '登录' : 'LOGIN' }}
          </span>
        </button>
      </form>

      <!-- Register Form -->
      <form v-else @submit.prevent="handleRegister" class="login-form">
        <div class="form-group">
          <label class="form-label">{{ isZh ? '用户名' : 'USERNAME' }}</label>
          <input
            v-model="username"
            type="text"
            class="form-input"
            :placeholder="isZh ? '选择一个用户名' : 'Choose a username'"
            autocomplete="username"
            required
            minlength="3"
            maxlength="30"
            pattern="[a-zA-Z0-9_]+"
          />
          <small class="form-hint">{{ isZh ? '3-30位字母、数字、下划线' : '3-30 chars, letters/numbers/underscore' }}</small>
        </div>

        <div class="form-group">
          <label class="form-label">{{ isZh ? '密码' : 'PASSWORD' }}</label>
          <input
            v-model="password"
            type="password"
            class="form-input"
            :placeholder="isZh ? '设置密码（至少6位）' : 'Set password (min 6 chars)'"
            autocomplete="new-password"
            required
            minlength="6"
          />
        </div>

        <div class="form-group">
          <label class="form-label">{{ isZh ? 'GitHub 用户名' : 'GITHUB USERNAME' }}</label>
          <input
            v-model="githubUsername"
            type="text"
            class="form-input"
            :placeholder="isZh ? '选填，用于刷题统计' : 'Optional, for commit stats'"
            autocomplete="off"
          />
          <small class="form-hint">{{ isZh ? '可之后在设置中修改' : 'Can change later in settings' }}</small>
        </div>

        <button type="submit" class="btn btn-primary submit-btn" :disabled="loading">
          <span v-if="loading" class="loading-spinner"></span>
          <span v-else>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
            {{ isZh ? '注册' : 'CREATE ACCOUNT' }}
          </span>
        </button>
      </form>

      <!-- Back to home -->
      <div class="login-footer">
        <router-link to="/" class="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          {{ isZh ? '返回首页' : 'Back to Home' }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/auth.js'
import { useLang } from '../composables/i18n.js'

const router = useRouter()
const { login, register, loginWithGithub, handleOAuthCallback } = useAuth()
const { isZh } = useLang()

const mode = ref('login')
const username = ref('')
const password = ref('')
const githubUsername = ref('')
const loading = ref(false)
const errorMsg = ref('')

onMounted(async () => {
  // Check for OAuth callback params
  const params = new URLSearchParams(window.location.search)
  const error = params.get('error')

  if (error === 'github_denied') {
    errorMsg.value = isZh.value ? 'GitHub 授权被取消' : 'GitHub authorization denied'
    return
  }

  if (error === 'oauth_failed') {
    errorMsg.value = isZh.value ? 'GitHub 登录失败，请重试' : 'GitHub login failed, please try again'
    return
  }

  if (params.get('login') === 'success') {
    // OAuth login succeeded
    try {
      await handleOAuthCallback()
      router.push('/practice')
    } catch (e) {
      errorMsg.value = e.message
    }
  }
})

function handleGithubLogin() {
  loginWithGithub()
}

async function handleLogin() {
  errorMsg.value = ''
  loading.value = true
  try {
    await login(username.value.trim(), password.value)
    router.push('/practice')
  } catch (e) {
    errorMsg.value = e.message
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  errorMsg.value = ''
  loading.value = true
  try {
    await register(username.value.trim(), password.value, githubUsername.value.trim())
    router.push('/practice')
  } catch (e) {
    errorMsg.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100px 20px 60px;
  position: relative;
}

.login-bg-glow {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 400px;
  background: radial-gradient(ellipse, var(--primary-glow) 0%, transparent 70%);
  filter: blur(80px);
  opacity: 0.4;
  pointer-events: none;
}

.login-container {
  width: 100%;
  max-width: 420px;
  padding: 40px;
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-logo {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.5rem;
  text-decoration: none;
  letter-spacing: 0.15em;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-bottom: 12px;
}

.logo-bracket {
  color: var(--secondary);
  opacity: 0.6;
}

.logo-text {
  color: var(--primary);
  font-weight: 700;
  text-shadow: 0 0 10px var(--primary-glow);
}

.login-subtitle {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin: 0;
}

/* Tab Switcher */
.tab-switch {
  display: flex;
  gap: 8px;
  margin-bottom: 28px;
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  padding: 4px;
  position: relative;
}

.tab-indicator {
  position: absolute;
  top: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: var(--primary);
  border-radius: var(--radius-md);
  transition: left 0.3s var(--ease-spring);
  z-index: 0;
}

.tab-btn {
  flex: 1;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: color 0.2s;
  position: relative;
  z-index: 1;
}

.tab-btn.active {
  color: white;
}

.tab-btn:hover:not(.active) {
  color: var(--text-primary);
}

/* Error Box */
.error-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255,46,176,0.1);
  border: 1px solid rgba(255,46,176,0.3);
  color: var(--danger);
  padding: 12px 16px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  border-radius: var(--radius-md);
}

.error-enter-active,
.error-leave-active {
  transition: all 0.3s var(--ease-out-expo);
}

.error-enter-from,
.error-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-secondary);
  letter-spacing: 0.05em;
}

.form-input {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  color: var(--text-primary);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1rem;
  padding: 14px 16px;
  outline: none;
  transition: all 0.3s var(--ease-spring);
  border-radius: var(--radius-md);
}

.form-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-glow);
}

.form-input::placeholder {
  color: var(--text-muted);
}

.form-hint {
  color: var(--text-muted);
  font-size: 0.78rem;
}

.submit-btn {
  margin-top: 8px;
  width: 100%;
  padding: 14px 20px;
  font-size: 1rem;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* GitHub Button */
.btn-github {
  background: #24292e;
  color: white;
  border: 1px solid rgba(255,255,255,0.1);
}

.btn-github:hover {
  background: #32393f;
  border-color: rgba(255,255,255,0.2);
}

/* Divider */
.divider {
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--text-muted);
  font-size: 0.8rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-default);
}

/* Footer */
.login-footer {
  margin-top: 28px;
  text-align: center;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.back-link:hover {
  color: var(--primary);
}

@media (max-width: 480px) {
  .login-container {
    padding: 28px 24px;
  }
}
</style>
