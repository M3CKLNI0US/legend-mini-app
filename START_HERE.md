# 🎭 START HERE | Начни отсюда!

Добро пожаловать в **ЛЕГЕНДА** - Telegram Mini App для премиального барбершопа.

---

## ⚡ САМЫЙ БЫСТРЫЙ СТАРТ (5 минут)

### Шаг 1: Открой терминал в этой папке

```bash
cd telegram-mini-app
```

### Шаг 2: Установи зависимости

```bash
npm install
```

⏱️ **Ждёшь 1-2 минуты...**

### Шаг 3: Запусти локально

```bash
npm run dev
```

### Шаг 4: Кликни на ссылку

```
http://localhost:3000
```

🎉 **Готово! Видишь черный интерфейс с золотом?**

---

## 📖 Что дальше?

### Если хочешь разрабатывать локально:
👉 Читай **QUICK_START.txt** (3 варианта запуска)

### Если хочешь развернуть на облаке:
👉 Читай **INSTALLATION.md** (подробно)

### Если хочешь подключить Telegram бота:
👉 Читай **TELEGRAM_SETUP.md** (полная настройка)

### Если хочешь примеры кода:
👉 Читай **EXAMPLES.md** (примеры компонентов)

### Если хочешь полный обзор:
👉 Читай **PROJECT_SUMMARY.md** (итоговый обзор)

### Если нужна полная документация:
👉 Читай **README.md** (все подробно)

---

## 📁 Структура проекта

```
telegram-mini-app/
├── src/
│   ├── components/           ← React компоненты
│   ├── hooks/               ← Telegram интеграция
│   ├── utils/               ← API и утилиты
│   └── App.jsx              ← Главный файл
├── dist/                    ← Production build (создастся после npm run build)
├── package.json             ← Зависимости
├── vite.config.js           ← Конфиг
└── 📚 ДОКУМЕНТАЦИЯ:
    ├── README.md            ← Полная документация
    ├── QUICK_START.txt      ← 3 варианта быстро
    ├── INSTALLATION.md      ← Подробная установка
    ├── TELEGRAM_SETUP.md    ← Telegram + развертывание
    ├── EXAMPLES.md          ← Примеры кода
    ├── PROJECT_SUMMARY.md   ← Итоговый обзор
    └── START_HERE.md        ← Ты здесь! 👈
```

---

## 🎨 Что входит в коробке?

✅ **7 готовых компонентов:**
- Header (логотип + уровень)
- Profile (главная карта)
- ReferralSystem (рефералы)
- Booking (запись)
- Settings (профиль)
- MainButton (кнопка Telegram)
- BottomNavigation (меню)

✅ **Премиальный дизайн:**
- Темная тема (черный + золото)
- Гладкие анимации
- Адаптивный для мобильных
- Touch-friendly

✅ **Интеграции:**
- Telegram WebApp SDK
- API утилиты
- YClients поддержка

✅ **Документация:**
- 6 подробных файлов
- Примеры кода
- Инструкции по развертыванию

---

## 🚀 Три способа запуска

### 1️⃣ Локально (сейчас)
```bash
npm install
npm run dev
# http://localhost:3000
```
**Время:** 3 минуты
**Для:** Разработки

### 2️⃣ На облаке (Vercel)
```bash
npm run build
vercel
```
**Время:** 5 минут
**Для:** Демо / Production

### 3️⃣ Telegram Bot (полная интеграция)
```
@BotFather → /newbot → название → юзернейм
@BotFather → /setmenubutton → URL → Кнопка
```
**Время:** 5 минут
**Для:** Real Telegram integration

---

## 💻 Основные команды

```bash
npm run dev         # Запустить локально (http://localhost:3000)
npm run build       # Production build
npm run preview     # Превью production
npm run lint        # Проверить ошибки
```

---

## 🎯 Функциональность

### На главном экране (Profile):
- 💳 Премиальная карта с номером
- 🎖️ Твой уровень (Новобранец → Легенда)
- 📊 Статистика (рефералы, бонус)
- 📈 Прогресс-бар к следующему уровню
- ⭐ Твои привилегии

### На экране рефералов (Referral):
- 👥 Количество приглашённых
- 🔗 Ссылка для приглашения
- 💰 Награды за каждый уровень
- 📤 Кнопка "Пригласить" (через Telegram)

### На экране записи (Booking):
- 📅 Выбор даты
- ⏰ Выбор времени
- 👨 Выбор мастера

### На экране профиля (Settings):
- 🆔 Информация профиля
- 🔔 Уведомления
- 🎨 Настройки приложения

---

## 📊 Уровневая система

| Уровень | Рефералы | Бонус |
|---------|----------|-------|
| ◆ Новобранец | 0 | +10% |
| ◇ Хранитель | 5+ | +15% |
| ◆◆ Старейшина | 15+ | +20% |
| ◆◆◆ Легенда | 30+ | ∞ |

---

## 🎨 Дизайн система

**Цвета (TailwindCSS):**
```jsx
bg-legend-black       // #0B0B0B - основной черный
bg-legend-deep        // #1A1A1A - фон
bg-legend-gold        // #C6A96B - золото (акценты)
text-legend-light     // #F5F5F5 - текст
```

**Компоненты:**
```jsx
<div className="card-premium">        // Премиальная карта
<button className="btn-gold">          // Кнопка
<div className="animate-fade-in">     // Анимация
```

---

## ❓ FAQ

**Q: Я не знаю Node.js. Что делать?**
A: Не нужно! Просто выполни команды выше. Node.js за тебя всё сделает.

**Q: Как поменять цвета?**
A: В `tailwind.config.js` поменяй значения в `colors.legend-*`

**Q: Как добавить новый компонент?**
A: Создай файл в `src/components/`, импортируй в `App.jsx`

**Q: Как подключить свой API?**
A: Посмотри `src/utils/api.js`, там готовые функции

**Q: Как развернуть в продакшен?**
A: Смотри `TELEGRAM_SETUP.md` или `INSTALLATION.md`

**Q: Что если npm install не работает?**
A: Убедись, что установлен Node.js (https://nodejs.org/)

---

## 🔗 Полезные ссылки

- **[Telegram WebApp API](https://core.telegram.org/bots/webapps)** - Как работает Mini App
- **[React Docs](https://react.dev)** - React документация
- **[TailwindCSS](https://tailwindcss.com)** - Стили
- **[@BotFather](https://t.me/botfather)** - Создание бота
- **[Vercel](https://vercel.com)** - Хостинг

---

## 📞 Что делать если что-то не работает?

### Ошибка: "npm: command not found"
```
Установи Node.js: https://nodejs.org/
Перезагрузи компьютер
```

### Ошибка: "Port 3000 already in use"
```
Измени порт в vite.config.js → server.port = 3001
```

### Ошибка: "Cannot find module 'react'"
```
npm install
```

### Ошибка: "Styles not applied"
```
Убедись в index.css:
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## ✅ Готово?

### Начни с этого:

1. **Открой терминал** в папке `telegram-mini-app`
2. **Выполни:** `npm install`
3. **Выполни:** `npm run dev`
4. **Откройся:** `http://localhost:3000`

### Потом:

- Отредактируй компоненты в `src/components/`
- Сохрани файл → автоматический refresh
- Когда готов → `npm run build`

---

## 📚 Документация в порядке чтения

1. **START_HERE.md** ← Ты здесь!
2. **QUICK_START.txt** - 3 варианта быстро
3. **INSTALLATION.md** - Подробная установка
4. **EXAMPLES.md** - Примеры кода
5. **TELEGRAM_SETUP.md** - Telegram бот + продакшен
6. **PROJECT_SUMMARY.md** - Полный обзор
7. **README.md** - Полная справка

---

## 🎯 Дорожная карта

- [x] ✅ Структура проекта настроена
- [x] ✅ React + Vite + TailwindCSS
- [x] ✅ 7 компонентов готовых
- [x] ✅ Telegram WebApp интеграция
- [x] ✅ API утилиты
- [x] ✅ Документация (6 файлов)
- [ ] 🔄 Твои изменения / кастомизация
- [ ] 🚀 Развертывание на облаке
- [ ] 🤖 Интеграция Telegram бота

---

## 🎭 Начни сейчас!

```bash
cd telegram-mini-app
npm install
npm run dev
```

**http://localhost:3000** ← откройся тут 👈

---

**Успехов! 💎**

Если нужна помощь → читай README.md или INSTALLATION.md

**Готово к запуску! 🚀**
