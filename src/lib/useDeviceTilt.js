import { useEffect, useRef } from 'react'

const MAX_OFFSET = 10 // pixels of travel at full tilt
const RANGE_DEG = 18 // tilt angle that reaches the full offset
const SMOOTHING = 0.14

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

/**
 * Moves an element with the phone's physical tilt.
 * Values are written to CSS custom properties so they can be combined with
 * the existing float animation instead of overriding its transform.
 *
 * iOS 13+ requires DeviceOrientationEvent permission from a user gesture, so
 * the first tap or touch asks for it. Everywhere else listeners start at once.
 * Reduced-motion users keep the static presentation.
 */
export function useDeviceTilt(enabled = false) {
  const ref = useRef(null)

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return undefined
    if (!('DeviceOrientationEvent' in window)) return undefined

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (reduceMotion) return undefined

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
    }

    const stop = () => {
      window.removeEventListener('deviceorientation', onOrientation, true)
      window.removeEventListener('orientationchange', recalibrate)
      listening = false
    }

    let detachGesture = null
    const OrientationEvent = window.DeviceOrientationEvent

    if (typeof OrientationEvent?.requestPermission === 'function') {
      const requestPermission = async () => {
        detachGesture?.()
        try {
          const result = await OrientationEvent.requestPermission()
          if (result === 'granted') start()
        } catch {
          // Denied or unavailable: keep the existing float animation.
        }
      }
      window.addEventListener('pointerdown', requestPermission, { passive: true })
      window.addEventListener('touchend', requestPermission, { passive: true })
      detachGesture = () => {
        window.removeEventListener('pointerdown', requestPermission)
        window.removeEventListener('touchend', requestPermission)
      }
    } else {
      start()
    }

    return () => {
      disposed = true
      detachGesture?.()
      stop()
      if (frame) window.cancelAnimationFrame(frame)
      element.style.removeProperty('--tilt-x')
      element.style.removeProperty('--tilt-y')
      element.style.removeProperty('--tilt-rotate')
    }
  }, [enabled])

  return ref
}
