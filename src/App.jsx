import React, { useEffect, useState } from 'react'
import { useTelegramApp } from './hooks/useTelegramApp'
import { getUserFromFirebase } from './firebase'
import { PreferencesProvider, usePreferences } from './context/PreferencesContext'
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

function AppShell({ tg }) {
  const { user, isReady } = tg
  const { themeEffective, t } = usePreferences()
  const [currentPage, setCurrentPage] = useState('profile')
  const [userLevel, setUserLevel] = useState('newbie')
  const [referralCount, setReferralCount] = useState(0)
  const [userStatus, setUserStatus] = useState('active')
  const [blockReason, setBlockReason] = useState(null)

  useEffect(() => {
    const storedCount = localStorage.getItem('legend_referral_count')
    if (storedCount) {
      setReferralCount(parseInt(storedCount, 10))
    }
  }, [])

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
  }, [referralCount])

  useEffect(() => {
    const checkUserStatus = async () => {
      if (user?.id) {
        const userData = await getUserFromFirebase(user.id)
        if (userData) {
          setUserStatus(userData.status || 'active')
          setBlockReason(userData.blockReason || null)
          setUserLevel(userData.level || 'newbie')
        }
      }
    }
    checkUserStatus()
  }, [user])

  if (userStatus === 'blocked') {
    return (
      <div
        className={`app-surface flex min-h-screen items-center justify-center p-4 ${themeEffective === 'light' ? 'light-theme' : ''}`}
      >
        <div className="card-premium max-w-md w-full border-red-500/40 bg-red-950/25 text-center shadow-legend-soft">
          <div className="mb-4 text-6xl">🚫</div>
          <h1 className="mb-2 font-serif text-xl font-bold text-red-400">{t('blocked_title')}</h1>
          <p className="mb-4 text-sm text-legend-light/60">{t('blocked_sub')}</p>
          {blockReason && (
            <p className="mb-4 rounded bg-red-900/20 p-2 text-xs text-red-300/80">
              {t('blocked_reason')}: {blockReason}
            </p>
          )}
          <p className="text-xs text-legend-light/40">{t('blocked_support')}</p>
        </div>
      </div>
    )
  }

  if (!isReady) {
    return (
      <div className={`app-surface flex min-h-screen items-center justify-center ${themeEffective === 'light' ? 'light-theme' : ''}`}>
        <div className="text-center">
          <div className="relative mx-auto mb-5 h-16 w-16">
            <div className="absolute inset-0 rounded-full border-2 border-legend-gold/15" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-legend-gold border-r-legend-gold/40" />
            <div className="absolute inset-2 flex items-center justify-center font-serif text-lg text-legend-gold/90">
              ◊
            </div>
          </div>
          <p className="font-serif text-sm tracking-wide text-legend-light/55">{t('loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`app-surface flex h-screen flex-col font-sans text-legend-light ${themeEffective === 'light' ? 'light-theme' : ''}`}
    >
      <Header userLevel={userLevel} />

      <div className="flex-1 overflow-y-auto overscroll-y-contain">
        {currentPage === 'profile' && (
          <Profile user={user} userLevel={userLevel} referralCount={referralCount} />
        )}

        {currentPage === 'referral' && (
          <ReferralSystem referralCount={referralCount} setReferralCount={setReferralCount} />
        )}

        {currentPage === 'booking' && <Booking />}

        {currentPage === 'settings' && <Settings user={user} />}

        {currentPage === 'admin' && <AdminPanel />}
      </div>

      <MainButton currentPage={currentPage} />

      <BottomNavigation
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isAdmin={user?.id?.toString() === ADMIN_ID}
      />
    </div>
  )
}

export default function App() {
  const tg = useTelegramApp()
  return (
    <PreferencesProvider user={tg.user} webApp={tg.webApp}>
      <AppShell tg={tg} />
    </PreferencesProvider>
  )
}
