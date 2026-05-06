# ⚡ БЫСТРАЯ УСТАНОВКА И ЗАПУСК

Полная инструкция по установке и запуску ЛЕГЕНДА Telegram Mini App за **5 минут**.

---

## 🎯 Вариант 1: Запуск локально (разработка)

### Шаг 1: Откройте терминал в папке проекта

```bash
cd c:\Users\74\LegendProject\telegram-mini-app
```

### Шаг 2: Установи зависимости

```bash
npm install
```

⏱️ Ждёшь **1-2 минуты** (первый раз может быть дольше)

Результат: папка `node_modules/` создана ✓

### Шаг 3: Запусти dev сервер

```bash
npm run dev
```

🟢 **Результат в консоли:**
```
Local:    http://localhost:3000/
ready in 123ms
```

### Шаг 4: Открой в браузере

Кликни по ссылке или открой:
```
http://localhost:3000
```

🎉 **Готово! Вижешь черный интерфейс с золотом?**

**Структура видимая:**
- 📱 Верхняя шапка с логотипом
- 💳 Премиальная карта
- 📊 Статистика рефералов
- 🎲 4 уровня системы
- 📱 Навигация внизу

### Остановка сервера

Нажми в терминале: `Ctrl+C`

---

## 🌐 Вариант 2: Развертывание на Vercel (облако)

### Шаг 1: Зарегистрируйся на Vercel

Переди на https://vercel.com и зарегистрируйся через GitHub.

### Шаг 2: Установи Vercel CLI

```bash
npm install -g vercel
```

### Шаг 3: Создай production build

```bash
npm run build
```

📦 Результат: папка `dist/` с готовым приложением ✓

### Шаг 4: Развернись на Vercel

```bash
vercel
```

Следуй инструкциям:
```
? Set up and deploy "...path..." [Y/n] → Y
? Which scope do you want to deploy to? → Your account
? Link to existing project? [y/N] → N
? What's your project's name? → legend-mini-app
? In which directory is your code? → .
? Want to modify these settings before deploying [y/N] → N
```

🎉 **Результат:**
```
✓ Deployed to legend-mini-app.vercel.app
```

Твой App готов на: `https://legend-mini-app.vercel.app` 🚀

---

## 🤖 Вариант 3: Подключение к Telegram боту

### Шаг 1: Создай бота

Открой Telegram и найди **@BotFather**

Отправь:
```
/start
/newbot
```

Ответь:
- Название: `ЛЕГЕНДА Bot`
- Юзернейм: `legend_barbershop_bot`

Сохрани **TOKEN**: `123456789:ABCdefGHIjklmnoPQR...`

### Шаг 2: Настрой Menu Button

В @BotFather отправь:
```
/setmenubutton
```

Выбери бот и отправь:
```
COMMAND_START /start
https://legend-mini-app.vercel.app
🎭 Открыть ЛЕГЕНДУ
```

### Шаг 3: Проверь в Telegram

Открой своего бота и кликни кнопку **🎭 Открыть ЛЕГЕНДУ**.

✅ **Всё работает!**

---

## 📝 Структура файлов (что создано)

```
telegram-mini-app/
├── node_modules/           # Зависимости (создастся после npm install)
├── dist/                   # Production build (создастся после npm run build)
├── src/
│   ├── components/
│   │   ├── Header.jsx      # Шапка приложения
│   │   ├── Profile.jsx     # Главная карта + уровни
│   │   ├── ReferralSystem.jsx # Рефералы
│   │   ├── Booking.jsx     # Запись к мастеру
│   │   ├── Settings.jsx    # Профиль и настройки
│   │   ├── MainButton.jsx  # Главная кнопка Telegram
│   │   └── BottomNavigation.jsx # Меню внизу
│   ├── hooks/
│   │   └── useTelegramApp.js # Интеграция с Telegram WebApp SDK
│   ├── utils/
│   │   └── api.js          # API calls и утилиты
│   ├── App.jsx             # Главный компонент (маршрутизация)
│   ├── App.css             # Стили приложения
│   ├── index.css           # Tailwind + базовые стили
│   └── main.jsx            # Entry point
├── public/                 # Статические файлы
├── index.html              # HTML entry (с Telegram SDK)
├── package.json            # Зависимости проекта
├── vite.config.js          # Конфиг Vite
├── tailwind.config.js      # Конфиг TailwindCSS
├── postcss.config.js       # Конфиг PostCSS
├── .env.example            # Пример переменных окружения
├── .gitignore              # Игнорируемые файлы для git
├── README.md               # Полная документация
├── TELEGRAM_SETUP.md       # Подробная настройка Telegram
└── INSTALLATION.md         # Этот файл
```

---

## 🔧 Полезные команды

### Разработка
```bash
npm run dev          # Запустить dev сервер (http://localhost:3000)
npm run build        # Создать production build
npm run preview      # Превью production build локально
npm run lint         # Проверить код на ошибки
```

### Очистка
```bash
rm -rf node_modules  # Удалить зависимости
npm install          # Переустановить всё
```

### Проверка
```bash
npm list             # Список всех установленных зависимостей
npm outdated         # Какие зависимости можно обновить
```

---

## 🎨 Работа с кодом

### Создание нового компонента

1. Создай файл `src/components/MyComponent.jsx`:

```jsx
import React from 'react'

export default function MyComponent() {
  return (
    <div className="card-premium">
      <p className="text-legend-gold">Премиальный компонент</p>
    </div>
  )
}
```

2. Импортируй в `App.jsx`:

```jsx
import MyComponent from './components/MyComponent'

// В компоненте App:
<MyComponent />
```

3. Сохрани - dev сервер автоматически перезагрузит приложение! 🔄

### Добавление стилей

Используй TailwindCSS классы:
```jsx
<div className="bg-legend-black text-legend-gold p-4 rounded-lg">
  Текст золотом на чёрном
</div>
```

**Доступные цвета:**
- `bg-legend-black` / `text-legend-black`
- `bg-legend-deep` / `text-legend-deep`
- `bg-legend-brass` / `text-legend-brass`
- `bg-legend-gold` / `text-legend-gold`
- `bg-legend-wenge` / `text-legend-wenge`
- `bg-legend-light` / `text-legend-light`

### Анимации

```jsx
<div className="animate-fade-in">Появится плавно</div>
<div className="animate-glow-pulse">Пульсирует золотом</div>
<div className="animate-slide-in">Скользит слева</div>
```

---

## 🔐 .env переменные

Создай файл `.env` в корне проекта:

```env
# .env
REACT_APP_BOT_USERNAME=legend_barbershop_bot
REACT_APP_API_URL=https://api.your-domain.com
REACT_APP_ENV=development
```

Используй в коде:
```javascript
const botUsername = process.env.REACT_APP_BOT_USERNAME
```

---

## 🐛 Частые проблемы

### ❌ "npm command not found"

**Решение:** Установи Node.js с https://nodejs.org/

Проверь: `node --version` (должна быть 16+)

### ❌ "Port 3000 already in use"

**Решение:** Измени порт в `vite.config.js`:

```javascript
server: {
  port: 3001,  // Вместо 3000
  open: true
}
```

Запусти: `npm run dev`

### ❌ "Cannot find module 'react'"

**Решение:** Переустанови зависимости:

```bash
rm -rf node_modules package-lock.json
npm install
```

### ❌ "Telegram.WebApp is undefined"

**Решение:** Приложение должно открываться через Telegram Mini App.

Локально для тестирования используй dev сервер.

### ❌ "Styles not applied"

**Решение:** Убедись, что Tailwind подключен в `index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 📊 Что дальше?

После запуска:

1. **Добавь свой API**
   - Посмотри `src/utils/api.js`
   - Замени `YOUR_API_URL` на свой сервер

2. **Подключи YClients**
   - Зарегистрируйся на https://yclients.com
   - Получи API token
   - Добавь в `src/components/Booking.jsx`

3. **Настрой ананалитику**
   - Добавь Google Analytics
   - Настрой Sentry для отслеживания ошибок

4. **Готовь к продакшену**
   - Смотри файл `TELEGRAM_SETUP.md`
   - Настрой backend API
   - Развернись на Vercel или собственном сервере

---

## 📞 Полезные ссылки

- 📖 [React Documentation](https://react.dev)
- 🎨 [TailwindCSS](https://tailwindcss.com)
- ⚡ [Vite](https://vitejs.dev)
- 🤖 [Telegram WebApp API](https://core.telegram.org/bots/webapps)
- 🔧 [Node.js](https://nodejs.org/)

---

## ✅ Чеклист первого запуска

- [ ] Node.js установлен (`node --version`)
- [ ] Папка проекта открыта в терминале
- [ ] `npm install` выполнен без ошибок
- [ ] `npm run dev` запущен успешно
- [ ] http://localhost:3000 открывается в браузере
- [ ] Видишь черный интерфейс с золотом ✓
- [ ] Навигация внизу работает ✓
- [ ] Рефераль система отображается ✓

---

**🎭 Поздравляю! Твой Telegram Mini App ЛЕГЕНДА полностью работает!**

**Вопросы?** Смотри README.md и TELEGRAM_SETUP.md 📖

Начни с `npm run dev` и развивай дальше! 🚀
