import {
  ArrowUpRight,
  BriefcaseBusiness,
  GraduationCap,
  MapPin,
  Send,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react'
import { SectionIcon } from '../components/SectionIcon'
import { SECTION_DEFINITIONS } from '../data/defaultPortfolio'
import {
  getOrderedSections,
  getVisibleContactLinks,
  isSectionSupported,
} from '../lib/utils'

function getPreview(id, portfolio) {
  switch (id) {
    case 'summary':
      return portfolio.summary
    case 'skills':
      return `${portfolio.skills.length} groups · ${portfolio.skills.reduce((sum, group) => sum + group.items.length, 0)} skills`
    case 'experience': {
      const first = portfolio.experience[0]
      return first ? `${first.role} · ${first.company}` : 'Professional experience'
    }
    case 'projects':
      return `${portfolio.projects.length} ${portfolio.projects.length === 1 ? 'project' : 'projects'} from the resume`
    case 'education':
      return portfolio.education[0]?.institution || portfolio.education[0]?.degree || 'Education'
    case 'certifications':
      return `${portfolio.certifications.length} ${portfolio.certifications.length === 1 ? 'entry' : 'entries'}`
    case 'achievements':
      return `${portfolio.achievements.length} ${portfolio.achievements.length === 1 ? 'entry' : 'entries'}`
    case 'languages':
      return [...(portfolio.languages || []), ...(portfolio.interests || [])].join(' · ')
    case 'resume':
      return portfolio.resume?.fileName || 'Original resume'
    case 'contact': {
      const links = getVisibleContactLinks(portfolio)
      return links[0]?.value || `${links.length} contact options`
    }
    default:
      return ''
  }
}

function handleSectionOpen(id, { openSheet, navigate }) {
  switch (id) {
    case 'experience':
      navigate('journey')
      return
    case 'projects':
      navigate('work')
      return
    default:
      openSheet({ type: id })
  }
}

export function About({ portfolio, openSheet, navigate, owner, onCustomize }) {
  const orderedSections = getOrderedSections(portfolio)
  const hasContact = isSectionSupported('contact', portfolio)
  const experienceDates = portfolio.experience?.[0]?.dates
  const degree = portfolio.education?.[0]?.degree

  return (
    <div className="screen page-screen">
      <header className="page-intro page-intro--about">
        <p className="eyebrow">The person behind the work</p>
        <h1>About Me</h1>
        <p>
          A concise view of my background, the capabilities I use, and the details that matter when
          we work together. Everything here is grounded in my resume.
        </p>
      </header>

      <section className="glance-grid" aria-label="At a glance">
        {portfolio.identity.location ? (
          <div className="glance-card">
            <MapPin size={18} />
            <span>Based in</span>
            <strong>{portfolio.identity.location}</strong>
          </div>
        ) : null}
        {experienceDates ? (
          <div className="glance-card">
            <BriefcaseBusiness size={18} />
            <span>Experience</span>
            <strong>{experienceDates}</strong>
          </div>
        ) : null}
        {degree ? (
          <div className="glance-card">
            <GraduationCap size={18} />
            <span>Education</span>
            <strong>B.Tech · Computer Science</strong>
          </div>
        ) : null}
        {portfolio.languages?.length ? (
          <div className="glance-card">
            <Sparkles size={18} />
            <span>Speaks</span>
            <strong>{portfolio.languages.join(' · ')}</strong>
          </div>
        ) : null}
      </section>

      <section className="about-sections">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Explore</p>
            <h2>My story, section by section</h2>
          </div>
          {owner ? (
            <button className="text-button text-button--muted" onClick={onCustomize}>
              Reorder
            </button>
          ) : null}
        </div>
        {orderedSections.length ? (
          <div className="section-index">
            {orderedSections.map((id, index) => {
              const definition = SECTION_DEFINITIONS.find((item) => item.id === id)
              if (!definition) return null
              return (
                <button
                  key={id}
                  className="section-index__row"
                  style={{ '--delay': `${index * 40}ms` }}
                  onClick={() => handleSectionOpen(id, { openSheet, navigate })}
                >
                  <span className={`section-index__icon section-index__icon--${index % 4}`}>
                    <SectionIcon name={definition.icon} size={19} />
                  </span>
                  <span className="section-index__copy">
                    <strong>{definition.label}</strong>
                    <span className="section-index__preview">{getPreview(id, portfolio)}</span>
                  </span>
                  <ArrowUpRight size={17} className="section-index__arrow" />
                </button>
              )
            })}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state__icon">
              <Sparkles size={22} />
            </span>
            <h2>Nothing to show yet</h2>
            <p>All sections are currently hidden. The portfolio owner can restore them in Studio.</p>
          </div>
        )}
      </section>

      {hasContact ? (
        <button className="contact-banner" onClick={() => openSheet({ type: 'contact' })}>
          <span className="contact-banner__icon">
            <Send size={20} />
          </span>
          <span className="contact-banner__copy">
            <strong>Let’s start a conversation</strong>
            <span>Email, phone, and professional links — no contact form, no simulation.</span>
          </span>
          <ArrowUpRight size={18} />
        </button>
      ) : null}

      {owner ? (
        <section className="owner-panel">
          <div>
            <p className="eyebrow">Portfolio owner</p>
            <h2>Keep this profile current</h2>
            <p>
              Edit content, change the portrait, add a voice introduction, and choose what visitors
              see.
            </p>
          </div>
          <button className="button button--secondary button--small" onClick={onCustomize}>
            <SlidersHorizontal size={16} /> Open Studio
          </button>
        </section>
      ) : null}
    </div>
  )
}
