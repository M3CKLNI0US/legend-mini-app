import React, { useState, useEffect, useCallback } from 'react'
import { useTelegramApp } from '../hooks/useTelegramApp'
import { subscribeToUser, updateUserInFirebase } from '../firebase'
import PhoneVerification from './PhoneVerification'
import { usePreferences } from '../context/PreferencesContext'

function formatJoined(iso, lang) {
  if (!iso) return '—'
  try {
    const loc = lang === 'zh' ? 'zh-CN' : lang === 'en' ? 'en-US' : 'ru-RU'
    return new Date(iso).toLocaleDateString(loc, { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return '—'
  }
}

export default function Settings({ user }) {
  const { showAlert, close } = useTelegramApp()
  const { language, themePreference, t } = usePreferences()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [smsEnabled, setSmsEnabled] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [userPhone, setUserPhone] = useState(null)
  const [loading, setLoading] = useState(true)
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
        setJoinedAt(null)
        setLoading(false)
        return
      }
      setNotificationsEnabled(data.notificationsEnabled !== false)
      setSmsEnabled(!!data.smsNotifications)
      setPhoneVerified(!!data.phoneVerified)
      setUserPhone(data.phone || null)
      setJoinedAt(data.joinedAt || null)
      setLoading(false)
    })
    return () => unsub()
  }, [user?.id])

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
    showAlert(next ? `✓ ${t('notif_tg')}` : `— ${t('notif_tg')}`)
  }

  const toggleSms = async () => {
    const next = !smsEnabled
    setSmsEnabled(next)
    await persist({ smsNotifications: next })
    showAlert(next ? `✓ ${t('sms_booking')}` : `— ${t('sms_booking')}`)
  }

  const cycleTheme = async () => {
    const order = ['auto', 'dark', 'light']
    const idx = order.indexOf(themePreference)
    const next = order[(idx + 1) % order.length]
    await persist({ themePreference: next })
    const label = next === 'auto' ? t('theme_auto') : next === 'dark' ? t('theme_dark') : t('theme_light')
    showAlert(`${t('theme')}: ${label}`)
  }

  const cycleLanguage = async () => {
    const order = ['ru', 'en', 'zh']
    const idx = order.indexOf(language)
    const next = order[(idx + 1) % order.length]
    await persist({ language: next })
    const label = next === 'ru' ? t('lang_ru') : next === 'en' ? t('lang_en') : t('lang_zh')
    showAlert(`${t('language')}: ${label}`)
  }

  const themeLabel =
    themePreference === 'dark' ? t('theme_dark') : themePreference === 'light' ? t('theme_light') : t('theme_auto')
  const languageLabel =
    language === 'en' ? t('lang_en') : language === 'zh' ? t('lang_zh') : t('lang_ru')

  const handleLogout = () => {
    showAlert(t('close_app'))
    close()
  }

  const handleDeleteAccount = () => {
    showAlert(t('delete_hint'))
  }

  const handlePhoneVerified = () => {
    setPhoneVerified(true)
  }

  return (
    <div className="animate-fade-in space-y-6 p-4 pb-36">
      <div className="card-premium border-legend-gold/20 bg-gradient-to-r from-legend-brass/10 to-legend-gold/10">
        <p className="text-center font-serif text-lg font-bold text-legend-gold-bright">{t('settings_title')}</p>
      </div>

      <div className="card-premium space-y-3">
        <p className="section-heading mb-4">{t('section_profile')}</p>

        <div className="flex items-center justify-between border-b border-legend-wenge/60 py-2.5">
          <span className="text-sm text-legend-light/55">{t('telegram_id')}</span>
          <span className="font-mono text-sm font-medium text-legend-gold-bright">{user?.id || '—'}</span>
        </div>

        <div className="flex items-center justify-between border-b border-legend-wenge/60 py-2.5">
          <span className="text-sm text-legend-light/55">{t('first_name')}</span>
          <span className="text-sm text-legend-light">{user?.first_name || '—'}</span>
        </div>

        <div className="flex items-center justify-between border-b border-legend-wenge/60 py-2.5">
          <span className="text-sm text-legend-light/55">{t('username')}</span>
          <span className="text-sm text-legend-light">@{user?.username || '—'}</span>
        </div>

        <div className="flex items-center justify-between py-2.5">
          <span className="text-sm text-legend-light/55">{t('joined')}</span>
          <span className="text-sm text-legend-gold-bright">{formatJoined(joinedAt, language)}</span>
        </div>
      </div>

      {!loading && !phoneVerified && <PhoneVerification onVerified={handlePhoneVerified} />}

      {phoneVerified && (
        <div className="card-premium border-green-500/50 bg-gradient-to-br from-green-900/30 to-legend-gold/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20 text-xl">✓</div>
            <div>
              <p className="text-sm font-bold text-green-400">{t('phone_ok')}</p>
              <p className="text-xs text-legend-light/60">{userPhone || t('phone_in_db')}</p>
            </div>
          </div>
        </div>
      )}

      <div className="card-premium space-y-3">
        <p className="section-heading mb-4">{t('section_notifications')}</p>

        <button
          type="button"
          onClick={toggleNotifications}
          className="flex w-full items-center justify-between rounded-lg border-b border-legend-wenge/30 px-2 py-3 transition-all hover:bg-legend-gold/5"
        >
          <span className="text-legend-light">{t('notif_tg')}</span>
          <span className={`text-xl ${notificationsEnabled ? 'text-legend-gold' : 'text-legend-light/30'}`}>
            {notificationsEnabled ? '✓' : '—'}
          </span>
        </button>

        <button
          type="button"
          onClick={toggleSms}
          className="flex w-full items-center justify-between rounded-lg px-2 py-3 transition-all hover:bg-legend-gold/5"
        >
          <span className="text-legend-light">{t('sms_booking')}</span>
          <span className={`text-xl ${smsEnabled ? 'text-legend-gold' : 'text-legend-light/30'}`}>
            {smsEnabled ? '✓' : '—'}
          </span>
        </button>
      </div>

      <div className="card-premium space-y-3">
        <p className="section-heading mb-4">{t('section_preferences')}</p>

        <button
          type="button"
          onClick={cycleTheme}
          className="flex w-full items-center justify-between border-b border-legend-wenge/30 py-3 hover:bg-legend-gold/5"
        >
          <span className="text-legend-light">{t('theme')}</span>
          <span className="text-sm text-legend-light/60">{themeLabel}</span>
        </button>

        <button
          type="button"
          onClick={cycleLanguage}
          className="flex w-full items-center justify-between border-b border-legend-wenge/30 py-3 hover:bg-legend-gold/5"
        >
          <span className="text-legend-light">{t('language')}</span>
          <span className="text-sm text-legend-light/60">{languageLabel}</span>
        </button>

        <div className="flex w-full items-center justify-between py-3">
          <span className="text-legend-light">{t('about_app')}</span>
          <span className="text-sm text-legend-light/60">v1.2.0</span>
        </div>
      </div>

      <div className="card-premium space-y-2 border-legend-brass/50 bg-legend-wenge/20">
        <p className="text-xs text-legend-light/70">
          <strong>{t('brand_title')}</strong> — {t('about_tagline')}
        </p>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={handleLogout}
          className="card-premium pressable w-full border-legend-brass/30 text-legend-brass transition-all hover:bg-legend-brass/10"
        >
          <p className="text-center font-semibold">{t('close_app')}</p>
        </button>

        <button
          type="button"
          onClick={handleDeleteAccount}
          className="card-premium pressable w-full border-red-900/50 text-red-600 transition-all hover:bg-red-900/10"
        >
          <p className="text-center font-semibold">{t('delete_account')}</p>
        </button>
      </div>

      <div className="space-y-1 text-center text-xs text-legend-light/40">
        <p>{t('support_q')}</p>
        <a href="https://t.me/legend_barbershop_support" className="text-legend-gold hover:underline">
          @legend_barbershop_support
        </a>
      </div>
    </div>
  )
}
