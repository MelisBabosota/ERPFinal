import { createContext, useContext, useState, useEffect, useCallback } from "react"

const ThemeContext = createContext()

// Cargar configuración guardada o usar valores por defecto
function getSavedTheme() {
  try {
    const saved = localStorage.getItem("erp-theme-settings")
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error("Error leyendo tema guardado:", e)
  }
  return {
    mode: "dark",
    lightModeDay: false,
    reduceContrast: false,
    syncSystem: false
  }
}

// Detectar si es de día (6am - 6pm)
function isDaytime() {
  const hour = new Date().getHours()
  return hour >= 6 && hour < 18
}

// Detectar preferencia del sistema
function getSystemTheme() {
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light"
  }
  return "dark"
}

// Determinar el tema activo basado en la configuración
function computeActiveTheme(settings) {
  if (settings.syncSystem) {
    return getSystemTheme()
  }
  if (settings.lightModeDay) {
    return isDaytime() ? "light" : "dark"
  }
  if (settings.mode === "system") {
    return getSystemTheme()
  }
  return settings.mode === "light" ? "light" : "dark"
}

export function ThemeProvider({ children }) {
  const [settings, setSettings] = useState(getSavedTheme)
  const [activeTheme, setActiveTheme] = useState(() => computeActiveTheme(getSavedTheme()))

  // Aplicar clases CSS al elemento <html>
  const applyTheme = useCallback((themeSettings) => {
    const html = document.documentElement
    const theme = computeActiveTheme(themeSettings)

    console.log("[ThemeContext] Aplicando tema:", theme, "settings:", themeSettings)
    console.log("[ThemeContext] Clases antes:", html.className)

    // Limpiar clases anteriores
    html.classList.remove("light", "dark", "low-contrast")

    // Aplicar tema base
    html.classList.add(theme)

    // Aplicar bajo contraste si está activo
    if (themeSettings.reduceContrast) {
      html.classList.add("low-contrast")
    }

    console.log("[ThemeContext] Clases después:", html.className)
    console.log("[ThemeContext] --color-bg actual:", getComputedStyle(html).getPropertyValue("--color-bg"))

    // Actualizar meta theme-color para mobile
    const metaThemeColor = document.getElementById("theme-color-meta")
    if (metaThemeColor) {
      metaThemeColor.content = theme === "light" ? "#f1f5f9" : "#0f172a"
    }

    setActiveTheme(theme)
  }, [])

  // Aplicar tema al cargar
  useEffect(() => {
    applyTheme(settings)
  }, [applyTheme, settings])

  // Escuchar cambios en preferencia del sistema (si syncSystem está activo)
  useEffect(() => {
    if (!settings.syncSystem && settings.mode !== "system") return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)")
    const handler = () => {
      applyTheme(settings)
    }

    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [settings, applyTheme])

  // Actualizar tema automáticamente cada minuto si lightModeDay está activo
  useEffect(() => {
    if (!settings.lightModeDay) return

    const interval = setInterval(() => {
      applyTheme(settings)
    }, 60000) // cada minuto

    return () => clearInterval(interval)
  }, [settings, applyTheme])

  // Guardar cambios y aplicar
  const saveSettings = (newSettings) => {
    const merged = { ...settings, ...newSettings }
    setSettings(merged)
    localStorage.setItem("erp-theme-settings", JSON.stringify(merged))
    applyTheme(merged)
  }

  // Preview de tema (aplica temporalmente sin guardar)
  const previewTheme = (previewSettings) => {
    const merged = { ...settings, ...previewSettings }
    applyTheme(merged)
  }

  // Cancelar preview y volver al tema guardado
  const cancelPreview = () => {
    applyTheme(settings)
  }

  return (
    <ThemeContext.Provider
      value={{
        settings,
        activeTheme,
        saveSettings,
        previewTheme,
        cancelPreview
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme debe usarse dentro de ThemeProvider")
  }
  return context
}
