import { saveReferralToFirebase } from '../firebase'

/**
 * После подтверждения телефона: если вход по реф-ссылке ref_<id>, начисляем реферала один раз.
 */
export async function claimPendingReferral(invitedUserId, invitedDisplayName) {
  const tg = window.Telegram?.WebApp
  const startParam = tg?.initDataUnsafe?.start_param
  if (!startParam || !startParam.startsWith('ref_')) {
    return { claimed: false, reason: 'no_start_param' }
  }
  const referrerId = startParam.replace('ref_', '').trim()
  if (!referrerId || referrerId === String(invitedUserId)) {
    return { claimed: false, reason: 'invalid_referrer' }
  }

  const added = await saveReferralToFirebase(referrerId, {
    id: String(invitedUserId),
    name: invitedDisplayName || 'Участник',
  })

  return added
    ? { claimed: true, referrerId }
    : { claimed: false, reason: 'already_counted_or_error' }
}
