import { useEffect, useRef, useState } from 'react'
import {
  Camera,
  Check,
  FileText,
  ImagePlus,
  LoaderCircle,
  Mic,
  Pause,
  Play,
  RotateCcw,
  Square,
  Trash2,
  Upload,
  Volume2,
  Waves,
} from 'lucide-react'
import { PhotoFrame } from '../PhotoFrame'
import {
  fileExtension,
  formatFileSize,
  useSpeechPreview,
} from '../../lib/utils'

function formatClock(seconds) {
  const minutes = Math.floor(seconds / 60)
  const rest = String(seconds % 60).padStart(2, '0')
  return `${minutes}:${rest}`
}

export function MediaEditor({
  draft,
  update,
  photoUrl,
  audioUrl,
  resumeUrl,
  onPhotoFile,
  onPhotoRemove,
  onAudioBlob,
  onAudioRemove,
  onResumeFile,
  onResumeRemove,
  onToast,
  owner,
}) {
  const photoInput = useRef(null)
  const audioInput = useRef(null)
  const resumeInput = useRef(null)
  const previewAudioRef = useRef(null)
  const recorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const [recording, setRecording] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [busy, setBusy] = useState('')
  const [photoError, setPhotoError] = useState('')
  const speech = useSpeechPreview(draft.audio?.transcript || '')
  const hasPhoto = Boolean(draft.photo?.key)
  const hasAudio = Boolean(draft.audio?.key)
  const hasResume = Boolean(draft.resume?.builtinUrl || draft.resume?.key)

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  const handlePhotoSelect = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      onToast?.({ type: 'error', message: 'Please choose an image file.' })
      return
    }
    if (file.size > 15 * 1024 * 1024) {
      onToast?.({ type: 'error', message: 'Please choose an image smaller than 15 MB.' })
      return
    }
    setBusy('photo')
    setPhotoError('')
    try {
      await onPhotoFile(file)
      onToast?.({ type: 'success', message: 'Portrait updated. Adjust the framing below.' })
    } catch (error) {
      setPhotoError(error.message || 'The photo could not be saved.')
      onToast?.({ type: 'error', message: error.message || 'The photo could not be saved.' })
    } finally {
      setBusy('')
      if (photoInput.current) photoInput.current.value = ''
    }
  }

  const handleAudioSelect = async (file) => {
    if (!file) return
    if (!file.type.startsWith('audio/')) {
      onToast?.({ type: 'error', message: 'Please choose an audio file.' })
      return
    }
    if (file.size > 30 * 1024 * 1024) {
      onToast?.({ type: 'error', message: 'Please choose an audio file smaller than 30 MB.' })
      return
    }
    setBusy('audio')
    try {
      await onAudioBlob(file, file.name)
      onToast?.({ type: 'success', message: 'Audio introduction attached.' })
    } catch (error) {
      onToast?.({ type: 'error', message: error.message || 'The audio could not be saved.' })
    } finally {
      setBusy('')
      if (audioInput.current) audioInput.current.value = ''
    }
  }

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      onToast?.({
        type: 'error',
        message: 'Recording is not available in this browser. You can upload an audio file instead.',
      })
      return
    }
    speech.stop()
    previewAudioRef.current?.pause()
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      const preferred = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((type) =>
        window.MediaRecorder.isTypeSupported?.(type),
      )
      const recorder = new MediaRecorder(stream, preferred ? { mimeType: preferred } : undefined)
      recorderRef.current = recorder
      recorder.ondataavailable = (event) => {
        if (event.data?.size) chunksRef.current.push(event.data)
      }
      recorder.onstop = async () => {
        const type = recorder.mimeType || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type })
        stream.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        setRecording(false)
        if (timerRef.current) window.clearInterval(timerRef.current)
        if (blob.size) {
          const extension = type.includes('mp4') ? 'm4a' : 'webm'
          setBusy('recording-save')
          try {
            await onAudioBlob(blob, `introduction.${extension}`)
            onToast?.({ type: 'success', message: 'Recording saved on this device.' })
          } catch (error) {
            onToast?.({ type: 'error', message: error.message || 'The recording could not be saved.' })
          } finally {
            setBusy('')
          }
        }
      }
      recorder.start()
      setRecordSeconds(0)
      setRecording(true)
      timerRef.current = window.setInterval(() => {
        setRecordSeconds((seconds) => seconds + 1)
      }, 1000)
    } catch (error) {
      const message =
        error.name === 'NotAllowedError' || error.name === 'SecurityError'
          ? 'Microphone access was blocked. Allow microphone permission in your browser, or upload an audio file instead.'
          : error.name === 'NotFoundError'
            ? 'No microphone was found. You can upload an audio file instead.'
            : 'The microphone could not be started. You can upload an audio file instead.'
      onToast?.({ type: 'error', message })
    }
  }

  const stopRecording = () => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop()
    }
    if (timerRef.current) window.clearInterval(timerRef.current)
  }

  const cancelRecording = () => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.onstop = null
      recorderRef.current.stop()
    }
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (timerRef.current) window.clearInterval(timerRef.current)
    setRecording(false)
    setRecordSeconds(0)
  }

  const handleResumeSelect = async (file) => {
    if (!file) return
    const valid =
      file.type === 'application/pdf' ||
      file.type.includes('word') ||
      /\.(pdf|doc|docx|txt)$/i.test(file.name)
    if (!valid) {
      onToast?.({ type: 'error', message: 'Please choose a PDF, DOC, DOCX, or TXT file.' })
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      onToast?.({ type: 'error', message: 'Please choose a resume file smaller than 20 MB.' })
      return
    }
    setBusy('resume')
    try {
      await onResumeFile(file)
      onToast?.({ type: 'success', message: 'Resume file attached locally.' })
    } catch (error) {
      onToast?.({ type: 'error', message: error.message || 'The resume could not be attached.' })
    } finally {
      setBusy('')
      if (resumeInput.current) resumeInput.current.value = ''
    }
  }

  const toggleSpeech = () => {
    if (!speech.speaking) previewAudioRef.current?.pause()
    speech.toggle()
  }

  return (
    <div className="media-editor">
      <section className="studio-panel">
        <div className="studio-panel__heading">
          <span className="studio-panel__icon">
            <Camera size={20} />
          </span>
          <div>
            <p className="eyebrow">Main visual</p>
            <h3>Your portrait</h3>
            <p>The illustrated avatar is a placeholder until you add a real photo.</p>
          </div>
        </div>

        <div className="media-photo-layout">
          <PhotoFrame
            portfolio={draft}
            photoUrl={photoUrl}
            owner={false}
            onOpen={() => {}}
            compact
            portraitOnly
          />
          <div className="media-photo-actions">
            <input
              ref={photoInput}
              type="file"
              accept="image/*"
              hidden
              onChange={(event) => handlePhotoSelect(event.target.files?.[0])}
            />
            <button
              className="button button--secondary button--small"
              onClick={() => photoInput.current?.click()}
              disabled={busy === 'photo'}
            >
              {busy === 'photo' ? (
                <LoaderCircle size={16} className="spin" />
              ) : hasPhoto ? (
                <ImagePlus size={16} />
              ) : (
                <Upload size={16} />
              )}
              {busy === 'photo' ? 'Saving…' : hasPhoto ? 'Replace photo' : 'Choose photo'}
            </button>
            {hasPhoto ? (
              <button
                className="button button--ghost button--small"
                onClick={async () => {
                  await onPhotoRemove()
                  onToast?.({ type: 'info', message: 'Photo removed. The illustration is back.' })
                }}
              >
                <Trash2 size={15} /> Remove
              </button>
            ) : null}
            <p className="fine-print">
              JPG, PNG, or WebP up to 15 MB. The file stays in this browser and is never uploaded
              without your explicit share action.
            </p>
            {photoError ? (
              <p className="inline-error" role="alert">
                {photoError}
              </p>
            ) : null}
          </div>
        </div>

        {hasPhoto ? (
          <div className="photo-position">
            <div className="field-grid field-grid--three">
              <label className="range-field">
                <span>
                  Horizontal <strong>{draft.photo.x}%</strong>
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={draft.photo.x}
                  onChange={(event) =>
                    update((next) => {
                      next.photo.x = Number(event.target.value)
                    })
                  }
                />
              </label>
              <label className="range-field">
                <span>
                  Vertical <strong>{draft.photo.y}%</strong>
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={draft.photo.y}
                  onChange={(event) =>
                    update((next) => {
                      next.photo.y = Number(event.target.value)
                    })
                  }
                />
              </label>
              <label className="range-field">
                <span>
                  Zoom <strong>{draft.photo.zoom.toFixed(2)}×</strong>
                </span>
                <input
                  type="range"
                  min="1"
                  max="2.5"
                  step="0.01"
                  value={draft.photo.zoom}
                  onChange={(event) =>
                    update((next) => {
                      next.photo.zoom = Number(event.target.value)
                    })
                  }
                />
              </label>
            </div>
            <button
              className="text-button"
              onClick={() =>
                update((next) => {
                  next.photo.x = 50
                  next.photo.y = 50
                  next.photo.zoom = 1
                })
              }
            >
              <RotateCcw size={14} /> Reset framing
            </button>
          </div>
        ) : null}
      </section>

      <section className="studio-panel">
        <div className="studio-panel__heading">
          <span className="studio-panel__icon studio-panel__icon--teal">
            <Mic size={20} />
          </span>
          <div>
            <p className="eyebrow">Audio introduction</p>
            <h3>Hear my story</h3>
            <p>Record here or attach an audio file. Nothing ever autoplays.</p>
          </div>
        </div>

        {recording ? (
          <div className="recording-card" aria-live="polite">
            <span className="recording-dot" aria-hidden="true" />
            <div className="recording-card__copy">
              <strong>Recording now</strong>
              <span>{formatClock(recordSeconds)}</span>
            </div>
            <div className="recording-bars" aria-hidden="true">
              {Array.from({ length: 14 }).map((_, index) => (
                <span key={index} style={{ '--i': index }} />
              ))}
            </div>
            <div className="recording-card__actions">
              <button className="button button--primary button--small" onClick={stopRecording}>
                <Square size={14} fill="currentColor" /> Stop
              </button>
              <button className="button button--ghost button--small" onClick={cancelRecording}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="audio-upload-actions">
            <button className="button button--primary button--small" onClick={startRecording}>
              <Mic size={16} /> Record introduction
            </button>
            <input
              ref={audioInput}
              type="file"
              accept="audio/*"
              hidden
              onChange={(event) => handleAudioSelect(event.target.files?.[0])}
            />
            <button
              className="button button--secondary button--small"
              onClick={() => audioInput.current?.click()}
              disabled={busy === 'audio'}
            >
              {busy === 'audio' ? (
                <LoaderCircle size={16} className="spin" />
              ) : (
                <Upload size={16} />
              )}
              {busy === 'audio' ? 'Saving…' : 'Upload audio'}
            </button>
            {hasAudio || busy === 'recording-save' ? (
              <span className="audio-status">
                {busy === 'recording-save' ? (
                  <>
                    <LoaderCircle size={14} className="spin" /> Saving recording…
                  </>
                ) : (
                  <>
                    <Check size={14} /> Audio attached
                  </>
                )}
              </span>
            ) : null}
          </div>
        )}

        {hasAudio && audioUrl ? (
          <div className="audio-file-preview">
            <audio ref={previewAudioRef} controls src={audioUrl} preload="metadata" />
            <div className="audio-file-preview__meta">
              <span>
                <Waves size={15} /> {draft.audio.fileName || 'Introduction'}
              </span>
              <button
                className="text-button text-button--danger"
                onClick={async () => {
                  previewAudioRef.current?.pause()
                  await onAudioRemove()
                  onToast?.({ type: 'info', message: 'Audio introduction removed.' })
                }}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
            <p className="fine-print">
              This is the actual recording stored locally. Preview it before saving your portfolio.
            </p>
          </div>
        ) : hasAudio ? (
          <p className="inline-note">Loading the locally saved recording…</p>
        ) : (
          <div className="media-empty">
            <Volume2 size={20} />
            <div>
              <strong>No audio introduction yet</strong>
              <span>The visitor view shows an honest empty state until you add one.</span>
            </div>
          </div>
        )}

        <label className="field">
          <span className="field__label">Introduction script & transcript</span>
          <textarea
            rows={7}
            value={draft.audio.transcript}
            onChange={(event) =>
              update((next) => {
                next.audio.transcript = event.target.value
              })
            }
          />
          <span className="field__hint">
            Generated from the resume. Edit it to match the story you want to tell. It doubles as
            the transcript and the generated-narration script.
          </span>
        </label>

        <div className="generated-preview-row">
          <button className="button button--secondary button--small" onClick={toggleSpeech}>
            {speech.speaking ? <Pause size={15} /> : <Play size={15} />}
            {speech.speaking ? 'Stop generated voice' : 'Preview with device voice'}
          </button>
          <span className="generated-preview-row__label">
            <Volume2 size={13} /> Generated narration, not my voice
          </span>
        </div>
        {speech.error ? (
          <p className="inline-error" role="alert">
            {speech.error}
          </p>
        ) : null}
      </section>

      <section className="studio-panel">
        <div className="studio-panel__heading">
          <span className="studio-panel__icon">
            <FileText size={20} />
          </span>
          <div>
            <p className="eyebrow">Original document</p>
            <h3>Resume file</h3>
            <p>Open, download, or share the original file from the Resume section.</p>
          </div>
        </div>

        {hasResume ? (
          <div className="resume-editor-status">
            <span className="resume-file__icon">
              <FileText size={22} />
            </span>
            <div>
              <strong>{draft.resume.fileName || 'Resume'}</strong>
              <span>
                {fileExtension(draft.resume.fileName)} file
                {draft.resume.size ? ` · ${formatFileSize(draft.resume.size)}` : ''}
              </span>
            </div>
            {draft.resume.key ? (
              <button
                className="icon-button icon-button--tiny icon-button--danger"
                onClick={async () => {
                  await onResumeRemove()
                  onToast?.({ type: 'info', message: 'Resume file removed.' })
                }}
                aria-label="Remove resume"
                title="Remove resume"
              >
                <Trash2 size={15} />
              </button>
            ) : null}
          </div>
        ) : (
          <div className="media-empty">
            <FileText size={20} />
            <div>
              <strong>No resume attached</strong>
              <span>The Resume section stays hidden until a file is available.</span>
            </div>
          </div>
        )}

        <input
          ref={resumeInput}
          type="file"
          accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          hidden
          onChange={(event) => handleResumeSelect(event.target.files?.[0])}
        />
        <div className="resume-editor-actions">
          <button
            className="button button--secondary button--small"
            onClick={() => resumeInput.current?.click()}
            disabled={busy === 'resume'}
          >
            {busy === 'resume' ? (
              <LoaderCircle size={16} className="spin" />
            ) : hasResume ? (
              <Upload size={16} />
            ) : (
              <FileText size={16} />
            )}
            {busy === 'resume' ? 'Saving…' : hasResume ? 'Replace file' : 'Attach resume'}
          </button>
          {resumeUrl ? (
            <a className="text-button" href={resumeUrl} target="_blank" rel="noreferrer">
              Open current file
            </a>
          ) : null}
        </div>
        <p className="fine-print">
          PDF, DOC, DOCX, or TXT up to 20 MB. Attached files remain on this device until you choose
          to share them.
        </p>
      </section>
    </div>
  )
}
