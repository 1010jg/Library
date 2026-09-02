<script setup>
import { ref } from "vue";
import { ChevronDown, LogOut, UserCog } from "lucide-vue-next";
import { useLibraryStore } from "../store/library";

defineProps({
  icon: { type: Object, required: true },
  pageTitle: { type: String, required: true }
});

const store = useLibraryStore();
const menuOpen = ref(false);

function toggleMenu(e) {
  e.stopPropagation();
  menuOpen.value = !menuOpen.value;
}

function closeMenu() {
  menuOpen.value = false;
}

async function handleLogout() {
  if (confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
    await store.logout();
    menuOpen.value = false;
  }
}

window.addEventListener("click", closeMenu);
</script>

<template>
  <header class="bg-white border-b border-gray-200 px-6 py-2.5 flex items-center justify-between flex-shrink-0 sticky top-0 z-30 shadow-sm">
    <div class="flex items-center gap-2 text-sm">
      <div class="bg-blue-600 text-white p-1 rounded-md">
        <component :is="icon" class="w-3.5 h-3.5" />
      </div>
      <router-link to="/" class="text-gray-700 font-medium hover:underline">ระบบห้องสมุด</router-link>
      <span class="text-gray-400">/</span>
      <span class="text-blue-600 font-medium">{{ pageTitle }}</span>
    </div>

    <div class="relative">
      <button
        class="flex items-center gap-2.5 border-l pl-4 border-gray-200 focus:outline-none hover:opacity-80 transition cursor-pointer"
        @click="toggleMenu"
      >
        <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-transparent hover:ring-blue-300 transition">
          {{ (store.currentUser?.name || "บ").charAt(0) }}
        </div>
        <div class="text-left leading-tight hidden sm:block">
          <div class="text-xs font-semibold text-gray-800">{{ store.currentUser?.name || "ผู้ใช้งาน" }}</div>
          <div class="text-[10px] text-gray-400">{{ store.currentUser?.role || "บรรณารักษ์" }}</div>
        </div>
        <ChevronDown class="w-3.5 h-3.5 text-gray-400 ml-1" />
      </button>

      <div
        v-if="menuOpen"
        class="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50"
        @click.stop
      >
        <div class="px-4 pb-3 border-b border-gray-100 flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-inner flex-shrink-0">
            {{ (store.currentUser?.name || "บ").charAt(0) }}
          </div>
          <div class="overflow-hidden">
            <div class="text-xs font-bold text-gray-800 truncate">{{ store.currentUser?.name || "ผู้ใช้งาน" }}</div>
            <div class="text-[11px] text-gray-400 truncate">{{ store.currentUser?.email || "email@example.com" }}</div>
            <span class="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-medium">
              {{ store.currentUser?.role || "บรรณารักษ์" }}
            </span>
          </div>
        </div>

        <div class="px-2 pt-2 space-y-1">
          <router-link
            to="/settings"
            class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-700 hover:bg-gray-50 transition"
            @click="closeMenu"
          >
            <UserCog class="w-4 h-4 text-gray-400" />
            <span>แก้ไขข้อมูลส่วนตัว</span>
          </router-link>
          <button
            class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-600 hover:bg-red-50 transition text-left"
            @click="handleLogout"
          >
            <LogOut class="w-4 h-4 text-red-500" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
