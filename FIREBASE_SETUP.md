# 🔥 Firebase Setup Guide

## Быстрый старт (3 минуты)

### 1. Создай проект в Firebase
1. Перейди на https://console.firebase.google.com
2. Нажми "Create project"
3. Назови проект: `legend-barber-club`
4. Отключи Google Analytics (не нужно)
5. Нажми "Create project"

### 2. Добавь Realtime Database
1. В меню слева выбери "Build" → "Realtime Database"
2. Нажми "Create Database"
3. Выбери локацию: `europe-west1` (Бельгия) — ближе всего к России
4. Нажми "Next"
5. **Важно:** Выбери режим "Start in test mode" (временно)
6. Нажми "Enable"

### 3. Получи конфигурацию
1. В настройках проекта (шестеренка) → "Project settings"
2. Вкладка "General"
3. Прокрути вниз до "Your apps" → "Web"
4. Нажми "</>" (Add web app)
5. Назови: `Legend Barber Club`
6. Нажми "Register app"
7. Скопируй конфигурацию (firebaseConfig)

### 4. Вставь конфигурацию
Открой файл `src/firebase.js` и замени placeholder:

```javascript
const firebaseConfig = {
  apiKey: "ТВОЙ_API_KEY",
  authDomain: "ТВОЙ_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://ТВОЙ_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "ТВОЙ_PROJECT_ID",
  storageBucket: "ТВОЙ_PROJECT_ID.appspot.com",
  messagingSenderId: "ТВОЙ_SENDER_ID",
  appId: "ТВОЙ_APP_ID"
}
```

### 5. Настрой правила безопасности
В Realtime Database → Rules, замени на:

```json
{
  "rules": {
    "users": {
      ".read": true,
      "$uid": {
        ".write": true
      }
    },
    "phones": {
      ".read": true,
      "$uid": {
        ".write": true
      }
    },
    "referrals": {
      ".read": true,
      "$uid": {
        ".write": true
      }
    }
  }
}
```

Нажми "Publish"

### 6. Деплой
```bash
git add .
git commit -m "Add Firebase integration"
git push origin main
```

## Что изменится

✅ **Все пользователи** будут сохраняться в Firebase  
✅ **Телефоны** синхронизируются между устройствами  
✅ **Админ-панель** видит ВСЕХ пользователей в реальном времени  
✅ **Мгновенные обновления** — без перезагрузки страницы

## Структура базы данных

```
legend-barber-club-default-rtdb.firebaseio.com/
├── users/
│   ├── 1100054796/
│   │   ├── name: "Admin User"
│   │   ├── level: "legend"
│   │   ├── status: "active"
│   │   ├── referrals: 5
│   │   └── ...
│   └── ...
├── phones/
│   ├── 1100054796/
│   │   ├── phone: "+79001234567"
│   │   └── verifiedAt: "2024-01-15T10:30:00Z"
│   └── ...
└── referrals/
    ├── 1100054796/
    │   └── ...
    └── ...
```

## Бесплатный лимит (Spark Plan)

- **База данных**: 1 GB хранилища
- **Скачивание**: 10 GB/месяц
- **Одновременные подключения**: 100,000
- **Для твоего барабершопа**: хватит на ~10,000 пользователей

## Проверка работы

1. Открой приложение в Telegram
2. Зайди в настройки → Подтвердить номер
3. Подтверди номер через Telegram
4. Зайди в Firebase Console → Realtime Database
5. Увидишь нового пользователя и телефон! 📱

## Проблемы?

**Ошибка "Permission denied"** — проверь правила безопасности в Rules  
**Данные не сохраняются** — проверь firebaseConfig (все 6 полей)  
**Админка пустая** — убедись что ты добавил правильный ADMIN_USER_ID

## Контакты поддержки Firebase
- Документация: https://firebase.google.com/docs/database
- Статус: https://status.firebase.google.com
