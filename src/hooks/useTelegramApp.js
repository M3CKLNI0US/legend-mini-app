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
  }
}
