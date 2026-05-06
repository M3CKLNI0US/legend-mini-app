import React, { useEffect, useState } from 'react'
import { useTelegramApp } from './hooks/useTelegramApp'
import Header from './components/Header'
import Profile from './components/Profile'
import ReferralSystem from './components/ReferralSystem'
import Booking from './components/Booking'
import Settings from './components/Settings'
import MainButton from './components/MainButton'
import BottomNavigation from './components/BottomNavigation'
import './App.css'

export default function App() {
  const { user, isReady } = useTelegramApp()
  const [currentPage, setCurrentPage] = useState('profile')
  const [userLevel, setUserLevel] = useState('newbie') // newbie, guardian, elder, legend
  const [referralCount, setReferralCount] = useState(0)

  useEffect(() => {
    if (user && user.id) {
      // Здесь можно загрузить данные пользователя с сервера
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
      </div>

      {/* Main Button */}
      <MainButton currentPage={currentPage} />

      {/* Bottom Navigation */}
      <BottomNavigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  )
}
