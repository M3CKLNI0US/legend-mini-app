import React, { useState, useEffect } from 'react'
import { useTelegramApp } from '../hooks/useTelegramApp'

export default function ReferralSystem({ referralCount, setReferralCount }) {
  const { shareLink, showAlert, user } = useTelegramApp()
  const [copied, setCopied] = useState(false)
  const [referredUsers, setReferredUsers] = useState([])

  // Загрузка данных из localStorage
  useEffect(() => {
    const stored = localStorage.getItem('legend_referrals')
    const storedCount = localStorage.getItem('legend_referral_count')
    if (stored) {
      setReferredUsers(JSON.parse(stored))
    }
    if (storedCount) {
      setReferralCount(parseInt(storedCount, 10))
    }
  }, [setReferralCount])

  // Обработка входящего реферального кода
  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (tg?.initDataUnsafe?.start_param) {
      const startParam = tg.initDataUnsafe.start_param
      if (startParam.startsWith('ref_')) {
        const referrerId = startParam.replace('ref_', '')
        // Сохраняем что пользователь пришел по реферальной ссылке
        localStorage.setItem('legend_referrer_id', referrerId)
        console.log('Referral code detected:', referrerId)
      }
    }
  }, [])

  const BOT_USERNAME = 'LegendaBarber_Bot'
  const referralLink = `https://t.me/${BOT_USERNAME}?start=ref_${user?.id || '123456789'}`

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
    </div>
  )
}
