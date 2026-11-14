import { useCallback, useEffect, useRef, useState } from 'react'

const MAX_OFFSET = 12 // pixels of travel at full tilt
const RANGE_DEG = 18 // tilt angle that reaches the full offset
const SMOOTHING = 0.14

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

/**
 * Moves an element with the phone's physical tilt.
 * Values are written to CSS custom properties so they can be combined with
 * the existing float animation instead of overriding its transform.
 *
 * iOS 13+ only delivers orientation data after a user gesture, so the hook
 * exposes `status` and `requestAccess` for an explicit enable control, and
 * also asks on the first tap or touch anywhere on the page.
 *
 * Reduced-motion users, desktops, non-secure origins, and browsers without
 * sensors keep the existing static float animation.
 */
export function useDeviceTilt(enabled = false) {
  const ref = useRef(null)
  const [status, setStatus] = useState('idle')
  const requestAccessRef = useRef(null)
  const requestingRef = useRef(false)

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      setStatus('idle')
      return undefined
    }
    if (!('DeviceOrientationEvent' in window)) {
      setStatus('unsupported')
      return undefined
    }

    // Motion sensors are only meaningful on touch devices; desktops keep the
    // normal animated float without any permission prompts.
    const coarsePointer = window.matchMedia?.('(pointer: coarse)')?.matches
    if (!coarsePointer) {
      setStatus('idle')
      return undefined
    }

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (reduceMotion) {
      setStatus('reduced')
      return undefined
    }

    // iOS and Android only expose sensors on secure origins.
    if (!window.isSecureContext) {
      setStatus('insecure')
      return undefined
    }

    const element = ref.current
    if (!element) return undefined

    let disposed = false
    let listening = false
    let baseline = null
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0
    let frame = 0

    const render = () => {
      frame = 0
      currentX += (targetX - currentX) * SMOOTHING
      currentY += (targetY - currentY) * SMOOTHING
      element.style.setProperty('--tilt-x', `${currentX.toFixed(2)}px`)
      element.style.setProperty('--tilt-y', `${currentY.toFixed(2)}px`)
      element.style.setProperty('--tilt-rotate', `${(currentX * 0.16).toFixed(2)}deg`)
      if (
        Math.abs(targetX - currentX) > 0.05 ||
        Math.abs(targetY - currentY) > 0.05
      ) {
        frame = window.requestAnimationFrame(render)
      }
    }

    const kick = () => {
      if (!frame) frame = window.requestAnimationFrame(render)
    }

    const onOrientation = (event) => {
      const { beta, gamma } = event
      if (typeof beta !== 'number' || typeof gamma !== 'number') return
      // The first reading becomes the neutral position, so the image is
      // centered however the phone happens to be held when the page opens.
      if (!baseline) {
        baseline = { beta, gamma }
        return
      }
      targetX = clamp((gamma - baseline.gamma) / RANGE_DEG, -1, 1) * MAX_OFFSET
      targetY = clamp((beta - baseline.beta) / RANGE_DEG, -1, 1) * MAX_OFFSET
      kick()
    }

    const recalibrate = () => {
      baseline = null
      targetX = 0
      targetY = 0
      kick()
    }

    const start = () => {
      if (disposed || listening) return
      listening = true
      window.addEventListener('deviceorientation', onOrientation, true)
      window.addEventListener('orientationchange', recalibrate)
      setStatus('active')
    }

    const stop = () => {
      window.removeEventListener('deviceorientation', onOrientation, true)
      window.removeEventListener('orientationchange', recalibrate)
      listening = false
    }

    const requestAccess = async () => {
      if (disposed || requestingRef.current || listening) return
      requestingRef.current = true
      try {
        const OrientationEvent = window.DeviceOrientationEvent
        const result =
          typeof OrientationEvent?.requestPermission === 'function'
            ? await OrientationEvent.requestPermission()
            : 'granted'
        if (result === 'granted') start()
        else setStatus('denied')
      } catch {
        setStatus('denied')
      } finally {
        requestingRef.current = false
      }
    }
    requestAccessRef.current = requestAccess

    let detachGesture = null
    const OrientationEvent = window.DeviceOrientationEvent

    if (typeof OrientationEvent?.requestPermission === 'function') {
      setStatus('needs-permission')
      // Tapping anywhere also works, so visitors do not have to hunt for the
      // hint chip. The chip still remains available for a deliberate tap.
      const onFirstGesture = () => requestAccess()
      window.addEventListener('pointerup', onFirstGesture, { passive: true })
      window.addEventListener('touchend', onFirstGesture, { passive: true })
      detachGesture = () => {
        window.removeEventListener('pointerup', onFirstGesture)
        window.removeEventListener('touchend', onFirstGesture)
      }
    } else {
      start()
    }

    return () => {
      disposed = true
      detachGesture?.()
      stop()
      if (frame) window.cancelAnimationFrame(frame)
      requestAccessRef.current = null
      requestingRef.current = false
      element.style.removeProperty('--tilt-x')
      element.style.removeProperty('--tilt-y')
      element.style.removeProperty('--tilt-rotate')
    }
  }, [enabled])

  const requestAccess = useCallback(() => {
    requestAccessRef.current?.()
  }, [])

  return { ref, status, requestAccess }
}
