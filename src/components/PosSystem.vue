<template>
  <div class="container-fluid mt-3 mb-5">
    <div
      class="pos-header d-flex flex-wrap justify-content-between align-items-center p-3 mb-4 border rounded shadow-sm bg-light"
    >
      <div class="categories mb-2 mb-md-0">
        <button
          @click="selectAllProducts"
          class="btn me-2 text-nowrap"
          :class="!selectedCategory ? 'btn-primary' : 'btn-outline-primary'"
        >
          All Products
        </button>
        <span
          v-if="
            isInitialLoading && (!vuexCategories || vuexCategories.length === 0)
          "
          class="text-muted me-2"
          >Loading categories...</span
        >
      </div>
      <div class="actions d-flex align-items-center">
        <button
          v-if="!isLoggedIn"
          @click="navigateToLogin"
          class="btn btn-outline-success me-2 text-nowrap"
        >
          Login
        </button>
        <button
          v-if="isLoggedIn"
          @click="clearCartWithConfirmation"
          class="btn btn-danger me-2 text-nowrap"
        >
          Clear All
        </button>
        <button
          @click="scrollToCartOnMobile"
          class="btn btn-outline-secondary text-nowrap"
          id="cart-summary-button"
        >
          Cart ({{ vuexCartItemCount }})
        </button>
      </div>
    </div>

    <main class="row g-lg-4 g-md-3 g-2">
      <div
        class="col-lg-7 col-md-6 product-section order-1"
        id="product-list-area"
      >
        <h2
          v-if="selectedCategory && categoryNameFromVuex(selectedCategory)"
          class="mb-3 h5 sticky-top bg-light py-2 d-md-none"
        >
          {{ categoryNameFromVuex(selectedCategory) }}
        </h2>
        <h2
          v-else-if="!selectedCategory && !isInitialLoading"
          class="mb-3 h5 sticky-top bg-light py-2 d-md-none"
        >
          All Products
        </h2>
        <h2
          v-else-if="isInitialLoading || vuexIsProductLoading"
          class="mb-3 h5 sticky-top bg-light py-2 d-md-none"
        >
          Loading...
        </h2>

        <h2
          v-if="selectedCategory && categoryNameFromVuex(selectedCategory)"
          class="mb-3 h5 d-none d-md-block"
        >
          Products in {{ categoryNameFromVuex(selectedCategory) }}
        </h2>
        <h2
          v-else-if="!selectedCategory && !isInitialLoading"
          class="mb-3 h5 d-none d-md-block"
        >
          All Products
        </h2>
        <h2
          v-else-if="isInitialLoading || vuexIsProductLoading"
          class="mb-3 h5 d-none d-md-block"
        >
          Loading...
        </h2>

        <ProductList
          v-if="!vuexIsProductLoading"
          :products="vuexDisplayedProducts"
          @add-to-cart="handleAddToCart"
        />
        <div v-if="vuexIsProductLoading" class="text-center text-muted mt-4">
          <p>Loading products...</p>
        </div>
        <div
          v-if="
            !isInitialLoading &&
            !vuexIsProductLoading &&
            selectedCategory &&
            vuexDisplayedProducts.length === 0
          "
          class="text-center text-muted mt-4"
        ></div>
        <div
          v-if="
            !isInitialLoading &&
            !vuexIsProductLoading &&
            !selectedCategory &&
            vuexDisplayedProducts.length === 0
          "
          class="text-center text-muted mt-4"
        >
          <p>No products found.</p>
        </div>
      </div>

      <div
        class="col-lg-5 col-md-6 cart-section order-2"
        id="shopping-cart-area"
      >
        <div class="sticky-top cart-sticky-container pt-md-0">
          <h2 class="mb-3 h5">Your Shopping Cart</h2>
          <ShoppingCart
            :cart-items="vuexCartItems"
            @update-quantity="handleUpdateQuantity"
            @remove-item="handleRemoveItem"
            @checkout="handleCheckout"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import ProductList from "./ProductList.vue";
import ShoppingCart from "./ShoppingCart.vue";
import Swal from "sweetalert2";
import { mapState, mapGetters, mapActions } from "vuex";

export default {
  name: "PosSystem",
  components: {
    ProductList,
    ShoppingCart,
  },
  data() {
    return {
      selectedCategory: null, // No category selected initially, and UI for selection is disabled
      isLoggedIn: false,
      isInitialLoading: true,
    };
  },
  computed: {
    ...mapState({
      vuexCategories: (state) => state.categories,
    }),
    ...mapGetters({
      vuexCartItems: "cartItems",
      vuexCartItemCount: "cartItemCount",
      getCategoryNameFromStore: "getCategoryNameByKey",
      vuexDisplayedProducts: "displayedProducts",
      vuexIsProductLoading: "isProductLoading",
    }),
    categoryNameFromVuex() {
      return (categoryKey) => this.getCategoryNameFromStore(categoryKey);
    },
  },
  methods: {
    ...mapActions([
      "loadCartFromLocalStorage",
      "addItemToCart",
      "updateCartItemQuantity",
      "removeItemFromCart",
      "clearCart",
      "fetchCategories", // Kept for potential future use or if category data is used elsewhere
      "fetchAllProducts",
      // "fetchProductsByCategory", // Commented out as category filtering is not active
    ]),
    checkLoginStatus() {
      this.isLoggedIn =
        !!sessionStorage.getItem("isLoggedInPos") ||
        !!sessionStorage.getItem("posToken");
    },
    navigateToLogin() {
      this.$router.push({ name: "Login" });
    },
    /* // Method for selecting a category, currently not used as UI is disabled
    async selectCategory(categoryKey) {
      console.log("Category selected with key:", categoryKey);
      this.selectedCategory = categoryKey;
      if (categoryKey) {
        // await this.fetchProductsByCategory(categoryKey); // Call to action also disabled
      }
    },
    */
    selectAllProducts() {
      // console.log("All Products selected"); // Optional: remove console.log for production
      this.selectedCategory = null;
      this.$store.commit(
        "SET_DISPLAYED_PRODUCTS",
        this.$store.state.allProductsList
      );
    },
    scrollToCartOnMobile() {
      if (window.innerWidth < 768) {
        const cartElement = document.getElementById("shopping-cart-area");
        if (cartElement) {
          cartElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    },
    handleAddToCart(productToAdd) {
      this.addItemToCart(productToAdd);
    },
    handleUpdateQuantity({ productId, change }) {
      this.updateCartItemQuantity({ productId, change });
    },
    handleRemoveItem(productIdToRemove) {
      const itemToRemove = this.vuexCartItems.find(
        (item) => item.productId === productIdToRemove
      );
      if (itemToRemove) {
        Swal.fire({
          title: `Remove ${itemToRemove.name}?`,
          text: "Are you sure?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, remove!",
          cancelButtonText: "No",
        }).then((result) => {
          if (result.isConfirmed) {
            this.actuallyRemoveItem(productIdToRemove, true);
          }
        });
      }
    },
    actuallyRemoveItem(productIdToRemove, showSwal) {
      const item = this.vuexCartItems.find(
        (i) => i.productId === productIdToRemove
      );
      this.removeItemFromCart(productIdToRemove);
      if (showSwal && item) {
        Swal.fire("Removed!", `${item.name} removed.`, "success", {
          timer: 1500,
          showConfirmButton: false,
        });
      }
    },
    handleCheckout(totalAmount) {
      if (this.vuexCartItems.length === 0) {
        Swal.fire("Cart Empty", "Add products before checkout.", "warning");
        return;
      }
      this.$store.dispatch("updateAmount", totalAmount);
      this.$router.push({ name: "CheckoutPayment" });
    },
    clearCartWithConfirmation() {
      if (this.vuexCartItems.length === 0) {
        Swal.fire("Cart Empty", "Your cart is already empty.", "info");
        return;
      }
      Swal.fire({
        title: "Clear Cart?",
        text: "Remove all items from cart?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, clear!",
        cancelButtonText: "No",
      }).then((result) => {
        if (result.isConfirmed) {
          this.clearCart();
          Swal.fire("Cleared!", "Cart has been cleared.", "success");
        }
      });
    },
    checkAndProcessPaymentStatus() {
      const status = this.$route.query.payment_status;
      if (status === "success") {
        this.clearCart();
        Swal.fire(
          "Payment Successful!",
          "Order complete, cart cleared.",
          "success"
        );
        this.removePaymentStatusQuery();
      } else if (status === "cancelled") {
        Swal.fire("Payment Cancelled", "Cart items are still here.", "info");
        this.$store.dispatch("clearAmount");
        this.removePaymentStatusQuery();
      }
    },
    removePaymentStatusQuery() {
      const newQuery = { ...this.$route.query };
      delete newQuery.payment_status;
      this.$router.replace({ query: newQuery }).catch(() => {});
    },
    async initializePOSData() {
      this.isInitialLoading = true;
      try {
        // Fetching categories in case they are needed for display or future re-enablement of filtering
        await this.fetchCategories();
        // Fetch all products to display by default. This now uses the adjusted Vuex action.
        await this.fetchAllProducts();
        // selectedCategory remains null, ensuring "All Products" are shown.
      } catch (error) {
        console.error("Error initializing POS data:", error);
      } finally {
        this.isInitialLoading = false;
      }
    },
  },
  created() {
    this.loadCartFromLocalStorage();
    this.checkLoginStatus();
    this.initializePOSData();
  },
  mounted() {
    this.checkAndProcessPaymentStatus();
  },
  watch: {
    "$route.query.payment_status"(newStatus) {
      if (newStatus) this.checkAndProcessPaymentStatus();
    },
  },
};
</script>

<style scoped>
/* ... your styles ... */
.pos-header button {
  min-width: 110px;
}
.product-section,
.cart-section {
  max-height: calc(100vh - 220px);
  overflow-y: auto;
}
.cart-sticky-container {
  top: 0;
  z-index: 10;
  background-color: #fff;
  padding-top: 1rem;
}
.product-section h2.sticky-top {
  top: 0;
  z-index: 5;
}
</style>