<template>
  <div class="container">
    <div class="row justify-content-center align-items-center min-vh-100">
      <div class="col-12 col-sm-10 col-md-8 col-lg-5">
        <div class="card shadow rounded-4 border-0">
          <div class="card-body p-5">
            <h2 class="card-title text-center mb-5 fs-2">🔐 POS Login</h2>

            <form @submit.prevent="handleLogin">
              <div class="mb-4">
                <label for="pin" class="form-label fs-5">Enter PIN</label>
                <input
                  type="password"
                  class="form-control form-control-lg rounded-3"
                  id="pin"
                  v-model="pin"
                  required
                  inputmode="numeric"
                  pattern="[0-9]*"
                  autocomplete="current-password"
                  :disabled="isLoading"
                />
              </div>

              <button
                type="submit"
                class="btn btn-primary btn-lg w-100 rounded-3 py-3 fs-5"
                :disabled="isLoading"
              >
                <span
                  v-if="isLoading"
                  class="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
                <span v-if="isLoading" class="ms-2">Logging in...</span>
                <span v-else>Login</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";

export default {
  name: "UserLogin",
  data() {
    return {
      pin: "",
      isLoading: false,
    };
  },
  setup() {
    const router = useRouter();
    return { router };
  },
  methods: {
    async handleLogin() {
      this.isLoading = true;

      try {
        const outletId = 206;

        const response = await axios.post(
          "http://demo.app.kenwynbooks.com/api/pos/auth/login.php",
          {
            pin: Number(this.pin.trim()),
            outletId: outletId,
          },
          {
            headers: {
              "Api-Key": "kenwynaccounting.com",
            },
          }
        );

        if (
          response.status === 200 &&
          response.data.code === 200 &&
          response.data.status === "success"
        ) {
          sessionStorage.setItem("posToken", response.data.token);
          sessionStorage.setItem(
            "posUserData",
            JSON.stringify(response.data.userData)
          );
          sessionStorage.setItem(
            "currentOutlet",
            JSON.stringify(response.data.currentOutlet)
          );
          sessionStorage.setItem(
            "posSessionContext",
            JSON.stringify(response.data.sessionContext)
          );
          sessionStorage.setItem("isLoggedInPos", "true");

          this.router.push({ name: "POS" });
        } else {
          await Swal.fire({
            icon: "error",
            title: "Login Failed",
            text: response.data.message || "Invalid credentials.",
          });
        }
      } catch (error) {
        let message = "Login request failed. Please try again.";

        if (error.response) {
          if (error.response.status === 401) {
            message = "Incorrect PIN.";
          } else {
            message =
              error.response.data.message || "Server error during login.";
          }
        } else if (error.request) {
          message =
            "No response from server. Please check your network connection.";
        }

        await Swal.fire({
          icon: "error",
          title: "Login Error",
          text: message,
        });

        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.min-vh-100 {
  min-height: 100vh;
}
input::placeholder {
  font-size: 1.1rem;
}
input[type="password"] {
  font-size: 1.25rem;
  padding: 0.75rem 1rem;
}
.btn .spinner-border-sm {
  vertical-align: text-bottom;
}
.card-title {
  font-weight: 600;
}
</style>
