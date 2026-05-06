import React, { useState, useEffect } from 'react'
import { useTelegramApp } from '../hooks/useTelegramApp'

export default function PhoneVerification({ onVerified }) {
  const { requestPhoneNumber, getSavedPhone, showAlert, user } = useTelegramApp()
  const [savedPhone, setSavedPhone] = useState(null)
  const [isVerified, setIsVerified] = useState(false)

  // Загрузка сохраненного номера при монтировании
  useEffect(() => {
    const phone = getSavedPhone()
    if (phone) {
      setSavedPhone(phone)
      setIsVerified(true)
    }
  }, [getSavedPhone])

  // Сохранение номера с ID пользователя для реферальной системы
  const savePhoneWithUserId = (phone) => {
    localStorage.setItem('legend_phone', phone)
    // Сохраняем привязку номера к ID пользователя для рефералов
    if (user?.id) {
      localStorage.setItem(`legend_phone_${user.id}`, phone)
    }
    
    // Проверяем есть ли ожидающий реферальный бонус
    const pendingReferrer = localStorage.getItem('legend_pending_referrer')
    if (pendingReferrer) {
      // Пригласивший получит бонус
      showAlert(`✓ Номер подтвержден! Бонус начислен пригласившему.`)
      localStorage.removeItem('legend_pending_referrer')
      // Вызываем callback если есть
      if (onVerified) onVerified()
    } else {
      showAlert(`✓ Номер подтвержден: ${phone}`)
    }
  }

  // Запрос номера через Telegram
  const handleRequestPhone = async () => {
    const result = await requestPhoneNumber()
    
    if (result.success && result.isRussian) {
      setSavedPhone(result.phone)
      setIsVerified(true)
      savePhoneWithUserId(result.phone)
    } else if (!result.success && result.error === 'Not Russian number') {
      // Иностранный номер - показываем ошибку
      showAlert('❌ Принимаются только российские номера (+7)')
    } else if (!result.success && result.error === 'User declined') {
      showAlert('❌ Вы отказались предоставить номер')
    }
  }

  // Очистка номера
  const handleClearPhone = () => {
    localStorage.removeItem('legend_phone')
    if (user?.id) {
      localStorage.removeItem(`legend_phone_${user.id}`)
    }
    setSavedPhone(null)
    setIsVerified(false)
    showAlert('Номер удален')
  }

  if (isVerified && savedPhone) {
    return (
      <div className="card-premium border-legend-gold">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-legend-gold/20 flex items-center justify-center text-legend-gold text-xl">
              ✓
            </div>
            <div>
              <p className="text-sm text-legend-gold font-bold">Номер подтвержден</p>
              <p className="text-xs text-legend-light/60">{savedPhone}</p>
            </div>
          </div>
          <button 
            onClick={handleClearPhone}
            className="text-xs text-legend-light/40 hover:text-red-400 transition-colors px-3 py-1"
          >
            Изменить
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Заголовок */}
      <div className="card-premium bg-legend-wenge/20 border-legend-brass/50">
        <p className="text-sm text-legend-gold font-bold mb-2">📱 Подтверждение номера</p>
        <p className="text-xs text-legend-light/70">
          Для записи к мастеру и участия в реферальной программе требуется российский номер телефона.
        </p>
      </div>

      {/* Кнопка запроса через Telegram */}
      <button
        onClick={handleRequestPhone}
        className="w-full card-premium bg-gradient-to-r from-legend-brass/20 to-legend-gold/20 border border-legend-gold pressable hover:shadow-[0_0_30px_rgba(198,169,107,0.4)]"
      >
        <div className="flex items-center justify-center gap-2">
          <span className="text-xl">📱</span>
          <p className="text-center text-lg font-serif font-bold text-legend-gold">
            Подтвердить номер через Telegram
          </p>
        </div>
        <p className="text-xs text-legend-light/60 text-center mt-1">
          Нажмите, чтобы поделиться контактом
        </p>
      </button>

      <p className="text-xs text-legend-light/40 text-center">
        Только российские номера (+7). Иностранные номера не принимаются.
      </p>
    </div>
  )
}
