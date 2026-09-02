<script setup>
import { ref, computed } from "vue";
import { Users, Search, UserPlus, Edit3, Trash2, X } from "lucide-vue-next";
import AppLayout from "../components/AppLayout.vue";
import { useLibraryStore } from "../store/library";

const store = useLibraryStore();

const searchQuery = ref("");
const statusFilter = ref("ALL");

const filteredMembers = computed(() =>
  store.members.filter((member) => {
    const q = searchQuery.value.toLowerCase().trim();
    const matchQuery =
      member.name.toLowerCase().includes(q) ||
      (member.phone && member.phone.includes(q)) ||
      (member.email && member.email.toLowerCase().includes(q));
    const matchStatus = statusFilter.value === "ALL" || member.status === statusFilter.value;
    return matchQuery && matchStatus;
  })
);

const showModal = ref(false);
const editId = ref("");
const form = ref({ name: "", phone: "", email: "", status: "active" });

function openMemberModal() {
  editId.value = "";
  form.value = { name: "", phone: "", email: "", status: "active" };
  showModal.value = true;
}

function editMember(member) {
  editId.value = member.id;
  form.value = { name: member.name, phone: member.phone, email: member.email, status: member.status || "active" };
  showModal.value = true;
}

function closeMemberModal() {
  showModal.value = false;
}

async function saveMember() {
  if (editId.value) {
    await store.updateMember(editId.value, { ...form.value });
  } else {
    await store.addMember({ ...form.value });
  }
  closeMemberModal();
}

async function deleteMember(id) {
  if (confirm(`คุณต้องการลบสมาชิก ${id} ใช่หรือไม่?`)) {
    await store.deleteMember(id);
  }
}
</script>

<template>
  <AppLayout :icon="Users" page-title="จัดการสมาชิก">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-xl font-bold text-gray-800">รายชื่อสมาชิกห้องสมุด</h1>
        <p class="text-xs text-gray-500">จัดการข้อมูลผู้มีสิทธิ์ยืม-คืนหนังสือและประวัติสมาชิก</p>
      </div>
      <button
        class="flex items-center gap-2 bg-[#143d8d] hover:bg-[#1a4ab0] text-white px-4 py-2.5 rounded-xl font-medium text-xs shadow-sm transition"
        @click="openMemberModal"
      >
        <UserPlus class="w-4 h-4" />
        <span>เพิ่มสมาชิกใหม่</span>
      </button>
    </div>

    <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
      <div class="relative w-full sm:w-80">
        <Search class="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ค้นหาชื่อ, เบอร์โทร, หรืออีเมล..."
          class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
        />
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto">
        <label class="text-xs text-gray-500 whitespace-nowrap">สถานะ:</label>
        <select v-model="statusFilter" class="w-full sm:w-44 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none text-gray-700">
          <option value="ALL">ทั้งหมดทุกสถานะ</option>
          <option value="active">ปกติ (Active)</option>
          <option value="suspended">ระงับสิทธิ์ชั่วคราว</option>
        </select>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="bg-gray-50/75 text-gray-500 border-b border-gray-100">
              <th class="py-3.5 px-4 font-semibold">รหัสสมาชิก</th>
              <th class="py-3.5 px-4 font-semibold">ชื่อ-นามสกุล</th>
              <th class="py-3.5 px-4 font-semibold">เบอร์โทรศัพท์</th>
              <th class="py-3.5 px-4 font-semibold">อีเมล</th>
              <th class="py-3.5 px-4 font-semibold text-center">สถานะการใช้งาน</th>
              <th class="py-3.5 px-4 font-semibold text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-gray-700">
            <tr v-for="member in filteredMembers" :key="member.id" class="hover:bg-blue-50/40 transition">
              <td class="py-3 px-4 font-mono text-gray-500 font-medium">{{ member.id }}</td>
              <td class="py-3 px-4 font-semibold text-gray-900">{{ member.name }}</td>
              <td class="py-3 px-4 text-gray-600">{{ member.phone || "-" }}</td>
              <td class="py-3 px-4 text-gray-600 font-mono text-[11px]">{{ member.email || "-" }}</td>
              <td class="py-3 px-4 text-center">
                <span v-if="member.status === 'active'" class="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[11px] font-medium border border-emerald-100">ปกติ</span>
                <span v-else class="px-2.5 py-0.5 bg-red-50 text-red-600 rounded-full text-[11px] font-medium border border-red-100">ระงับสิทธิ์</span>
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="แก้ไข" @click="editMember(member)">
                    <Edit3 class="w-4 h-4" />
                  </button>
                  <button class="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="ลบ" @click="deleteMember(member.id)">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="filteredMembers.length === 0" class="text-center py-10 text-gray-400 text-xs">
        ไม่พบรายชื่อสมาชิกตามเงื่อนไขที่ค้นหา
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div class="bg-[#143d8d] px-6 py-4 text-white flex justify-between items-center">
          <h3 class="font-bold text-sm">{{ editId ? `แก้ไขข้อมูล (${editId})` : "เพิ่มสมาชิกใหม่" }}</h3>
          <button class="text-blue-200 hover:text-white" @click="closeMemberModal"><X class="w-5 h-5" /></button>
        </div>

        <form class="p-6 space-y-3.5" @submit.prevent="saveMember">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">ชื่อ-นามสกุล <span class="text-red-500">*</span></label>
            <input v-model="form.name" type="text" required placeholder="ชื่อ-นามสกุล" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">เบอร์โทรศัพท์ (สูงสุด 10 หลัก)</label>
            <input
              v-model="form.phone"
              type="tel"
              maxlength="10"
              placeholder="เช่น 0812345678"
              class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
              @input="form.phone = (form.phone || '').replace(/[^0-9]/g, '').slice(0, 10)"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">อีเมล</label>
            <input v-model="form.email" type="email" placeholder="member@email.com" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">สถานะการใช้งาน</label>
            <select v-model="form.status" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none">
              <option value="active">ปกติ (Active)</option>
              <option value="suspended">ระงับสิทธิ์ชั่วคราว</option>
            </select>
          </div>

          <div class="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button type="button" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-medium transition" @click="closeMemberModal">
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
