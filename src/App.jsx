import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CodeXml, Eye } from 'lucide-react'
import { BottomNav } from './components/BottomNav'
import { Sheet } from './components/Sheet'
import { ThemeSheet } from './components/ThemeSheet'
import { Toast } from './components/Toast'
import { TopBar } from './components/TopBar'
import { AudioSheet } from './components/sheets/AudioSheet'
import { ContactSheet } from './components/sheets/ContactSheet'
import { EducationSheet } from './components/sheets/EducationSheet'
import { ExperienceSheet } from './components/sheets/ExperienceSheet'
import { PortfolioListSheet } from './components/sheets/PortfolioListSheet'
import { PortraitSheet } from './components/sheets/PortraitSheet'
import { ProjectSheet } from './components/sheets/ProjectSheet'
import { ResumeSheet } from './components/sheets/ResumeSheet'
import { SkillsSheet } from './components/sheets/SkillsSheet'
import { SummarySheet } from './components/sheets/SummarySheet'
import { Studio } from './components/studio/Studio'
import { createDefaultPortfolio, SECTION_DEFINITIONS } from './data/defaultPortfolio'
import { deleteMediaRecord, getMediaUrl } from './lib/mediaStore'
import { useAudioController } from './lib/utils'
import { About } from './screens/About'
import { Home } from './screens/Home'
import { Journey } from './screens/Journey'
import { Work } from './screens/Work'

const STORAGE_KEY = 'manikanta-portfolio-v1'
const THEME_KEY = 'manikanta-portfolio-theme'
const TEXT_SIZE_KEY = 'manikanta-portfolio-text-size'
const VALID_ROUTES = new Set(['home', 'journey', 'work', 'about'])
const VALID_THEMES = new Set(['midnight', 'pearl', 'ocean'])

function mergeWithDefaults(saved) {
  const defaults = createDefaultPortfolio()
  if (!saved || typeof saved !== 'object') return defaults
  const merged = {
    ...defaults,
    ...saved,
    identity: { ...defaults.identity, ...(saved.identity || {}) },
    contact: {
      ...defaults.contact,
      ...(saved.contact || {}),
      visible: { ...defaults.contact.visible, ...(saved.contact?.visible || {}) },
      links: Array.isArray(saved.contact?.links) ? saved.contact.links : defaults.contact.links,
    },
    sections: {
      order: Array.isArray(saved.sections?.order)
        ? saved.sections.order
        : defaults.sections.order,
      hidden: Array.isArray(saved.sections?.hidden)
        ? saved.sections.hidden
        : defaults.sections.hidden,
    },
    audio: { ...defaults.audio, ...(saved.audio || {}) },
    photo: { ...defaults.photo, ...(saved.photo || {}) },
    resume: { ...defaults.resume, ...(saved.resume || {}) },
  }

  // The bundled narration is shipped with the app, so its URL and voice description always
  // come from the current defaults. Only an uploaded file (a key) overrides it.
  if (!merged.audio.key) {
    merged.audio.builtinUrl = defaults.audio.builtinUrl
    merged.audio.generated = defaults.audio.generated
    merged.audio.voice = defaults.audio.voice
  }

  for (const definition of SECTION_DEFINITIONS) {
    if (!merged.sections.order.includes(definition.id)) {
      merged.sections.order.push(definition.id)
    }
  }
  merged.sections.order = merged.sections.order.filter((id) =>
    SECTION_DEFINITIONS.some((definition) => definition.id === id),
  )
  for (const key of [
    'skills',
    'experience',
    'projects',
    'education',
    'certifications',
    'achievements',
    'languages',
    'interests',
    'reviewNotes',
  ]) {
    if (!Array.isArray(merged[key])) merged[key] = defaults[key]
  }
  return merged
}

function loadPortfolio() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? mergeWithDefaults(JSON.parse(raw)) : createDefaultPortfolio()
  } catch {
    return createDefaultPortfolio()
  }
}

function loadTheme() {
  try {
    const stored = window.localStorage.getItem(THEME_KEY)
    return VALID_THEMES.has(stored) ? stored : 'midnight'
  } catch {
    return 'midnight'
  }
}

function loadTextSize() {
  try {
    return window.localStorage.getItem(TEXT_SIZE_KEY) === 'large' ? 'large' : 'standard'
  } catch {
    return 'standard'
  }
}

function readRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '').trim()
  return VALID_ROUTES.has(hash) ? hash : 'home'
}

export default function App() {
  const [portfolio, setPortfolio] = useState(loadPortfolio)
  const [theme, setTheme] = useState(loadTheme)
  const [textSize, setTextSize] = useState(loadTextSize)
  const [route, setRoute] = useState(readRoute)
  const [sheet, setSheet] = useState(null)
  const sheetRef = useRef(null)
  const [themeOpen, setThemeOpen] = useState(false)
  const [studioOpen, setStudioOpen] = useState(false)
  const [studioStep, setStudioStep] = useState(0)
  const [visitorMode, setVisitorMode] = useState(false)
  const [mediaUrls, setMediaUrls] = useState({ photo: null, audio: null, resume: null })
  const [mediaLoading, setMediaLoading] = useState(true)
  const [mediaReady, setMediaReady] = useState(false)
  const [booted, setBooted] = useState(false)
  const [splashMounted, setSplashMounted] = useState(true)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const storageErrorShown = useRef(false)
  const owner = !visitorMode

  const showToast = useCallback((nextToast) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    setToast({ type: 'info', ...nextToast })
    toastTimer.current = window.setTimeout(() => setToast(null), 3600)
  }, [])

  useEffect(() => {
    sheetRef.current = sheet
  }, [sheet])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      window.localStorage.setItem(THEME_KEY, theme)
    } catch {
      // Theme still applies for this session.
    }
    const colors = { midnight: '#0a0d1a', pearl: '#f5f0e8', ocean: '#061b1d' }
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', colors[theme] || colors.midnight)
  }, [theme])

  useEffect(() => {
    document.documentElement.dataset.textSize = textSize
    try {
      window.localStorage.setItem(TEXT_SIZE_KEY, textSize)
    } catch {
      // Preference still applies for this session.
    }
  }, [textSize])

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio))
    } catch {
      if (!storageErrorShown.current) {
        storageErrorShown.current = true
        showToast({
          type: 'error',
          message: 'This browser could not save the latest changes. Free up local storage and try again.',
        })
      }
    }
  }, [portfolio, showToast])

  const photoKey = portfolio.photo?.key || ''
  const audioKey = portfolio.audio?.key || ''
  const audioBuiltin = portfolio.audio?.builtinUrl || ''
  const resumeKey = portfolio.resume?.key || ''
  const resumeBuiltin = portfolio.resume?.builtinUrl || ''

  useEffect(() => {
    let cancelled = false
    const created = []

    async function hydrate() {
      setMediaLoading(true)
      const [photo, audio, resume] = await Promise.allSettled([
        photoKey ? getMediaUrl(photoKey) : Promise.resolve(null),
        audioKey ? getMediaUrl(audioKey) : Promise.resolve(audioBuiltin || null),
        resumeKey ? getMediaUrl(resumeKey) : Promise.resolve(resumeBuiltin || null),
      ])

      if (cancelled) {
        for (const result of [photo, audio, resume]) {
          if (result.status === 'fulfilled' && result.value?.startsWith('blob:')) {
            URL.revokeObjectURL(result.value)
          }
        }
        return
      }

      const next = {
        photo: photo.status === 'fulfilled' ? photo.value : null,
        audio: audio.status === 'fulfilled' ? audio.value : null,
        resume: resume.status === 'fulfilled' ? resume.value : null,
      }
      for (const value of Object.values(next)) {
        if (value?.startsWith('blob:')) created.push(value)
      }
      setMediaUrls(next)
      setMediaLoading(false)
      setMediaReady(true)
    }

    hydrate().catch(() => {
      if (!cancelled) {
        setMediaUrls({ photo: null, audio: audioBuiltin || null, resume: resumeBuiltin || null })
        setMediaLoading(false)
        setMediaReady(true)
      }
    })

    return () => {
      cancelled = true
      for (const url of created) URL.revokeObjectURL(url)
    }
  }, [photoKey, audioKey, audioBuiltin, resumeKey, resumeBuiltin])

  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (!mediaReady) {
      const fallback = window.setTimeout(() => setMediaReady(true), 2200)
      return () => window.clearTimeout(fallback)
    }
    const revealDelay = window.setTimeout(() => setBooted(true), reduceMotion ? 80 : 900)
    const splashDelay = window.setTimeout(
      () => setSplashMounted(false),
      reduceMotion ? 250 : 1450,
    )
    return () => {
      window.clearTimeout(revealDelay)
      window.clearTimeout(splashDelay)
    }
  }, [mediaReady])

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute())
    window.addEventListener('hashchange', onHashChange)
    const onPopState = () => {
      if (sheetRef.current) setSheet(null)
    }
    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('hashchange', onHashChange)
      window.removeEventListener('popstate', onPopState)
    }
  }, [])

  const audio = useAudioController(mediaUrls.audio, portfolio.audio?.durationHint)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    audio.pause()
    // Route changes intentionally stop an in-progress introduction.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route])

  const navigate = useCallback((nextRoute) => {
    if (!VALID_ROUTES.has(nextRoute)) return
    if (nextRoute === route) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (window.location.hash !== `#/${nextRoute}`) {
      window.location.hash = `/${nextRoute}`
    }
    setRoute(nextRoute)
  }, [route])

  const openSheet = useCallback((nextSheet) => {
    if (!sheetRef.current && !window.history.state?.portfolioPanel) {
      window.history.pushState(
        { ...(window.history.state || {}), portfolioPanel: true },
        '',
      )
    }
    setSheet(nextSheet)
  }, [])

  const closeSheet = useCallback(() => {
    if (window.history.state?.portfolioPanel) {
      window.history.back()
    } else {
      setSheet(null)
    }
  }, [])

  const clearSheetForStudio = () => {
    setSheet(null)
    if (window.history.state?.portfolioPanel) {
      window.history.replaceState(
        { ...(window.history.state || {}), portfolioPanel: false },
        '',
      )
    }
  }

  const openStudio = useCallback((step = 0) => {
    clearSheetForStudio()
    audio.pause()
    setStudioStep(step)
    setStudioOpen(true)
  }, [audio])

  const closeStudio = () => {
    setStudioOpen(false)
    setStudioStep(0)
  }

  const cleanupReplacedMedia = async (previous, next) => {
    const pairs = [
      [previous.photo?.key, next.photo?.key],
      [previous.audio?.key, next.audio?.key],
      [previous.resume?.key, next.resume?.key],
    ]
    for (const [oldKey, newKey] of pairs) {
      if (oldKey && oldKey !== newKey) {
        await deleteMediaRecord(oldKey).catch(() => {})
      }
    }
  }

  const savePortfolio = async (next, { preview = false } = {}) => {
    const previous = portfolio
    await cleanupReplacedMedia(previous, next)
    setPortfolio(next)
    closeStudio()
    setVisitorMode(preview)
    if (preview) {
      navigate('home')
      showToast({
        type: 'success',
        message: 'Visitor preview opened. Editing controls are hidden.',
      })
    } else {
      showToast({ type: 'success', message: 'Portfolio saved on this device.' })
    }
  }

  const exitVisitorPreview = () => {
    setVisitorMode(false)
    setStudioStep(4)
    setStudioOpen(true)
  }

  const openAudioEditor = () => openStudio(3)
  const openPhotoEditor = () => openStudio(3)
  const openContactVisibility = () => openStudio(2)

  const sheetNode = useMemo(() => {
    if (!sheet) return null
    const close = closeSheet
    switch (sheet.type) {
      case 'portrait':
        return (
          <PortraitSheet
            portfolio={portfolio}
            photoUrl={mediaUrls.photo}
            onClose={close}
            owner={owner}
            onEditPhoto={openPhotoEditor}
          />
        )
      case 'audio':
        return (
          <AudioSheet
            portfolio={portfolio}
            audioUrl={mediaUrls.audio}
            audio={audio}
            mediaLoading={mediaLoading && Boolean(portfolio.audio?.key) && !mediaUrls.audio}
            onClose={close}
            onEdit={openAudioEditor}
            owner={owner}
          />
        )
      case 'project': {
        const project = portfolio.projects.find((item) => item.id === sheet.id)
        return <ProjectSheet project={project} portfolio={portfolio} onClose={close} />
      }
      case 'experience': {
        const entry = portfolio.experience.find((item) => item.id === sheet.id)
        return (
          <ExperienceSheet entry={entry} portfolio={portfolio} onClose={close} />
        )
      }
      case 'skills':
        return <SkillsSheet portfolio={portfolio} onClose={close} />
      case 'education':
        return <EducationSheet portfolio={portfolio} onClose={close} />
      case 'certifications':
      case 'achievements':
      case 'languages':
        return (
          <PortfolioListSheet
            type={sheet.type}
            portfolio={portfolio}
            onClose={close}
          />
        )
      case 'summary':
        return (
          <SummarySheet
            portfolio={portfolio}
            onClose={close}
            onContact={() => setSheet({ type: 'contact' })}
          />
        )
      case 'resume':
        return (
          <ResumeSheet
            portfolio={portfolio}
            resumeUrl={mediaUrls.resume}
            mediaLoading={mediaLoading && Boolean(portfolio.resume?.key) && !mediaUrls.resume}
            onClose={close}
            onToast={showToast}
            owner={owner}
            onEdit={() => openStudio(3)}
          />
        )
      case 'contact':
        return (
          <ContactSheet
            portfolio={portfolio}
            onClose={close}
            onToast={showToast}
            owner={owner}
            onEditVisibility={openContactVisibility}
          />
        )
      default:
        return null
    }
  }, [
    sheet,
    portfolio,
    mediaUrls,
    audio,
    mediaLoading,
    owner,
    closeSheet,
    showToast,
    openPhotoEditor,
    openAudioEditor,
    openContactVisibility,
  ])

  let screen = null
  if (route === 'home') {
    screen = (
      <Home
        portfolio={portfolio}
        photoUrl={mediaUrls.photo}
        audioUrl={mediaUrls.audio}
        audio={audio}
        mediaLoading={mediaLoading}
        navigate={navigate}
        openSheet={openSheet}
        onEditPhoto={openPhotoEditor}
        onEditAudio={openAudioEditor}
        owner={owner}
      />
    )
  } else if (route === 'journey') {
    screen = <Journey portfolio={portfolio} openSheet={openSheet} navigate={navigate} />
  } else if (route === 'work') {
    screen = <Work portfolio={portfolio} openSheet={openSheet} />
  } else {
    screen = (
      <About
        portfolio={portfolio}
        openSheet={openSheet}
        navigate={navigate}
        owner={owner}
        onCustomize={() => openStudio(2)}
      />
    )
  }

  return (
    <div className="app-frame">
      <div className="ambient" aria-hidden="true">
        <span className="ambient__orb ambient__orb--one" />
        <span className="ambient__orb ambient__orb--two" />
        <span className="ambient__grid" />
      </div>

      <div className={`app-shell ${booted ? 'is-ready' : 'is-booting'}`}>
        <TopBar
          name={portfolio.identity.name}
          owner={owner}
          onHome={() => navigate('home')}
          onTheme={() => setThemeOpen(true)}
          onCustomize={() => openStudio(2)}
        />

        {visitorMode ? (
          <div className="visitor-banner" role="status">
            <span>
              <Eye size={14} /> Visitor preview · editing controls are hidden
            </span>
            <button onClick={exitVisitorPreview}>Exit preview</button>
          </div>
        ) : null}

        <main className="app-main" key={route}>
          {screen}
        </main>

        <BottomNav route={route} navigate={navigate} />
      </div>

      <Toast toast={toast} />

      {themeOpen ? (
        <Sheet
          title="Appearance"
          eyebrow="Make it yours"
          onClose={() => setThemeOpen(false)}
        >
          <ThemeSheet
            theme={theme}
            setTheme={setTheme}
            textSize={textSize}
            setTextSize={setTextSize}
          />
        </Sheet>
      ) : null}

      {sheetNode}

      {studioOpen ? (
        <Studio
          portfolio={portfolio}
          mediaUrls={mediaUrls}
          initialStep={studioStep}
          onClose={closeStudio}
          onSave={(next) => savePortfolio(next)}
          onPreview={(next) => savePortfolio(next, { preview: true })}
          onToast={showToast}
        />
      ) : null}

      {splashMounted ? (
        <div className={`splash ${booted ? 'is-done' : ''}`} aria-hidden="true">
          <div className="splash__code">
            <CodeXml strokeWidth={1.5} />
            <span className="splash__caret" />
          </div>
          <span className="splash__name">{portfolio.identity.name}</span>
          <span className="splash__rule" />
        </div>
      ) : null}
    </div>
  )
}
