<template>
  <AppLayout>
    <div class="p-8 max-w-4xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Cài đặt Doanh nghiệp</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Thông tin này sẽ được in trực tiếp lên các Hóa đơn PDF xuất cho khách hàng.</p>
      </div>

      <div v-if="!form" class="flex items-center justify-center gap-2 py-10 text-slate-500 dark:text-slate-400 font-medium transition-colors">
        <BaseIcon :path="mdiTimerSand" size="22" /> Đang tải cấu hình...
      </div>
      <form v-else @submit.prevent="saveSettings" class="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm space-y-8 transition-colors">

        <div>
          <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 transition-colors">Logo Công ty</label>
          <div class="flex items-center gap-6">
            <div class="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 overflow-hidden shrink-0 transition-colors">
              <img v-if="form.logoUrl" :src="form.logoUrl" class="w-full h-full object-contain p-2" />
              <BaseIcon v-else :path="mdiHomeCityOutline" size="40" class="text-3xl text-slate-300 dark:text-slate-600 transition-colors"/>
            </div>
            <div>
              <input type="file" ref="fileInput" class="hidden" @change="uploadLogo" accept="image/*" />
              <button type="button" @click="$refs.fileInput.click()" :disabled="isUploading" class="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm disabled:opacity-50">
                {{ isUploading ? 'Đang tải lên...' : 'Tải Logo lên' }}
              </button>
              <p class="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium transition-colors">Hỗ trợ PNG, JPG (Nên dùng nền trong suốt). Tối đa 2MB.</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <div class="col-span-2">
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">Tên công ty xuất hóa đơn</label>
            <input v-model="form.companyName" type="text" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 outline-none transition-colors font-bold" required />
          </div>
          <div class="col-span-2">
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">Địa chỉ đăng ký kinh doanh</label>
            <input v-model="form.address" type="text" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 outline-none transition-colors font-medium" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">Mã số thuế</label>
            <input v-model="form.taxCode" type="text" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 outline-none transition-colors font-mono font-bold" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">Số điện thoại</label>
            <input v-model="form.phone" type="text" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 outline-none transition-colors font-medium" />
          </div>
          <div>
             <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">Email</label>
             <input v-model="form.email" type="text" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 outline-none transition-colors font-medium" />
          </div>
        </div>

        <div class="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-5 transition-colors">
          <h3 class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2 transition-colors">
            <span class="text-indigo-500 dark:text-indigo-400"><BaseIcon :path="mdiBank" size="22"/></span> Thông tin chuyển khoản
          </h3>
          <div class="grid grid-cols-2 gap-5">
             <div>
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">Tên Ngân Hàng</label>
              <input v-model="form.bankName" type="text" placeholder="VD: Vietcombank - CN Tân Bình" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 outline-none transition-colors font-medium" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">Số Tài Khoản</label>
              <input v-model="form.bankAccount" type="text" placeholder="0123456789" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 outline-none transition-colors font-mono font-bold" />
            </div>
            <div class="col-span-2">
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">Tên Người Thụ Hưởng</label>
              <input v-model="form.bankOwner" type="text" placeholder="CÔNG TY TNHH TASKFLOW" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 outline-none transition-colors font-bold uppercase" />
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-4">
          <button type="submit" :disabled="isSaving" class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-8 py-3.5 rounded-xl transition shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50">
            {{ isSaving ? 'Đang lưu...' : 'Lưu cài đặt' }}
          </button>
        </div>
      </form>
    </div>
  </AppLayout>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '@/components/common/AppLayout.vue'
import { useSettingStore } from '@/stores/setting.store.js'
import {mdiTimerSand , mdiHomeCityOutline ,mdiBank} from '@mdi/js'
import BaseIcon from '@/components/icon/BaseIcon.vue'
const settingStore = useSettingStore()
const form = ref(null)
const isUploading = ref(false)
const isSaving = ref(false)

onMounted(async () => {
  const data = await settingStore.fetchSettings()
  form.value = { ...data }
})

async function uploadLogo(e) {
  const file = e.target.files[0]
  if (!file) return

  isUploading.value = true
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)

  try {
    const response = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData })
    const data = await response.json()
    if (!response.ok) throw new Error('Upload failed')

    form.value.logoUrl = data.secure_url
  } catch (error) {
    alert('Lỗi tải ảnh lên!')
  } finally {
    isUploading.value = false
    e.target.value = '' // Reset input
  }
}

async function saveSettings() {
  isSaving.value = true
  try {
    await settingStore.updateSettings(form.value)
    alert('✅ Lưu cấu hình doanh nghiệp thành công!')
  } catch (error) {
    alert('Lỗi khi lưu cài đặt!')
  } finally {
    isSaving.value = false
  }
}
</script>
