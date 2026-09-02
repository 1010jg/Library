<script setup>
import Sidebar from "./Sidebar.vue";
import AppHeader from "./AppHeader.vue";

defineProps({
  icon: { type: Object, required: true },
  pageTitle: { type: String, required: true }
});
</script>

<template>
  <div class="flex w-full h-full">
    <Sidebar />
    <div class="flex-1 flex flex-col overflow-y-auto">
      <AppHeader :icon="icon" :page-title="pageTitle" />
      <main class="p-6 space-y-5 flex-1">
        <slot />
      </main>
    </div>
  </div>
</template>
