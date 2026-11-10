import { Languages, Sparkles, Trophy, BadgeCheck } from 'lucide-react'
import { Sheet } from '../Sheet'

const CONFIG = {
  certifications: {
    title: 'Certifications',
    eyebrow: 'Professional learning',
    icon: BadgeCheck,
    empty: 'No certifications are listed yet.',
  },
  achievements: {
    title: 'Achievements',
    eyebrow: 'Moments worth noting',
    icon: Trophy,
    empty: 'No achievements are listed yet.',
  },
  languages: {
    title: 'Languages & Interests',
    eyebrow: 'Beyond the work',
    icon: Languages,
    empty: 'No languages or interests are listed yet.',
  },
}

export function PortfolioListSheet({ type, portfolio, onClose }) {
  const config = CONFIG[type]
  const Icon = config.icon
  const isLanguages = type === 'languages'

  return (
    <Sheet title={config.title} eyebrow={config.eyebrow} onClose={onClose}>
      {isLanguages ? (
        <div className="list-sheet">
          <section className="detail-section">
            <div className="detail-section__title">
              <Icon size={17} />
              <h3>Languages</h3>
            </div>
            {portfolio.languages?.length ? (
              <div className="chip-row">
                {portfolio.languages.map((language) => (
                  <span className="chip" key={language}>
                    {language}
                  </span>
                ))}
              </div>
            ) : (
              <p className="muted-copy">No languages listed.</p>
            )}
          </section>
          <section className="detail-section">
            <div className="detail-section__title">
              <Sparkles size={17} />
              <h3>Interests</h3>
            </div>
            {portfolio.interests?.length ? (
              <div className="chip-row">
                {portfolio.interests.map((interest) => (
                  <span className="chip chip--muted" key={interest}>
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <p className="muted-copy">No interests listed in the resume.</p>
            )}
          </section>
        </div>
      ) : (
        <div className="stack">
          {(portfolio[type] || []).map((item, index) => (
            <article className="simple-info-card simple-info-card--large" key={`${item}-${index}`}>
              <span className="simple-info-card__icon">
                <Icon size={20} />
              </span>
              <span>{typeof item === 'string' ? item : item.title || item.name || ''}</span>
            </article>
          ))}
          {!(portfolio[type] || []).length ? (
            <div className="empty-state">
              <Icon size={22} />
              <h2>{config.empty}</h2>
              <p>This information can be added from Studio.</p>
            </div>
          ) : null}
        </div>
      )}
    </Sheet>
  )
}
