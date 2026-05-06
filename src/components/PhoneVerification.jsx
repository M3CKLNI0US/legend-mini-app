import React, { useState, useEffect } from 'react'
import { useTelegramApp } from '../hooks/useTelegramApp'

export default function PhoneVerification({ onVerified }) {
  const { requestPhoneNumber, getSavedPhone, validateRussianPhone, showAlert, user } = useTelegramApp()
  const [savedPhone, setSavedPhone] = useState(null)
  const [manualPhone, setManualPhone] = useState('')
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

  // Ручной ввод номера
  const handleManualSubmit = (e) => {
    e.preventDefault()
    
    const validation = validateRussianPhone(manualPhone)
    
    if (validation.valid) {
      savePhoneWithUserId(validation.normalized)
      setSavedPhone(validation.normalized)
      setIsVerified(true)
      setManualPhone('')
    } else {
      showAlert(`❌ ${validation.error}`)
    }
  }

  // Очистка номера
  const handleClearPhone = () => {
    localStorage.removeItem('legend_phone')
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
          Для записи к мастеру требуется российский номер телефона. 
          Мы отправим вам SMS с подтверждением.
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
            Поделиться контактом
          </p>
        </div>
        <p className="text-xs text-legend-light/60 text-center mt-1">
          Безопасный запрос через Telegram
        </p>
      </button>

      {/* Или вручную */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-legend-wenge/30"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-legend-black px-2 text-xs text-legend-light/40">или введите вручную</span>
        </div>
      </div>

      {/* Ручной ввод */}
      <form onSubmit={handleManualSubmit} className="space-y-3">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-legend-gold font-bold">+7</span>
          <input
            type="tel"
            value={manualPhone}
            onChange={(e) => setManualPhone(e.target.value.replace(/\D/g, ''))}
            placeholder="(900) 123-45-67"
            maxLength={10}
            className="w-full card-premium bg-legend-black border border-legend-wenge pl-12 pr-4 py-3 text-legend-light rounded outline-none focus:border-legend-gold"
          />
        </div>
        <button
          type="submit"
          disabled={manualPhone.length < 10}
          className={`w-full card-premium border transition-all ${
            manualPhone.length >= 10 
              ? 'border-legend-gold text-legend-gold hover:bg-legend-gold/10' 
              : 'border-legend-wenge/30 text-legend-light/30 cursor-not-allowed'
          }`}
        >
          Подтвердить номер
        </button>
      </form>

      {/* Примеры форматов */}
      <p className="text-xs text-legend-light/40 text-center">
        Примеры: +7 900 123-45-67, 8 (900) 1234567
      </p>
    </div>
  )
}
