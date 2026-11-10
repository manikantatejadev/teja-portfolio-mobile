import { Check, MoonStar, SunMedium, Waves } from 'lucide-react'
import { THEMES } from '../data/defaultPortfolio'

const THEME_ICONS = {
  midnight: MoonStar,
  pearl: SunMedium,
  ocean: Waves,
}

export function ThemeSheet({ theme, setTheme, textSize, setTextSize }) {
  return (
    <div className="theme-picker">
      <p className="sheet-lede">
        Every screen is tuned for the same palette, contrast, and mood. Your choice is remembered
        on this device.
      </p>
      <div className="theme-grid">
        {THEMES.map((option) => {
          const Icon = THEME_ICONS[option.id]
          const selected = theme === option.id
          return (
            <button
              key={option.id}
              className={`theme-card ${selected ? 'is-selected' : ''}`}
              onClick={() => setTheme(option.id)}
              aria-pressed={selected}
            >
              <span className="theme-card__preview" style={{ '--preview-bg': option.colors[0] }}>
                <span
                  className="theme-card__preview-panel"
                  style={{ '--preview-surface': option.colors[1] }}
                >
                  <span
                    className="theme-card__preview-dot"
                    style={{ '--preview-accent': option.colors[2] }}
                  />
                  <span
                    className="theme-card__preview-line"
                    style={{ '--preview-text': option.colors[3] }}
                  />
                  <span
                    className="theme-card__preview-line theme-card__preview-line--short"
                    style={{ '--preview-text': option.colors[3] }}
                  />
                </span>
              </span>
              <span className="theme-card__copy">
                <span className="theme-card__title">
                  <Icon size={16} />
                  {option.name}
                </span>
                <span className="theme-card__description">{option.description}</span>
              </span>
              {selected ? (
                <span className="theme-card__check" aria-hidden="true">
                  <Check size={14} />
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      <div className="reading-size">
        <div>
          <p className="eyebrow">Reading comfort</p>
          <h3>Text size</h3>
          <p>Use a larger base size across the whole portfolio.</p>
        </div>
        <div className="segmented" role="group" aria-label="Text size">
          <button
            className={textSize === 'standard' ? 'is-active' : ''}
            onClick={() => setTextSize('standard')}
            aria-pressed={textSize === 'standard'}
          >
            Standard
          </button>
          <button
            className={textSize === 'large' ? 'is-active' : ''}
            onClick={() => setTextSize('large')}
            aria-pressed={textSize === 'large'}
          >
            Large
          </button>
        </div>
      </div>
    </div>
  )
}
