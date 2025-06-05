<template>
  <header class="navbar navbar-expand-lg bg-white shadow-sm border-bottom py-2">
    <div
      class="container-fluid d-flex justify-content-between align-items-center"
    >
      <!-- Brand and Outlet -->
      <div class="d-flex flex-column">
        <a class="navbar-brand fw-bold text-dark mb-0" href="#">
          Kenwyn Books POS
        </a>
        <small v-if="outletName" class="text-muted ms-1"
          >Outlet: {{ outletName }}</small
        >
      </div>

      <!-- User Dropdown -->
      <div v-if="isUserLoggedIn" class="dropdown">
        <a
          href="#"
          class="d-flex align-items-center text-decoration-none dropdown-toggle"
          id="userDropdown"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <img
            :src="profileImage"
            alt="profile"
            width="36"
            height="36"
            class="rounded-circle me-2 border"
          />
          <span class="d-none d-md-inline fw-semibold text-dark">{{
            userName
          }}</span>
        </a>
        <ul
          class="dropdown-menu dropdown-menu-end shadow-sm"
          aria-labelledby="userDropdown"
        >
          <li><h6 class="dropdown-header">User Info</h6></li>
          <li>
            <span class="dropdown-item-text">Name: {{ userName }}</span>
          </li>
          <li><hr class="dropdown-divider" /></li>
          <li>
            <span class="dropdown-item-text">Role: {{ role }}</span>
          </li>
          <li><hr class="dropdown-divider" /></li>
          <li>
            <button class="dropdown-item text-danger" @click="handleLogout">
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
  data() {
    return {
      outletName: "",
      employeeId: "",
      companyId: "",
      role: "",
      userId: "",
      userName: "",
      userType: "",
      profileImage: "https://placehold.co/600x400", // Default profile image
    };
  },
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
    loadOutletName() {
      try {
        const outletData = JSON.parse(sessionStorage.getItem("currentOutlet"));
        if (outletData?.fullname) {
          this.outletName = outletData.fullname.trim();
        }
      } catch (e) {
        console.error("Error parsing currentOutlet:", e);
      }
    },
    loadUserDetails() {
      try {
        const sessionContext = JSON.parse(
          sessionStorage.getItem("posSessionContext")
        );
        const userData = JSON.parse(sessionStorage.getItem("posUserData"));

        if (sessionContext) {
          this.employeeId = sessionContext.employeeId || "";
          this.companyId = sessionContext.companyId || "";
          this.role = sessionContext.role || "";
        }

        if (userData) {
          this.userId = userData.id || "";
          this.userName = userData.name || "User";
          this.userType = userData.type || "";
        }
      } catch (e) {
        console.error("Error parsing session data:", e);
      }
    },
  },
  mounted() {
    this.loadOutletName();
    this.loadUserDetails();
  },
};
</script>

<style scoped>
.navbar-brand {
  font-size: 1.25rem;
}
.dropdown-menu {
  font-size: 0.875rem;
}
.dropdown-item-text {
  padding-left: 1rem;
  padding-right: 1rem;
  color: #6c757d;
}
</style>
