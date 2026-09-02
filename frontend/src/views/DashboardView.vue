<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { Home, BookCopy, Users, Bookmark, CornerDownLeft, Plus } from "lucide-vue-next";
import AppLayout from "../components/AppLayout.vue";
import { useLibraryStore } from "../store/library";

const store = useLibraryStore();

const currentDateText = ref("");
const currentTimeText = ref("");
let clockTimer = null;

function updateClock() {
  const now = new Date();
  currentTimeText.value = now.toLocaleTimeString("th-TH");
  currentDateText.value = now.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
}

onMounted(() => {
  updateClock();
  clockTimer = setInterval(updateClock, 1000);
});
onUnmounted(() => clearInterval(clockTimer));

const searchQuery = ref("");
const filteredBooks = computed(() =>
  store.books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
);

const recentBorrows = computed(() => store.borrows.slice(-5).reverse());

function badgeClass(status) {
  if (status === "เกินกำหนด") return "bg-red-50 text-red-500 font-medium";
  if (status === "คืนแล้ว") return "bg-emerald-50 text-emerald-600";
  return "bg-blue-50 text-blue-600";
}

/* เพิ่มหนังสือใหม่แบบรวดเร็ว */
const newBook = ref({ title: "", author: "", category: "คอมพิวเตอร์", isbn: "", total: 1 });

async function handleQuickAddBook() {
  if (!newBook.value.title.trim() || !newBook.value.author.trim()) return;
  await store.addBook({ ...newBook.value });
  alert("เพิ่มหนังสือใหม่สำเร็จ!");
  newBook.value = { title: "", author: "", category: "คอมพิวเตอร์", isbn: "", total: 1 };
}
</script>

<template>
  <AppLayout :icon="Home" page-title="หน้าหลัก">
    <div class="bg-[#194098] rounded-2xl p-5 text-white flex justify-between items-center shadow-sm">
      <div>
        <h1 class="text-lg font-bold">สวัสดี, {{ store.currentUser?.name }}</h1>
        <p class="text-xs text-blue-100 font-light mt-1">
          มีหนังสือเกินกำหนดคืน
          <router-link to="/fines" class="text-orange-300 font-medium hover:underline">{{ store.overdueCount }} รายการ</router-link>
          และรายการยืมทั้งหมด
          <router-link to="/borrow-return" class="text-orange-300 font-medium hover:underline">{{ store.borrowingCount }} รายการ</router-link>
        </p>
      </div>
      <div class="text-right">
        <div class="text-xs font-light text-blue-100">{{ currentDateText }}</div>
        <div class="text-sm font-semibold tracking-wider">{{ currentTimeText }}</div>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <router-link to="/books" class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition">
        <div class="flex justify-between items-start">
          <span class="text-xs text-gray-500 font-medium">หนังสือทั้งหมด</span>
          <div class="p-2 rounded-xl bg-purple-50 text-purple-600"><BookCopy class="w-4 h-4" /></div>
        </div>
        <div class="mt-2">
          <div class="text-xl font-bold text-gray-900">{{ store.totalBooksCount.toLocaleString() }}</div>
          <div class="text-[11px] text-gray-400 mt-0.5">เล่ม</div>
        </div>
      </router-link>

      <router-link to="/members" class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition">
        <div class="flex justify-between items-start">
          <span class="text-xs text-gray-500 font-medium">สมาชิก</span>
          <div class="p-2 rounded-xl bg-orange-50 text-orange-500"><Users class="w-4 h-4" /></div>
        </div>
        <div class="mt-2">
          <div class="text-xl font-bold text-gray-900">{{ store.members.length.toLocaleString() }}</div>
          <div class="text-[11px] text-gray-400 mt-0.5">คน</div>
        </div>
      </router-link>

      <router-link to="/borrow-return" class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition">
        <div class="flex justify-between items-start">
          <span class="text-xs text-gray-500 font-medium">ยืมออก</span>
          <div class="p-2 rounded-xl bg-indigo-50 text-indigo-500"><Bookmark class="w-4 h-4" /></div>
        </div>
        <div class="mt-2">
          <div class="text-xl font-bold text-gray-900">{{ store.borrowingCount.toLocaleString() }}</div>
          <div class="text-[11px] text-gray-400 mt-0.5">เล่ม</div>
        </div>
      </router-link>

      <router-link to="/borrow-return" class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition">
        <div class="flex justify-between items-start">
          <span class="text-xs text-gray-500 font-medium">คืนแล้ว</span>
          <div class="p-2 rounded-xl bg-emerald-50 text-emerald-500"><CornerDownLeft class="w-4 h-4" /></div>
        </div>
        <div class="mt-2">
          <div class="text-xl font-bold text-gray-900">{{ store.returnedCount.toLocaleString() }}</div>
          <div class="text-[11px] text-gray-400 mt-0.5">เล่ม</div>
        </div>
      </router-link>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div class="lg:col-span-5 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-center pb-3 border-b border-gray-100">
            <h2 class="font-bold text-gray-800 text-sm">เพิ่มหนังสือใหม่</h2>
            <span class="text-xs text-gray-400 font-light">บันทึกข้อมูลเข้าสู่ระบบจริง</span>
          </div>

          <form class="space-y-3 mt-4" @submit.prevent="handleQuickAddBook">
            <div>
              <label class="block text-xs text-gray-600 mb-1">ชื่อหนังสือ <span class="text-red-500">*</span></label>
              <input v-model="newBook.title" type="text" required placeholder="ชื่อหนังสือ" class="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-600 mb-1">ผู้แต่ง <span class="text-red-500">*</span></label>
                <input v-model="newBook.author" type="text" required placeholder="ชื่อผู้แต่ง" class="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none" />
              </div>
              <div>
                <label class="block text-xs text-gray-600 mb-1">หมวดหมู่</label>
                <select v-model="newBook.category" class="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none text-gray-700">
                  <option value="คอมพิวเตอร์">คอมพิวเตอร์</option>
                  <option value="วิทยาศาสตร์">วิทยาศาสตร์</option>
                  <option value="วรรณกรรม">วรรณกรรม</option>
                  <option value="ประวัติศาสตร์">ประวัติศาสตร์</option>
                  <option value="ภาษาศาสตร์">ภาษาศาสตร์</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-600 mb-1">ISBN</label>
                <input v-model="newBook.isbn" type="text" placeholder="เช่น 978-616-..." class="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none" />
              </div>
              <div>
                <label class="block text-xs text-gray-600 mb-1">จำนวน (เล่ม)</label>
                <input v-model.number="newBook.total" type="number" min="1" class="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none text-gray-700" />
              </div>
            </div>

            <button type="submit" class="w-full mt-4 bg-[#143d8d] hover:bg-[#1a4ab0] text-white py-2.5 rounded-xl font-medium text-xs shadow-sm transition">
              + เพิ่มหนังสือเข้าสู่ระบบ
            </button>
          </form>
        </div>
      </div>

      <div class="lg:col-span-7 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-center pb-3 border-b border-gray-100">
            <h2 class="font-bold text-gray-800 text-sm">รายการยืม-คืนล่าสุด</h2>
            <router-link to="/borrow-return" class="flex items-center gap-1 text-xs bg-[#143d8d] hover:bg-[#1a4ab0] text-white px-3 py-1.5 rounded-xl transition shadow-sm">
              <Plus class="w-3.5 h-3.5" />
              <span>ทำรายการยืม-คืน</span>
            </router-link>
          </div>

          <div class="overflow-x-auto mt-2">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="text-gray-400 border-b border-gray-50 font-normal">
                  <th class="py-2.5 font-normal">สมาชิก</th>
                  <th class="py-2.5 font-normal">หนังสือ</th>
                  <th class="py-2.5 font-normal">วันยืม</th>
                  <th class="py-2.5 font-normal">กำหนดคืน</th>
                  <th class="py-2.5 font-normal text-right">สถานะ</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50 text-gray-700">
                <tr v-for="item in recentBorrows" :key="item.id">
                  <td class="py-2.5 font-normal">{{ item.memberName }}</td>
                  <td class="py-2.5 text-gray-600">{{ item.bookTitle }}</td>
                  <td class="py-2.5 text-gray-500">{{ item.borrowDate }}</td>
                  <td class="py-2.5 text-gray-500">{{ item.returnDate }}</td>
                  <td class="py-2.5 text-right">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px]" :class="badgeClass(item.status)">{{ item.status }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-gray-100">
        <div>
          <h2 class="font-bold text-gray-800 text-sm">รายการหนังสือทั้งหมด</h2>
          <p class="text-xs text-gray-400 font-light">แสดงรายการหนังสือทั้งหมดที่อยู่ในระบบ</p>
        </div>
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <input v-model="searchQuery" type="text" placeholder="ค้นหาชื่อหนังสือ..." class="w-full sm:w-64 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none" />
          <router-link to="/books" class="text-xs text-blue-600 font-medium hover:underline whitespace-nowrap">ดูหน้าจัดการเต็ม &rarr;</router-link>
        </div>
      </div>

      <div class="overflow-x-auto mt-2">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="text-gray-400 border-b border-gray-50 font-normal">
              <th class="py-2.5 font-normal">รหัส</th>
              <th class="py-2.5 font-normal">ชื่อหนังสือ</th>
              <th class="py-2.5 font-normal">ผู้แต่ง</th>
              <th class="py-2.5 font-normal">หมวดหมู่</th>
              <th class="py-2.5 font-normal text-center">คงเหลือ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 text-gray-700">
            <tr v-for="book in filteredBooks" :key="book.id">
              <td class="py-2.5 font-mono text-gray-400">{{ book.id }}</td>
              <td class="py-2.5 font-medium text-gray-900">{{ book.title }}</td>
              <td class="py-2.5 text-gray-500">{{ book.author }}</td>
              <td class="py-2.5"><span class="px-2 py-0.5 bg-gray-100 rounded text-[11px] text-gray-600">{{ book.category }}</span></td>
              <td class="py-2.5 text-center font-semibold text-gray-800">{{ book.available }}/{{ book.total }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppLayout>
</template>
