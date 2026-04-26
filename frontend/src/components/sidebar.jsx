import { Link, useLocation } from "react-router-dom"
import { 
  Home, 
  ShoppingCart, 
  Package, 
  Users, 
  Settings, 
  LogOut,
  ChevronLeft,
  Menu
} from "lucide-react"
import { useState } from "react"

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation()
  
  const menuItems = [
    { path: "/dashboard", label: "Resumen general", icon: Home },
    { path: "/ventas", label: "Ventas y pedidos", icon: ShoppingCart },
    { path: "/productos", label: "Inventario", icon: Package },
    { path: "/clientes", label: "Clientes", icon: Users },
  ]

  const bottomMenuItems = [
    { path: "/ajustes", label: "Ajustes", icon: Settings },
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    localStorage.removeItem("token")
    window.location.href = "/"
  }

  return (
    <>
      {/* Superposición móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Barra lateral */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-erp-sidebar z-50
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logotipo */}
        <div className="p-6 border-b border-erp-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-erp-gold tracking-wider">
                BLACKRAIN
              </h1>
              <p className="text-xs text-erp-text-muted mt-1">
                ERP de gestión empresarial
              </p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-erp-text-secondary hover:text-erp-text"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
        </div>

        {/* Navegación principal */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="mb-6">
            <p className="px-4 text-xs font-semibold text-erp-text-muted uppercase tracking-wider mb-2">
              Menú Principal
            </p>
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sección de ajustes */}
          <div>
            <p className="px-4 text-xs font-semibold text-erp-text-muted uppercase tracking-wider mb-2">
              Configuración
            </p>
            <ul className="space-y-1">
              {bottomMenuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Cerrar sesión */}
        <div className="p-4 border-t border-erp-border">
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-erp-danger hover:bg-erp-danger/10"
          >
            <LogOut size={20} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  )
}

