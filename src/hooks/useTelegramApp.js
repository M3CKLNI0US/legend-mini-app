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
        const userData = tg.initDataUnsafe.user
        setUser(userData || null)
        
        // Автоматически регистрируем пользователя в системе
        if (userData?.id) {
          const userKey = `legend_user_${userData.id}`
          const existing = JSON.parse(localStorage.getItem(userKey) || '{}')
          
          localStorage.setItem(userKey, JSON.stringify({
            name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Без имени',
            username: userData.username || null,
            id: userData.id,
            level: existing.level || 'newbie',
            status: existing.status || 'active',
            referrals: existing.referrals || 0,
            joinedAt: existing.joinedAt || new Date().toISOString(),
            lastVisit: new Date().toISOString()
          }))
        }
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
      const testUser = {
        id: 123456789,
        first_name: 'Тест',
        last_name: 'Пользователь',
        username: 'test_user',
        photo_url: null
      }
      setUser(testUser)
      
      // Сохраняем тестового пользователя
      localStorage.setItem('legend_user_123456789', JSON.stringify({
        name: 'Тест Пользователь',
        username: 'test_user',
        id: 123456789,
        level: 'legend',
        status: 'active',
        referrals: 5,
        joinedAt: new Date().toISOString(),
        lastVisit: new Date().toISOString()
      }))
      
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
        resolve({ success: true, phone: testPhone, isRussian: true })
        return
      }

      // Показываем popup с запросом контакта через Telegram
      showPopup({
        title: '📱 Подтверждение номера',
        message: 'Для участия в клубе требуется российский номер телефона. Нажмите кнопку ниже, чтобы поделиться контактом.',
        buttons: [
          {
            id: 'request_contact',
            type: 'default',
            text: '📱 Поделиться контактом'
          },
          {
            id: 'cancel',
            type: 'destructive',
            text: 'Отмена'
          }
        ]
      }, (buttonId) => {
        if (buttonId === 'request_contact') {
          // Запрашиваем контакт через Telegram
          try {
            webApp.requestContact((sent, event) => {
              console.log('Contact request result:', sent, event)
              
              if (sent && event?.response) {
                const contact = event.response.contact
                if (contact && contact.phone_number) {
                  const phone = contact.phone_number
                  
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
                  resolve({ success: false, error: 'No phone number received' })
                }
              } else if (sent === false) {
                // Пользователь отказался
                resolve({ success: false, error: 'User declined' })
              } else {
                // Пробуем альтернативный способ - через showPopup с запросом телефона
                requestPhoneAlternative().then(resolve)
              }
            })
          } catch (e) {
            console.error('Error requesting contact:', e)
            // Запасной вариант
            requestPhoneAlternative().then(resolve)
          }
        } else {
          resolve({ success: false, error: 'User declined' })
        }
      })
    })
  }

  // Альтернативный способ запроса номера через MainButton
  const requestPhoneAlternative = () => {
    return new Promise((resolve) => {
      if (!webApp?.MainButton) {
        resolve({ success: false, error: 'MainButton not available' })
        return
      }
      
      // Настраиваем MainButton для запроса контакта
      webApp.MainButton.setText('📱 Поделиться номером')
      webApp.MainButton.show()
      
      const originalOnClick = webApp.MainButton.onClick
      
      webApp.MainButton.onClick(() => {
        webApp.requestContact((sent, event) => {
          webApp.MainButton.hide()
          webApp.MainButton.onClick(originalOnClick || (() => {}))
          
          if (sent && event?.response?.contact?.phone_number) {
            const phone = event.response.contact.phone_number
            const isRussian = phone.startsWith('+7') || phone.startsWith('7') || phone.startsWith('8')
            
            if (isRussian) {
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
              resolve({ success: false, error: 'Not Russian number' })
            }
          } else {
            resolve({ success: false, error: 'User declined' })
          }
        })
      })
      
      showAlert('Нажмите кнопку внизу экрана, чтобы поделиться номером')
      
      // Автоматически скрываем кнопку через 30 секунд
      setTimeout(() => {
        webApp.MainButton.hide()
      }, 30000)
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
