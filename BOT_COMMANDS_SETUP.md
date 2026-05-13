# 🤖 Установка команд Telegram бота

**Bot Token:** `8425892844:AAH77_x1DLrlOGF2IIoqRyMFaOHADotlpKo`

## Способ 1: Через @BotFather (Самый простой) ✅

1. Напишите боту **@BotFather** в Telegram
2. Отправьте команду: `/setcommands`
3. Выберите вашего бота
4. Скопируйте и отправьте следующий список:

```
start - 🚀 Запустить приложение
profile - 👤 Мой профиль
booking - 📅 Бронирования
referral - 🎁 Реферальная программа
settings - ⚙️ Настройки
help - ❓ Справка
admin - 🔑 Админ-панель (только для администраторов)
```

## Способ 2: Через Telegram Bot API (Когда подключение восстановится)

Выполните в терминале:

```bash
node api/setup-bot-commands.js
```

Или через curl:

```bash
curl -X POST "https://api.telegram.org/bot8425892844:AAH77_x1DLrlOGF2IIoqRyMFaOHADotlpKo/setMyCommands" \
  -H "Content-Type: application/json" \
  -d '{
    "commands": [
      {"command": "start", "description": "🚀 Запустить приложение"},
      {"command": "profile", "description": "👤 Мой профиль"},
      {"command": "booking", "description": "📅 Бронирования"},
      {"command": "referral", "description": "🎁 Реферальная программа"},
      {"command": "settings", "description": "⚙️ Настройки"},
      {"command": "help", "description": "❓ Справка"},
      {"command": "admin", "description": "🔑 Админ-панель"}
    ]
  }'
```

## Описание команд

| Команда | Описание |
|---------|---------|
| `/start` | Запустить приложение и показать начальное меню |
| `/profile` | Перейти в профиль пользователя |
| `/booking` | Открыть раздел бронирований |
| `/referral` | Показать реферальную программу |
| `/settings` | Открыть настройки |
| `/help` | Получить справку и помощь |
| `/admin` | Администраторская панель (доступна только администраторам) |

## Обработка команд в боте

Добавьте обработчик команд в ваш бот:

```javascript
// Примерная структура для обработки команд в вашем приложении
const commandHandlers = {
  'start': () => navigateTo('home'),
  'profile': () => navigateTo('profile'),
  'booking': () => navigateTo('booking'),
  'referral': () => navigateTo('referral'),
  'settings': () => navigateTo('settings'),
  'help': () => navigateTo('help'),
  'admin': () => navigateTo('admin')
};
```

---

**Статус текущей попытки:** ⚠️ Подключение к Telegram API недоступно (сетевая блокировка или отсутствие интернета)

**Рекомендация:** Используйте **Способ 1** через @BotFather для быстрой установки команд
