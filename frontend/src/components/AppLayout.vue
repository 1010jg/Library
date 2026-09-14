<script setup>
import Sidebar from "./Sidebar.vue";
import AppHeader from "./AppHeader.vue";

defineProps({
  icon: { type: Object, required: true },
  pageTitle: { type: String, required: true }
});
</script>

<template>
  <div class="w-full min-h-screen bg-slate-50 overflow-x-hidden">
    <Sidebar />

    <div class="min-h-screen md:ml-64 flex flex-col">
      <AppHeader
        :icon="icon"
        :page-title="pageTitle"
      />

      <main class="flex-1 w-full p-3 sm:p-4 md:p-6 space-y-4 md:space-y-5">
        <slot />
      </main>
    </div>
  </div>
</template>