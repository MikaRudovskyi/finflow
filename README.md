# 💰 FinFlow — Personal Finance Tracker

**Stack:** React · Node.js/Express · MongoDB Atlas  
**Auth:** JWT · bcrypt  
**Deploy:** Render (backend) + Vercel (frontend)

---

## 📁 Структура проєкту

```
finflow/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js          # MongoDB підключення
│   │   │   └── seed.js        # Початкові категорії
│   │   ├── controllers/       # Бізнес-логіка
│   │   ├── middleware/
│   │   │   └── auth.js        # JWT перевірка
│   │   ├── models/            # Mongoose схеми
│   │   ├── routes/            # Express роути
│   │   └── server.js          # Точка входу
│   ├── .env
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/        # UI компоненти
    │   ├── pages/             # Сторінки
    │   ├── services/api.js    # Axios клієнт
    │   ├── store/authStore.js # Zustand стейт
    │   └── utils/helpers.js   # Утиліти
    ├── .env
    └── package.json
```

---

## 🗄️ КРОК 1 — Створення MongoDB Atlas

### 1.1 Реєстрація
1. Перейдіть на **https://cloud.mongodb.com**
2. Натисніть **"Try Free"** → зареєструйтесь через Google або email
3. Оберіть тип організації: **"Personal"**

### 1.2 Створення кластера
1. Натисніть **"Build a Database"**
2. Оберіть **"FREE — M0 Sandbox"** (безкоштовно назавжди)
3. Провайдер: **AWS**, регіон: найближчий до вас (напр. **Frankfurt** або **Stockholm**)
4. Назва кластера: **`finflow-cluster`**
5. Натисніть **"Create"** → зачекайте 1-3 хвилини

### 1.3 Налаштування доступу (Database Access)
1. Зліва → **"Database Access"** → **"Add New Database User"**
2. Authentication Method: **Password**
3. Username: **`finflow_user`**
4. Password: натисніть **"Autogenerate Secure Password"** → **скопіюйте пароль!**
5. Database User Privileges: **"Read and write to any database"**
6. Натисніть **"Add User"**

### 1.4 Налаштування мережевого доступу (Network Access)
1. Зліва → **"Network Access"** → **"Add IP Address"**
2. Для розробки: натисніть **"Allow Access from Anywhere"** → IP буде `0.0.0.0/0`
3. Натисніть **"Confirm"**

> ⚠️ Для продакшну додайте лише IP вашого сервера замість `0.0.0.0/0`

### 1.5 Отримання Connection String
1. Зліва → **"Database"** → натисніть **"Connect"** на вашому кластері
2. Оберіть **"Connect your application"**
3. Driver: **Node.js**, Version: **5.5 or later**
4. Скопіюйте рядок, він виглядає так:
   ```
   mongodb+srv://finflow_user:<password>@finflow-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Замініть `<password>` на ваш пароль з кроку 1.3
6. Додайте назву БД перед `?`:
   ```
   mongodb+srv://finflow_user:YOUR_PASSWORD@finflow-cluster.xxxxx.mongodb.net/finflow?retryWrites=true&w=majority
   ```

---

## ⚙️ КРОК 2 — Локальний запуск

### 2.1 Клонування / розпакування проєкту
```bash
# Розпакуйте архів або клонуйте репозиторій
cd personal-finance-tracker
```

### 2.2 Налаштування Backend
```bash
cd backend

# Встановіть залежності
npm install

# Скопіюйте та заповніть .env
cp .env
```

Відкрийте `backend/.env` та заповніть:
```env
MONGODB_URI=mongodb+srv://finflow_user:YOUR_PASSWORD@finflow-cluster.xxxxx.mongodb.net/finflow?retryWrites=true&w=majority
JWT_SECRET=zminiyt_tse_na_dovgiy_vipadkoviy_ryadok_minimum_32_symvoly
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### 2.3 Заповнення бази категоріями
```bash
# З папки backend/
node src/config/seed.js
```
Ви побачите: `✅ Seeded 13 categories`

### 2.4 Запуск Backend
```bash
npm run dev
# → 🚀 FinFlow API running on port 5000
# → ✅ MongoDB connected: finflow-cluster.xxxxx.mongodb.net
```

### 2.5 Налаштування Frontend
```bash
# В новому терміналі
cd ../frontend

npm install

cp .env
```

Файл `frontend/.env` (для локальної розробки залиште як є):
```env
VITE_API_URL=http://localhost:5000/api
```

### 2.6 Запуск Frontend
```bash
npm run dev
# → Local: http://localhost:3000
```

**Відкрийте http://localhost:3000** — зареєструйтесь і починайте!

---

## 🚀 КРОК 3 — Деплой на Render + Vercel

### 3.1 Підготовка GitHub репозиторію
```bash
# В корені проєкту finflow/
git init
git add .
git commit -m "Initial FinFlow commit"
```

Створіть репозиторій на **https://github.com/new** (назва: `finflow`), потім:
```bash
git remote add origin https://github.com/YOUR_USERNAME/finflow.git
git branch -M main
git push -u origin main
```

### 3.2 Деплой Backend на Render

1. Перейдіть на **https://render.com** → Sign Up (безкоштовно)
2. **"New +"** → **"Web Service"**
3. Підключіть GitHub → оберіть репозиторій `finflow`
4. Заповніть:
   - **Name:** `finflow-api`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
   - **Plan:** `Free`

5. **"Advanced"** → **"Add Environment Variable"** — додайте всі змінні:
   ```
   MONGODB_URI     = ваш connection string з Atlas
   JWT_SECRET      = ваш секретний ключ (мінімум 32 символи)
   JWT_EXPIRES_IN  = 7d
   NODE_ENV        = production
   CLIENT_URL      = https://finflow.vercel.app  ← змінимо після деплою фронтенду
   ```

6. Натисніть **"Create Web Service"** → зачекайте 2-3 хвилини
7. Скопіюйте URL вашого API: `https://finflow-api.onrender.com`

### 3.3 Деплой Frontend на Vercel

1. Перейдіть на **https://vercel.com** → Sign Up через GitHub
2. **"Add New..."** → **"Project"**
3. Оберіть репозиторій `finflow`
4. Налаштування:
   - **Root Directory:** `frontend`
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. **"Environment Variables"** → додайте:
   ```
   VITE_API_URL = https://finflow-api.onrender.com/api
   ```

6. **"Deploy"** → зачекайте 1-2 хвилини
7. Ваш сайт: `https://finflow.vercel.app`

### 3.4 Оновлення CORS на Render

Поверніться в Render → ваш сервіс → **Environment** → оновіть:
```
CLIENT_URL = https://finflow.vercel.app
```
Натисніть **"Save Changes"** → сервіс перезапуститься автоматично.

### 3.5 Заповнення категорій в продакшні
```bash
# Один раз після деплою бекенду — з локальної машини:
cd backend
# Встановіть MONGODB_URI в .env і запустіть:
node src/config/seed.js
```

---

## ✅ Фінальна перевірка

| Крок | Що перевірити |
|------|--------------|
| 1 | Відкрийте `https://finflow-api.onrender.com/api/health` → має повернути `{"status":"ok"}` |
| 2 | Відкрийте `https://finflow.vercel.app` → відкривається сторінка входу |
| 3 | Зареєструйтесь → потрапляєте в Dashboard |
| 4 | Додайте транзакцію → з'являється в списку та графіку |
| 5 | Створіть бюджет → відображається прогрес |

---

## 🔧 Часті питання

**Помилка "MongoDB connection error"**  
→ Перевірте `MONGODB_URI` в `.env`. Переконайтесь що IP `0.0.0.0/0` додано в Network Access.

**Помилка CORS на фронтенді**  
→ Переконайтесь що `CLIENT_URL` в Render дорівнює точній URL вашого Vercel (без слешу в кінці).

**"Cannot find module" на Render**  
→ Перевірте що Root Directory встановлено як `backend`, а не корінь проєкту.

**Категорії не завантажуються**  
→ Запустіть `node src/config/seed.js` з правильним `MONGODB_URI`.

**Render засинає (Free план)**  
→ Free план Render засинає після 15 хв бездіяльності. Перший запит може займати 30-60 сек. Для production використовуйте платний план або Railway.

---

## 📡 API Ендпоінти

| Метод | URL | Опис |
|-------|-----|------|
| POST | `/api/auth/register` | Реєстрація |
| POST | `/api/auth/login` | Вхід |
| GET  | `/api/auth/me` | Профіль |
| GET  | `/api/transactions` | Список (з фільтрами) |
| POST | `/api/transactions` | Нова транзакція |
| PUT  | `/api/transactions/:id` | Редагування |
| DELETE | `/api/transactions/:id` | Видалення |
| GET  | `/api/transactions/export/csv` | Експорт CSV |
| GET  | `/api/budgets` | Бюджети + витрати |
| POST | `/api/budgets` | Новий бюджет |
| GET  | `/api/analytics/summary` | Зведення місяця |
| GET  | `/api/analytics/by-category` | Витрати по категоріях |
| GET  | `/api/analytics/monthly` | Статистика по місяцях |
| GET  | `/api/categories` | Список категорій |
