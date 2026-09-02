<script setup>
import { ref, computed } from "vue";
import { RefreshCw, Search, Plus, X } from "lucide-vue-next";
import AppLayout from "../components/AppLayout.vue";
import { useLibraryStore } from "../store/library";

const store = useLibraryStore();

const searchQuery = ref("");
const statusFilter = ref("ALL");

const filteredBorrows = computed(() =>
  store.borrows
    .filter((item) => {
      const q = searchQuery.value.toLowerCase().trim();
      const matchQuery =
        item.id.toLowerCase().includes(q) ||
        item.memberName.toLowerCase().includes(q) ||
        item.bookTitle.toLowerCase().includes(q);
      const matchStatus = statusFilter.value === "ALL" || item.status === statusFilter.value;
      return matchQuery && matchStatus;
    })
    .slice()
    .reverse()
);

function badgeClass(status) {
  if (status === "เกินกำหนด") return "bg-red-50 text-red-600 border border-red-100 font-semibold";
  if (status === "คืนแล้ว") return "bg-emerald-50 text-emerald-600 border border-emerald-100";
  return "bg-blue-50 text-blue-600 border border-blue-100";
}

function formatDateThai(d) {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear() + 543;
  return `${day}/${month}/${year}`;
}

/* Modal */
const showModal = ref(false);
const form = ref({ memberName: "", bookTitle: "", borrowDate: "", returnDate: "" });

const activeMembers = computed(() => store.members.filter((m) => m.status === "active"));
const availableBooks = computed(() => store.books.filter((b) => b.available > 0));

function openBorrowModal() {
  if (activeMembers.value.length === 0) {
    alert("ไม่มีสมาชิกที่มีสถานะปกติ กรุณาเพิ่มสมาชิกก่อน");
    return;
  }
  if (availableBooks.value.length === 0) {
    alert("ไม่มีหนังสือคงเหลือพร้อมให้ยืมในขณะนี้");
    return;
  }

  const today = new Date();
  const dueDate = new Date();
  dueDate.setDate(today.getDate() + (store.policy.borrowDays || 14));

  form.value = {
    memberName: activeMembers.value[0].name,
    bookTitle: availableBooks.value[0].title,
    borrowDate: formatDateThai(today),
    returnDate: formatDateThai(dueDate)
  };
  showModal.value = true;
}

function closeBorrowModal() {
  showModal.value = false;
}

async function saveBorrow() {
  const result = await store.createBorrow({ ...form.value });
  alert(`บันทึกการยืมสำเร็จ! กำหนดคืนภายในวันที่ ${result.returnDate}`);
  closeBorrowModal();
}

async function returnBook(item) {
  if (confirm(`ยืนยันการรับคืนหนังสือ "${item.bookTitle}" ?`)) {
    await store.returnBorrow(item.id);
    alert("รับคืนหนังสือเรียบร้อยแล้ว!");
  }
}
</script>

<template>
  <AppLayout :icon="RefreshCw" page-title="จัดการยืม-คืน">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-xl font-bold text-gray-800">บันทึกรายการยืม-คืนหนังสือ</h1>
        <p class="text-xs text-gray-500">ทำรายการยืมหนังสือใหม่ และกดรับคืนหนังสือเข้าสู่คลัง</p>
      </div>
      <button
        class="flex items-center gap-2 bg-[#143d8d] hover:bg-[#1a4ab0] text-white px-4 py-2.5 rounded-xl font-medium text-xs shadow-sm transition"
        @click="openBorrowModal"
      >
        <Plus class="w-4 h-4" />
        <span>ทำรายการยืมหนังสือ</span>
      </button>
    </div>

    <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
      <div class="relative w-full sm:w-80">
        <Search class="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ค้นหารหัส, ชื่อสมาชิก, หรือหนังสือ..."
          class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
        />
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto">
        <label class="text-xs text-gray-500 whitespace-nowrap">สถานะ:</label>
        <select v-model="statusFilter" class="w-full sm:w-44 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none text-gray-700">
          <option value="ALL">ทั้งหมดทุกสถานะ</option>
          <option value="กำลังยืม">กำลังยืม</option>
          <option value="เกินกำหนด">เกินกำหนด</option>
          <option value="คืนแล้ว">คืนแล้ว</option>
        </select>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="bg-gray-50/75 text-gray-500 border-b border-gray-100">
              <th class="py-3.5 px-4 font-semibold">รหัสยืม</th>
              <th class="py-3.5 px-4 font-semibold">ชื่อสมาชิก</th>
              <th class="py-3.5 px-4 font-semibold">หนังสือ</th>
              <th class="py-3.5 px-4 font-semibold">วันที่ยืม</th>
              <th class="py-3.5 px-4 font-semibold">กำหนดคืน</th>
              <th class="py-3.5 px-4 font-semibold text-center">สถานะ</th>
              <th class="py-3.5 px-4 font-semibold text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-gray-700">
            <tr v-for="item in filteredBorrows" :key="item.id" class="hover:bg-blue-50/40 transition">
              <td class="py-3 px-4 font-mono text-gray-500 font-medium">{{ item.id }}</td>
              <td class="py-3 px-4 font-semibold text-gray-900">{{ item.memberName }}</td>
              <td class="py-3 px-4 text-gray-700">{{ item.bookTitle }}</td>
              <td class="py-3 px-4 text-gray-500 font-mono text-[11px]">{{ item.borrowDate }}</td>
              <td class="py-3 px-4 text-gray-500 font-mono text-[11px]">{{ item.returnDate }}</td>
              <td class="py-3 px-4 text-center">
                <span class="px-2.5 py-0.5 rounded-full text-[11px]" :class="badgeClass(item.status)">{{ item.status }}</span>
              </td>
              <td class="py-3 px-4 text-right">
                <button
                  v-if="item.status === 'กำลังยืม' || item.status === 'เกินกำหนด'"
                  class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition shadow-sm"
                  @click="returnBook(item)"
                >
                  กดคืนหนังสือ
                </button>
                <span v-else class="text-gray-400 text-xs">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="filteredBorrows.length === 0" class="text-center py-10 text-gray-400 text-xs">
        ไม่พบรายการยืม-คืนตามเงื่อนไข
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div class="bg-[#143d8d] px-6 py-4 text-white flex justify-between items-center">
          <h3 class="font-bold text-sm">ทำรายการยืมหนังสือ</h3>
          <button class="text-blue-200 hover:text-white" @click="closeBorrowModal"><X class="w-5 h-5" /></button>
        </div>

        <form class="p-6 space-y-3.5" @submit.prevent="saveBorrow">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">เลือกสมาชิกผู้ยืม <span class="text-red-500">*</span></label>
            <select v-model="form.memberName" required class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none">
              <option v-for="m in activeMembers" :key="m.id" :value="m.name">{{ m.name }} ({{ m.id }})</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">เลือกหนังสือที่ต้องการยืม <span class="text-red-500">*</span></label>
            <select v-model="form.bookTitle" required class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none">
              <option v-for="b in availableBooks" :key="b.id" :value="b.title">{{ b.title }} [คงเหลือ {{ b.available }} เล่ม]</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">วันที่ยืม</label>
              <input :value="form.borrowDate" readonly class="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-xs text-gray-600 focus:outline-none font-mono" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">กำหนดคืน (+{{ store.policy.borrowDays }} วัน)</label>
              <input :value="form.returnDate" readonly class="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-xs text-blue-700 font-semibold focus:outline-none font-mono" />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button type="button" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-medium transition" @click="closeBorrowModal">
              ยกเลิก
            </button>
            <button type="submit" class="px-5 py-2 bg-[#143d8d] hover:bg-[#1a4ab0] text-white rounded-xl text-xs font-medium shadow-sm transition">
              ยืนยันการยืม
            </button>
          </div>
        </form>
      </div>
    </div>
  </AppLayout>
</template>
