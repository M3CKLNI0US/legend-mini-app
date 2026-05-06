# 📑 ИНДЕКС ПРОЕКТА | ЛЕГЕНДА

Полный указатель всех файлов и папок проекта с описанием.

---

## 📁 Структура файлов

```
telegram-mini-app/
├── 📚 ДОКУМЕНТАЦИЯ (читай в этом порядке):
│   ├── START_HERE.md          ← 🎯 НАЧНИ ОТСЮДА (5 минут)
│   ├── QUICK_START.txt        ← 3 способа быстрого старта
│   ├── INSTALLATION.md        ← Подробная установка для всех ОС
│   ├── README.md              ← Полная документация проекта
│   ├── TELEGRAM_SETUP.md      ← Telegram бот + развертывание
│   ├── EXAMPLES.md            ← Примеры кода всех компонентов
│   ├── PROJECT_SUMMARY.md     ← Полный обзор проекта
│   └── INDEX.md               ← Ты здесь (указатель файлов)
│
├── 📁 src/                    ← Исходный код приложения
│   ├── 📁 components/         ← React компоненты
│   │   ├── Header.jsx         ← Шапка с логотипом и уровнем
│   │   ├── Profile.jsx        ← Главная карта, 4 уровня, статистика
│   │   ├── ReferralSystem.jsx ← Система рефералов и наград
│   │   ├── Booking.jsx        ← Форма записи к мастеру
│   │   ├── Settings.jsx       ← Профиль и настройки приложения
│   │   ├── MainButton.jsx     ← Управление главной кнопкой Telegram
│   │   └── BottomNavigation.jsx ← Навигация внизу (4 вкладки)
│   │
│   ├── 📁 hooks/              ← Custom React hooks
│   │   └── useTelegramApp.js  ← Интеграция с Telegram WebApp SDK
│   │
│   ├── 📁 utils/              ← Утилиты и вспомогательные функции
│   │   └── api.js             ← API calls, форматирование, утилиты
│   │
│   ├── 📁 assets/             ← Статические файлы (пусто)
│   │   └── (можешь добавлять иконки, шрифты и т.д.)
│   │
│   ├── App.jsx                ← Главный компонент приложения
│   ├── App.css                ← Стили приложения и анимации
│   ├── index.css              ← Tailwind директивы и компоненты
│   ├── main.jsx               ← Entry point React приложения
│   └── logo.svg               ← Логотип (опционально)
│
├── 📁 public/                 ← Статические файлы (пусто, можешь добавить)
│
├── 📁 dist/                   ← Production build (создастся после npm run build)
│   └── (содержит файлы для развертывания)
│
├── 📁 node_modules/           ← Зависимости (создастся после npm install)
│   └── (не коммитить в git)
│
├── 🔧 КОНФИГУРАЦИОННЫЕ ФАЙЛЫ:
│   ├── package.json           ← Зависимости проекта и скрипты
│   ├── package-lock.json      ←锚 версий зависимостей
│   ├── vite.config.js         ← Конфигурация Vite (порт, сборка)
│   ├── tailwind.config.js     ← Конфиг TailwindCSS (цвета, анимации)
│   ├── postcss.config.js      ← Конфиг PostCSS (для TailwindCSS)
│   ├── index.html             ← HTML entry point (с Telegram SDK)
│   ├── .env.example           ← Пример переменных окружения
│   ├── .env                   ← Переменные окружения (создай сам)
│   └── .gitignore             ← Файлы для игнора в git
│
└── 📄 ДРУГИЕ ФАЙЛЫ:
    └── (README, ЛИЦЕНЗИЯ и т.д.)
```

---

## 📚 ДОКУМЕНТАЦИЯ

### 🎯 Для быстрого старта:
1. **START_HERE.md** - Начни отсюда (5 минут)
2. **QUICK_START.txt** - 3 способа запуска

### 📖 Для подробного разбора:
3. **INSTALLATION.md** - Установка для всех ОС
4. **EXAMPLES.md** - Примеры кода компонентов

### 🚀 Для развертывания:
5. **TELEGRAM_SETUP.md** - Telegram бот + облако

### 📋 Для справок:
6. **README.md** - Полная справка (80+ разделов)
7. **PROJECT_SUMMARY.md** - Обзор всего проекта

---

## 🔧 КОНФИГУРАЦИОННЫЕ ФАЙЛЫ

| Файл | Назначение | Изменяй? |
|------|-----------|----------|
| **package.json** | Зависимости проекта | ✅ Если добавляешь пакеты |
| **vite.config.js** | Конфиг сборки | ✅ Порт, переменные окружения |
| **tailwind.config.js** | Цвета, анимации, шрифты | ✅ Кастомизация дизайна |
| **postcss.config.js** | Обработка CSS | ❌ Оставь как есть |
| **index.html** | HTML entry | ✅ Шрифты, мета-теги |
| **.env.example** | Пример .env | 📖 Копируй в .env |
| **.env** | Переменные окружения | ✅ Создай сам (не коммитить) |
| **.gitignore** | Файлы для git | ✅ Если нужны новые правила |

---

## 📁 ПАПКИ

### src/components/
Все React компоненты приложения. Каждый компонент = отдельный файл.

**Использование:**
```jsx
import Header from './components/Header'
<Header userLevel="guardian" />
```

### src/hooks/
Custom React hooks для логики.

**Использование:**
```jsx
import { useTelegramApp } from './hooks/useTelegramApp'
const { user, showAlert } = useTelegramApp()
```

### src/utils/
Утилиты, функции, API calls.

**Использование:**
```jsx
import { api } from './utils/api'
const profile = await api.getUserProfile(userId)
```

### public/
Статические файлы (иконки, изображения, шрифты).

**Использование:**
```html
<img src="/public/icon.png" />
```

### dist/
Production build. Содержит оптимизированные файлы для развертывания.

**Создается после:**
```bash
npm run build
```

### node_modules/
Все установленные пакеты npm. Создается после `npm install`.

**⚠️ Не коммитить в git!** (в .gitignore)

---

## 📝 ФАЙЛЫ В src/

### App.jsx
Главный компонент приложения. Здесь:
- Маршрутизация между страницами
- Управление состоянием (userLevel, referralCount)
- Рендер компонентов

### App.css
Глобальные стили приложения:
- Определения @keyframes для анимаций
- Эффекты .pressable
- Кастомный scrollbar

### index.css
Подключение Tailwind:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Plus кастомные компоненты (@layer components)

### main.jsx
Entry point React приложения. Монтирует App в #root элемент.

```jsx
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

## 🎨 КОМПОНЕНТЫ

### Header.jsx
```
Props: userLevel (string)
Выводит: Логотип + текущий уровень пользователя
```

### Profile.jsx
```
Props: user (object), userLevel (string), referralCount (number)
Выводит: Карта, статистика, 4 уровня системы, прогресс-бар
```

### ReferralSystem.jsx
```
Props: referralCount (number), setReferralCount (function)
Выводит: Ссылка приглашения, кнопка "Пригласить", награды
```

### Booking.jsx
```
Props: нет
Выводит: Форма записи (дата, время, мастер)
```

### Settings.jsx
```
Props: user (object)
Выводит: Профиль, уведомления, настройки
```

### MainButton.jsx
```
Props: currentPage (string)
Эффект: Управляет главной кнопкой Telegram (автоматически)
```

### BottomNavigation.jsx
```
Props: currentPage (string), setCurrentPage (function)
Выводит: 4 вкладки навигации внизу
```

---

## 🪝 HOOKS

### useTelegramApp.js
```javascript
const {
  user,              // Данные пользователя Telegram
  isReady,           // Приложение готово?
  webApp,            // Объект WebApp
  showAlert,         // Показать алерт
  showConfirm,       // Показать подтверждение
  close,             // Закрыть приложение
  showPopup,         // Показать popup
  openTelegramLink,  // Открыть ссылку в Telegram
  openLink,          // Открыть обычную ссылку
  shareLink,         // Поделиться ссылкой
  sendData           // Отправить данные на backend
} = useTelegramApp()
```

---

## 🔌 УТИЛИТЫ (api.js)

```javascript
// Получение данных
getTelegramUser()
getTelegramInitData()
generateReferralLink(userId)

// API Calls
api.getUserProfile(userId)
api.getReferrals(userId)
api.registerReferral(referrerId, refereeId)
api.createBooking(userId, serviceId, date, time)
api.getUserLevel(userId)

// Форматирование
formatPhoneNumber(phone)
formatDate(date)
formatTime(time)
shareToTelegram(webApp, text, link)
```

---

## 🔧 КОМАНДЫ

| Команда | Назначение |
|---------|-----------|
| `npm install` | Установить зависимости |
| `npm run dev` | Запустить dev сервер |
| `npm run build` | Создать production build |
| `npm run preview` | Превью production локально |
| `npm run lint` | Проверить синтаксис |

---

## 📊 ПОРЯДОК ЧТЕНИЯ ДОКУМЕНТАЦИИ

### 1. Новичок (быстро):
```
START_HERE.md → QUICK_START.txt → начни npm run dev
```

### 2. Разработчик (подробно):
```
INSTALLATION.md → EXAMPLES.md → TELEGRAM_SETUP.md
```

### 3. Advanced (полный обзор):
```
PROJECT_SUMMARY.md → README.md → исходный код
```

---

## 📥 ВЕРСИИ ЗАВИСИМОСТЕЙ

```json
{
  "react": "18.2.0",
  "react-dom": "18.2.0",
  "vite": "4.3.0",
  "tailwindcss": "3.3.2",
  "postcss": "8.4.31",
  "autoprefixer": "10.4.16"
}
```

---

## 🎯 ЧТО КОММИТИТЬ В GIT

✅ Коммитить:
- src/ (исходный код)
- public/ (статические файлы)
- Конфигационные файлы (vite.config.js и т.д.)
- Документация (README.md и т.д.)

❌ Не коммитить:
- node_modules/ (в .gitignore)
- dist/ (в .gitignore)
- .env (в .gitignore - личные ключи!)
- .DS_Store, *.log (в .gitignore)

---

## 🚀 ПЕРВЫЕ ШАГИ

1. Откройся: [START_HERE.md](START_HERE.md)
2. Выполни команды в терминале
3. Откройся: http://localhost:3000
4. Начни редактировать компоненты

---

## 📞 ПОИСК ПО ТИПАМ ФАЙЛОВ

### 🎨 Дизайн / Стили
- `App.css` - Анимации и эффекты
- `index.css` - Tailwind + компоненты
- `tailwind.config.js` - Конфиг цветов

### 💻 Компоненты
- `src/components/` - Все компоненты (7 файлов)

### 🔌 Логика
- `src/hooks/useTelegramApp.js` - Telegram интеграция
- `src/utils/api.js` - API и утилиты

### 📱 Главный файл
- `src/App.jsx` - Маршрутизация и состояние

### 🔧 Конфиг
- `package.json` - Зависимости
- `vite.config.js` - Конфиг сборки
- `tailwind.config.js` - Дизайн система

### 📚 Документация
- `START_HERE.md` - Быстрый старт
- `INSTALLATION.md` - Подробная установка
- `EXAMPLES.md` - Примеры кода
- `README.md` - Полная справка

---

## 🎓 ТРУДНАЯ ЧАСТИ

### Если не понимаешь:

**React компоненты:**
→ Читай EXAMPLES.md → смотри компоненты в src/components/

**Tailwind классы:**
→ Открой tailwindcss.com → ищи класс → скопируй

**Telegram API:**
→ Читай TELEGRAM_SETUP.md и core.telegram.org/bots/webapps

**Как что-то запустить:**
→ Читай QUICK_START.txt (3 способа)

---

## ✅ ГОТОВО?

### Начни с этого:

```bash
cd telegram-mini-app
npm install
npm run dev
# http://localhost:3000
```

---

**Полный справочник! Используй как базу данных файлов проекта.** 📑

Вопросы? Смотри START_HERE.md! 👈
