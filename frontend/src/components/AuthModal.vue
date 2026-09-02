<script setup>
import { ref } from "vue";
import { ShieldCheck, UserPlus, LogIn, User } from "lucide-vue-next";
import { useLibraryStore } from "../store/library";

const store = useLibraryStore();

const activeTab = ref("register"); // 'register' | 'login'
const name = ref("");
const email = ref("");
const phone = ref("");
const loginEmail = ref("");
const submitting = ref(false);

async function handleRegister() {
  if (!name.value.trim() || !email.value.trim()) return;
  submitting.value = true;
  try {
    // สมัครใหม่จะเป็นสิทธิ์ "บรรณารักษ์" เสมอ (มีผู้ดูแลระบบได้แค่ 1 บัญชี)
    await store.register({
      name: name.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim()
    });
    await store.loadAll();
    alert("ลงทะเบียนบรรณารักษ์และเข้าสู่ระบบเรียบร้อยแล้ว!");
  } catch (err) {
    const errorMsg = err?.response?.data?.error || "เกิดข้อผิดพลาดในการลงทะเบียน";
    alert(errorMsg);
    // ถ้าอีเมลซ้ำ ให้สลับไปหน้าเข้าสู่ระบบและใส่อีเมลให้อัตโนมัติ
    if (errorMsg.includes("มีอยู่ในระบบแล้ว")) {
      loginEmail.value = email.value.trim();
      activeTab.value = "login";
    }
  } finally {
    submitting.value = false;
  }
}

async function handleLogin() {
  const mail = loginEmail.value.trim();
  if (!mail) return;
  submitting.value = true;
  try {
    await store.login(mail);
    await store.loadAll();
  } catch (err) {
    alert(err?.response?.data?.error || "ไม่พบบัญชีนี้ในระบบ");
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
      
      <!-- Header -->
      <div class="bg-[#143d8d] p-6 text-white text-center relative border-b-4 border-[#e85d04]">
        <div class="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <ShieldCheck class="w-7 h-7 text-orange-400" />
        </div>
        <h2 class="text-lg font-bold">ระบบบริหารจัดการห้องสมุด</h2>
        <p class="text-xs text-blue-200 mt-1">กรุณาลงทะเบียนบรรณารักษ์ หรือเข้าสู่ระบบด้วยบัญชีเดิม</p>
      </div>

      <!-- Mode Tabs -->
      <div class="grid grid-cols-2 p-1.5 bg-gray-100 mx-6 mt-5 rounded-xl border border-gray-200 text-xs font-semibold">
        <button
          type="button"
          class="py-2 rounded-lg transition"
          :class="activeTab === 'register' ? 'bg-white text-[#143d8d] shadow-sm' : 'text-gray-500 hover:text-gray-800'"
          @click="activeTab = 'register'"
        >
          ลงทะเบียนบรรณารักษ์
        </button>
        <button
          type="button"
          class="py-2 rounded-lg transition"
          :class="activeTab === 'login' ? 'bg-white text-[#143d8d] shadow-sm' : 'text-gray-500 hover:text-gray-800'"
          @click="activeTab = 'login'"
        >
          เข้าสู่ระบบ (ผู้ดูแลระบบ / เดิม)
        </button>
      </div>

      <!-- Tab 1: Register as Librarian -->
      <form v-if="activeTab === 'register'" class="p-6 space-y-4" @submit.prevent="handleRegister">
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">ชื่อ-นามสกุล <span class="text-red-500">*</span></label>
          <input
            v-model="name"
            type="text"
            required
            placeholder="เช่น น.ส. บุษบา มาดี"
            class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">อีเมลผู้ใช้งาน <span class="text-red-500">*</span></label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="librarian@library.com"
            class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">เบอร์โทรศัพท์ (สูงสุด 10 หลัก)</label>
          <input
            v-model="phone"
            type="tel"
            maxlength="10"
            placeholder="เช่น 0812345678"
            class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            @input="phone = (phone || '').replace(/[^0-9]/g, '').slice(0, 10)"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">ตำแหน่ง / สิทธิ์การใช้งาน</label>
          <div class="flex items-center justify-between px-3.5 py-2.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs">
            <div class="flex items-center gap-2 font-semibold text-[#143d8d]">
              <User class="w-4 h-4 text-blue-600" />
              <span>บรรณารักษ์ (Librarian)</span>
            </div>
            <span class="text-[11px] text-blue-500 font-medium">กำหนดให้อัตโนมัติ</span>
          </div>
          <p class="text-[10px] text-gray-400 mt-1">
            * สิทธิ์ผู้ดูแลระบบ (Admin) มีเพียง 1 บัญชีหลักในระบบเท่านั้น และไม่สามารถสมัครเพิ่มจากหน้านี้ได้
          </p>
        </div>

        <button
          type="submit"
          :disabled="submitting"
          class="w-full mt-2 bg-[#143d8d] hover:bg-[#1d4ea3] text-white py-3 rounded-xl font-semibold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <UserPlus class="w-4 h-4" />
          <span>{{ submitting ? "กำลังบันทึก..." : "ลงทะเบียนบรรณารักษ์ & เริ่มใช้งาน" }}</span>
        </button>
      </form>

      <!-- Tab 2: Login as Admin / Existing Staff -->
      <form v-else class="p-6 space-y-4" @submit.prevent="handleLogin">
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">
            อีเมลผู้ใช้งาน (ผู้ดูแลระบบ / บรรณารักษ์) <span class="text-red-500">*</span>
          </label>
          <input
            v-model="loginEmail"
            type="email"
            required
            placeholder="เช่น admin@library.com หรือ email ของคุณ"
            class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          :disabled="submitting || !loginEmail.trim()"
          class="w-full mt-2 bg-[#143d8d] hover:bg-[#1d4ea3] text-white py-3 rounded-xl font-semibold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <LogIn class="w-4 h-4" />
          <span>{{ submitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ" }}</span>
        </button>
      </form>

    </div>
  </div>
</template>
