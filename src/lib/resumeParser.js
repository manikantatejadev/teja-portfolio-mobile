const SECTION_PATTERNS = {
  summary: /^(PROFESSIONAL\s+SUMMARY|CAREER\s+SUMMARY|SUMMARY|PROFILE)$/i,
  skills: /^(TECHNICAL\s+SKILLS|CORE\s+SKILLS|SKILLS|TECHNOLOGIES)$/i,
  experience: /^(PROFESSIONAL\s+EXPERIENCE|WORK\s+EXPERIENCE|EMPLOYMENT(\s+HISTORY)?|EXPERIENCE)$/i,
  projects: /^(PROJECT\s+EXPERIENCE|SELECTED\s+PROJECTS|PROJECTS?|PORTFOLIO)$/i,
  education: /^(EDUCATION|ACADEMIC\s+BACKGROUND)$/i,
  certifications: /^(CERTIFICATIONS?|LICENSES?\s*(&|AND)\s*CERTIFICATIONS?|CERTIFICATES?)$/i,
  achievements: /^(ACHIEVEMENTS?|AWARDS?|HONORS?)$/i,
  languages: /^(LANGUAGES?)$/i,
  interests: /^(INTERESTS?|HOBBIES)$/i,
}

const MONTHS =
  /(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)/i
const DATE_HINT = new RegExp(`\\b(19|20)\\d{2}\\b|present|current|${MONTHS.source}`, 'i')

const BULLET = /^[\s•▪◦●‣·\-–—*]+/
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
const PHONE = /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3,5}\)?[\s.-]?)?\d{3,5}[\s.-]?\d{3,5}/
const LINKEDIN = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s|,]+/i
const URL_PATTERN = /(?:https?:\/\/|www\.)[^\s|,]+/i

const cleanLine = (value) =>
  value
    .replace(/\u00a0/g, ' ')
    .replace(/\t/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const stripBullet = (line) => cleanLine(line.replace(BULLET, ''))

const isHeading = (line) => {
  const candidate = line.replace(/[:\s]+$/, '')
  return Object.values(SECTION_PATTERNS).some((pattern) => pattern.test(candidate))
}

const sectionForLine = (line) => {
  const candidate = line.replace(/[:\s]+$/, '')
  for (const [key, pattern] of Object.entries(SECTION_PATTERNS)) {
    if (pattern.test(candidate)) return key
  }
  return null
}

const likelyUnknownHeading = (line) => {
  if (!line || line.length > 54) return false
  if (line.includes('|') || line.includes('@') || /\d{4}/.test(line)) return false
  if (line.split(' ').length > 5) return false
  return /^[A-Z][A-Z0-9 &/()'.+-]{2,}$/.test(line)
}

const parseContact = (headerLines) => {
  const joined = headerLines.join('  ')
  const email = joined.match(EMAIL)?.[0] || ''
  const phoneMatch = joined.match(PHONE)?.[0] || ''
  const phone = phoneMatch && phoneMatch.replace(/\D/g, '').length >= 10 ? phoneMatch.trim() : ''
  const linkedinMatch = joined.match(LINKEDIN)?.[0] || ''
  const linkedin = linkedinMatch ? `https://${linkedinMatch.replace(/^https?:\/\//i, '')}` : ''
  const websiteMatch = joined.match(URL_PATTERN)?.[0] || ''
  const website = websiteMatch && !/linkedin/i.test(websiteMatch) ? websiteMatch : ''

  const locationCandidates = headerLines
    .flatMap((line) => line.split('|'))
    .map(cleanLine)
    .filter((part) => part && !EMAIL.test(part) && !LINKEDIN.test(part))
    .filter((part) => /^[A-Za-z .'-]+(?:,\s*[A-Za-z .'-]+)+$/.test(part))
  const location = locationCandidates[0] || ''

  return {
    location,
    contact: {
      email,
      phone,
      visible: { email: Boolean(email), phone: Boolean(phone) },
      links: [
        ...(linkedin
          ? [{ id: 'linkedin', label: 'LinkedIn', url: linkedin, visible: true }]
          : []),
        ...(website
          ? [{ id: 'website', label: 'Portfolio', url: website, visible: true }]
          : []),
      ],
    },
  }
}

const parseSkills = (lines) => {
  const groups = []
  for (const rawLine of lines) {
    const line = stripBullet(rawLine)
    if (!line) continue
    const colon = line.indexOf(':')
    let category = 'Skills'
    let values = line
    if (colon > 0 && colon < 68) {
      category = cleanLine(line.slice(0, colon))
      values = line.slice(colon + 1)
    }
    const items = values
      .split(/[,;]/)
      .map(cleanLine)
      .filter(Boolean)
    if (!items.length) continue
    const existing = groups.find(
      (group) => group.category.toLowerCase() === category.toLowerCase(),
    )
    if (existing) {
      existing.items.push(...items.filter((item) => !existing.items.includes(item)))
    } else {
      groups.push({
        id: `skill-${groups.length + 1}`,
        category,
        items: [...new Set(items)],
      })
    }
  }
  return groups
}

const parseExperienceHeader = (line) => {
  const parts = line.split('|').map(cleanLine).filter(Boolean)
  if (!parts.length) return null
  let dates = ''
  if (parts.length > 1 && DATE_HINT.test(parts[parts.length - 1])) {
    dates = parts.pop()
  }
  const role = parts[0] || ''
  const company = parts[1] || ''
  const location = parts.slice(2).join(', ')
  return {
    id: `experience-${Date.now()}`,
    role,
    company,
    location,
    dates,
    summary: '',
    bullets: [],
    skills: [],
    achievements: [],
  }
}

const parseExperience = (lines) => {
  const entries = []
  let current = null
  let fallbackId = 0

  for (const rawLine of lines) {
    const line = cleanLine(rawLine)
    if (!line) continue
    const parts = line.split('|')
    const looksLikeEntry =
      parts.length >= 2 &&
      (parts.length >= 3 || DATE_HINT.test(line)) &&
      !/^technologies?\s*:/i.test(line)

    if (looksLikeEntry) {
      current = parseExperienceHeader(line)
      if (current) {
        fallbackId += 1
        current.id = `experience-${fallbackId}`
        entries.push(current)
      }
    } else if (current) {
      current.bullets.push(stripBullet(line))
    }
  }

  for (const entry of entries) {
    entry.bullets = entry.bullets.filter(Boolean)
    entry.summary = entry.bullets[0] || `${entry.role}${entry.company ? ` at ${entry.company}` : ''}`
  }
  return entries
}

const parseTechnologies = (line) => {
  const value = cleanLine(line.replace(/^technologies?\s*:\s*/i, ''))
  const note = /not provided|specific stack|unspecified/i.test(value)
  return {
    technologies: note
      ? []
      : value
          .split(/[,;]/)
          .map(cleanLine)
          .filter(Boolean),
    stackNote: note ? value : '',
  }
}

const isProjectHeader = (line, nextLine) => {
  if (!line || /^technologies?\s*:/i.test(line)) return false
  if (line.includes('|')) return true
  return Boolean(nextLine && /^technologies?\s*:/i.test(nextLine))
}

const parseProjects = (lines, defaultRole = '') => {
  const projects = []
  let current = null
  let index = 0

  for (let i = 0; i < lines.length; i += 1) {
    const line = cleanLine(lines[i])
    if (!line) continue

    if (/^technologies?\s*:/i.test(line)) {
      if (current) Object.assign(current, parseTechnologies(line))
      continue
    }

    const next = lines[i + 1] ? cleanLine(lines[i + 1]) : ''
    if (isProjectHeader(line, next)) {
      index += 1
      const [titlePart, ...subtitleParts] = line.split('|').map(cleanLine)
      let name = titlePart
      let status = ''
      const statusMatch = name.match(/\s+[—–-]\s*(ongoing|current|in progress)\s*$/i)
      if (statusMatch) {
        status = statusMatch[1]
        name = name.replace(statusMatch[0], '').trim()
      }
      current = {
        id: `project-${index}`,
        name,
        subtitle: subtitleParts.join(' | '),
        summary: '',
        role: defaultRole,
        status,
        featured: false,
        technologies: [],
        stackNote: '',
        purpose: '',
        contribution: '',
        features: [],
        challenges: '',
        screenshots: [],
        links: [],
        bullets: [],
      }
      projects.push(current)
    } else if (current) {
      current.bullets.push(stripBullet(line))
    }
  }

  for (const project of projects) {
    project.bullets = project.bullets.filter(Boolean)
    project.summary = project.bullets[0] || project.subtitle || ''
    project.purpose = project.bullets[0] || project.summary
    project.contribution = project.bullets.join('\n')
    project.features = []
    delete project.bullets
  }

  if (projects.length && !projects.some((project) => project.featured)) {
    projects[0].featured = true
  }
  return projects
}

const parseEducation = (lines) => {
  const clean = lines.map(stripBullet).filter(Boolean)
  if (!clean.length) return []

  const entries = []
  for (const line of clean) {
    const last = entries[entries.length - 1]
    if (line.includes('|')) {
      const parts = line.split('|').map(cleanLine).filter(Boolean)
      const institution = parts[0] || ''
      const location = parts[1] && !DATE_HINT.test(parts[1]) ? parts[1] : ''
      const dates = parts.find((part) => DATE_HINT.test(part)) || ''
      if (last && !last.institution) {
        last.institution = institution
        last.location = location
        last.dates = dates
      } else {
        entries.push({
          id: `education-${entries.length + 1}`,
          degree: '',
          institution,
          location,
          dates,
          details: '',
        })
      }
      continue
    }

    const looksLikeInstitution =
      /university|college|institute|school|academy/i.test(line) &&
      Boolean(last &&
        (last.degree || last.institution) &&
        !last.institution)

    if (looksLikeInstitution) {
      last.institution = line
      continue
    }

    const looksLikeDegree =
      /bachelor|master|b\.?tech|m\.?tech|b\.?sc|m\.?sc|degree|diploma|ph\.?d|intermediate/i.test(
        line,
      ) || Boolean(last?.institution && !last.degree)

    if (looksLikeDegree) {
      if (last && !last.degree) {
        last.degree = line
        last.dates = last.dates || line.match(/\b(19|20)\d{2}\s*[–-]\s*((19|20)\d{2}|present)\b/i)?.[0] || ''
      } else {
        entries.push({
          id: `education-${entries.length + 1}`,
          degree: line,
          institution: '',
          location: '',
          dates:
            line.match(/\b(19|20)\d{2}\s*[–-]\s*((19|20)\d{2}|present)\b/i)?.[0] || '',
          details: '',
        })
      }
      continue
    }

    if (last && !last.details) last.details = line
  }

  return entries
}

const parseList = (lines) =>
  lines
    .map(stripBullet)
    .join(', ')
    .split(/[,;]/)
    .map(cleanLine)
    .filter(Boolean)

const looksLikeName = (line) =>
  Boolean(
    line &&
      line.length <= 60 &&
      !EMAIL.test(line) &&
      !LINKEDIN.test(line) &&
      !/\d/.test(line) &&
      !isHeading(line),
  )

export function parseResumeText(text) {
  const raw = String(text || '').replace(/\r/g, '')
  const lines = raw
    .split('\n')
    .map(cleanLine)
    .filter((line) => line && !/^---\s*page\s+\d+\s*---$/i.test(line))

  const blocks = { header: [] }
  const unknownBlocks = {}
  let current = null

  for (const line of lines) {
    const section = sectionForLine(line)
    if (section) {
      current = section
      blocks[section] = blocks[section] || []
      continue
    }

    if (current && likelyUnknownHeading(line) && !isHeading(line)) {
      const key = `unknown-${line}`
      current = key
      if (!unknownBlocks[line]) unknownBlocks[line] = []
      unknownBlocks[line].push(line)
      continue
    }

    if (current) {
      if (!blocks[current]) blocks[current] = []
      blocks[current].push(line)
    } else {
      blocks.header.push(line)
    }
  }

  const header = blocks.header || []
  const name = looksLikeName(header[0]) ? header[0] : ''
  const title =
    header[1] && !EMAIL.test(header[1]) && !LINKEDIN.test(header[1]) && !/\d{4}/.test(header[1])
      ? header[1]
      : ''
  const contactMeta = parseContact(header)

  const experience = parseExperience(blocks.experience || [])
  const defaultRole = experience[0]?.role || ''

  const parsed = {
    identity: {
      name: name
        ? name
            .toLowerCase()
            .split(/\s+/)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        : '',
      resumeName: name,
      title: title ? title.toUpperCase() : '',
      location: contactMeta.location,
    },
    contact: contactMeta.contact,
    summary: (blocks.summary || []).join(' '),
    skills: parseSkills(blocks.skills || []),
    experience,
    projects: parseProjects(blocks.projects || [], defaultRole),
    education: parseEducation(blocks.education || []),
    certifications: parseList(blocks.certifications || []),
    achievements: parseList(blocks.achievements || []),
    languages: parseList(blocks.languages || []),
    interests: parseList(blocks.interests || []),
    reviewNotes: [],
    uncategorized: '',
    hasAnySection: ['summary', 'skills', 'experience', 'projects', 'education'].some(
      (key) => (blocks[key] || []).length > 0,
    ),
  }

  if (!parsed.contact.email && !parsed.contact.phone && !parsed.contact.links.length) {
    parsed.reviewNotes.push(
      'Contact details were not detected automatically. Please add them in the Contact editor.',
    )
  }
  if (!parsed.summary) {
    parsed.reviewNotes.push(
      'No professional summary section was detected. Your original text is preserved in the review notes.',
    )
  }
  if (!parsed.experience.length && (blocks.experience || []).length) {
    parsed.reviewNotes.push(
      'Work experience text was found, but role and date lines could not be separated confidently.',
    )
  }
  for (const project of parsed.projects) {
    if (!project.technologies.length) {
      parsed.reviewNotes.push(
        `No technology list was detected for “${project.name}”. The original note is preserved.`,
      )
    }
  }

  for (const [heading, content] of Object.entries(unknownBlocks)) {
    parsed.reviewNotes.push(
      `“${heading}” could not be confidently categorized. Its text is preserved under “Needs review”.`,
    )
    parsed.uncategorized += `${heading}\n${content.join('\n')}\n\n`
  }

  if (!parsed.hasAnySection && !parsed.reviewNotes.length) {
    parsed.reviewNotes.push(
      'The standard resume sections could not be identified. The full resume text is preserved below.',
    )
  }

  if (!parsed.hasAnySection) {
    parsed.uncategorized = raw.trim()
  }

  return parsed
}

export function mergeParsedResume(draft, parsed) {
  const next = JSON.parse(JSON.stringify(draft))
  next.resumeText = draft.resumeText
  next.reviewNotes = parsed.reviewNotes || []
  next.uncategorized = parsed.uncategorized || ''

  if (parsed.identity?.name) next.identity.name = parsed.identity.name
  if (parsed.identity?.resumeName) next.identity.resumeName = parsed.identity.resumeName
  if (parsed.identity?.title) next.identity.title = parsed.identity.title
  if (parsed.identity?.location) next.identity.location = parsed.identity.location

  if (parsed.contact) {
    if (parsed.contact.email) next.contact.email = parsed.contact.email
    if (parsed.contact.phone) next.contact.phone = parsed.contact.phone
    if (parsed.contact.links?.length) next.contact.links = parsed.contact.links
    if (parsed.contact.visible) {
      next.contact.visible = {
        ...next.contact.visible,
        ...parsed.contact.visible,
      }
    }
  }

  if (parsed.summary) next.summary = parsed.summary
  if (parsed.skills?.length) next.skills = parsed.skills
  if (parsed.experience?.length) next.experience = parsed.experience
  if (parsed.projects?.length) {
    next.projects = parsed.projects
    next.featuredProjectId =
      parsed.projects.find((project) => project.featured)?.id || parsed.projects[0].id
  }
  if (parsed.education?.length) next.education = parsed.education
  if (parsed.certifications?.length) next.certifications = parsed.certifications
  if (parsed.achievements?.length) next.achievements = parsed.achievements
  if (parsed.languages?.length) next.languages = parsed.languages
  if (parsed.interests?.length) next.interests = parsed.interests

  return next
}
