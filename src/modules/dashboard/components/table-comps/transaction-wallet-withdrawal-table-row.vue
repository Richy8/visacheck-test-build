<template>
  <tr @click="toggleTransactionSummaryModal">
    <td class="body-data" :class="`${table_name}-1`">{{ getCreatedDate }}</td>

    <td class="body-data text-no-wrap" :class="`${table_name}-2`">
      {{ data.reference }}
    </td>

    <td class="body-data" :class="`${table_name}-3`">
      {{ data.beneficiary_name || "-" }}
    </td>

    <td class="body-data" :class="`${table_name}-4`">
      {{ $money.getSign(data.currency) }}{{ $money.addComma(data.amount) }}
    </td>

    <td class="body-data" :class="`${table_name}-5`">
      <TagCard
        :card_text="data.status === 'failed' ? 'Failed' : 'Completed'"
        :card_type="data.status === 'failed' ? 'error' : 'success'"
      />
    </td>

    <td class="body-data" :class="`${table_name}-6`">
      <button class="btn btn-secondary btn-sm">View</button>
    </td>

    <!-- MODALS -->
    <portal to="vesicash-modals">
      <transition name="fade" v-if="show_transaction_summary_modal">
        <TransactionSummaryModal
          withdrawals
          type="wallet"
          :summary_data="getSummaryData"
          @closeTriggered="toggleTransactionSummaryModal"
        />
      </transition>
    </portal>
  </tr>
</template>

<script>
import TagCard from "@/shared/components/card-comps/tag-card";

export default {
  name: "TransactionWalletWthdrawalTableRow",

  components: {
    TagCard,

    TransactionSummaryModal: () =>
      import(
        /* webpackChunkName: "dashboard-table-module" */ "@/modules/dashboard/modals/transaction-summary-modal"
      ),
  },

  props: {
    table_name: {
      type: String,
      default: "",
    },

    data: {
      type: Object,
      default: () => ({}),
    },
  },

  computed: {
    getCreatedDate() {
      let { d3, m4, y1, h01, b2, a0 } = this.$date
        .formatDate(this.data.created_at)
        .getAll();

      return `${d3} ${m4}, ${y1} ${h01}:${b2}${a0}`;
    },

    getSummaryData() {
      return [
        {
          title: "Transaction date",
          value: this.getCreatedDate,
        },
        {
          title: "Reference id",
          value: this.data.reference,
        },
        {
          title: "Currency",
          value: this.data.currency,
        },
        {
          title: "Total amount",
          value: `${this.$money.getSign(
            this.data.currency
          )}${this.$money.addComma(Number(this.data.amount) + this.data.fee)}`,
        },
        {
          title: "Amount received",
          value: `${this.$money.getSign(
            this.data.currency
          )}${this.$money.addComma(this.data.amount)}`,
        },
        {
          title: "Withdraw charge",
          value: `${this.$money.getSign(
            this.data.currency
          )}${this.$money.addComma(this.data.fee)}`,
        },
        {
          title: "Baneficiary name",
          value: this.data.beneficiary_name,
        },
        {
          title: "Bank name",
          value: this.data.bank_name,
        },
        {
          title: "Account number",
          value: this.data.bank_account_number,
        },
        {
          title: "Transaction status",
          value: this.data.status === "failed" ? "Failed" : "Completed",
        },
      ];
    },
  },

  data: () => ({
    show_transaction_summary_modal: false,
  }),

  methods: {
    toggleTransactionSummaryModal() {
      this.show_transaction_summary_modal =
        !this.show_transaction_summary_modal;
    },
  },
};
</script>

<style>
</style>