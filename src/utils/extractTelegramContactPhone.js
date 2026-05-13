/**
 * Telegram WebApp requestContact отдаёт контакт по-разному на разных клиентах.
 */
export function extractPhoneFromContactPayload(sent, raw) {
  if (sent != true && sent != 'sent') return null

  const stack = [raw, raw?.response, raw?.responseUnsafe, raw?.contact, raw?.response?.contact]
  for (const obj of stack) {
    const phone = findPhoneNumberField(obj)
    if (phone) {
      const normalized = normalizeRussianPhone(phone)
      if (normalized) return normalized
    }
  }
  return null
}

function findPhoneNumberField(value, depth = 0) {
  if (!value || depth > 8) return null
  if (typeof value === 'string' && /^\+?[78]/.test(value.trim()) && /\d{10,}/.test(value)) {
    return value.trim()
  }
  if (typeof value !== 'object') return null
  if (typeof value.phone_number === 'string' && value.phone_number.length >= 5) {
    return value.phone_number
  }
  for (const k of Object.keys(value)) {
    const found = findPhoneNumberField(value[k], depth + 1)
    if (found) return found
  }
  return null
}

export function normalizeRussianPhone(phone) {
  if (!phone || typeof phone !== 'string') return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
    const rest = digits.startsWith('8') ? digits.slice(1) : digits.slice(1)
    return '+7' + rest
  }
  if (digits.length === 10) {
    return '+7' + digits
  }
  return null
}

export function isRussianPhoneDigits(phone) {
  return !!normalizeRussianPhone(phone)
}
