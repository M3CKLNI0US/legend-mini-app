import React, { useState } from 'react'
import { useTelegramApp } from '../hooks/useTelegramApp'

export default function ReferralSystem({ referralCount, setReferralCount }) {
  const { shareLink, showAlert, user } = useTelegramApp()
  const [copied, setCopied] = useState(false)

  const referralLink = `https://t.me/YourBotUsername?start=ref_${user?.id || '0'}`

  const handleInvite = () => {
    const text = `🎭 Присоединяйся к ЛЕГЕНДЕ — закрытому мужскому клубу премиум класса.\n\nПолучи приватную ссылку и стань членом клуба прямо в Telegram!\n\n💎 Привилегии: персональный мастер, цифровой паспорт стиля, рефпрограмма.`
    shareLink(referralLink, text)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    showAlert('✓ Ссылка скопирована')
    setTimeout(() => setCopied(false), 2000)
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

      {/* Invite Button */}
      <button
        onClick={handleInvite}
        className="w-full card-premium bg-gradient-to-r from-legend-brass/20 to-legend-gold/20 border border-legend-gold pressable hover:shadow-[0_0_30px_rgba(198,169,107,0.4)]"
      >
        <p className="text-center text-lg font-serif font-bold text-legend-gold">Пригласить друга</p>
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

      {/* Info */}
      <div className="card-premium bg-legend-wenge/20 border-legend-brass/50">
        <p className="text-xs text-legend-light/70">
          Каждый приглашённый друг получает скидку 10% на первую услугу. Ты получаешь бонусы и повышаешь свой уровень в клубе. Win-win! 🎭
        </p>
      </div>
    </div>
  )
}
