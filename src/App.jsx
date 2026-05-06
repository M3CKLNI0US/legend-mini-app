import React, { useEffect, useState } from 'react'
import { useTelegramApp } from './hooks/useTelegramApp'
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
  const { user, isReady } = useTelegramApp()
  const [currentPage, setCurrentPage] = useState('profile')
  const [userLevel, setUserLevel] = useState('newbie') // newbie, guardian, elder, legend
  const [referralCount, setReferralCount] = useState(0)

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

  useEffect(() => {
    if (user && user.id) {
      console.log('User ID:', user.id)
    }
  }, [user])

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-legend-black">
        <div className="text-center">
          <div className="text-legend-gold text-4xl font-serif mb-4">◊</div>
          <p className="text-legend-light text-sm">Загрузка ЛЕГЕНДЫ...</p>
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
