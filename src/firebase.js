// Firebase configuration - replace with your Firebase project credentials
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, get, update, remove, onValue } from 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyDHDKijG-BThjvlk5zdha3qZwL3wQRUfHM',
  authDomain: 'legendproject-5baa7.firebaseapp.com',
  databaseURL: 'https://legendproject-5baa7-default-rtdb.firebaseio.com',
  projectId: 'legendproject-5baa7',
  storageBucket: 'legendproject-5baa7.firebasestorage.app',
  messagingSenderId: '110465083550',
  appId: '1:110465083550:web:d808ca848d980e07ee738f',
}

const app = initializeApp(firebaseConfig)
export const database = getDatabase(app)

export function defaultCardNumberFromUserId(userId) {
  const s = String(userId).replace(/\D/g, '')
  const last4 = parseInt((s.slice(-4) || '0'), 10) || 0
  return String(last4 % 10000).padStart(4, '0')
}

/** Строго 4 цифры 0000–9999 */
export function parseCardNumberInput(raw) {
  const d = String(raw ?? '').replace(/\D/g, '').slice(-4).padStart(4, '0')
  if (!/^\d{4}$/.test(d)) return null
  return d
}

/** Полная перезапись узла пользователя с объединением с уже сохранёнными полями */
export const saveUserToFirebase = async (userData) => {
  try {
    const id = userData.id
    const snap = await get(ref(database, `users/${id}`))
    const existing = snap.exists() ? snap.val() : {}
    const merged = {
      ...existing,
      ...userData,
      id,
      lastVisit: new Date().toISOString(),
    }
    if (merged.notificationsEnabled === undefined && existing.notificationsEnabled === undefined) {
      merged.notificationsEnabled = true
    }
    if (merged.smsNotifications === undefined && existing.smsNotifications === undefined) {
      merged.smsNotifications = false
    }
    if (merged.cardNumber == null || String(merged.cardNumber).trim() === '') {
      merged.cardNumber = existing.cardNumber || defaultCardNumberFromUserId(id)
    } else if (typeof merged.cardNumber === 'string') {
      const parsed = parseCardNumberInput(merged.cardNumber)
      if (parsed) merged.cardNumber = parsed
      else merged.cardNumber = existing.cardNumber || defaultCardNumberFromUserId(id)
    }
    if (merged.bonusBalance == null || merged.bonusBalance === '' || Number.isNaN(Number(merged.bonusBalance))) {
      merged.bonusBalance = typeof existing.bonusBalance === 'number' ? existing.bonusBalance : 0
    } else {
      merged.bonusBalance = Math.max(0, Math.round(Number(merged.bonusBalance) * 100) / 100)
    }
    await set(ref(database, `users/${id}`), merged)
    return true
  } catch (error) {
    console.error('Error saving user:', error)
    return false
  }
}

export const getUserFromFirebase = async (userId) => {
  try {
    const snapshot = await get(ref(database, `users/${userId}`))
    if (snapshot.exists()) {
      return snapshot.val()
    }
    return null
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

export const getAllUsersFromFirebase = async () => {
  try {
    const snapshot = await get(ref(database, 'users'))
    if (snapshot.exists()) {
      const users = snapshot.val()
      return Object.keys(users).map((key) => ({
        id: key,
        ...users[key],
      }))
    }
    return []
  } catch (error) {
    console.error('Error getting users:', error)
    return []
  }
}

export const updateUserInFirebase = async (userId, updates) => {
  try {
    await update(ref(database, `users/${userId}`), updates)
    return true
  } catch (error) {
    console.error('Error updating user:', error)
    return false
  }
}

export const deleteUserFromFirebase = async (userId) => {
  try {
    await remove(ref(database, `users/${userId}`))
    try {
      await remove(ref(database, `phones/${userId}`))
    } catch {
      /* ignore */
    }
    return true
  } catch (error) {
    console.error('Error deleting user:', error)
    return false
  }
}

export const savePhoneToFirebase = async (userId, phone) => {
  try {
    await set(ref(database, `phones/${userId}`), {
      phone,
      verifiedAt: new Date().toISOString(),
    })
    await update(ref(database, `users/${userId}`), {
      phoneVerified: true,
      phone,
      phoneVerifiedAt: new Date().toISOString(),
    })
    return true
  } catch (error) {
    console.error('Error saving phone:', error)
    return false
  }
}

export const clearPhoneVerificationInFirebase = async (userId) => {
  try {
    await remove(ref(database, `phones/${userId}`))
    await update(ref(database, `users/${userId}`), {
      phoneVerified: false,
      phone: null,
      phoneVerifiedAt: null,
    })
    return true
  } catch (error) {
    console.error('Error clearing phone:', error)
    return false
  }
}

export const getPhoneFromFirebase = async (userId) => {
  try {
    const snapshot = await get(ref(database, `phones/${userId}`))
    if (snapshot.exists()) {
      return snapshot.val().phone
    }
    const u = await getUserFromFirebase(userId)
    return u?.phone || null
  } catch (error) {
    console.error('Error getting phone:', error)
    return null
  }
}

export const saveReferralToFirebase = async (referrerId, referralData) => {
  try {
    const refereeKey = String(referralData.id)
    const dup = await get(ref(database, `referrals/${referrerId}/${refereeKey}`))
    if (dup.exists()) {
      return false
    }
    const referralRef = ref(database, `referrals/${referrerId}/${refereeKey}`)
    await set(referralRef, {
      ...referralData,
      date: new Date().toISOString(),
    })

    const userRef = ref(database, `users/${referrerId}`)
    const snapshot = await get(userRef)
    if (snapshot.exists()) {
      const currentCount = snapshot.val().referrals || 0
      await update(userRef, { referrals: currentCount + 1 })
    }
    return true
  } catch (error) {
    console.error('Error saving referral:', error)
    return false
  }
}

export const getReferralsFromFirebase = async (userId) => {
  try {
    const snapshot = await get(ref(database, `referrals/${userId}`))
    if (snapshot.exists()) {
      const referrals = snapshot.val()
      return Object.keys(referrals).map((key) => referrals[key])
    }
    return []
  } catch (error) {
    console.error('Error getting referrals:', error)
    return []
  }
}

export const subscribeToUsers = (callback) => {
  const usersRef = ref(database, 'users')
  return onValue(usersRef, (snapshot) => {
    if (snapshot.exists()) {
      const users = snapshot.val()
      const usersArray = Object.keys(users).map((key) => ({
        id: key,
        ...users[key],
      }))
      callback(usersArray)
    } else {
      callback([])
    }
  })
}

export const subscribeToUser = (userId, callback) => {
  const userRef = ref(database, `users/${userId}`)
  return onValue(userRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: userId, ...snapshot.val() })
    } else {
      callback(null)
    }
  })
}

// Промокоды
export const createPromoCode = async (promoData) => {
  try {
    const code = promoData.code.toUpperCase()
    const promoRef = ref(database, `promoCodes/${code}`)
    const existing = await get(promoRef)
    if (existing.exists()) {
      return false // Код уже существует
    }
    await set(promoRef, {
      ...promoData,
      code,
      createdAt: new Date().toISOString(),
      usedCount: 0,
      isActive: true,
    })
    return true
  } catch (error) {
    console.error('Error creating promo code:', error)
    return false
  }
}

export const getPromoCode = async (code) => {
  try {
    const promoRef = ref(database, `promoCodes/${code.toUpperCase()}`)
    const snapshot = await get(promoRef)
    if (snapshot.exists()) {
      return snapshot.val()
    }
    return null
  } catch (error) {
    console.error('Error getting promo code:', error)
    return null
  }
}

export const usePromoCode = async (userId, code) => {
  try {
    const promo = await getPromoCode(code)
    if (!promo || !promo.isActive) {
      return { success: false, reason: 'invalid_code' }
    }

    if (promo.usedCount >= promo.maxUses) {
      return { success: false, reason: 'max_uses_reached' }
    }

    // Проверяем, не использовал ли пользователь этот промокод
    const userRef = ref(database, `users/${userId}`)
    const userSnapshot = await get(userRef)
    const userData = userSnapshot.val() || {}
    const usedCodes = userData.usedPromoCodes || []

    if (usedCodes.includes(code.toUpperCase())) {
      return { success: false, reason: 'already_used' }
    }

    // Применяем промокод
    const currentBonus = userData.bonusBalance || 0
    const newBonus = currentBonus + promo.bonusAmount

    // Обновляем пользователя
    await update(userRef, {
      bonusBalance: newBonus,
      usedPromoCodes: [...usedCodes, code.toUpperCase()],
      lastPromoUsed: new Date().toISOString(),
    })

    // Обновляем промокод
    const promoRef = ref(database, `promoCodes/${code.toUpperCase()}`)
    await update(promoRef, {
      usedCount: promo.usedCount + 1,
    })

    return { success: true, bonusAmount: promo.bonusAmount }
  } catch (error) {
    console.error('Error using promo code:', error)
    return { success: false, reason: 'error' }
  }
}

export const getAllPromoCodes = async () => {
  try {
    const promoRef = ref(database, 'promoCodes')
    const snapshot = await get(promoRef)
    if (snapshot.exists()) {
      return Object.values(snapshot.val())
    }
    return []
  } catch (error) {
    console.error('Error getting promo codes:', error)
    return []
  }
}

export const updatePromoCode = async (code, updates) => {
  try {
    const promoRef = ref(database, `promoCodes/${code.toUpperCase()}`)
    await update(promoRef, updates)
    return true
  } catch (error) {
    console.error('Error updating promo code:', error)
    return false
  }
}

export const deletePromoCode = async (code) => {
  try {
    const promoRef = ref(database, `promoCodes/${code.toUpperCase()}`)
    await remove(promoRef)
    return true
  } catch (error) {
    console.error('Error deleting promo code:', error)
    return false
  }
}

export default app
