import React, { useEffect, useState } from 'react'
import { useTelegramApp } from './hooks/useTelegramApp'
import { getUserFromFirebase } from './firebase'
import Header from './components/Header'
import Profile from './components/Profile'
import ReferralSystem from './components/ReferralSystem'
import Booking from './components/Booking'
import Settings from './components/Settings'
import AdminPanel from './components/AdminPanel'
import MainButton from './components/MainButton'
import BottomNavigation from './components/BottomNavigation'
import './App.css'

const ADMIN_ID = '1100054796'

export default function App() {
  const { user, isReady, showAlert } = useTelegramApp()
  const [currentPage, setCurrentPage] = useState('profile')
  const [userLevel, setUserLevel] = useState('newbie') // newbie, guardian, elder, legend
  const [referralCount, setReferralCount] = useState(0)
  const [userStatus, setUserStatus] = useState('active') // active, blocked, pending
  const [blockReason, setBlockReason] = useState(null)

  // Загрузка данных из localStorage при старте
  useEffect(() => {
    const storedCount = localStorage.getItem('legend_referral_count')
    if (storedCount) {
      setReferralCount(parseInt(storedCount, 10))
    }
  }, [])

  // Обновление уровня при изменении количества рефералов
  useEffect(() => {
    let newLevel = 'newbie'
    if (referralCount >= 30) {
      newLevel = 'legend'
    } else if (referralCount >= 15) {
      newLevel = 'elder'
    } else if (referralCount >= 5) {
      newLevel = 'guardian'
    }
    setUserLevel(newLevel)
    console.log('User level updated:', newLevel, 'Referrals:', referralCount)
  }, [referralCount])

  // Проверка статуса пользователя из Firebase
  useEffect(() => {
    const checkUserStatus = async () => {
      if (user?.id) {
        console.log('User ID:', user.id)
        const userData = await getUserFromFirebase(user.id)
        if (userData) {
          setUserStatus(userData.status || 'active')
          setBlockReason(userData.blockReason || null)
          setUserLevel(userData.level || 'newbie')
          console.log('User status from Firebase:', userData.status)
        }
      }
    }
    checkUserStatus()
  }, [user])

  // Экран блокировки
  if (userStatus === 'blocked') {
    return (
      <div className="min-h-screen bg-legend-deep flex items-center justify-center p-4">
        <div className="card-premium bg-red-900/20 border-red-500/50 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-xl font-serif font-bold text-red-400 mb-2">
            Извините, вы больше не член клуба
          </h1>
          <p className="text-sm text-legend-light/60 mb-4">
            Ваш аккаунт заблокирован администрацией
          </p>
          {blockReason && (
            <p className="text-xs text-red-300/80 bg-red-900/20 rounded p-2 mb-4">
              Причина: {blockReason}
            </p>
          )}
          <p className="text-xs text-legend-light/40">
            Если вы считаете это ошибкой, обратитесь в поддержку
          </p>
        </div>
      </div>
    )
  }

  if (!isReady) {
    return (
      <div className="min-h-screen bg-legend-deep flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-legend-gold/20 border-t-legend-gold rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-legend-light/60 font-serif">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-legend-black text-legend-light">
      {/* Header */}
      <Header userLevel={userLevel} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {currentPage === 'profile' && (
          <Profile 
            user={user} 
            userLevel={userLevel} 
            referralCount={referralCount}
          />
        )}

        {currentPage === 'referral' && (
          <ReferralSystem 
            referralCount={referralCount}
            setReferralCount={setReferralCount}
          />
        )}

        {currentPage === 'booking' && (
          <Booking />
        )}

        {currentPage === 'settings' && (
          <Settings user={user} />
        )}

        {currentPage === 'admin' && (
          <AdminPanel />
        )}
      </div>

      {/* Main Button */}
      <MainButton currentPage={currentPage} />

      {/* Bottom Navigation */}
      <BottomNavigation 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        isAdmin={user?.id?.toString() === ADMIN_ID}
      />
    </div>
  )
}
