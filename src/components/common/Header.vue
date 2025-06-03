<template>
  <header
    class="navbar navbar-expand-lg navbar-light bg-light border-bottom shadow-sm"
  >
    <div class="container-fluid">
      <a class="navbar-brand" href="#">Kenwyn Books POS</a>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#headerNavbarContent"
        aria-controls="headerNavbarContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="headerNavbarContent">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
          <li class="nav-item" v-if="isUserLoggedIn">
            <button class="btn btn-outline-danger" @click="handleLogout">
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: "CommonHeader",
  computed: {
    isUserLoggedIn() {
      return !!sessionStorage.getItem("isLoggedInPos");
    },
  },
  methods: {
    handleLogout() {
      sessionStorage.removeItem("isLoggedInPos");
      sessionStorage.removeItem("posToken");
      if (this.$router) {
        this.$router.push({ name: "Login" });
      } else {
        window.location.pathname = "/login";
      }
    },
  },
};
</script>

<style scoped>
.navbar-brand {
  font-weight: bold;
}
/* Add any additional custom styles if needed */
.btn-outline-danger {
  /* Example: ensure it aligns well if next to other nav items */
  margin-left: 0.5rem;
}
</style>