<template>
  <footer class="text-center p-4 p-md-5 border-top bg-light mt-auto">
    <div class="container-fluid">
      <p class="mb-0">
        &copy; {{ new Date().getFullYear() }} Kenwyn Books. All rights reserved.
      </p>
    </div>
  </footer>
</template>

<script>
export default {
  name: "CommonFooter",
  data() {
    return {
      currentYear: new Date().getFullYear(),
    };
  },
};
</script>

<style scoped>
/* Add any footer-specific styles here */
footer {
  font-size: 0.9rem;
}
</style>