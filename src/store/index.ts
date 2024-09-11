import { createStore } from 'vuex';
import records from './modules/records';
import globalTags from './modules/globalTags';

export default createStore({
  modules: {
    records,
    globalTags
  }
});