import $api from "@/services/service-api";

const routes = {
    fx_rate: "/transactions/rates",
    exchange_history: "transactions/exchange-transaction",
};

export default {
    // ==================================
    // FETCH ALL FX RATES
    // ==================================
    async fetchAllFxRates({ commit }) {
        const response = await $api.fetch(routes.fx_rate);
        if (response.code === 200) commit("UPDATE_FX_RATES", response.data);
        return response;
    },

    // ==================================
    // FETCH EXCHANGE TXNs
    // ==================================
    async fetchAllFxTransactions({ commit }, payload) {
        const response = await $api.push(routes.exchange_history, { payload });
        if (response.code === 200) commit("UPDATE_FX_TABLE", response.data);
        return response;
    },
};