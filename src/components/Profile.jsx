import React, { useState, useEffect, useMemo } from 'react'
import { subscribeToUser, defaultCardNumberFromUserId } from '../firebase'
import { usePreferences } from '../context/PreferencesContext'
import { getLevelTiers } from '../i18n/levels'

export default function Profile({ user, userLevel: initialLevel, referralCount: initialReferrals }) {
  const { language, t } = usePreferences()
  const [showDetails, setShowDetails] = useState(null)
  const [userLevel, setUserLevel] = useState(initialLevel || 'newbie')
  const [referralCount, setReferralCount] = useState(initialReferrals || 0)
  const [cardNumber, setCardNumber] = useState('0000')
  const [bonusBalance, setBonusBalance] = useState(0)

  const levelTiers = useMemo(() => getLevelTiers(language), [language])

  useEffect(() => {
    if (user?.id) {
      const unsubscribe = subscribeToUser(user.id, (userData) => {
        if (userData) {
          setUserLevel(userData.level || 'newbie')
          setReferralCount(userData.referrals || 0)
          setCardNumber(userData.cardNumber || defaultCardNumberFromUserId(user.id))
          setBonusBalance(typeof userData.bonusBalance === 'number' ? userData.bonusBalance : 0)
        }
      })
      return () => unsubscribe()
    }
  }, [user?.id])

  const currentLevelIndex = levelTiers.findIndex((tier) => tier.id === userLevel)
  const currentLevelTier = levelTiers[currentLevelIndex] || levelTiers[0]

  return (
    <div className="animate-fade-in space-y-6 p-4 pb-36">
      <div className="card-premium glow-element relative min-h-[15rem] overflow-hidden rounded-3xl border-legend-gold/25">
        <div className="pointer-events-none absolute inset-0 bg-legend-card-shine opacity-90" />
        <div className="pointer-events-none absolute -right-20 -top-24 h-48 w-48 rounded-full bg-legend-gold/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-legend-brass/10 blur-2xl" />

        <div className="relative z-10 flex h-full min-h-[15rem] flex-col justify-between">
          <div>
            <div className="mb-6 flex items-start justify-between">
              <div className="rounded-lg border border-legend-gold/20 bg-legend-black/40 px-2 py-1 font-serif text-xl text-legend-gold-bright">
                ◊
              </div>
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.4em] text-legend-light/35">
                {t('brand_title')}
              </p>
            </div>

            <div className="mb-4">
              <p className="mb-1.5 text-[0.65rem] font-medium uppercase tracking-[0.25em] text-legend-light/45">
                {t('profile_card_no')}
              </p>
              <p className="font-mono text-2xl font-semibold tracking-[0.35em] text-legend-light [font-feature-settings:'tnum']">
                {cardNumber}
              </p>
            </div>

            <div>
              <p className="mb-1 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-legend-light/45">
                {t('profile_bonus')}
              </p>
              <p className="font-mono text-xl font-semibold tabular-nums text-legend-gold-bright">
                {bonusBalance.toLocaleString(language === 'zh' ? 'zh-CN' : language === 'en' ? 'en-US' : 'ru-RU', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}{' '}
                {t('profile_bonus_unit')}
              </p>
            </div>
          </div>

          <div className="flex items-end justify-between gap-3 border-t border-legend-wenge/30 pt-3">
            <div>
              <p className="mb-1 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-legend-light/45">
                {t('profile_status')}
              </p>
              <p className="font-serif text-lg font-bold text-legend-gold-bright">{currentLevelTier.name}</p>
            </div>
            <p className="shrink-0 text-3xl leading-none text-legend-gold/90">{currentLevelTier.icon}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card-premium text-center">
          <p className="font-serif text-3xl font-bold tabular-nums text-legend-gold-bright">{referralCount}</p>
          <p className="mt-1 text-[0.7rem] font-medium uppercase tracking-wide text-legend-light/50">
            {t('profile_invited')}
          </p>
        </div>
        <div className="card-premium text-center">
          <p className="font-serif text-3xl font-bold text-legend-gold-bright">{currentLevelTier.bonus}</p>
          <p className="mt-1 text-[0.7rem] font-medium uppercase tracking-wide text-legend-light/50">
            {t('profile_level_bonus')}
          </p>
        </div>
      </div>

      {currentLevelIndex < levelTiers.length - 1 && (
        <div className="card-premium">
          <p className="section-heading mb-2">
            {t('profile_progress')} {levelTiers[currentLevelIndex + 1].name}
          </p>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-legend-black/80 ring-1 ring-legend-wenge/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-legend-brass via-legend-gold to-legend-gold-bright transition-all duration-500 shadow-[0_0_12px_rgba(198,169,107,0.35)]"
              style={{ width: `${(referralCount / levelTiers[currentLevelIndex + 1].requiredReferrals) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-legend-light/60">
            {referralCount} / {levelTiers[currentLevelIndex + 1].requiredReferrals} {t('profile_progress_ref')}
          </p>
        </div>
      )}

      <div className="card-premium">
        <p className="section-heading mb-3">{t('profile_perks')}</p>
        <div className="space-y-2">
          {currentLevelTier.perks.map((perk, idx) => (
            <div key={idx} className="flex items-start space-x-2">
              <span className="mt-0.5 text-lg leading-none text-legend-gold">•</span>
              <p className="text-sm text-legend-light/80">{perk}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="section-heading">{t('profile_tiers')}</p>
        {levelTiers.map((tier, idx) => (
          <div
            key={tier.id}
            onClick={() => setShowDetails(showDetails === tier.id ? null : tier.id)}
            className="card-premium cursor-pointer pressable"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <p className={`text-lg font-serif ${idx <= currentLevelIndex ? 'text-legend-gold' : 'text-legend-brass'}`}>
                  {tier.icon}
                </p>
                <div>
                  <p
                    className={`text-sm font-bold ${idx <= currentLevelIndex ? 'text-legend-gold' : 'text-legend-light/60'}`}
                  >
                    {tier.name}
                  </p>
                  <p className="text-xs text-legend-light/40">
                    {tier.requiredReferrals}
                    {t('profile_ref_suffix')}
                  </p>
                </div>
              </div>
              <p className="font-serif text-lg text-legend-gold">{tier.bonus}</p>
            </div>

            {showDetails === tier.id && (
              <div className="mt-3 space-y-2 animate-fade-in border-t border-legend-wenge pt-3">
                {tier.perks.map((perk, pidx) => (
                  <p key={pidx} className="text-xs text-legend-light/60">
                    • {perk}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
