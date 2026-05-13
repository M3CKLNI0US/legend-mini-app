import React, { useState, useEffect, useCallback } from 'react'
import { useTelegramApp } from '../hooks/useTelegramApp'
import { subscribeToUser, updateUserInFirebase } from '../firebase'
import PhoneVerification from './PhoneVerification'

function formatJoined(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return '—'
  }
}

const THEMES = [
  { id: 'auto', label: 'Авто' },
  { id: 'dark', label: 'Тёмная' },
  { id: 'light', label: 'Светлая' },
]

export default function Settings({ user }) {
  const { showAlert, webApp, close } = useTelegramApp()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [smsEnabled, setSmsEnabled] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [userPhone, setUserPhone] = useState(null)
  const [loading, setLoading] = useState(true)
  const [themePreference, setThemePreference] = useState('auto')
  const [language, setLanguage] = useState('ru')
  const [joinedAt, setJoinedAt] = useState(null)

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return undefined
    }
    const unsub = subscribeToUser(user.id, (data) => {
      if (!data) {
        setNotificationsEnabled(true)
        setSmsEnabled(false)
        setPhoneVerified(false)
        setUserPhone(null)
        setThemePreference('auto')
        setLanguage('ru')
        setJoinedAt(null)
        setLoading(false)
        return
      }
      setNotificationsEnabled(data.notificationsEnabled !== false)
      setSmsEnabled(!!data.smsNotifications)
      setPhoneVerified(!!data.phoneVerified)
      setUserPhone(data.phone || null)
      setThemePreference(data.themePreference || 'auto')
      setLanguage(data.language || 'ru')
      setJoinedAt(data.joinedAt || null)
      setLoading(false)
    })
    return () => unsub()
  }, [user?.id])

  useEffect(() => {
    const root = document.documentElement
    if (themePreference === 'dark') {
      root.style.colorScheme = 'dark'
    } else if (themePreference === 'light') {
      root.style.colorScheme = 'light'
    } else {
      root.style.colorScheme = webApp?.colorScheme === 'dark' ? 'dark' : 'light'
    }
  }, [themePreference, webApp?.colorScheme])

  const persist = useCallback(
    async (updates) => {
      if (!user?.id) return
      const ok = await updateUserInFirebase(user.id, {
        ...updates,
        settingsUpdatedAt: new Date().toISOString(),
      })
      if (!ok) showAlert('❌ Не удалось сохранить настройки')
    },
    [user?.id, showAlert]
  )

  const toggleNotifications = async () => {
    const next = !notificationsEnabled
    setNotificationsEnabled(next)
    await persist({ notificationsEnabled: next })
    showAlert(next ? 'Уведомления в Telegram включены' : 'Уведомления в Telegram выключены')
  }

  const toggleSms = async () => {
    const next = !smsEnabled
    setSmsEnabled(next)
    await persist({ smsNotifications: next })
    showAlert(next ? 'SMS-напоминания включены' : 'SMS-напоминания выключены')
  }

  const cycleTheme = async () => {
    const order = ['auto', 'dark', 'light']
    const idx = order.indexOf(themePreference)
    const next = order[(idx + 1) % order.length]
    setThemePreference(next)
    await persist({ themePreference: next })
    showAlert(`Тема: ${THEMES.find((t) => t.id === next)?.label || next}`)
  }

  const cycleLanguage = async () => {
    const next = language === 'ru' ? 'en' : 'ru'
    setLanguage(next)
    await persist({ language: next })
    showAlert(next === 'ru' ? 'Язык: Русский' : 'Language: English')
  }

  const handleLogout = () => {
    showAlert('Закрываю мини-приложение')
    close()
  }

  const handleDeleteAccount = () => {
    showAlert('Удаление аккаунта пока только через поддержку @legend_barbershop_support')
  }

  const handlePhoneVerified = () => {
    setPhoneVerified(true)
  }

  return (
    <div className="animate-fade-in space-y-6 p-4 pb-36">
      <div className="card-premium border-legend-gold/20 bg-gradient-to-r from-legend-brass/10 to-legend-gold/10">
        <p className="text-center font-serif text-lg font-bold text-legend-gold-bright">Профиль и настройки</p>
      </div>

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
          <span className="text-sm text-legend-gold-bright">{formatJoined(joinedAt)}</span>
        </div>
      </div>

      {!loading && !phoneVerified && <PhoneVerification onVerified={handlePhoneVerified} />}

      {phoneVerified && (
        <div className="card-premium border-green-500/50 bg-gradient-to-br from-green-900/30 to-legend-gold/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20 text-xl">✓</div>
            <div>
              <p className="text-sm font-bold text-green-400">Телефон подтверждён</p>
              <p className="text-xs text-legend-light/60">{userPhone || 'Номер в базе'}</p>
            </div>
          </div>
        </div>
      )}

      <div className="card-premium space-y-3">
        <p className="section-heading mb-4">Уведомления</p>

        <button
          type="button"
          onClick={toggleNotifications}
          className="flex w-full items-center justify-between rounded-lg border-b border-legend-wenge/30 px-2 py-3 transition-all hover:bg-legend-gold/5"
        >
          <span className="text-legend-light">Сообщения от клуба в Telegram</span>
          <span className={`text-xl ${notificationsEnabled ? 'text-legend-gold' : 'text-legend-light/30'}`}>
            {notificationsEnabled ? '✓' : '—'}
          </span>
        </button>

        <button
          type="button"
          onClick={toggleSms}
          className="flex w-full items-center justify-between rounded-lg px-2 py-3 transition-all hover:bg-legend-gold/5"
        >
          <span className="text-legend-light">SMS о записях</span>
          <span className={`text-xl ${smsEnabled ? 'text-legend-gold' : 'text-legend-light/30'}`}>
            {smsEnabled ? '✓' : '—'}
          </span>
        </button>
      </div>

      <div className="card-premium space-y-3">
        <p className="section-heading mb-4">Предпочтения</p>

        <button
          type="button"
          onClick={cycleTheme}
          className="flex w-full items-center justify-between border-b border-legend-wenge/30 py-3 hover:bg-legend-gold/5"
        >
          <span className="text-legend-light">Тема приложения</span>
          <span className="text-sm text-legend-light/60">{THEMES.find((t) => t.id === themePreference)?.label}</span>
        </button>

        <button
          type="button"
          onClick={cycleLanguage}
          className="flex w-full items-center justify-between border-b border-legend-wenge/30 py-3 hover:bg-legend-gold/5"
        >
          <span className="text-legend-light">Язык</span>
          <span className="text-sm text-legend-light/60">{language === 'ru' ? 'Русский' : 'English'}</span>
        </button>

        <div className="flex w-full items-center justify-between py-3">
          <span className="text-legend-light">О приложении</span>
          <span className="text-sm text-legend-light/60">v1.1.0</span>
        </div>
      </div>

      <div className="card-premium space-y-2 border-legend-brass/50 bg-legend-wenge/20">
        <p className="text-xs text-legend-light/70">
          <strong>ЛЕГЕНДА</strong> — премиальный мужской клуб-барбершоп.
        </p>
        <p className="text-xs text-legend-light/60">© ЛЕГЕНДА</p>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={handleLogout}
          className="card-premium pressable w-full border-legend-brass/30 text-legend-brass transition-all hover:bg-legend-brass/10"
        >
          <p className="text-center font-semibold">Закрыть приложение</p>
        </button>

        <button
          type="button"
          onClick={handleDeleteAccount}
          className="card-premium pressable w-full border-red-900/50 text-red-600 transition-all hover:bg-red-900/10"
        >
          <p className="text-center font-semibold">Удалить аккаунт</p>
        </button>
      </div>

      <div className="space-y-1 text-center text-xs text-legend-light/40">
        <p>Вопросы? Напишите нам</p>
        <a href="https://t.me/legend_barbershop_support" className="text-legend-gold hover:underline">
          @legend_barbershop_support
        </a>
      </div>
    </div>
  )
}
