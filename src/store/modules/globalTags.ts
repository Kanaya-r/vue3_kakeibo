import type { Module } from 'vuex'

type GlobalTag = {
  text: string;
  isEditing?: boolean;
};

type GlobalTagsState = {
  globalTags: GlobalTag[];
};

const globalTagsModule: Module<GlobalTagsState, any> = {
  state: (): GlobalTagsState => ({
    globalTags: JSON.parse(localStorage.getItem('globalTags') || '[]')
  }),

  mutations: {
    setGlobalTags(state: GlobalTagsState, tags: GlobalTag[]) {
      state.globalTags = tags;
      localStorage.setItem('globalTags', JSON.stringify(tags));
    },
    addGlobalTag(state: GlobalTagsState, tag: GlobalTag) {
      state.globalTags.push(tag);
      localStorage.setItem('globalTags', JSON.stringify(state.globalTags));
    },
    updateGlobalTag(state: GlobalTagsState, { index, tag }: { index: number; tag: GlobalTag }) {
      state.globalTags[index] = tag;
      localStorage.setItem('globalTags', JSON.stringify(state.globalTags));
    },
    removeGlobalTag(state: GlobalTagsState, index: number) {
      state.globalTags.splice(index, 1);
      localStorage.setItem('globalTags', JSON.stringify(state.globalTags));
    }
  },

  actions: {
    initializeGlobalTags({ commit }) {
      const tags: GlobalTag[] = JSON.parse(localStorage.getItem('globalTags') || '[]');
      commit('setGlobalTags', tags);
    },
    addGlobalTag({ commit }, tag: GlobalTag) {
      commit('addGlobalTag', tag);
    },
    updateGlobalTag({ commit }, payload: { index: number; tag: GlobalTag }) {
      commit('updateGlobalTag', payload);
    },
    removeGlobalTag({ commit }, index: number) {
      commit('removeGlobalTag', index);
    }
  },

  getters: {
    globalTags: (state: GlobalTagsState) => state.globalTags
  }
};

export default globalTagsModule;