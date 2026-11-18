import React, { useEffect, useRef, useState } from 'react'

interface AnimateInViewportProps extends React.HTMLAttributes<HTMLDivElement> {
    delay?: number
    animateCssClass?: string
    animateOnce?: boolean
    ready?: boolean
    duration?: number
}

const AnimateInViewport = ({
    children,
    delay = 0,
    animateCssClass = 'animate__fadeInUp',
    animateOnce = false,
    className = '',
    style,
    ready = true,
    duration = 1000,
    ...attributes
}: AnimateInViewportProps) => {
    const ref = useRef<HTMLDivElement>(null)
    const [phase, setPhase] = useState<'visible' | 'waiting' | 'playing'>('visible')
    useEffect(() => {
        const element = ref.current
        if (!element || !ready || typeof IntersectionObserver === 'undefined') return
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
        const threshold = Math.min(0.15, 24 / Math.max(element.offsetHeight, 1))
        let armed = true
        let firstObservation = true
        const observer = new IntersectionObserver(entries => {
            if (motion.matches) return
            const entry = entries[entries.length - 1]
            const leftViewport = entries.some(change => change.intersectionRatio === 0)
            const alreadyVisible = firstObservation && !leftViewport && entries[0].intersectionRatio >= threshold
            firstObservation = false
            if (leftViewport) armed = true
            if (!armed) return
            if (entry.intersectionRatio < threshold) {
                setPhase('waiting')
                return
            }
            armed = false
            if (alreadyVisible || element.matches(':focus-within')) {
                setPhase('visible')
                if (animateOnce) observer.unobserve(element)
                return
            }
            // A transform on the animated element changes its observed bounds.
            observer.unobserve(element)
            setPhase('playing')
        }, { threshold: [0, threshold] })
        const finish = (event: AnimationEvent) => {
            if (event.target !== element) return
            setPhase('visible')
            if (!animateOnce && !motion.matches) observer.observe(element)
        }
        const updatePreference = () => {
            if (motion.matches) {
                observer.disconnect()
                setPhase('visible')
            } else if (!animateOnce || armed) {
                firstObservation = true
                observer.observe(element)
            }
        }
        if (!motion.matches) observer.observe(element)
        motion.addEventListener('change', updatePreference)
        element.addEventListener('animationend', finish)
        element.addEventListener('animationcancel', finish)
        return () => {
            observer.disconnect()
            motion.removeEventListener('change', updatePreference)
            element.removeEventListener('animationend', finish)
            element.removeEventListener('animationcancel', finish)
        }
    }, [animateOnce, ready])

    return (
        <div
            {...attributes}
            ref={ref}
            data-viewport-entry={ready ? phase : 'visible'}
            className={ready && phase === 'playing' ? `${className} animate__animated ${animateCssClass}` : className}
            style={{
                animationDelay: `${delay}ms`,
                '--animate-duration': `${duration}ms`,
                ...style,
            } as React.CSSProperties}
        >
            {children}
        </div>
    )
}

export default AnimateInViewport
