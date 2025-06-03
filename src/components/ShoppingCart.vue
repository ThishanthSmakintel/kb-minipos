<template>
  <div class="shopping-cart p-3 border rounded shadow-sm bg-white">
    <div
      v-if="!cartItems || cartItems.length === 0"
      class="alert alert-secondary text-center"
      role="alert"
    >
      Your cart is empty.
    </div>
    <div v-else>
      <ul class="list-group list-group-flush mb-3">
        <li
          v-for="item in cartItems"
          :key="item.productId"
          class="list-group-item d-flex justify-content-between align-items-center"
        >
          <div>
            <h6 class="my-0">{{ item.name }}</h6>
            <small class="text-muted"
              >Price: ${{ item.price.toFixed(2) }}</small
            >
          </div>
          <div class="d-flex align-items-center">
            <button
              @click="updateQuantity(item.productId, -1)"
              class="btn btn-sm btn-outline-secondary me-2"
              :disabled="item.quantity <= 1"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span class="me-2 quantity-text">{{ item.quantity }}</span>
            <button
              @click="updateQuantity(item.productId, 1)"
              class="btn btn-sm btn-outline-secondary me-2"
              aria-label="Increase quantity"
            >
              +
            </button>
            <span class="text-muted me-3 price-total"
              >${{ (item.price * item.quantity).toFixed(2) }}</span
            >
            <button
              @click="removeItem(item.productId)"
              class="btn btn-sm btn-danger"
              aria-label="Remove item"
            >
              &times;
            </button>
          </div>
        </li>
      </ul>
      <hr />
      <div class="d-flex justify-content-end align-items-center mb-3">
        <h5 class="me-3">Total:</h5>
        <h5 class="text-success">${{ totalAmount.toFixed(2) }}</h5>
      </div>
      <button
        @click="checkout"
        class="btn btn-success w-100 btn-lg"
        :disabled="cartItems.length === 0"
      >
        Proceed to Checkout
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "ShoppingCart",
  props: {
    cartItems: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  computed: {
    totalAmount() {
      return this.cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
    },
  },
  methods: {
    updateQuantity(productId, change) {
      this.$emit("update-quantity", { productId, change });
    },
    removeItem(productId) {
      this.$emit("remove-item", productId);
    },
    checkout() {
      this.$emit("checkout", this.totalAmount);
    },
  },
};
</script>

<style scoped>
.quantity-text {
  min-width: 20px; /* Ensures a minimum width for the quantity display */
  text-align: center;
  font-weight: bold;
}
.price-total {
  min-width: 70px; /* Ensure space for price */
  text-align: right;
}
.list-group-item {
  padding-left: 0;
  padding-right: 0;
}
</style>