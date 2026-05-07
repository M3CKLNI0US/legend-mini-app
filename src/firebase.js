// Firebase configuration - replace with your Firebase project credentials
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, get, update, remove, onValue } from 'firebase/database'

// Your Firebase config - get this from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDHDKijG-BThjvlk5zdha3qZwL3wQRUfHM",
  authDomain: "legendproject-5baa7.firebaseapp.com",
  databaseURL: "https://legendproject-5baa7-default-rtdb.firebaseio.com",
  projectId: "legendproject-5baa7",
  storageBucket: "legendproject-5baa7.firebasestorage.app",
  messagingSenderId: "110465083550",
  appId: "1:110465083550:web:d808ca848d980e07ee738f"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const database = getDatabase(app)

// User operations
export const saveUserToFirebase = async (userData) => {
  try {
    await set(ref(database, `users/${userData.id}`), {
      ...userData,
      lastVisit: new Date().toISOString()
    })
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
      return Object.keys(users).map(key => ({
        id: key,
        ...users[key]
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
    return true
  } catch (error) {
    console.error('Error deleting user:', error)
    return false
  }
}

// Phone verification operations
export const savePhoneToFirebase = async (userId, phone) => {
  try {
    await set(ref(database, `phones/${userId}`), {
      phone,
      verifiedAt: new Date().toISOString()
    })
    return true
  } catch (error) {
    console.error('Error saving phone:', error)
    return false
  }
}

export const getPhoneFromFirebase = async (userId) => {
  try {
    const snapshot = await get(ref(database, `phones/${userId}`))
    if (snapshot.exists()) {
      return snapshot.val().phone
    }
    return null
  } catch (error) {
    console.error('Error getting phone:', error)
    return null
  }
}

// Referral operations
export const saveReferralToFirebase = async (referrerId, referralData) => {
  try {
    const referralRef = ref(database, `referrals/${referrerId}/${referralData.id}`)
    await set(referralRef, {
      ...referralData,
      date: new Date().toISOString()
    })
    
    // Update referral count
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
      return Object.keys(referrals).map(key => referrals[key])
    }
    return []
  } catch (error) {
    console.error('Error getting referrals:', error)
    return []
  }
}

// Subscribe to users (real-time)
export const subscribeToUsers = (callback) => {
  const usersRef = ref(database, 'users')
  return onValue(usersRef, (snapshot) => {
    if (snapshot.exists()) {
      const users = snapshot.val()
      const usersArray = Object.keys(users).map(key => ({
        id: key,
        ...users[key]
      }))
      callback(usersArray)
    } else {
      callback([])
    }
  })
}

export default app
