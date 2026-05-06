import React, { useState } from 'react'
import { useTelegramApp } from '../hooks/useTelegramApp'
import { notifyAdminBooking } from '../utils/api'

export default function Booking() {
  const { showAlert, user } = useTelegramApp()
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedBarber, setSelectedBarber] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const barbers = [
    { id: 1, name: 'Максим', specialty: 'Классический стиль', available: true },
    { id: 2, name: 'Виктор', specialty: 'Модные срезы', available: true },
    { id: 3, name: 'Сергей', specialty: 'Борода & Шейв', available: false },
  ]

  const times = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedBarber) {
      showAlert('Заполни все поля')
      return
    }
    
    setIsSubmitting(true)
    
    const barberName = barbers.find(b => b.id === selectedBarber)?.name || 'Неизвестно'
    
    const bookingData = {
      userId: user?.id || 'unknown',
      userName: user?.first_name || 'Гость',
      userUsername: user?.username || '',
      date: selectedDate,
      time: selectedTime,
      barber: barberName,
      barberId: selectedBarber,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    
    // Сохраняем запись в localStorage
    const existing = JSON.parse(localStorage.getItem('legend_bookings') || '[]')
    existing.push(bookingData)
    localStorage.setItem('legend_bookings', JSON.stringify(existing))
    
    // Отправляем уведомление админу
    const notified = await notifyAdminBooking(bookingData)
    
    if (notified) {
      showAlert(`✓ Запись создана! Администратор получил уведомление.`)
    } else {
      showAlert(`✓ Запись сохранена! Админ получит уведомление позже.`)
    }
    
    // Очищаем форму
    setSelectedDate('')
    setSelectedTime('')
    setSelectedBarber('')
    setIsSubmitting(false)
  }

  return (
    <div className="p-4 pb-32 space-y-6 animate-fade-in">
      {/* Header Card */}
      <div className="card-premium bg-gradient-to-r from-legend-brass/20 to-legend-gold/20 border-legend-gold">
        <p className="text-center text-lg font-serif font-bold text-legend-gold">Запись к мастеру</p>
        <p className="text-center text-xs text-legend-light/60 mt-2">Выбери дату, время и специалиста</p>
      </div>

      {/* Select Date */}
      <div className="space-y-2">
        <label className="text-legend-gold text-sm font-bold uppercase">Дата</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full card-premium bg-legend-black border border-legend-wenge px-4 py-3 text-legend-light rounded outline-none focus:border-legend-gold"
        />
      </div>

      {/* Select Time */}
      <div className="space-y-2">
        <label className="text-legend-gold text-sm font-bold uppercase">Время</label>
        <div className="grid grid-cols-3 gap-2">
          {times.map((time) => (
            <button
              key={time}
              onClick={() => setSelectedTime(time)}
              className={`py-2 rounded border transition-all ${
                selectedTime === time
                  ? 'bg-legend-gold text-legend-black border-legend-gold'
                  : 'bg-legend-deep border-legend-wenge text-legend-light hover:border-legend-gold'
              } pressable`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* Select Barber */}
      <div className="space-y-2">
        <label className="text-legend-gold text-sm font-bold uppercase">Мастер</label>
        <div className="space-y-2">
          {barbers.map((barber) => (
            <button
              key={barber.id}
              onClick={() => barber.available && setSelectedBarber(barber.id)}
              disabled={!barber.available}
              className={`w-full card-premium p-4 text-left transition-all pressable ${
                selectedBarber === barber.id
                  ? 'border-legend-gold bg-legend-gold/10'
                  : barber.available
                  ? 'border-legend-wenge hover:border-legend-gold'
                  : 'border-legend-wenge/30 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-legend-light">{barber.name}</p>
                  <p className="text-xs text-legend-light/60">{barber.specialty}</p>
                </div>
                <span className={barber.available ? 'text-legend-gold' : 'text-legend-light/30'}>
                  {barber.available ? '✓' : 'Занят'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="card-premium bg-legend-wenge/20 border-legend-brass/50 space-y-2">
        <p className="text-xs text-legend-light/70">
          <strong>Стоимость:</strong> от 1 500 ₽
        </p>
        <p className="text-xs text-legend-light/70">
          <strong>Длительность:</strong> 45-60 минут
        </p>
        <p className="text-xs text-legend-light/70">
          <strong>Отмена:</strong> до 2 часов без штрафа
        </p>
      </div>

      {/* Confirm Button */}
      <button
        onClick={handleBooking}
        disabled={isSubmitting}
        className={`w-full card-premium bg-gradient-to-r from-legend-brass/20 to-legend-gold/20 border border-legend-gold pressable hover:shadow-[0_0_30px_rgba(198,169,107,0.4)] ${isSubmitting ? 'opacity-60 cursor-wait' : ''}`}
      >
        <p className="text-center text-lg font-serif font-bold text-legend-gold">
          {isSubmitting ? '⏳ Отправка...' : 'Подтвердить запись'}
        </p>
      </button>

      {/* My Bookings */}
      <MyBookings />
    </div>
  )
}

// Компонент для отображения записей пользователя
function MyBookings() {
  const [bookings, setBookings] = useState([])
  const { showAlert } = useTelegramApp()
  
  useEffect(() => {
    const stored = localStorage.getItem('legend_bookings')
    if (stored) {
      setBookings(JSON.parse(stored).reverse())
    }
  }, [])
  
  const cancelBooking = (index) => {
    const stored = JSON.parse(localStorage.getItem('legend_bookings') || '[]')
    stored.splice(index, 1)
    localStorage.setItem('legend_bookings', JSON.stringify(stored))
    setBookings(stored.reverse())
    showAlert('Запись отменена')
  }
  
  if (bookings.length === 0) return null
  
  return (
    <div className="space-y-3">
      <p className="text-legend-gold text-sm font-bold uppercase">Мои записи</p>
      {bookings.slice(0, 3).map((booking, idx) => (
        <div key={idx} className="card-premium border-legend-wenge">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-legend-light">{booking.barber}</p>
              <p className="text-xs text-legend-light/60">{booking.date} в {booking.time}</p>
              <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${
                booking.status === 'pending' ? 'bg-legend-brass/20 text-legend-brass' : 'bg-legend-gold/20 text-legend-gold'
              }`}>
                {booking.status === 'pending' ? '⏳ Ожидание' : '✓ Подтверждено'}
              </span>
            </div>
            <button 
              onClick={() => cancelBooking(idx)}
              className="text-xs text-legend-light/40 hover:text-red-400 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
