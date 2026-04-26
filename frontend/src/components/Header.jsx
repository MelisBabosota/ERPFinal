import { Search, Bell, Menu, User, X, CheckCircle, AlertTriangle, Info, Clock } from "lucide-react"
import { useState, useRef, useEffect } from "react"

const notifications = [
  { id: 1, title: "Pedido PED-001 aprobado", message: "El pedido de Juan Pérez ha sido aprobado", time: "Hace 5 min", type: "success", read: false },
  { id: 2, title: "Stock bajo: Producto A", message: "Quedan solo 5 unidades en inventario", time: "Hace 30 min", type: "warning", read: false },
  { id: 3, title: "Nueva factura vencida", message: "La factura FAC-2025-004 está vencida", time: "Hace 2 horas", type: "danger", read: true },
  { id: 4, title: "Actualización de sistema", message: "Nueva versión disponible", time: "Hace 1 día", type: "info", read: true },
]

const notificationIcons = {
  success: CheckCircle,
  warning: AlertTriangle,
  danger: AlertTriangle,
  info: Info,
}

const notificationColors = {
  success: "text-erp-success bg-erp-success/10",
  warning: "text-erp-warning bg-erp-warning/10",
  danger: "text-erp-danger bg-erp-danger/10",
  info: "text-erp-info bg-erp-info/10",
}

export default function Header({ title, onMenuClick }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifList, setNotifList] = useState(notifications)
  const notifRef = useRef(null)

  const unreadCount = notifList.filter(n => !n.read).length

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const markAsRead = (id) => {
    setNotifList(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllAsRead = () => {
    setNotifList(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <header className="sticky top-0 z-30 bg-erp-bg/95 backdrop-blur-sm border-b border-erp-border">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
        {/* Lado izquierdo - Título y botón de menú */}
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-erp-text-secondary hover:text-erp-text hover:bg-erp-card rounded-erp-sm transition-colors"
          >
            <Menu size={20} />
          </button>
          <h2 className="text-lg md:text-xl font-semibold text-erp-text truncate max-w-[150px] sm:max-w-none">
            {title}
          </h2>
        </div>

        {/* Lado derecho - Búsqueda y usuario */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Botón de búsqueda móvil */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="md:hidden p-2 text-erp-text-secondary hover:text-erp-text hover:bg-erp-card rounded-erp-sm transition-colors"
          >
            {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
          </button>

          {/* Barra de búsqueda - Escritorio */}
          <div className="hidden md:flex items-center relative">
            <Search className="absolute left-3 text-erp-text-muted" size={18} />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 pr-4 py-2 w-48 lg:w-64 bg-erp-card border-erp-border"
            />
          </div>

          {/* Campo de búsqueda móvil (visible en móviles) */}
          {mobileSearchOpen && (
            <div className="absolute top-full left-0 right-0 p-4 bg-erp-sidebar border-b border-erp-border md:hidden animate-fadeIn">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-erp-text-muted" size={18} />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 w-full"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Notificaciones */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 text-erp-text-secondary hover:text-erp-text hover:bg-erp-card rounded-erp-sm transition-colors"
            >
              <Bell size={18} md:size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-erp-danger rounded-full"></span>
              )}
            </button>

            {/* Panel de notificaciones */}
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-erp-card border border-erp-border rounded-erp-md shadow-erp-lg z-50 animate-fadeIn">
                <div className="flex items-center justify-between p-4 border-b border-erp-border">
                  <h3 className="font-semibold text-erp-text">Notificaciones</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-erp-gold hover:text-erp-gold-hover"
                    >
                      Marcar todas como leídas
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifList.length === 0 ? (
                    <div className="p-8 text-center text-erp-text-secondary">
                      <Bell size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No hay notificaciones</p>
                    </div>
                  ) : (
                    notifList.map((notif) => {
                      const Icon = notificationIcons[notif.type]
                      return (
                        <div
                          key={notif.id}
                          onClick={() => markAsRead(notif.id)}
                          className={`flex items-start gap-3 p-4 border-b border-erp-border cursor-pointer hover:bg-erp-bg transition-colors ${
                            !notif.read ? "bg-erp-gold/5" : ""
                          }`}
                        >
                          <div className={`p-2 rounded-erp-sm flex-shrink-0 ${notificationColors[notif.type]}`}>
                            <Icon size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm ${!notif.read ? "font-semibold text-erp-text" : "text-erp-text-secondary"}`}>
                                {notif.title}
                              </p>
                              {!notif.read && (
                                <span className="w-2 h-2 bg-erp-gold rounded-full flex-shrink-0 mt-1"></span>
                              )}
                            </div>
                            <p className="text-xs text-erp-text-muted mt-1">{notif.message}</p>
                            <div className="flex items-center gap-1 mt-2">
                              <Clock size={12} className="text-erp-text-muted" />
                              <span className="text-xs text-erp-text-muted">{notif.time}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Avatar de usuario */}
          <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-erp-border">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-erp-text">Carlos Méndez</p>
              <p className="text-xs text-erp-text-muted">Administrador</p>
            </div>
            <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-erp-gold/20 border-2 border-erp-gold flex items-center justify-center">
              <User size={16} md:size={20} className="text-erp-gold" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

