<template>
  <Header />

  <main class="main">
    <Ledger />
  </main>

</template>


<script>
  import Header from './components/Header.vue'
  import Ledger from './views/Ledger.vue'

  export default {
    name: 'App',
    components: {
      Header,
      Ledger
    },
  };
</script>

