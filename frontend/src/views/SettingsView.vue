<script setup>
import { ref, computed, watch, onMounted } from "vue";
import {
  Settings,
  UserCheck,
  Sliders,
  Trash2,
  Save,
  Users,
  UserPlus,
  Edit2,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Search,
  X,
  Phone,
  Mail,
  User
} from "lucide-vue-next";
import AppLayout from "../components/AppLayout.vue";
import { useLibraryStore } from "../store/library";
import { LIBRARY_ROLES } from "../constants/roles";

const store = useLibraryStore();

onMounted(async () => {
  await store.fetchStaff();
});

// Profile Form
const profileForm = ref({
  name: store.currentUser?.name || "",
  email: store.currentUser?.email || "",
  role: store.currentUser?.role || "บรรณารักษ์"
});

// Policy Form
const policyForm = ref({ ...store.policy });

// Staff Management (Admin only)
const staffSearch = ref("");
const showStaffModal = ref(false);
const editingStaff = ref(null);
const staffForm = ref({
  name: "",
  email: "",
  role: "บรรณารักษ์",
  phone: ""
});

watch(
  () => store.currentUser,
  (u) => {
    if (u) {
      profileForm.value = {
        name: u.name || "",
        email: u.email || "",
        role: u.role || "บรรณารักษ์"
      };
    }
  },
  { immediate: true }
);

watch(
  () => store.policy,
  (p) => {
    policyForm.value = { ...p };
  },
  { immediate: true }
);

// Filtered Staff
const filteredStaff = computed(() => {
  if (!store.staff) return [];
  const q = staffSearch.value.trim().toLowerCase();
  if (!q) return store.staff;
  return store.staff.filter(
    (s) =>
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.role?.toLowerCase().includes(q) ||
      s.phone?.toLowerCase().includes(q)
  );
});

// Profile save (สามารถเปลี่ยนชื่อและตำแหน่ง/สิทธิ์การใช้งานได้)
async function saveProfile() {
  await store.updateProfile({
    name: profileForm.value.name.trim(),
    role: profileForm.value.role
  });
  alert("บันทึกข้อมูลส่วนตัวและสิทธิ์การใช้งานเรียบร้อยแล้ว!");
}

// Policy save (Admin only)
async function savePolicy() {
  if (!store.isAdmin) {
    alert("เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถแก้ไขนโยบายได้");
    return;
  }
  await store.updatePolicy({ ...policyForm.value });
  alert("บันทึกการตั้งค่านโยบายห้องสมุดเรียบร้อยแล้ว!");
}

// Staff Modal Handlers
function openAddStaffModal() {
  editingStaff.value = null;
  staffForm.value = {
    name: "",
    email: "",
    role: "บรรณารักษ์",
    phone: ""
  };
  showStaffModal.value = true;
}

function openEditStaffModal(staff) {
  editingStaff.value = staff;
  staffForm.value = {
    name: staff.name,
    email: staff.email,
    role: staff.role,
    phone: staff.phone || ""
  };
  showStaffModal.value = true;
}

async function handleSaveStaff() {
  if (!staffForm.value.name.trim() || !staffForm.value.email.trim()) {
    alert("กรุณากรอกชื่อและอีเมลให้ครบถ้วน");
    return;
  }

  try {
    if (editingStaff.value) {
      await store.updateStaff(editingStaff.value.id, {
        name: staffForm.value.name.trim(),
        email: staffForm.value.email.trim(),
        role: staffForm.value.role,
        phone: staffForm.value.phone.trim()
      });
      alert("แก้ไขข้อมูลบุคลากรเรียบร้อยแล้ว!");
    } else {
      await store.addStaff({
        name: staffForm.value.name.trim(),
        email: staffForm.value.email.trim(),
        role: staffForm.value.role,
        phone: staffForm.value.phone.trim()
      });
      alert("เพิ่มบุคลากรใหม่เรียบร้อยแล้ว!");
    }
    showStaffModal.value = false;
  } catch (err) {
    alert(err?.message || err?.response?.data?.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
  }
}

async function handleDeleteStaff(staff) {
  if (confirm(`คุณต้องการลบข้อมูลบุคลากร "${staff.name}" (${staff.role}) ใช่หรือไม่?`)) {
    try {
      await store.deleteStaff(staff.id);
      alert("ลบข้อมูลบุคลากรเรียบร้อยแล้ว");
    } catch (err) {
      alert(err?.response?.data?.error || "เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  }
}

async function resetSystemToDefault() {
  if (!store.isAdmin) {
    alert("เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถรีเซ็ตระบบได้");
    return;
  }
  if (confirm("คำเตือน: คุณต้องการล้างข้อมูลทั้งหมดและเริ่มต้นใหม่ใช่หรือไม่? (จะต้องลงทะเบียนใหม่)")) {
    await store.resetSystem();
    alert("รีเซ็ตข้อมูลระบบเรียบร้อยแล้ว");
  }
}
</script>

<template>
  <AppLayout :icon="Settings" page-title="ตั้งค่าระบบ">
    <div class="max-w-4xl mx-auto w-full space-y-6">
      
      <!-- Top Role Banner -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 class="text-xl font-bold text-gray-800">ตั้งค่าระบบและการจัดการผู้ใช้</h1>
          <p class="text-xs text-gray-500 mt-0.5">จัดการข้อมูลโปรไฟล์ บุคลากรห้องสมุด นโยบายการยืม-คืน และสิทธิ์การใช้งาน</p>
        </div>
        <div class="flex items-center gap-2">
          <div
            v-if="store.isAdmin"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200 text-purple-700 rounded-xl text-xs font-semibold shadow-xs"
          >
            <ShieldCheck class="w-4 h-4 text-purple-600" />
            <span>สิทธิ์: ผู้ดูแลระบบ (จัดการได้ทุกอย่าง)</span>
          </div>
          <div
            v-else
            class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-semibold shadow-xs"
          >
            <UserCheck class="w-4 h-4 text-blue-600" />
            <span>สิทธิ์: บรรณารักษ์ (แก้ไขได้เฉพาะข้อมูลส่วนตัว)</span>
          </div>
        </div>
      </div>

      <!-- Section 1: ข้อมูลส่วนตัวของผู้ใช้งาน (Profile) -->
      <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-blue-50 text-blue-600 rounded-xl"><User class="w-5 h-5" /></div>
            <div>
              <h2 class="text-sm font-bold text-gray-800">ข้อมูลส่วนตัวของคุณ</h2>
              <p class="text-[11px] text-gray-400">ข้อมูลนี้จะแสดงผลบนเมนู แถบด้านบน และเอกสารต่างๆ ในระบบ</p>
            </div>
          </div>
          <span class="text-xs px-2.5 py-1 rounded-full font-medium" :class="store.isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'">
            {{ store.currentUser?.role || 'บรรณารักษ์' }}
          </span>
        </div>

        <form class="space-y-4" @submit.prevent="saveProfile">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">ชื่อ-นามสกุล <span class="text-red-500">*</span></label>
              <input
                v-model="profileForm.name"
                type="text"
                required
                class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">อีเมลผู้ใช้งาน</label>
              <input
                :value="profileForm.email"
                type="email"
                disabled
                class="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-xs text-gray-500 cursor-not-allowed"
              />
            </div>

            <div class="sm:col-span-2">
              <label class="block text-xs font-medium text-gray-700 mb-1">
                ตำแหน่ง / สิทธิ์การใช้งาน <span class="text-red-500">*</span>
              </label>
              <select
                v-model="profileForm.role"
                required
                class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none text-gray-800 font-medium"
              >
                <option v-for="r in LIBRARY_ROLES" :key="r" :value="r">{{ r }}</option>
              </select>
              <p class="text-[11px] text-gray-400 mt-1">
                เลือกเปลี่ยนระหว่าง "ผู้ดูแลระบบ" (จัดการได้ทุกอย่างรวมถึงบุคลากรและนโยบาย) หรือ "บรรณารักษ์" (จัดการงานห้องสมุดทั่วไป)
              </p>
            </div>
          </div>

          <div class="flex justify-end pt-2">
            <button
              type="submit"
              class="flex items-center gap-1.5 px-4 py-2 bg-[#143d8d] hover:bg-[#1a4ab0] text-white rounded-xl text-xs font-medium shadow-sm transition"
            >
              <Save class="w-3.5 h-3.5" />
              <span>บันทึกข้อมูลส่วนตัว</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Section 2: การจัดการรายชื่อบรรณารักษ์และเจ้าหน้าที่ (เฉพาะผู้ดูแลระบบ) -->
      <div v-if="store.isAdmin" class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-purple-50 text-purple-600 rounded-xl"><Users class="w-5 h-5" /></div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-sm font-bold text-gray-800">จัดการรายชื่อบรรณารักษ์ทั้งหมด</h2>
                <span class="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-bold">เฉพาะผู้ดูแลระบบ</span>
              </div>
              <p class="text-[11px] text-gray-400">ดูรายชื่อบรรณารักษ์ทั้งหมด สร้างชื่อ แก้ไขข้อมูล หรือลบชื่อผู้ใช้งาน</p>
            </div>
          </div>
          <button
            @click="openAddStaffModal"
            class="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-medium shadow-sm transition"
          >
            <UserPlus class="w-3.5 h-3.5" />
            <span>+ เพิ่มบรรณารักษ์ใหม่</span>
          </button>
        </div>

        <!-- Search Bar -->
        <div class="relative max-w-sm">
          <Search class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            v-model="staffSearch"
            type="text"
            placeholder="ค้นหาชื่อ, อีเมล หรือตำแหน่ง..."
            class="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-purple-600 focus:outline-none"
          />
        </div>

        <!-- Staff List Table -->
        <div class="overflow-x-auto border border-gray-100 rounded-xl">
          <table class="w-full text-left text-xs text-gray-600">
            <thead class="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th class="py-3 px-4">รหัส</th>
                <th class="py-3 px-4">ชื่อ-นามสกุล</th>
                <th class="py-3 px-4">อีเมล / เบอร์โทร</th>
                <th class="py-3 px-4">ตำแหน่ง / สิทธิ์</th>
                <th class="py-3 px-4">วันที่ลงทะเบียน</th>
                <th class="py-3 px-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="filteredStaff.length === 0">
                <td colspan="6" class="py-6 text-center text-gray-400">ไม่พบรายชื่อบุคลากร</td>
              </tr>
              <tr
                v-for="item in filteredStaff"
                :key="item.id"
                class="hover:bg-gray-50/80 transition"
                :class="{ 'bg-purple-50/30': item.email === store.currentUser?.email }"
              >
                <td class="py-3 px-4 font-mono font-bold text-gray-700">{{ item.id }}</td>
                <td class="py-3 px-4">
                  <div class="font-bold text-gray-800 flex items-center gap-1.5">
                    <span>{{ item.name }}</span>
                    <span v-if="item.email === store.currentUser?.email" class="text-[10px] px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded font-normal">
                      คุณ
                    </span>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <div class="text-gray-700">{{ item.email }}</div>
                  <div class="text-[11px] text-gray-400">{{ item.phone || '-' }}</div>
                </td>
                <td class="py-3 px-4">
                  <span
                    class="px-2.5 py-1 rounded-full text-[11px] font-semibold inline-flex items-center gap-1"
                    :class="item.role === 'ผู้ดูแลระบบ' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'"
                  >
                    <ShieldCheck v-if="item.role === 'ผู้ดูแลระบบ'" class="w-3 h-3" />
                    <UserCheck v-else class="w-3 h-3" />
                    <span>{{ item.role }}</span>
                  </span>
                </td>
                <td class="py-3 px-4 text-gray-500">{{ item.registeredAt || '-' }}</td>
                <td class="py-3 px-4">
                  <div class="flex items-center justify-center gap-1.5">
                    <button
                      class="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition"
                      title="แก้ไขข้อมูล"
                      @click="openEditStaffModal(item)"
                    >
                      <Edit2 class="w-3.5 h-3.5" />
                    </button>
                    <button
                      v-if="item.role !== 'ผู้ดูแลระบบ'"
                      class="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                      title="ลบข้อมูลบรรณารักษ์"
                      @click="handleDeleteStaff(item)"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                    <span v-else class="text-[10px] text-gray-400 italic px-1">
                      บัญชีหลัก
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Notice Card for Librarians (Non-admin) -->
      <div v-else class="bg-gray-50 p-5 rounded-2xl border border-dashed border-gray-200 flex items-center gap-3.5 text-gray-600">
        <div class="p-2.5 bg-white text-gray-400 rounded-xl shadow-xs border border-gray-200">
          <Lock class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-xs font-bold text-gray-700">การจัดการรายชื่อบรรณารักษ์และเจ้าหน้าที่</h3>
          <p class="text-[11px] text-gray-500 mt-0.5">
            สงวนสิทธิ์สำหรับ <span class="font-bold text-purple-700">"ผู้ดูแลระบบ"</span> เท่านั้น บรรณารักษ์สามารถแก้ไขได้เฉพาะข้อมูลส่วนตัวของคุณในส่วนด้านบน
          </p>
        </div>
      </div>

      <!-- Section 3: นโยบายการยืม-คืน และค่าปรับ -->
      <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-amber-50 text-amber-600 rounded-xl"><Sliders class="w-5 h-5" /></div>
            <div>
              <h2 class="text-sm font-bold text-gray-800">นโยบายการยืม-คืน และค่าปรับ</h2>
              <p class="text-[11px] text-gray-400">กำหนดเงื่อนไขระยะเวลาและค่าปรับสำหรับการดำเนินงานห้องสมุด</p>
            </div>
          </div>
          <span v-if="!store.isAdmin" class="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md font-medium">
            เฉพาะผู้ดูแลระบบแก้ไขได้
          </span>
        </div>

        <form class="space-y-4" @submit.prevent="savePolicy">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">ระยะเวลายืมสูงสุด (วัน)</label>
              <input
                v-model.number="policyForm.borrowDays"
                type="number"
                min="1"
                max="90"
                :disabled="!store.isAdmin"
                required
                class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none font-mono disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">จำนวนเล่มยืมสูงสุด/คน</label>
              <input
                v-model.number="policyForm.maxBooks"
                type="number"
                min="1"
                max="20"
                :disabled="!store.isAdmin"
                required
                class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none font-mono disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">อัตราค่าปรับเกินกำหนด (บาท/วัน)</label>
              <input
                v-model.number="policyForm.finePerDay"
                type="number"
                min="1"
                max="100"
                :disabled="!store.isAdmin"
                required
                class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none font-mono disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div v-if="store.isAdmin" class="flex justify-end">
            <button
              type="submit"
              class="flex items-center gap-1.5 px-4 py-2 bg-[#143d8d] hover:bg-[#1a4ab0] text-white rounded-xl text-xs font-medium shadow-sm transition"
            >
              <Save class="w-3.5 h-3.5" />
              <span>บันทึกนโยบายห้องสมุด</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Section 4: Danger Zone (เฉพาะผู้ดูแลระบบ) -->
      <div
        v-if="store.isAdmin"
        class="bg-red-50/50 p-6 rounded-2xl border border-red-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-sm font-bold text-red-800">ล้างฐานข้อมูลระบบ (Danger Zone)</h2>
            <span class="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-bold">เฉพาะผู้ดูแลระบบ</span>
          </div>
          <p class="text-xs text-red-600/80 mt-0.5">ลบข้อมูลหนังสือ สมาชิก รายการยืม-คืน ทั้งหมด และกลับสู่การตั้งค่าเริ่มต้น</p>
        </div>
        <button
          class="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-medium text-xs shadow-sm transition flex-shrink-0"
          @click="resetSystemToDefault"
        >
          <Trash2 class="w-4 h-4" />
          <span>รีเซ็ตระบบทั้งหมด</span>
        </button>
      </div>

    </div>

    <!-- Modal: เพิ่ม / แก้ไข บุคลากร (Admin only) -->
    <div
      v-if="showStaffModal"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
    >
      <div class="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div class="flex items-center justify-between p-5 border-b border-gray-100 bg-[#143d8d] text-white">
          <div class="flex items-center gap-2.5">
            <ShieldCheck class="w-5 h-5 text-purple-300" />
            <h3 class="font-bold text-sm">
              {{ editingStaff ? 'แก้ไขข้อมูลบุคลากร' : 'เพิ่มบรรณารักษ์ใหม่' }}
            </h3>
          </div>
          <button @click="showStaffModal = false" class="text-blue-200 hover:text-white transition">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form class="p-5 space-y-4" @submit.prevent="handleSaveStaff">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">ชื่อ-นามสกุล <span class="text-red-500">*</span></label>
            <input
              v-model="staffForm.name"
              type="text"
              required
              placeholder="เช่น น.ส. รัตนา วงศ์สว่าง"
              class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">อีเมล <span class="text-red-500">*</span></label>
            <input
              v-model="staffForm.email"
              type="email"
              required
              :disabled="!!editingStaff"
              placeholder="staff@library.com"
              class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">เบอร์โทรศัพท์ (สูงสุด 10 หลัก)</label>
            <input
              v-model="staffForm.phone"
              type="tel"
              maxlength="10"
              placeholder="เช่น 0812345678"
              class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
              @input="staffForm.phone = (staffForm.phone || '').replace(/[^0-9]/g, '').slice(0, 10)"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">ตำแหน่ง / สิทธิ์การใช้งาน <span class="text-red-500">*</span></label>
            <select
              v-model="staffForm.role"
              required
              class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none text-gray-800 font-medium"
            >
              <option v-for="r in LIBRARY_ROLES" :key="r" :value="r">{{ r }}</option>
            </select>
            <p class="text-[10px] text-gray-400 mt-1">กำหนดสิทธิ์เป็น "ผู้ดูแลระบบ" หรือ "บรรณารักษ์"</p>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              @click="showStaffModal = false"
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-medium transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-medium shadow-sm transition flex items-center gap-1.5"
            >
              <Save class="w-3.5 h-3.5" />
              <span>บันทึกข้อมูล</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </AppLayout>
</template>
