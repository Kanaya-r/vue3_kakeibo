<template>
  <div class="form">
    <div class="form__inr">
      <!-- 入力フォーム -->
      <div class="form__inputs">
        <select class="input-type" v-model="newRecord.type">
          <option value="income">収入</option>
          <option value="expense">支出</option>
        </select>
        <input class="input-date" type="date" v-model="newRecord.date">
        <input class="input-yen" v-model.number="newRecord.amount" placeholder="0">
        <input class="input-memo" v-model="newRecord.memo" placeholder="メモ">
        <select class="input-cat" v-model="newRecord.tag">
          <option value="" disabled>カテゴリー</option>
          <option v-for="tag in globalTags" :key="tag" :value="tag">{{ tag }}</option>
        </select>
        <button class="input-done" @click="addRecord">追加</button>
      </div>

      <!-- タグの管理 -->
      <div class="form__tags">
        <input class="newTagName" v-model="newGlobalTag" placeholder="新しいタグを追加">
        <button class="addNewTag" @click="addGlobalTag">追加</button>
        <ul class="form__tagList">
          <li class="hover-remove" v-for="tag in globalTags" :key="tag">
            {{ tag }}
            <button class="addRemoveBtn" @click="removeGlobalTag(tag)">削除</button>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <!-- 一覧 -->
  <div class="list">
    <!-- 移動ボタンと現在の月の表示 -->
    <div class="list__selectMonth">
      <button class="prev" @click="moveToPreviousMonth">前月</button>
      <span>{{ currentYear }}年 {{ currentMonth }}月</span>
      <button class="next" @click="moveToNextMonth">次月</button>
    </div>

    <!-- 現在の月のすべての日付を表示 -->
    <div class="list__items">
      <div class="list__item" v-for="day in daysInCurrentMonth" :key="day.toString()">
        <p class="day">{{ day.getDate() }}</p>

        <!-- その日のレコード表示 -->
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


<script>
  export default {
    data() {
      return {
        records: JSON.parse(localStorage.getItem('records')) || [],
        newRecord: {
          id: null,
          type: 'expense',
          date: new Date().toISOString().slice(0, 10),
          amount: '0',
          memo: '',
          tag: '[]',
        },
        newTag: '',
        globalTags: [],
        newGlobalTag: '',
        filteredTag: null,
        currentYear: new Date().getFullYear(),
        currentMonth: new Date().getMonth() + 1, // jsの月は0から始まるので+1する
      };
    },
    watch: {
      records: {
        deep: true,
        handler(newValue) {
          localStorage.setItem('records', JSON.stringify(newValue));
        }
      }
    },
    created() {
      // localStorageからタグのリストを取得してglobalTagsに設定
      const storedTags = localStorage.getItem('globalTags');
      if (storedTags) {
        this.globalTags = JSON.parse(storedTags);
      }
    },
    computed: {
      // 全体の収支計算
      totalIncome() {
        return this.records.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
      },
      totalExpense() {
        return this.records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
      },
      // 月ごとの収支計算
      currentMonthIncome() {
        return this.records
        .filter(r => r.type === 'income' && this.isRecordInCurrentMonth(r.date))
        .reduce((sum, r) => sum + r.amount, 0);
      },
      currentMonthExpense() {
        return this.records
        .filter(r => r.type === 'expense' && this.isRecordInCurrentMonth(r.date))
        .reduce((sum, r) => sum + r.amount, 0);
      },
      currentMonthBalance() {
        return this.currentMonthIncome - this.currentMonthExpense;
      },
      // 月の判別、自動ソート
      sortedRecordsByMonth() {
        const sortedRecords = [...this.records].sort((a, b) => new Date(b.date) - new Date(a.date));

        const groupedByMonth = {};

        // 現在の年と月を取得
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();

        // 過去12ヶ月分の空のデータを追加
        for (let i = 0; i < 12; i++) {
          const year = new Date(currentYear, currentMonth - i, 1).getFullYear();
          const month = new Date(currentYear, currentMonth - i, 1).getMonth() + 1; // JavaScriptの月は0から始まるので+1する
          const key = `${year}-${month.toString().padStart(2, '0')}`;
          groupedByMonth[key] = [];
        }

        sortedRecords.forEach(record => {
          const date = new Date(record.date);
          const year = date.getFullYear();
          const month = date.getMonth() + 1; // jsの月は0から始まるので+1する
          const key = `${year}-${month.toString().padStart(2, '0')}`;
          if (!groupedByMonth[key]) groupedByMonth[key] = [];
          groupedByMonth[key].push(record);
        });
        return groupedByMonth;
      },
      // すべての日付を生成
      daysInCurrentMonth() {
        const days = [];
        let date = new Date(this.currentYear, this.currentMonth - 1, 1);
        while (date.getMonth() === this.currentMonth - 1) {
          days.push(new Date(date));
          date.setDate(date.getDate() + 1);
        }
        return days;
      },
      // 日付ごとに整理
      recordsByDate() {
        const recordsByDate = {};
        for (const record of this.records) {
          const dateStr = record.date; // 'YYYY-MM-DD'形式を想定
          if (!recordsByDate[dateStr]) {
            recordsByDate[dateStr] = [];
          }
          recordsByDate[dateStr].push(record);
        }
        return recordsByDate;
      },
      // 前月、次月ボタン
      filteredRecordsForCurrentMonth() {
        const monthKey = `${this.currentYear}-${this.currentMonth.toString().padStart(2, '0')}`;
        return this.sortedRecordsByMonth[monthKey] || [];
      },
    },
    methods: {
      // タグ関係
      addGlobalTag() {
        if (this.newGlobalTag && !this.globalTags.includes(this.newGlobalTag)) {
          this.globalTags.push(this.newGlobalTag);
          localStorage.setItem('globalTags', JSON.stringify(this.globalTags));
        }
        this.newGlobalTag = '';
      },
      removeGlobalTag(tag) {
        this.globalTags = this.globalTags.filter(t => t !== tag);
        localStorage.setItem('globalTags', JSON.stringify(this.globalTags));
      },
      // 数字にカンマ
      numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      },
      // 一覧追加
      addRecord() {
        const newRecordToAdd = { ...this.newRecord, id: Date.now() };
        this.records.push(newRecordToAdd);
        const currentDate = this.newRecord.date;
        this.newRecord = { date: currentDate, type: 'expense', amount: 0, memo: '', tag: [] };
        this.newTag = '';
      },
      // 一覧削除機能
      deleteRecord(recordId) {
        if (window.confirm('削除しますか？')) {
          this.records = this.records.filter(record => record.id !== recordId);
          localStorage.setItem('records', JSON.stringify(this.records));
        }
      },
      // YYY-MM-DD'の形式に
      formatDate(date) {
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      },
      // 前月、次月
      moveToPreviousMonth() {
        this.currentMonth -= 1;
        if (this.currentMonth === 0) {
          this.currentMonth = 12;
          this.currentYear -= 1;
        }
      },
      moveToNextMonth() {
        this.currentMonth += 1;
        if (this.currentMonth === 13) {
          this.currentMonth = 1;
          this.currentYear += 1;
        }
      },
      isRecordInCurrentMonth(dateStr) {
        const recordDate = new Date(dateStr);
        return recordDate.getMonth() === this.currentMonth - 1 && recordDate.getFullYear() === this.currentYear;
      },
    },
  };
</script>

