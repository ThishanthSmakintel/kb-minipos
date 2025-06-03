<template>
  <div class="app-shell d-flex flex-column min-vh-100">
    <Header />
    <main class="main-content-area flex-grow-1"><router-view /></main>
    <Footer />
  </div>
</template>

<script setup>
// Assuming these are your common header and footer components
import Header from "../components/common/Header.vue";
import Footer from "../components/common/Footer.vue";
</script>

<style scoped>
.main-content {
  flex: 1; /* This makes the main content area expand and fill the space between header and footer */
  padding: 1rem; /* Adds padding inside the main content area */
  /* By default, a block-level element or a flex item like this will take up the full available width.
     No specific 'width: 100%' is usually needed unless overridden by other styles or parent constraints. */
}

/* Optional: If your Header/Footer have fixed heights and you want to ensure main-content scrolls if its content overflows */
/*
.main-content {
  overflow-y: auto;
}
*/
</style>