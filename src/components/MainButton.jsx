import React, { useEffect } from 'react'
import { useTelegramApp } from '../hooks/useTelegramApp'

export default function MainButton({ currentPage }) {
  const { webApp, showAlert } = useTelegramApp()

  useEffect(() => {
    if (!webApp) return

    // Настройка кнопки в зависимости от страницы
    const buttonConfig = {
      profile: {
        text: 'Записаться',
        callback: () => showAlert('Переход к записи...'),
      },
      referral: {
        text: 'Пригласить',
        callback: () => showAlert('Откройти реферальную ссылку...'),
      },
      booking: {
        text: 'Подтвердить',
        callback: () => showAlert('Запись создана!'),
      },
      settings: {
        text: 'Сохранить',
        callback: () => showAlert('Профиль обновлён'),
      },
    }

    const config = buttonConfig[currentPage]

    if (config) {
      webApp.MainButton.text = config.text
      webApp.MainButton.show()
      webApp.onEvent('mainButtonClicked', config.callback)

      return () => {
        webApp.offEvent('mainButtonClicked', config.callback)
      }
    }
  }, [currentPage, webApp, showAlert])

  return null
}
