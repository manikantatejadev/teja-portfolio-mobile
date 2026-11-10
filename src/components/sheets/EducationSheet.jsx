import { CalendarDays, GraduationCap, MapPin } from 'lucide-react'
import { Sheet } from '../Sheet'

export function EducationSheet({ portfolio, onClose }) {
  return (
    <Sheet title="Education" eyebrow="Academic foundation" onClose={onClose}>
      <p className="sheet-lede">
        The academic background exactly as it appears in my resume.
      </p>
      <div className="stack">
        {portfolio.education.map((entry) => (
          <article className="education-detail-card" key={entry.id}>
            <span className="education-detail-card__icon">
              <GraduationCap size={24} />
            </span>
            <h3>{entry.degree}</h3>
            <p className="education-detail-card__institution">{entry.institution}</p>
            <div className="education-detail-card__meta">
              {entry.location ? (
                <span>
                  <MapPin size={14} /> {entry.location}
                </span>
              ) : null}
              {entry.dates ? (
                <span>
                  <CalendarDays size={14} /> {entry.dates}
                </span>
              ) : null}
            </div>
            {entry.details ? <p>{entry.details}</p> : null}
          </article>
        ))}
      </div>
    </Sheet>
  )
}
