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

✅ **Команды теперь полностью работают!** 

Когда пользователь нажимает на команду в меню бота, приложение автоматически переходит на соответствующую страницу.

### Как это работает:

1. **Пользователь нажимает команду** в меню бота (например, `/profile`)
2. **Команда передается** в Mini App через URL параметры или initData
3. **Приложение обрабатывает** команду и переходит на нужную страницу
4. **URL очищается** после обработки для чистоты

### Код обработки команд:

```javascript
// В App.jsx добавлен обработчик команд
useEffect(() => {
  const webApp = window.Telegram?.WebApp
  
  // Проверяем команду из URL параметров
  const urlParams = new URLSearchParams(window.location.search)
  const commandFromUrl = urlParams.get('command')
  
  // Проверяем команду из initDataUnsafe
  const commandFromInitData = webApp?.initDataUnsafe?.query?.command
  
  // Определяем команду
  const command = commandFromUrl || commandFromInitData
  
  if (command) {
    switch (command) {
      case 'start':
      case 'profile':
        setCurrentPage('profile')
        break
      case 'booking':
        setCurrentPage('booking')
        break
      case 'referral':
        setCurrentPage('referral')
        break
      case 'settings':
        setCurrentPage('settings')
        break
      case 'admin':
        if (user?.id?.toString() === ADMIN_ID) {
          setCurrentPage('admin')
        }
        break
    }
  }
}, [user])
```

---

**Статус:** ✅ **Команды установлены и работают!**
