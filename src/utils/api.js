/**
 * Утилиты для работы с Telegram WebApp
 */

export const getTelegramUser = () => {
  if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
    return window.Telegram.WebApp.initDataUnsafe.user
  }
  return null
}

export const getTelegramInitData = () => {
  return window.Telegram?.WebApp?.initData || ''
}

export const generateReferralLink = (userId) => {
  const botUsername = import.meta.env.VITE_BOT_USERNAME || 'YourBotUsername'
  return `https://t.me/${botUsername}?start=ref_${userId}`
}

export const shareToTelegram = (webApp, text, link) => {
  const shareText = encodeURIComponent(`${text}\n\n${link}`)
  const url = `https://t.me/share/url?url=${link}&text=${text.split('\n')[0]}`
  webApp.openTelegramLink(url)
}

/**
 * API Calls (замени на свой backend)
 */

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.example.com'

export const api = {
  // Получи профиль пользователя
  getUserProfile: async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${getTelegramInitData()}`,
        },
      })
      return await response.json()
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  },

  // Создай запись
  createBooking: async (userId, serviceId, date, time) => {
    try {
      const response = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getTelegramInitData()}`,
        },
        body: JSON.stringify({
          user_id: userId,
          service_id: serviceId,
          date,
          time,
        }),
      })
      return await response.json()
    } catch (error) {
      console.error('Error creating booking:', error)
      return null
    }
  },

  // Получи рефералов пользователя
  getReferrals: async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/referrals`, {
        headers: {
          'Authorization': `Bearer ${getTelegramInitData()}`,
        },
      })
      return await response.json()
    } catch (error) {
      console.error('Error fetching referrals:', error)
      return []
    }
  },

  // Зарегистрируй рефераль
  registerReferral: async (referrerId, refereeId) => {
    try {
      const response = await fetch(`${API_BASE}/referrals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getTelegramInitData()}`,
        },
        body: JSON.stringify({
          referrer_id: referrerId,
          referee_id: refereeId,
        }),
      })
      return await response.json()
    } catch (error) {
      console.error('Error registering referral:', error)
      return null
    }
  },

  // Получи уровень пользователя
  getUserLevel: async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/level`, {
        headers: {
          'Authorization': `Bearer ${getTelegramInitData()}`,
        },
      })
      return await response.json()
    } catch (error) {
      console.error('Error fetching user level:', error)
      return 'newbie'
    }
  },
}

/**
 * Форматирование
 */

export const formatPhoneNumber = (phone) => {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) {
    return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`
  }
  return phone
}

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatTime = (time) => {
  return new Date(time).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Уведомление админа о записи. Токен бота нельзя держать во фронтенде —
 * укажи URL своего бэкенда (POST JSON), который вызовет sendMessage.
 */
export const notifyAdminBooking = async (bookingData) => {
  const notifyUrl = import.meta.env.VITE_ADMIN_NOTIFY_URL
  if (!notifyUrl) {
    console.warn(
      '[notifyAdminBooking] Задай VITE_ADMIN_NOTIFY_URL — эндпоинт, который отправит сообщение в Telegram от имени бота.'
    )
    const pending = JSON.parse(localStorage.getItem('legend_pending_bookings') || '[]')
    pending.push({ ...bookingData, createdAt: new Date().toISOString() })
    localStorage.setItem('legend_pending_bookings', JSON.stringify(pending))
    return false
  }

  try {
    const response = await fetch(notifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    })
    return response.ok
  } catch (error) {
    console.error('Error sending admin notification:', error)
    const pending = JSON.parse(localStorage.getItem('legend_pending_bookings') || '[]')
    pending.push({ ...bookingData, createdAt: new Date().toISOString() })
    localStorage.setItem('legend_pending_bookings', JSON.stringify(pending))
    return false
  }
}
