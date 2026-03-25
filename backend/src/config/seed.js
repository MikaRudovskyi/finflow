const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../../.env')
});
const mongoose = require('mongoose');
const Category = require('../models/Category');

const CATEGORIES = [
  // Income
  { name: 'Зарплата',    icon: '💼', color: '#2dd4a0', type: 'income'  },
  { name: 'Фріланс',     icon: '💻', color: '#5b9cf6', type: 'income'  },
  { name: 'Інвестиції',  icon: '📈', color: '#a78bfa', type: 'income'  },
  { name: 'Подарунок',   icon: '🎁', color: '#f5b942', type: 'income'  },
  // Expense
  { name: 'Продукти',    icon: '🛒', color: '#f97070', type: 'expense' },
  { name: 'Транспорт',   icon: '🚌', color: '#f5b942', type: 'expense' },
  { name: 'Комунальні',  icon: '💡', color: '#a78bfa', type: 'expense' },
  { name: 'Розваги',     icon: '🎬', color: '#fb923c', type: 'expense' },
  { name: "Здоров'я",    icon: '💊', color: '#34d399', type: 'expense' },
  { name: 'Ресторани',   icon: '🍽️', color: '#f472b6', type: 'expense' },
  { name: 'Одяг',        icon: '👕', color: '#60a5fa', type: 'expense' },
  { name: 'Освіта',      icon: '📚', color: '#818cf8', type: 'expense' },
  { name: 'Інше',        icon: '📦', color: '#9ca3af', type: 'expense' },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await Category.deleteMany({});
  await Category.insertMany(CATEGORIES);
  console.log(`✅ Seeded ${CATEGORIES.length} categories`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
