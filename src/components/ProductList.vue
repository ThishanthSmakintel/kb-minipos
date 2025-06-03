<template>
  <div class="product-list container-fluid px-0">
    <div
      v-if="!products || products.length === 0"
      class="alert alert-info mt-3"
      role="alert"
    >
      No products found in this category. Please select another category.
    </div>
    <div
      v-else
      class="row row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4"
    >
      <div
        v-for="product in products"
        :key="product.id"
        class="col d-flex align-items-stretch"
      >
        <div
          class="card h-100 product-card shadow-sm w-100"
          @click="selectProduct(product)"
          role="button"
          tabindex="0"
          @keypress.enter="selectProduct(product)"
          @keypress.space="selectProduct(product)"
        >
          <img
            :src="product.image || 'https://placehold.co/600x400'"
            class="card-img-top product-image"
            :alt="product.name"
            loading="lazy"
          />
          <div class="card-body d-flex flex-column text-center">
            <h5
              class="card-title h5 flex-grow-1 d-flex align-items-center justify-content-center mb-3 product-name"
            >
              {{ product.name }}
            </h5>
            <p class="card-text text-primary fw-bold fs-4 mb-0 product-price">
              ${{ product.price.toFixed(2) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProductList",
  props: {
    products: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  methods: {
    selectProduct(product) {
      this.$emit("add-to-cart", product);
    },
  },
};
</script>

<style scoped>
.product-card {
  cursor: pointer;
  border-radius: 0.75rem;
  transition: transform 0.25s ease-in-out, box-shadow 0.25s ease-in-out;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #fff;
}

.product-card:hover,
.product-card:focus-visible {
  transform: translateY(-8px);
  box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.15);
  z-index: 5;
}

.product-card:active {
  transform: translateY(-4px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-bottom: 1px solid #ddd;
  user-select: none;
}

.card-body {
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  min-height: 3.5em; /* Enough for 2 lines */
  line-height: 1.3;
  word-break: break-word;
  color: #333;
}

.product-price {
  font-size: 1.3rem;
  color: #007bff; /* Bootstrap primary blue */
  margin-top: auto;
  font-weight: 700;
}
</style>
