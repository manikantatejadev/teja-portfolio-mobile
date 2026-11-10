import { ArrowUpRight, Layers3, Link2, ListChecks, Target, UserRound } from 'lucide-react'
import { ProjectArtwork } from '../ProjectArtwork'
import { Sheet } from '../Sheet'

const hasText = (value) => Boolean(String(value || '').trim())

export function ProjectSheet({ project, portfolio, onClose }) {
  if (!project) {
    return (
      <Sheet title="Project" onClose={onClose}>
        <div className="empty-state">
          <Layers3 size={22} />
          <h2>Project not found</h2>
          <p>This project may have been removed or hidden.</p>
        </div>
      </Sheet>
    )
  }

  return (
    <Sheet
      title={project.name}
      eyebrow={project.subtitle || 'Project'}
      onClose={onClose}
      className="sheet--detail"
    >
      <ProjectArtwork
        project={project}
        index={portfolio.projects.findIndex((item) => item.id === project.id)}
        large
      />

      <div className="detail-meta">
        {project.status ? <span className="status-pill">{project.status}</span> : null}
        {hasText(project.role) ? (
          <span className="detail-meta__item">
            <UserRound size={15} /> {project.role}
          </span>
        ) : null}
        {project.technologies?.length ? (
          <span className="detail-meta__item">
            <Layers3 size={15} /> {project.technologies.length} technologies
          </span>
        ) : null}
      </div>

      {project.technologies?.length ? (
        <div className="chip-row">
          {project.technologies.map((technology) => (
            <span className="chip" key={technology}>
              {technology}
            </span>
          ))}
        </div>
      ) : hasText(project.stackNote) ? (
        <p className="inline-note">{project.stackNote}</p>
      ) : null}

      <div className="detail-sections">
        {hasText(project.purpose) ? (
          <section className="detail-section">
            <div className="detail-section__title">
              <Target size={17} />
              <h3>Purpose</h3>
            </div>
            <p>{project.purpose}</p>
          </section>
        ) : null}

        {hasText(project.contribution) ? (
          <section className="detail-section">
            <div className="detail-section__title">
              <UserRound size={17} />
              <h3>My contribution</h3>
            </div>
            <div className="detail-paragraphs">
              {project.contribution.split(/\n+/).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ) : null}

        {project.features?.length ? (
          <section className="detail-section">
            <div className="detail-section__title">
              <ListChecks size={17} />
              <h3>Main features</h3>
            </div>
            <ul className="detail-list">
              {project.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {hasText(project.challenges) ? (
          <section className="detail-section">
            <div className="detail-section__title">
              <Target size={17} />
              <h3>Challenges & solutions</h3>
            </div>
            <p>{project.challenges}</p>
          </section>
        ) : null}

        {project.screenshots?.length ? (
          <section className="detail-section">
            <h3>Screenshots</h3>
            <div className="screenshot-list">
              {project.screenshots.map((shot, index) => (
                <img
                  key={`${shot.url}-${index}`}
                  src={shot.url}
                  alt={shot.alt || `${project.name} screenshot ${index + 1}`}
                  loading="lazy"
                />
              ))}
            </div>
          </section>
        ) : null}

        {project.links?.length ? (
          <section className="detail-section">
            <div className="detail-section__title">
              <Link2 size={17} />
              <h3>Project links</h3>
            </div>
            <div className="link-stack">
              {project.links.map((link, index) => (
                <a
                  key={`${link.url}-${index}`}
                  className="link-row"
                  href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>{link.label || link.url}</span>
                  <ArrowUpRight size={16} />
                </a>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <p className="detail-footnote">
        Only the project information supplied in my resume is shown. Unavailable sections and links
        are intentionally hidden.
      </p>
    </Sheet>
  )
}
