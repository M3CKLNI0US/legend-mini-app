import React from 'react'

const navItems = [
  { id: 'profile', icon: '💎', label: 'Профиль' },
  { id: 'referral', icon: '👥', label: 'Рефералы' },
  { id: 'booking', icon: '📅', label: 'Запись' },
  { id: 'settings', icon: '⚙️', label: 'Настройки' },
]

export default function BottomNavigation({ currentPage, setCurrentPage, isAdmin }) {
  const items = isAdmin 
    ? [...navItems.slice(0, 3), { id: 'admin', icon: '👑', label: 'Админ' }, navItems[3]]
    : navItems

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-legend-wenge/50 bg-legend-deep/90 px-1 pt-2 shadow-legend-nav backdrop-blur-xl supports-[backdrop-filter]:bg-legend-deep/75 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {items.map((item) => {
        const active = currentPage === item.id
        const admin = item.id === 'admin'
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setCurrentPage(item.id)}
            className={`relative flex min-w-[4.25rem] flex-col items-center gap-1 rounded-xl px-2 py-2 transition-all duration-300 pressable ${
              active
                ? 'text-legend-gold-bright'
                : admin
                  ? 'text-red-400/90 hover:text-red-300'
                  : 'text-legend-light/45 hover:text-legend-light/85'
            }`}
          >
            {active && (
              <span className="absolute inset-x-2 top-1 h-8 rounded-lg bg-legend-gold/12 ring-1 ring-legend-gold/25" />
            )}
            <span className="relative text-[1.15rem] leading-none">{item.icon}</span>
            <span className="relative text-[0.65rem] font-semibold tracking-wide">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
