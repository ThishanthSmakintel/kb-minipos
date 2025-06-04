import { createStore } from "vuex";
import axios from "axios";

export default createStore({
  state() {
    return {
      amount: 0,
      allProductsList: [], // Holds ALL products fetched initially
      displayedProducts: [], // Holds products to be displayed (all, or by category)
      categories: [],
      cart: [],
      isProductLoading: false,
    };
  },
  mutations: {
    setAmount(state, value) {
      state.amount = value;
    },
    SET_CART(state, cartItems) {
      state.cart = cartItems;
    },
    ADD_TO_CART(state, productToAdd) {
      const existingItem = state.cart.find(
        (item) => item.productId === productToAdd.id
      );
      if (existingItem) {
        existingItem.quantity++;
      } else {
        state.cart.push({
          productId: productToAdd.id,
          name: productToAdd.name,
          price: parseFloat(productToAdd.price),
          quantity: 1,
        });
      }
    },
    UPDATE_ITEM_QUANTITY(state, { productId, change }) {
      const itemInCart = state.cart.find(
        (item) => item.productId === productId
      );
      if (itemInCart) {
        itemInCart.quantity += change;
        if (itemInCart.quantity <= 0) {
          state.cart = state.cart.filter(
            (item) => item.productId !== productId
          );
        }
      }
    },
    REMOVE_ITEM_FROM_CART(state, productIdToRemove) {
      state.cart = state.cart.filter(
        (item) => item.productId !== productIdToRemove
      );
    },
    CLEAR_CART(state) {
      state.cart = [];
    },
    SET_CATEGORIES(state, categoriesData) {
      state.categories = categoriesData;
    },
    SET_ALL_PRODUCTS_LIST(state, productsData) {
      // For all products
      state.allProductsList = productsData;
    },
    SET_DISPLAYED_PRODUCTS(state, productsData) {
      // For displayed products
      state.displayedProducts = productsData;
    },
    CLEAR_DISPLAYED_PRODUCTS(state) {
      state.displayedProducts = [];
    },
    SET_PRODUCT_LOADING(state, isLoading) {
      state.isProductLoading = isLoading;
    },
  },
  actions: {
    updateAmount({ commit }, value) {
      commit("setAmount", value);
    },
    clearAmount({ commit }) {
      commit("setAmount", 0);
    },
    loadCartFromLocalStorage({ commit }) {
      const savedCart = localStorage.getItem("miniPosCart");
      if (savedCart) {
        commit("SET_CART", JSON.parse(savedCart));
      }
    },
    saveCartToLocalStorage({ state }) {
      localStorage.setItem("miniPosCart", JSON.stringify(state.cart));
    },
    addItemToCart({ commit, dispatch }, productToAdd) {
      commit("ADD_TO_CART", productToAdd);
      dispatch("saveCartToLocalStorage");
    },
    updateCartItemQuantity({ commit, dispatch }, payload) {
      commit("UPDATE_ITEM_QUANTITY", payload);
      dispatch("saveCartToLocalStorage");
    },
    removeItemFromCart({ commit, dispatch }, productId) {
      commit("REMOVE_ITEM_FROM_CART", productId);
      dispatch("saveCartToLocalStorage");
    },
    clearCart({ commit, dispatch }) {
      commit("CLEAR_CART");
      dispatch("clearAmount");
      dispatch("saveCartToLocalStorage");
    },
    async fetchCategories({ commit }) {
      commit("SET_PRODUCT_LOADING", true);
      try {
        const token = sessionStorage.getItem("posToken");
        const response = await axios.post(
          "http://demo.app.kenwynbooks.com/api/pos/products/get-all-product-categories.php",
          {},
          {
            headers: {
              /* Your Headers */ Authorization: `Bearer ${token}`,
              "Api-Key": "kenwynaccounting.com",
              "Content-Type": "application/json",
            },
          }
        );
        if (response.data?.code === 200 && response.data?.data) {
          const formattedCategories = response.data.data.map((cat) => ({
            key: cat.id,
            name: cat.value,
            id: cat.id,
          }));
          commit("SET_CATEGORIES", formattedCategories);
        } else {
          console.error("Failed to fetch categories:", response.data?.message);
          commit("SET_CATEGORIES", []);
        }
      } catch (error) {
        console.error("API error in fetchCategories:", error);
        commit("SET_CATEGORIES", []);
      } finally {
        // Do not set product loading false here, let product fetching do it
      }
    },
    // Action to fetch ALL products (for initial load)
    async fetchAllProducts({ commit }) {
      commit("SET_PRODUCT_LOADING", true);
      try {
        const token = sessionStorage.getItem("posToken");
        // Use your endpoint that returns ALL products
        // Assuming get-all-products.php without categoryId returns all
        const response = await axios.post(
          "http://demo.app.kenwynbooks.com/api/pos/products/get-all-products.php",
          {}, // Empty body for all products, or adjust if API needs a specific flag
          {
            headers: {
              /* Your Headers */ Authorization: `Bearer ${token}`,
              "Api-Key": "kenwynaccounting.com",
              "Content-Type": "application/json",
            },
          }
        );
        if (response.data?.code === 200 && response.data?.data) {
          const formattedProducts = response.data.data.map((prod) => ({
            id: prod.id,
            name: prod.name,
            price: parseFloat(prod.salesPrice) || 0,
            category: prod.categoryId,
            imageName: prod.imageName, // From your API structure
            imagePath: prod.imagePath, // From your API structure (if backend adds it)
          }));
          commit("SET_ALL_PRODUCTS_LIST", formattedProducts);
          commit("SET_DISPLAYED_PRODUCTS", formattedProducts); // Initially display all
        } else {
          console.error(
            "Failed to fetch all products:",
            response.data?.message
          );
          commit("SET_ALL_PRODUCTS_LIST", []);
          commit("SET_DISPLAYED_PRODUCTS", []);
        }
      } catch (error) {
        console.error("API error fetching all products:", error);
        commit("SET_ALL_PRODUCTS_LIST", []);
        commit("SET_DISPLAYED_PRODUCTS", []);
      } finally {
        commit("SET_PRODUCT_LOADING", false);
      }
    },
    // Action to fetch products BY CATEGORY using the new endpoint
    async fetchProductsByCategory({ commit }, categoryId) {
      if (!categoryId) {
        // If no categoryId, show all products from the initially fetched list
        // This case might be handled in component by calling fetchAllProducts or setting displayed = all
        // For now, let's assume categoryId will always be present when this action is called for filtering
        console.warn(
          "fetchProductsByCategory called without categoryId. Action not run."
        );
        // commit('SET_DISPLAYED_PRODUCTS', state.allProductsList); // Option: revert to all products
        return;
      }
      commit("CLEAR_DISPLAYED_PRODUCTS");
      commit("SET_PRODUCT_LOADING", true);
      console.log(
        `Fetching products for category ID: ${categoryId} using new endpoint`
      );
      try {
        const token = sessionStorage.getItem("posToken");
        const response = await axios.post(
          // YOUR NEW ENDPOINT HERE
          "http://demo.app.kenwynbooks.com/api/pos/products/get-all-product-categories-via-catagories.php",
          { categoryId: String(categoryId) }, // Send categoryId, ensure it's a string if API expects
          {
            headers: {
              /* Your Headers */ Authorization: `Bearer ${token}`,
              "Api-Key": "kenwynaccounting.com",
              "Content-Type": "application/json",
            },
          }
        );
        if (response.data?.code === 200 && response.data?.data) {
          const formattedProducts = response.data.data.map((prod) => ({
            id: prod.id,
            name: prod.name,
            price: parseFloat(prod.salesPrice) || 0,
            category: prod.categoryId,
            imageName: prod.imageName,
            imagePath: prod.imagePath,
          }));
          commit("SET_DISPLAYED_PRODUCTS", formattedProducts);
        } else {
          console.error(
            `Failed to fetch products for category ${categoryId}:`,
            response.data?.message
          );
          commit("SET_DISPLAYED_PRODUCTS", []);
        }
      } catch (error) {
        console.error(
          `API error fetching products for category ${categoryId}:`,
          error
        );
        commit("SET_DISPLAYED_PRODUCTS", []);
      } finally {
        commit("SET_PRODUCT_LOADING", false);
      }
    },
  },
  getters: {
    getAmount: (state) => state.amount,
    // allProducts: (state) => state.allProductsList, // Getter for the complete list
    displayedProducts: (state) => state.displayedProducts, // Getter for products to show
    allCategories: (state) => state.categories,
    cartItems: (state) => state.cart,
    cartItemCount: (state) => {
      return state.cart.reduce((total, item) => total + item.quantity, 0);
    },
    getCategoryNameByKey: (state) => (categoryKey) => {
      const category = state.categories.find(
        (c) => String(c.key) === String(categoryKey)
      );
      return category ? category.name : "";
    },
    isProductLoading: (state) => state.isProductLoading,
  },
});
