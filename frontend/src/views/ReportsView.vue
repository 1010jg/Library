<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { BarChart2, Book, Clock, Users, CheckCircle, Printer } from "lucide-vue-next";
import Chart from "chart.js/auto";
import AppLayout from "../components/AppLayout.vue";
import { useLibraryStore } from "../store/library";

const store = useLibraryStore();

const totalBooksCount = computed(() => store.books.reduce((sum, b) => sum + (b.total || 0), 0));
const activeBorrowsCount = computed(
  () => store.borrows.filter((b) => b.status === "กำลังยืม" || b.status === "เกินกำหนด").length
);
const returnedBorrowsCount = computed(() => store.borrows.filter((b) => b.status === "คืนแล้ว").length);
const returnRate = computed(() =>
  store.borrows.length > 0 ? Math.round((returnedBorrowsCount.value / store.borrows.length) * 100) : 0
);

const recentBorrows = computed(() => store.borrows.slice(-10).reverse());

function badgeClass(status) {
  if (status === "เกินกำหนด") return "bg-red-50 text-red-600 border border-red-100 font-semibold";
  if (status === "คืนแล้ว") return "bg-emerald-50 text-emerald-600 border border-emerald-100";
  return "bg-blue-50 text-blue-600 border border-blue-100";
}

const categoryCanvas = ref(null);
const statusCanvas = ref(null);
let categoryChart = null;
let statusChart = null;

function renderCharts() {
  const categoryCounts = {};
  store.books.forEach((b) => {
    categoryCounts[b.category] = (categoryCounts[b.category] || 0) + (b.total || 1);
  });
  const catLabels = Object.keys(categoryCounts);
  const catData = Object.values(categoryCounts);

  if (categoryChart) categoryChart.destroy();
  categoryChart = new Chart(categoryCanvas.value.getContext("2d"), {
    type: "doughnut",
    data: {
      labels: catLabels.length ? catLabels : ["ไม่มีข้อมูล"],
      datasets: [
        {
          data: catData.length ? catData : [1],
          backgroundColor: ["#2563eb", "#38bdf8", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899"],
          borderWidth: 2,
          borderColor: "#ffffff"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom", labels: { boxWidth: 12, font: { family: "Prompt", size: 11 } } } }
    }
  });

  const statusCounts = {
    กำลังยืม: store.borrows.filter((b) => b.status === "กำลังยืม").length,
    เกินกำหนด: store.borrows.filter((b) => b.status === "เกินกำหนด").length,
    คืนแล้ว: store.borrows.filter((b) => b.status === "คืนแล้ว").length
  };

  if (statusChart) statusChart.destroy();
  statusChart = new Chart(statusCanvas.value.getContext("2d"), {
    type: "bar",
    data: {
      labels: ["กำลังยืม", "เกินกำหนด", "คืนแล้ว"],
      datasets: [
        {
          label: "จำนวนรายการ",
          data: [statusCounts["กำลังยืม"], statusCounts["เกินกำหนด"], statusCounts["คืนแล้ว"]],
          backgroundColor: ["#3b82f6", "#ef4444", "#10b981"],
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1, font: { family: "Prompt" } } },
        x: { ticks: { font: { family: "Prompt" } } }
      },
      plugins: { legend: { display: false } }
    }
  });
}

onMounted(async () => {
  await nextTick();
  renderCharts();
});

watch(
  () => [store.books, store.borrows],
  async () => {
    await nextTick();
    if (categoryCanvas.value && statusCanvas.value) renderCharts();
  },
  { deep: true }
);
</script>

<template>
  <AppLayout :icon="BarChart2" page-title="รายงานและสถิติ">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-xl font-bold text-gray-800">รายงานสรุปผลการดำเนินงาน</h1>
        <p class="text-xs text-gray-500">ภาพรวมสถิติการใช้งานห้องสมุด การยืม-คืน และทรัพยากรหนังสือ</p>
      </div>
      <button class="no-print flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-xl font-medium text-xs shadow-sm transition" @click="window.print()">
        <Printer class="w-4 h-4" />
        <span>พิมพ์รายงาน / ส่งออก PDF</span>
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs text-gray-400 font-medium">หนังสือทั้งหมด</span>
          <div class="text-2xl font-bold text-gray-800 mt-1">{{ totalBooksCount }}</div>
          <span class="text-[11px] text-blue-600 font-medium">เล่มในระบบ</span>
        </div>
        <div class="p-3 bg-blue-50 text-blue-600 rounded-xl"><Book class="w-6 h-6" /></div>
      </div>

      <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs text-gray-400 font-medium">กำลังถูกยืม</span>
          <div class="text-2xl font-bold text-amber-600 mt-1">{{ activeBorrowsCount }}</div>
          <span class="text-[11px] text-amber-600 font-medium">รายการ</span>
        </div>
        <div class="p-3 bg-amber-50 text-amber-600 rounded-xl"><Clock class="w-6 h-6" /></div>
      </div>

      <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs text-gray-400 font-medium">สมาชิกทั้งหมด</span>
          <div class="text-2xl font-bold text-gray-800 mt-1">{{ store.members.length }}</div>
          <span class="text-[11px] text-emerald-600 font-medium">คน</span>
        </div>
        <div class="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Users class="w-6 h-6" /></div>
      </div>

      <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <span class="text-xs text-gray-400 font-medium">คืนหนังสือสำเร็จ</span>
          <div class="text-2xl font-bold text-indigo-600 mt-1">{{ returnRate }}%</div>
          <span class="text-[11px] text-indigo-600 font-medium">อัตราคืนสำเร็จ</span>
        </div>
        <div class="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><CheckCircle class="w-6 h-6" /></div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
        <h2 class="text-sm font-bold text-gray-800 self-start mb-4">สัดส่วนหนังสือตามหมวดหมู่</h2>
        <div class="w-full max-w-[280px] h-[280px]">
          <canvas ref="categoryCanvas"></canvas>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
        <h2 class="text-sm font-bold text-gray-800 mb-4">สถิติสถานะรายการยืม-คืน</h2>
        <div class="w-full flex-1 min-h-[260px]">
          <canvas ref="statusCanvas"></canvas>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h2 class="text-sm font-bold text-gray-800">ประวัติการทำรายการล่าสุด (10 รายการล่าสุด)</h2>
        <router-link to="/borrow-return" class="no-print text-xs text-blue-600 hover:underline">ดูทั้งหมด →</router-link>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="bg-gray-50/75 text-gray-500 border-b border-gray-100">
              <th class="py-3 px-4 font-semibold">รหัสยืม</th>
              <th class="py-3 px-4 font-semibold">ชื่อสมาชิก</th>
              <th class="py-3 px-4 font-semibold">หนังสือ</th>
              <th class="py-3 px-4 font-semibold">วันที่ยืม</th>
              <th class="py-3 px-4 font-semibold">กำหนดคืน</th>
              <th class="py-3 px-4 font-semibold text-center">สถานะ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-gray-700">
            <tr v-if="recentBorrows.length === 0">
              <td colspan="6" class="text-center py-6 text-gray-400">ยังไม่มีประวัติการทำรายการ</td>
            </tr>
            <tr v-for="item in recentBorrows" :key="item.id" class="hover:bg-blue-50/40 transition">
              <td class="py-2.5 px-4 font-mono text-gray-500">{{ item.id }}</td>
              <td class="py-2.5 px-4 font-medium text-gray-900">{{ item.memberName }}</td>
              <td class="py-2.5 px-4 text-gray-700">{{ item.bookTitle }}</td>
              <td class="py-2.5 px-4 text-gray-500 font-mono text-[11px]">{{ item.borrowDate }}</td>
              <td class="py-2.5 px-4 text-gray-500 font-mono text-[11px]">{{ item.returnDate }}</td>
              <td class="py-2.5 px-4 text-center">
                <span class="px-2 py-0.5 rounded-full text-[10px]" :class="badgeClass(item.status)">{{ item.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppLayout>
</template>
