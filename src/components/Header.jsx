import { InfoIcon } from './InfoIcon.jsx'

export function Header({ theme, onToggleTheme }) {
  const darkMode = theme === 'dark'

  return (
    <header className="site-header">
      <div className="header-mark" aria-hidden="true">GH</div>
      <div className="header-copy">
        <p className="eyebrow">Herramienta académica local</p>
        <h1>Generador de Horarios Escolares</h1>
        <p>Selecciona tus materias y encuentra todas las combinaciones sin empalmes.</p>
      </div>
      <button type="button" className="theme-toggle" onClick={onToggleTheme} aria-pressed={darkMode}>
        <InfoIcon name={darkMode ? 'sun' : 'moon'} />
        <span>{darkMode ? 'Modo claro' : 'Modo oscuro'}</span>
      </button>
    </header>
  )
}
