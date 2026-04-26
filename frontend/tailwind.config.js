/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Fondos principales (variables CSS para tema dinámico)
        'erp-bg': 'var(--color-bg)',
        'erp-sidebar': 'var(--color-sidebar)',
        'erp-card': 'var(--color-card)',
        'erp-card-hover': 'var(--color-card-hover)',
        
        // Color dorado (primary)
        'erp-gold': 'var(--color-gold)',
        'erp-gold-hover': 'var(--color-gold-hover)',
        'erp-gold-dark': 'var(--color-gold-dark)',
        
        // Estados
        'erp-success': '#22c55e',
        'erp-warning': '#eab308',
        'erp-danger': '#ef4444',
        'erp-info': '#3b82f6',
        
        // Textos
        'erp-text': 'var(--color-text)',
        'erp-text-secondary': 'var(--color-text-secondary)',
        'erp-text-muted': 'var(--color-text-muted)',
        
        // Bordes
        'erp-border': 'var(--color-border)',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'erp': '0 4px 20px rgba(0, 0, 0, 0.3)',
        'erp-sm': '0 2px 10px rgba(0, 0, 0, 0.2)',
      },
      borderRadius: {
        'erp': '12px',
        'erp-sm': '8px',
      },
    },
  },
  plugins: [],
}

