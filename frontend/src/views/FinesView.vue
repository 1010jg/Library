<script setup>
import { ref, computed } from "vue";
import { Receipt, Search, PlusCircle, AlertCircle, CheckCircle2, FileText, Printer, X } from "lucide-vue-next";
import AppLayout from "../components/AppLayout.vue";
import { useLibraryStore } from "../store/library";

const store = useLibraryStore();

const searchQuery = ref("");
const statusFilter = ref("ALL");

const filteredFines = computed(() =>
  store.fines
    .filter((item) => {
      const q = searchQuery.value.toLowerCase().trim();
      const matchQuery =
        item.id.toLowerCase().includes(q) ||
        item.memberName.toLowerCase().includes(q) ||
        item.reason.toLowerCase().includes(q);
      const matchStatus = statusFilter.value === "ALL" || item.status === statusFilter.value;
      return matchQuery && matchStatus;
    })
    .slice()
    .reverse()
);

/* Modal: create fine */
const showModal = ref(false);
const form = ref({ memberName: "", reason: "ส่งคืนหนังสือเกินกำหนด", amount: 10 });
const reasons = [
  "ส่งคืนหนังสือเกินกำหนด",
  "หนังสือชำรุดเสียหายเล็กน้อย",
  "หนังสือสูญหาย",
  "ค่าธรรมเนียมทำบัตรใหม่"
];

function openFineModal() {
  if (store.members.length === 0) {
    alert("กรุณาเพิ่มสมาชิกในระบบก่อนสร้างรายการค่าปรับ");
    return;
  }
  form.value = { memberName: store.members[0].name, reason: reasons[0], amount: 10 };
  showModal.value = true;
}

function closeFineModal() {
  showModal.value = false;
}

async function saveFine() {
  await store.createFine({ ...form.value });
  alert("บันทึกรายการค่าปรับเรียบร้อยแล้ว!");
  closeFineModal();
}

async function payFine(id) {
  if (confirm(`ยืนยันการรับชำระเงินสำหรับรายการ ${id} ?`)) {
    await store.payFine(id);
    alert("รับชำระเงินเรียบร้อยแล้ว!");
  }
}

/* Receipt modal */
const showReceipt = ref(false);
const receipt = ref({});

function viewReceipt(fine) {
  receipt.value = {
    id: fine.id,
    date: fine.date,
    member: fine.memberName,
    reason: fine.reason,
    amount: `฿${Number(fine.amount).toLocaleString()} บาท`,
    staff: store.currentUser?.name || "บรรณารักษ์"
  };
  showReceipt.value = true;
}
function closeReceiptModal() {
  showReceipt.value = false;
}
</script>

<template>
  <AppLayout :icon="Receipt" page-title="จัดการค่าปรับ">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-xl font-bold text-gray-800">รายการค่าปรับและชำระเงิน</h1>
        <p class="text-xs text-gray-500">บันทึกค่าปรับการส่งคืนเกินกำหนด หนังสือชำรุด และพิมพ์ใบเสร็จ</p>
      </div>
      <button
        class="flex items-center gap-2 bg-[#143d8d] hover:bg-[#1a4ab0] text-white px-4 py-2.5 rounded-xl font-medium text-xs shadow-sm transition"
        @click="openFineModal"
      >
        <PlusCircle class="w-4 h-4" />
        <span>สร้างรายการค่าปรับ</span>
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs text-gray-400 font-medium">ยอดค้างชำระทั้งหมด</span>
          <div class="text-2xl font-bold text-red-600 mt-1">฿{{ store.unpaidFinesTotal.toLocaleString() }}</div>
          <span class="text-[11px] text-red-500 font-medium">รอการชำระ</span>
        </div>
        <div class="p-3 bg-red-50 text-red-600 rounded-xl"><AlertCircle class="w-6 h-6" /></div>
      </div>

      <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs text-gray-400 font-medium">ยอดชำระแล้วทั้งหมด</span>
          <div class="text-2xl font-bold text-emerald-600 mt-1">฿{{ store.paidFinesTotal.toLocaleString() }}</div>
          <span class="text-[11px] text-emerald-600 font-medium">เข้ากองทุนห้องสมุด</span>
        </div>
        <div class="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 class="w-6 h-6" /></div>
      </div>

      <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs text-gray-400 font-medium">รายการทั้งหมด</span>
          <div class="text-2xl font-bold text-gray-800 mt-1">{{ store.fines.length }}</div>
          <span class="text-[11px] text-blue-600 font-medium">รายการบันทึก</span>
        </div>
        <div class="p-3 bg-blue-50 text-blue-600 rounded-xl"><FileText class="w-6 h-6" /></div>
      </div>
    </div>

    <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
      <div class="relative w-full sm:w-80">
        <Search class="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ค้นหารหัส, สมาชิก, หรือสาเหตุ..."
          class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
        />
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto">
        <label class="text-xs text-gray-500 whitespace-nowrap">สถานะ:</label>
        <select v-model="statusFilter" class="w-full sm:w-44 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none text-gray-700">
          <option value="ALL">ทั้งหมด</option>
          <option value="ค้างชำระ">ค้างชำระ</option>
          <option value="ชำระแล้ว">ชำระแล้ว</option>
        </select>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="bg-gray-50/75 text-gray-500 border-b border-gray-100">
              <th class="py-3.5 px-4 font-semibold">รหัสค่าปรับ</th>
              <th class="py-3.5 px-4 font-semibold">สมาชิก</th>
              <th class="py-3.5 px-4 font-semibold">สาเหตุค่าปรับ</th>
              <th class="py-3.5 px-4 font-semibold">วันที่บันทึก</th>
              <th class="py-3.5 px-4 font-semibold text-right">จำนวนเงิน (บาท)</th>
              <th class="py-3.5 px-4 font-semibold text-center">สถานะ</th>
              <th class="py-3.5 px-4 font-semibold text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-gray-700">
            <tr v-for="item in filteredFines" :key="item.id" class="hover:bg-blue-50/40 transition">
              <td class="py-3 px-4 font-mono text-gray-500 font-medium">{{ item.id }}</td>
              <td class="py-3 px-4 font-semibold text-gray-900">{{ item.memberName }}</td>
              <td class="py-3 px-4 text-gray-700">{{ item.reason }}</td>
              <td class="py-3 px-4 text-gray-500 font-mono text-[11px]">{{ item.date }}</td>
              <td class="py-3 px-4 text-right font-mono font-semibold text-gray-900">฿{{ Number(item.amount).toLocaleString() }}</td>
              <td class="py-3 px-4 text-center">
                <span
                  class="px-2.5 py-0.5 rounded-full text-[11px]"
                  :class="item.status === 'ชำระแล้ว' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100 font-semibold'"
                >
                  {{ item.status }}
                </span>
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end">
                  <button
                    v-if="item.status === 'ชำระแล้ว'"
                    class="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition flex items-center gap-1"
                    @click="viewReceipt(item)"
                  >
                    <Printer class="w-3.5 h-3.5" /> ใบเสร็จ
                  </button>
                  <button
                    v-else
                    class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition shadow-sm"
                    @click="payFine(item.id)"
                  >
                    รับชำระเงิน
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="filteredFines.length === 0" class="text-center py-10 text-gray-400 text-xs">
        ไม่พบรายการค่าปรับตามเงื่อนไข
      </div>
    </div>

    <!-- Create fine modal -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div class="bg-[#143d8d] px-6 py-4 text-white flex justify-between items-center">
          <h3 class="font-bold text-sm">สร้างรายการค่าปรับ</h3>
          <button class="text-blue-200 hover:text-white" @click="closeFineModal"><X class="w-5 h-5" /></button>
        </div>

        <form class="p-6 space-y-3.5" @submit.prevent="saveFine">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">เลือกสมาชิก <span class="text-red-500">*</span></label>
            <select v-model="form.memberName" required class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none">
              <option v-for="m in store.members" :key="m.id" :value="m.name">{{ m.name }} ({{ m.id }})</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">สาเหตุค่าปรับ <span class="text-red-500">*</span></label>
            <select v-model="form.reason" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none">
              <option value="ส่งคืนหนังสือเกินกำหนด">ส่งคืนหนังสือเกินกำหนด (วันละ {{ store.policy.finePerDay }} บาท)</option>
              <option v-for="r in reasons.slice(1)" :key="r" :value="r">{{ r }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">จำนวนเงินค่าปรับ (บาท) <span class="text-red-500">*</span></label>
            <input v-model.number="form.amount" type="number" min="5" step="5" required class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none font-mono" />
          </div>

          <div class="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button type="button" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-medium transition" @click="closeFineModal">
              ยกเลิก
            </button>
            <button type="submit" class="px-5 py-2 bg-[#143d8d] hover:bg-[#1a4ab0] text-white rounded-xl text-xs font-medium shadow-sm transition">
              บันทึกรายการ
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Receipt modal -->
    <div v-if="showReceipt" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div id="printableReceipt" class="p-6 bg-white text-gray-800">
          <div class="text-center border-b pb-4 mb-4">
            <h2 class="font-bold text-base text-gray-900">ใบเสร็จรับเงินค่าปรับ</h2>
            <p class="text-xs text-gray-500">ระบบจัดการห้องสมุดดิจิทัล</p>
          </div>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between"><span class="text-gray-500">เลขที่ใบเสร็จ:</span> <span class="font-mono font-semibold">{{ receipt.id }}</span></div>
            <div class="flex justify-between"><span class="text-gray-500">วันที่ชำระ:</span> <span>{{ receipt.date }}</span></div>
            <div class="flex justify-between"><span class="text-gray-500">ชื่อสมาชิก:</span> <span class="font-semibold">{{ receipt.member }}</span></div>
            <div class="flex justify-between"><span class="text-gray-500">รายการ:</span> <span>{{ receipt.reason }}</span></div>
            <div class="border-t pt-2 mt-2 flex justify-between text-sm font-bold">
              <span>ยอดชำระสุทธิ:</span>
              <span class="text-blue-600 font-mono">{{ receipt.amount }}</span>
            </div>
            <div class="flex justify-between text-[11px] text-gray-500 pt-1">
              <span>เจ้าหน้าที่ผู้รับเงิน:</span>
              <span>{{ receipt.staff }}</span>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-end gap-2">
          <button class="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-medium transition" @click="closeReceiptModal">ปิด</button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
