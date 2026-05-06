import React from 'react'

const levelInfo = {
  newbie: { name: 'Новобранец', icon: '◆', color: 'text-legend-brass' },
  guardian: { name: 'Хранитель Клуба', icon: '◇', color: 'text-legend-gold' },
  elder: { name: 'Старейшина', icon: '◆◆', color: 'text-legend-gold' },
  legend: { name: 'Легенда', icon: '◆◆◆', color: 'text-legend-gold' },
}

export default function Header({ userLevel }) {
  const level = levelInfo[userLevel] || levelInfo.newbie

  return (
    <header className="sticky top-0 z-50 bg-legend-black border-b border-legend-wenge p-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="text-2xl font-serif font-bold text-legend-gold animate-fade-in">◊</div>
          <span className="font-serif font-bold text-sm">ЛЕГЕНДА</span>
        </div>

        {/* User Level */}
        <div className="text-center">
          <p className={`text-sm font-bold ${level.color}`}>{level.icon}</p>
          <p className="text-xs text-legend-light/60">{level.name}</p>
        </div>
      </div>

      {/* Line Accent */}
      <div className="line-accent mt-3"></div>
    </header>
  )
}
