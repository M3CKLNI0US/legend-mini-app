import React, { useState, useEffect } from 'react'
import { useTelegramApp } from '../hooks/useTelegramApp'
import { getUserFromFirebase } from '../firebase'
import PhoneVerification from './PhoneVerification'

export default function Settings({ user }) {
  const { showAlert, webApp } = useTelegramApp()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [smsEnabled, setSmsEnabled] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [userPhone, setUserPhone] = useState(null)
  const [loading, setLoading] = useState(true)

  // Проверка статуса верификации телефона
  useEffect(() => {
    const checkPhoneStatus = async () => {
      if (user?.id) {
        const userData = await getUserFromFirebase(user.id)
        if (userData) {
          setPhoneVerified(userData.phoneVerified || false)
          setUserPhone(userData.phone || null)
        }
      }
      setLoading(false)
    }
    checkPhoneStatus()
  }, [user])

  const handleToggle = (state, setState, label) => {
    setState(!state)
    showAlert(`${label}: ${!state ? 'Включены' : 'Отключены'}`)
  }

  const handleLogout = () => {
    showAlert('Вышли из аккаунта')
    if (webApp) {
      webApp.close()
    }
  }

  const handleDeleteAccount = () => {
    showAlert('⚠️ Аккаунт удалён. До свидания!')
    if (webApp) {
      webApp.close()
    }
  }

  const handlePhoneVerified = () => {
    setPhoneVerified(true)
    showAlert('✓ Номер подтвержден! Теперь вы можете приглашать друзей.')
  }

  return (
    <div className="animate-fade-in space-y-6 p-4 pb-36">
      {/* Header */}
      <div className="card-premium border-legend-gold/20 bg-gradient-to-r from-legend-brass/10 to-legend-gold/10">
        <p className="text-center font-serif text-lg font-bold text-legend-gold-bright">Профиль и настройки</p>
      </div>

      {/* User Info */}
      <div className="card-premium space-y-3">
        <p className="section-heading mb-4">Информация профиля</p>

        <div className="flex items-center justify-between border-b border-legend-wenge/60 py-2.5">
          <span className="text-sm text-legend-light/55">Telegram ID</span>
          <span className="font-mono text-sm font-medium text-legend-gold-bright">{user?.id || '—'}</span>
        </div>

        <div className="flex items-center justify-between border-b border-legend-wenge/60 py-2.5">
          <span className="text-sm text-legend-light/55">Имя</span>
          <span className="text-sm text-legend-light">{user?.first_name || '—'}</span>
        </div>

        <div className="flex items-center justify-between border-b border-legend-wenge/60 py-2.5">
          <span className="text-sm text-legend-light/55">Юзернейм</span>
          <span className="text-sm text-legend-light">@{user?.username || 'нет'}</span>
        </div>

        <div className="flex items-center justify-between py-2.5">
          <span className="text-sm text-legend-light/55">Дата регистрации</span>
          <span className="text-sm text-legend-gold-bright">15 января 2024</span>
        </div>
      </div>

      {/* Phone Verification - показываем только если телефон не подтвержден */}
      {!loading && !phoneVerified && (
        <PhoneVerification onVerified={handlePhoneVerified} />
      )}

      {/* Phone Verified Status - показываем если телефон подтвержден */}
      {phoneVerified && (
        <div className="card-premium bg-gradient-to-br from-green-900/30 to-legend-gold/20 border-green-500/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-xl">
              ✓
            </div>
            <div>
              <p className="text-sm text-green-400 font-bold">Телефон подтвержден</p>
              <p className="text-xs text-legend-light/60">{userPhone || 'Номер сохранен'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="card-premium space-y-3">
        <p className="section-heading mb-4">Уведомления</p>

        <button
          onClick={() => handleToggle(notificationsEnabled, setNotificationsEnabled, 'Уведомления в Telegram')}
          className="w-full flex justify-between items-center py-3 border-b border-legend-wenge/30 hover:bg-legend-gold/5 rounded px-2 transition-all"
        >
          <span className="text-legend-light">Сообщения</span>
          <span className={`text-xl ${notificationsEnabled ? 'text-legend-gold' : 'text-legend-light/30'}`}>
            {notificationsEnabled ? '✓' : '—'}
          </span>
        </button>

        <button
          onClick={() => handleToggle(smsEnabled, setSmsEnabled, 'SMS уведомления')}
          className="w-full flex justify-between items-center py-3 hover:bg-legend-gold/5 rounded px-2 transition-all"
        >
          <span className="text-legend-light">SMS о записях</span>
          <span className={`text-xl ${smsEnabled ? 'text-legend-gold' : 'text-legend-light/30'}`}>
            {smsEnabled ? '✓' : '—'}
          </span>
        </button>
      </div>

      {/* Preferences */}
      <div className="card-premium space-y-3">
        <p className="section-heading mb-4">Предпочтения</p>

        <button className="w-full flex justify-between items-center py-3 border-b border-legend-wenge/30 hover:bg-legend-gold/5 rounded px-2 transition-all">
          <span className="text-legend-light">Тема приложения</span>
          <span className="text-legend-light/60 text-sm">Авто</span>
        </button>

        <button className="w-full flex justify-between items-center py-3 border-b border-legend-wenge/30 hover:bg-legend-gold/5 rounded px-2 transition-all">
          <span className="text-legend-light">Язык</span>
          <span className="text-legend-light/60 text-sm">Русский</span>
        </button>

        <button className="w-full flex justify-between items-center py-3 hover:bg-legend-gold/5 rounded px-2 transition-all">
          <span className="text-legend-light">О приложении</span>
          <span className="text-legend-light/60 text-sm">v1.0.0</span>
        </button>
      </div>

      {/* About */}
      <div className="card-premium bg-legend-wenge/20 border-legend-brass/50 space-y-2">
        <p className="text-xs text-legend-light/70">
          <strong>ЛЕГЕНДА</strong> — премиальный мужской клуб-барбершоп. Версия 1.0.0
        </p>
        <p className="text-xs text-legend-light/60">
          © 2024 ЛЕГЕНДА. Все права защищены.
        </p>
      </div>

      {/* Danger Zone */}
      <div className="space-y-2">
        <button
          onClick={handleLogout}
          className="w-full card-premium border-legend-brass/30 text-legend-brass hover:bg-legend-brass/10 pressable transition-all"
        >
          <p className="text-center font-semibold">Выйти из аккаунта</p>
        </button>

        <button
          onClick={handleDeleteAccount}
          className="w-full card-premium border-red-900/50 text-red-600 hover:bg-red-900/10 pressable transition-all"
        >
          <p className="text-center font-semibold">Удалить аккаунт</p>
        </button>
      </div>

      {/* Support */}
      <div className="text-center text-xs text-legend-light/40 space-y-1">
        <p>Вопросы? Свяжись с нами</p>
        <a href="https://t.me/legend_barbershop_support" className="text-legend-gold hover:underline">
          @legend_barbershop_support
        </a>
      </div>
    </div>
  )
}
