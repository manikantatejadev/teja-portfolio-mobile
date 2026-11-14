import { Palette, SlidersHorizontal } from 'lucide-react'

export function TopBar({ name, owner, onHome, onTheme, onCustomize }) {
  return (
    <header className="topbar">
      <button className="brand" onClick={onHome} aria-label={`${name}, go to home`}>
        <span className="brand__mark" aria-hidden="true">
          {'</>'}
        </span>
        <span className="brand__text">
          <strong>{name}</strong>
          <span aria-hidden="true">full-stack + ai</span>
        </span>
      </button>
      <div className="topbar__actions">
        {owner ? (
          <button
            className="icon-button"
            onClick={onCustomize}
            aria-label="Customize portfolio"
            title="Customize portfolio"
          >
            <SlidersHorizontal size={19} />
          </button>
        ) : null}
        <button className="theme-button" onClick={onTheme} aria-label="Choose a theme">
          <Palette size={18} />
          <span>Theme</span>
        </button>
      </div>
    </header>
  )
}
