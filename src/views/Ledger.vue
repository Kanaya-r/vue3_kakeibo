<template>
  <ExpenseForm />
  <ExpenseList />
</template>

<script lang="ts">
import ExpenseForm from '../components/ExpenseForm.vue';
import ExpenseList from '../components/ExpenseList.vue';

export default {
  name: 'Ledger',
  components: {
    ExpenseForm,
    ExpenseList
  }
};

</script>