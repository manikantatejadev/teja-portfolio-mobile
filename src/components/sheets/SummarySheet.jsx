import { MapPin, Quote, Send } from 'lucide-react'
import { Sheet } from '../Sheet'

export function SummarySheet({ portfolio, onClose, onContact }) {
  return (
    <Sheet title="Professional Summary" eyebrow="In my own resume" onClose={onClose}>
      <div className="summary-quote">
        <Quote size={24} className="summary-quote__mark" />
        <p>{portfolio.summary}</p>
      </div>
      <div className="summary-facts">
        <div>
          <span>Professional title</span>
          <strong>{portfolio.identity.title}</strong>
        </div>
        {portfolio.identity.location ? (
          <div>
            <span>
              <MapPin size={14} /> Based in
            </span>
            <strong>{portfolio.identity.location}</strong>
          </div>
        ) : null}
      </div>
      <button className="button button--primary button--full" onClick={onContact}>
        <Send size={16} /> Start a conversation
      </button>
    </Sheet>
  )
}
