<template>
  <div
    class="d-flex align-items-center justify-content-center min-vh-100 bg-light"
  >
    <div class="payment-box text-center shadow p-4 p-md-5 bg-white rounded">
      <h2 class="mb-3 text-dark">Complete Payment</h2>
      <p class="text-secondary mb-4 fs-4">
        <strong>Total Amount:</strong> ${{ amountFromStore.toFixed(2) }}
      </p>

      <div class="d-grid gap-2 d-sm-flex justify-content-sm-center mb-4">
        <button
          type="button"
          @click="selectPaymentMethod('qr')"
          :class="[
            'btn',
            paymentMethod === 'qr' ? 'btn-primary' : 'btn-outline-primary',
            'px-4',
          ]"
        >
          Pay via QR Code
        </button>
        <button
          type="button"
          @click="selectPaymentMethod('cash')"
          :class="[
            'btn',
            paymentMethod === 'cash' ? 'btn-primary' : 'btn-outline-primary',
            'px-4',
          ]"
        >
          Pay via Cash
        </button>
      </div>

      <div v-if="paymentMethod === 'qr'" class="qr-payment-section my-4">
        <h3 class="mb-3 fs-5 text-dark">Scan QR Code to Pay</h3>
        <img
          :src="`https://api.qrserver.com/v1/create-qr-code/?data=PaymentForAmount${amountFromStore.toFixed(
            2
          )}-Ref${Date.now()}&size=200x200&qzone=1&margin=10`"
          alt="QR Code"
          class="img-fluid mb-3 border rounded shadow-sm"
        />
        <p class="text-muted small">
          Scan this code with your preferred payment application.
        </p>
      </div>

      <div v-if="paymentMethod === 'cash'" class="cash-payment-section my-4">
        <h3 class="mb-3 fs-5 text-dark">Cash Payment</h3>
        <div class="mb-3">
          <label for="cashReceived" class="form-label visually-hidden"
            >Cash Received</label
          >
          <input
            type="number"
            step="0.01"
            min="0"
            class="form-control form-control-lg text-center"
            id="cashReceived"
            v-model.number="cashReceived"
            placeholder="Enter cash amount received"
            aria-describedby="cash-feedback"
          />
        </div>
        <div id="cash-feedback">
          <p
            v-if="cashReceived !== null && cashReceived >= amountFromStore"
            class="fs-5 text-success fw-bold mb-1"
          >
            Change: ${{ balance.toFixed(2) }}
          </p>
          <p
            v-if="
              cashReceived !== null &&
              cashReceived < amountFromStore &&
              cashReceived >= 0
            "
            class="fs-5 text-danger fw-bold mb-1"
          >
            Remaining Due: ${{ amountStillDue.toFixed(2) }}
          </p>
          <p
            v-if="
              (cashReceived === null || cashReceived < 0) && amountFromStore > 0
            "
            class="fs-6 text-muted mb-1"
          >
            Please enter the amount of cash received.
          </p>
        </div>
      </div>

      <div class="d-grid gap-2 mt-4">
        <button
          class="btn btn-success btn-lg"
          @click="handleConfirmPayment"
          :disabled="isConfirmDisabled"
        >
          Confirm Payment
        </button>
        <button class="btn btn-secondary btn-lg" @click="goBack">
          Back to POS
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex"; // Import useStore

export default {
  name: "CheckoutPayment",
  // Props section for 'amount' is removed as it comes from Vuex
  emits: ["payment-confirmed", "payment-cancelled"],
  setup(props, { emit }) {
    const router = useRouter();
    const store = useStore();

    // Get the checkout amount from Vuex store using your 'getAmount' getter
    const amountFromStore = computed(() => store.getters.getAmount);
    // Alternatively, directly access state:
    // const amountFromStore = computed(() => store.state.amount);

    const paymentMethod = ref("qr");
    const cashReceived = ref(null);

    const selectPaymentMethod = (method) => {
      paymentMethod.value = method;
      if (method === "qr") {
        cashReceived.value = null;
      }
    };

    const amountStillDue = computed(() => {
      if (
        paymentMethod.value === "cash" &&
        typeof cashReceived.value === "number" &&
        cashReceived.value >= 0 &&
        cashReceived.value < amountFromStore.value // Use Vuex state value
      ) {
        return amountFromStore.value - cashReceived.value;
      }
      return 0;
    });

    const balance = computed(() => {
      if (
        paymentMethod.value === "cash" &&
        typeof cashReceived.value === "number" &&
        cashReceived.value >= amountFromStore.value // Use Vuex state value
      ) {
        return cashReceived.value - amountFromStore.value;
      }
      return 0;
    });

    const isConfirmDisabled = computed(() => {
      if (paymentMethod.value === "cash") {
        return (
          typeof cashReceived.value !== "number" ||
          cashReceived.value < amountFromStore.value || // Use Vuex state value
          cashReceived.value < 0
        );
      }
      return false;
    });

    const handleConfirmPayment = () => {
      let paymentDetails = {};
      const currentAmount = amountFromStore.value; // Use Vuex state value

      if (paymentMethod.value === "qr") {
        console.log("QR Payment Confirmed for Amount:", currentAmount);
        paymentDetails = { method: "qr", amount: currentAmount };
      } else if (paymentMethod.value === "cash") {
        if (
          typeof cashReceived.value === "number" &&
          cashReceived.value >= currentAmount
        ) {
          console.log(
            "Cash Payment Confirmed. Amount Due:",
            currentAmount,
            "Cash Received:",
            cashReceived.value,
            "Change:",
            balance.value
          );
          paymentDetails = {
            method: "cash",
            amount: currentAmount,
            cashReceived: cashReceived.value,
            change: balance.value,
          };
        } else {
          return; // Should be prevented by isConfirmDisabled
        }
      }
      emit("payment-confirmed", paymentDetails);

      // Optional: Clear the amount in Vuex store after successful payment
      // store.dispatch('updateAmount', 0); // Or a dedicated clearAmount action

      router.push({ name: "POS", query: { payment_status: "success" } });
    };

    const goBack = () => {
      emit("payment-cancelled");

      // Optional: Clear the amount in Vuex store if payment is cancelled
      // store.dispatch('updateAmount', 0); // Or a dedicated clearAmount action

      router.push({ name: "POS", query: { payment_status: "cancelled" } });
    };

    return {
      amountFromStore, // Use this in the template
      paymentMethod,
      cashReceived,
      balance,
      amountStillDue,
      isConfirmDisabled,
      selectPaymentMethod,
      handleConfirmPayment,
      goBack,
    };
  },
};
</script>

<style scoped>
/* Styles remain the same */
.payment-box {
  width: 100%;
  max-width: 480px;
  border-radius: 0.75rem;
}
img.img-fluid {
  max-width: 220px;
  display: block;
  margin-left: auto;
  margin-right: auto;
}
/* ... other styles */
</style>