import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import axios from "axios";
import store from "./store";
// Axios interceptor for token header
axios.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("posToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const app = createApp(App);
app.use(router);
app.use(store);
app.mount("#app");
