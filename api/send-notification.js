import crypto from 'crypto'

function validateTelegramInitData(initData, botToken) {
  if (!initData || !botToken) return false
  const params = new URLSearchParams(initData)
  const hash = params.get('hash')
  if (!hash) return false
  params.delete('hash')
  const entries = [...params.entries()].sort(([a], [b]) => a.localeCompare(b))
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join('\n')
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest()
  const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')
  return hmac === hash
}

function parseInitDataUser(initData) {
  const params = new URLSearchParams(initData)
  const raw = params.get('user')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

async function getAdminDb() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!raw) return null
  const { initializeApp, cert, getApps } = await import('firebase-admin/app')
  const { getDatabase } = await import('firebase-admin/database')
  if (!getApps().length) {
    initializeApp({
      credential: cert(JSON.parse(raw)),
      databaseURL:
        process.env.FIREBASE_DATABASE_URL ||
        'https://legendproject-5baa7-default-rtdb.firebaseio.com',
    })
  }
  return getDatabase()
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) {
    return res.status(503).json({
      error: 'TELEGRAM_BOT_TOKEN is not set on the server (Vercel → Settings → Environment Variables).',
    })
  }

  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body || '{}')
    } catch {
      body = {}
    }
  }

  const { initData, targetUserId, message } = body || {}
  if (!initData || !targetUserId || !message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing initData, targetUserId or message' })
  }

  if (!validateTelegramInitData(initData, botToken)) {
    return res.status(401).json({ error: 'Invalid initData signature' })
  }

  const caller = parseInitDataUser(initData)
  const adminIds = (process.env.ADMIN_TELEGRAM_IDS || '1100054796')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  if (!caller || !adminIds.includes(String(caller.id))) {
    return res.status(403).json({ error: 'Only administrators can send messages' })
  }

  const db = await getAdminDb()
  if (!db) {
    return res.status(503).json({
      error:
        'FIREBASE_SERVICE_ACCOUNT_JSON is not set. Add a Firebase service account JSON on the server to read user notification settings.',
    })
  }

  const { ref, get } = await import('firebase-admin/database')
  const snap = await get(ref(db, `users/${targetUserId}`))
  const userData = snap.val()

  if (!userData) {
    return res.status(404).json({ error: 'User not found in database' })
  }

  if (userData.notificationsEnabled === false) {
    return res.status(409).json({
      error: 'USER_NOTIFICATIONS_DISABLED',
      message: 'У пользователя отключены уведомления в настройках.',
    })
  }

  const text = `📩 ЛЕГЕНДА\n\n${message.trim()}`

  const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: Number(targetUserId) || targetUserId,
      text,
    }),
  })
  const tgJson = await tgRes.json()

  if (!tgJson.ok) {
    return res.status(502).json({
      error: tgJson.description || 'Telegram sendMessage failed',
      details: tgJson,
    })
  }

  return res.status(200).json({ ok: true })
}
