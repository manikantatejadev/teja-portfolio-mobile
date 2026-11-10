import { projectMonogram } from '../lib/utils'

export function ProjectArtwork({ project, index = 0, large = false }) {
  const screenshot = project.screenshots?.find((item) => item?.url)?.url
  const tone = index % 4
  if (screenshot) {
    return (
      <div className={`project-art project-art--${tone} ${large ? 'is-large' : ''}`}>
        <img src={screenshot} alt={`${project.name} project`} loading="lazy" />
      </div>
    )
  }
  return (
    <div
      className={`project-art project-art--${tone} ${large ? 'is-large' : ''}`}
      aria-label={`Abstract project visual for ${project.name}`}
      role="img"
    >
      <span className="project-art__orb project-art__orb--one" aria-hidden="true" />
      <span className="project-art__orb project-art__orb--two" aria-hidden="true" />
      <span className="project-art__grid" aria-hidden="true" />
      <span className="project-art__monogram">{projectMonogram(project.name)}</span>
      <span className="project-art__label">Project</span>
      {project.status ? <span className="project-art__status">{project.status}</span> : null}
    </div>
  )
}
