import React, { useEffect, useRef } from 'react'
import { Button } from './ui'

type Props = {
  title?: string
  message?: string
  onRetry?: () => void
  code?: number
}

export default function ErrorFace({ title = 'Something went wrong', message, onRetry, code }: Props) {
  const leftEyeRef = useRef<SVGCircleElement>(null)
  const rightEyeRef = useRef<SVGCircleElement>(null)

  // Eyes follow mouse
  useEffect(() => {
    const move = (e: MouseEvent) => {
      const eyes = [leftEyeRef.current, rightEyeRef.current]
      eyes.forEach(eye => {
        if (!eye) return
        const rect = eye.closest('svg')!.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const angle = Math.atan2(e.clientY - cy, e.clientX - cx)
        const dist = 4
        eye.setAttribute('cx', String(parseFloat(eye.dataset.ox!) + Math.cos(angle) * dist))
        eye.setAttribute('cy', String(parseFloat(eye.dataset.oy!) + Math.sin(angle) * dist))
      })
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center select-none">
      {/* Animated face */}
      <div className="relative">
        {/* Glow behind face */}
        <div className="absolute inset-0 rounded-full bg-blue-400/20 blur-3xl scale-150" />

        <svg
          viewBox="0 0 120 120"
          width={180}
          height={180}
          className="relative drop-shadow-xl"
        >
          {/* Face */}
          <circle cx="60" cy="60" r="54" fill="url(#faceGrad)" />

          {/* Gradient */}
          <defs>
            <radialGradient id="faceGrad" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </radialGradient>
          </defs>

          {/* Left eyebrow — sad angle */}
          <path d="M32 36 Q40 30 48 34" stroke="#78350f" strokeWidth="3" strokeLinecap="round" fill="none" />
          {/* Right eyebrow — sad angle */}
          <path d="M72 34 Q80 30 88 36" stroke="#78350f" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* Left eye white */}
          <circle cx="40" cy="50" r="10" fill="white" />
          {/* Right eye white */}
          <circle cx="80" cy="50" r="10" fill="white" />

          {/* Left pupil (interactive) */}
          <circle ref={leftEyeRef} data-ox="40" data-oy="50" cx="40" cy="50" r="5" fill="#1e3a5f" />
          {/* Right pupil (interactive) */}
          <circle ref={rightEyeRef} data-ox="80" data-oy="50" cx="80" cy="50" r="5" fill="#1e3a5f" />

          {/* Left pupil shine */}
          <circle cx="42" cy="48" r="1.5" fill="white" opacity="0.8" />
          <circle cx="82" cy="48" r="1.5" fill="white" opacity="0.8" />

          {/* Sad mouth */}
          <path d="M42 82 Q60 72 78 82" stroke="#92400e" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* Rosy cheeks */}
          <ellipse cx="28" cy="72" rx="10" ry="6" fill="#f87171" opacity="0.3" />
          <ellipse cx="92" cy="72" rx="10" ry="6" fill="#f87171" opacity="0.3" />

          {/* Sweat drop */}
          <ellipse cx="94" cy="40" rx="4" ry="6" fill="#93c5fd" opacity="0.9" />
          <path d="M94 34 Q97 38 94 46 Q91 38 94 34Z" fill="#60a5fa" />
        </svg>

        {/* Error code badge */}
        {code && (
          <div className="absolute -top-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-lg">
            {code}
          </div>
        )}
      </div>

      {/* Text */}
      <div className="max-w-sm space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">{title}</h2>
        {message && (
          <p className="text-sm leading-relaxed text-slate-500">{message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {onRetry && (
          <Button onClick={onRetry}>Try again</Button>
        )}
        <Button variant="outline" onClick={() => window.location.href = '/'}>
          Go home
        </Button>
      </div>
    </div>
  )
}
