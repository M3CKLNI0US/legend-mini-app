import React, { useMemo } from 'react'
import { getLevelTiers } from '../i18n/levels'
import { usePreferences } from '../context/PreferencesContext'

export default function Header({ userLevel }) {
  const { language, t } = usePreferences()
  const level = useMemo(() => {
    const tiers = getLevelTiers(language)
    return tiers.find((x) => x.id === userLevel) || tiers[0]
  }, [userLevel, language])

  const colorClass =
    userLevel === 'newbie' ? 'text-legend-brass' : 'text-legend-gold'

  return (
    <header className="sticky top-0 z-40 border-b border-legend-wenge/40 bg-legend-black/80 px-4 py-3 backdrop-blur-xl supports-[backdrop-filter]:bg-legend-black/55">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-legend-gold/25 bg-gradient-to-br from-legend-gold/15 to-transparent shadow-legend-glow">
            <span className="font-serif text-xl font-bold text-legend-gold-bright animate-fade-in">◊</span>
          </div>
          <div>
            <p className="font-serif text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-legend-gold/70">
              {t('club_label')}
            </p>
            <p className="font-serif text-base font-bold leading-tight tracking-wide text-legend-light">
              {t('brand_title')}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className={`text-base font-bold leading-none ${colorClass}`}>{level.icon}</p>
          <p className="mt-1 max-w-[9rem] truncate text-[0.65rem] font-medium uppercase tracking-wide text-legend-light/50">
            {level.name}
          </p>
        </div>
      </div>

      <div className="line-accent mt-3 opacity-80" />
    </header>
  )
}
