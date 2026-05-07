import React, { useState, useEffect } from 'react'
import { useTelegramApp } from '../hooks/useTelegramApp'
import { savePhoneToFirebase, getPhoneFromFirebase } from '../firebase'

export default function PhoneVerification({ onVerified }) {
  const { requestPhoneNumber, showAlert, user } = useTelegramApp()
  const [savedPhone, setSavedPhone] = useState(null)
  const [isVerified, setIsVerified] = useState(false)
  const [loading, setLoading] = useState(true)

  // Загрузка сохраненного номера из Firebase
  useEffect(() => {
    const loadPhone = async () => {
      if (user?.id) {
        const phone = await getPhoneFromFirebase(user.id)
        if (phone) {
          setSavedPhone(phone)
          setIsVerified(true)
          localStorage.setItem('legend_phone', phone) // fallback
        }
      }
      setLoading(false)
    }
    loadPhone()
  }, [user])

  // Сохранение номера в Firebase
  const savePhoneWithUserId = async (phone) => {
    // Сохраняем в Firebase
    if (user?.id) {
      await savePhoneToFirebase(user.id, phone)
    }
    localStorage.setItem('legend_phone', phone) // fallback
    
    // Проверяем есть ли ожидающий реферальный бонус
    const pendingReferrer = localStorage.getItem('legend_pending_referrer')
    if (pendingReferrer) {
      // Пригласивший получит бонус
      showAlert(`🎉 Ты молодец! Номер подтвержден! Бонус начислен пригласившему.`)
      localStorage.removeItem('legend_pending_referrer')
      // Вызываем callback если есть
      if (onVerified) onVerified()
    } else {
      showAlert(`🎉 Ты молодец! Номер успешно подтвержден!\n\nТеперь ты можешь записываться к мастеру и участвовать в реферальной программе.`)
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
  const handleClearPhone = async () => {
    localStorage.removeItem('legend_phone')
    // В Firebase номер не удаляем, только помечаем как неактивный
    setSavedPhone(null)
    setIsVerified(false)
    showAlert('Номер удален')
  }

  if (isVerified && savedPhone) {
    return (
      <div className="card-premium bg-gradient-to-br from-green-900/30 to-legend-gold/20 border-green-500/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-2xl animate-pulse">
              🎉
            </div>
            <div>
              <p className="text-sm text-green-400 font-bold">Ты молодец!</p>
              <p className="text-sm text-legend-gold font-medium">Номер подтвержден</p>
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
        <p className="text-xs text-green-400/80 mt-3 text-center">
          ✓ Теперь ты можешь записываться к мастеру и приглашать друзей!
        </p>
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
