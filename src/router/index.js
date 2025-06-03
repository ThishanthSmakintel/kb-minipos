import { createRouter, createWebHistory } from "vue-router";

// Layouts
import AuthLayout from "../layouts/AuthLayout.vue";
import DashboardLayout from "../layouts/DashboardLayout.vue";

// Components (ensure these paths are correct for your project structure)
import Login from "../components/Login.vue";
import PosSystem from "../components/PosSystem.vue";
import CheckoutPayment from "../components/CheckoutPayment.vue";
import NotFound from "../components/NotFound.vue"; // Component for 404 pages

// Auth checker
const isLoggedIn = () => sessionStorage.getItem("isLoggedInPos") === "true";

const routes = [
  {
    path: "/login", // This route leads to /login
    component: AuthLayout,
    children: [
      {
        path: "",
        name: "Login",
        component: Login,
        beforeEnter: (to, from, next) => {
          if (isLoggedIn()) {
            next({ name: "POS" }); // If logged in, redirect to POS
          } else {
            next(); // Otherwise, proceed to Login page
          }
        },
      },
    ],
  },
  {
    path: "/",
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "POS",
        component: PosSystem,
        props: (route) => ({
          payment_status: route.query.payment_status,
        }),
      },
      {
        path: "checkout", // Path will be /checkout
        name: "CheckoutPayment",
        component: CheckoutPayment,
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*", // for 404 Not Found
    name: "NotFound",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL || "/"),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Defines scroll behavior on navigation
    if (savedPosition) {
      return savedPosition; // If returning via back/forward, use saved position
    } else {
      return { top: 0, behavior: "smooth" }; // Otherwise, scroll to top smoothly
    }
  },
});

// Global navigation guard
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  if (requiresAuth && !isLoggedIn()) {
    // If route requires auth and user is not logged in, redirect to Login
    // Pass the intended route as a query param for redirecting back after login
    next({ name: "Login", query: { redirect: to.fullPath } });
  } else {
    next(); // Otherwise, proceed as normal
  }
});

export default router;
