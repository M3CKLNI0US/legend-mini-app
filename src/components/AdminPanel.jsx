import React, { useState, useEffect } from 'react'
import { useTelegramApp } from '../hooks/useTelegramApp'

const ADMIN_USER_ID = '1100054796' // ID владельца

export default function AdminPanel() {
  const { user, showAlert } = useTelegramApp()
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [filter, setFilter] = useState('all') // all, active, blocked, pending

  // Проверка что текущий пользователь - админ
  const isAdmin = user?.id?.toString() === ADMIN_USER_ID

  // Загрузка всех пользователей из localStorage
  useEffect(() => {
    const loadUsers = () => {
      const allUsers = []
      
      // Проходим по всем ключам localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        
        // Ищем данные пользователей
        if (key?.startsWith('legend_user_')) {
          try {
            const userData = JSON.parse(localStorage.getItem(key))
            allUsers.push({
              id: key.replace('legend_user_', ''),
              ...userData,
              phone: localStorage.getItem(`legend_phone_${key.replace('legend_user_', '')}`) || null
            })
          } catch (e) {
            console.error('Error parsing user data:', e)
          }
        }
      }
      
      // Добавляем тестовых пользователей для демо
      if (allUsers.length === 0) {
        const demoUsers = [
          { id: '123456789', name: 'Иван Петров', level: 'legend', referrals: 5, status: 'active', phone: '+79001234567', joinedAt: '2024-01-15' },
          { id: '987654321', name: 'Алексей Сидоров', level: 'guardian', referrals: 2, status: 'active', phone: '+79009876543', joinedAt: '2024-02-20' },
          { id: '456789123', name: 'Михаил Иванов', level: 'newbie', referrals: 0, status: 'blocked', phone: null, joinedAt: '2024-03-10', blockReason: 'Спам' },
        ]
        allUsers.push(...demoUsers)
        // Сохраняем демо-данные
        demoUsers.forEach(u => {
          localStorage.setItem(`legend_user_${u.id}`, JSON.stringify({
            name: u.name,
            level: u.level,
            referrals: u.referrals,
            status: u.status,
            joinedAt: u.joinedAt,
            blockReason: u.blockReason
          }))
          if (u.phone) localStorage.setItem(`legend_phone_${u.id}`, u.phone)
        })
      }
      
      setUsers(allUsers)
    }
    
    loadUsers()
  }, [])

  // Сохранение изменений пользователя
  const saveUser = (userId, updates) => {
    const key = `legend_user_${userId}`
    const existing = JSON.parse(localStorage.getItem(key) || '{}')
    const updated = { ...existing, ...updates }
    localStorage.setItem(key, JSON.stringify(updated))
    
    // Обновляем список
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u))
    showAlert('✓ Изменения сохранены')
  }

  // Блокировка пользователя
  const blockUser = (userId, reason) => {
    saveUser(userId, { status: 'blocked', blockReason: reason, blockedAt: new Date().toISOString() })
  }

  // Разблокировка
  const unblockUser = (userId) => {
    saveUser(userId, { status: 'active', blockReason: null, blockedAt: null })
  }

  // Изменение уровня
  const changeLevel = (userId, newLevel) => {
    saveUser(userId, { level: newLevel, levelChangedAt: new Date().toISOString() })
  }

  // Фильтрация пользователей
  const filteredUsers = users.filter(u => {
    if (filter === 'active') return u.status === 'active'
    if (filter === 'blocked') return u.status === 'blocked'
    if (filter === 'pending') return u.status === 'pending'
    return true
  }).filter(u => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      u.name?.toLowerCase().includes(query) ||
      u.id?.includes(query) ||
      u.phone?.includes(query)
    )
  })

  // Статистика
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    blocked: users.filter(u => u.status === 'blocked').length,
    legends: users.filter(u => u.level === 'legend').length,
    totalReferrals: users.reduce((sum, u) => sum + (u.referrals || 0), 0)
  }

  if (!isAdmin) {
    return (
      <div className="p-4 pb-32">
        <div className="card-premium bg-red-900/20 border-red-900/50">
          <p className="text-center text-red-400">⛔ Доступ запрещен</p>
          <p className="text-center text-xs text-legend-light/60 mt-2">Эта секция только для администраторов</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pb-32 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card-premium bg-gradient-to-r from-red-900/20 to-legend-gold/20 border-legend-gold">
        <p className="text-center text-lg font-serif font-bold text-legend-gold">👑 Панель администратора</p>
        <p className="text-center text-xs text-legend-light/60 mt-2">Управление пользователями и модерация</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-premium text-center">
          <p className="text-legend-gold text-2xl font-serif font-bold">{stats.total}</p>
          <p className="text-xs text-legend-light/60">Всего пользователей</p>
        </div>
        <div className="card-premium text-center">
          <p className="text-green-400 text-2xl font-serif font-bold">{stats.active}</p>
          <p className="text-xs text-legend-light/60">Активных</p>
        </div>
        <div className="card-premium text-center">
          <p className="text-red-400 text-2xl font-serif font-bold">{stats.blocked}</p>
          <p className="text-xs text-legend-light/60">Заблокировано</p>
        </div>
        <div className="card-premium text-center">
          <p className="text-legend-gold text-2xl font-serif font-bold">{stats.legends}</p>
          <p className="text-xs text-legend-light/60">Легенд</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Поиск по имени, ID или телефону..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full card-premium bg-legend-black border border-legend-wenge px-4 py-3 text-legend-light rounded outline-none focus:border-legend-gold"
        />
        
        <div className="flex gap-2">
          {['all', 'active', 'blocked', 'pending'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 text-xs rounded border transition-all ${
                filter === f
                  ? 'bg-legend-gold/20 border-legend-gold text-legend-gold'
                  : 'border-legend-wenge text-legend-light/60'
              }`}
            >
              {f === 'all' && 'Все'}
              {f === 'active' && 'Активные'}
              {f === 'blocked' && 'Заблокированы'}
              {f === 'pending' && 'Ожидание'}
            </button>
          ))}
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        <p className="text-legend-gold text-sm font-bold uppercase">Пользователи ({filteredUsers.length})</p>
        
        {filteredUsers.map((userData) => (
          <div
            key={userData.id}
            onClick={() => setSelectedUser(selectedUser?.id === userData.id ? null : userData)}
            className={`card-premium cursor-pointer transition-all ${
              userData.status === 'blocked' ? 'border-red-900/50 bg-red-900/10' : ''
            } ${selectedUser?.id === userData.id ? 'border-legend-gold' : ''}`}
          >
            {/* User Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${
                  userData.status === 'blocked' ? 'bg-red-900/30 text-red-400' :
                  userData.level === 'legend' ? 'bg-legend-gold/30 text-legend-gold' :
                  userData.level === 'elder' ? 'bg-legend-brass/30 text-legend-brass' :
                  'bg-legend-wenge/30 text-legend-light'
                }`}>
                  {userData.status === 'blocked' ? '⚠️' : 
                   userData.level === 'legend' ? '◆◆◆' :
                   userData.level === 'elder' ? '◆◆' :
                   userData.level === 'guardian' ? '◇' : '◆'}
                </div>
                <div>
                  <p className="text-sm font-bold text-legend-light">{userData.name || 'Без имени'}</p>
                  <p className="text-xs text-legend-light/40">ID: {userData.id}</p>
                  {userData.phone && (
                    <p className="text-xs text-legend-gold">{userData.phone}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-1 rounded ${
                  userData.status === 'active' ? 'bg-green-900/30 text-green-400' :
                  userData.status === 'blocked' ? 'bg-red-900/30 text-red-400' :
                  'bg-legend-brass/30 text-legend-brass'
                }`}>
                  {userData.status === 'active' ? '✓ Активен' :
                   userData.status === 'blocked' ? '⛔ Заблокирован' : '⏳ Ожидание'}
                </span>
                <p className="text-xs text-legend-light/40 mt-1">Рефералы: {userData.referrals || 0}</p>
              </div>
            </div>

            {/* Expanded Actions */}
            {selectedUser?.id === userData.id && (
              <div className="mt-4 pt-4 border-t border-legend-wenge/30 space-y-3">
                {/* User Details */}
                <div className="text-xs text-legend-light/60 space-y-1">
                  <p><strong>Регистрация:</strong> {userData.joinedAt || 'Неизвестно'}</p>
                  {userData.blockReason && (
                    <p className="text-red-400"><strong>Причина блокировки:</strong> {userData.blockReason}</p>
                  )}
                </div>

                {/* Level Management */}
                <div className="space-y-2">
                  <p className="text-xs text-legend-gold font-bold">Изменить уровень:</p>
                  <div className="flex gap-2">
                    {['newbie', 'guardian', 'elder', 'legend'].map((level) => (
                      <button
                        key={level}
                        onClick={(e) => {
                          e.stopPropagation()
                          changeLevel(userData.id, level)
                        }}
                        className={`flex-1 py-2 text-xs rounded border transition-all ${
                          userData.level === level
                            ? 'bg-legend-gold/20 border-legend-gold text-legend-gold'
                            : 'border-legend-wenge text-legend-light/60 hover:border-legend-brass'
                        }`}
                      >
                        {level === 'newbie' && '◆ Новичок'}
                        {level === 'guardian' && '◇ Хранитель'}
                        {level === 'elder' && '◆◆ Старейшина'}
                        {level === 'legend' && '◆◆◆ Легенда'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Block/Unblock Actions */}
                <div className="flex gap-2">
                  {userData.status === 'blocked' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        unblockUser(userData.id)
                      }}
                      className="flex-1 py-2 bg-green-900/20 border border-green-600 text-green-400 rounded text-sm"
                    >
                      ✓ Разблокировать
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const reason = prompt('Причина блокировки:')
                          if (reason) blockUser(userData.id, reason)
                        }}
                        className="flex-1 py-2 bg-red-900/20 border border-red-600 text-red-400 rounded text-sm"
                      >
                        ⛔ Заблокировать
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm('Удалить пользователя?')) {
                            localStorage.removeItem(`legend_user_${userData.id}`)
                            localStorage.removeItem(`legend_phone_${userData.id}`)
                            setUsers(prev => prev.filter(u => u.id !== userData.id))
                            showAlert('Пользователь удален')
                          }
                        }}
                        className="py-2 px-4 bg-legend-wenge/20 border border-legend-wenge text-legend-light/60 rounded text-sm"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>

                {/* Send Message */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const message = prompt('Сообщение пользователю:')
                    if (message) {
                      // В реальности здесь отправка через бота
                      showAlert(`Сообщение отправлено пользователю ${userData.id}`)
                    }
                  }}
                  className="w-full py-2 bg-legend-brass/20 border border-legend-brass text-legend-brass rounded text-sm"
                >
                  📨 Отправить сообщение
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Export Data */}
      <button
        onClick={() => {
          const data = JSON.stringify(users, null, 2)
          const blob = new Blob([data], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `legend-users-${new Date().toISOString().split('T')[0]}.json`
          a.click()
          showAlert('✓ Данные экспортированы')
        }}
        className="w-full card-premium border-legend-gold text-legend-gold py-3"
      >
        📥 Экспорт данных пользователей
      </button>
    </div>
  )
}
