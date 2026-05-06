# 🎭 ЛЕГЕНДА | Telegram Mini App

Премиальный Telegram Mini App (WebApp) для барбершопа «ЛЕГЕНДА». Закрытый мужской клуб прямо в Telegram.

## ✨ Особенности

- ✅ Темная премиальная тема (чёрный + золото)
- ✅ Уровневая система (Новобранец → Легенда)
- ✅ Реферальная система с вознаграждениями
- ✅ Интеграция с Telegram WebApp SDK
- ✅ Номер пластиковой карты (0001-9999)
- ✅ Плавные анимации и эффекты
- ✅ 100% адаптивен для мобильных устройств
- ✅ React + TailwindCSS + Vite

## 📦 Требования

- Node.js 16+ и npm/yarn
- Telegram Bot Token (для тестирования)

## 🚀 БЫСТРЫЙ СТАРТ

### 1. Клонирование и установка

```bash
cd telegram-mini-app
npm install
```

### 2. Создание .env файла

```bash
cp .env.example .env
```

Заполни файл:
```
REACT_APP_BOT_USERNAME=your_bot_username
REACT_APP_API_URL=https://your-api.com
```

### 3. Запуск локально

```bash
npm run dev
```

Откроется http://localhost:3000

### 4. Тестирование в Telegram

Для полного тестирования нужно развернуть на сервере и настроить в Telegram Bot Settings.

## 🏗️ Структура проекта

```
src/
├── components/           # React компоненты
│   ├── Header.jsx       # Шапка с логотипом и уровнем
│   ├── Profile.jsx      # Главная карта и статистика
│   ├── ReferralSystem.jsx # Система рефералов
│   ├── MainButton.jsx    # Главная кнопка Telegram
│   └── BottomNavigation.jsx # Навигация внизу
├── hooks/
│   └── useTelegramApp.js # Hook для Telegram WebApp API
├── utils/
│   └── api.js           # API calls и утилиты
├── App.jsx              # Главный компонент
├── App.css              # Стили приложения
├── index.css            # Tailwind стили
└── main.jsx             # Entry point
```

## 🎨 Стили и цвета

Премиальная палитра:
- `#0B0B0B` - Основной чёрный
- `#1A1A1A` - Глубокий фон
- `#8B6B3F` - Латунь
- `#C6A96B` - Золото (акценты)
- `#3B2F2F` - Венге (тени)
- `#F5F5F5` - Светлый (текст)

Используй классы Tailwind:
```jsx
<div className="bg-legend-black text-legend-gold border-legend-gold">
  Премиальный контент
</div>
```

## 🔧 API интеграция

В `src/utils/api.js` находятся готовые функции:

```javascript
import { api } from './utils/api'

// Получи профиль пользователя
const profile = await api.getUserProfile(userId)

// Создай запись
const booking = await api.createBooking(userId, serviceId, date, time)

// Получи рефералов
const referrals = await api.getReferrals(userId)
```

## 📱 Telegram WebApp API

Используется `window.Telegram.WebApp`:

```javascript
import { useTelegramApp } from './hooks/useTelegramApp'

const { 
  user,           // Информация о пользователе
  isReady,        // Приложение готово?
  showAlert,      // Показать алерт
  shareLink,      // Поделиться ссылкой
  openLink,       // Открыть ссылку
} = useTelegramApp()
```

## 🔗 Развертывание

### На Vercel (рекомендуется)

```bash
npm run build
vercel
```

### На GitHub Pages

```bash
npm run build
# Загрузи содержимое dist/ на GitHub Pages
```

### На собственный сервер

```bash
npm run build
# Загрузи dist/ на сервер
```

## 🔐 Интеграция с Telegram Bot

1. Создай бота у @BotFather в Telegram
2. Получи Token
3. Настрой Web App в настройках команды

```
/setmenubutton
/addcommand
```

Пример URL для Web App:
```
https://your-domain.com/mini-app
```

## 📋 Компоненты

### Header
Показывает логотип, название и уровень пользователя.

```jsx
<Header userLevel={userLevel} />
```

### Profile
Главная карта с номером, статистикой и уровнями.

```jsx
<Profile 
  user={user} 
  userLevel={userLevel} 
  referralCount={referralCount}
/>
```

### ReferralSystem
Система рефералов с ссылкой и наградами.

```jsx
<ReferralSystem 
  referralCount={referralCount}
  setReferralCount={setReferralCount}
/>
```

## 🎬 Анимации

Встроены плавные анимации:
- `animate-fade-in` - Плавное появление
- `animate-glow-pulse` - Пульсирующее свечение
- `animate-slide-in` - Скольжение

```jsx
<div className="animate-fade-in">Содержимое</div>
```

## 🔌 Подключение YCLIENTS

В компоненте Profile добавь iframe:

```jsx
<iframe 
  src="https://your-site.yclients.com/schedule"
  width="100%"
  height="500"
  frameborder="0"
></iframe>
```

## 📞 Уровневая система

| Уровень | Рефералы | Бонус | Привилегии |
|---------|----------|-------|-----------|
| Новобранец | 0 | +10% | Персональный мастер |
| Хранитель | 5+ | +15% | VIP статус |
| Старейшина | 15+ | +20% | Приватные события |
| Легенда | 30+ | ∞ | Лайфтайм статус |

## 🐛 Отладка

Включи DevTools в браузере (F12) для просмотра:
- Console для ошибок
- Network для API запросов
- Storage для данных Telegram

```javascript
// В консоли браузера
console.log(window.Telegram.WebApp)
```

## 📦 Build и Release

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

Результат в папке `dist/`

## 🔄 Обновление зависимостей

```bash
npm update
npm audit fix
```

## 📄 Лицензия

MIT License - Используй свободно

## 🙋 Поддержка

При вопросах обратись к документации:
- [Telegram WebApp Docs](https://core.telegram.org/bots/webapps)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

**Готово! Твой Telegram Mini App для ЛЕГЕНДЫ полностью настроен.** 🎭
