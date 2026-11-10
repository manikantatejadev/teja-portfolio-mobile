import { useMemo, useState } from 'react'
import { ArrowUpRight, FolderKanban, Sparkles } from 'lucide-react'
import { ProjectArtwork } from '../components/ProjectArtwork'
import { isSectionSupported } from '../lib/utils'

export function Work({ portfolio, openSheet }) {
  const [activeFilter, setActiveFilter] = useState('All')
  const showProjects = isSectionSupported('projects', portfolio)
  const showSkills = isSectionSupported('skills', portfolio)

  const filters = useMemo(() => {
    const counts = new Map()
    for (const project of portfolio.projects || []) {
      for (const technology of project.technologies || []) {
        counts.set(technology, (counts.get(technology) || 0) + 1)
      }
    }
    return [
      'All',
      ...[...counts.entries()]
        .filter(([, count]) => count > 1)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 6)
        .map(([technology]) => technology),
    ]
  }, [portfolio.projects])

  const projects = (portfolio.projects || []).filter(
    (project) =>
      activeFilter === 'All' || project.technologies?.includes(activeFilter),
  )

  return (
    <div className="screen page-screen">
      <header className="page-intro">
        <p className="eyebrow">Case studies</p>
        <h1>My Work</h1>
        <p>
          Enterprise systems, operational tools, and an ongoing fintech platform. Each project is
          shown with the information my resume actually provides.
        </p>
      </header>

      {showProjects && portfolio.projects?.length > 1 ? (
        <div className="filter-bar" role="group" aria-label="Filter projects by technology">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`filter-chip ${activeFilter === filter ? 'is-active' : ''}`}
              onClick={() => setActiveFilter(filter)}
              aria-pressed={activeFilter === filter}
            >
              {filter}
            </button>
          ))}
        </div>
      ) : null}

      {showProjects && projects.length ? (
        <section className="project-list" aria-label="Projects">
          {projects.map((project, index) => {
            const originalIndex = portfolio.projects.findIndex((item) => item.id === project.id)
            return (
              <button
                className="project-card"
                key={project.id}
                onClick={() => openSheet({ type: 'project', id: project.id })}
              >
                <ProjectArtwork project={project} index={originalIndex} />
                <span className="project-card__body">
                  <span className="project-card__topline">
                    <span className="project-card__name">{project.name}</span>
                    {project.status ? (
                      <span className="status-pill">{project.status}</span>
                    ) : null}
                  </span>
                  <span className="project-card__subtitle">{project.subtitle}</span>
                  <span className="project-card__summary">{project.summary}</span>
                  <span className="project-card__role">
                    <span>Role</span> {project.role || 'Not specified'}
                  </span>
                  {project.technologies?.length ? (
                    <span className="chip-row chip-row--tight">
                      {project.technologies.slice(0, 4).map((technology) => (
                        <span className="chip chip--small" key={technology}>
                          {technology}
                        </span>
                      ))}
                      {project.technologies.length > 4 ? (
                        <span className="chip chip--small chip--muted">
                          +{project.technologies.length - 4}
                        </span>
                      ) : null}
                    </span>
                  ) : null}
                  <span className="project-card__cta">
                    Open case study <ArrowUpRight size={15} />
                  </span>
                </span>
              </button>
            )
          })}
        </section>
      ) : (
        <div className="empty-state">
          <span className="empty-state__icon">
            <FolderKanban size={22} />
          </span>
          <h2>{showProjects ? 'No projects match this filter' : 'Work is private right now'}</h2>
          <p>
            {showProjects
              ? 'Choose another technology to see more of the work.'
              : 'Project details are hidden or not available at the moment.'}
          </p>
          {showProjects ? (
            <button className="button button--secondary button--small" onClick={() => setActiveFilter('All')}>
              Show all projects
            </button>
          ) : null}
        </div>
      )}

      {showSkills ? (
        <button className="skills-teaser" onClick={() => openSheet({ type: 'skills' })}>
          <span className="skills-teaser__icon">
            <Sparkles size={20} />
          </span>
          <span className="skills-teaser__copy">
            <strong>The toolkit behind the work</strong>
            <span>
              {portfolio.skills.length} capability groups · {portfolio.skills.reduce((sum, group) => sum + group.items.length, 0)}{' '}
              skills from my resume
            </span>
          </span>
          <ArrowUpRight size={18} />
        </button>
      ) : null}
    </div>
  )
}
