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

  // Генерируй уникальный номер карты
  const cardNumber = `${String(user?.id || '0000').slice(-4).padStart(4, '0')}`
  const cardNumberFormatted = `${cardNumber.slice(0, 2)}-${cardNumber.slice(2)}`

  return (
    <div className="p-4 pb-32 space-y-6">
      {/* Main Card */}
      <div className="card-premium glow-element relative overflow-hidden h-48 flex flex-col justify-between">
        {/* Фоновый градиент */}
        <div className="absolute inset-0 bg-gradient-to-br from-legend-gold/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>

        {/* Содержимое карты */}
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div className="text-legend-gold text-2xl font-serif">◊</div>
            <p className="text-xs text-legend-light/40 uppercase tracking-widest">ЛЕГЕНДА</p>
          </div>

          <div>
            <p className="text-legend-light/60 text-xs mb-2">НОМЕР КАРТЫ</p>
            <p className="text-2xl font-serif font-bold tracking-widest">{cardNumberFormatted}</p>
          </div>
        </div>

        {/* Нижняя часть */}
        <div className="relative z-10 flex justify-between items-end">
          <div>
            <p className="text-legend-light/60 text-xs mb-1">СТАТУС</p>
            <p className="text-lg font-serif font-bold text-legend-gold">{currentLevelTier.name}</p>
          </div>
          <p className="text-3xl text-legend-gold">{currentLevelTier.icon}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-premium text-center">
          <p className="text-legend-gold text-2xl font-serif font-bold">{referralCount}</p>
          <p className="text-xs text-legend-light/60">Приглашено</p>
        </div>
        <div className="card-premium text-center">
          <p className="text-legend-gold text-2xl font-serif font-bold">{currentLevelTier.bonus}</p>
          <p className="text-xs text-legend-light/60">Бонус</p>
        </div>
      </div>

      {/* Progress to Next Level */}
      {currentLevelIndex < levelTiers.length - 1 && (
        <div className="card-premium">
          <p className="text-xs text-legend-light/60 uppercase mb-2">До {levelTiers[currentLevelIndex + 1].name}</p>
          <div className="w-full bg-legend-wenge rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-legend-brass to-legend-gold transition-all duration-500"
              style={{ width: `${(referralCount / levelTiers[currentLevelIndex + 1].requiredReferrals) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-legend-light/60 mt-2">
            {referralCount} / {levelTiers[currentLevelIndex + 1].requiredReferrals} рефералов
          </p>
        </div>
      )}

      {/* Current Level Perks */}
      <div className="card-premium">
        <p className="text-legend-gold text-sm font-bold uppercase mb-3">Привилегии уровня</p>
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
        <p className="text-legend-gold text-sm font-bold uppercase">Уровни клуба</p>
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
