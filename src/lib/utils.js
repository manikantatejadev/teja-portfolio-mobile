import { useEffect, useRef, useState } from 'react'

export function formatTime(value) {
  if (!Number.isFinite(value) || value < 0) return '0:00'
  const total = Math.floor(value)
  const minutes = Math.floor(total / 60)
  const seconds = String(total % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

export function getInitials(name) {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getVisibleContactLinks(portfolio) {
  const contact = portfolio?.contact
  if (!contact) return []
  const items = []
  if (contact.visible?.email && contact.email) {
    items.push({
      id: 'email',
      kind: 'email',
      label: 'Email',
      value: contact.email,
      href: `mailto:${contact.email}`,
      action: 'Email',
      icon: 'Mail',
    })
  }
  if (contact.visible?.phone && contact.phone) {
    items.push({
      id: 'phone',
      kind: 'phone',
      label: 'Phone',
      value: contact.phone,
      href: `tel:${contact.phone.replace(/[^\d+]/g, '')}`,
      action: 'Call',
      icon: 'Phone',
    })
  }
  for (const link of contact.links || []) {
    if (link.visible && link.url) {
      const url = link.url.startsWith('http') ? link.url : `https://${link.url}`
      items.push({
        id: link.id,
        kind: 'link',
        label: link.label,
        value: link.url.replace(/^https?:\/\//, ''),
        href: url,
        action: 'Open',
        icon: 'ExternalLink',
      })
    }
  }
  return items
}

export function isSectionSupported(id, portfolio) {
  if (!portfolio) return false
  if (portfolio.sections?.hidden?.includes(id)) return false
  switch (id) {
    case 'summary':
      return Boolean(portfolio.summary?.trim())
    case 'skills':
      return Boolean(portfolio.skills?.some((group) => group.items?.length))
    case 'experience':
      return Boolean(portfolio.experience?.length)
    case 'projects':
      return Boolean(portfolio.projects?.length)
    case 'education':
      return Boolean(portfolio.education?.length)
    case 'certifications':
      return Boolean(portfolio.certifications?.length)
    case 'achievements':
      return Boolean(portfolio.achievements?.length)
    case 'languages':
      return Boolean(portfolio.languages?.length || portfolio.interests?.length)
    case 'resume':
      return Boolean(portfolio.resume?.builtinUrl || portfolio.resume?.key)
    case 'contact':
      return getVisibleContactLinks(portfolio).length > 0
    default:
      return false
  }
}

export function getOrderedSections(portfolio) {
  return [...(portfolio.sections?.order || [])].filter((id) => isSectionSupported(id, portfolio))
}

export function getFeaturedProject(portfolio) {
  if (!portfolio?.projects?.length) return null
  return (
    portfolio.projects.find((project) => project.id === portfolio.featuredProjectId) ||
    portfolio.projects.find((project) => project.featured) ||
    portfolio.projects[0]
  )
}

export async function copyText(text) {
  if (!text) throw new Error('There is nothing to copy.')
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch {
      // Fall through to the selection-based copy for browsers that block the API.
    }
  }
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.opacity = '0'
  document.body.appendChild(area)
  area.select()
  let copied = false
  try {
    copied = document.execCommand('copy')
  } catch {
    copied = false
  }
  document.body.removeChild(area)
  if (!copied) {
    throw new Error('Copying is not available in this browser. Select the text and copy it manually.')
  }
}

export function fileExtension(name) {
  const match = String(name || '').match(/\.([a-z0-9]+)$/i)
  return match ? match[1].toUpperCase() : 'FILE'
}

export function formatTitleForDisplay(title) {
  // Keep multi-word technology names together so the title never splits them
  // across lines (for example "ASP.NET" and "CORE").
  return String(title || '').replace(/ASP\.NET\s+CORE/gi, 'ASP.NET\u00A0CORE')
}

export function projectMonogram(name) {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (!words.length) return ''
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return words
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function stopSpeech() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
}

export function useSpeechPreview(text) {
  const [speaking, setSpeaking] = useState(false)
  const [supported, setSupported] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setSupported('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window)
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    }
  }, [])

  const stop = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    setSpeaking(false)
  }

  const toggle = () => {
    if (!supported) {
      setError('Generated narration is not available in this browser.')
      return
    }
    if (speaking) {
      stop()
      return
    }
    if (!String(text || '').trim()) {
      setError('Add an introduction script first.')
      return
    }
    setError('')
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.96
    utterance.pitch = 1
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => {
      setSpeaking(false)
      setError('The device voice could not finish this preview.')
    }
    setSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  return { speaking, supported, error, toggle, stop }
}

export function useAudioController(src, durationHint = 0) {
  const audioRef = useRef(null)
  if (!audioRef.current && typeof Audio !== 'undefined') {
    audioRef.current = new Audio()
    audioRef.current.preload = 'metadata'
  }
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(durationHint || 0)
  const [speed, setSpeedState] = useState(1)
  const [error, setError] = useState('')

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.removeAttribute('src')
    if (src) {
      audio.src = src
      audio.load()
    }
    setCurrentTime(0)
    setDuration(durationHint || 0)
    setIsPlaying(false)
    setError('')
  }, [src, durationHint])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTime = () => setCurrentTime(audio.currentTime || 0)
    const handleDuration = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration)
      } else if (durationHint) {
        setDuration(durationHint)
      }
    }
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(audio.duration || 0)
    }
    const handleError = () => {
      setIsPlaying(false)
      setError('This audio could not be played. Try replacing the file.')
    }

    audio.addEventListener('timeupdate', handleTime)
    audio.addEventListener('durationchange', handleDuration)
    audio.addEventListener('loadedmetadata', handleDuration)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('timeupdate', handleTime)
      audio.removeEventListener('durationchange', handleDuration)
      audio.removeEventListener('loadedmetadata', handleDuration)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [durationHint])

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
    }
  }, [])

  const play = async () => {
    const audio = audioRef.current
    if (!audio || !src) {
      setError('Add an audio introduction first.')
      return
    }
    stopSpeech()
    try {
      setError('')
      if (audio.currentTime >= (audio.duration || duration) - 0.05) {
        audio.currentTime = 0
      }
      await audio.play()
    } catch {
      setIsPlaying(false)
      setError('Playback was blocked. Tap play again to continue.')
    }
  }

  const pause = () => {
    audioRef.current?.pause()
  }

  const toggle = () => {
    if (isPlaying) pause()
    else play()
  }

  const seek = (value) => {
    const audio = audioRef.current
    if (!audio) return
    const next = Number(value)
    if (!Number.isFinite(next)) return
    audio.currentTime = Math.min(next, duration || next)
    setCurrentTime(audio.currentTime)
  }

  const replay = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = 0
    setCurrentTime(0)
    play()
  }

  const setSpeed = (value) => {
    const audio = audioRef.current
    setSpeedState(value)
    if (audio) audio.playbackRate = value
  }

  const stop = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    setCurrentTime(0)
  }

  return {
    isPlaying,
    currentTime,
    duration,
    speed,
    error,
    play,
    pause,
    toggle,
    seek,
    replay,
    setSpeed,
    stop,
  }
}
