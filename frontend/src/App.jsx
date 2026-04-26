import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useEffect } from "react"

import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Clientes from "./pages/Clientes"
import Productos from "./pages/Productos"
import Ventas from "./pages/Ventas"
import Ajustes from "./pages/Ajustes"

import DashboardLayout from "./layout/DashboardLayout"
import { ThemeProvider } from "./context/ThemeContext"

function App() {
  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token && window.location.pathname !== "/") {
      window.location.href = "/"
    }
  }, [])

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            }
          />

          <Route
            path="/clientes"
            element={
              <DashboardLayout>
                <Clientes />
              </DashboardLayout>
            }
          />

          <Route
            path="/productos"
            element={
              <DashboardLayout>
                <Productos />
              </DashboardLayout>
            }
          />

          <Route
            path="/ventas"
            element={
              <DashboardLayout>
                <Ventas />
              </DashboardLayout>
            }
          />

          <Route
            path="/ajustes"
            element={
              <DashboardLayout>
                <Ajustes />
              </DashboardLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App

