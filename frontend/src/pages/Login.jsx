import { useState } from "react"
import { login } from "../services/authService"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await login(email, password)
      localStorage.setItem("token", res.token)
      navigate("/dashboard")
    } catch (err) {
      setError(err.response?.data?.message || "Credenciales incorrectas")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-erp-bg flex items-center justify-center p-4">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-erp-gold/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-erp-gold/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-sm sm:max-w-md">
        {/* Tarjeta de inicio de sesión */}
        <div className="card p-6 sm:p-8 animate-fadeIn">
          {/* Logotipo */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-erp-gold tracking-wider">
              BLACKRAIN
            </h1>
            <p className="text-erp-text-muted mt-2 text-sm">
              ERP de gestión empresarial
            </p>
          </div>

          {/* Título */}
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-erp-text">
              Bienvenido de nuevo
            </h2>
            <p className="text-erp-text-secondary text-sm mt-1">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="mb-4 p-3 bg-erp-danger/10 border border-erp-danger/30 rounded-erp-sm text-erp-danger text-sm">
              {error}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Correo electrónico */}
            <div>
              <label className="block text-sm font-medium text-erp-text-secondary mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-erp-text-muted" size={18} />
                <input
                  type="email"
                  placeholder="correo@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10 w-full"
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-erp-text-secondary mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-erp-text-muted" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10 pr-10 w-full"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-erp-text-muted hover:text-erp-text"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Recordar y olvidar */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-erp-border bg-erp-bg text-erp-gold focus:ring-erp-gold focus:ring-offset-erp-bg"
                />
                <span className="text-sm text-erp-text-secondary">Recordarme</span>
              </label>
              <a href="#" className="text-sm text-erp-gold hover:text-erp-gold-hover">
                ¿Olvidé mi contraseña?
              </a>
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>

          {/* Sugerencia de credenciales de demo */}
          <div className="mt-6 p-3 bg-erp-card/50 rounded-erp-sm text-center">
            <p className="text-xs text-erp-text-muted">
              Demo: <span className="text-erp-text-secondary">admin@erp.com</span> / <span className="text-erp-text-secondary">1234</span>
            </p>
          </div>
        </div>

        {/* Pie de página */}
        <p className="text-center text-erp-text-muted text-xs mt-6">
          © 2024 BLACKRAIN ERP. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}

