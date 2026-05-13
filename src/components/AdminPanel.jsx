import React, { useState, useEffect, useMemo } from 'react'
import { useTelegramApp } from '../hooks/useTelegramApp'
import { updateUserInFirebase, deleteUserFromFirebase, subscribeToUsers, savePhoneToFirebase, defaultCardNumberFromUserId, parseCardNumberInput, createPromoCode, getAllPromoCodes, updatePromoCode, deletePromoCode } from '../firebase'

const ADMIN_USER_ID = '1100054796' // ID владельца

export default function AdminPanel() {
  const { user, showAlert, initData } = useTelegramApp()
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [cardSearchQuery, setCardSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name') // name, id, referrals, bonus, joined
  const [sortOrder, setSortOrder] = useState('asc') // asc, desc
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(10)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [filter, setFilter] = useState('all') // all, active, blocked, pending
  const [loading, setLoading] = useState(true)
  const [cardInput, setCardInput] = useState('')
  const [bonusInput, setBonusInput] = useState('')
  const [promoCodes, setPromoCodes] = useState([])
  const [showPromoCreator, setShowPromoCreator] = useState(false)
  const [promoCodeInput, setPromoCodeInput] = useState('')
  const [promoBonusInput, setPromoBonusInput] = useState('')
  const [promoMaxUsesInput, setPromoMaxUsesInput] = useState('')

  const selectedUser = useMemo(
    () => (selectedUserId == null ? null : users.find((u) => String(u.id) === String(selectedUserId)) || null),
    [users, selectedUserId]
  )

  useEffect(() => {
    if (!selectedUser) return
    setCardInput(selectedUser.cardNumber || defaultCardNumberFromUserId(selectedUser.id))
    setBonusInput('')
  }, [selectedUser?.id, selectedUser?.cardNumber, selectedUser?.bonusBalance])

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

  // Загрузка промокодов
  useEffect(() => {
    if (!isAdmin) return
    
    const loadPromoCodes = async () => {
      const codes = await getAllPromoCodes()
      setPromoCodes(codes)
    }
    loadPromoCodes()
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
  const setUserPhone = async (userId, phone) => {
    if (!phone || phone.trim() === '') {
      showAlert('❌ Введите номер телефона')
      return
    }
    const isRussian = phone.startsWith('+7') || phone.startsWith('7') || phone.startsWith('8')
    if (!isRussian) {
      showAlert('❌ Требуется российский номер (+7...)')
      return
    }
    let normalizedPhone = phone.trim()
    if (normalizedPhone.startsWith('8') && normalizedPhone.replace(/\D/g, '').length === 11) {
      normalizedPhone = '+7' + normalizedPhone.replace(/\D/g, '').slice(1)
    } else if (normalizedPhone.startsWith('7') && !normalizedPhone.startsWith('+7')) {
      normalizedPhone = '+7' + normalizedPhone.replace(/\D/g, '').slice(1)
    } else if (/^\d{10}$/.test(normalizedPhone.replace(/\D/g, ''))) {
      normalizedPhone = '+7' + normalizedPhone.replace(/\D/g, '')
    }

    const ok = await savePhoneToFirebase(userId, normalizedPhone)
    if (ok) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, phone: normalizedPhone, phoneVerified: true } : u)))
      showAlert('✓ Телефон сохранён в Firebase')
    } else {
      showAlert('❌ Ошибка сохранения телефона')
    }
  }

  // Создание промокода
  const createNewPromoCode = async () => {
    if (!promoCodeInput.trim()) {
      showAlert('❌ Введите код промокода')
      return
    }
    if (!promoBonusInput || isNaN(promoBonusInput) || parseInt(promoBonusInput) <= 0) {
      showAlert('❌ Введите корректную сумму бонуса')
      return
    }
    if (!promoMaxUsesInput || isNaN(promoMaxUsesInput) || parseInt(promoMaxUsesInput) <= 0) {
      showAlert('❌ Введите корректное количество использований')
      return
    }

    const success = await createPromoCode({
      code: promoCodeInput.trim(),
      bonusAmount: parseInt(promoBonusInput),
      maxUses: parseInt(promoMaxUsesInput),
    })

    if (success) {
      showAlert('✓ Промокод создан')
      setPromoCodeInput('')
      setPromoBonusInput('')
      setPromoMaxUsesInput('')
      setShowPromoCreator(false)
      // Перезагрузка промокодов
      const codes = await getAllPromoCodes()
      setPromoCodes(codes)
    } else {
      showAlert('❌ Ошибка создания промокода (возможно, код уже существует)')
    }
  }

  // Удаление промокода
  const removePromoCode = async (code) => {
    const success = await deletePromoCode(code)
    if (success) {
      showAlert('✓ Промокод удалён')
      setPromoCodes(prev => prev.filter(p => p.code !== code))
    } else {
      showAlert('❌ Ошибка удаления промокода')
    }
  }

  // Деактивация промокода
  const togglePromoCode = async (code, isActive) => {
    const success = await updatePromoCode(code, { isActive: !isActive })
    if (success) {
      showAlert(isActive ? '✓ Промокод деактивирован' : '✓ Промокод активирован')
      setPromoCodes(prev => prev.map(p => 
        p.code === code ? { ...p, isActive: !isActive } : p
      ))
    } else {
      showAlert('❌ Ошибка обновления промокода')
    }
  }

  const saveCardNumber = async (e, userId) => {
    e.stopPropagation()
    const p = parseCardNumberInput(cardInput)
    if (!p) {
      showAlert('Номер карты: ровно 4 цифры от 0000 до 9999')
      return
    }
    const ok = await updateUserInFirebase(userId, { cardNumber: p })
    if (ok) {
      setUsers((prev) => prev.map((u) => (String(u.id) === String(userId) ? { ...u, cardNumber: p } : u)))
      showAlert('✓ Номер карты сохранён')
    } else {
      showAlert('❌ Ошибка сохранения карты')
    }
  }

  const applyBonusDelta = async (userId, delta) => {
    const u = users.find((x) => String(x.id) === String(userId))
    const cur = Number(u?.bonusBalance) || 0
    const next = Math.round((cur + delta) * 100) / 100
    if (next < 0) {
      showAlert('Недостаточно средств на бонусном счёте')
      return
    }
    const ok = await updateUserInFirebase(userId, { bonusBalance: next })
    if (ok) {
      setUsers((prev) =>
        prev.map((x) => (String(x.id) === String(userId) ? { ...x, bonusBalance: next } : x))
      )
      showAlert(delta >= 0 ? `✓ Начислено ${delta} ₽` : `✓ Списано ${-delta} ₽`)
    } else {
      showAlert('❌ Ошибка сохранения бонуса')
    }
  }

  const applyBonusFromField = async (e, userId) => {
    e.stopPropagation()
    const n = parseFloat(String(bonusInput).replace(',', '.'))
    if (Number.isNaN(n) || n === 0) {
      showAlert('Введите сумму (число)')
      return
    }
    await applyBonusDelta(userId, n)
    setBonusInput('')
  }

  // Фильтрация пользователей
  const filteredUsers = users.filter(u => {
    if (filter === 'active') return u.status === 'active'
    if (filter === 'blocked') return u.status === 'blocked'
    if (filter === 'pending') return u.status === 'pending'
    return true
  }).filter(u => {
    if (!searchQuery && !cardSearchQuery) return true
    
    const query = searchQuery.toLowerCase()
    const cardQuery = cardSearchQuery.toLowerCase()
    
    const matchesGeneral = !searchQuery || (
      u.name?.toLowerCase().includes(query) ||
      u.id?.includes(query) ||
      u.phone?.includes(query)
    )
    
    const matchesCard = !cardSearchQuery || (
      u.cardNumber?.includes(cardQuery)
    )
    
    return matchesGeneral && matchesCard
  }).sort((a, b) => {
    let aVal, bVal
    
    switch (sortBy) {
      case 'name':
        aVal = a.name || ''
        bVal = b.name || ''
        break
      case 'id':
        aVal = parseInt(a.id) || 0
        bVal = parseInt(b.id) || 0
        break
      case 'referrals':
        aVal = a.referrals || 0
        bVal = b.referrals || 0
        break
      case 'bonus':
        aVal = a.bonusBalance || 0
        bVal = b.bonusBalance || 0
        break
      case 'joined':
        aVal = new Date(a.joinedAt || 0).getTime()
        bVal = new Date(b.joinedAt || 0).getTime()
        break
      default:
        return 0
    }
    
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
    }
  })

  // Пагинация
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  )

  // Сброс страницы при изменении фильтров
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, cardSearchQuery, filter, sortBy, sortOrder])

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
      <div className="p-4 pb-36">
        <div className="card-premium bg-red-900/20 border-red-900/50">
          <p className="text-center text-red-400">⛔ Доступ запрещен</p>
          <p className="text-center text-xs text-legend-light/60 mt-2">Эта секция только для администраторов</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pb-36 space-y-6 animate-fade-in">
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

      {/* Promo Codes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-legend-gold text-sm font-bold uppercase">Промокоды ({promoCodes.length})</p>
          <button
            onClick={() => setShowPromoCreator(!showPromoCreator)}
            className="rounded border border-legend-gold bg-legend-gold/15 px-3 py-1 text-xs text-legend-gold"
          >
            {showPromoCreator ? 'Отмена' : '+ Создать'}
          </button>
        </div>

        {showPromoCreator && (
          <div className="card-premium space-y-3">
            <p className="text-sm font-bold text-legend-gold">Создание промокода</p>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Код промокода (например: WELCOME50)"
                value={promoCodeInput}
                onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                className="w-full h-10 rounded border border-legend-wenge bg-legend-deep px-3 text-legend-gold font-mono"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Бонус (руб.)"
                  value={promoBonusInput}
                  onChange={(e) => setPromoBonusInput(e.target.value)}
                  className="flex-1 h-10 rounded border border-legend-wenge bg-legend-deep px-3 text-legend-gold"
                />
                <input
                  type="number"
                  placeholder="Макс. использований"
                  value={promoMaxUsesInput}
                  onChange={(e) => setPromoMaxUsesInput(e.target.value)}
                  className="flex-1 h-10 rounded border border-legend-wenge bg-legend-deep px-3 text-legend-gold"
                />
              </div>
              <button
                onClick={createNewPromoCode}
                className="w-full h-10 rounded border border-legend-gold bg-legend-gold/20 text-legend-gold font-bold"
              >
                Создать промокод
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {promoCodes.map((promo) => (
            <div key={promo.code} className="card-premium flex items-center justify-between">
              <div>
                <p className="font-mono text-sm font-bold text-legend-gold">{promo.code}</p>
                <p className="text-xs text-legend-light/60">
                  {promo.bonusAmount} ₽ • {promo.usedCount}/{promo.maxUses} • 
                  {promo.isActive ? 'Активен' : 'Неактивен'}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => togglePromoCode(promo.code, promo.isActive)}
                  className={`rounded border px-2 py-1 text-xs ${
                    promo.isActive 
                      ? 'border-red-700/50 bg-red-900/20 text-red-400' 
                      : 'border-green-700/50 bg-green-900/20 text-green-400'
                  }`}
                >
                  {promo.isActive ? 'Выкл' : 'Вкл'}
                </button>
                <button
                  onClick={() => removePromoCode(promo.code)}
                  className="rounded border border-red-700/50 bg-red-900/20 px-2 py-1 text-xs text-red-400"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Поиск по имени, ID или телефону..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full card-premium bg-legend-black border border-legend-wenge px-4 py-3 text-legend-light rounded outline-none focus:border-legend-gold"
          />
          <input
            type="text"
            placeholder="Поиск по номеру карты (0000-9999)..."
            value={cardSearchQuery}
            onChange={(e) => setCardSearchQuery(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className="w-full card-premium bg-legend-black border border-legend-wenge px-4 py-3 text-legend-light rounded outline-none focus:border-legend-gold font-mono"
            maxLength={4}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {['all', 'active', 'blocked', 'pending'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 min-w-0 py-2 text-xs rounded border transition-all ${
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

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-legend-light/60">Сортировка:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-legend-deep border border-legend-wenge rounded px-2 py-1 text-xs text-legend-light"
          >
            <option value="name">По имени</option>
            <option value="id">По ID</option>
            <option value="referrals">По рефералам</option>
            <option value="bonus">По бонусам</option>
            <option value="joined">По дате регистрации</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="rounded border border-legend-wenge px-2 py-1 text-xs text-legend-light/60 hover:border-legend-gold"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-legend-gold text-sm font-bold uppercase">
            Пользователи ({filteredUsers.length}) • Страница {currentPage} из {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSearchQuery('')
                setCardSearchQuery('')
                setFilter('all')
                setSortBy('name')
                setSortOrder('asc')
                setCurrentPage(1)
              }}
              className="rounded border border-legend-wenge px-2 py-1 text-xs text-legend-light/60 hover:border-legend-gold"
            >
              Сбросить фильтры
            </button>
          </div>
        </div>
        
        {paginatedUsers.map((userData) => (
          <div
            key={userData.id}
            className={`card-premium transition-all ${
              userData.status === 'blocked' ? 'border-red-900/50 bg-red-900/10' : ''
            } ${String(selectedUserId) === String(userData.id) ? 'border-legend-gold ring-1 ring-legend-gold/30' : ''}`}
          >
            {/* User Header - Clickable */}
            <div
              onClick={() =>
                setSelectedUserId(String(selectedUserId) === String(userData.id) ? null : String(userData.id))
              }
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
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
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-legend-light truncate">{userData.name || 'Без имени'}</p>
                    <p className="text-xs text-legend-light/40">ID: {userData.id}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {userData.phone && (
                        <span className="text-xs text-legend-gold">📱 {userData.phone}</span>
                      )}
                      <span className="text-xs text-legend-light/60 font-mono">
                        💳 {userData.cardNumber || defaultCardNumberFromUserId(userData.id)}
                      </span>
                    </div>
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
                  <div className="flex items-center gap-2 mt-1 text-xs text-legend-light/60">
                    <span>👥 {userData.referrals || 0}</span>
                    <span>💰 {(userData.bonusBalance || 0).toLocaleString('ru-RU')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions - Always visible */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-legend-wenge/30">
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    addReferral(userData.id)
                  }}
                  className="rounded border border-green-700/50 bg-green-900/20 px-2 py-1 text-xs text-green-400 hover:bg-green-900/30"
                  title="Добавить реферала"
                >
                  +👥
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeReferral(userData.id)
                  }}
                  className="rounded border border-red-700/50 bg-red-900/20 px-2 py-1 text-xs text-red-400 hover:bg-red-900/30"
                  title="Убрать реферала"
                >
                  -👥
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    applyBonusDelta(userData.id, 100)
                  }}
                  className="rounded border border-legend-gold/50 bg-legend-gold/10 px-2 py-1 text-xs text-legend-gold hover:bg-legend-gold/20"
                  title="+100 ₽ бонусов"
                >
                  +💰
                </button>
              </div>
              
              <div className="flex gap-1">
                {userData.status === 'blocked' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      unblockUser(userData.id)
                    }}
                    className="rounded border border-green-700/50 bg-green-900/20 px-3 py-1 text-xs text-green-400"
                  >
                    Разблокировать
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      const reason = prompt('Причина блокировки:')
                      if (reason) blockUser(userData.id, reason)
                    }}
                    className="rounded border border-red-700/50 bg-red-900/20 px-3 py-1 text-xs text-red-400"
                  >
                    Заблокировать
                  </button>
                )}
              </div>
            </div>

            {/* Expanded Details */}
            {String(selectedUserId) === String(userData.id) && (
              <div className="mt-4 pt-4 border-t border-legend-wenge/50 space-y-4">
                <p className="text-xs text-legend-light/60">
                  Регистрация: {userData.joinedAt || 'Неизвестно'} · 
                  Бонус: {(Number(userData.bonusBalance) || 0).toLocaleString('ru-RU')} ₽
                </p>
              </div>
            )}

            {/* Expanded Actions */}
            {String(selectedUserId) === String(userData.id) && (
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

                <div className="space-y-2 border-t border-legend-wenge/30 pt-3">
                  <p className="text-xs font-bold text-legend-gold">Номер карты (0000–9999)</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      value={cardInput}
                      onChange={(e) => {
                        e.stopPropagation()
                        setCardInput(e.target.value.replace(/\D/g, '').slice(0, 4))
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="h-10 w-24 bg-legend-deep border border-legend-wenge rounded px-2 text-center font-mono text-legend-gold font-bold tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={(e) => saveCardNumber(e, userData.id)}
                      className="flex-1 h-10 rounded border border-legend-gold bg-legend-gold/15 text-sm text-legend-gold"
                    >
                      Сохранить карту
                    </button>
                  </div>
                  <p className="text-xs text-legend-light/50">
                    Текущий бонус:{' '}
                    <span className="font-mono text-legend-gold">
                      {(Number(userData.bonusBalance) || 0).toLocaleString('ru-RU')} ₽
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        applyBonusDelta(userData.id, 100)
                      }}
                      className="rounded border border-green-700/50 bg-green-900/20 px-2 py-1.5 text-xs text-green-400"
                    >
                      +100 ₽
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        applyBonusDelta(userData.id, 500)
                      }}
                      className="rounded border border-green-700/50 bg-green-900/20 px-2 py-1.5 text-xs text-green-400"
                    >
                      +500 ₽
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        applyBonusDelta(userData.id, -100)
                      }}
                      className="rounded border border-red-700/50 bg-red-900/20 px-2 py-1.5 text-xs text-red-400"
                    >
                      −100 ₽
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        applyBonusDelta(userData.id, -500)
                      }}
                      className="rounded border border-red-700/50 bg-red-900/20 px-2 py-1.5 text-xs text-red-400"
                    >
                      −500 ₽
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="Сумма ±"
                      value={bonusInput}
                      onChange={(e) => {
                        e.stopPropagation()
                        setBonusInput(e.target.value)
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="min-w-0 flex-1 h-10 rounded border border-legend-wenge bg-legend-deep px-2 text-sm text-legend-gold"
                    />
                    <button
                      type="button"
                      onClick={(e) => applyBonusFromField(e, userData.id)}
                      className="h-10 shrink-0 rounded border border-legend-brass bg-legend-brass/20 px-3 text-xs text-legend-brass"
                    >
                      Применить
                    </button>
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
                        onClick={async (e) => {
                          e.stopPropagation()
                          if (confirm('Удалить пользователя?')) {
                            const success = await deleteUserFromFirebase(userData.id)
                            if (success) {
                              setUsers((prev) => prev.filter((u) => u.id !== userData.id))
                              setSelectedUserId(null)
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

                <div className="space-y-2 border-t border-legend-wenge/30 pt-3">
                  <p className="text-xs font-bold text-legend-gold">Уведомления</p>
                  <p className="text-xs text-legend-light/50">
                    Сообщения:{' '}
                    {userData.notificationsEnabled === false ? (
                      <span className="text-red-400">выключены</span>
                    ) : (
                      <span className="text-green-400">включены</span>
                    )}
                  </p>
                </div>

                {/* Send Message */}
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation()
                    const message = prompt('Текст сообщения пользователю в Telegram:')
                    if (!message || !message.trim()) return
                    if (!initData) {
                      showAlert('Нет подписи Telegram (initData). Откройте мини-приложение из бота, не из обычного браузера.')
                      return
                    }
                    try {
                      const res = await fetch('/api/send-notification', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          initData,
                          targetUserId: String(userData.id),
                          message: message.trim(),
                        }),
                      })
                      const data = await res.json().catch(() => ({}))
                      if (res.status === 409) {
                        showAlert(data.message || 'У пользователя выключены уведомления.')
                        return
                      }
                      if (!res.ok) {
                        showAlert(data.error || `Ошибка ${res.status}`)
                        return
                      }
                      showAlert('✓ Сообщение отправлено в Telegram')
                    } catch (err) {
                      showAlert('Сеть: ' + (err?.message || String(err)))
                    }
                  }}
                  className="w-full rounded border border-legend-brass bg-legend-brass/20 py-2 text-sm text-legend-brass"
                >
                  📨 Отправить в Telegram
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-4">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded border border-legend-wenge text-legend-light/60 disabled:opacity-50 disabled:cursor-not-allowed hover:border-legend-gold"
          >
            ‹ Пред
          </button>
          
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
              if (pageNum > totalPages) return null
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 rounded border ${
                    currentPage === pageNum
                      ? 'bg-legend-gold/20 border-legend-gold text-legend-gold'
                      : 'border-legend-wenge text-legend-light/60 hover:border-legend-gold'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded border border-legend-wenge text-legend-light/60 disabled:opacity-50 disabled:cursor-not-allowed hover:border-legend-gold"
          >
            След ›
          </button>
        </div>
      )}

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
