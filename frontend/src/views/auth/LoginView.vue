<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
    <div class="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-3xl pointer-events-none"></div>

    <div class="w-full max-w-md relative z-10">
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white text-3xl shadow-xl shadow-indigo-200 mb-6 transform -rotate-6 hover:rotate-0 transition-transform duration-300 cursor-default">
          ⚡
        </div>
        <h1 class="text-4xl font-black text-slate-900 tracking-tight mb-2">TaskFlow</h1>
        <p class="text-slate-500 font-medium">
          {{ step === 'LOGIN' ? 'Chào mừng trở lại! Vui lòng đăng nhập.' :
             step === 'VERIFY' ? 'Xác thực tài khoản' :
             step === 'FORGOT' ? 'Khôi phục mật khẩu' : 'Tạo mật khẩu mới' }}
        </p>
      </div>

      <div class="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-indigo-50/50 border border-white p-8 sm:p-10">

        <form v-if="step === 'LOGIN'" @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 pl-1">Email</label>
            <input v-model="form.email" type="email" placeholder="huy@example.com" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all text-sm font-medium outline-none text-slate-800" required />
          </div>

          <div>
            <div class="flex justify-between items-center mb-2 pl-1 pr-1">
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">Mật khẩu</label>
              <button type="button" @click="step = 'FORGOT'; error = ''; successMsg = ''" class="text-xs font-bold text-indigo-600 hover:underline">Quên mật khẩu?</button>
            </div>
            <input v-model="form.password" type="password" placeholder="••••••••" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all text-sm font-medium outline-none text-slate-800" required />
          </div>

          <p v-if="error" class="text-rose-500 text-sm font-bold bg-rose-50 px-4 py-3 rounded-xl border border-rose-100 flex items-center gap-2">
            <span>⚠️</span> {{ error }}
          </p>

          <button type="submit" :disabled="loading" class="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-base py-4 rounded-2xl transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 mt-2">
            {{ loading ? 'Đang xác thực...' : 'Đăng nhập' }}
          </button>

          <div class="mt-6">
            <div class="relative">
              <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-200"></div></div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-slate-400 font-medium tracking-wide text-[10px] uppercase">Hoặc đăng nhập bằng</span>
              </div>
            </div>
            <div class="mt-6 grid grid-cols-2 gap-3">
              <GoogleLogin :callback="callbackGoogle" class="w-full flex justify-center" />
              <button type="button" class="flex justify-center items-center gap-2 py-3 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-bold text-sm text-slate-700">
                <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" class="w-5 h-5" alt="Facebook" /> Facebook
              </button>
            </div>
          </div>
        </form>

        <form v-else-if="step === 'FORGOT'" @submit.prevent="handleForgotPassword" class="space-y-6">
          <p class="text-sm text-slate-600 font-medium text-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
            Nhập email của bạn, chúng tôi sẽ gửi mã OTP để giúp bạn đặt lại mật khẩu.
          </p>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 pl-1">Email khôi phục</label>
            <input v-model="form.email" type="email" placeholder="name@example.com" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none transition-all text-sm font-medium" required />
          </div>

          <p v-if="error" class="text-rose-500 text-sm font-bold">{{ error }}</p>

          <button type="submit" :disabled="loading" class="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition shadow-lg disabled:opacity-50">
            {{ loading ? 'Đang gửi mã...' : 'Gửi mã OTP khôi phục' }}
          </button>
          <button type="button" @click="step = 'LOGIN'; error = ''" class="w-full text-slate-500 font-bold text-sm hover:text-slate-800 transition">Quay lại đăng nhập</button>
        </form>

        <form v-else-if="step === 'RESET'" @submit.prevent="handleResetPassword" class="space-y-5">
           <div class="text-center bg-indigo-50 p-4 rounded-2xl border border-indigo-100 mb-2">
            <p class="text-sm font-medium text-indigo-800">Mã OTP đã được gửi tới:</p>
            <p class="font-black text-indigo-600">{{ form.email }}</p>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 pl-1 text-center">Nhập mã OTP</label>
            <input v-model="otp" type="text" placeholder="123456" maxlength="6" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 text-2xl font-black tracking-[0.5em] text-center outline-none uppercase" required />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 pl-1">Mật khẩu mới</label>
            <input v-model="newPassword" type="password" placeholder="Nhập mật khẩu mới" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none transition-all text-sm font-medium" required />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 pl-1">Xác nhận mật khẩu mới</label>
            <input v-model="confirmPassword" type="password" placeholder="Nhập lại mật khẩu mới" autocomplete="new-password" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none transition-all text-sm font-medium" required />
          </div>

          <p v-if="error" class="text-rose-500 text-sm font-bold">{{ error }}</p>

          <button type="submit" :disabled="loading" class="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl hover:bg-emerald-700 transition shadow-lg disabled:opacity-50">
            {{ loading ? 'Đang xử lý...' : 'Xác nhận đổi mật khẩu' }}
          </button>
        </form>

        <form v-else-if="step === 'VERIFY'" @submit.prevent="handleVerify" class="space-y-6">
          <div class="text-center bg-amber-50 p-4 rounded-2xl border border-amber-100 mb-6">
            <p class="text-sm font-medium text-amber-800">Tài khoản này chưa được xác thực.</p>
            <p class="text-xs text-amber-700 mt-1">Vui lòng kiểm tra email <b>{{ form.email }}</b> để lấy mã OTP.</p>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 pl-1 text-center">Nhập mã OTP</label>
            <input v-model="otp" type="text" placeholder="123456" maxlength="6" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 text-2xl font-black tracking-[0.5em] text-center outline-none uppercase" required />
          </div>

          <p v-if="error" class="text-rose-500 text-sm font-bold">{{ error }}</p>

          <button type="submit" :disabled="loading" class="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition shadow-lg disabled:opacity-50">
            {{ loading ? 'Đang kiểm tra...' : 'Xác nhận Email' }}
          </button>
        </form>

        <div v-if="step === 'LOGIN'" class="mt-8 pt-6 border-t border-slate-100 text-center">
          <p class="text-sm text-slate-500 font-medium">
            Chưa có tài khoản?
            <RouterLink to="/register" class="text-indigo-600 font-bold hover:text-indigo-700 transition ml-1 hover:underline">Đăng ký ngay</RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store.js'
import api from '@/api/index.js'
import { decodeCredential } from 'vue3-google-login'
const router = useRouter()
const authStore = useAuthStore()

const step = ref('LOGIN')  // 'LOGIN' | 'FORGOT' | 'RESET' | 'VERIFY'
const form = ref({ email: '', password: '' })
const otp = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const successMsg = ref('')
const callbackGoogle = async (response) => {
  loading.value = true
  try {
    await authStore.loginWithGoogle(response.credential)
    alert('✅ Đăng nhập Google thành công!')
    router.push('/dashboard')
  } catch (err) {
    error.value = 'Lỗi kết nối tài khoản Google.'
  } finally {
    loading.value = false
  }
}
async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    await authStore.login(form.value.email, form.value.password)
    router.push('/dashboard')
  } catch (err) {
    const msg = err.response?.data?.message || 'Đăng nhập thất bại'
    if (msg.includes('chưa được xác thực') || err.response?.data?.code === 'NOT_VERIFIED') {
      step.value = 'VERIFY'
      error.value = 'Tài khoản chưa xác thực!'
    } else {
      error.value = msg
    }
  } finally {
    loading.value = false
  }
}
async function handleVerify() {
  loading.value = true
  error.value = ''
  try {
    await api.post('/auth/verify-email', { email: form.value.email, otp: otp.value })
    alert('✅ Xác nhận thành công! Đang đăng nhập...')
    step.value = 'LOGIN' // Quay lại bước login để chạy tiếp
    await handleLogin()  // Tự động gọi lại đăng nhập
  } catch (err) {
    error.value = err.response?.data?.message || 'Mã xác thực không đúng!'
  } finally {
    loading.value = false
  }
}
async function handleForgotPassword() {
  loading.value = true
  error.value = ''
  try {
    await api.post('/auth/forgot-password', { email: form.value.email })
    step.value = 'RESET'
    otp.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (err) {
    error.value = err.response?.data?.message || 'Không tìm thấy Email này!'
  } finally {
    loading.value = false
  }
}
async function handleResetPassword() {
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Mật khẩu xác nhận không khớp!'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await api.post('/auth/reset-password', { email: form.value.email, otp: otp.value, newPassword: newPassword.value })
    alert('✅ Đổi mật khẩu thành công! Vui lòng đăng nhập lại.')
    step.value = 'LOGIN'
    form.value.password = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (err) {
    error.value = err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn!'
  } finally {
    loading.value = false
  }
}
</script>
