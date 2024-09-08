export default {
  state() {
    return {
      globalTags: JSON.parse(localStorage.getItem('globalTags')) || []
    };
  },
  mutations: {
    addGlobalTag(state, tag) {
      state.globalTags.push(tag);
      localStorage.setItem('globalTags', JSON.stringify(state.globalTags));
    },
    removeGlobalTag(state, tag) {
      state.globalTags = state.globalTags.filter(t => t !== tag);
      localStorage.setItem('globalTags', JSON.stringify(state.globalTags));
    }
  },
  actions: {
    addGlobalTag({ commit }, tag) {
      commit('addGlobalTag', tag);
    },
    removeGlobalTag({ commit }, tag) {
      commit('removeGlobalTag', tag);
    }
  },
  getters: {
    globalTags: state => state.globalTags
  }
};