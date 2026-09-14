<script setup>
import { onMounted, ref } from "vue";
import AuthModal from "./components/AuthModal.vue";
import { useLibraryStore } from "./store/library";

const store = useLibraryStore();
const ready = ref(false);

onMounted(async () => {
  await store.fetchCurrentUser();

  if (store.isAuthenticated) {
    await store.loadAll();
  }

  ready.value = true;
});
</script>

<template>
  <div class="min-h-screen w-full select-none">
    <template v-if="ready">
      <AuthModal v-if="!store.isAuthenticated" />

      <div
        class="min-h-screen w-full"
        :class="{ 'blurred-content': !store.isAuthenticated }"
      >
        <router-view v-if="store.isAuthenticated" />

        <div
          v-else
          class="min-h-screen w-full bg-[#f0f4f9]"
        ></div>
      </div>
    </template>
  </div>
</template>