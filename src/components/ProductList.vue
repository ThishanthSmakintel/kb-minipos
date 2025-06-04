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
      // When an image fails to load, replace it with a more specific placeholder
      // or a generic one. You can also add product name to placeholder.
      const productName = event.target.alt || "Product"; // Get product name from alt text
      event.target.src = `https://placehold.co/600x400?text=${encodeURIComponent(
        productName
      )}%0ANo+Image`;
      // You could also add a class to style broken images differently
      // event.target.classList.add('image-error');
    },
    encodeURIComponent(str) {
      // Helper to ensure product names with special characters are properly encoded for URL
      return encodeURIComponent(str);
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
  z-index: 5; /* Ensure it comes above other elements on hover if needed */
}

.product-card:active {
  transform: translateY(-4px); /* Slightly less lift on active click */
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 100%;
  height: 200px; /* Or use aspect-ratio css property for modern browsers */
  /* aspect-ratio: 3 / 2; */
  object-fit: cover; /* Or 'contain' if you don't want cropping */
  border-bottom: 1px solid #ddd;
  user-select: none; /* Prevent image selection */
  background-color: #f8f9fa; /* Light background for images that might not fill */
}

.card-body {
  padding: 1rem 1.25rem;
  display: flex; /* Already there, good */
  flex-direction: column; /* Already there, good */
  justify-content: center; /* Align items vertically if card-body is taller */
}

.product-name {
  font-size: 1.1rem; /* Slightly larger for better readability */
  font-weight: 600;
  min-height: 3.5em; /* Adjust if needed, aims for roughly 2-3 lines */
  line-height: 1.3;
  word-break: break-word; /* Handles long product names */
  color: #333; /* Darker text for better contrast */
}

.product-price {
  font-size: 1.3rem; /* Prominent price */
  color: #007bff; /* Bootstrap primary blue, good for call to action */
  margin-top: auto; /* Pushes price to the bottom if card-body has extra space */
  font-weight: 700;
}

/* Optional: Style for images that failed to load and are using placeholder */
/* .product-image.image-error { */
/* Styles for images that couldn't load, e.g., different background */
/* } */
</style>