import { MapPin } from 'lucide-react'
import { PhotoFrame } from '../PhotoFrame'
import { Sheet } from '../Sheet'

export function PortraitSheet({ portfolio, photoUrl, onClose, owner, onEditPhoto }) {
  return (
    <Sheet
      title={portfolio.identity.name}
      eyebrow="Portrait"
      onClose={onClose}
      className="sheet--portrait"
    >
      <div className="portrait-viewer">
        <PhotoFrame
          portfolio={portfolio}
          photoUrl={photoUrl}
          owner={owner}
          onEditPhoto={onEditPhoto}
          compact
          portraitOnly
          onOpen={() => {}}
        />
        <div className="portrait-viewer__caption">
          <strong>{portfolio.identity.name}</strong>
          <span>{portfolio.identity.title}</span>
          {portfolio.identity.location ? (
            <span className="portrait-viewer__location">
              <MapPin size={14} /> {portfolio.identity.location}
            </span>
          ) : null}
        </div>
      </div>
    </Sheet>
  )
}
