<template>
  <div class="product-list container-fluid px-0">
    <div
      v-if="!products || products.length === 0"
      class="alert alert-info mt-3"
      role="alert"
    >
      No products to display.
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
            :src="
              product.imagePath ||
              'https://placehold.co/600x400?text=' +
                encodeURIComponent(product.name)
            "
            class="card-img-top product-image"
            :alt="product.name"
            loading="lazy"
            @error="onImageError"
          />
          <div class="card-body d-flex flex-column text-center">
            <h5
              class="card-title h5 flex-grow-1 d-flex align-items-center justify-content-center mb-3 product-name"
            >
              {{ product.name }}
            </h5>
            <p class="card-text text-primary fw-bold fs-4 mb-0 product-price">
              ${{ product.price ? product.price.toFixed(2) : "0.00" }}
            </p>
            <p
              class="card-text text-secondary fw-semibold fs-6 mb-0 product-stock"
            >
              Available Stock: {{ product.totalQuantityPurchased }}
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
    onImageError(event) {
      const productName = event.target.alt || "Product";
      event.target.src = `https://placehold.co/600x400?text=${encodeURIComponent(
        productName
      )}%0ANo+Image`;
    },
    encodeURIComponent(str) {
      return encodeURIComponent(str);
    },
  },
};
</script>

<style scoped>
/* Product Card Styling */
.product-card {
  cursor: pointer;
  border-radius: 1rem;
  overflow: hidden;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.product-card:hover,
.product-card:focus-visible {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  z-index: 10;
}

.product-card:active {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
}

/* Product Image Styling */
.product-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-bottom: 1px solid #eee;
  background-color: #f0f2f5;
  transition: filter 0.3s ease;
  user-select: none;
}

.product-card:hover .product-image {
  filter: brightness(0.95);
}

/* Card Body Enhancements */
.card-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  text-align: center;
  gap: 0.75rem;
}

/* Product Name Typography */
.product-name {
  font-size: 1.15rem;
  font-weight: 600;
  color: #1e1e1e;
  min-height: 3em;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1.3;
  word-break: break-word;
}

/* Product Price */
.product-price {
  font-size: 1.3rem;
  font-weight: 700;
  color: #0d6efd;
  margin-bottom: 0.25rem;
}

/* Stock Text */
.product-stock {
  font-size: 0.95rem;
  color: #555;
}

/* Responsive Improvements */
@media (max-width: 576px) {
  .product-image {
    height: 180px;
  }

  .product-name {
    font-size: 1rem;
  }

  .product-price {
    font-size: 1.1rem;
  }
}
</style>
