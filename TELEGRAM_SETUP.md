# 🤖 Настройка Telegram Bot и Развертывание

Полное руководство по подключению Mini App к Telegram боту и развертыванию на продакшене.

## 📋 Содержание
1. Создание Telegram бота
2. Настройка Web App
3. Локальное тестирование
4. Развертывание на сервер
5. Интеграция API
6. Мониторинг и обновления

---

## 1️⃣ Создание Telegram бота

### Шаг 1: Обращение к @BotFather

Открой Telegram и найди @BotFather.

Отправь команду:
```
/start
```

Затем:
```
/newbot
```

Ответь на вопросы:
- **Название**: ЛЕГЕНДА Bot
- **Юзернейм**: legend_barbershop_bot (или уникальный)

**Результат**: Получишь TOKEN, пример:
```
123456789:ABCdefGHIjklmnoPQRstuvWXyz123456
```

⚠️ **Сохрани токен в безопасном месте!**

---

### Шаг 2: Базовая настройка бота

В @BotFather отправь:

```
/setcommand
```

Выбери свой бот, затем добавь команды:

```
start - Открыть ЛЕГЕНДУ
profile - Мой профиль
help - Справка
```

---

## 2️⃣ Настройка Web App

### Шаг 1: Развертывание на сервер

Нужен сервер с поддержкой Node.js или статического хостинга.

**Вариант 1: Vercel (рекомендуется - бесплатно)**

```bash
# Установи Vercel CLI
npm i -g vercel

# В папке проекта
npm run build
vercel

# Следуй инструкциям
```

Получишь URL: `https://legend-mini-app.vercel.app`

**Вариант 2: GitHub Pages**

```bash
npm run build
# Загрузи папку dist/ на GitHub Pages
```

**Вариант 3: Собственный сервер (Nginx)**

```bash
npm run build

# На сервере (Ubuntu/Debian)
sudo apt install nginx
sudo cp -r dist/* /var/www/legend-app/
```

Nginx конфиг (`/etc/nginx/sites-available/legend`):
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /var/www/legend-app;
        try_files $uri $uri/ /index.html;
    }

    # Редирект на HTTPS
    if ($server_port = 80) {
        return 301 https://$server_name$request_uri;
    }
}
```

---

### Шаг 2: Настройка Menu Button в @BotFather

В @BotFather:
```
/setmenubutton
```

Выбери свой бот и отправь:
```
COMMAND_START /start
Web App: https://your-domain.com
Button text: 🎭 Открыть ЛЕГЕНДУ
```

---

### Шаг 3: Настройка команды /start

В @BotFather:
```
/addcommand
```

Выбери бот и команды:
```
start - Приватная ссылка для членов клуба
profile - Твой профиль
```

---

## 3️⃣ Локальное тестирование

### Тестирование через ngrok (для локальной разработки)

```bash
# Скачай ngrok: https://ngrok.com/download

# Запусти приложение локально
npm run dev  # http://localhost:3000

# В другом терминале
ngrok http 3000

# Получишь URL типа: https://abc123.ngrok.io
```

Используй этот URL в настройках Telegram Menu Button.

---

### Тестирование без ngrok (быстрый способ)

1. Загрузи на Vercel: `npm run build && vercel`
2. Используй URL Vercel для тестирования
3. Вернись к локальной разработке после тестирования

---

## 4️⃣ Backend API Integration

### Структура API (Node.js + Express пример)

```javascript
// backend/routes/users.js
app.get('/api/users/:userId', (req, res) => {
  const userId = req.params.userId
  // Получи данные из БД
  res.json({
    id: userId,
    level: 'guardian',
    referrals: 5,
    registeredAt: '2024-01-15'
  })
})

app.post('/api/referrals', (req, res) => {
  const { referrer_id, referee_id } = req.body
  // Добавь рефераль в БД
  res.json({ success: true })
})

app.post('/api/bookings', (req, res) => {
  const { user_id, service_id, date, time } = req.body
  // Создай бронировку через YClients API
  res.json({ booking_id: 12345 })
})
```

### Переменные окружения

Создай `.env` файл в папке проекта:

```env
# Telegram
REACT_APP_BOT_USERNAME=legend_barbershop_bot

# API
REACT_APP_API_URL=https://api.your-domain.com
REACT_APP_API_TOKEN=your-secret-token

# YClients (если интегрируешь запись через YClients)
REACT_APP_YCLIENTS_ID=your_yclients_id
```

---

## 5️⃣ Развертывание на продакшен

### Полный чеклист

- [ ] Создан бот у @BotFather
- [ ] Web App развернут на сервере (Vercel/GitHub Pages/собственный)
- [ ] Menu Button настроен в Telegram
- [ ] Переменные окружения заполнены
- [ ] Backend API готов (если нужен)
- [ ] SSL сертификат установлен (https://Let's Encrypt)
- [ ] Тестирование пройдено в Telegram
- [ ] Мониторинг настроен

### HTTPS обязателен!

Telegram требует HTTPS. Используй Let's Encrypt:

```bash
# На сервере
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d your-domain.com
```

---

## 6️⃣ YClients интеграция (для записей)

### Получи YClients ID

1. Зарегистрируйся на https://yclients.com
2. Создай бизнес (барбершоп)
3. Получи Client ID и API Token

### Добавь в backend

```javascript
// backend/yclients.js
const YClientsAPI = require('yclients')

const yclients = new YClientsAPI({
  client_id: process.env.YCLIENTS_ID,
  token: process.env.YCLIENTS_TOKEN
})

// Получи сотрудников
app.get('/api/staff', async (req, res) => {
  const staff = await yclients.getStaff()
  res.json(staff)
})

// Получи услуги
app.get('/api/services', async (req, res) => {
  const services = await yclients.getServices()
  res.json(services)
})

// Создай запись
app.post('/api/bookings', async (req, res) => {
  const { staff_id, service_id, date, time } = req.body
  const booking = await yclients.createBooking({
    staff_id,
    service_id,
    date,
    time
  })
  res.json(booking)
})
```

---

## 7️⃣ Мониторинг и аналитика

### Включи Google Analytics

В `index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

### Логирование ошибок (Sentry)

```javascript
// src/main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://your-sentry-dsn",
  environment: "production"
});
```

---

## 8️⃣ Обновления и релизы

### Версионирование

```json
// package.json
{
  "version": "1.0.0",
  "description": "ЛЕГЕНДА - Telegram Mini App"
}
```

### Процесс обновления

1. Сделай изменения локально
2. Увеличь версию: `npm version patch`
3. Загрузи на GitHub: `git push origin main`
4. Развернись: `npm run build && vercel`
5. Проверь на тестовом боте

---

## 🔐 Безопасность

### Обязательные меры

```javascript
// ✅ Проверяй Telegram JWT в backend
const TelegramBot = require('node-telegram-bot-api');

app.post('/api/webhook', (req, res) => {
  const initData = req.headers['x-init-data'];
  // Проверь подпись с Telegram
  const isValid = validateTelegramData(initData);
  if (!isValid) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Продолжи обработку
})

// ✅ Никогда не передавай токены в frontend
// ✅ Используй HTTPS везде
// ✅ Ограничи CORS
app.use(cors({
  origin: 'https://your-domain.com'
}));

// ✅ Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100 // максимум 100 запросов
});
app.use(limiter);
```

---

## 🎯 Финальный чеклист

Перед запуском в продакшен:

- [ ] Бот создан и протестирован
- [ ] Web App развернут с HTTPS
- [ ] Menu Button работает в Telegram
- [ ] API интеграция готова
- [ ] YClients подключен (если нужен)
- [ ] Мониторинг включен
- [ ] Резервные копии БД настроены
- [ ] Документация обновлена

---

## 📞 Полезные ссылки

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram WebApp Docs](https://core.telegram.org/bots/webapps)
- [@BotFather](https://t.me/botfather)
- [YClients API](https://yclients.docs.apiary.io/)

---

**Готово! Твой Mini App для ЛЕГЕНДЫ в продакшене!** 🎭

Если что-то непонятно, проверь логи:
```bash
# Frontend логи
npm run dev  # Look in console

# Backend логи
npm start  # Look in terminal/logs folder

# Telegram логи
@BotFather /stats
```
