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
          <option v-for="tag in globalTags" :key="tag.text" :value="tag.text">{{ tag.text }}</option>
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
          <li class="hover-remove" v-for="(tag, index) in globalTags" :key="index">
            <template v-if="tag.isEditing">
              <input
                v-model="tag.text"
                @blur="finishEditing(tag, index)"
                @compositionstart="compositionStarted"
                @compositionend="compositionEnded"
                @keydown.enter="finishEditing(tag, index, $event)"
                :ref="(el: HTMLInputElement | null) => { if (el) tagInputRefs[index] = el }"
              >
              <button type="button" class="enter" @click="finishEditing(tag, index, $event)">決定</button>
            </template>
            <template v-else>
              <span @dblclick="editTag(tag, index)">{{ tag.text }}</span>
              <button type="button" class="addRemoveBtn" @click="removeGlobalTag(index)">削除</button>
            </template>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue';
import { useStore } from 'vuex';

type Tag = {
  text: string;
  isEditing: boolean;
}

type Record = {
  type: 'income' | 'expense';
  date: string;
  amount: string | '';
  memo: string;
  tag: string;
}

const store = useStore();
const newGlobalTag = ref('');
const error = ref('');

const newRecord = reactive<Record> ({
  type: 'expense',
  date: new Date().toISOString().slice(0, 10),
  amount: '',
  memo: '',
  tag: ''
});

const globalTags = computed(() => store.getters.globalTags as Tag[]);
const isComposing = ref(false);
const tagInputRefs = ref<{[key: number]: HTMLInputElement}>({});

function editTag(tag: Tag, index: number) {
  store.dispatch('updateGlobalTag', { index, tag: { ...tag, isEditing: true } });
  nextTick(() => {
    const input = document.querySelector(`li:nth-child(${index + 1}) input`) as HTMLInputElement | null;
    if (input) {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  });
}

function finishEditing(tag: Tag, index: number, event?: Event): void {
  if (event) {
    event.preventDefault();
  }
  if (!isComposing.value) {
    store.dispatch('updateGlobalTag', { index, tag: { ...tag, isEditing: false } });
  }
}

function compositionStarted(): void {
  // console.log('IME開始だよ');
  isComposing.value = true;
}

function compositionEnded(): void {
  // console.log('IME終了だよ');
  isComposing.value = false;
}

function handleEnter(): void {
  if (!isComposing.value) {
    addGlobalTag();
  }
}

function addGlobalTag(): void {
  error.value = '';

  if (!newGlobalTag.value) {
    error.value = 'タグ名を入力してください。';
  } else if (globalTags.value.some(tag => tag.text === newGlobalTag.value)) {
    error.value = 'このタグは既に存在します。';
  } else {
    const newTag: Tag = {
      text: newGlobalTag.value,
      isEditing: false
    };
    store.dispatch('addGlobalTag', newTag);
    newGlobalTag.value = '';
  }
}

function removeGlobalTag(index: number): void {
  store.dispatch('removeGlobalTag', index);
}

function addRecord(): void {
  store.dispatch('addRecord', { ...newRecord, id: Date.now() });
  resetNewRecord();
}

function resetNewRecord(): void {
  Object.assign(newRecord, {
    date: new Date().toISOString().slice(0, 10),
    type: 'expense',
    amount: '',
    memo: '',
    tag: ''
  });
}
</script>
