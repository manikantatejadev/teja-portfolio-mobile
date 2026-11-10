import {
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  GraduationCap,
  Languages,
  MapPin,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { isSectionSupported } from '../lib/utils'

function SectionHeading({ eyebrow, title, note }) {
  return (
    <div className="section-heading section-heading--page">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {note ? <span className="section-heading__note">{note}</span> : null}
    </div>
  )
}

export function Journey({ portfolio, openSheet, navigate }) {
  const showExperience = isSectionSupported('experience', portfolio)
  const showEducation = isSectionSupported('education', portfolio)
  const showCertifications = isSectionSupported('certifications', portfolio)
  const showAchievements = isSectionSupported('achievements', portfolio)
  const showLanguages = isSectionSupported('languages', portfolio)
  const hasAnything =
    showExperience || showEducation || showCertifications || showAchievements || showLanguages

  return (
    <div className="screen page-screen">
      <header className="page-intro">
        <p className="eyebrow">The road so far</p>
        <h1>My Journey</h1>
        <p>
          Roles, responsibilities, and learning — documented exactly as they appear in my resume,
          without decorative numbers or invented milestones.
        </p>
      </header>

      {!hasAnything ? (
        <div className="empty-state">
          <span className="empty-state__icon">
            <Sparkles size={22} />
          </span>
          <h2>This story is being shaped</h2>
          <p>Journey details are hidden or not available right now.</p>
        </div>
      ) : null}

      {showExperience ? (
        <section className="content-section reveal">
          <SectionHeading
            eyebrow="Experience"
            title="Where I’ve worked"
            note={`${portfolio.experience.length} ${portfolio.experience.length === 1 ? 'role' : 'roles'}`}
          />
          <p className="section-hint">Tap a role to open the full responsibilities.</p>
          <div className="timeline">
            {portfolio.experience.map((entry, index) => (
              <button
                className="timeline-item"
                key={entry.id}
                style={{ '--delay': `${index * 80}ms` }}
                onClick={() => openSheet({ type: 'experience', id: entry.id })}
              >
                <span className="timeline-item__rail" aria-hidden="true">
                  <span className="timeline-item__dot" />
                </span>
                <span className="timeline-item__card">
                  <span className="timeline-item__topline">
                    <span className="timeline-item__date">
                      <CalendarDays size={14} /> {entry.dates}
                    </span>
                    <ArrowUpRight size={17} className="timeline-item__arrow" />
                  </span>
                  <span className="timeline-item__role">{entry.role}</span>
                  <span className="timeline-item__company">
                    {entry.company}
                    {entry.location ? (
                      <>
                        <span className="dot-separator" aria-hidden="true" />
                        <MapPin size={13} /> {entry.location}
                      </>
                    ) : null}
                  </span>
                  <span className="timeline-item__summary">{entry.summary}</span>
                  {entry.skills?.length ? (
                    <span className="chip-row chip-row--tight">
                      {entry.skills.slice(0, 5).map((skill) => (
                        <span className="chip chip--small" key={skill}>
                          {skill}
                        </span>
                      ))}
                      {entry.skills.length > 5 ? (
                        <span className="chip chip--small chip--muted">
                          +{entry.skills.length - 5}
                        </span>
                      ) : null}
                    </span>
                  ) : null}
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {showEducation ? (
        <section className="content-section reveal">
          <SectionHeading eyebrow="Education" title="Academic foundation" />
          <div className="stack">
            {portfolio.education.map((entry) => (
              <button
                key={entry.id}
                className="education-card"
                onClick={() => openSheet({ type: 'education' })}
              >
                <span className="education-card__icon">
                  <GraduationCap size={22} />
                </span>
                <span className="education-card__body">
                  <span className="education-card__degree">{entry.degree}</span>
                  <span className="education-card__institution">{entry.institution}</span>
                  <span className="education-card__meta">
                    {entry.location ? <span>{entry.location}</span> : null}
                    {entry.location && entry.dates ? (
                      <span className="dot-separator" aria-hidden="true" />
                    ) : null}
                    {entry.dates ? <span>{entry.dates}</span> : null}
                  </span>
                </span>
                <ArrowUpRight size={16} className="education-card__arrow" />
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {showCertifications ? (
        <section className="content-section reveal">
          <SectionHeading eyebrow="Certifications" title="Professional learning" />
          <div className="stack">
            {portfolio.certifications.map((certification, index) => (
              <div className="simple-info-card" key={`${certification}-${index}`}>
                <span className="simple-info-card__icon">
                  <BadgeCheck size={20} />
                </span>
                <span>{certification}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {showAchievements ? (
        <section className="content-section reveal">
          <SectionHeading eyebrow="Achievements" title="Moments worth noting" />
          <div className="stack">
            {portfolio.achievements.map((achievement, index) => (
              <div className="simple-info-card" key={`${achievement}-${index}`}>
                <span className="simple-info-card__icon simple-info-card__icon--warm">
                  <Trophy size={20} />
                </span>
                <span>{achievement}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {showLanguages ? (
        <section className="content-section reveal">
          <SectionHeading eyebrow="Outside the code" title="Languages & interests" />
          <div className="language-panel">
            <div className="language-panel__heading">
              <Languages size={19} />
              <span>Languages</span>
            </div>
            <div className="chip-row">
              {(portfolio.languages || []).map((language) => (
                <span className="chip" key={language}>
                  {language}
                </span>
              ))}
              {!portfolio.languages?.length ? (
                <button className="text-button" onClick={() => navigate('about')}>
                  Not added yet
                </button>
              ) : null}
            </div>
            {portfolio.interests?.length ? (
              <>
                <div className="language-panel__heading language-panel__heading--spaced">
                  <Sparkles size={18} />
                  <span>Interests</span>
                </div>
                <div className="chip-row">
                  {portfolio.interests.map((interest) => (
                    <span className="chip chip--muted" key={interest}>
                      {interest}
                    </span>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  )
}
