import { AudioLines, Mic, Pause, Play, Sparkles, Volume2 } from 'lucide-react'
import { AudioCard } from '../AudioCard'
import { Sheet } from '../Sheet'
import { useSpeechPreview } from '../../lib/utils'

export function AudioSheet({
  portfolio,
  audioUrl,
  audio,
  mediaLoading,
  onClose,
  onEdit,
  owner,
}) {
  const speech = useSpeechPreview(portfolio.audio?.transcript || '')

  const toggleGenerated = () => {
    if (!speech.speaking) audio.pause()
    speech.toggle()
  }

  return (
    <Sheet title="Introduction" eyebrow="Hear my story" onClose={onClose}>
      <AudioCard
        portfolio={portfolio}
        audioUrl={audioUrl}
        audio={audio}
        variant="full"
        onEdit={onEdit}
        owner={owner}
        mediaLoading={mediaLoading}
      />

      <section className="generated-voice">
        <div className="generated-voice__heading">
          <span className="generated-voice__icon">
            <Volume2 size={19} />
          </span>
          <div>
            <p className="eyebrow">Optional & clearly labeled</p>
            <h3>Device voice preview</h3>
          </div>
        </div>
        <p>
          This uses your browser&apos;s text-to-speech voice to preview the script. It is{' '}
          <strong>not my voice, and separate from the bundled AI narration.</strong> Nothing is
          uploaded.
        </p>
        <div className="generated-voice__actions">
          <button className="button button--secondary button--small" onClick={toggleGenerated}>
            {speech.speaking ? <Pause size={15} /> : <Play size={15} />}
            {speech.speaking ? 'Stop preview' : 'Preview script aloud'}
          </button>
          <span className="generated-voice__badge">
            <Sparkles size={13} /> Generated voice
          </span>
        </div>
        {speech.error ? (
          <p className="inline-error" role="alert">
            {speech.error}
          </p>
        ) : null}
        {!speech.supported ? (
          <p className="inline-note">
            Device voice preview is not available in this browser. Your actual audio introduction
            still works independently.
          </p>
        ) : null}
      </section>

      {owner ? (
        <button className="audio-edit-link" onClick={onEdit}>
          <span className="audio-edit-link__icon">
            <Mic size={18} />
          </span>
          <span>
            <strong>
              {portfolio.audio?.key
                ? 'Replace or delete this recording'
                : portfolio.audio?.builtinUrl
                  ? 'Replace the AI narration with your own voice'
                  : 'Record or upload an introduction'}
            </strong>
            <span>Manage the audio and edit the transcript in Studio.</span>
          </span>
          <AudioLines size={18} />
        </button>
      ) : null}
    </Sheet>
  )
}
