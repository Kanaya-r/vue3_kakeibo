<template>
  <!-- 一覧 -->
  <div class="list">
    <!-- 移動ボタンと現在の月の表示 -->
    <div class="list__selectMonth">
      <button class="prev" @click="moveToPreviousMonth">前月</button>
      <span>{{ currentYear }}年 {{ currentMonth }}月</span>
      <button class="next" @click="moveToNextMonth">次月</button>
    </div>

    <div class="list__items">
      <div class="list__item" v-for="day in daysInCurrentMonth" :key="day.toString()">
        <p class="day">{{ day.getDate() }}</p>

        <ul v-if="recordsByDate[formatDate(day)]">
          <li class="hover-remove" v-for="record in recordsByDate[formatDate(day)]" :key="record.id">
            <span :class="['yen', record.type === 'income' ? 'income' : 'expense']">{{ numberWithCommas(record.amount) }}</span>
            <span class="cat">{{ record.tag }}</span>
            <span class="memo">{{ record.memo }}</span>
            <button class="addRemoveBtn" @click="deleteRecord(record.id)">削除</button>
          </li>
        </ul>
      </div>
    </div>

    <!-- 収支計算 -->
    <div class="total">
      <p class="income">収入： {{ numberWithCommas(currentMonthIncome) }}</p>
      <p class="expense">支出： {{ numberWithCommas(currentMonthExpense) }}</p>
      <p class="balance">合計： {{ numberWithCommas(currentMonthBalance) }}</p>
    </div>
  </div>

</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStore } from 'vuex';

type Record = {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  tag: string;
  memo: string;
  date: string;
}

const store = useStore();

/**
 * カレンダー機能
 */
const currentYear = ref(new Date().getFullYear());
const currentMonth = ref(new Date().getMonth() + 1);

function formatDate(date: Date): string {
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

function moveToPreviousMonth(): void {
  if (currentMonth.value === 1) {
    currentMonth.value = 12;
    currentYear.value -= 1;
  } else {
    currentMonth.value -= 1;
  }
}

function moveToNextMonth():void {
  if (currentMonth.value === 12) {
    currentMonth.value = 1;
    currentYear.value += 1;
  } else {
    currentMonth.value += 1;
  }
}

const records = computed(() => store.getters.records);
const globalTags = computed(() => store.getters.globalTags);

const recordsByDate = computed(() => {
  const grouped: { [key: string]: Record[] } = {};
  records.value.forEach((record: Record) => {
    const date = new Date(record.date).toISOString().slice(0, 10);
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(record);
  });
  return grouped;
});

const daysInCurrentMonth = computed(() => {
  const days: Date[] = [];
  const month = currentMonth.value - 1;
  const year = currentYear.value;
  let day = new Date(year, month, 1);
  while (day.getMonth() === month) {
    days.push(new Date(day));
    day.setDate(day.getDate() + 1);
  }
  return days;
});

function numberWithCommas(x: number): string {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function deleteRecord(id: number): void {
  store.dispatch('removeRecord', id);
}

const currentMonthRecords = computed(() => {
  return records.value.filter((record: Record) => {
    const recordDate = new Date(record.date);
    return recordDate.getFullYear() === currentYear.value && recordDate.getMonth() + 1 === currentMonth.value;
  });
});

const currentMonthIncome = computed(() => {
  return currentMonthRecords.value.reduce((sum: number, record: Record) => {
    return record.type === 'income' ? sum + record.amount : sum;
  }, 0);
});

const currentMonthExpense = computed(() => {
  return currentMonthRecords.value.reduce((sum: number, record: Record) => {
    return record.type === 'expense' ? sum + record.amount : sum;
  }, 0);
});

const currentMonthBalance = computed(() => {
  return currentMonthIncome.value - currentMonthExpense.value;
});

</script>