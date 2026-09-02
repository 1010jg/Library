<script setup>
import { ref, computed } from "vue";
import { Book, Search, PlusCircle, Edit3, Trash2, X } from "lucide-vue-next";
import AppLayout from "../components/AppLayout.vue";
import { useLibraryStore } from "../store/library";

const store = useLibraryStore();

const searchQuery = ref("");
const categoryFilter = ref("ALL");

const categories = ["คอมพิวเตอร์", "วิทยาศาสตร์", "วรรณกรรม", "ประวัติศาสตร์", "ภาษาศาสตร์"];

const filteredBooks = computed(() =>
  store.books.filter((book) => {
    const q = searchQuery.value.toLowerCase().trim();
    const matchQuery =
      book.title.toLowerCase().includes(q) ||
      book.author.toLowerCase().includes(q) ||
      (book.isbn && book.isbn.toLowerCase().includes(q));
    const matchCategory = categoryFilter.value === "ALL" || book.category === categoryFilter.value;
    return matchQuery && matchCategory;
  })
);

/* Modal state */
const showModal = ref(false);
const editId = ref("");
const form = ref({ title: "", author: "", category: "คอมพิวเตอร์", isbn: "", total: 1 });

function openBookModal() {
  editId.value = "";
  form.value = { title: "", author: "", category: "คอมพิวเตอร์", isbn: "", total: 1 };
  showModal.value = true;
}

function editBook(book) {
  editId.value = book.id;
  form.value = { title: book.title, author: book.author, category: book.category, isbn: book.isbn, total: book.total };
  showModal.value = true;
}

function closeBookModal() {
  showModal.value = false;
}

async function saveBook() {
  if (editId.value) {
    await store.updateBook(editId.value, { ...form.value });
  } else {
    await store.addBook({ ...form.value });
  }
  closeBookModal();
}

async function deleteBook(id) {
  if (confirm(`คุณต้องการลบหนังสือรหัส ${id} ใช่หรือไม่?`)) {
    await store.deleteBook(id);
  }
}
</script>

<template>
  <AppLayout :icon="Book" page-title="จัดการหนังสือ">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-xl font-bold text-gray-800">คลังหนังสือทั้งหมด</h1>
        <p class="text-xs text-gray-500">จัดการข้อมูลหนังสือ, เพิ่มเล่มใหม่, ตรวจสอบสถานะคงเหลือ</p>
      </div>
      <button
        class="flex items-center gap-2 bg-[#143d8d] hover:bg-[#1a4ab0] text-white px-4 py-2.5 rounded-xl font-medium text-xs shadow-sm transition"
        @click="openBookModal"
      >
        <PlusCircle class="w-4 h-4" />
        <span>เพิ่มหนังสือใหม่</span>
      </button>
    </div>

    <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
      <div class="relative w-full sm:w-80">
        <Search class="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ค้นหาชื่อหนังสือ, ผู้แต่ง, ISBN..."
          class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
        />
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto">
        <label class="text-xs text-gray-500 whitespace-nowrap">หมวดหมู่:</label>
        <select v-model="categoryFilter" class="w-full sm:w-48 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none text-gray-700">
          <option value="ALL">ทั้งหมดทุกหมวดหมู่</option>
          <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="bg-gray-50/75 text-gray-500 border-b border-gray-100">
              <th class="py-3.5 px-4 font-semibold">รหัสหนังสือ</th>
              <th class="py-3.5 px-4 font-semibold">ชื่อหนังสือ</th>
              <th class="py-3.5 px-4 font-semibold">ผู้แต่ง</th>
              <th class="py-3.5 px-4 font-semibold">หมวดหมู่</th>
              <th class="py-3.5 px-4 font-semibold">ISBN</th>
              <th class="py-3.5 px-4 font-semibold text-center">คงเหลือ / ทั้งหมด</th>
              <th class="py-3.5 px-4 font-semibold text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-gray-700">
            <tr v-for="book in filteredBooks" :key="book.id" class="hover:bg-blue-50/40 transition">
              <td class="py-3 px-4 font-mono text-gray-500 font-medium">{{ book.id }}</td>
              <td class="py-3 px-4 font-semibold text-gray-900">{{ book.title }}</td>
              <td class="py-3 px-4 text-gray-600">{{ book.author }}</td>
              <td class="py-3 px-4">
                <span class="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[11px] font-medium border border-blue-100">
                  {{ book.category }}
                </span>
              </td>
              <td class="py-3 px-4 text-gray-500 font-mono text-[11px]">{{ book.isbn || "-" }}</td>
              <td class="py-3 px-4 text-center">
                <span v-if="book.available === 0" class="text-red-500 font-medium">หมด (0/{{ book.total }})</span>
                <span v-else class="text-gray-800 font-medium">{{ book.available }}/{{ book.total }}</span>
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="แก้ไข" @click="editBook(book)">
                    <Edit3 class="w-4 h-4" />
                  </button>
                  <button class="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="ลบ" @click="deleteBook(book.id)">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="filteredBooks.length === 0" class="text-center py-10 text-gray-400 text-xs">
        ไม่พบข้อมูลหนังสือตามเงื่อนไขที่ค้นหา
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div class="bg-[#143d8d] px-6 py-4 text-white flex justify-between items-center">
          <h3 class="font-bold text-sm">{{ editId ? `แก้ไขหนังสือ (${editId})` : "เพิ่มหนังสือใหม่" }}</h3>
          <button class="text-blue-200 hover:text-white" @click="closeBookModal"><X class="w-5 h-5" /></button>
        </div>

        <form class="p-6 space-y-3.5" @submit.prevent="saveBook">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">ชื่อหนังสือ <span class="text-red-500">*</span></label>
            <input v-model="form.title" type="text" required placeholder="ชื่อหนังสือ" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">ผู้แต่ง <span class="text-red-500">*</span></label>
              <input v-model="form.author" type="text" required placeholder="ชื่อผู้แต่ง" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">หมวดหมู่</label>
              <select v-model="form.category" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none text-gray-700">
                <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">ISBN</label>
              <input v-model="form.isbn" type="text" placeholder="978-xxx-xxx" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">จำนวนทั้งหมด (เล่ม) <span class="text-red-500">*</span></label>
              <input v-model.number="form.total" type="number" min="1" required class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none" />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button type="button" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-medium transition" @click="closeBookModal">
              ยกเลิก
            </button>
            <button type="submit" class="px-5 py-2 bg-[#143d8d] hover:bg-[#1a4ab0] text-white rounded-xl text-xs font-medium shadow-sm transition">
              บันทึกข้อมูล
            </button>
          </div>
        </form>
      </div>
    </div>
  </AppLayout>
</template>
