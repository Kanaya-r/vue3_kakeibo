<template>
  <Header />

  <main class="main">
    <Ledger />
  </main>

</template>


<script lang="ts">
  import { defineComponent } from 'vue'
  import { useStore } from 'vuex'
  import Header from './components/Header.vue'
  import Ledger from './views/Ledger.vue'

  export default defineComponent({
    name: 'App',
    components: {
      Header,
      Ledger
    },
    setup() {
      const store = useStore()
      store.dispatch('initializeGlobalTags')
    }
  })
</script>

