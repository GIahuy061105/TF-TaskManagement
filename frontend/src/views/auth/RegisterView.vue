<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
    <div class="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-3xl pointer-events-none"></div>

    <div class="w-full max-w-md relative z-10 my-8">
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-3xl shadow-xl shadow-purple-200 mb-6 transform rotate-6 hover:rotate-0 transition-transform duration-300 cursor-default">
          <BaseIcon :path="mdiAccountPlusOutline" size="30" />
        </div>
        <h1 class="text-4xl font-black text-slate-900 tracking-tight mb-2">TaskFlow</h1>
        <p class="text-slate-500 font-medium">
          {{ step === 'REGISTER' ? 'Tạo tài khoản miễn phí để bắt đầu' : 'Xác thực tài khoản của bạn' }}
        </p>
      </div>

      <div class="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-indigo-50/50 border border-white p-8 sm:p-10">

        <form v-if="step === 'REGISTER'" @submit.prevent="handleRegister" class="space-y-5">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 pl-1">Họ và tên</label>
            <input v-model="form.fullName" type="text" placeholder="Nguyễn Văn A" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all text-sm font-medium outline-none text-slate-800" required />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 pl-1">Email</label>
            <input v-model="form.email" type="email" placeholder="name@example.com" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all text-sm font-medium outline-none text-slate-800" required />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 pl-1">Mật khẩu</label>
            <input v-model="form.password" type="password" placeholder="••••••••" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all text-sm font-medium outline-none text-slate-800" required />
          </div>

          <p v-if="error" class="text-rose-500 text-sm font-bold bg-rose-50 px-4 py-3 rounded-xl border border-rose-100 flex items-center gap-2">
            <BaseIcon :path="mdiAlert" size="20" class="shrink-0" />{{ error }} {{ error }}
          </p>

          <button type="submit" :disabled="loading" class="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-base py-4 rounded-2xl transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 mt-2">
            {{ loading ? 'Đang thiết lập...' : 'Tạo tài khoản' }}
          </button>
        </form>

        <form v-else-if="step === 'VERIFY'" @submit.prevent="handleVerify" class="space-y-6">
          <div class="text-center bg-indigo-50 p-4 rounded-2xl border border-indigo-100 mb-6">
            <p class="text-sm font-medium text-indigo-800">Chúng tôi đã gửi mã xác nhận 6 số đến email:</p>
            <p class="font-black text-indigo-600 mt-1">{{ form.email }}</p>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 pl-1 text-center">Nhập mã OTP</label>
            <input v-model="otp" type="text" placeholder="123456" maxlength="6" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all text-2xl font-black tracking-[0.5em] text-center outline-none text-slate-800 uppercase" required />
          </div>

          <p v-if="error" class="text-rose-500 text-sm font-bold bg-rose-50 px-4 py-3 rounded-xl border border-rose-100 flex items-center gap-2">
            <BaseIcon :path="mdiAlert" size="20" class="shrink-0" />{{ error }} {{ error }}
          </p>
          <p v-if="successMsg" class="text-emerald-600 text-sm font-bold bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100 flex items-center gap-2">
           <BaseIcon :path="mdiCheck" size="20" class="shrink-0" />{{ error }} {{ successMsg }}
          </p>

          <button type="submit" :disabled="loading" class="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-base py-4 rounded-2xl transition-all shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-1 disabled:opacity-50">
            {{ loading ? 'Đang kiểm tra...' : 'Xác nhận Email' }}
          </button>
        </form>

        <div v-if="step === 'REGISTER'" class="mt-8 pt-6 border-t border-slate-100 text-center">
          <p class="text-sm text-slate-500 font-medium">
            Đã có tài khoản?
            <RouterLink to="/login" class="text-indigo-600 font-bold hover:text-indigo-700 transition ml-1 hover:underline">Đăng nhập ngay</RouterLink>
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
import { mdiAccountPlusOutline , mdiAlert , mdiCheck} from '@mdi/js'
import BaseIcon from '@/components/icon/BaseIcon.vue'
const router = useRouter()
const authStore = useAuthStore()

const step = ref('REGISTER')
const form = ref({ fullName: '', email: '', password: '' })
const otp = ref('')
const loading = ref(false)
const error = ref('')
const successMsg = ref('')
async function handleRegister() {
  loading.value = true
  error.value = ''
  try {
    await authStore.register(form.value.fullName, form.value.email, form.value.password)
    step.value = 'VERIFY'
    successMsg.value = 'Đăng ký thành công! Vui lòng kiểm tra email.'
  } catch (err) {
    error.value = err.response?.data?.message || 'Đăng ký thất bại'
  } finally {
    loading.value = false
  }
}
async function handleVerify() {
  loading.value = true
  error.value = ''
  try {
    await api.post('/auth/verify-email', { email: form.value.email, otp: otp.value })
    alert('✅ Xác thực thành công! Đang tự động đăng nhập...')
    await authStore.login(form.value.email, form.value.password)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.message || 'Mã xác thực không hợp lệ!'
  } finally {
    loading.value = false
  }
}
</script>
