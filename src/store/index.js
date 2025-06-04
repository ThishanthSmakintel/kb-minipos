import { createStore } from "vuex";
import axios from "axios";

export default createStore({
  state() {
    return {
      amount: 0,
      allProductsList: [],
      displayedProducts: [],
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
          // You might want to add imagePath here if needed directly in cart item
          // imagePath: productToAdd.imagePath
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
      state.allProductsList = productsData;
    },
    SET_DISPLAYED_PRODUCTS(state, productsData) {
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
      commit("SET_PRODUCT_LOADING", true); // Or a specific category loading flag
      try {
        const token = sessionStorage.getItem("posToken");
        const response = await axios.post(
          "http://demo.app.kenwynbooks.com/api/pos/products/get-all-product-categories.php",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
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
      }
      // SET_PRODUCT_LOADING will be set to false by product fetching actions
    },
    async fetchAllProducts({ commit }) {
      commit("SET_PRODUCT_LOADING", true);
      try {
        const token = sessionStorage.getItem("posToken");
        const response = await axios.post(
          "http://demo.app.kenwynbooks.com/api/pos/products/get-all-products.php", // Endpoint for ALL products
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
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
            imageName: prod.imageName, // Original imageName from API
            imagePath: prod.imagePath, // Full imagePath from API (if backend adds it)
            // If backend doesn't add imagePath, you might construct it here
            // based on prod.imageName and a BASE_URL if needed.
            // But your PHP now adds it, so this should be correct.
          }));
          commit("SET_ALL_PRODUCTS_LIST", formattedProducts);
          commit("SET_DISPLAYED_PRODUCTS", formattedProducts);
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
    async fetchProductsByCategory({ commit }, categoryId) {
      if (!categoryId) {
        console.warn("fetchProductsByCategory called without categoryId.");
        // Option: Revert to showing all products or clear
        // commit('SET_DISPLAYED_PRODUCTS', this.state.allProductsList); // Assuming 'this' context if not arrow fn
        commit("CLEAR_DISPLAYED_PRODUCTS");
        return;
      }
      commit("CLEAR_DISPLAYED_PRODUCTS");
      commit("SET_PRODUCT_LOADING", true);
      try {
        const token = sessionStorage.getItem("posToken");
        const response = await axios.post(
          "http://demo.app.kenwynbooks.com/api/pos/products/get-all-product-categories-via-catagories.php", // Your new endpoint
          { categoryId: String(categoryId) },
          {
            headers: {
              Authorization: `Bearer ${token}`,
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
            imageName: prod.imageName, // Original imageName from API
            imagePath: prod.imagePath, // Full imagePath from API (backend should be providing this)
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
    displayedProducts: (state) => state.displayedProducts,
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
