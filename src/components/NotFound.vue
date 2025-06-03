<template>
  <div class="container text-center mt-5 pt-5">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <div class="card shadow-sm p-4">
          <h1 class="display-1 fw-bold text-danger">404</h1>
          <h2 class="h3">Page Not Found</h2>
          <p class="lead text-muted">
            Sorry, the page you are looking for does not exist or has been moved.
          </p>
          <hr>
          <p class="mb-0">
            <router-link to="/" class="btn btn-primary">Go to POS Home</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
};
</script>

