<template>
  <AppLayout>
    <div class="p-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white transition-colors">Dashboard</h1>
          <p class="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm mt-1 transition-colors">
            Xin chào, {{ authStore.user?.fullName }}  <BaseIcon :path="mdiHandClap" size="22"/>
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-all">
          <div class="flex items-center justify-between mb-4">
            <div class="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-lg transition-colors">
               <BaseIcon :path="mdiCashMultiple" size="22"/>
            </div>
            <span class="text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full transition-colors">Đã thu</span>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-400 mb-1 transition-colors">Tổng Doanh thu</p>
          <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 transition-colors">{{ formatMoney(kpi.totalRevenue) }}</p>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-all">
          <div class="flex items-center justify-between mb-4">
            <div class="w-9 h-9 bg-amber-300 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-700 dark:text-amber-400 text-lg transition-colors">
               <BaseIcon :path="mdiTimerSand" size="22"/>
            </div>
            <span class="text-xs font-semibold bg-amber-200 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full transition-colors">Chờ thu tiền</span>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-400 mb-1 transition-colors">Công nợ</p>
          <p class="text-2xl font-bold text-amber-500 dark:text-amber-400 transition-colors">{{ formatMoney(kpi.pendingRevenue) }}</p>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-all">
          <div class="flex items-center justify-between mb-4">
            <div class="w-9 h-9 bg-blue-200 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-lg transition-colors">
               <BaseIcon :path="mdiRocketLaunch" size="22"/>
            </div>
            <span class="text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full transition-colors">Active</span>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-400 mb-1 transition-colors">Dự án đang chạy</p>
          <p class="text-2xl font-bold text-indigo-600 dark:text-indigo-400 transition-colors">{{ kpi.activeProjects }}</p>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-all">
          <div class="flex items-center justify-between mb-4">
            <div class="w-9 h-9 bg-orange-200 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400 text-lg transition-colors">
               <BaseIcon :path="mdiClipboardAccount" size="22"/>
            </div>
            <span class="text-xs font-semibold bg-orange-200 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-full transition-colors">Total</span>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-400 mb-1 transition-colors">Khách hàng</p>
          <p class="text-2xl font-bold text-orange-500 dark:text-orange-400 transition-colors">{{ kpi.totalClients }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm lg:col-span-2 transition-colors">
          <h2 class="font-semibold text-slate-800 dark:text-white mb-4 transition-colors">Biến động Doanh thu (6 Tháng)</h2>
          <div class="h-[280px]">
            <VueApexCharts
              v-if="!loading"
              type="bar"
              height="100%"
              :options="revenueChartOptions"
              :series="revenueChartSeries"
            />
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm transition-colors">
          <h2 class="font-semibold text-slate-800 dark:text-white mb-4 transition-colors">Tỷ lệ Hóa đơn</h2>
          <div class="h-[280px] flex items-center justify-center">
            <VueApexCharts
              v-if="!loading"
              type="donut"
              height="100%"
              :options="statusChartOptions"
              :series="statusChartSeries"
            />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-full transition-colors">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 transition-colors">
            <h2 class="flex items-center gap-2 font-semibold text-slate-800 dark:text-white transition-colors">
              <BaseIcon :path="mdiHistory" size="25 "/>Dự án gần đây
            </h2>
            <RouterLink to="/projects" class="text-xs text-indigo-500 dark:text-indigo-400 hover:underline font-medium transition-colors">Xem tất cả</RouterLink>
          </div>

          <div v-if="projectStore.projects.length === 0" class="flex-1 flex flex-col justify-center items-center py-12 text-slate-400 dark:text-slate-500 text-sm transition-colors">
            Chưa có dự án nào.
            <RouterLink to="/projects" class="text-indigo-500 dark:text-indigo-400 mt-1 hover:underline font-bold transition-colors">Tạo ngay</RouterLink>
          </div>

          <div v-else class="flex-1">
            <div
              v-for="project in projectStore.projects.slice(0, 5)"
              :key="project.id"
              @click="router.push(`/projects/${project.id}`)"
              class="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 cursor-pointer transition-colors last:border-0"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm transition-colors">
                  {{ project.name.charAt(0) }}
                </div>
                <div>
                  <p class="text-sm font-medium text-slate-800 dark:text-white transition-colors">{{ project.name }}</p>
                  <p class="text-xs text-slate-400 dark:text-slate-500 transition-colors">{{ project._count?.tasks || 0 }} tasks</p>
                </div>
              </div>
              <span
                class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition-colors"
                :class="project.status === 'ACTIVE' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'"
              >
                {{ project.status }}
              </span>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-full transition-colors">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 rounded-t-xl transition-colors">
            <h2 class="flex items-center gap-2 font-semibold text-slate-800 dark:text-white transition-colors">
              <BaseIcon :path="mdiTrophyAward" size="25" class="text-amber-500" />
              Top Khách hàng
            </h2>
          </div>

          <div v-if="topClients.length === 0" class="flex-1 flex justify-center items-center py-12 text-slate-400 dark:text-slate-500 text-sm transition-colors">
            Chưa có dữ liệu thanh toán.
          </div>

          <div v-else class="flex-1">
            <div
              v-for="(client, index) in topClients"
              :key="client.id"
              class="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors last:border-0"
            >
              <div class="flex items-center gap-4">
                <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors"
                  :class="index === 0 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : (index === 1 ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400' : (index === 2 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' : 'bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-500'))"
                >
                  {{ index + 1 }}
                </span>
                <div>
                  <p class="text-sm font-semibold text-slate-700 dark:text-white transition-colors">{{ client.company || client.name }}</p>
                  <p class="text-xs text-slate-400 dark:text-slate-500 transition-colors">{{ client.invoiceCount }} Hóa đơn</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-black text-emerald-600 dark:text-emerald-400 text-sm transition-colors">{{ formatMoney(client.totalSpent) }}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store.js'
import { useProjectStore } from '@/stores/project.store.js'
import { useInvoiceStore } from '@/stores/invoice.store.js'
import { useClientStore } from '@/stores/client.store.js'
import { mdiTimerSand , mdiCashMultiple , mdiHandClap , mdiRocketLaunch, mdiClipboardAccount , mdiTrophyAward , mdiHistory} from '@mdi/js'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import AppLayout from '@/components/common/AppLayout.vue'
import VueApexCharts from 'vue3-apexcharts'
import { useThemeStore } from '@/stores/theme.store.js'

const router = useRouter()
const authStore = useAuthStore()
const projectStore = useProjectStore()
const invoiceStore = useInvoiceStore()
const clientStore = useClientStore()
const themeStore = useThemeStore()
const loading = ref(true)

onMounted(async () => {
  await Promise.all([
    projectStore.fetchProjects(),
    invoiceStore.fetchInvoices(),
    clientStore.fetchClients()
  ])
  loading.value = false
})

function formatMoney(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0)
}

const kpi = computed(() => {
  const invoices = invoiceStore.invoices
  return {
    totalRevenue: invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + Number(i.total), 0),
    pendingRevenue: invoices.filter(i => i.status === 'SENT').reduce((sum, i) => sum + Number(i.total), 0),
    activeProjects: projectStore.projects.filter(p => p.status === 'ACTIVE').length,
    totalClients: clientStore.clients.length
  }
})

const revenueChartSeries = computed(() => {
  const monthlyData = [0, 0, 0, 0, 0, 0]
  const currentDate = new Date()

  invoiceStore.invoices
    .filter(i => i.status === 'PAID' || i.status === 'SENT')
    .forEach(inv => {
      const invDate = new Date(inv.createdAt)
      const monthDiff = (currentDate.getFullYear() - invDate.getFullYear()) * 12 + (currentDate.getMonth() - invDate.getMonth())

      if (monthDiff >= 0 && monthDiff < 6) {
        monthlyData[5 - monthDiff] += Number(inv.total)
      }
    })

  return [{ name: 'Doanh thu', data: monthlyData }]
})

const revenueChartOptions = computed(() => {
  const categories = []
  const d = new Date()
  for (let i = 5; i >= 0; i--) {
    const tempDate = new Date(d.getFullYear(), d.getMonth() - i, 1)
    categories.push(`Tháng ${tempDate.getMonth() + 1}`)
  }

  return {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: 'inherit',
      foreColor: themeStore.isDark ? '#cbd5e1' : '#64748b'
    },
    colors: ['#6366f1'],
    plotOptions: { bar: { borderRadius: 6, columnWidth: '40%' } },
    dataLabels: { enabled: false },
    xaxis: { categories, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: {
      labels: { formatter: (val) => new Intl.NumberFormat('vi-VN', { notation: "compact", compactDisplay: "short" }).format(val) }
    },
    grid: {
      borderColor: themeStore.isDark ? '#334155' : '#f8fafc',
      strokeDashArray: 4
    },
    tooltip: {
      theme: themeStore.isDark ? 'dark' : 'light',
      y: { formatter: (val) => formatMoney(val) }
    }
  }
})

const statusChartSeries = computed(() => {
  const counts = { DRAFT: 0, SENT: 0, PAID: 0 }
  invoiceStore.invoices.forEach(i => {
    if (counts[i.status] !== undefined) counts[i.status]++
  })
  return [counts.DRAFT, counts.SENT, counts.PAID]
})

const statusChartOptions = computed(() => {
  return {
    chart: {
      type: 'donut',
      fontFamily: 'inherit',
      foreColor: themeStore.isDark ? '#cbd5e1' : '#64748b'
    },
    labels: ['Bản nháp', 'Chờ thu tiền', 'Đã thu'],
    colors: [themeStore.isDark ? '#64748b' : '#cbd5e1', '#f59e0b', '#10b981'],
    plotOptions: { pie: { donut: { size: '75%' } } },
    dataLabels: { enabled: false },
    legend: { position: 'bottom', markers: { radius: 12 } },
    stroke: {
      width: 2,
      colors: [themeStore.isDark ? '#1e293b' : '#ffffff']
    },
    tooltip: {
      theme: themeStore.isDark ? 'dark' : 'light'
    }
  }
})

const topClients = computed(() => {
  const clientStats = {}

  invoiceStore.invoices.forEach(inv => {
    if (inv.status !== 'PAID') return

    if (!clientStats[inv.clientId]) {
      const clientObj = clientStore.clients.find(c => c.id === inv.clientId)
      if (!clientObj) return

      clientStats[inv.clientId] = {
        ...clientObj,
        totalSpent: 0,
        invoiceCount: 0
      }
    }
    clientStats[inv.clientId].totalSpent += Number(inv.total)
    clientStats[inv.clientId].invoiceCount += 1
  })

  return Object.values(clientStats)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5)
})
</script>
