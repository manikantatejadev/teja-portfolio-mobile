import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Sparkles,
} from 'lucide-react'
import { AudioCard } from '../components/AudioCard'
import { PhotoFrame } from '../components/PhotoFrame'
import { ProjectArtwork } from '../components/ProjectArtwork'
import {
  formatTitleForDisplay,
  getFeaturedProject,
  getVisibleContactLinks,
  isSectionSupported,
} from '../lib/utils'

export function Home({
  portfolio,
  photoUrl,
  audioUrl,
  audio,
  mediaLoading,
  navigate,
  openSheet,
  onEditPhoto,
  onEditAudio,
  owner,
}) {
  const featured = getFeaturedProject(portfolio)
  const hasContact = getVisibleContactLinks(portfolio).length > 0
  const quickCards = []

  if (isSectionSupported('experience', portfolio)) {
    quickCards.push({
      id: 'experience',
      label: 'Experience',
      detail: portfolio.experience[0]?.company || 'Professional journey',
      icon: BriefcaseBusiness,
      onClick: () => navigate('journey'),
    })
  }
  if (isSectionSupported('skills', portfolio)) {
    quickCards.push({
      id: 'skills',
      label: 'Skills',
      detail: `${portfolio.skills.length} capability groups`,
      icon: Sparkles,
      onClick: () => openSheet({ type: 'skills' }),
    })
  }
  if (isSectionSupported('education', portfolio)) {
    quickCards.push({
      id: 'education',
      label: 'Education',
      detail: 'Academic foundation',
      icon: GraduationCap,
      onClick: () => openSheet({ type: 'education' }),
    })
  }
  if (isSectionSupported('resume', portfolio)) {
    quickCards.push({
      id: 'resume',
      label: 'Resume',
      detail: 'Open the original file',
      icon: FileText,
      onClick: () => openSheet({ type: 'resume' }),
    })
  }

  return (
    <div className="screen home-screen">
      <section className="hero">
        <div className="rise" style={{ '--delay': '40ms' }}>
          <PhotoFrame
            portfolio={portfolio}
            photoUrl={photoUrl}
            onOpen={() => openSheet({ type: 'portrait' })}
            onEditPhoto={onEditPhoto}
            owner={owner}
          />
        </div>

        <div className="identity rise" style={{ '--delay': '120ms' }}>
          <p className="eyebrow">Hello, I&apos;m</p>
          <h1>{portfolio.identity.name}</h1>
          <p className="identity__title">{formatTitleForDisplay(portfolio.identity.title)}</p>
          {portfolio.identity.location ? (
            <p className="identity__location">
              <MapPin size={14} />
              {portfolio.identity.location}
            </p>
          ) : null}
        </div>

        <p className="hero__intro rise" style={{ '--delay': '190ms' }}>
          {portfolio.identity.intro}
        </p>
      </section>

      <div className="rise" style={{ '--delay': '260ms' }}>
        <AudioCard
          portfolio={portfolio}
          audioUrl={audioUrl}
          audio={audio}
          onOpen={() => openSheet({ type: 'audio' })}
          onEdit={onEditAudio}
          owner={owner}
          mediaLoading={mediaLoading && Boolean(portfolio.audio?.key) && !audioUrl}
        />
      </div>

      <div className="primary-actions rise" style={{ '--delay': '330ms' }}>
        <button className="button button--primary" onClick={() => navigate('work')}>
          Explore My Work <ArrowRight size={17} />
        </button>
        {hasContact ? (
          <button
            className="button button--ghost"
            onClick={() => openSheet({ type: 'contact' })}
          >
            <Mail size={17} /> Contact Me
          </button>
        ) : null}
      </div>

      {quickCards.length ? (
        <section className="home-section rise" style={{ '--delay': '400ms' }}>
          <div className="section-heading">
            <div>
              <p className="eyebrow">At a glance</p>
              <h2>Quick access</h2>
            </div>
            <button className="text-button text-button--muted" onClick={() => navigate('about')}>
              About me <ArrowRight size={14} />
            </button>
          </div>
          <div className="quick-grid">
            {quickCards.map((card) => {
              const Icon = card.icon
              return (
                <button key={card.id} className="quick-card" onClick={card.onClick}>
                  <span className="quick-card__icon">
                    <Icon size={19} />
                  </span>
                  <span className="quick-card__copy">
                    <strong>{card.label}</strong>
                    <span>{card.detail}</span>
                  </span>
                  <ArrowUpRight className="quick-card__arrow" size={16} />
                </button>
              )
            })}
          </div>
        </section>
      ) : null}

      {featured && isSectionSupported('projects', portfolio) ? (
        <section className="home-section rise" style={{ '--delay': '470ms' }}>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Featured project</p>
              <h2>Selected work</h2>
            </div>
            <button className="text-button text-button--muted" onClick={() => navigate('work')}>
              View all <ArrowRight size={14} />
            </button>
          </div>
          <button
            className="featured-project"
            onClick={() => openSheet({ type: 'project', id: featured.id })}
          >
            <ProjectArtwork project={featured} index={portfolio.projects.indexOf(featured)} />
            <span className="featured-project__body">
              <span className="featured-project__meta">
                <span>{featured.status || 'Project'}</span>
                <span>{featured.technologies?.[0] || 'Case study'}</span>
              </span>
              <strong className="featured-project__title">{featured.name}</strong>
              <span className="featured-project__subtitle">{featured.subtitle}</span>
              <span className="featured-project__summary">{featured.summary}</span>
              <span className="featured-project__footer">
                <span className="featured-project__cta">
                  View project <ArrowUpRight size={15} />
                </span>
                <span className="featured-project__role">{featured.role}</span>
              </span>
            </span>
          </button>
        </section>
      ) : null}

      <p className="home-signoff">
        A personal portfolio shaped entirely around my resume.
      </p>
    </div>
  )
}
