import { FolderKanban, Home, Route, UserRound } from 'lucide-react'

const DESTINATIONS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'journey', label: 'My Journey', icon: Route },
  { id: 'work', label: 'My Work', icon: FolderKanban },
  { id: 'about', label: 'About Me', icon: UserRound },
]

export function BottomNav({ route, navigate }) {
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      <div className="bottom-nav__inner">
        {DESTINATIONS.map((destination) => {
          const Icon = destination.icon
          const active = route === destination.id
          return (
            <button
              key={destination.id}
              className={`nav-item ${active ? 'is-active' : ''}`}
              onClick={() => navigate(destination.id)}
              aria-current={active ? 'page' : undefined}
              aria-label={destination.label}
            >
              <span className="nav-item__icon">
                <Icon size={20} strokeWidth={active ? 2.4 : 2} />
              </span>
              <span className="nav-item__label">{destination.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
