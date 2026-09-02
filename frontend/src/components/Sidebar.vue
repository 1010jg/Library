<script setup>
import { BookOpen, Home, Book, Users, RefreshCw, BarChart2, Receipt, Settings, RotateCcw } from "lucide-vue-next";
import { useLibraryStore } from "../store/library";

const store = useLibraryStore();

const navItems = [
  { to: "/", label: "หน้าหลัก", icon: Home },
  { to: "/books", label: "หนังสือ", icon: Book },
  { to: "/members", label: "สมาชิก", icon: Users },
  { to: "/borrow-return", label: "ยืม-คืน", icon: RefreshCw },
  { to: "/reports", label: "รายงาน", icon: BarChart2 },
  { to: "/fines", label: "ค่าปรับ", icon: Receipt },
  { to: "/settings", label: "ตั้งค่า", icon: Settings }
];

async function resetSystemToDefault() {
  if (confirm("คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นหรือไม่? (จะต้องลงทะเบียนใหม่)")) {
    await store.resetSystem();
  }
}
</script>

<template>
  <aside class="w-64 bg-[#143d8d] text-white flex flex-col justify-between flex-shrink-0 border-r-4 border-[#e85d04]">
    <div>
      <div class="flex items-center gap-3 p-4 border-b border-[#254ea3]/50">
        <div class="bg-[#2451ab] p-2 rounded-xl text-white shadow-inner">
          <BookOpen class="w-6 h-6" />
        </div>
        <div class="leading-tight">
          <div class="font-bold text-sm tracking-wide">ระบบจัดการห้องสมุด</div>
          <div class="text-[11px] text-blue-200">{{ store.currentUser?.role || "สำหรับบรรณารักษ์" }}</div>
        </div>
      </div>

      <nav class="p-3 space-y-1">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition"
          :class="
            $route.path === item.to
              ? 'bg-[#2b59be] text-white shadow-sm'
              : 'text-blue-100 hover:bg-[#1d479e]'
          "
        >
          <component :is="item.icon" class="w-4 h-4" />
          <span>{{ item.label }}</span>
        </router-link>
      </nav>
    </div>

    <div v-if="store.isAdmin" class="p-3 border-t border-[#254ea3]/50">
      <button
        class="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white rounded-xl text-xs transition border border-red-500/30"
        @click="resetSystemToDefault"
      >
        <RotateCcw class="w-3.5 h-3.5" />
        <span>รีเซ็ตระบบเป็นค่าเริ่มต้น</span>
      </button>
    </div>
  </aside>
</template>
