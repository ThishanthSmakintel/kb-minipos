<template>
  <div class="container-fluid mt-3 mb-5">
    <div
      class="pos-header d-flex flex-wrap justify-content-between align-items-center p-3 mb-4 border rounded shadow-sm bg-light"
    >
      <div class="categories mb-2 mb-md-0">
        <button
          v-for="cat in categories"
          :key="cat.key"
          @click="selectCategory(cat.key)"
          class="btn me-2 text-nowrap"
          :class="
            selectedCategory === cat.key ? 'btn-primary' : 'btn-outline-primary'
          "
        >
          {{ cat.name }}
        </button>
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
          Cart ({{ cartItemCount }})
        </button>
      </div>
    </div>

    <main class="row g-lg-4 g-md-3 g-2">
      <div
        class="col-lg-7 col-md-6 product-section order-1"
        id="product-list-area"
      >
        <h2
          v-if="selectedCategory && getCategoryName(selectedCategory)"
          class="mb-3 h5 sticky-top bg-light py-2 d-md-none"
        >
          {{ getCategoryName(selectedCategory) }}
        </h2>
        <h2
          v-if="selectedCategory && getCategoryName(selectedCategory)"
          class="mb-3 h5 d-none d-md-block"
        >
          Products in {{ getCategoryName(selectedCategory) }}
        </h2>
        <ProductList
          :products="filteredProducts"
          @add-to-cart="handleAddToCart"
        />
      </div>

      <div
        class="col-lg-5 col-md-6 cart-section order-2"
        id="shopping-cart-area"
      >
        <div class="sticky-top cart-sticky-container pt-md-0">
          <h2 class="mb-3 h5">Your Shopping Cart</h2>
          <ShoppingCart
            :cart-items="cart"
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
// import { useStore } from "vuex"; // Not needed if using this.$store

export default {
  name: "PosSystem",
  components: {
    ProductList,
    ShoppingCart,
  },
  data() {
    return {
      products: [
        // Keep your product data here
        {
          id: "R001",
          name: "Spring Roll (Veg)",
          price: 2.5,
          category: "Rolls",
        },
        {
          id: "R002",
          name: "Chicken Sausage Roll",
          price: 3.0,
          category: "Rolls",
        },
        { id: "D001", name: "Cola (300ml)", price: 1.5, category: "Drinks" },
        {
          id: "F001",
          name: "Organic Apples (1kg)",
          price: 4.99,
          category: "Food",
        },
      ],
      cart: [],
      categories: [
        { key: "Rolls", name: "Rolls" },
        { key: "Drinks", name: "Drinks" },
        { key: "Food", name: "Food & Groceries" },
      ],
      selectedCategory: "Rolls",
      isLoggedIn: false,
    };
  },
  computed: {
    filteredProducts() {
      if (!this.selectedCategory) return this.products;
      return this.products.filter(
        (product) => product.category === this.selectedCategory
      );
    },
    cartItemCount() {
      return this.cart.reduce((total, item) => total + item.quantity, 0);
    },
    getCategoryName() {
      return (categoryKey) => {
        const category = this.categories.find((c) => c.key === categoryKey);
        return category ? category.name : "";
      };
    },
  },
  methods: {
    checkLoginStatus() {
      this.isLoggedIn =
        !!sessionStorage.getItem("isLoggedInPos") ||
        !!sessionStorage.getItem("posToken");
    },
    navigateToLogin() {
      this.$router.push({ name: "Login" });
    },
    selectCategory(categoryKey) {
      this.selectedCategory = categoryKey;
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
      const existingItem = this.cart.find(
        (item) => item.productId === productToAdd.id
      );
      if (existingItem) {
        existingItem.quantity++;
      } else {
        this.cart.push({
          productId: productToAdd.id,
          name: productToAdd.name,
          price: productToAdd.price,
          quantity: 1,
        });
      }
      this.saveCartToLocalStorage();
    },
    handleUpdateQuantity({ productId, change }) {
      const itemInCart = this.cart.find((item) => item.productId === productId);
      if (itemInCart) {
        itemInCart.quantity += change;
        if (itemInCart.quantity <= 0) {
          this.actuallyRemoveItem(productId, false);
        } else {
          this.saveCartToLocalStorage();
        }
      }
    },
    handleRemoveItem(productIdToRemove) {
      const itemToRemove = this.cart.find(
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
          if (result.isConfirmed)
            this.actuallyRemoveItem(productIdToRemove, true);
        });
      }
    },
    actuallyRemoveItem(productIdToRemove, showSwal) {
      const item = this.cart.find((i) => i.productId === productIdToRemove);
      this.cart = this.cart.filter((i) => i.productId !== productIdToRemove);
      this.saveCartToLocalStorage();
      if (showSwal && item) {
        Swal.fire("Removed!", `${item.name} removed.`, "success", {
          timer: 1500,
          showConfirmButton: false,
        });
      }
    },
    handleCheckout(totalAmount) {
      if (this.cart.length === 0) {
        Swal.fire("Cart Empty", "Add products before checkout.", "warning");
        return;
      }

      this.$store.dispatch("updateAmount", totalAmount);
      this.$router.push({ name: "CheckoutPayment" });
    },
    saveCartToLocalStorage() {
      localStorage.setItem("miniPosCart", JSON.stringify(this.cart));
    },
    loadCartFromLocalStorage() {
      const savedCart = localStorage.getItem("miniPosCart");
      if (savedCart) this.cart = JSON.parse(savedCart);
    },
    clearCartOnly() {
      this.cart = [];
      this.saveCartToLocalStorage();
      this.$store.dispatch("clearAmount"); // Also clear amount in Vuex
    },
    clearCartWithConfirmation() {
      if (this.cart.length === 0) {
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
          this.clearCartOnly();
          Swal.fire("Cleared!", "Cart has been cleared.", "success");
        }
      });
    },
    checkAndProcessPaymentStatus() {
      const status = this.$route.query.payment_status;
      if (status === "success") {
        this.clearCartOnly(); // This will also clear Vuex amount
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
  },
  created() {
    this.loadCartFromLocalStorage();
    this.checkLoginStatus();
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