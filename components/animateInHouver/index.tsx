import { useHover } from 'ahooks'
import React, { useRef } from 'react'

interface AnimateInHoverProps {
    children: React.ReactNode
    /** default 0ms */
    delay?: number
    animateCssClass?: string
    className?: string
}

/**
 * 组件hover时添加animate.css类名
 */
const AnimateInHover = (props: AnimateInHoverProps) => {
    const { children, delay = 0, animateCssClass = 'animate__bounce', className = '' } = props
    const ref = useRef<HTMLDivElement>(null)

    const isHover = useHover(ref)

    return (
        <div
            ref={ref}
            style={
                {
                    '--animate-delay': `${delay}ms`,
                    display: 'inline-block',
                } as React.CSSProperties
            }
            className={isHover ? `${className} animate__animated ${animateCssClass} animate__delay-1s` : className}
        >
            {children}
        </div>
    )
}

export default AnimateInHover
