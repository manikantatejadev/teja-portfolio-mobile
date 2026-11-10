import { useState } from 'react'
import {
  Check,
  Copy,
  ExternalLink,
  Link2,
  Mail,
  Phone,
  Send,
  SlidersHorizontal,
} from 'lucide-react'
import { Sheet } from '../Sheet'
import { copyText, getVisibleContactLinks } from '../../lib/utils'

const ICONS = { Mail, Phone, ExternalLink, Link2 }

export function ContactSheet({ portfolio, onClose, onToast, owner, onEditVisibility }) {
  const [copied, setCopied] = useState('')
  const items = getVisibleContactLinks(portfolio)

  const markCopied = (id) => {
    setCopied(id)
    window.setTimeout(() => setCopied(''), 1800)
  }

  const handleCopy = async (id, text) => {
    try {
      await copyText(text)
      markCopied(id)
      onToast?.({ type: 'success', message: 'Copied to clipboard.' })
    } catch (error) {
      onToast?.({ type: 'error', message: error.message })
    }
  }

  const copyAll = () => {
    const lines = [
      portfolio.identity.name,
      portfolio.identity.title,
      ...items.map((item) => `${item.label}: ${item.value}`),
    ]
    handleCopy('all', lines.join('\n'))
  }

  return (
    <Sheet
      title="Contact"
      eyebrow="Let’s talk"
      onClose={onClose}
      headerAction={
        <button
          className="icon-button"
          onClick={copyAll}
          aria-label="Copy all contact details"
          title="Copy all contact details"
        >
          {copied === 'all' ? <Check size={19} /> : <Copy size={19} />}
        </button>
      }
    >
      <p className="sheet-lede">
        Direct, working contact options. Every action below opens the matching app or service — no
        simulated messages.
      </p>

      {items.length ? (
        <div className="contact-list">
          {items.map((item) => {
            const Icon = ICONS[item.icon] || Link2
            return (
              <div className="contact-row" key={item.id}>
                <a
                  className="contact-row__main"
                  href={item.href}
                  target={item.kind === 'link' ? '_blank' : undefined}
                  rel={item.kind === 'link' ? 'noreferrer' : undefined}
                >
                  <span className="contact-row__icon">
                    <Icon size={20} />
                  </span>
                  <span className="contact-row__copy">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </span>
                  <span className="contact-row__action">{item.action}</span>
                </a>
                <button
                  className="icon-button contact-row__copy-button"
                  onClick={() => handleCopy(item.id, item.value)}
                  aria-label={`Copy ${item.label}`}
                  title={`Copy ${item.label}`}
                >
                  {copied === item.id ? <Check size={17} /> : <Copy size={17} />}
                </button>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="empty-state">
          <Send size={22} />
          <h2>No contact details are visible</h2>
          <p>The owner has chosen not to display contact information right now.</p>
        </div>
      )}

      {items.length ? (
        <button className="button button--secondary button--full" onClick={copyAll}>
          {copied === 'all' ? <Check size={16} /> : <Copy size={16} />}
          {copied === 'all' ? 'Contact details copied' : 'Copy all contact details'}
        </button>
      ) : null}

      {owner ? (
        <button className="text-button text-button--accent visibility-link" onClick={onEditVisibility}>
          <SlidersHorizontal size={15} /> Choose visible contact details
        </button>
      ) : null}
    </Sheet>
  )
}
