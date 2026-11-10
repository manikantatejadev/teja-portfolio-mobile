import { useState } from 'react'
import {
  Download,
  FileText,
  LoaderCircle,
  Share2,
  SquareArrowOutUpRight,
  Upload,
} from 'lucide-react'
import { Sheet } from '../Sheet'
import { fileExtension, formatFileSize } from '../../lib/utils'

function triggerDownload(url, fileName) {
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName || 'resume'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

export function ResumeSheet({
  portfolio,
  resumeUrl,
  mediaLoading,
  onClose,
  onToast,
  owner,
  onEdit,
}) {
  const [sharing, setSharing] = useState(false)
  const resume = portfolio.resume || {}
  const hasResume = Boolean(resumeUrl)
  const format = fileExtension(resume.fileName)

  const shareResume = async () => {
    if (!hasResume) return
    setSharing(true)
    try {
      const response = await fetch(resumeUrl)
      if (!response.ok) throw new Error('The resume file could not be read.')
      const blob = await response.blob()
      const file = new File([blob], resume.fileName || 'resume.pdf', {
        type: blob.type || 'application/pdf',
      })
      if (navigator.canShare?.({ files: [file] }) && navigator.share) {
        await navigator.share({
          files: [file],
          title: `${portfolio.identity.name} — Resume`,
          text: 'My professional resume.',
        })
        onToast?.({ type: 'success', message: 'Resume shared.' })
      } else {
        triggerDownload(resumeUrl, resume.fileName)
        onToast?.({
          type: 'info',
          message: 'File sharing is not available here, so the resume was downloaded instead.',
        })
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        onToast?.({ type: 'error', message: error.message || 'The resume could not be shared.' })
      }
    } finally {
      setSharing(false)
    }
  }

  return (
    <Sheet title="Resume" eyebrow="The complete document" onClose={onClose}>
      <p className="sheet-lede">
        Open, download, or share the original resume file. The attached file stays on this device
        unless you explicitly share it.
      </p>

      {mediaLoading ? (
        <div className="resume-file resume-file--loading">
          <LoaderCircle size={24} className="spin" />
          <div>
            <strong>Loading resume</strong>
            <span>Reading the file saved in this browser.</span>
          </div>
        </div>
      ) : hasResume ? (
        <>
          <div className="resume-file">
            <span className="resume-file__icon">
              <FileText size={25} />
            </span>
            <div className="resume-file__copy">
              <strong>{resume.fileName || 'Resume'}</strong>
              <span>
                {format} file{resume.size ? ` · ${formatFileSize(resume.size)}` : ''}
              </span>
            </div>
          </div>

          <div className="resume-actions">
            <a className="button button--primary" href={resumeUrl} target="_blank" rel="noreferrer">
              <SquareArrowOutUpRight size={16} /> Open resume
            </a>
            <button className="button button--secondary" onClick={shareResume} disabled={sharing}>
              {sharing ? <LoaderCircle size={16} className="spin" /> : <Share2 size={16} />}
              {sharing ? 'Preparing…' : 'Share'}
            </button>
          </div>

          <button
            className="text-button resume-download"
            onClick={() => {
              triggerDownload(resumeUrl, resume.fileName)
              onToast?.({ type: 'success', message: 'Resume download started.' })
            }}
          >
            <Download size={15} /> Download a copy
          </button>

          {owner ? (
            <button className="text-button text-button--accent visibility-link" onClick={onEdit}>
              <Upload size={15} /> Replace attached resume
            </button>
          ) : null}
        </>
      ) : (
        <div className="empty-state">
          <FileText size={24} />
          <h2>No resume attached yet</h2>
          <p>
            {owner
              ? 'Attach the original resume file in Studio so visitors can open and share it.'
              : 'The resume file is not available right now.'}
          </p>
          {owner ? (
            <button className="button button--secondary button--small" onClick={onEdit}>
              <Upload size={15} /> Attach resume
            </button>
          ) : null}
        </div>
      )}
    </Sheet>
  )
}
