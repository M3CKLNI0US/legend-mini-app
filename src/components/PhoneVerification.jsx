import React, { useState, useEffect } from 'react'
import { useTelegramApp } from '../hooks/useTelegramApp'
import { savePhoneToFirebase, getPhoneFromFirebase, clearPhoneVerificationInFirebase } from '../firebase'
import { claimPendingReferral } from '../utils/referralRewards'
import { usePreferences } from '../context/PreferencesContext'

export default function PhoneVerification({ onVerified }) {
  const { requestPhoneNumber, showAlert, user } = useTelegramApp()
  const { t } = usePreferences()
  const [savedPhone, setSavedPhone] = useState(null)
  const [isVerified, setIsVerified] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPhone = async () => {
      if (user?.id) {
        const phone = await getPhoneFromFirebase(user.id)
        if (phone) {
          setSavedPhone(phone)
          setIsVerified(true)
          localStorage.setItem('legend_phone', phone)
        }
      }
      setLoading(false)
    }
    loadPhone()
  }, [user])

  const runAfterPhoneSaved = async () => {
    const display = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Участник'
    const refResult = await claimPendingReferral(user.id, display)
    if (refResult.claimed) {
      showAlert('🎉 Номер подтверждён! Реферальный бонус начислен пригласившему.')
    } else if (localStorage.getItem('legend_pending_referrer')) {
      localStorage.removeItem('legend_pending_referrer')
      showAlert('🎉 Номер подтверждён!')
    } else {
      showAlert('🎉 Номер подтверждён! Можно записываться и приглашать друзей.')
    }
    if (onVerified) onVerified()
  }

  const persistPhone = async (phone) => {
    if (!user?.id) return false
    const ok = await savePhoneToFirebase(user.id, phone)
    if (ok) {
      localStorage.setItem('legend_phone', phone)
      setSavedPhone(phone)
      setIsVerified(true)
      await runAfterPhoneSaved()
    } else {
      showAlert('❌ Не удалось сохранить номер в базе. Попробуйте ещё раз.')
    }
    return ok
  }

  const handleRequestPhone = async () => {
    const result = await requestPhoneNumber()
    if (result.success && result.phone) {
      await persistPhone(result.phone)
      return
    }
    if (result.error === 'Not Russian number') {
      showAlert('❌ Принимаются только российские номера (+7)')
    } else if (result.error === 'User declined') {
      showAlert('Вы отказались делиться номером')
    } else if (result.error === 'requestContact not supported') {
      /* уже показали */
    } else if (result.error === 'No phone in response') {
      /* уже показали в хуке */
    }
  }

  const handleClearPhone = async () => {
    if (!user?.id) return
    const ok = await clearPhoneVerificationInFirebase(user.id)
    if (ok) {
      localStorage.removeItem('legend_phone')
      setSavedPhone(null)
      setIsVerified(false)
      showAlert(t('phone_reset_ok'))
    } else {
      showAlert('❌ Не удалось сбросить номер')
    }
  }

  if (!loading && isVerified && savedPhone) {
    return (
      <div className="card-premium border-green-500/50 bg-gradient-to-br from-green-900/30 to-legend-gold/20">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 text-2xl">
              🎉
            </div>
            <div>
              <p className="text-sm font-bold text-green-400">{t('phone_ok')}</p>
              <p className="font-mono text-sm text-legend-gold-bright">{savedPhone}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClearPhone}
            className="shrink-0 rounded-lg border border-legend-wenge px-3 py-1.5 text-xs text-legend-light/60 transition-colors hover:border-red-500/50 hover:text-red-400"
          >
            {t('phone_reset')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="card-premium border-legend-brass/50 bg-legend-wenge/20">
        <p className="mb-2 text-sm font-bold text-legend-gold">{t('phone_title')}</p>
        <p className="text-xs text-legend-light/70">{t('phone_desc')}</p>
      </div>

      <button
        type="button"
        onClick={handleRequestPhone}
        className="card-premium pressable w-full border border-legend-gold bg-gradient-to-r from-legend-brass/20 to-legend-gold/20 hover:shadow-[0_0_30px_rgba(198,169,107,0.35)]"
      >
        <div className="flex items-center justify-center gap-2">
          <span className="text-xl">📱</span>
          <p className="text-center font-serif text-lg font-bold text-legend-gold">{t('phone_btn')}</p>
        </div>
        <p className="mt-1 text-center text-xs text-legend-light/60">{t('phone_hint')}</p>
      </button>

      <p className="text-center text-xs text-legend-light/40">{t('phone_footer')}</p>
    </div>
  )
}
