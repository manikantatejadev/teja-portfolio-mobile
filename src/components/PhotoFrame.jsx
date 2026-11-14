import { Camera, Expand, Smartphone } from 'lucide-react'
import { useDeviceTilt } from '../lib/useDeviceTilt'

function pickBadges(portfolio) {
  const items = (portfolio?.skills || []).flatMap((group) => group.items || [])
  const preferred = ['C#', 'React.js', 'SQL Server']
  const found = preferred.filter((skill) => items.includes(skill))
  return found.length ? found : items.slice(0, 3)
}

export function PhotoFrame({
  portfolio,
  photoUrl,
  onOpen,
  onEditPhoto,
  owner,
  compact = false,
  portraitOnly = false,
  tilt = false,
}) {
  const photo = portfolio.photo || {}
  const uploaded = Boolean(photoUrl)
  const badges = pickBadges(portfolio)
  const {
    ref: tiltRef,
    status: tiltStatus,
    requestAccess: requestTilt,
  } = useDeviceTilt(tilt)
  const motionHint =
    tilt &&
    (tiltStatus === 'needs-permission' ||
      tiltStatus === 'insecure' ||
      tiltStatus === 'reduced')
  const imageStyle = uploaded
    ? {
        objectPosition: `${photo.x ?? 50}% ${photo.y ?? 50}%`,
        transform: `scale(${photo.zoom ?? 1})`,
      }
    : undefined

  return (
    <div
      ref={tiltRef}
      className={`portrait-stage ${compact ? 'portrait-stage--compact' : ''} ${
        motionHint ? 'portrait-stage--motion-hint' : ''
      }`}
    >
      <div className="portrait-halo" aria-hidden="true" />
      <div className="portrait-ring portrait-ring--one" aria-hidden="true" />
      <div className="portrait-ring portrait-ring--two" aria-hidden="true" />
      {!portraitOnly && badges[0] ? (
        <span className="portrait-badge portrait-badge--one">{badges[0]}</span>
      ) : null}
      {!portraitOnly && badges[1] ? (
        <span className="portrait-badge portrait-badge--two">{badges[1]}</span>
      ) : null}
      {!portraitOnly && badges[2] ? (
        <span className="portrait-badge portrait-badge--three">{badges[2]}</span>
      ) : null}

      <button
        className="portrait-frame"
        onClick={onOpen}
        aria-label={`Open larger portrait of ${portfolio.identity.name}`}
      >
        <img
          className={`portrait-image ${uploaded ? 'is-uploaded' : 'is-placeholder'}`}
          src={photoUrl || '/avatar-illustration.svg'}
          alt={`${portfolio.identity.name} portrait${uploaded ? '' : ' placeholder illustration'}`}
          style={imageStyle}
          decoding="async"
          fetchPriority={compact ? 'auto' : 'high'}
        />
        <span className="portrait-expand" aria-hidden="true">
          <Expand size={15} />
        </span>
      </button>

      {owner && onEditPhoto ? (
        <button
          className="portrait-edit"
          onClick={onEditPhoto}
          aria-label="Change profile photo"
          title="Change profile photo"
        >
          <Camera size={15} />
          <span>Photo</span>
        </button>
      ) : null}

      <span className="portrait-spark portrait-spark--one" aria-hidden="true" />
      <span className="portrait-spark portrait-spark--two" aria-hidden="true" />

      {tiltStatus === 'needs-permission' ? (
        <button type="button" className="portrait-motion" onClick={requestTilt}>
          <Smartphone size={13} aria-hidden="true" />
          Enable tilt
        </button>
      ) : null}
      {tiltStatus === 'insecure' ? (
        <span className="portrait-motion portrait-motion--note">
          Motion needs HTTPS
        </span>
      ) : null}
      {tiltStatus === 'reduced' ? (
        <span className="portrait-motion portrait-motion--note">
          Motion off in settings
        </span>
      ) : null}
    </div>
  )
}
