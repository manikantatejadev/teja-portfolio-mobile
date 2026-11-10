import {
  BriefcaseBusiness,
  CalendarDays,
  Check,
  MapPin,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { Sheet } from '../Sheet'

export function ExperienceSheet({ entry, portfolio, onClose }) {
  if (!entry) {
    return (
      <Sheet title="Experience" onClose={onClose}>
        <div className="empty-state">
          <BriefcaseBusiness size={22} />
          <h2>Role not found</h2>
          <p>This experience entry may have been removed.</p>
        </div>
      </Sheet>
    )
  }

  return (
    <Sheet title={entry.role} eyebrow={entry.company} onClose={onClose} className="sheet--detail">
      <div className="experience-summary">
        <p>{entry.summary}</p>
        <div className="experience-facts">
          <span>
            <CalendarDays size={15} /> {entry.dates || 'Dates not specified'}
          </span>
          {entry.location ? (
            <span>
              <MapPin size={15} /> {entry.location}
            </span>
          ) : null}
        </div>
      </div>

      {entry.bullets?.length ? (
        <section className="detail-section">
          <div className="detail-section__title">
            <Check size={17} />
            <h3>Responsibilities</h3>
          </div>
          <ul className="detail-list detail-list--check">
            {entry.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {entry.achievements?.length ? (
        <section className="detail-section">
          <div className="detail-section__title">
            <Trophy size={17} />
            <h3>Achievements</h3>
          </div>
          <ul className="detail-list">
            {entry.achievements.map((achievement) => (
              <li key={achievement}>{achievement}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {entry.skills?.length ? (
        <section className="detail-section">
          <div className="detail-section__title">
            <Sparkles size={17} />
            <h3>Skills applied</h3>
          </div>
          <div className="chip-row">
            {entry.skills.map((skill) => (
              <span className="chip" key={skill}>
                {skill}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <p className="detail-footnote">
        {portfolio.experience.length > 1
          ? 'Every role in this portfolio comes directly from the supplied resume.'
          : 'This is the complete professional experience listed in my resume.'}
      </p>
    </Sheet>
  )
}
