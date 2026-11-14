import { useState } from 'react'
import {
  AudioLines,
  ChevronDown,
  ChevronRight,
  Mic,
  Pause,
  Play,
  RotateCcw,
  Volume2,
} from 'lucide-react'
import { formatTime } from '../lib/utils'

const BARS = [
  22, 40, 58, 33, 72, 48, 82, 55, 32, 66, 45, 78, 54, 30, 62, 44, 70, 38, 56, 28, 49, 66, 36, 58,
]

function Waveform({ playing }) {
  return (
    <div className={`waveform ${playing ? 'is-playing' : ''}`} aria-hidden="true">
      {BARS.map((height, index) => (
        <span
          key={`${height}-${index}`}
          className="waveform__bar"
          style={{
            '--bar-height': `${height}%`,
            '--bar-delay': `${(index % 8) * 0.07}s`,
          }}
        />
      ))}
    </div>
  )
}

export function AudioCard({
  portfolio,
  audioUrl,
  audio,
  variant = 'home',
  onOpen,
  onEdit,
  owner,
  mediaLoading = false,
}) {
  const [transcriptOpen, setTranscriptOpen] = useState(false)
  const full = variant === 'full'
  const hasAudio = Boolean(audioUrl && (portfolio.audio?.key || portfolio.audio?.builtinUrl))
  const aiNarration = Boolean(!portfolio.audio?.key && portfolio.audio?.builtinUrl)
  const subtitle = hasAudio
    ? aiNarration
      ? 'An AI-generated narration of my introduction, not a recording of my voice.'
      : 'A personal introduction, in my own words.'
    : 'Add a voice note and let people hear the person behind the profile.'
  const progress = audio.duration ? Math.min(100, (audio.currentTime / audio.duration) * 100) : 0

  return (
    <section className={`audio-card ${full ? 'audio-card--full' : ''}`} aria-labelledby={`audio-${variant}`}>
      <div className="audio-card__header">
        <div className="audio-mark">
          <AudioLines size={22} />
          {audio.isPlaying ? <span className="audio-mark__pulse" aria-hidden="true" /> : null}
        </div>
        <div className="audio-card__title-wrap">
          <p className="eyebrow">{full ? 'Audio introduction' : 'Hear my story'}</p>
          <h3 id={`audio-${variant}`}>
            {full ? 'Hear My Story' : 'Listen to My Introduction'}
          </h3>
          <p>{subtitle}</p>
        </div>
        {!full && onOpen ? (
          <button className="icon-button icon-button--soft" onClick={onOpen} aria-label="Open audio player">
            <ChevronRight size={19} />
          </button>
        ) : null}
      </div>

      {mediaLoading ? (
        <div className="audio-empty audio-empty--loading" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          <div>
            <strong>Loading your recording</strong>
            <p>Fetching the audio saved on this device.</p>
          </div>
        </div>
      ) : hasAudio ? (
        <>
          <div className="audio-player">
            <button
              className="play-button"
              onClick={audio.toggle}
              aria-label={audio.isPlaying ? 'Pause introduction' : 'Play introduction'}
            >
              {audio.isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
            </button>
            <div className="audio-track">
              <Waveform playing={audio.isPlaying} />
              <label className="sr-only" htmlFor={`seek-${variant}`}>
                Seek introduction
              </label>
              <input
                id={`seek-${variant}`}
                className="seek-range"
                type="range"
                min="0"
                max={audio.duration || 0}
                step="0.1"
                value={Math.min(audio.currentTime, audio.duration || 0)}
                onChange={(event) => audio.seek(event.target.value)}
                style={{ '--progress': `${progress}%` }}
              />
              <div className="audio-times" aria-live="off">
                <span>{formatTime(audio.currentTime)}</span>
                <span>{formatTime(audio.duration)}</span>
              </div>
            </div>
          </div>

          <div className="audio-tools">
            <button className="text-button" onClick={audio.replay}>
              <RotateCcw size={15} />
              <span>Replay</span>
            </button>
            <button
              className="speed-button"
              onClick={() => {
                const options = [1, 1.25, 1.5, 0.75]
                const next = options[(options.indexOf(audio.speed) + 1) % options.length]
                audio.setSpeed(next)
              }}
              aria-label={`Playback speed ${audio.speed} times. Tap to change.`}
            >
              {audio.speed}× speed
            </button>
            {full ? (
              <span className="audio-tools__meta">
                <Volume2 size={14} /> {aiNarration ? 'AI-generated narration' : 'Personal recording'}
              </span>
            ) : null}
            {!full && onOpen ? (
              <button className="text-button text-button--accent" onClick={onOpen}>
                Open player <ChevronRight size={15} />
              </button>
            ) : null}
          </div>

          {audio.error ? (
            <p className="inline-error" role="alert">
              {audio.error}
            </p>
          ) : null}
        </>
      ) : (
        <div className="audio-empty">
          <div className="audio-empty__visual" aria-hidden="true">
            <Mic size={22} />
            <span className="audio-empty__line" />
            <span className="audio-empty__line audio-empty__line--shorter" />
          </div>
          <div className="audio-empty__copy">
            <strong>No recording yet</strong>
            <p>
              This is an honest empty state. Add a short introduction when you are ready — nothing
              is uploaded anywhere.
            </p>
            {owner && onEdit ? (
              <button className="button button--small button--secondary" onClick={onEdit}>
                <Mic size={15} /> Add voice intro
              </button>
            ) : null}
          </div>
        </div>
      )}

      <button
        className="transcript-toggle"
        onClick={() => setTranscriptOpen((open) => !open)}
        aria-expanded={transcriptOpen}
      >
        <span>{hasAudio ? 'Read transcript' : 'Read introduction script'}</span>
        <ChevronDown
          size={17}
          className={transcriptOpen ? 'is-rotated' : ''}
          aria-hidden="true"
        />
      </button>
      {transcriptOpen ? (
        <div className="transcript">
          <p>{portfolio.audio?.transcript || 'No introduction script has been written yet.'}</p>
          {aiNarration ? (
            <p className="transcript__note">
              This narration is AI-generated from the script above. It is not a recording of my
              voice.
            </p>
          ) : null}
          {!hasAudio ? (
            <p className="transcript__note">
              This is a draft script, generated from the resume and kept on this device. It is not
              a recording of my voice.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
