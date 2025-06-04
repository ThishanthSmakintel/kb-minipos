import { createStore } from "vuex";
import axios from "axios";

// Helper function to adjust stock in product lists
function adjustStockInList(productList, productId, quantityChange) {
  const product = productList.find((p) => String(p.id) === String(productId));
  if (product && typeof product.availableStock === "number") {
    // Ensure availableStock exists and is a number
    product.availableStock += quantityChange;
  } else if (product) {
    // If product exists but availableStock is not a number, initialize or warn
    // console.warn(`Product ${productId} availableStock is not a number, initializing.`);
    // product.availableStock = 0 + quantityChange; // Or handle as an error
  }
}

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
        (item) => String(item.productId) === String(productToAdd.id)
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
      adjustStockInList(state.allProductsList, productToAdd.id, -1);
      adjustStockInList(state.displayedProducts, productToAdd.id, -1);
    },
    UPDATE_ITEM_QUANTITY(state, { productId, change }) {
      const itemInCart = state.cart.find(
        (item) => String(item.productId) === String(productId)
      );
      if (itemInCart) {
        itemInCart.quantity += change;
        adjustStockInList(state.allProductsList, productId, -change);
        adjustStockInList(state.displayedProducts, productId, -change);

        if (itemInCart.quantity <= 0) {
          state.cart = state.cart.filter(
            (item) => String(item.productId) !== String(productId)
          );
        }
      }
    },
    REMOVE_ITEM_FROM_CART(state, productIdToRemove) {
      const itemIndex = state.cart.findIndex(
        (item) => String(item.productId) === String(productIdToRemove)
      );
      if (itemIndex > -1) {
        const removedItem = state.cart[itemIndex];
        adjustStockInList(
          state.allProductsList,
          productIdToRemove,
          removedItem.quantity
        );
        adjustStockInList(
          state.displayedProducts,
          productIdToRemove,
          removedItem.quantity
        );
        state.cart.splice(itemIndex, 1);
      }
    },
    CLEAR_CART(state) {
      state.cart.forEach((cartItem) => {
        adjustStockInList(
          state.allProductsList,
          cartItem.productId,
          cartItem.quantity
        );
        adjustStockInList(
          state.displayedProducts,
          cartItem.productId,
          cartItem.quantity
        );
      });
      state.cart = [];
    },
    SET_CATEGORIES(state, categoriesData) {
      state.categories = categoriesData;
    },
    SET_ALL_PRODUCTS_LIST(state, productsData) {
      state.allProductsList = productsData.map((p) => ({
        ...p,
        availableStock: parseInt(p.availableStock, 10) || 0,
        initialStockForSession:
          parseInt(p.initialStockForSession, 10) ||
          parseInt(p.availableStock, 10) ||
          0, // Ensure initialStockForSession is also set
      }));
    },
    SET_DISPLAYED_PRODUCTS(state, productsData) {
      state.displayedProducts = productsData.map((p) => ({
        ...p,
        availableStock: parseInt(p.availableStock, 10) || 0,
        initialStockForSession:
          parseInt(p.initialStockForSession, 10) ||
          parseInt(p.availableStock, 10) ||
          0, // Ensure initialStockForSession is also set
      }));
    },
    CLEAR_DISPLAYED_PRODUCTS(state) {
      state.displayedProducts = [];
    },
    SET_PRODUCT_LOADING(state, isLoading) {
      state.isProductLoading = isLoading;
    },
    RECONCILE_STOCK_WITH_CART(state) {
      if (!state.cart) return; // Guard against null cart

      const cartQuantities = new Map();
      state.cart.forEach((item) => {
        cartQuantities.set(String(item.productId), item.quantity);
      });

      state.allProductsList.forEach((product) => {
        const quantityInCart = cartQuantities.get(String(product.id)) || 0;
        if (product.initialStockForSession !== undefined) {
          product.availableStock =
            product.initialStockForSession - quantityInCart;
        }
      });
      // Refresh displayedProducts from the reconciled allProductsList
      // This assumes displayedProducts should be a reflection or filtered version of allProductsList
      // If a category filter was active, you might need to re-apply it here.
      const currentCategoryFilterId =
        state.displayedProducts.length > 0 &&
        state.allProductsList.length !== state.displayedProducts.length
          ? state.displayedProducts[0]?.category // A simple way to check if a filter might be active; needs robust category tracking if used
          : null;

      if (
        currentCategoryFilterId &&
        state.categories.some(
          (c) => String(c.id) === String(currentCategoryFilterId)
        )
      ) {
        state.displayedProducts = JSON.parse(
          JSON.stringify(
            state.allProductsList.filter(
              (p) => String(p.category) === String(currentCategoryFilterId)
            )
          )
        );
      } else {
        state.displayedProducts = JSON.parse(
          JSON.stringify(state.allProductsList)
        );
      }
    },
  },
  actions: {
    updateAmount({ commit }, value) {
      commit("setAmount", value);
    },
    clearAmount({ commit }) {
      commit("setAmount", 0);
    },
    async initializeStore({ dispatch }) {
      await dispatch("loadCartFromLocalStorage");
      await dispatch("fetchCategories");
      await dispatch("fetchAllProducts");
    },
    loadCartFromLocalStorage({ commit }) {
      // Removed unused 'dispatch'
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
      // Note: SET_PRODUCT_LOADING is typically set to false in the action that fetches products
    },
    async fetchAllProducts({ commit }) {
      // Removed unused 'state', 'dispatch' as RECONCILE is now a commit
      commit("SET_PRODUCT_LOADING", true);
      try {
        const token = sessionStorage.getItem("posToken");
        const response = await axios.post(
          "http://demo.app.kenwynbooks.com/api/pos/products/get-all-products-stock-details.php",
          { customerId: "206" },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Api-Key": "kenwynaccounting.com",
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data?.code === 200 && response.data?.data?.products) {
          const formattedProducts = response.data.data.products.map((prod) => ({
            id: prod.productId,
            name: prod.productName,
            description: prod.productDescription,
            unit: prod.productUnit,
            price: parseFloat(prod.unitPrice) || 0,
            availableStock: parseInt(prod.totalQuantityPurchased, 10) || 0,
            initialStockForSession:
              parseInt(prod.totalQuantityPurchased, 10) || 0,
            category: prod.productCategoryId || null, // Assuming API provides productCategoryId
          }));

          commit("SET_ALL_PRODUCTS_LIST", formattedProducts);
          commit("RECONCILE_STOCK_WITH_CART"); // This will also update displayedProducts
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
    async fetchProductsByCategory({ commit, state }, categoryId) {
      // 'state' is used here, removed unused 'dispatch'
      if (state.allProductsList.length > 0) {
        commit("SET_PRODUCT_LOADING", true);
        const filteredProducts =
          categoryId && String(categoryId) !== "all" // Assuming "all" might be a value for showing all
            ? state.allProductsList.filter(
                (p) => String(p.category) === String(categoryId)
              )
            : JSON.parse(JSON.stringify(state.allProductsList));

        commit(
          "SET_DISPLAYED_PRODUCTS",
          JSON.parse(JSON.stringify(filteredProducts))
        );
        commit("SET_PRODUCT_LOADING", false);
        return;
      }

      // Fallback to API call if allProductsList is empty:
      // This path is less ideal for consistent stock if this API doesn't provide 'initialStockForSession'
      // or if allProductsList is the main source of truth for stock.
      if (!categoryId) {
        console.warn(
          "fetchProductsByCategory called without categoryId and no allProductsList loaded."
        );
        commit("CLEAR_DISPLAYED_PRODUCTS");
        return;
      }

      commit("CLEAR_DISPLAYED_PRODUCTS");
      commit("SET_PRODUCT_LOADING", true);
      try {
        const token = sessionStorage.getItem("posToken");
        const response = await axios.post(
          "http://demo.app.kenwynbooks.com/api/pos/products/get-all-product-categories-via-catagories.php",
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
            imageName: prod.imageName,
            imagePath: prod.imagePath,
            availableStock: parseInt(prod.stockFromCategoryApi, 10) || 0, // API MUST PROVIDE THIS
            initialStockForSession:
              parseInt(prod.stockFromCategoryApi, 10) || 0, // API MUST PROVIDE THIS
          }));
          commit("SET_DISPLAYED_PRODUCTS", formattedProducts);
          // If this list is independent, it needs its own reconciliation if cart exists
          // For now, assuming it should ideally come from allProductsList for consistency.
          // If you must reconcile this independent list:
          // commit("RECONCILE_STOCK_FOR_DISPLAYED_PRODUCTS_ONLY"); // would be a new specific mutation
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
