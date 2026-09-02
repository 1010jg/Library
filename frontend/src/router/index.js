import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", name: "dashboard", component: () => import("../views/DashboardView.vue") },
  { path: "/books", name: "books", component: () => import("../views/BooksView.vue") },
  { path: "/members", name: "members", component: () => import("../views/MembersView.vue") },
  { path: "/borrow-return", name: "borrow-return", component: () => import("../views/BorrowReturnView.vue") },
  { path: "/reports", name: "reports", component: () => import("../views/ReportsView.vue") },
  { path: "/fines", name: "fines", component: () => import("../views/FinesView.vue") },
  { path: "/settings", name: "settings", component: () => import("../views/SettingsView.vue") }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
