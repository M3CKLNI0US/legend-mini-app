# 💻 ПРИМЕРЫ КОДА | ЛЕГЕНДА

Примеры использования компонентов, hooks и API.

---

## 📱 Компоненты

### Header

```jsx
import Header from './components/Header'

<Header userLevel="guardian" />
```

**Props:**
- `userLevel` (string): "newbie" | "guardian" | "elder" | "legend"

**Результат:** Шапка с логотипом и текущим уровнем пользователя

---

### Profile

```jsx
import Profile from './components/Profile'

<Profile 
  user={user} 
  userLevel={userLevel} 
  referralCount={referralCount}
/>
```

**Props:**
- `user` (object): { id, first_name, username }
- `userLevel` (string): текущий уровень
- `referralCount` (number): количество рефералов

**Результат:** Главная карта, статистика, 4 уровня системы

---

### ReferralSystem

```jsx
import ReferralSystem from './components/ReferralSystem'

const [referralCount, setReferralCount] = useState(5)

<ReferralSystem 
  referralCount={referralCount}
  setReferralCount={setReferralCount}
/>
```

**Props:**
- `referralCount` (number): текущее количество рефералов
- `setReferralCount` (function): callback для обновления

**Результат:** Система рефералов, ссылка приглашения, награды

---

### Booking

```jsx
import Booking from './components/Booking'

<Booking />
```

**Результат:** Форма записи с выбором даты, времени, мастера

---

### Settings

```jsx
import Settings from './components/Settings'

<Settings user={user} />
```

**Props:**
- `user` (object): информация о пользователе

**Результат:** Профиль, уведомления, настройки

---

### MainButton

```jsx
import MainButton from './components/MainButton'

<MainButton currentPage="profile" />
```

**Props:**
- `currentPage` (string): текущая страница ("profile" | "referral" | "booking" | "settings")

**Результат:** Автоматически управляет главной кнопкой Telegram

---

### BottomNavigation

```jsx
import BottomNavigation from './components/BottomNavigation'

const [currentPage, setCurrentPage] = useState('profile')

<BottomNavigation 
  currentPage={currentPage}
  setCurrentPage={setCurrentPage}
/>
```

**Props:**
- `currentPage` (string): текущая активная страница
- `setCurrentPage` (function): callback для смены страницы

**Результат:** 4-х кнопочное меню внизу (Profile, Referral, Booking, Settings)

---

## 🪝 Hooks

### useTelegramApp

```jsx
import { useTelegramApp } from './hooks/useTelegramApp'

export default function MyComponent() {
  const { 
    user,              // Информация о пользователе
    isReady,           // Приложение готово?
    webApp,            // Экземпляр WebApp
    showAlert,         // Показать алерт
    showConfirm,       // Показать подтверждение
    close,             // Закрыть приложение
    showPopup,         // Показать popup
    openTelegramLink,  // Открыть ссылку в Telegram
    openLink,          // Открыть обычную ссылку
    shareLink,         // Поделиться ссылкой
    sendData,          // Отправить данные на backend
  } = useTelegramApp()

  if (!isReady) return <div>Загрузка...</div>

  return (
    <button onClick={() => showAlert('Привет!')}>
      Привет, {user?.first_name}!
    </button>
  )
}
```

**Методы:**

```javascript
// Показать алерт
showAlert('Запись создана!')

// Показать подтверждение
showConfirm('Ты уверен?', (result) => {
  if (result) {
    // Пользователь нажал OK
  }
})

// Закрыть приложение
close()

// Показать popup
showPopup({
  title: 'Заголовок',
  buttons: [
    { id: 1, text: 'OK' },
    { id: 2, text: 'Отмена' }
  ]
})

// Открыть ссылку в Telegram (для t.me)
openTelegramLink('https://t.me/legend_barbershop_bot')

// Открыть обычную ссылку (http/https)
openLink('https://example.com')

// Поделиться ссылкой (показывает меню выбора контакта)
shareLink('https://t.me/legend_barbershop_bot', 'Присоединяйся к клубу!')

// Отправить данные на backend
sendData({ key: 'value' })
```

---

## 🔌 API Utils

### getTelegramUser

```javascript
import { getTelegramUser } from './utils/api'

const user = getTelegramUser()
console.log(user.id, user.first_name)
```

---

### generateReferralLink

```javascript
import { generateReferralLink } from './utils/api'

const link = generateReferralLink(user.id)
console.log(link) // https://t.me/legend_barbershop_bot?start=ref_123456
```

---

### API Calls

```javascript
import { api } from './utils/api'

// Получи профиль пользователя
const profile = await api.getUserProfile(userId)
console.log(profile) // { level: 'guardian', referrals: 5 }

// Получи рефералов
const referrals = await api.getReferrals(userId)

// Зарегистрируй рефераль
const result = await api.registerReferral(referrerId, refereeId)

// Создай запись
const booking = await api.createBooking(
  userId,
  serviceId,
  '2024-05-20',
  '14:30'
)

// Получи уровень пользователя
const level = await api.getUserLevel(userId)
```

---

## 🎨 Tailwind Классы

### Цвета

```jsx
{/* Background */}
<div className="bg-legend-black">Основной черный</div>
<div className="bg-legend-deep">Глубокий фон</div>
<div className="bg-legend-brass">Латунь</div>
<div className="bg-legend-gold">Золото</div>
<div className="bg-legend-wenge">Венге</div>
<div className="bg-legend-light">Светлый</div>

{/* Text */}
<p className="text-legend-gold">Золотой текст</p>
<p className="text-legend-light">Светлый текст</p>
<p className="text-legend-brass">Бронзовый текст</p>

{/* Border */}
<div className="border border-legend-gold">Золотая граница</div>
<div className="border border-legend-wenge">Граница венге</div>
```

### Компоненты

```jsx
{/* Премиальная карта */}
<div className="card-premium">
  Содержимое карты
</div>

{/* Кнопка золото (контур) */}
<button className="btn-gold">
  Текст кнопки
</button>

{/* Кнопка золото (заполненная) */}
<button className="btn-gold-filled">
  Текст кнопки
</button>

{/* Badge уровня */}
<span className="badge-level">
  Легенда
</span>

{/* Линия акцента */}
<div className="line-accent" />
```

### Анимации

```jsx
{/* Плавное появление */}
<div className="animate-fade-in">
  Появляется за 0.6 секунд
</div>

{/* Пульсирующее свечение */}
<div className="animate-glow-pulse">
  Пульсирует золотом
</div>

{/* Скольжение слева */}
<div className="animate-slide-in">
  Скользит слева за 0.5 секунд
</div>
```

### Эффекты нажатия

```jsx
{/* Кнопка с эффектом нажатия */}
<button className="pressable">
  Нажми меня
</button>

{/* При нажатии: scale(0.98) + opacity(0.8) */}
```

### Другое

```jsx
{/* Sticky позиция */}
<div className="sticky top-0">
  Зафиксировано сверху
</div>

{/* Отступ внизу (для меню) */}
<div className="pb-32">
  Содержимое с отступом
</div>

{/* Flex layout */}
<div className="flex justify-between items-center">
  Левый элемент
  <span>Правый элемент</span>
</div>

{/* Grid */}
<div className="grid grid-cols-3 gap-3">
  <div>Колонка 1</div>
  <div>Колонка 2</div>
  <div>Колонка 3</div>
</div>
```

---

## 📝 Полный пример страницы

```jsx
import React, { useState } from 'react'
import { useTelegramApp } from './hooks/useTelegramApp'

export default function ExamplePage() {
  const { user, showAlert, shareLink } = useTelegramApp()
  const [count, setCount] = useState(0)

  const handleInvite = () => {
    shareLink(
      'https://t.me/legend_barbershop_bot',
      'Присоединяйся к ЛЕГЕНДЕ!'
    )
    setCount(count + 1)
  }

  return (
    <div className="p-4 pb-32 space-y-6">
      {/* Заголовок */}
      <div className="card-premium bg-gradient-to-r from-legend-brass/20 to-legend-gold/20 border-legend-gold">
        <p className="text-center text-lg font-serif font-bold text-legend-gold">
          Приветствую, {user?.first_name}!
        </p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-premium text-center">
          <p className="text-legend-gold text-3xl font-serif">{count}</p>
          <p className="text-xs text-legend-light/60">Приглашений</p>
        </div>
        <div className="card-premium text-center">
          <p className="text-legend-gold text-3xl font-serif">◆◆</p>
          <p className="text-xs text-legend-light/60">Твой уровень</p>
        </div>
      </div>

      {/* Кнопка действия */}
      <button
        onClick={handleInvite}
        className="w-full card-premium bg-gradient-to-r from-legend-brass/20 to-legend-gold/20 border border-legend-gold pressable hover:shadow-[0_0_30px_rgba(198,169,107,0.4)]"
      >
        <p className="text-center text-lg font-serif font-bold text-legend-gold">
          Пригласить друга
        </p>
      </button>

      {/* Информация */}
      <div className="card-premium bg-legend-wenge/20 border-legend-brass/50">
        <p className="text-xs text-legend-light/70">
          Каждый приглашённый друг дает тебе +1 уровень и бонусы!
        </p>
      </div>
    </div>
  )
}
```

---

## 🔗 Интеграция с backend

### Получение данных на старте

```jsx
import { useEffect } from 'react'
import { api } from './utils/api'
import { useTelegramApp } from './hooks/useTelegramApp'

export default function App() {
  const { user } = useTelegramApp()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (user?.id) {
      // Загруз данные профиля
      api.getUserProfile(user.id).then(data => {
        setProfile(data)
      })
    }
  }, [user])

  if (!profile) return <div>Загрузка...</div>

  return <div>Уровень: {profile.level}</div>
}
```

### Отправка данных

```jsx
const handleBooking = async () => {
  const booking = await api.createBooking(
    user.id,
    serviceId,
    selectedDate,
    selectedTime
  )

  if (booking) {
    showAlert('✓ Запись создана!')
  }
}
```

---

## 🚀 Запуск приложения

```bash
# Локально
npm run dev

# Production build
npm run build

# Превью production
npm run preview
```

---

## 📖 Документация

- [React Docs](https://react.dev)
- [TailwindCSS](https://tailwindcss.com)
- [Telegram WebApp API](https://core.telegram.org/bots/webapps)
- [Vite](https://vitejs.dev)

---

**Готово к использованию! Начни разрабатывать! 🚀**
