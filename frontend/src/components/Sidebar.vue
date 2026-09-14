<script setup>
import { ref } from "vue";
import {
  BookOpen,
  Home,
  Book,
  Users,
  RefreshCw,
  BarChart2,
  Receipt,
  Settings,
  RotateCcw,
  Menu,
  X
} from "lucide-vue-next";

import { useLibraryStore } from "../store/library";

const store = useLibraryStore();

const mobileMenuOpen = ref(false);

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
  if (
    confirm(
      "คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นหรือไม่? (จะต้องลงทะเบียนใหม่)"
    )
  ) {
    await store.resetSystem();
    mobileMenuOpen.value = false;
  }
}

function closeMobileMenu() {
  mobileMenuOpen.value = false;
}
</script>

<template>

  <!-- =========================================
       MOBILE MENU BUTTON
       ========================================= -->
  <button
    type="button"
    class="md:hidden fixed top-3 left-3 z-[60] w-11 h-11 rounded-xl bg-[#143d8d] text-white shadow-lg flex items-center justify-center border border-white/20"
    @click="mobileMenuOpen = !mobileMenuOpen"
    aria-label="เปิดเมนู"
  >
    <X v-if="mobileMenuOpen" class="w-6 h-6" />
    <Menu v-else class="w-6 h-6" />
  </button>


  <!-- =========================================
       MOBILE BACKDROP
       ========================================= -->
  <div
    v-if="mobileMenuOpen"
    class="md:hidden fixed inset-0 bg-black/50 z-40"
    @click="closeMobileMenu"
  ></div>


  <!-- =========================================
       SIDEBAR
       ========================================= -->
  <aside
    class="
      bg-[#143d8d]
      text-white
      flex
      flex-col
      justify-between
      border-r-4
      border-[#e85d04]

      w-64
      h-screen

      fixed
      top-0
      left-0
      z-50

      transition-transform
      duration-300
      ease-in-out

      md:translate-x-0
    "
    :class="mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
  >

    <!-- =========================================
         TOP
         ========================================= -->
    <div class="overflow-y-auto">

      <!-- Logo / Header -->
      <div
        class="flex items-center gap-3 p-4 border-b border-[#254ea3]/50"
      >

        <div
          class="bg-[#2451ab] p-2 rounded-xl text-white shadow-inner flex-shrink-0"
        >
          <BookOpen class="w-6 h-6" />
        </div>

        <div class="leading-tight min-w-0">
          <div class="font-bold text-sm tracking-wide">
            ระบบจัดการห้องสมุด
          </div>

          <div class="text-[11px] text-blue-200 truncate">
            {{ store.currentUser?.role || "สำหรับบรรณารักษ์" }}
          </div>
        </div>

        <!-- ปุ่มปิดบนมือถือ -->
        <button
          type="button"
          class="md:hidden ml-auto p-1 rounded-lg hover:bg-white/10"
          @click="closeMobileMenu"
        >
          <X class="w-5 h-5" />
        </button>

      </div>


      <!-- =========================================
           NAVIGATION
           ========================================= -->
      <nav class="p-3 space-y-1">

        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="
            flex
            items-center
            gap-3
            px-4
            py-3
            rounded-xl
            font-medium
            transition
            text-sm
          "
          :class="
            $route.path === item.to
              ? 'bg-[#2b59be] text-white shadow-sm'
              : 'text-blue-100 hover:bg-[#1d479e]'
          "
          @click="closeMobileMenu"
        >

          <component
            :is="item.icon"
            class="w-5 h-5 flex-shrink-0"
          />

          <span>
            {{ item.label }}
          </span>

        </router-link>

      </nav>

    </div>


    <!-- =========================================
         ADMIN RESET
         ========================================= -->
    <div
      v-if="store.isAdmin"
      class="p-3 border-t border-[#254ea3]/50"
    >

      <button
        type="button"
        class="
          w-full
          flex
          items-center
          justify-center
          gap-2
          py-2.5
          px-3
          bg-red-500/20
          hover:bg-red-500/30
          text-red-200
          hover:text-white
          rounded-xl
          text-xs
          transition
          border
          border-red-500/30
        "
        @click="resetSystemToDefault"
      >

        <RotateCcw class="w-4 h-4" />

        <span>
          รีเซ็ตระบบเป็นค่าเริ่มต้น
        </span>

      </button>

    </div>

  </aside>

</template>