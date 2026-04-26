import { useState } from "react"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import { useLocation } from "react-router-dom"

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Títulos de página
  const pageTitles = {
    "/dashboard": "Resumen de operaciones",
    "/ventas": "Ventas y pedidos",
    "/productos": "Inventario",
    "/clientes": "Clientes",
    "/ajustes": "Ajustes del sistema"
  }

  const currentTitle = pageTitles[location.pathname] || "BLACKRAIN ERP"

  return (
    <div className="min-h-screen bg-erp-bg">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="lg:ml-64">
        <Header 
          title={currentTitle} 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

