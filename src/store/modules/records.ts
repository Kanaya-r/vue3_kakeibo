import type { Module } from 'vuex';

type Record = {
  id: number;
  type: 'income' | 'expense';
  date: string;
  amount: number;
  memo: string;
  tag: string;
};

type RecordsState = {
  records: Record[];
};

const recordsModule: Module<RecordsState, any> = {
  state: (): RecordsState => ({
    records: JSON.parse(localStorage.getItem('records') || '[]')
  }),

  mutations: {
    addRecord(state: RecordsState, record: Record) {
      state.records.push(record);
      localStorage.setItem('records', JSON.stringify(state.records));
    },
    removeRecord(state: RecordsState, recordId: number) {
      state.records = state.records.filter(record => record.id !== recordId);
      localStorage.setItem('records', JSON.stringify(state.records));
    }
  },

  actions: {
    addRecord({ commit }, record: Record) {
      commit('addRecord', record);
    },
    removeRecord({ commit }, recordId: number) {
      commit('removeRecord', recordId);
    }
  },

  getters: {
    records: (state: RecordsState) => state.records
  }
};

export default recordsModule;