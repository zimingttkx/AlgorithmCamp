<template>
  <div class="login-page">
    <div class="login-bg"></div>
    <div class="login-container">
      <div class="login-header">
        <h1 class="login-title">算法刷题</h1>
        <p class="login-subtitle">登录后自动同步刷题记录</p>
      </div>

      <!-- Tab切换 -->
      <div class="tabs">
        <button class="tab" :class="{ active: tab === 'login' }" @click="tab = 'login'">登录</button>
        <button class="tab" :class="{ active: tab === 'register' }" @click="tab = 'register'">注册</button>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="error">{{ error }}</div>

      <!-- 登录表单 -->
      <form v-if="tab === 'login'" @submit.prevent="handleLogin">
        <div class="form-group">
          <input v-model="username" type="text" placeholder="用户名" required />
        </div>
        <div class="form-group">
          <input v-model="password" type="password" placeholder="密码" required />
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <!-- 注册表单 -->
      <form v-else @submit.prevent="handleRegister">
        <div class="form-group">
          <input v-model="username" type="text" placeholder="用户名 (3-20字符)" required minlength="3" maxlength="20" pattern="[a-zA-Z0-9_]+" />
        </div>
        <div class="form-group">
          <input v-model="password" type="password" placeholder="密码 (至少6位)" required minlength="6" />
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>

      <p class="login-hint">不登录也可以浏览，注册后刷题记录将自动同步</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/auth.js'

const router = useRouter()
const { login, register, user } = useAuth()

const tab = ref('login')
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

// 如果已登录，直接跳转
if (user.value) {
  router.push('/practice')
}

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await login(username.value.trim(), password.value)
    router.push('/practice')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  error.value = ''
  loading.value = true
  try {
    await register(username.value.trim(), password.value)
    router.push('/practice')
  } catch (e) {
    error.value = e.message
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
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.login-bg {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at 50% 30%, rgba(0, 240, 255, 0.08) 0%, transparent 50%);
  pointer-events: none;
}

.login-container {
  width: 100%;
  max-width: 360px;
  padding: 32px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 24px;
}

.login-title {
  font-size: 1.75rem;
  color: #fff;
  margin: 0 0 8px;
}

.login-subtitle {
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-size: 0.9rem;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.tab {
  flex: 1;
  padding: 12px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s;
}

.tab.active {
  background: #00f0ff;
  border-color: #00f0ff;
  color: #000;
  font-weight: 600;
}

.error {
  background: rgba(255, 71, 87, 0.2);
  border: 1px solid rgba(255, 71, 87, 0.4);
  color: #ff6b6b;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 16px;
}

.form-group input {
  width: 100%;
  padding: 14px 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-group input:focus {
  outline: none;
  border-color: #00f0ff;
}

button[type="submit"] {
  width: 100%;
  padding: 14px;
  background: #00f0ff;
  border: none;
  border-radius: 8px;
  color: #000;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

button[type="submit"]:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-hint {
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.8rem;
  margin-top: 20px;
}
</style>
