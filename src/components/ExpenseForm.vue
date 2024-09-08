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
        <input class="input-yen" type="number" v-model.number="newRecord.amount" placeholder="0">
        <input class="input-memo" v-model="newRecord.memo" placeholder="メモ">
        <select class="input-cat" v-model="newRecord.tag">
          <option value="" disabled>カテゴリーを選択</option>
          <option v-for="tag in globalTags" :key="tag" :value="tag">{{ tag }}</option>
        </select>
        <button type="button" class="input-done" @click="addRecord">追加</button>
      </div>

      <!-- タグの管理 -->
      <div class="form__tags">
        <input
          class="newTagName"
          v-model="newGlobalTag"
          @compositionstart="compositionStarted"
          @compositionend="compositionEnded"
          @keydown.enter="handleEnter"
          placeholder="新しいタグを追加"
        >
        <button type="button" class="addNewTag" @click="addGlobalTag">追加</button>
        <p v-if="error" class="error-message">{{ error }}</p>
        <ul class="form__tagList">
          <li class="hover-remove" v-for="tag in globalTags" :key="tag">
            {{ tag }}
            <button type="button" class="addRemoveBtn" @click="removeGlobalTag(tag)">削除</button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const newGlobalTag = ref('');
const error = ref('');

const newRecord = reactive({
  type: 'expense',
  date: new Date().toISOString().slice(0, 10),
  amount: '',
  memo: '',
  tag: ''
});

const globalTags = computed(() => store.getters.globalTags);

const isComposing = ref(false);  // IME入力中かどうかを追跡する

function compositionStarted() {
  console.log('compositionStarted');
  isComposing.value = true;
}

function compositionEnded() {
  console.log('compositionEnded');
  isComposing.value = false;
}

function handleEnter() {
  if (!isComposing.value) {  // IME入力が完了している場合のみ実行
    addGlobalTag();
  }
}

function addGlobalTag() {
  error.value = '';

  if (!newGlobalTag.value) {
    error.value = 'タグ名を入力してください。';
  } else if (globalTags.value.includes(newGlobalTag.value)) {
    error.value = 'このタグは既に存在します。';
  } else {
    store.dispatch('addGlobalTag', newGlobalTag.value);
    newGlobalTag.value = '';
  }
}

function removeGlobalTag(tag) {
  store.dispatch('removeGlobalTag', tag);
}

function addRecord() {
  store.dispatch('addRecord', { ...newRecord, id: Date.now() });
  resetNewRecord();
}

function resetNewRecord() {
  Object.assign(newRecord, {
    date: new Date().toISOString().slice(0, 10),
    type: 'expense',
    amount: '',
    memo: '',
    tag: ''
  });
}
</script>
