import { createStore } from 'vuex';
import records from './modules/records.js';
import globalTags from './modules/globalTags.js';

export default createStore({
  modules: {
    records,
    globalTags
  }
});