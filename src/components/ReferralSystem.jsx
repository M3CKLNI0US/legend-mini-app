import React, { useState, useEffect } from 'react'
import { useTelegramApp } from '../hooks/useTelegramApp'
import { subscribeToUser, getUserFromFirebase, saveUserToFirebase } from '../firebase'

export default function ReferralSystem({ referralCount, setReferralCount }) {
  const { shareLink, showAlert, user, getSavedPhone } = useTelegramApp()
  const [copied, setCopied] = useState(false)
  const [referredUsers, setReferredUsers] = useState([])
  const [hasPhone, setHasPhone] = useState(false)
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [pendingReferrerId, setPendingReferrerId] = useState(null)
  const [firebaseReferralCount, setFirebaseReferralCount] = useState(0)

  // Синхронизация с Firebase
  useEffect(() => {
    if (user?.id) {
      // Подписываемся на изменения пользователя
      const unsubscribe = subscribeToUser(user.id, (userData) => {
        if (userData) {
          setFirebaseReferralCount(userData.referrals || 0)
          // Обновляем referralCount если передан setReferralCount
          if (setReferralCount) {
            setReferralCount(userData.referrals || 0)
          }
        }
      })
      
      // Проверяем номер телефона
      const phone = getSavedPhone()
      setHasPhone(!!phone)
      
      return () => unsubscribe()
    }
  }, [user?.id, setReferralCount, getSavedPhone])

  // Обработка входящего реферального кода
  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (tg?.initDataUnsafe?.start_param) {
      const startParam = tg.initDataUnsafe.start_param
      if (startParam.startsWith('ref_')) {
        const referrerId = startParam.replace('ref_', '')
        // Проверяем есть ли у приглашенного номер телефона
        const phone = getSavedPhone()
        if (!phone) {
          // Если нет номера - показываем модалку с просьбой подтвердить
          setPendingReferrerId(referrerId)
          setShowPhoneModal(true)
          localStorage.setItem('legend_pending_referrer', referrerId)
        } else {
          // Если номер есть - начисляем бонус пригласившему
          processReferralBonus(referrerId)
        }
      }
    }
  }, [getSavedPhone])

  // Обработка бонуса реферала
  const processReferralBonus = (referrerId) => {
    const referrerPhone = localStorage.getItem('legend_phone_' + referrerId)
    if (referrerPhone) {
      // У пригласившего есть номер - начисляем бонус
      localStorage.setItem('legend_referrer_id', referrerId)
      console.log('Referral bonus approved for:', referrerId)
      showAlert('✓ Реферальный бонус активирован!')
    } else {
      console.log('Referrer has no phone - bonus pending')
    }
  }

  // Обработка подтверждения номера приглашенным
  const handlePhoneVerified = () => {
    const pendingReferrer = localStorage.getItem('legend_pending_referrer')
    if (pendingReferrer) {
      processReferralBonus(pendingReferrer)
      localStorage.removeItem('legend_pending_referrer')
      setShowPhoneModal(false)
      setHasPhone(true)
    }
  }

  const BOT_USERNAME = 'LegendaBarber_Bot'
  const referralLink = `https://t.me/${BOT_USERNAME}?start=ref_${user?.id || '123456789'}`

  const handleInvite = () => {
    if (!hasPhone) {
      showAlert('❌ Требуется подтвердить номер телефона перед приглашением друзей')
      return
    }
    const text = `🎭 Присоединяйся к ЛЕГЕНДЕ — закрытому мужскому клубу премиум класса.\n\nПолучи приватную ссылку и стань членом клуба прямо в Telegram!\n\n💎 Привилегии: персональный мастер, цифровой паспорт стиля, рефпрограмма.`
    shareLink(referralLink, text)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    showAlert('✓ Ссылка скопирована')
    setTimeout(() => setCopied(false), 2000)
  }

  // Демо: добавить тестового реферала
  const addDemoReferral = () => {
    const newReferral = {
      id: Date.now(),
      name: `Реферал #${referralCount + 1}`,
      date: new Date().toLocaleDateString('ru-RU'),
      bonus: 100
    }
    const updated = [...referredUsers, newReferral]
    setReferredUsers(updated)
    setReferralCount(prev => prev + 1)
    localStorage.setItem('legend_referrals', JSON.stringify(updated))
    localStorage.setItem('legend_referral_count', String(referralCount + 1))
    showAlert(`✓ Добавлен реферал! Бонус: +100 ₽`)
  }

  return (
    <div className="p-4 pb-32 space-y-6">
      {/* Referral Link Card */}
      <div className="card-premium">
        <p className="text-legend-gold text-sm font-bold uppercase mb-3">Ваша ссылка приглашения</p>
        <div className="bg-legend-black border border-legend-wenge rounded p-3 mb-3 font-mono text-xs text-legend-light/60 break-all">
          {referralLink}
        </div>
        <button
          onClick={handleCopyLink}
          className={`w-full btn-gold-filled ${copied ? 'opacity-60' : ''}`}
        >
          {copied ? '✓ Скопировано' : 'Копировать ссылку'}
        </button>
      </div>

      {/* Phone Verification Warning */}
      {!hasPhone && (
        <div className="card-premium bg-red-900/20 border-red-900/50">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-sm text-red-400 font-bold">Требуется подтверждение номера</p>
              <p className="text-xs text-legend-light/60">Для приглашения друзей подтвердите российский номер в Настройках</p>
            </div>
          </div>
        </div>
      )}

      {/* Invite Button */}
      <button
        onClick={handleInvite}
        disabled={!hasPhone}
        className={`w-full card-premium bg-gradient-to-r from-legend-brass/20 to-legend-gold/20 border border-legend-gold pressable hover:shadow-[0_0_30px_rgba(198,169,107,0.4)] ${!hasPhone ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <p className="text-center text-lg font-serif font-bold text-legend-gold">
          {hasPhone ? 'Пригласить друга' : 'Подтвердите номер для приглашений'}
        </p>
      </button>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card-premium text-center">
          <p className="text-legend-gold text-3xl font-serif font-bold">{referralCount}</p>
          <p className="text-xs text-legend-light/60">Приглашено</p>
        </div>
        <div className="card-premium text-center">
          <p className="text-legend-gold text-3xl font-serif font-bold">{Math.min(referralCount * 100, 500)}</p>
          <p className="text-xs text-legend-light/60">Рублей бонус</p>
        </div>
        <div className="card-premium text-center">
          <p className="text-legend-gold text-3xl font-serif font-bold">
            {referralCount >= 30 ? '◆◆◆' : referralCount >= 15 ? '◆◆' : referralCount >= 5 ? '◇' : '◆'}
          </p>
          <p className="text-xs text-legend-light/60">Уровень</p>
        </div>
      </div>

      {/* Reward Tiers */}
      <div className="space-y-3">
        <p className="text-legend-gold text-sm font-bold uppercase">Награды за приглашения</p>

        {[
          { count: 1, reward: '100 ₽', title: 'Первый реферал' },
          { count: 5, reward: '+15% бонус', title: 'Хранитель Клуба' },
          { count: 15, reward: '+20% бонус', title: 'Старейшина' },
          { count: 30, reward: 'VIP статус', title: 'Легенда' },
        ].map((tier, idx) => (
          <div
            key={idx}
            className={`card-premium ${referralCount >= tier.count ? 'border-legend-gold' : 'border-legend-wenge/50'}`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className={`text-sm font-bold ${referralCount >= tier.count ? 'text-legend-gold' : 'text-legend-light/60'}`}>
                  {tier.title}
                </p>
                <p className="text-xs text-legend-light/40">{tier.count}+ рефералов</p>
              </div>
              <p className={`text-lg font-serif font-bold ${referralCount >= tier.count ? 'text-legend-gold' : 'text-legend-light/30'}`}>
                {tier.reward}
              </p>
            </div>
            {referralCount >= tier.count && (
              <p className="text-xs text-legend-gold mt-2">✓ Разблокировано</p>
            )}
          </div>
        ))}
      </div>

      {/* Referral List */}
      {referredUsers.length > 0 && (
        <div className="space-y-3">
          <p className="text-legend-gold text-sm font-bold uppercase">Ваши рефералы</p>
          {referredUsers.slice(-5).reverse().map((ref) => (
            <div key={ref.id} className="card-premium flex justify-between items-center">
              <div>
                <p className="text-sm text-legend-light font-medium">{ref.name}</p>
                <p className="text-xs text-legend-light/40">{ref.date}</p>
              </div>
              <p className="text-legend-gold font-bold">+{ref.bonus} ₽</p>
            </div>
          ))}
        </div>
      )}

      {/* Demo Button - для тестирования */}
      <button
        onClick={addDemoReferral}
        className="w-full card-premium bg-legend-deep border border-dashed border-legend-brass/50 text-legend-brass text-sm py-3 hover:border-legend-gold hover:text-legend-gold transition-colors"
      >
        [ТЕСТ] Симулировать нового реферала
      </button>

      {/* Info */}
      <div className="card-premium bg-legend-wenge/20 border-legend-brass/50">
        <p className="text-xs text-legend-light/70">
          Каждый приглашённый друг получает скидку 10% на первую услугу. Ты получаешь бонусы и повышаешь свой уровень в клубе. Win-win! 🎭
        </p>
      </div>

      {/* Phone Verification Modal for Invited Users */}
      {showPhoneModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="card-premium max-w-sm w-full border-legend-gold">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-legend-gold/20 flex items-center justify-center text-3xl">
                🎁
              </div>
              <p className="text-lg font-serif font-bold text-legend-gold mb-2">Реферальный бонус!</p>
              <p className="text-sm text-legend-light/80">
                Вы пришли по приглашению друга. Для активации бонуса (+100 ₽ другу) подтвердите российский номер телефона.
              </p>
            </div>

            <div className="space-y-3">
              <a 
                href="#/settings"
                onClick={(e) => {
                  e.preventDefault()
                  setShowPhoneModal(false)
                  // Перенаправляем на страницу настроек
                  window.location.hash = 'settings'
                }}
                className="block w-full card-premium bg-gradient-to-r from-legend-brass/20 to-legend-gold/20 border border-legend-gold text-center py-3"
              >
                <span className="text-legend-gold font-bold">Подтвердить номер →</span>
              </a>
              
              <button
                onClick={() => setShowPhoneModal(false)}
                className="w-full text-xs text-legend-light/40 hover:text-legend-light py-2"
              >
                Пропустить (бонус не будет начислен)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
