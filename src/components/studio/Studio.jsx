import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  Eye,
  FileSearch,
  ImagePlus,
  LayoutTemplate,
  LoaderCircle,
  Save,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react'
import { ContentEditor } from './ContentEditor'
import { MediaEditor } from './MediaEditor'
import { PhotoFrame } from '../PhotoFrame'
import { SectionIcon } from '../SectionIcon'
import { SECTION_DEFINITIONS } from '../../data/defaultPortfolio'
import { mergeParsedResume, parseResumeText } from '../../lib/resumeParser'
import { deleteMediaRecord, saveMediaBlob } from '../../lib/mediaStore'
import { getOrderedSections, isSectionSupported } from '../../lib/utils'

const STEPS = [
  { id: 'paste', label: 'Resume', icon: FileSearch },
  { id: 'review', label: 'Review', icon: Check },
  { id: 'edit', label: 'Edit', icon: SlidersHorizontal },
  { id: 'media', label: 'Media', icon: ImagePlus },
  { id: 'preview', label: 'Preview', icon: LayoutTemplate },
]

const clone = (value) => JSON.parse(JSON.stringify(value))

function studioFileUrl(blob) {
  return blob ? URL.createObjectURL(blob) : null
}

function PreviewMock({ draft, photoUrl }) {
  const sections = getOrderedSections(draft)
  const featured =
    draft.projects.find((project) => project.id === draft.featuredProjectId) ||
    draft.projects.find((project) => project.featured) ||
    draft.projects[0]
  return (
    <div className="preview-device">
      <div className="preview-device__top">
        <span className="preview-device__mark">MT</span>
        <span className="preview-device__name">{draft.identity.name}</span>
        <span className="preview-device__theme">Theme</span>
      </div>
      <div className="preview-device__portrait">
        <PhotoFrame
          portfolio={draft}
          photoUrl={photoUrl}
          onOpen={() => {}}
          compact
          portraitOnly
        />
      </div>
      <h4>{draft.identity.name}</h4>
      <p className="preview-device__title">{draft.identity.title}</p>
      <p className="preview-device__intro">{draft.identity.intro}</p>
      <div className="preview-device__audio">
        <span>
          <Sparkles size={15} />
        </span>
        <div>
          <strong>{draft.audio?.key ? 'Audio introduction ready' : 'Audio introduction'}</strong>
          <small>
            {draft.audio?.key ? 'A recording is attached' : 'Honest empty state until audio is added'}
          </small>
        </div>
      </div>
      <div className="preview-device__actions">
        <span>Explore my work</span>
        <span>Contact me</span>
      </div>
      {featured ? (
        <div className="preview-device__project">
          <span>Featured project</span>
          <strong>{featured.name}</strong>
          <small>{featured.subtitle}</small>
        </div>
      ) : null}
      <div className="preview-device__sections">
        {sections.slice(0, 6).map((id) => {
          const definition = SECTION_DEFINITIONS.find((item) => item.id === id)
          return (
            <span key={id}>
              <SectionIcon name={definition.icon} size={12} /> {definition.shortLabel}
            </span>
          )
        })}
        {!sections.length ? <span>No sections visible yet</span> : null}
      </div>
    </div>
  )
}

export function Studio({
  portfolio,
  mediaUrls,
  initialStep = 0,
  onClose,
  onSave,
  onPreview,
  onToast,
}) {
  const initialJson = useMemo(() => JSON.stringify(portfolio), [portfolio])
  const [draft, setDraft] = useState(() => clone(portfolio))
  const [step, setStep] = useState(Math.min(4, Math.max(0, initialStep)))
  const [photoUrl, setPhotoUrl] = useState(mediaUrls.photo || null)
  const [audioUrl, setAudioUrl] = useState(mediaUrls.audio || null)
  const [resumeUrl, setResumeUrl] = useState(mediaUrls.resume || null)
  const [confirmClose, setConfirmClose] = useState(false)
  const [saving, setSaving] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [parseSummary, setParseSummary] = useState(null)
  const mainRef = useRef(null)
  const sessionKeys = useRef(new Set())
  const localUrls = useRef(new Set())
  const keepMediaOnUnmount = useRef(false)
  const dirty = JSON.stringify(draft) !== initialJson

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        if (confirmClose) setConfirmClose(false)
        else if (dirty) setConfirmClose(true)
        else onClose()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [confirmClose, dirty, onClose])

  useEffect(() => {
    return () => {
      for (const url of localUrls.current) URL.revokeObjectURL(url)
      if (!keepMediaOnUnmount.current) {
        for (const key of sessionKeys.current) deleteMediaRecord(key).catch(() => {})
      }
    }
  }, [])

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  const update = (producer) => {
    setDraft((current) => {
      const next = clone(current)
      producer(next)
      return next
    })
  }

  const setLocalUrl = (type, url) => {
    if (type === 'photo') {
      if (photoUrl && localUrls.current.has(photoUrl)) {
        URL.revokeObjectURL(photoUrl)
        localUrls.current.delete(photoUrl)
      }
      setPhotoUrl(url)
    } else if (type === 'audio') {
      if (audioUrl && localUrls.current.has(audioUrl)) {
        URL.revokeObjectURL(audioUrl)
        localUrls.current.delete(audioUrl)
      }
      setAudioUrl(url)
    } else if (type === 'resume') {
      if (resumeUrl && localUrls.current.has(resumeUrl)) {
        URL.revokeObjectURL(resumeUrl)
        localUrls.current.delete(resumeUrl)
      }
      setResumeUrl(url)
    }
    if (url) localUrls.current.add(url)
  }

  const removeNewMedia = async (key) => {
    if (!key || !sessionKeys.current.has(key)) return
    sessionKeys.current.delete(key)
    await deleteMediaRecord(key).catch(() => {})
  }

  const handlePhotoFile = async (file) => {
    const record = await saveMediaBlob(file, file.name)
    sessionKeys.current.add(record.key)
    const url = studioFileUrl(record.blob)
    setLocalUrl('photo', url)
    const previousKey = draft.photo?.key
    update((next) => {
      next.photo = {
        ...next.photo,
        key: record.key,
        fileName: record.name,
      }
    })
    await removeNewMedia(previousKey)
  }

  const handlePhotoRemove = async () => {
    const previousKey = draft.photo?.key
    update((next) => {
      next.photo = { ...next.photo, key: null, fileName: '' }
    })
    setLocalUrl('photo', null)
    await removeNewMedia(previousKey)
  }

  const handleAudioBlob = async (blob, fileName) => {
    const record = await saveMediaBlob(blob, fileName)
    sessionKeys.current.add(record.key)
    const url = studioFileUrl(record.blob)
    setLocalUrl('audio', url)
    const previousKey = draft.audio?.key
    update((next) => {
      next.audio = {
        ...next.audio,
        key: record.key,
        fileName: record.name,
        mimeType: record.type,
        durationHint: next.audio?.durationHint || 0,
      }
    })
    await removeNewMedia(previousKey)
  }

  const handleAudioRemove = async () => {
    const previousKey = draft.audio?.key
    update((next) => {
      next.audio = { ...next.audio, key: null, fileName: '', mimeType: '', durationHint: 0 }
    })
    setLocalUrl('audio', null)
    await removeNewMedia(previousKey)
  }

  const handleResumeFile = async (file) => {
    const record = await saveMediaBlob(file, file.name)
    sessionKeys.current.add(record.key)
    const url = studioFileUrl(record.blob)
    setLocalUrl('resume', url)
    const previousKey = draft.resume?.key
    update((next) => {
      next.resume = {
        key: record.key,
        fileName: record.name,
        size: record.size,
        builtinUrl: '',
      }
    })
    await removeNewMedia(previousKey)
  }

  const handleResumeRemove = async () => {
    const previousKey = draft.resume?.key
    update((next) => {
      next.resume = { ...next.resume, key: null, fileName: '', size: null, builtinUrl: '' }
    })
    setLocalUrl('resume', null)
    await removeNewMedia(previousKey)
  }

  const runExtraction = () => {
    if (!draft.resumeText?.trim()) {
      onToast?.({ type: 'error', message: 'Paste your resume text first.' })
      return false
    }
    setExtracting(true)
    try {
      const parsed = parseResumeText(draft.resumeText)
      const merged = mergeParsedResume(draft, parsed)
      merged.resumeText = draft.resumeText
      setDraft(merged)
      setParseSummary({
        sections: [
          parsed.summary ? 'summary' : null,
          parsed.skills.length ? 'skills' : null,
          parsed.experience.length ? 'experience' : null,
          parsed.projects.length ? 'projects' : null,
          parsed.education.length ? 'education' : null,
          parsed.languages.length ? 'languages' : null,
        ].filter(Boolean),
        notes: parsed.reviewNotes.length,
      })
      onToast?.({
        type: parsed.hasAnySection ? 'success' : 'info',
        message: parsed.hasAnySection
          ? 'Resume extracted locally. Review what we found next.'
          : 'The text was preserved, but standard sections need a manual review.',
      })
      return true
    } catch (error) {
      onToast?.({ type: 'error', message: 'The resume could not be parsed. Your text is preserved.' })
      return false
    } finally {
      setExtracting(false)
    }
  }

  const handleContinue = () => {
    if (step === 0) {
      const ok = runExtraction()
      if (ok) setStep(1)
      return
    }
    if (step < 4) setStep(step + 1)
    else handleSave(false)
  }

  const closeNow = () => {
    sessionKeys.current.clear()
    onClose()
  }

  const requestClose = () => {
    if (dirty) setConfirmClose(true)
    else closeNow()
  }

  const handleSave = async (preview = false) => {
    if (!draft.identity.name?.trim()) {
      onToast?.({ type: 'error', message: 'Add your name before saving the portfolio.' })
      setStep(2)
      return
    }
    setSaving(true)
    keepMediaOnUnmount.current = true
    try {
      const next = {
        ...clone(draft),
        lastSavedAt: new Date().toISOString(),
        identity: {
          ...draft.identity,
          name: draft.identity.name.trim(),
        },
      }
      if (preview) await onPreview(next)
      else await onSave(next)
      sessionKeys.current.clear()
    } catch (error) {
      keepMediaOnUnmount.current = false
      onToast?.({ type: 'error', message: error.message || 'Changes could not be saved.' })
    } finally {
      setSaving(false)
    }
  }

  const visibleSectionCount = getOrderedSections(draft).length
  const mediaReady = Boolean(photoUrl || draft.photo?.key === null)

  return createPortal(
    <div className="studio" role="dialog" aria-modal="true" aria-label="Portfolio Studio">
      <header className="studio__header">
        <button className="icon-button" onClick={requestClose} aria-label="Close Studio">
          <ChevronLeft size={21} />
        </button>
        <div className="studio__title">
          <span className="studio__mark">Studio</span>
          <strong>Shape your portfolio</strong>
        </div>
        <button
          className="button button--primary button--small studio__save-top"
          onClick={() => handleSave(false)}
          disabled={saving}
        >
          {saving ? <LoaderCircle size={15} className="spin" /> : <Save size={15} />}
          {saving ? 'Saving…' : 'Save'}
        </button>
      </header>

      <div className="studio-progress" role="group" aria-label="Studio steps">
        {STEPS.map((item, index) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              className={`studio-progress__step ${index === step ? 'is-active' : ''} ${index < step ? 'is-complete' : ''}`}
              onClick={() => setStep(index)}
              aria-current={index === step ? 'step' : undefined}
            >
              <span className="studio-progress__number">
                {index < step ? <Check size={13} /> : <Icon size={13} />}
              </span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>

      <main className="studio__main" ref={mainRef}>
        <div className="studio__content">
          {step === 0 ? (
            <section className="studio-step">
              <header className="studio-step__intro">
                <span className="studio-step__badge">
                  <FileSearch size={20} />
                </span>
                <p className="eyebrow">Step 1 · Source</p>
                <h1>Start with your resume</h1>
                <p>
                  Paste the text from the resume. Extraction happens entirely in this browser — no
                  upload, no third-party service.
                </p>
              </header>

              <label className="field">
                <span className="field__label">Resume text</span>
                <textarea
                  className="resume-textarea"
                  rows={18}
                  value={draft.resumeText}
                  onChange={(event) =>
                    update((next) => {
                      next.resumeText = event.target.value
                    })
                  }
                  placeholder="Paste your resume here…"
                />
                <span className="field__hint">
                  The full text is preserved even when a section cannot be categorized
                  confidently.
                </span>
              </label>

              <div className="privacy-note">
                <span className="privacy-note__icon">
                  <Check size={16} />
                </span>
                <p>
                  <strong>Private by default.</strong> Resume text, photos, documents, and audio
                  stay in local browser storage. Nothing is uploaded without your explicit consent.
                </p>
              </div>

              <button
                className="button button--primary button--full"
                onClick={() => {
                  if (runExtraction()) setStep(1)
                }}
                disabled={extracting}
              >
                {extracting ? (
                  <LoaderCircle size={17} className="spin" />
                ) : (
                  <Sparkles size={17} />
                )}
                {extracting ? 'Extracting locally…' : 'Extract my details'}
              </button>
            </section>
          ) : null}

          {step === 1 ? (
            <section className="studio-step">
              <header className="studio-step__intro">
                <span className="studio-step__badge">
                  <Eye size={20} />
                </span>
                <p className="eyebrow">Step 2 · Review</p>
                <h1>What we found</h1>
                <p>
                  Check the extracted information before editing. Anything uncertain is kept in
                  the review notes instead of being dropped.
                </p>
              </header>

              {parseSummary ? (
                <div className="detection-strip">
                  {parseSummary.sections.length ? (
                    parseSummary.sections.map((section) => (
                      <span key={section} className="detection-chip">
                        <Check size={13} /> {section}
                      </span>
                    ))
                  ) : (
                    <span className="detection-chip detection-chip--warn">
                      Manual review needed
                    </span>
                  )}
                </div>
              ) : null}

              <div className="review-card">
                <div className="field-grid">
                  <label className="field">
                    <span className="field__label">Name</span>
                    <input
                      value={draft.identity.name}
                      onChange={(event) =>
                        update((next) => {
                          next.identity.name = event.target.value
                        })
                      }
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Location</span>
                    <input
                      value={draft.identity.location}
                      onChange={(event) =>
                        update((next) => {
                          next.identity.location = event.target.value
                        })
                      }
                    />
                  </label>
                </div>
                <label className="field">
                  <span className="field__label">Professional title</span>
                  <input
                    value={draft.identity.title}
                    onChange={(event) =>
                      update((next) => {
                        next.identity.title = event.target.value
                      })
                    }
                  />
                </label>
                <div className="review-counts">
                  <div>
                    <strong>{draft.skills.length}</strong>
                    <span>skill groups</span>
                  </div>
                  <div>
                    <strong>{draft.experience.length}</strong>
                    <span>experience</span>
                  </div>
                  <div>
                    <strong>{draft.projects.length}</strong>
                    <span>projects</span>
                  </div>
                  <div>
                    <strong>{draft.education.length}</strong>
                    <span>education</span>
                  </div>
                </div>
              </div>

              <section className="review-notes-card">
                <div className="review-notes-card__heading">
                  <span>
                    <Sparkles size={18} />
                  </span>
                  <div>
                    <h3>Needs your review</h3>
                    <p>{draft.reviewNotes.length} notes preserved</p>
                  </div>
                </div>
                {draft.reviewNotes.length ? (
                  <ul className="review-list">
                    {draft.reviewNotes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted-copy">
                    Everything standard was categorized cleanly. You can still edit every field.
                  </p>
                )}
                {draft.uncategorized ? (
                  <details className="raw-review">
                    <summary>View uncategorized content</summary>
                    <pre>{draft.uncategorized}</pre>
                  </details>
                ) : null}
              </section>

              <button className="button button--primary button--full" onClick={() => setStep(2)}>
                Looks right — edit details <ArrowRight size={17} />
              </button>
            </section>
          ) : null}

          {step === 2 ? (
            <section className="studio-step">
              <header className="studio-step__intro">
                <span className="studio-step__badge">
                  <SlidersHorizontal size={20} />
                </span>
                <p className="eyebrow">Step 3 · Edit</p>
                <h1>Make it yours</h1>
                <p>
                  Every section is editable. Reorder sections, hide what you do not want to show,
                  and keep empty sections out of the visitor view.
                </p>
              </header>
              <ContentEditor draft={draft} update={update} onGoToMedia={() => setStep(3)} />
              <div className="step-nav-inline">
                <button className="button button--secondary" onClick={() => setStep(3)}>
                  Continue to media <ArrowRight size={16} />
                </button>
              </div>
            </section>
          ) : null}

          {step === 3 ? (
            <section className="studio-step">
              <header className="studio-step__intro">
                <span className="studio-step__badge">
                  <ImagePlus size={20} />
                </span>
                <p className="eyebrow">Step 4 · Media</p>
                <h1>Add your presence</h1>
                <p>
                  Replace the illustration with your photo, frame it carefully, and add a voice
                  introduction. Preview and delete anything before saving.
                </p>
              </header>
              <MediaEditor
                draft={draft}
                update={update}
                photoUrl={photoUrl}
                audioUrl={audioUrl}
                resumeUrl={resumeUrl}
                onPhotoFile={handlePhotoFile}
                onPhotoRemove={handlePhotoRemove}
                onAudioBlob={handleAudioBlob}
                onAudioRemove={handleAudioRemove}
                onResumeFile={handleResumeFile}
                onResumeRemove={handleResumeRemove}
                onToast={onToast}
                owner
              />
              <div className="step-nav-inline">
                <button className="button button--secondary" onClick={() => setStep(4)}>
                  Continue to preview <ArrowRight size={16} />
                </button>
              </div>
            </section>
          ) : null}

          {step === 4 ? (
            <section className="studio-step">
              <header className="studio-step__intro">
                <span className="studio-step__badge">
                  <LayoutTemplate size={20} />
                </span>
                <p className="eyebrow">Step 5 · Preview</p>
                <h1>See the visitor view</h1>
                <p>
                  A quiet, read-only preview. Visitor mode hides Studio, edit buttons, and content
                  controls while keeping navigation, themes, audio, and contact actions working.
                </p>
              </header>

              <div className="preview-layout">
                <PreviewMock draft={draft} photoUrl={photoUrl} />
                <div className="preview-side">
                  <div className="preview-summary-card">
                    <p className="eyebrow">Ready to preview</p>
                    <h3>{visibleSectionCount} visible sections</h3>
                    <ul>
                      <li>
                        <Check size={15} /> {photoUrl ? 'Custom portrait attached' : 'Illustrated placeholder in use'}
                      </li>
                      <li>
                        <Check size={15} />{' '}
                        {draft.audio?.key ? 'Audio introduction attached' : 'Honest audio empty state'}
                      </li>
                      <li>
                        <Check size={15} />{' '}
                        {draft.resume?.builtinUrl || draft.resume?.key
                          ? 'Resume file available'
                          : 'No resume file attached'}
                      </li>
                      <li>
                        <Check size={15} />{' '}
                        {mediaReady ? 'Photo framing checked' : 'Photo still loading'}
                      </li>
                    </ul>
                  </div>
                  <button className="button button--primary button--full" onClick={() => handleSave(true)}>
                    <Eye size={17} /> Open visitor preview
                  </button>
                  <button className="button button--secondary button--full" onClick={() => handleSave(false)}>
                    <Save size={17} /> Save & finish
                  </button>
                  <p className="fine-print">
                    Visitor preview is temporary. Use the small “Exit preview” control or press
                    Escape to return to Studio access.
                  </p>
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </main>

      <footer className="studio__footer">
        <button
          className="button button--ghost button--small"
          onClick={() => (step === 0 ? requestClose() : setStep(step - 1))}
        >
          <ArrowLeft size={15} /> {step === 0 ? 'Cancel' : 'Back'}
        </button>
        <span className="studio__footer-note">
          {dirty ? 'Unsaved changes' : 'Everything saved'}
        </span>
        {step < 4 ? (
          <button
            className="button button--primary button--small"
            onClick={handleContinue}
            disabled={saving || extracting}
          >
            Continue <ArrowRight size={15} />
          </button>
        ) : (
          <button
            className="button button--primary button--small"
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            {saving ? <LoaderCircle size={15} className="spin" /> : <Save size={15} />}
            Save & finish
          </button>
        )}
      </footer>

      {confirmClose ? (
        <div className="confirm-overlay" role="presentation">
          <div className="confirm-card" role="dialog" aria-modal="true" aria-labelledby="discard-title">
            <span className="confirm-card__icon">
              <X size={20} />
            </span>
            <h2 id="discard-title">Discard unsaved changes?</h2>
            <p>Your current edits and newly added media will not be added to the portfolio.</p>
            <div className="confirm-card__actions">
              <button className="button button--ghost button--small" onClick={() => setConfirmClose(false)}>
                Keep editing
              </button>
              <button className="button button--danger button--small" onClick={closeNow}>
                Discard changes
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>,
    document.body,
  )
}
