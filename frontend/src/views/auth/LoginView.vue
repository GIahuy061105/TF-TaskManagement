<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
    <div class="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-3xl pointer-events-none"></div>

    <div class="w-full max-w-md relative z-10">
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white text-3xl shadow-xl shadow-indigo-200 mb-6 transform -rotate-6 hover:rotate-0 transition-transform duration-300 cursor-default">
          <BaseIcon :path="mdiLogin" size="30" />
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
              <BaseButton variant="ghost"  class="!p-0 !h-auto hover:!bg-transparent text-xs !text-indigo-600 hover:underline" @click="step = 'FORGOT'; error = ''">
                Quên mật khẩu?
              </BaseButton>
            </div>
            <input v-model="form.password" type="password" placeholder="••••••••" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all text-sm font-medium outline-none text-slate-800" required />
          </div>

          <p v-if="error" class="text-rose-500 text-sm font-bold bg-rose-50 px-4 py-3 rounded-xl border border-rose-100 flex items-center gap-2">
            <BaseIcon :path="mdiAlert" size="20" class="shrink-0" />{{ error }}
          </p>
          <div class="w-full">
          <BaseButton type="submit"  variant="primary"  size="lg"  block :loading="loading" class="mt-2 whitespace-nowrap" >
            Đăng nhập
          </BaseButton>
          </div>

          <div class="mt-6">
            <div class="relative mb-4">
              <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-200"></div></div>
              <div class="relative flex justify-center">
                <span class="px-2 bg-white text-slate-400 font-medium text-[10px] uppercase">Hoặc đăng nhập bằng</span>
              </div>
            </div>

            <BaseButton  type="button"  variant="outline"  size="lg"  block  @click="handleGoogleLogin" class="!text-slate-700 hover:!text-slate-900" >
              <div class="flex items-center justify-center gap-3 w-full">
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" class="w-5 h-5 shrink-0" alt="Google" />
                  <span class="font-bold">Đăng nhập với Google</span>
                </div>
            </BaseButton>
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

          <BaseButton type="submit" variant="primary" size="lg" block :loading="loading">
            Gửi mã OTP khôi phục
          </BaseButton>
          <BaseButton type="button" variant="ghost" size="md" block @click="step = 'LOGIN'; error = ''" class="!text-slate-500 hover:!text-slate-800 font-bold">
            Quay lại đăng nhập
          </BaseButton>
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

          <BaseButton type="submit" variant="success" size="lg" block :loading="loading">
            Xác nhận đổi mật khẩu
          </BaseButton>
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

          <BaseButton type="submit" variant="primary" size="lg" block :loading="loading">
            Xác nhận Email
          </BaseButton>
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
import { decodeCredential, googleTokenLogin } from 'vue3-google-login'
import { mdiLogin , mdiAlert } from '@mdi/js'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import BaseButton from '@/components/icon/BaseButton.vue'
import { toast } from 'vue-sonner'
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
    toast.success('✅ Đăng nhập Google thành công!')
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
      toast.error('Tài khoản chưa xác thực!')
    } else {
      error.value = msg
      toast.error(msg)
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
    toast.success('✅ Xác nhận thành công! Đang đăng nhập...')
    step.value = 'LOGIN' // Quay lại bước login để chạy tiếp
    await handleLogin()  // Tự động gọi lại đăng nhập
  } catch (err) {
    error.value = err.response?.data?.message || 'Mã xác thực không đúng!'
    toast.error(error.value)
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
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}
async function handleResetPassword() {
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Mật khẩu xác nhận không khớp!'
    toast.error(error.value)
    return
  }
  loading.value = true
  error.value = ''
  try {
    await api.post('/auth/reset-password', { email: form.value.email, otp: otp.value, newPassword: newPassword.value })
    toast.success('✅ Đổi mật khẩu thành công! Vui lòng đăng nhập lại.')
    step.value = 'LOGIN'
    form.value.password = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (err) {
    error.value = err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn!'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}
async function handleGoogleLogin() {
  loading.value = true
  error.value = ''
  try {
    const response = await googleTokenLogin({
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID
    })
    const res = await api.post('/auth/google-token', {
      accessToken: response.access_token
    })
    await authStore.loginWithGoogle(res.data)
    toast.success('✅ Đăng nhập Google thành công!')
    router.push('/dashboard')
  } catch (err) {
    console.error("Chi tiết lỗi:", err)
    error.value = err.response?.data?.message || 'Đăng nhập Google thất bại'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}
</script>
