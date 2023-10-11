// 家計簿のデータ構造
const record = {
  id: Date.now(), // 一意のID
  type: 'expense', // 'income'または'expense'
  amount: 0,
  memo: '',
  tags: []
};

// 固定支出・固定収入のデータ構造
const fixedRecord = {
  id: Date.now(), // 一意のID
  type: 'fixed-expense', // 'fixed-income'または'fixed-expense'
  amount: 0,
  memo: ''
};

