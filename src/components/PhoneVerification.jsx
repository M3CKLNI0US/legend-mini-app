import React, { useState, useEffect } from 'react'
import { useTelegramApp } from '../hooks/useTelegramApp'
import { savePhoneToFirebase, getPhoneFromFirebase, clearPhoneVerificationInFirebase } from '../firebase'
import { claimPendingReferral } from '../utils/referralRewards'

export default function PhoneVerification({ onVerified }) {
  const { requestPhoneNumber, showAlert, user, validateRussianPhone } = useTelegramApp()
  const [savedPhone, setSavedPhone] = useState(null)
  const [isVerified, setIsVerified] = useState(false)
  const [loading, setLoading] = useState(true)
  const [manualPhone, setManualPhone] = useState('')
  const [manualBusy, setManualBusy] = useState(false)

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
    }
  }

  const handleManualSubmit = async (e) => {
    e.preventDefault()
    const { valid, normalized, error } = validateRussianPhone(manualPhone)
    if (!valid) {
      showAlert(error || 'Неверный номер')
      return
    }
    setManualBusy(true)
    try {
      await persistPhone(normalized)
      setManualPhone('')
    } finally {
      setManualBusy(false)
    }
  }

  const handleClearPhone = async () => {
    if (!user?.id) return
    const ok = await clearPhoneVerificationInFirebase(user.id)
    if (ok) {
      localStorage.removeItem('legend_phone')
      setSavedPhone(null)
      setIsVerified(false)
      showAlert('Номер сброен. Подтвердите снова для записи и рефералов.')
      if (onVerified) {
        /* родитель может обновить флаги */
      }
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
              <p className="text-sm font-bold text-green-400">Номер подтверждён</p>
              <p className="font-mono text-sm text-legend-gold-bright">{savedPhone}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClearPhone}
            className="shrink-0 rounded-lg border border-legend-wenge px-3 py-1.5 text-xs text-legend-light/60 transition-colors hover:border-red-500/50 hover:text-red-400"
          >
            Сбросить
          </button>
        </div>
        <p className="mt-3 text-center text-xs text-green-400/80">
          Можно записываться к мастеру и участвовать в реферальной программе.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="card-premium border-legend-brass/50 bg-legend-wenge/20">
        <p className="mb-2 text-sm font-bold text-legend-gold">Подтверждение номера</p>
        <p className="text-xs text-legend-light/70">
          Нужен российский номер (+7) для записи и реферальной программы. Сначала попробуйте кнопку Telegram — если не
          сработает, введите номер вручную.
        </p>
      </div>

      <button
        type="button"
        onClick={handleRequestPhone}
        className="card-premium pressable w-full border border-legend-gold bg-gradient-to-r from-legend-brass/20 to-legend-gold/20 hover:shadow-[0_0_30px_rgba(198,169,107,0.35)]"
      >
        <div className="flex items-center justify-center gap-2">
          <span className="text-xl">📱</span>
          <p className="text-center font-serif text-lg font-bold text-legend-gold">Поделиться номером через Telegram</p>
        </div>
        <p className="mt-1 text-center text-xs text-legend-light/60">Откроется системный запрос контакта</p>
      </button>

      <form onSubmit={handleManualSubmit} className="card-premium space-y-3 border-legend-wenge/60">
        <p className="text-xs font-semibold uppercase tracking-wide text-legend-light/50">Или введите вручную</p>
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+7 900 123-45-67"
          value={manualPhone}
          onChange={(ev) => setManualPhone(ev.target.value)}
          className="w-full rounded-xl border border-legend-wenge bg-legend-black/50 px-3 py-3 font-mono text-sm text-legend-light outline-none focus:border-legend-gold"
        />
        <button
          type="submit"
          disabled={manualBusy}
          className="btn-gold-filled w-full disabled:opacity-50"
        >
          {manualBusy ? 'Сохранение…' : 'Сохранить номер'}
        </button>
      </form>

      <p className="text-center text-xs text-legend-light/40">Принимаются только номера России (+7).</p>
    </div>
  )
}
