import { createStore } from "vuex";

export default createStore({
  state() {
    return {
      amount: 0,
    };
  },
  mutations: {
    setAmount(state, value) {
      state.amount = value;
    },
  },
  actions: {
    updateAmount({ commit }, value) {
      commit("setAmount", value);
    },
  },
  getters: {
    getAmount(state) {
      return state.amount;
    },
  },
});
