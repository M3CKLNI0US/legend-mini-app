import React, { useState, useEffect } from 'react'
import { useTelegramApp } from '../hooks/useTelegramApp'
import { getAllUsersFromFirebase, updateUserInFirebase, deleteUserFromFirebase, subscribeToUsers } from '../firebase'

const ADMIN_USER_ID = '1100054796' // ID владельца

export default function AdminPanel() {
  const { user, showAlert } = useTelegramApp()
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [filter, setFilter] = useState('all') // all, active, blocked, pending
  const [loading, setLoading] = useState(true)

  // Проверка что текущий пользователь - админ
  const isAdmin = user?.id?.toString() === ADMIN_USER_ID

  // Загрузка всех пользователей из Firebase с реальным временем
  useEffect(() => {
    if (!isAdmin) return
    
    setLoading(true)
    
    // Подписка на изменения пользователей в реальном времени
    const unsubscribe = subscribeToUsers((firebaseUsers) => {
      setUsers(firebaseUsers)
      setLoading(false)
    })
    
    return () => unsubscribe()
  }, [isAdmin])

  // Сохранение изменений пользователя в Firebase
  const saveUser = async (userId, updates) => {
    const success = await updateUserInFirebase(userId, updates)
    if (success) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u))
      showAlert('✓ Изменения сохранены')
    } else {
      showAlert('❌ Ошибка сохранения')
    }
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

  // Изменение количества рефералов
  const changeReferrals = (userId, newCount) => {
    const count = parseInt(newCount, 10) || 0
    saveUser(userId, { referrals: count, referralsUpdatedAt: new Date().toISOString() })
  }

  // Добавить реферал
  const addReferral = (userId) => {
    const user = users.find(u => u.id === userId)
    const currentCount = user?.referrals || 0
    changeReferrals(userId, currentCount + 1)
  }

  // Убрать реферал
  const removeReferral = (userId) => {
    const user = users.find(u => u.id === userId)
    const currentCount = user?.referrals || 0
    if (currentCount > 0) {
      changeReferrals(userId, currentCount - 1)
    }
  }

  // Установить телефон пользователю (ручное подтверждение)
  const setUserPhone = (userId, phone) => {
    if (!phone || phone.trim() === '') {
      showAlert('❌ Введите номер телефона')
      return
    }
    // Проверка на российский номер
    const isRussian = phone.startsWith('+7') || phone.startsWith('7') || phone.startsWith('8')
    if (!isRussian) {
      showAlert('❌ Требуется российский номер (+7...)')
      return
    }
    // Нормализуем номер
    let normalizedPhone = phone
    if (phone.startsWith('8') && phone.length === 11) {
      normalizedPhone = '+7' + phone.slice(1)
    } else if (phone.startsWith('7') && !phone.startsWith('+7')) {
      normalizedPhone = '+7' + phone.slice(1)
    }
    
    saveUser(userId, { 
      phone: normalizedPhone, 
      phoneVerified: true,
      phoneVerifiedAt: new Date().toISOString()
    })
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

                {/* Referral Management */}
                <div className="space-y-2">
                  <p className="text-xs text-legend-gold font-bold">Управление рефералами:</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeReferral(userData.id)
                      }}
                      className="w-10 h-10 bg-red-900/20 border border-red-600 text-red-400 rounded flex items-center justify-center text-lg"
                      disabled={userData.referrals <= 0}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={userData.referrals || 0}
                      onChange={(e) => {
                        e.stopPropagation()
                        changeReferrals(userData.id, e.target.value)
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 h-10 bg-legend-deep border border-legend-wenge rounded text-center text-legend-gold font-bold"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        addReferral(userData.id)
                      }}
                      className="w-10 h-10 bg-green-900/20 border border-green-600 text-green-400 rounded flex items-center justify-center text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Phone Management */}
                <div className="space-y-2">
                  <p className="text-xs text-legend-gold font-bold">Подтвердить телефон:</p>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      placeholder="+79001234567"
                      defaultValue={userData.phone || ''}
                      onChange={(e) => {
                        e.stopPropagation()
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 h-10 bg-legend-deep border border-legend-wenge rounded px-3 text-legend-gold text-sm"
                      id={`phone-input-${userData.id}`}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        const input = document.getElementById(`phone-input-${userData.id}`)
                        if (input) {
                          setUserPhone(userData.id, input.value)
                        }
                      }}
                      className="px-4 h-10 bg-green-900/20 border border-green-600 text-green-400 rounded text-sm"
                    >
                      ✓ Подтвердить
                    </button>
                  </div>
                  {userData.phone && (
                    <p className="text-xs text-green-400">
                      ✓ Телефон подтвержден: {userData.phone}
                    </p>
                  )}
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
                        onClick={async (e) => {
                          e.stopPropagation()
                          if (confirm('Удалить пользователя?')) {
                            const success = await deleteUserFromFirebase(userData.id)
                            if (success) {
                              setUsers(prev => prev.filter(u => u.id !== userData.id))
                              showAlert('Пользователь удален')
                            } else {
                              showAlert('❌ Ошибка удаления')
                            }
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
