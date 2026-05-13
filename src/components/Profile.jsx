import React, { useState, useEffect } from 'react'
import { subscribeToUser } from '../firebase'

const levelTiers = [
  {
    id: 'newbie',
    name: 'Новобранец',
    icon: '◆',
    bonus: '+10%',
    description: 'скидка на услуги',
    requiredReferrals: 0,
    perks: ['Персональный мастер', 'Кофе/чай', 'Приоритет в записи']
  },
  {
    id: 'guardian',
    name: 'Хранитель Клуба',
    icon: '◇',
    bonus: '+15%',
    description: 'скидка + VIP статус',
    requiredReferrals: 5,
    perks: ['VIP статус', 'Подарочный сертификат', 'Премиум средства', 'Свободная запись']
  },
  {
    id: 'elder',
    name: 'Старейшина',
    icon: '◆◆',
    bonus: '+20%',
    description: 'скидка + привилегии',
    requiredReferrals: 15,
    perks: ['Персональные события', 'Консультация эксперта', 'Premium подарки', 'Приватные сеансы']
  },
  {
    id: 'legend',
    name: 'Легенда',
    icon: '◆◆◆',
    bonus: '∞',
    description: 'закрытый клуб',
    requiredReferrals: 30,
    perks: ['Лайфтайм статус', 'Годовой паспорт', 'Exclusive события', 'Статус в сообществе']
  }
]

export default function Profile({ user, userLevel: initialLevel, referralCount: initialReferrals }) {
  const [showDetails, setShowDetails] = useState(null)
  const [userLevel, setUserLevel] = useState(initialLevel || 'newbie')
  const [referralCount, setReferralCount] = useState(initialReferrals || 0)

  // Подписка на изменения пользователя в Firebase
  useEffect(() => {
    if (user?.id) {
      const unsubscribe = subscribeToUser(user.id, (userData) => {
        if (userData) {
          setUserLevel(userData.level || 'newbie')
          setReferralCount(userData.referrals || 0)
        }
      })
      return () => unsubscribe()
    }
  }, [user?.id])

  const currentLevelIndex = levelTiers.findIndex(t => t.id === userLevel)
  const currentLevelTier = levelTiers[currentLevelIndex]

  // Генерируй уникальный номер карты (0000-9999)
  const [cardNumber, setCardNumber] = useState('0000')

  useEffect(() => {
    if (user?.id) {
      // Используем последние 4 цифры ID, но если больше 9999 - берем остаток от деления
      const last4 = parseInt(String(user.id).slice(-4)) % 10000
      setCardNumber(String(last4).padStart(4, '0'))
    }
  }, [user?.id])

  return (
    <div className="p-4 pb-36 space-y-6 animate-fade-in">
      {/* Main Card */}
      <div className="card-premium glow-element relative min-h-[13.5rem] overflow-hidden rounded-3xl border-legend-gold/25">
        <div className="pointer-events-none absolute inset-0 bg-legend-card-shine opacity-90" />
        <div className="pointer-events-none absolute -right-20 -top-24 h-48 w-48 rounded-full bg-legend-gold/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-legend-brass/10 blur-2xl" />

        <div className="relative z-10 flex h-full min-h-[13.5rem] flex-col justify-between">
          <div>
            <div className="mb-8 flex items-start justify-between">
              <div className="rounded-lg border border-legend-gold/20 bg-legend-black/40 px-2 py-1 font-serif text-xl text-legend-gold-bright">
                ◊
              </div>
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.4em] text-legend-light/35">Легенда</p>
            </div>

            <div>
              <p className="mb-1.5 text-[0.65rem] font-medium uppercase tracking-[0.25em] text-legend-light/45">
                Номер карты
              </p>
              <p className="font-mono text-2xl font-semibold tracking-[0.35em] text-legend-light [font-feature-settings:'tnum']">
                {cardNumber}
              </p>
            </div>
          </div>

          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="mb-1 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-legend-light/45">Статус</p>
              <p className="font-serif text-lg font-bold text-legend-gold-bright">{currentLevelTier.name}</p>
            </div>
            <p className="shrink-0 text-3xl leading-none text-legend-gold/90">{currentLevelTier.icon}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-premium text-center">
          <p className="font-serif text-3xl font-bold tabular-nums text-legend-gold-bright">{referralCount}</p>
          <p className="mt-1 text-[0.7rem] font-medium uppercase tracking-wide text-legend-light/50">Приглашено</p>
        </div>
        <div className="card-premium text-center">
          <p className="font-serif text-3xl font-bold text-legend-gold-bright">{currentLevelTier.bonus}</p>
          <p className="mt-1 text-[0.7rem] font-medium uppercase tracking-wide text-legend-light/50">
            {currentLevelTier.name}
          </p>
        </div>
      </div>

      {/* Progress to Next Level */}
      {currentLevelIndex < levelTiers.length - 1 && (
        <div className="card-premium">
          <p className="section-heading mb-2">
            До {levelTiers[currentLevelIndex + 1].name}
          </p>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-legend-black/80 ring-1 ring-legend-wenge/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-legend-brass via-legend-gold to-legend-gold-bright transition-all duration-500 shadow-[0_0_12px_rgba(198,169,107,0.35)]"
              style={{ width: `${(referralCount / levelTiers[currentLevelIndex + 1].requiredReferrals) * 100}%` }}
            />
          </div>
          <p className="text-xs text-legend-light/60 mt-2">
            {referralCount} / {levelTiers[currentLevelIndex + 1].requiredReferrals} рефералов
          </p>
        </div>
      )}

      {/* Current Level Perks */}
      <div className="card-premium">
        <p className="section-heading mb-3">Привилегии уровня</p>
        <div className="space-y-2">
          {currentLevelTier.perks.map((perk, idx) => (
            <div key={idx} className="flex items-start space-x-2">
              <span className="text-legend-gold text-lg leading-none mt-0.5">•</span>
              <p className="text-sm text-legend-light/80">{perk}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Level Tiers */}
      <div className="space-y-3">
        <p className="section-heading">Уровни клуба</p>
        {levelTiers.map((tier, idx) => (
          <div
            key={tier.id}
            onClick={() => setShowDetails(showDetails === tier.id ? null : tier.id)}
            className="card-premium cursor-pointer pressable"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <p className={`text-lg font-serif ${idx <= currentLevelIndex ? 'text-legend-gold' : 'text-legend-brass'}`}>
                  {tier.icon}
                </p>
                <div>
                  <p className={`text-sm font-bold ${idx <= currentLevelIndex ? 'text-legend-gold' : 'text-legend-light/60'}`}>
                    {tier.name}
                  </p>
                  <p className="text-xs text-legend-light/40">{tier.requiredReferrals}+ рефералов</p>
                </div>
              </div>
              <p className="text-legend-gold text-lg font-serif">{tier.bonus}</p>
            </div>

            {/* Expandable Details */}
            {showDetails === tier.id && (
              <div className="mt-3 pt-3 border-t border-legend-wenge space-y-2 animate-fade-in">
                {tier.perks.map((perk, pidx) => (
                  <p key={pidx} className="text-xs text-legend-light/60">• {perk}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
