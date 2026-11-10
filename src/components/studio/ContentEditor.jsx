import { useId, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  BadgeCheck,
  BriefcaseBusiness,
  ChevronDown,
  Eye,
  EyeOff,
  FileText,
  GraduationCap,
  Languages,
  Layers3,
  Link2,
  Plus,
  Sparkles,
  Trash2,
  Trophy,
  Upload,
} from 'lucide-react'
import { SECTION_DEFINITIONS } from '../../data/defaultPortfolio'
import { SectionIcon } from '../SectionIcon'

const uid = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const linesToArray = (value) =>
  String(value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

const commaToArray = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const linksToText = (links = []) =>
  links.map((link) => `${link.label || ''}${link.label ? ' | ' : ''}${link.url || ''}`).join('\n')

const textToLinks = (value) =>
  String(value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [first, ...rest] = line.split('|').map((part) => part.trim())
      if (rest.length) {
        return { id: `link-${index}-${Date.now()}`, label: first, url: rest.join('|').trim(), visible: true }
      }
      return { id: `link-${index}-${Date.now()}`, label: 'Project link', url: first, visible: true }
    })

function hasContent(id, draft) {
  switch (id) {
    case 'summary':
      return Boolean(draft.summary?.trim())
    case 'skills':
      return Boolean(draft.skills?.some((group) => group.items?.length))
    case 'experience':
      return Boolean(draft.experience?.length)
    case 'projects':
      return Boolean(draft.projects?.length)
    case 'education':
      return Boolean(draft.education?.length)
    case 'certifications':
      return Boolean(draft.certifications?.length)
    case 'achievements':
      return Boolean(draft.achievements?.length)
    case 'languages':
      return Boolean(draft.languages?.length || draft.interests?.length)
    case 'resume':
      return Boolean(draft.resume?.builtinUrl || draft.resume?.key)
    case 'contact':
      return Boolean(
        (draft.contact?.visible?.email && draft.contact.email) ||
          (draft.contact?.visible?.phone && draft.contact.phone) ||
          draft.contact?.links?.some((link) => link.visible && link.url),
      )
    default:
      return false
  }
}

function Field({ label, value, onChange, placeholder, hint, multiline = false, rows = 3, type = 'text' }) {
  const reactId = useId()
  const id = `field-${reactId}`
  return (
    <label className="field" htmlFor={id}>
      <span className="field__label">{label}</span>
      {multiline ? (
        <textarea
          id={id}
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={rows}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      )}
      {hint ? <span className="field__hint">{hint}</span> : null}
    </label>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      className={`switch ${checked ? 'is-on' : ''}`}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span className="switch__track">
        <span className="switch__thumb" />
      </span>
      <span>{label}</span>
    </button>
  )
}

function Accordion({ id, title, description, icon: Icon, open, setOpen, badge, children }) {
  const expanded = open === id
  return (
    <section className={`editor-accordion ${expanded ? 'is-open' : ''}`}>
      <button
        className="editor-accordion__heading"
        onClick={() => setOpen(expanded ? null : id)}
        aria-expanded={expanded}
      >
        <span className="editor-accordion__icon">
          <Icon size={18} />
        </span>
        <span className="editor-accordion__copy">
          <strong>{title}</strong>
          {description ? <span>{description}</span> : null}
        </span>
        {badge ? <span className="editor-accordion__badge">{badge}</span> : null}
        <ChevronDown className={expanded ? 'is-rotated' : ''} size={18} />
      </button>
      {expanded ? <div className="editor-accordion__body">{children}</div> : null}
    </section>
  )
}

function ItemHeader({ title, subtitle, index, length, onMove, onRemove }) {
  return (
    <div className="editor-item__heading">
      <div>
        <strong>{title || `Untitled ${index + 1}`}</strong>
        {subtitle ? <span>{subtitle}</span> : null}
      </div>
      <div className="editor-item__actions">
        <button
          className="icon-button icon-button--tiny"
          onClick={() => onMove(index, index - 1)}
          disabled={index === 0}
          aria-label="Move up"
          title="Move up"
        >
          <ArrowUp size={15} />
        </button>
        <button
          className="icon-button icon-button--tiny"
          onClick={() => onMove(index, index + 1)}
          disabled={index === length - 1}
          aria-label="Move down"
          title="Move down"
        >
          <ArrowDown size={15} />
        </button>
        <button
          className="icon-button icon-button--tiny icon-button--danger"
          onClick={() => onRemove(index)}
          aria-label="Remove"
          title="Remove"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}

function moveItem(array, from, to) {
  if (to < 0 || to >= array.length) return
  const [item] = array.splice(from, 1)
  array.splice(to, 0, item)
}

export function ContentEditor({ draft, update, onGoToMedia }) {
  const [open, setOpen] = useState('identity')

  const moveSection = (index, nextIndex) => {
    update((next) => {
      moveItem(next.sections.order, index, nextIndex)
    })
  }

  const toggleSection = (id) => {
    update((next) => {
      const hidden = new Set(next.sections.hidden || [])
      if (hidden.has(id)) hidden.delete(id)
      else hidden.add(id)
      next.sections.hidden = [...hidden]
    })
  }

  return (
    <div className="content-editor">
      <Accordion
        id="identity"
        title="Identity & summary"
        description="Name, exact title, home introduction, and professional summary"
        icon={FileText}
        open={open}
        setOpen={setOpen}
      >
        <div className="field-grid">
          <Field
            label="Display name"
            value={draft.identity.name}
            onChange={(value) =>
              update((next) => {
                next.identity.name = value
              })
            }
          />
          <Field
            label="Name as written on resume"
            value={draft.identity.resumeName}
            onChange={(value) =>
              update((next) => {
                next.identity.resumeName = value
              })
            }
          />
        </div>
        <Field
          label="Professional title"
          value={draft.identity.title}
          onChange={(value) =>
            update((next) => {
              next.identity.title = value
            })
          }
          hint="Kept exactly as supplied in the resume unless you change it."
        />
        <Field
          label="Location"
          value={draft.identity.location}
          onChange={(value) =>
            update((next) => {
              next.identity.location = value
            })
          }
        />
        <Field
          label="Home introduction"
          value={draft.identity.intro}
          onChange={(value) =>
            update((next) => {
              next.identity.intro = value
            })
          }
          multiline
          rows={4}
        />
        <Field
          label="Professional summary"
          value={draft.summary}
          onChange={(value) =>
            update((next) => {
              next.summary = value
            })
          }
          multiline
          rows={7}
        />
      </Accordion>

      <Accordion
        id="contact"
        title="Contact"
        description="Decide exactly which contact details visitors can see"
        icon={Link2}
        open={open}
        setOpen={setOpen}
        badge={`${draft.contact.links?.length || 0} links`}
      >
        <div className="field-grid">
          <Field
            label="Email"
            type="email"
            value={draft.contact.email}
            onChange={(value) =>
              update((next) => {
                next.contact.email = value
              })
            }
          />
          <Field
            label="Phone"
            value={draft.contact.phone}
            onChange={(value) =>
              update((next) => {
                next.contact.phone = value
              })
            }
          />
        </div>
        <div className="visibility-row">
          <Toggle
            checked={Boolean(draft.contact.visible?.email)}
            onChange={(checked) =>
              update((next) => {
                next.contact.visible.email = checked
              })
            }
            label="Show email to visitors"
          />
          <Toggle
            checked={Boolean(draft.contact.visible?.phone)}
            onChange={(checked) =>
              update((next) => {
                next.contact.visible.phone = checked
              })
            }
            label="Show phone to visitors"
          />
        </div>

        <div className="editor-subheading">
          <h4>Professional and portfolio links</h4>
          <button
            className="button button--tiny button--secondary"
            onClick={() =>
              update((next) => {
                next.contact.links.push({
                  id: uid('link'),
                  label: 'Portfolio',
                  url: '',
                  visible: true,
                })
              })
            }
          >
            <Plus size={14} /> Add link
          </button>
        </div>
        <div className="stack stack--editor">
          {draft.contact.links?.map((link, index) => (
            <div className="editor-item editor-item--compact" key={link.id || index}>
              <ItemHeader
                title={link.label || 'New link'}
                subtitle={link.url}
                index={index}
                length={draft.contact.links.length}
                onMove={(from, to) =>
                  update((next) => {
                    moveItem(next.contact.links, from, to)
                  })
                }
                onRemove={(removeIndex) =>
                  update((next) => {
                    next.contact.links.splice(removeIndex, 1)
                  })
                }
              />
              <div className="field-grid">
                <Field
                  label="Label"
                  value={link.label}
                  onChange={(value) =>
                    update((next) => {
                      next.contact.links[index].label = value
                    })
                  }
                />
                <Field
                  label="URL"
                  value={link.url}
                  onChange={(value) =>
                    update((next) => {
                      next.contact.links[index].url = value
                    })
                  }
                />
              </div>
              <Toggle
                checked={Boolean(link.visible)}
                onChange={(checked) =>
                  update((next) => {
                    next.contact.links[index].visible = checked
                  })
                }
                label="Visible to visitors"
              />
            </div>
          ))}
        </div>
      </Accordion>

      <Accordion
        id="skills"
        title="Skills"
        description="Grouped capabilities, with no invented proficiency scores"
        icon={Sparkles}
        open={open}
        setOpen={setOpen}
        badge={`${draft.skills.length} groups`}
      >
        <div className="stack stack--editor">
          {draft.skills.map((group, index) => (
            <div className="editor-item editor-item--compact" key={group.id || index}>
              <ItemHeader
                title={group.category}
                subtitle={`${group.items.length} skills`}
                index={index}
                length={draft.skills.length}
                onMove={(from, to) =>
                  update((next) => {
                    moveItem(next.skills, from, to)
                  })
                }
                onRemove={(removeIndex) =>
                  update((next) => {
                    next.skills.splice(removeIndex, 1)
                  })
                }
              />
              <Field
                label="Category"
                value={group.category}
                onChange={(value) =>
                  update((next) => {
                    next.skills[index].category = value
                  })
                }
              />
              <Field
                label="Skills"
                value={group.items.join(', ')}
                onChange={(value) =>
                  update((next) => {
                    next.skills[index].items = commaToArray(value)
                  })
                }
                hint="Separate skills with commas."
              />
            </div>
          ))}
        </div>
        <button
          className="button button--secondary button--full"
          onClick={() =>
            update((next) => {
              next.skills.push({ id: uid('skill'), category: 'New category', items: [] })
            })
          }
        >
          <Plus size={15} /> Add skill group
        </button>
      </Accordion>

      <Accordion
        id="experience"
        title="Work experience"
        description="Roles, dates, responsibilities, and skills used"
        icon={BriefcaseBusiness}
        open={open}
        setOpen={setOpen}
        badge={`${draft.experience.length} ${draft.experience.length === 1 ? 'role' : 'roles'}`}
      >
        <div className="stack stack--editor">
          {draft.experience.map((entry, index) => (
            <div className="editor-item" key={entry.id || index}>
              <ItemHeader
                title={entry.role}
                subtitle={entry.company}
                index={index}
                length={draft.experience.length}
                onMove={(from, to) =>
                  update((next) => {
                    moveItem(next.experience, from, to)
                  })
                }
                onRemove={(removeIndex) => {
                  if (window.confirm('Remove this experience entry?')) {
                    update((next) => {
                      next.experience.splice(removeIndex, 1)
                    })
                  }
                }}
              />
              <div className="field-grid">
                <Field
                  label="Role"
                  value={entry.role}
                  onChange={(value) =>
                    update((next) => {
                      next.experience[index].role = value
                    })
                  }
                />
                <Field
                  label="Company"
                  value={entry.company}
                  onChange={(value) =>
                    update((next) => {
                      next.experience[index].company = value
                    })
                  }
                />
                <Field
                  label="Location"
                  value={entry.location}
                  onChange={(value) =>
                    update((next) => {
                      next.experience[index].location = value
                    })
                  }
                />
                <Field
                  label="Dates"
                  value={entry.dates}
                  onChange={(value) =>
                    update((next) => {
                      next.experience[index].dates = value
                    })
                  }
                  placeholder="May 2023 – Present"
                />
              </div>
              <Field
                label="Concise summary"
                value={entry.summary}
                onChange={(value) =>
                  update((next) => {
                    next.experience[index].summary = value
                  })
                }
                multiline
                rows={3}
              />
              <Field
                label="Responsibilities"
                value={(entry.bullets || []).join('\n')}
                onChange={(value) =>
                  update((next) => {
                    next.experience[index].bullets = linesToArray(value)
                  })
                }
                multiline
                rows={6}
                hint="One responsibility per line."
              />
              <Field
                label="Achievements"
                value={(entry.achievements || []).join('\n')}
                onChange={(value) =>
                  update((next) => {
                    next.experience[index].achievements = linesToArray(value)
                  })
                }
                multiline
                rows={3}
                hint="Optional. Leave blank if the resume does not list separate achievements."
              />
              <Field
                label="Skills applied"
                value={(entry.skills || []).join(', ')}
                onChange={(value) =>
                  update((next) => {
                    next.experience[index].skills = commaToArray(value)
                  })
                }
                hint="Separate skills with commas."
              />
            </div>
          ))}
        </div>
        <button
          className="button button--secondary button--full"
          onClick={() =>
            update((next) => {
              next.experience.push({
                id: uid('experience'),
                role: 'New role',
                company: '',
                location: '',
                dates: '',
                summary: '',
                bullets: [],
                skills: [],
                achievements: [],
              })
            })
          }
        >
          <Plus size={15} /> Add experience
        </button>
      </Accordion>

      <Accordion
        id="projects"
        title="Projects"
        description="Purpose, contribution, features, technologies, and real links only"
        icon={Layers3}
        open={open}
        setOpen={setOpen}
        badge={`${draft.projects.length} projects`}
      >
        <div className="stack stack--editor">
          {draft.projects.map((project, index) => (
            <div className="editor-item" key={project.id || index}>
              <ItemHeader
                title={project.name}
                subtitle={project.subtitle}
                index={index}
                length={draft.projects.length}
                onMove={(from, to) =>
                  update((next) => {
                    moveItem(next.projects, from, to)
                  })
                }
                onRemove={(removeIndex) => {
                  if (window.confirm(`Remove “${project.name}”?`)) {
                    update((next) => {
                      next.projects.splice(removeIndex, 1)
                      if (next.featuredProjectId === project.id) {
                        next.featuredProjectId = next.projects[0]?.id || null
                      }
                    })
                  }
                }}
              />
              <div className="field-grid">
                <Field
                  label="Project name"
                  value={project.name}
                  onChange={(value) =>
                    update((next) => {
                      next.projects[index].name = value
                    })
                  }
                />
                <Field
                  label="Subtitle"
                  value={project.subtitle}
                  onChange={(value) =>
                    update((next) => {
                      next.projects[index].subtitle = value
                    })
                  }
                />
                <Field
                  label="Role"
                  value={project.role}
                  onChange={(value) =>
                    update((next) => {
                      next.projects[index].role = value
                    })
                  }
                />
                <Field
                  label="Status"
                  value={project.status}
                  onChange={(value) =>
                    update((next) => {
                      next.projects[index].status = value
                    })
                  }
                  placeholder="Ongoing, Shipped, etc."
                />
              </div>
              <Field
                label="Short description"
                value={project.summary}
                onChange={(value) =>
                  update((next) => {
                    next.projects[index].summary = value
                  })
                }
                multiline
                rows={3}
              />
              <Field
                label="Technologies"
                value={(project.technologies || []).join(', ')}
                onChange={(value) =>
                  update((next) => {
                    next.projects[index].technologies = commaToArray(value)
                  })
                }
                hint="Only technologies supported by the resume."
              />
              <Field
                label="Purpose"
                value={project.purpose}
                onChange={(value) =>
                  update((next) => {
                    next.projects[index].purpose = value
                  })
                }
                multiline
                rows={3}
              />
              <Field
                label="My contribution"
                value={project.contribution}
                onChange={(value) =>
                  update((next) => {
                    next.projects[index].contribution = value
                  })
                }
                multiline
                rows={5}
              />
              <Field
                label="Main features"
                value={(project.features || []).join('\n')}
                onChange={(value) =>
                  update((next) => {
                    next.projects[index].features = linesToArray(value)
                  })
                }
                multiline
                rows={4}
                hint="One feature per line."
              />
              <Field
                label="Challenges and solutions"
                value={project.challenges}
                onChange={(value) =>
                  update((next) => {
                    next.projects[index].challenges = value
                  })
                }
                multiline
                rows={3}
                hint="Leave blank if this was not provided in the resume."
              />
              <Field
                label="Project links"
                value={linksToText(project.links)}
                onChange={(value) =>
                  update((next) => {
                    next.projects[index].links = textToLinks(value)
                  })
                }
                multiline
                rows={3}
                hint="One per line, as Label | https://example.com. Blank links are hidden from visitors."
              />
              <Toggle
                checked={draft.featuredProjectId === project.id}
                onChange={(checked) =>
                  update((next) => {
                    if (checked) {
                      next.featuredProjectId = project.id
                      next.projects.forEach((item) => {
                        item.featured = item.id === project.id
                      })
                    }
                  })
                }
                label="Feature this project on Home"
              />
            </div>
          ))}
        </div>
        <button
          className="button button--secondary button--full"
          onClick={() =>
            update((next) => {
              next.projects.push({
                id: uid('project'),
                name: 'New project',
                subtitle: '',
                summary: '',
                role: '',
                status: '',
                featured: false,
                technologies: [],
                stackNote: '',
                purpose: '',
                contribution: '',
                features: [],
                challenges: '',
                screenshots: [],
                links: [],
              })
            })
          }
        >
          <Plus size={15} /> Add project
        </button>
      </Accordion>

      <Accordion
        id="education"
        title="Education"
        description="Degrees, institutions, locations, and dates"
        icon={GraduationCap}
        open={open}
        setOpen={setOpen}
        badge={`${draft.education.length} entries`}
      >
        <div className="stack stack--editor">
          {draft.education.map((entry, index) => (
            <div className="editor-item editor-item--compact" key={entry.id || index}>
              <ItemHeader
                title={entry.degree}
                subtitle={entry.institution}
                index={index}
                length={draft.education.length}
                onMove={(from, to) =>
                  update((next) => {
                    moveItem(next.education, from, to)
                  })
                }
                onRemove={(removeIndex) => {
                  if (window.confirm('Remove this education entry?')) {
                    update((next) => {
                      next.education.splice(removeIndex, 1)
                    })
                  }
                }}
              />
              <Field
                label="Degree"
                value={entry.degree}
                onChange={(value) =>
                  update((next) => {
                    next.education[index].degree = value
                  })
                }
              />
              <Field
                label="Institution"
                value={entry.institution}
                onChange={(value) =>
                  update((next) => {
                    next.education[index].institution = value
                  })
                }
              />
              <div className="field-grid">
                <Field
                  label="Location"
                  value={entry.location}
                  onChange={(value) =>
                    update((next) => {
                      next.education[index].location = value
                    })
                  }
                />
                <Field
                  label="Dates"
                  value={entry.dates}
                  onChange={(value) =>
                    update((next) => {
                      next.education[index].dates = value
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>
        <button
          className="button button--secondary button--full"
          onClick={() =>
            update((next) => {
              next.education.push({
                id: uid('education'),
                degree: '',
                institution: '',
                location: '',
                dates: '',
                details: '',
              })
            })
          }
        >
          <Plus size={15} /> Add education
        </button>
      </Accordion>

      <Accordion
        id="extras"
        title="Certifications & achievements"
        description="Optional, clearly separated, and hidden when empty"
        icon={BadgeCheck}
        open={open}
        setOpen={setOpen}
        badge={`${draft.certifications.length + draft.achievements.length} entries`}
      >
        <Field
          label="Certifications"
          value={(draft.certifications || []).join('\n')}
          onChange={(value) =>
            update((next) => {
              next.certifications = linesToArray(value)
            })
          }
          multiline
          rows={4}
          hint="One certification per line. This section stays hidden while empty."
        />
        <Field
          label="Achievements"
          value={(draft.achievements || []).join('\n')}
          onChange={(value) =>
            update((next) => {
              next.achievements = linesToArray(value)
            })
          }
          multiline
          rows={4}
          hint="One achievement per line. Never invent numbers or awards."
        />
      </Accordion>

      <Accordion
        id="languages"
        title="Languages & interests"
        description="Optional personal context beyond the work"
        icon={Languages}
        open={open}
        setOpen={setOpen}
        badge={`${draft.languages.length} languages`}
      >
        <Field
          label="Languages"
          value={(draft.languages || []).join(', ')}
          onChange={(value) =>
            update((next) => {
              next.languages = commaToArray(value)
            })
          }
          hint="Separate languages with commas."
        />
        <Field
          label="Interests"
          value={(draft.interests || []).join(', ')}
          onChange={(value) =>
            update((next) => {
              next.interests = commaToArray(value)
            })
          }
          hint="Leave blank if the resume does not list interests."
        />
      </Accordion>

      <Accordion
        id="resume-file"
        title="Resume file"
        description="Attach, replace, or remove the original document"
        icon={FileText}
        open={open}
        setOpen={setOpen}
        badge={draft.resume?.fileName || 'None'}
      >
        <div className="resume-editor-status">
          <span className="resume-file__icon">
            <FileText size={22} />
          </span>
          <div>
            <strong>{draft.resume?.fileName || 'No resume attached'}</strong>
            <span>
              {draft.resume?.key
                ? 'Stored locally in this browser.'
                : draft.resume?.builtinUrl
                  ? 'Original resume bundled with this portfolio.'
                  : 'Visitors will not see a Resume section until a file is attached.'}
            </span>
          </div>
        </div>
        <button className="button button--secondary button--full" onClick={onGoToMedia}>
          <Upload size={15} /> Manage resume file in Media
        </button>
      </Accordion>

      <Accordion
        id="order"
        title="Section visibility & order"
        description="Control what appears and the order of the story index"
        icon={Trophy}
        open={open}
        setOpen={setOpen}
      >
        <p className="editor-help">
          Hidden sections disappear everywhere. Empty sections stay hidden automatically. Use the
          arrows to reorder the section index on About Me.
        </p>
        <div className="section-order-list">
          {draft.sections.order.map((id, index) => {
            const definition = SECTION_DEFINITIONS.find((item) => item.id === id)
            if (!definition) return null
            const hidden = draft.sections.hidden.includes(id)
            const supported = hasContent(id, draft)
            return (
              <div className={`section-order-row ${hidden ? 'is-hidden' : ''}`} key={id}>
                <span className="section-order-row__icon">
                  <SectionIcon name={definition.icon} size={17} />
                </span>
                <span className="section-order-row__copy">
                  <strong>{definition.label}</strong>
                  <span>{supported ? 'Has content' : 'No content yet'}</span>
                </span>
                <div className="section-order-row__actions">
                  <button
                    className="icon-button icon-button--tiny"
                    onClick={() => moveSection(index, index - 1)}
                    disabled={index === 0}
                    aria-label={`Move ${definition.label} up`}
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    className="icon-button icon-button--tiny"
                    onClick={() => moveSection(index, index + 1)}
                    disabled={index === draft.sections.order.length - 1}
                    aria-label={`Move ${definition.label} down`}
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    className={`icon-button icon-button--tiny ${hidden ? '' : 'is-active'}`}
                    onClick={() => toggleSection(id)}
                    aria-label={hidden ? `Show ${definition.label}` : `Hide ${definition.label}`}
                    title={hidden ? 'Hidden from visitors' : 'Visible to visitors'}
                  >
                    {hidden ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </Accordion>

      <Accordion
        id="review"
        title="Needs review"
        description="Uncategorized content is preserved here, never silently dropped"
        icon={Sparkles}
        open={open}
        setOpen={setOpen}
        badge={`${draft.reviewNotes.length} notes`}
      >
        {draft.reviewNotes?.length ? (
          <ul className="review-list">
            {draft.reviewNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        ) : (
          <p className="muted-copy">No unresolved notes.</p>
        )}
        <Field
          label="Uncategorized resume content"
          value={draft.uncategorized}
          onChange={(value) =>
            update((next) => {
              next.uncategorized = value
            })
          }
          multiline
          rows={7}
          hint="Anything that could not be confidently categorized is kept here."
        />
      </Accordion>
    </div>
  )
}
