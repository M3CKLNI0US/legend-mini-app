import React from 'react'

export default function Booking() {
  return (
    <div className="animate-fade-in h-full space-y-6 p-4 pb-36">
      <div className="card-premium border-legend-gold/20 bg-gradient-to-r from-legend-brass/10 to-legend-gold/10">
        <p className="text-center font-serif text-lg font-bold text-legend-gold-bright">Онлайн-запись</p>
        <p className="mt-1 text-center text-[0.7rem] font-medium uppercase tracking-[0.15em] text-legend-light/50">
          Официальная система YClients
        </p>
      </div>

      <div
        className="card-premium flex-1 overflow-hidden border-legend-wenge/60 p-0 ring-1 ring-legend-gold/10"
        style={{ minHeight: '70vh' }}
      >
        <iframe
          title="yclients-official"
          src="https://n2046570.yclients.com/company/1794570/personal/menu?o="
          width="100%"
          height="100%"
          style={{ border: 'none', minHeight: '600px' }}
          className="min-h-[600px] w-full bg-legend-black"
        />
      </div>

      <div className="card-premium space-y-2 border-legend-brass/30 bg-legend-ink/50">
        <p className="text-center text-xs text-legend-light/70">
          <strong>Телефон:</strong>{' '}
          <a href="tel:+79001234567" className="text-legend-gold-bright hover:underline">
            +7 (900) 123-45-67
          </a>
        </p>
        <p className="text-center text-xs text-legend-light/70">
          <strong>Адрес:</strong> г. Москва, ул. Легендарная, 1
        </p>
        <p className="mt-2 text-center text-xs text-legend-light/40">
          При возникновении проблем с записью — позвоните нам
        </p>
      </div>
    </div>
  )
}
