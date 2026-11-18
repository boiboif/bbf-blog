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
    const [inViewport, setInViewport] = useState(false)
    useEffect(() => {
        const element = ref.current
        if (!element || !ready || typeof IntersectionObserver === 'undefined') return
        const observer = new IntersectionObserver(([entry]) => {
            setInViewport(entry.isIntersecting)
            if (entry.isIntersecting && animateOnce) observer.disconnect()
        })
        observer.observe(element)
        return () => observer.disconnect()
    }, [animateOnce, ready])

    return (
        <div
            {...attributes}
            ref={ref}
            className={ready && inViewport ? `${className} animate__animated ${animateCssClass}` : className}
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
