import React, { useState } from 'react'
import { useTelegramApp } from '../hooks/useTelegramApp'

export default function Booking() {
  const { showAlert } = useTelegramApp()
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedBarber, setSelectedBarber] = useState('')

  const barbers = [
    { id: 1, name: 'Максим', specialty: 'Классический стиль', available: true },
    { id: 2, name: 'Виктор', specialty: 'Модные срезы', available: true },
    { id: 3, name: 'Сергей', specialty: 'Борода & Шейв', available: false },
  ]

  const times = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']

  const handleBooking = () => {
    if (!selectedDate || !selectedTime || !selectedBarber) {
      showAlert('Заполни все поля')
      return
    }
    showAlert(`✓ Запись создана на ${selectedDate} в ${selectedTime}`)
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
        className="w-full card-premium bg-gradient-to-r from-legend-brass/20 to-legend-gold/20 border border-legend-gold pressable hover:shadow-[0_0_30px_rgba(198,169,107,0.4)]"
      >
        <p className="text-center text-lg font-serif font-bold text-legend-gold">Подтвердить запись</p>
      </button>

      {/* YClients iframe (optional) */}
      <div className="card-premium border-legend-wenge/50 p-0 overflow-hidden">
        <p className="px-4 pt-4 text-sm text-legend-light/60">Или выбери через календарь</p>
        <iframe
          title="yclients-calendar"
          src="https://your-site.yclients.com/schedule"
          width="100%"
          height="400"
          style={{ border: 'none' }}
          className="mt-2"
        />
      </div>
    </div>
  )
}
