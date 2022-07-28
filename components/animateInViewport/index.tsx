import { useInViewportOnce } from '@/hook/useInViewportOnce'
import { useInViewport } from 'ahooks'
import React, { useRef } from 'react'

interface AnimateInViewportProps {
    children: React.ReactNode
    delay?: number
    animateCssClass?: string
    animateOnce?: boolean
    className?: string
}

/**
 * 组件出现在可视区域时添加animate.css类名 
 */
const AnimateInViewport = (props: AnimateInViewportProps) => {
    const { children, delay = 0, animateCssClass = 'animate__fadeInUp', animateOnce = false, className = '' } = props
    const ref = useRef<HTMLDivElement>(null)

    const [inViewportOnce] = useInViewportOnce(ref)
    const [inViewport] = useInViewport(ref)

    const inViewPortFlag = animateOnce ? inViewportOnce : inViewport

    return (
        <div
            ref={ref}
            style={
                {
                    '--animate-delay': `${delay}ms`,
                    visibility: inViewPortFlag ? 'visible' : 'hidden',
                    display: 'inline-block'
                } as React.CSSProperties
            }
            className={inViewPortFlag ? `${className} animate__animated ${animateCssClass} animate__delay-1s` : className}
        >
            {children}
        </div>
    )
}

export default AnimateInViewport
