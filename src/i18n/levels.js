/** Уровни клуба — переводы (RU / EN / ZH) */

const META = [
  { id: 'newbie', icon: '◆', bonus: '+10%', requiredReferrals: 0 },
  { id: 'guardian', icon: '◇', bonus: '+15%', requiredReferrals: 5 },
  { id: 'elder', icon: '◆◆', bonus: '+20%', requiredReferrals: 15 },
  { id: 'legend', icon: '◆◆◆', bonus: '∞', requiredReferrals: 30 },
]

const LOCALE = {
  ru: {
    newbie: {
      name: 'Новобранец',
      description: 'скидка на услуги',
      perks: ['Персональный мастер', 'Кофе/чай', 'Приоритет в записи'],
    },
    guardian: {
      name: 'Хранитель Клуба',
      description: 'скидка + VIP статус',
      perks: ['VIP статус', 'Подарочный сертификат', 'Премиум средства', 'Свободная запись'],
    },
    elder: {
      name: 'Старейшина',
      description: 'скидка + привилегии',
      perks: ['Персональные события', 'Консультация эксперта', 'Premium подарки', 'Приватные сеансы'],
    },
    legend: {
      name: 'Легенда',
      description: 'закрытый клуб',
      perks: ['Лайфтайм статус', 'Годовой паспорт', 'Exclusive события', 'Статус в сообществе'],
    },
  },
  en: {
    newbie: {
      name: 'Recruit',
      description: 'service discount',
      perks: ['Personal barber', 'Coffee & tea', 'Booking priority'],
    },
    guardian: {
      name: 'Club Guardian',
      description: 'discount + VIP',
      perks: ['VIP status', 'Gift card', 'Premium products', 'Flexible booking'],
    },
    elder: {
      name: 'Elder',
      description: 'discount + privileges',
      perks: ['Private events', 'Expert consult', 'Premium gifts', 'Private sessions'],
    },
    legend: {
      name: 'Legend',
      description: 'inner circle',
      perks: ['Lifetime status', 'Annual pass', 'Exclusive events', 'Community status'],
    },
  },
  zh: {
    newbie: {
      name: '新兵',
      description: '服务折扣',
      perks: ['专属理发师', '咖啡/茶', '预约优先'],
    },
    guardian: {
      name: '俱乐部守护者',
      description: '折扣 + VIP',
      perks: ['VIP 身份', '礼品卡', '高端护理', '灵活预约'],
    },
    elder: {
      name: '长老',
      description: '折扣 + 特权',
      perks: ['私人活动', '专家咨询', '高级礼品', '私人时段'],
    },
    legend: {
      name: '传奇',
      description: '核心圈子',
      perks: ['终身身份', '年卡', '独家活动', '社群地位'],
    },
  },
}

/**
 * @param {string} lang
 */
export function getLevelTiers(lang) {
  const loc = LOCALE[lang] || LOCALE.ru
  return META.map((m) => ({
    ...m,
    ...loc[m.id],
  }))
}
