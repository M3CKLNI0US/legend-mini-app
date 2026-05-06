import { useEffect, useState } from 'react'

export function useTelegramApp() {
  const [user, setUser] = useState(null)
  const [isReady, setIsReady] = useState(false)
  const [webApp, setWebApp] = useState(null)

  useEffect(() => {
    // Получи Telegram WebApp объект
    const tg = window.Telegram?.WebApp

    if (tg) {
      setWebApp(tg)

      // Готовое приложение
      tg.ready()

      // Установи тему на основе системных предпочтений
      if (tg.colorScheme === 'dark') {
        document.documentElement.style.colorScheme = 'dark'
      }

      // Получи информацию о пользователе
      if (tg.initData && tg.initDataUnsafe) {
        setUser(tg.initDataUnsafe.user || null)
      }

      // Расширь приложение на весь экран
      tg.expand()

      // Отключи скролл на главной Telegram странице
      tg.disableVerticalSwipes()

      setIsReady(true)

      console.log('Telegram WebApp initialized:', {
        user: tg.initDataUnsafe?.user,
        platform: tg.platform,
        version: tg.version
      })
    } else {
      // Локальный режим (вне Telegram) - эмулируем пользователя
      console.log('Running in local mode (outside Telegram)')
      setUser({
        id: 123456789,
        first_name: 'Тест',
        last_name: 'Пользователь',
        username: 'test_user',
        photo_url: null
      })
      setIsReady(true)
    }
  }, [])

  const showAlert = (message) => {
    if (webApp) {
      webApp.showAlert(message)
    } else {
      alert(message)
    }
  }

  const showConfirm = (message, callback) => {
    if (webApp) {
      webApp.showConfirm(message, callback)
    } else {
      const result = confirm(message)
      callback?.(result)
    }
  }

  const close = () => {
    if (webApp) {
      webApp.close()
    }
  }

  const showPopup = (params) => {
    if (webApp) {
      webApp.showPopup(params)
    }
  }

  const openTelegramLink = (url) => {
    if (webApp) {
      webApp.openTelegramLink(url)
    }
  }

  const openLink = (url) => {
    if (webApp) {
      webApp.openLink(url)
    }
  }

  const shareLink = (url, text) => {
    if (webApp) {
      webApp.openTelegramLink(
        `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
      )
    }
  }

  const sendData = (data) => {
    if (webApp) {
      webApp.sendData(JSON.stringify(data))
    }
  }

  // Запрос контакта (телефона) с проверкой на российский номер
  const requestPhoneNumber = async () => {
    return new Promise((resolve) => {
      if (!webApp) {
        // Локальный режим - эмулируем
        const testPhone = '+79001234567'
        localStorage.setItem('legend_phone', testPhone)
        resolve({ success: true, phone: testPhone })
        return
      }

      // Используем нативный запрос контакта Telegram
      webApp.requestContact((sent, event) => {
        if (sent && event && event.response) {
          const phone = event.response.contact?.phone_number
          
          if (phone) {
            // Проверяем что номер российский (+7 или 8)
            const isRussian = phone.startsWith('+7') || phone.startsWith('7') || phone.startsWith('8')
            
            if (isRussian) {
              // Нормализуем номер к формату +7...
              let normalizedPhone = phone
              if (phone.startsWith('8') && phone.length === 11) {
                normalizedPhone = '+7' + phone.slice(1)
              } else if (phone.startsWith('7') && !phone.startsWith('+7')) {
                normalizedPhone = '+7' + phone.slice(1)
              }
              
              localStorage.setItem('legend_phone', normalizedPhone)
              resolve({ success: true, phone: normalizedPhone, isRussian: true })
            } else {
              showAlert('❌ Требуется российский номер телефона (+7...)')
              resolve({ success: false, phone, isRussian: false, error: 'Not Russian number' })
            }
          } else {
            resolve({ success: false, error: 'No phone received' })
          }
        } else {
          resolve({ success: false, error: 'User declined' })
        }
      })
    })
  }

  // Проверка сохраненного номера
  const getSavedPhone = () => {
    return localStorage.getItem('legend_phone') || null
  }

  // Валидация ручного ввода номера
  const validateRussianPhone = (phone) => {
    // Убираем все нецифры
    const digits = phone.replace(/\D/g, '')
    
    // Проверяем длину и код страны
    if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
      return { valid: true, normalized: '+7' + digits.slice(1) }
    }
    if (digits.length === 10) {
      // Нет кода страны - добавляем +7
      return { valid: true, normalized: '+7' + digits }
    }
    
    return { valid: false, error: 'Неверный формат. Введите российский номер (+7...)' }
  }

  return {
    user,
    isReady,
    webApp,
    showAlert,
    showConfirm,
    close,
    showPopup,
    openTelegramLink,
    openLink,
    shareLink,
    sendData,
    requestPhoneNumber,
    getSavedPhone,
    validateRussianPhone,
  }
}
