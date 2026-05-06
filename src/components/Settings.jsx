import React, { useState } from 'react'
import { useTelegramApp } from '../hooks/useTelegramApp'
import PhoneVerification from './PhoneVerification'

export default function Settings({ user }) {
  const { showAlert, webApp } = useTelegramApp()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [smsEnabled, setSmsEnabled] = useState(false)

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

  return (
    <div className="p-4 pb-32 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card-premium bg-gradient-to-r from-legend-brass/20 to-legend-gold/20 border-legend-gold">
        <p className="text-center text-lg font-serif font-bold text-legend-gold">Профиль и настройки</p>
      </div>

      {/* User Info */}
      <div className="card-premium space-y-3">
        <p className="text-legend-gold text-sm font-bold uppercase mb-4">Информация профиля</p>

        <div className="flex justify-between items-center py-2 border-b border-legend-wenge">
          <span className="text-legend-light/60">Telegram ID</span>
          <span className="text-legend-gold font-mono">{user?.id || '—'}</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-legend-wenge">
          <span className="text-legend-light/60">Имя</span>
          <span className="text-legend-light">{user?.first_name || '—'}</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-legend-wenge">
          <span className="text-legend-light/60">Юзернейм</span>
          <span className="text-legend-light">@{user?.username || 'нет'}</span>
        </div>

        <div className="flex justify-between items-center py-2">
          <span className="text-legend-light/60">Дата регистрации</span>
          <span className="text-legend-gold text-sm">15 января 2024</span>
        </div>
      </div>

      {/* Phone Verification */}
      <PhoneVerification onVerified={() => showAlert('✓ Номер подтвержден! Теперь вы можете приглашать друзей.')} />

      {/* Notifications */}
      <div className="card-premium space-y-3">
        <p className="text-legend-gold text-sm font-bold uppercase mb-4">Уведомления</p>

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
        <p className="text-legend-gold text-sm font-bold uppercase mb-4">Предпочтения</p>

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
