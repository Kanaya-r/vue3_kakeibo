export default {
  state() {
    return {
      records: JSON.parse(localStorage.getItem('records')) || []
    };
  },
  mutations: {
    addRecord(state, record) {
      state.records.push(record);
      localStorage.setItem('records', JSON.stringify(state.records));
    },
    removeRecord(state, recordId) {
      state.records = state.records.filter(record => record.id !== recordId);
      localStorage.setItem('records', JSON.stringify(state.records));
    }
  },
  actions: {
    addRecord({ commit }, record) {
      commit('addRecord', record);
    },
    removeRecord({ commit }, recordId) {
      commit('removeRecord', recordId);
    }
  },
  getters: {
    records: state => state.records
  }
};