import React from 'react'

export default function Booking() {
  return (
    <div className="p-4 pb-32 space-y-6 animate-fade-in h-full">
      {/* Header */}
      <div className="card-premium bg-gradient-to-r from-legend-brass/20 to-legend-gold/20 border-legend-gold">
        <p className="text-center text-lg font-serif font-bold text-legend-gold">Онлайн-запись</p>
        <p className="text-center text-xs text-legend-light/60 mt-2">Официальная система YClients</p>
      </div>

      {/* YClients Official Widget */}
      <div className="card-premium border-legend-wenge/50 p-0 overflow-hidden flex-1" style={{ minHeight: '70vh' }}>
        <iframe
          title="yclients-official"
          src="https://n2046570.yclients.com/company/1794570/personal/menu?o="
          width="100%"
          height="100%"
          style={{ border: 'none', minHeight: '600px' }}
          className="w-full"
        />
      </div>

      {/* Contact Info */}
      <div className="card-premium bg-legend-wenge/20 border-legend-brass/50 space-y-2">
        <p className="text-xs text-legend-light/70 text-center">
          <strong>Телефон:</strong> <a href="tel:+79001234567" className="text-legend-gold">+7 (900) 123-45-67</a>
        </p>
        <p className="text-xs text-legend-light/70 text-center">
          <strong>Адрес:</strong> г. Москва, ул. Легендарная, 1
        </p>
        <p className="text-xs text-legend-light/40 text-center mt-2">
          При возникновении проблем с записью — позвоните нам
        </p>
      </div>
    </div>
  )
}
