<template>
  <AppLayout>
    <div class="p-8 max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">Hóa đơn</h1>
          <p class="text-sm text-slate-500 mt-1">Quản lý chứng từ, theo dõi công nợ và doanh thu.</p>
        </div>
        <button
          v-if="authStore.isAdmin"
          @click="openCreate"
          class="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 hover:-translate-y-0.5"
        >
          + Tạo hóa đơn
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow group">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 text-xl font-black group-hover:scale-110 transition-transform"><BaseIcon :path="mdiTimerSand" size="20"/></div>
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Chờ thanh toán</p>
              <p class="text-2xl font-black text-amber-500">{{ formatMoney(totalByStatus('SENT')) }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow group">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 text-xl font-black group-hover:scale-110 transition-transform"><BaseIcon :path="mdiCashMultiple" size="20"/></div>
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Đã thanh toán</p>
              <p class="text-2xl font-black text-emerald-500">{{ formatMoney(totalByStatus('PAID')) }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow group">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 text-xl font-black group-hover:scale-110 transition-transform"><BaseIcon :path="mdiInvoiceCheck" size="20"/></div>
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tổng số hóa đơn</p>
              <p class="text-2xl font-black text-slate-800">{{ invoiceStore.invoices.length }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="invoiceStore.invoices.length === 0" class="flex flex-col items-center justify-center py-24 bg-white/50 rounded-3xl border border-dashed border-slate-300">
        <div class="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-4xl mb-4"><BaseIcon :path="mdiInvoiceList" size="35"/></div>
        <h3 class="text-lg font-bold text-slate-800">Chưa có hóa đơn nào</h3>
        <p class="text-slate-500 text-sm mt-1">Tạo hóa đơn đầu tiên để bắt đầu ghi nhận doanh thu.</p>
      </div>

      <div v-else class="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100">
                <th class="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Số HĐ</th>
                <th class="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Khách hàng</th>
                <th class="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Tổng tiền</th>
                <th class="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Trạng thái</th>
                <th class="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Ngày tạo</th>
                <th class="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="invoice in invoiceStore.invoices"
                :key="invoice.id"
                class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
              >
                <td class="px-6 py-4 text-sm font-black text-indigo-600">{{ invoice.invoiceNumber }}</td>
                <td class="px-6 py-4">
                  <p class="text-sm font-bold text-slate-800">{{ invoice.client?.company || invoice.client?.name }}</p>
                  <p v-if="invoice.project" class="text-[11px] font-semibold text-slate-400 mt-0.5"><BaseIcon :path="mdiFolder" size="20"/> {{ invoice.project.name }}</p>
                </td>
                <td class="px-6 py-4 text-sm font-black text-slate-800">
                  {{ formatMoney(invoice.total, invoice.client?.currency) }}
                </td>
                <td class="px-6 py-4">
                  <span
                    class="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border"
                    :class="{
                      'bg-slate-50 text-slate-500 border-slate-200': invoice.status === 'DRAFT',
                      'bg-amber-50 text-amber-600 border-amber-200': invoice.status === 'SENT',
                      'bg-emerald-50 text-emerald-600 border-emerald-200': invoice.status === 'PAID'
                    }"
                  >
                    {{ statusLabel(invoice.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm font-medium text-slate-500">
                  {{ new Date(invoice.createdAt).toLocaleDateString('vi-VN') }}
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-1.5" v-if="authStore.isAdmin">
                    <button v-if="invoice.status === 'DRAFT'" @click="handleSend(invoice.id)" class="text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition font-black">Chốt & Gửi</button>
                    <button v-if="invoice.status !== 'DRAFT'" @click="openView(invoice)" class="text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition font-black">Xem lại</button>
                    <button v-if="invoice.status === 'SENT'" @click="handleMarkPaid(invoice.id)" class="text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition font-black">Đã thu tiền</button>
                    <button v-if="invoice.status === 'DRAFT'" @click="openEdit(invoice)" class="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-blue-500 hover:bg-blue-50 transition"><BaseIcon :path="mdiPencil" size="20"/></button>
                    <button v-if="invoice.status === 'DRAFT'" @click="handleDelete(invoice.id)" class="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-rose-500 hover:bg-rose-50 transition"><BaseIcon :path="mdiTrashCan" size="20"/></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4 backdrop-blur-sm py-10" @click.self="showModal = false">
      <div class="bg-white rounded-3xl w-full max-w-4xl shadow-2xl max-h-full overflow-y-auto custom-scrollbar flex flex-col">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20 rounded-t-3xl">
          <h3 class="text-xl font-black text-slate-900 flex items-center gap-2">
            <span class="text-indigo-500"><BaseIcon :path="mdiInvoice" size="20"/></span>
            {{ isViewing ? 'Chi tiết Hóa đơn' : (editingInvoice ? 'Chỉnh sửa Hóa đơn' : 'Tạo hóa đơn mới') }}
          </h3>
          <button @click="closeModal" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 font-bold text-xl transition">&times;</button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-8 space-y-6 flex-1 overflow-y-auto">
          <fieldset :disabled="isViewing" class="space-y-8 border-0 p-0 m-0">

            <div class="grid grid-cols-2 gap-6 p-6 bg-slate-50 border border-slate-100 rounded-2xl">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Khách hàng xuất HĐ *</label>
                <select v-model="form.clientId" @change="form.projectId = ''" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition text-sm font-semibold bg-white text-slate-700" required>
                  <option value="">-- Chọn khách hàng --</option>
                  <option v-for="client in clientStore.clients" :key="client.id" :value="client.id">{{ client.company || client.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Gắn với Dự án (Tùy chọn)</label>
                <select v-model="form.projectId" :disabled="!form.clientId" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition text-sm font-semibold disabled:bg-slate-100 bg-white text-slate-700">
                  <option value="">-- Không gắn dự án --</option>
                  <option v-for="p in availableProjects" :key="p.id" :value="p.id">{{ p.name }}</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-5">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mẫu số</label>
                <input v-model="form.formSymbol" type="text" placeholder="1C26T" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition text-sm font-medium" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Ký hiệu</label>
                <input v-model="form.invoiceSymbol" type="text" placeholder="YY/26E" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition text-sm font-medium" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">HT Thanh toán</label>
                <select v-model="form.paymentMethod" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition text-sm font-bold bg-white text-slate-700">
                  <option value="CK">Chuyển khoản (CK)</option>
                  <option value="TM">Tiền mặt (TM)</option>
                  <option value="TM/CK">TM / CK</option>
                </select>
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <label class="block text-sm font-black text-slate-800 uppercase tracking-wider">Hàng hóa / Dịch vụ</label>
                <button type="button" @click="addLineItem" class="text-xs text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 hover:bg-indigo-100 transition px-3 py-2 rounded-lg flex items-center gap-1">
                  <span>+</span> Thêm dòng
                </button>
              </div>

              <div class="space-y-3">
                <div class="grid grid-cols-12 gap-3 px-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <div class="col-span-5">Tên dịch vụ</div>
                  <div class="col-span-2 text-center">Đơn vị</div>
                  <div class="col-span-1 text-center">SL</div>
                  <div class="col-span-3 text-right pr-2">Đơn giá</div>
                </div>

                <div v-for="(item, index) in form.lineItems" :key="index" class="grid grid-cols-12 gap-3 items-center group">
                  <input v-model="item.name" placeholder="Thiết kế UI/UX..." class="col-span-5 px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition text-sm font-medium" required />
                  <input v-model="item.unit" placeholder="Gói" class="col-span-2 px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition text-sm text-center font-medium" required />
                  <input v-model.number="item.quantity" type="number" min="1" class="col-span-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition text-sm text-center font-bold" required />
                  <input v-model.number="item.unitPrice" type="number" min="0" :step="priceStep" class="col-span-3 px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition text-sm font-mono font-bold text-right" required />

                  <button type="button" @click="removeLineItem(index)" class="col-span-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 w-10 h-10 rounded-xl text-lg flex justify-center items-center transition opacity-50 group-hover:opacity-100">
                    🗑
                  </button>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-8 items-start border-t border-slate-100 pt-8">
              <div class="space-y-5">
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Hạn thanh toán</label>
                  <input v-model="form.dueDate" type="date" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition text-sm font-medium text-slate-600" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Ghi chú</label>
                  <textarea v-model="form.notes" rows="3" placeholder="Vui lòng chuyển khoản vào STK..." class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition text-sm resize-none font-medium"></textarea>
                </div>
              </div>

              <div class="bg-indigo-50/50 rounded-3xl p-6 border border-indigo-100 space-y-4 shadow-sm">
                <div class="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-indigo-50">
                  <span class="text-sm font-black text-slate-700 uppercase tracking-wider">Thuế VAT (%)</span>
                  <input v-model.number="form.taxRate" type="number" min="0" max="100" class="w-20 px-3 py-1.5 rounded-lg border border-slate-200 text-center outline-none text-sm font-bold focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
                </div>

                <div class="space-y-2 pt-2 px-2">
                  <div class="flex justify-between text-sm font-semibold text-slate-500">
                    <span>Tạm tính</span>
                    <span>{{ formatMoney(subtotal) }}</span>
                  </div>
                  <div class="flex justify-between text-sm font-semibold text-slate-500">
                    <span>Thuế VAT</span>
                    <span>{{ formatMoney(tax) }}</span>
                  </div>
                </div>

                <div class="flex justify-between items-center text-xl font-black text-indigo-600 border-t-2 border-indigo-100 pt-4 px-2">
                  <span>TỔNG CỘNG</span>
                  <span>{{ formatMoney(total) }}</span>
                </div>
              </div>
            </div>

          </fieldset>

          <div class="flex gap-4 pt-6 border-t border-slate-100 sticky bottom-0 bg-white pb-2">
            <button type="button" @click="closeModal" class="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition">
              {{ isViewing ? 'Đóng cửa sổ' : 'Hủy bỏ' }}
            </button>
            <button
              v-if="isViewing"
              type="button"
              @click="downloadPDF"
              class="flex-1 py-3.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold transition flex justify-center items-center gap-2 border border-red-100"
            >
              <BaseIcon :path="mdiFilePdfBox" size="20"/> Tải bản in PDF
            </button>
            <button v-if="!isViewing" type="submit" :disabled="loading" class="flex-1 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition shadow-md hover:shadow-lg disabled:opacity-50">
              {{ loading ? 'Hệ thống đang xử lý...' : (editingInvoice ? 'Cập nhật Hóa Đơn' : 'Lưu & Tạo Hóa Đơn') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </AppLayout>
    <div class="absolute left-[-9999px] top-[-9999px] opacity-0 pointer-events-none">
        <div ref="invoicePdfRef" class="p-8" style="width: 190mm; background-color: #ffffff; color: #1e293b;">
          <div class="border-b-2 pb-6 mb-8" style="border-color: #1e293b;">
                  <div class="text-center mb-8">
                    <h1 class="text-4xl font-black tracking-widest uppercase" style="color: #4338ca;">HÓA ĐƠN DỊCH VỤ</h1>
                  </div>

                  <div class="space-y-4">
                    <div class="space-y-1.5 text-left">
                      <h2 class="text-xl font-black uppercase tracking-wide" style="color: #1e293b;">{{ settingStore.settings?.companyName }}</h2>
                      <p class="text-sm" style="color: #475569;"><span class="font-bold" style="color: #1e293b;">Địa chỉ:</span> {{ settingStore.settings?.address }}</p>
                      <p class="text-sm" style="color: #475569;"><span class="font-bold" style="color: #1e293b;">Mã số thuế:</span> {{ settingStore.settings?.taxCode }}</p>
                      <p class="text-sm" style="color: #475569;"><span class="font-bold" style="color: #1e293b;">Email:</span> {{ settingStore.settings?.email }}</p>
                      <p class="text-sm" style="color: #475569;"><span class="font-bold" style="color: #1e293b;">Mã hóa đơn:</span> {{ editingInvoice?.invoiceNumber }}</p>
                      <p class="text-sm" style="color: #475569;"><span class="font-bold" style="color: #1e293b;">Ngày lập:</span> {{ new Date().toLocaleDateString('vi-VN') }}</p>
                    </div>
                  </div>
                </div>

          <div class="flex justify-between mb-8">
            <div class="w-1/2">
              <h3 class="text-xs font-bold uppercase mb-2" style="color: #94a3b8;">Khách hàng:</h3>
              <p class="font-bold text-lg">{{ editingInvoice?.client?.company || editingInvoice?.client?.name }}</p>
              <p class="text-sm">Đ/c: {{ editingInvoice?.client?.address || '..................................' }}</p>
              <p class="text-sm">MST: {{ editingInvoice?.client?.taxCode || '..................................' }}</p>
            </div>
            <div class="w-1/3 space-y-1 text-sm">
              <div class="flex justify-between"><span class="font-bold">Mẫu số:</span> <span>{{ form.formSymbol }}</span></div>
              <div class="flex justify-between"><span class="font-bold">Ký hiệu:</span> <span>{{ form.invoiceSymbol }}</span></div>
              <div class="flex justify-between"><span class="font-bold">HTTT:</span> <span>{{ form.paymentMethod }}</span></div>
              <div class="flex justify-between"><span class="font-bold">Hạn TT:</span> <span>{{ form.dueDate ? new Date(form.dueDate).toLocaleDateString('vi-VN') : 'Không có' }}</span></div>
            </div>
          </div>

          <table class="w-full mb-8 border-collapse">
            <thead>
              <tr style="background-color: #eef2ff;">
                <th class="border py-3 px-4 text-left text-sm font-bold" style="border-color: #cbd5e1;">STT</th>
                <th class="border py-3 px-4 text-left text-sm font-bold" style="border-color: #cbd5e1;">Tên Dịch Vụ</th>
                <th class="border py-3 px-4 text-center text-sm font-bold" style="border-color: #cbd5e1;">ĐVT</th>
                <th class="border py-3 px-4 text-center text-sm font-bold" style="border-color: #cbd5e1;">SL</th>
                <th class="border py-3 px-4 text-right text-sm font-bold" style="border-color: #cbd5e1;">Đơn giá</th>
                <th class="border py-3 px-4 text-right text-sm font-bold" style="border-color: #cbd5e1;">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in form.lineItems" :key="index">
                <td class="border py-3 px-4 text-center text-sm" style="border-color: #cbd5e1;">{{ index + 1 }}</td>
                <td class="border py-3 px-4 text-sm font-semibold" style="border-color: #cbd5e1;">{{ item.name }}</td>
                <td class="border py-3 px-4 text-center text-sm" style="border-color: #cbd5e1;">{{ item.unit }}</td>
                <td class="border py-3 px-4 text-center text-sm" style="border-color: #cbd5e1;">{{ item.quantity }}</td>
                <td class="border py-3 px-4 text-right text-sm" style="border-color: #cbd5e1;">{{ formatMoney(item.unitPrice, editingInvoice?.client?.currency) }}</td>
                <td class="border py-3 px-4 text-right text-sm" style="border-color: #cbd5e1;">{{ formatMoney(item.quantity * item.unitPrice, editingInvoice?.client?.currency) }}</td>
              </tr>
            </tbody>
          </table>

          <div class="flex justify-end mb-8">
            <div class="w-1/2 space-y-2">
              <div class="flex justify-between text-sm"><span class="font-bold">Cộng tiền dịch vụ:</span> <span>{{ formatMoney(subtotal, editingInvoice?.client?.currency) }}</span></div>
              <div class="flex justify-between text-sm"><span class="font-bold">Thuế GTGT ({{ form.taxRate }}%):</span> <span>{{ formatMoney(tax, editingInvoice?.client?.currency) }}</span></div>
              <div class="flex justify-between text-lg font-black pt-2 mt-2 border-t-2" style="border-color: #e2e8f0; color: #4338ca;">
                <span>Tổng thanh toán:</span> <span>{{ formatMoney(total, editingInvoice?.client?.currency) }}</span>
              </div>
            </div>
          </div>

          <div class="text-sm italic mb-12" style="color: #64748b;">
            <p class="font-bold mb-1">Ghi chú:</p>
            <p class="whitespace-pre-wrap">{{ form.notes || 'Không có ghi chú thêm.' }}</p>
          </div>

          <div class="flex justify-around text-center pt-8">
            <div>
              <p class="font-bold" style="color: #1e293b;">Khách hàng</p>
              <p class="text-xs italic" style="color: #64748b;">(Ký, ghi rõ họ tên)</p>
            </div>
            <div>
              <p class="font-bold" style="color: #1e293b;">Người lập phiếu</p>
              <p class="text-xs italic" style="color: #64748b;">(Ký, đóng dấu)</p>
            </div>
          </div>

        </div>
      </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store.js'
import { useInvoiceStore } from '@/stores/invoice.store.js'
import { useClientStore } from '@/stores/client.store.js'
import { useProjectStore } from '@/stores/project.store.js'
import AppLayout from '@/components/common/AppLayout.vue'
import { useSettingStore } from '@/stores/setting.store.js'
import { mdiTimerSand , mdiCashMultiple , mdiInvoiceCheck , mdiInvoice, mdiInvoiceList , mdiFolder , mdiPencil , mdiTrashCan , mdiFilePdfBox} from '@mdi/js'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import html2pdf from 'html2pdf.js'
const router = useRouter()
const authStore = useAuthStore()
const invoiceStore = useInvoiceStore()
const clientStore = useClientStore()
const projectStore = useProjectStore()
const editingInvoice = ref(null)
const invoicePdfRef = ref(null)
const showModal = ref(false)
const loading = ref(false)
const isViewing = ref(false)
const defaultForm = {
  clientId: '', projectId: '', dueDate: '', taxRate: 0,
  formSymbol: '1C26T', invoiceSymbol: 'YY/26E', paymentMethod: 'CK', notes: '', terms: '',
  lineItems: [{ name: '', unit: 'Gói', quantity: 1, unitPrice: 0 }]
}
const form = ref(JSON.parse(JSON.stringify(defaultForm)))
const settingStore = useSettingStore()
onMounted(() => {
  invoiceStore.fetchInvoices()
  clientStore.fetchClients()
  projectStore.fetchProjects()
  settingStore.fetchSettings()
})

const availableProjects = computed(() => {
  if (!form.value.clientId) return []
  return projectStore.projects.filter(p => p.clientId === form.value.clientId)
})

const subtotal = computed(() => form.value.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0))
const tax = computed(() => (subtotal.value * form.value.taxRate) / 100)
const total = computed(() => subtotal.value + tax.value)
const currentCurrency = computed(() => {
  if (!form.value.clientId) return 'VND'
  const client = clientStore.clients.find(c => c.id === form.value.clientId)
  return client?.currency || 'VND'
})
const priceStep = computed(() => {
  return currentCurrency.value === 'VND' ? '100000' : '10'
})
function formatMoney(amount, currencyCode = 'VND') {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currencyCode }).format(amount || 0)
}

function totalByStatus(status) {
  return invoiceStore.invoices
    .filter(i => i.status === status)
    .reduce((sum, i) => sum + Number(i.total), 0)
}

function statusLabel(status) {
  return { DRAFT: 'Bản nháp', SENT: 'Đã gửi (Chờ thu)', PAID: 'Hoàn tất thu' }[status] || status
}

function addLineItem() {
  form.value.lineItems.push({ name: '', unit: 'Gói', quantity: 1, unitPrice: 0 })
}

function removeLineItem(index) {
  if (form.value.lineItems.length > 1) {
    form.value.lineItems.splice(index, 1)
  }
}

async function handleSubmit() {
 loading.value = true
   try {
     const payload = { ...form.value }
     payload.lineItems = payload.lineItems.map(item => ({
       ...item, amount: item.quantity * item.unitPrice
     }))

     if (editingInvoice.value) {
       await invoiceStore.updateInvoice(editingInvoice.value.id, payload)
     } else {
       await invoiceStore.createInvoice(payload)
     }

     closeModal()
   } catch (err) {
     alert(err.response?.data?.message || 'Lỗi khi lưu hóa đơn')
   } finally {
     loading.value = false
   }
}

async function handleSend(id) {
  if (!confirm('Chốt hóa đơn này và gửi cho Khách hàng? (Sẽ không thể sửa chữa sau khi gửi)')) return;
  await invoiceStore.sendInvoice(id)
}

async function handleMarkPaid(id) {
  if (!confirm('Xác nhận đã nhận đủ tiền cho hóa đơn này?')) return;
  await invoiceStore.markAsPaid(id)
}

async function handleDelete(id) {
  if (!confirm('Xóa bản nháp hóa đơn này?')) return
  await invoiceStore.deleteInvoice(id)
}
function openCreate() {
  isViewing.value = false
  editingInvoice.value = null
  form.value = JSON.parse(JSON.stringify(defaultForm))
  showModal.value = true
}
function openEdit(invoice) {
  isViewing.value = false
  editingInvoice.value = invoice
  form.value = {
    clientId: invoice.clientId,
    projectId: invoice.projectId || '',
    dueDate: invoice.dueDate ? invoice.dueDate.split('T')[0] : '',
    taxRate: Number(invoice.taxRate) || 0,
    formSymbol: invoice.formSymbol || '',
    invoiceSymbol: invoice.invoiceSymbol || '',
    paymentMethod: invoice.paymentMethod || 'CK',
    notes: invoice.notes || '',
    terms: invoice.terms || '',
    lineItems: JSON.parse(JSON.stringify(invoice.lineItems))
  }
  showModal.value = true
}
function openView(invoice) {
  isViewing.value = true
  editingInvoice.value = invoice
  form.value = {
    clientId: invoice.clientId,
    projectId: invoice.projectId || '',
    dueDate: invoice.dueDate ? invoice.dueDate.split('T')[0] : '',
    taxRate: Number(invoice.taxRate) || 0,
    formSymbol: invoice.formSymbol || '',
    invoiceSymbol: invoice.invoiceSymbol || '',
    paymentMethod: invoice.paymentMethod || 'CK',
    notes: invoice.notes || '',
    terms: invoice.terms || '',
    lineItems: JSON.parse(JSON.stringify(invoice.lineItems))
  }
  showModal.value = true
}
function closeModal() {
  showModal.value = false
  isViewing.value = false
  editingInvoice.value = null
  form.value = JSON.parse(JSON.stringify(defaultForm))
}
function downloadPDF() {
  const element = invoicePdfRef.value
  const opt = {
    margin:       10, // Margin 10mm
    filename:     `Hoa-don-${editingInvoice.value.invoiceNumber}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, windowWidth :800 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }
  loading.value = true
  html2pdf().set(opt).from(element).save().then(() => {
    loading.value = false
  })
}
</script>
