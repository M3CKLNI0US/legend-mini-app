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
    <nav className="fixed bottom-0 left-0 right-0 bg-legend-deep border-t border-legend-wenge px-2 py-3 flex justify-around">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setCurrentPage(item.id)}
          className={`flex flex-col items-center space-y-1 px-2 py-2 rounded-lg transition-all duration-300 pressable ${
            currentPage === item.id
              ? 'bg-legend-gold/10 text-legend-gold'
              : item.id === 'admin'
              ? 'text-red-400 hover:text-red-300'
              : 'text-legend-light/60 hover:text-legend-light'
          }`}
        >
          <span className="text-lg">{item.icon}</span>
          <span className="text-xs font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
