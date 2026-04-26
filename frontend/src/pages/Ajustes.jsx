import { useState, useEffect } from "react"
import { Save, Sun, Moon, Monitor, Settings, Palette, RotateCcw, Eye } from "lucide-react"
import { useTheme } from "../context/ThemeContext"

export default function Ajustes() {
  const { settings, saveSettings, previewTheme, cancelPreview, activeTheme } = useTheme()
  const [activeSection, setActiveSection] = useState("general")
  const [localSettings, setLocalSettings] = useState(settings)
  const [companyInfo, setCompanyInfo] = useState({
    nombreComercial: "BLACKRAIN",
    correoContacto: "admin@blackrain.com",
    telefono: "+52 55 1234 5678",
    direccionFiscal: "Av. Principal 123, Ciudad de México"
  })
  const [saved, setSaved] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => { setLocalSettings(settings) }, [settings])

  useEffect(() => {
    const changed =
      localSettings.mode !== settings.mode ||
      localSettings.lightModeDay !== settings.lightModeDay ||
      localSettings.reduceContrast !== settings.reduceContrast ||
      localSettings.syncSystem !== settings.syncSystem
    setHasChanges(changed)
  }, [localSettings, settings])

  useEffect(() => { previewTheme(localSettings) }, [localSettings, previewTheme])

  const handleSaveTheme = () => {
    saveSettings(localSettings)
    setSaved(true)
    setHasChanges(false)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleCancel = () => {
    setLocalSettings(settings)
    cancelPreview()
    setHasChanges(false)
  }

  const handleSaveCompany = (e) => {
    e.preventDefault()
    localStorage.setItem("erp-company-info", JSON.stringify(companyInfo))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const sections = [
    { id: "general", label: "General", icon: Settings },
    { id: "display", label: "Apariencia", icon: Palette },
  ]

  const getBtnStyle = (active) => active
    ? { backgroundColor: "rgba(200, 167, 91, 0.1)", color: "var(--color-gold)" }
    : { color: "var(--color-text-secondary)" }

  const ThemePreview = () => (
    <div className="mt-6 p-4 rounded-erp border border-erp-border bg-erp-bg/50">
      <div className="flex items-center gap-2 mb-3">
        <Eye size={16} className="text-erp-text-muted" />
        <span className="text-sm font-medium text-erp-text">Vista previa</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-erp-sm bg-erp-card border border-erp-border">
          <div className="h-2 w-12 bg-erp-gold rounded-full mb-2" />
          <div className="h-2 w-full bg-erp-border rounded-full mb-1" />
          <div className="h-2 w-3/4 bg-erp-border rounded-full" />
        </div>
        <div className="p-3 rounded-erp-sm bg-erp-sidebar border border-erp-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-3 w-3 rounded-full bg-erp-success" />
            <div className="h-2 w-16 bg-erp-border rounded-full" />
          </div>
          <div className="h-2 w-full bg-erp-border rounded-full mb-1" />
          <div className="h-2 w-1/2 bg-erp-border rounded-full" />
        </div>
      </div>
      <p className="text-xs text-erp-text-muted mt-2">
        Tema activo: <strong className="text-erp-gold capitalize">{activeTheme}</strong>
{localSettings.reduceContrast && " • Bajo contraste"}
        {localSettings.lightModeDay && " • Automático día-noche"}
        {localSettings.syncSystem && " • Sincronizado con sistema"}
      </p>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="card animate-fadeIn">
            <h3 className="text-lg font-semibold text-erp-text mb-4">Configuración</h3>
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-erp-sm transition-colors"
                  style={getBtnStyle(activeSection === section.id)}
                  onMouseEnter={(e) => {
                    if (activeSection !== section.id) {
                      e.currentTarget.style.backgroundColor = "var(--color-card-hover)"
                      e.currentTarget.style.color = "var(--color-text)"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeSection !== section.id) {
                      e.currentTarget.style.backgroundColor = ""
                      e.currentTarget.style.color = "var(--color-text-secondary)"
                    }
                  }}
                >
                  <section.icon size={18} />
                  <span>{section.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {activeSection === "general" && (
            <div className="card animate-fadeIn">
              <h3 className="text-lg font-semibold text-erp-text mb-6">Configuración General</h3>
              <form onSubmit={handleSaveCompany} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-erp-text-secondary mb-2">Nombre comercial</label>
                    <input type="text" value={companyInfo.nombreComercial}
                      onChange={(e) => setCompanyInfo({...companyInfo, nombreComercial: e.target.value})}
                      className="input w-full" />
                  </div>
                  <div>
                    <label className="block text-sm text-erp-text-secondary mb-2">Correo de contacto</label>
                    <input type="email" value={companyInfo.correoContacto}
                      onChange={(e) => setCompanyInfo({...companyInfo, correoContacto: e.target.value})}
                      className="input w-full" />
                  </div>
                  <div>
                    <label className="block text-sm text-erp-text-secondary mb-2">Teléfono</label>
                    <input type="tel" value={companyInfo.telefono}
                      onChange={(e) => setCompanyInfo({...companyInfo, telefono: e.target.value})}
                      className="input w-full" />
                  </div>
                  <div>
                    <label className="block text-sm text-erp-text-secondary mb-2">Dirección fiscal</label>
                    <input type="text" value={companyInfo.direccionFiscal}
                      onChange={(e) => setCompanyInfo({...companyInfo, direccionFiscal: e.target.value})}
                      className="input w-full" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button type="submit" className="btn-primary flex items-center gap-2">
                    <Save size={18} /> Guardar cambios
                  </button>
                  {saved && activeSection === "general" && (
                    <span className="text-erp-success text-sm">¡Cambios guardados!</span>
                  )}
                </div>
              </form>
            </div>
          )}

          {activeSection === "display" && (
            <div className="card animate-fadeIn">
              <h3 className="text-lg font-semibold text-erp-text mb-6">Apariencia</h3>

              <div className="mb-8">
                <h4 className="text-sm font-semibold text-erp-text mb-4">Modo de pantalla</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="cursor-pointer rounded-erp overflow-hidden border-2 border-erp-border hover:border-erp-gold/50 has-[:checked]:border-erp-gold has-[:checked]:ring-2 has-[:checked]:ring-erp-gold/30">
                    <input type="radio" name="displayMode" value="light" className="sr-only"
                      checked={localSettings.mode === "light"}
                      onChange={() => setLocalSettings({ ...localSettings, mode: "light", syncSystem: false })} />
                    <div className="h-28 bg-gray-200 flex items-center justify-center">
                      <Sun size={32} className="text-amber-600" />
                    </div>
                    <div className="p-4 bg-erp-card">
                      <p className="font-medium text-erp-text">Claro</p>
                      <p className="text-sm text-erp-text-muted">Fondo blanco y texto oscuro</p>
                    </div>
                  </label>

                  <label className="cursor-pointer rounded-erp overflow-hidden border-2 border-erp-border hover:border-erp-gold/50 has-[:checked]:border-erp-gold has-[:checked]:ring-2 has-[:checked]:ring-erp-gold/30">
                    <input type="radio" name="displayMode" value="dark" className="sr-only"
                      checked={localSettings.mode === "dark"}
                      onChange={() => setLocalSettings({ ...localSettings, mode: "dark", syncSystem: false })} />
                    <div className="h-28 bg-slate-800 flex items-center justify-center">
                      <Moon size={32} className="text-slate-300" />
                    </div>
                    <div className="p-4 bg-erp-card">
                      <p className="font-medium text-erp-text">Oscuro</p>
                      <p className="text-sm text-erp-text-muted">Fondo oscuro y texto claro</p>
                    </div>
                  </label>

                  <label className="cursor-pointer rounded-erp overflow-hidden border-2 border-erp-border hover:border-erp-gold/50 has-[:checked]:border-erp-gold has-[:checked]:ring-2 has-[:checked]:ring-erp-gold/30">
                    <input type="radio" name="displayMode" value="system" className="sr-only"
                      checked={localSettings.mode === "system"}
                      onChange={() => setLocalSettings({ ...localSettings, mode: "system", syncSystem: false })} />
                    <div className="h-28 bg-gradient-to-r from-gray-200 to-slate-800 flex items-center justify-center">
                      <Monitor size={32} className="text-gray-500" />
                    </div>
                    <div className="p-4 bg-erp-card">
                      <p className="font-medium text-erp-text">Sistema</p>
                      <p className="text-sm text-erp-text-muted">Seguir configuración del equipo</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="border-t border-erp-border pt-6 mb-6">
                <h4 className="text-sm font-semibold text-erp-text mb-4">Opciones adicionales</h4>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-erp-bg rounded-erp-sm cursor-pointer hover:bg-erp-card-hover transition-colors">
                    <div className="flex items-start gap-3">
                      <Sun size={20} className="text-erp-gold mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-erp-text font-medium">Usar modo claro durante el día</p>
                        <p className="text-sm text-erp-text-muted">Cambiar automáticamente según la hora (6:00 - 18:00)</p>
                      </div>
                    </div>
                    <div className="relative flex-shrink-0 ml-4">
                      <input type="checkbox" className="sr-only peer"
                        checked={localSettings.lightModeDay}
                        onChange={(e) => setLocalSettings({ ...localSettings, lightModeDay: e.target.checked, syncSystem: false })} />
                      <div className="w-11 h-6 bg-erp-border rounded-full peer-checked:bg-erp-gold transition-colors"></div>
                      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                    </div>
                  </label>

                  <label className="flex items-center justify-between p-4 bg-erp-bg rounded-erp-sm cursor-pointer hover:bg-erp-card-hover transition-colors">
                    <div className="flex items-start gap-3">
                      <Monitor size={20} className="text-erp-info mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-erp-text font-medium">Sincronizar con sistema operativo</p>
                        <p className="text-sm text-erp-text-muted">Cambiar tema automáticamente según la configuración del sistema</p>
                      </div>
                    </div>
                    <div className="relative flex-shrink-0 ml-4">
                      <input type="checkbox" className="sr-only peer"
                        checked={localSettings.syncSystem}
                        onChange={(e) => setLocalSettings({ ...localSettings, syncSystem: e.target.checked, lightModeDay: false })} />
                      <div className="w-11 h-6 bg-erp-border rounded-full peer-checked:bg-erp-gold transition-colors"></div>
                      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                    </div>
                  </label>

                  <label className="flex items-center justify-between p-4 bg-erp-bg rounded-erp-sm cursor-pointer hover:bg-erp-card-hover transition-colors">
                    <div className="flex items-start gap-3">
                      <RotateCcw size={20} className="text-erp-warning mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-erp-text font-medium">Reducir contraste</p>
                        <p className="text-sm text-erp-text-muted">Disminuir la diferencia de color entre elementos para menos fatiga visual</p>
                      </div>
                    </div>
                    <div className="relative flex-shrink-0 ml-4">
                      <input type="checkbox" className="sr-only peer"
                        checked={localSettings.reduceContrast}
                        onChange={(e) => setLocalSettings({ ...localSettings, reduceContrast: e.target.checked })} />
                      <div className="w-11 h-6 bg-erp-border rounded-full peer-checked:bg-erp-gold transition-colors"></div>
                      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                    </div>
                  </label>
                </div>
              </div>

              <ThemePreview />

              <div className="mt-6 pt-6 border-t border-erp-border flex items-center gap-4">
                <button onClick={handleSaveTheme} disabled={!hasChanges}
                  className={`btn-primary flex items-center gap-2 ${!hasChanges ? "opacity-50 cursor-not-allowed" : ""}`}>
                  <Save size={18} /> Guardar cambios
                </button>

                {hasChanges && (
                  <button onClick={handleCancel} className="btn-secondary flex items-center gap-2">
                    <RotateCcw size={18} /> Restaurar
                  </button>
                )}

                {saved && activeSection === "display" && (
                  <span className="text-erp-success text-sm">¡Cambios guardados!</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
