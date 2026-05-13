import { useEffect, useState } from 'react'
import { saveUserToFirebase, getUserFromFirebase, savePhoneToFirebase, getPhoneFromFirebase } from '../firebase'
import { extractPhoneFromContactPayload, normalizeRussianPhone } from '../utils/extractTelegramContactPhone'

export function useTelegramApp() {
  const [user, setUser] = useState(null)
  const [isReady, setIsReady] = useState(false)
  const [webApp, setWebApp] = useState(null)
  const [initData, setInitData] = useState('')

  useEffect(() => {
    // Получи Telegram WebApp объект
    const tg = window.Telegram?.WebApp

    if (tg) {
      setWebApp(tg)
      setInitData(tg.initData || '')

      // Готовое приложение
      tg.ready()

      // Установи тему на основе системных предпочтений
      if (tg.colorScheme === 'dark') {
        document.documentElement.style.colorScheme = 'dark'
      }

      // initData может быть пустым в отладке, но initDataUnsafe.user часто есть
      if (tg.initDataUnsafe?.user) {
        const userData = tg.initDataUnsafe.user
        setUser(userData || null)

        if (userData?.id) {
          const registerUser = async () => {
            const existingUser = await getUserFromFirebase(userData.id)

            const userRecord = {
              name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Без имени',
              username: userData.username || null,
              id: userData.id,
              level: existingUser?.level || 'newbie',
              status: existingUser?.status || 'active',
              referrals: existingUser?.referrals ?? 0,
              joinedAt: existingUser?.joinedAt || new Date().toISOString(),
              lastVisit: new Date().toISOString(),
              notificationsEnabled: existingUser?.notificationsEnabled !== false,
              smsNotifications: !!existingUser?.smsNotifications,
              themePreference: existingUser?.themePreference || 'auto',
              language: existingUser?.language || 'ru',
              phoneVerified: !!existingUser?.phoneVerified,
              phone: existingUser?.phone || null,
            }

            await saveUserToFirebase(userRecord)
            console.log('User registered in Firebase:', userData.id)
          }

          registerUser().catch(console.error)
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
      
      // Сохраняем тестового пользователя в Firebase
      saveUserToFirebase({
        name: 'Тест Пользователь',
        username: 'test_user',
        id: 123456789,
        level: 'legend',
        status: 'active',
        referrals: 5,
        joinedAt: new Date().toISOString(),
        lastVisit: new Date().toISOString(),
        notificationsEnabled: true,
        smsNotifications: false,
        themePreference: 'auto',
        language: 'ru',
      }).catch(console.error)
      
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

  // Запрос контакта (телефона) через Telegram + разбор разных форматов ответа
  const requestPhoneNumber = async () => {
    return new Promise((resolve) => {
      if (!webApp) {
        const testPhone = '+79001234567'
        localStorage.setItem('legend_phone', testPhone)
        resolve({ success: true, phone: testPhone, isRussian: true })
        return
      }

      if (!webApp.requestContact) {
        showAlert(
          '❌ В этой версии Telegram недоступен запрос контакта. Обновите приложение или введите номер вручную ниже.'
        )
        resolve({ success: false, error: 'requestContact not supported' })
        return
      }

      let settled = false
      const finish = (payload) => {
        if (settled) return
        settled = true
        try {
          webApp.offEvent('contactRequested', onContactRequested)
        } catch {
          /* ignore */
        }
        resolve(payload)
      }

      const onContactRequested = (e) => {
        if (settled) return
        if (e?.status === 'cancelled') {
          finish({ success: false, error: 'User declined' })
        }
      }

      try {
        webApp.onEvent('contactRequested', onContactRequested)
      } catch {
        /* старые клиенты без события */
      }

      try {
        webApp.requestContact((sent, event) => {
          const phone = extractPhoneFromContactPayload(sent, event)
          if (phone) {
            localStorage.setItem('legend_phone', phone)
            try {
              webApp.HapticFeedback?.notificationOccurred?.('success')
            } catch {
              /* ignore */
            }
            finish({ success: true, phone, isRussian: true })
            return
          }

          if (sent === false) {
            finish({ success: false, error: 'User declined' })
            return
          }

          if (sent === true) {
            console.warn('requestContact: sent=true but phone not parsed', event)
            showAlert(
              'Не удалось прочитать номер из ответа Telegram. Введите номер вручную в поле ниже или обновите Telegram.'
            )
            finish({ success: false, error: 'No phone in response' })
          }
        })
      } catch (e) {
        console.error('Error requesting contact:', e)
        showAlert('❌ Ошибка при запросе контакта: ' + (e?.message || String(e)))
        finish({ success: false, error: e?.message || 'requestContact error' })
      }
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

          const phone = extractPhoneFromContactPayload(sent, event)
          if (phone) {
            if (user?.id) {
              savePhoneToFirebase(user.id, phone)
            }
            localStorage.setItem('legend_phone', phone)
            resolve({ success: true, phone, isRussian: true })
            return
          }

          if (sent === false) {
            resolve({ success: false, error: 'User declined' })
          } else {
            resolve({ success: false, error: 'No phone in response' })
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
  const getSavedPhone = async () => {
    if (user?.id) {
      const phone = await getPhoneFromFirebase(user.id)
      if (phone) return phone
    }
    return localStorage.getItem('legend_phone') || null
  }

  // Валидация ручного ввода номера
  const validateRussianPhone = (phone) => {
    const normalized = normalizeRussianPhone(phone)
    if (normalized) {
      return { valid: true, normalized }
    }
    return { valid: false, error: 'Неверный формат. Введите российский номер (+7...)' }
  }

  return {
    user,
    isReady,
    webApp,
    initData,
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
