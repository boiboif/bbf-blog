import { useInViewportOnce } from '@/hook/useInViewportOnce'
import { useInViewport } from 'ahooks'
import React, { HTMLAttributes, useEffect, useRef, useState } from 'react'

export interface AnimateInViewportProps<T = HTMLDivElement> extends HTMLAttributes<T> {
    children?: React.ReactNode
    delay?: number
    animateCssClass?: string
    animateOnce?: boolean
    className?: string
    style?: React.CSSProperties
    wrapperElement?: keyof React.ReactHTML
    testMode?: boolean
    ready?: boolean
    duration?: number
}

/**
 * 组件出现在可视区域时添加animate.css类名
 */
const AnimateInViewport = <T extends HTMLElement = HTMLDivElement>(props: AnimateInViewportProps<T>) => {
    const {
        children,
        delay = 0,
        animateCssClass = 'animate__fadeInUp',
        animateOnce = false,
        className = '',
        style,
        wrapperElement = 'div',
        testMode,
        ready = true,
        duration = 1000,
        ...htmlAttributes
    } = props
    const ref = useRef<HTMLDivElement>(null)

    const [inViewportOnce] = useInViewportOnce(ref)
    const [inViewport] = useInViewport(ref)
    const [animating, setAnimating] = useState(false)

    const inViewPortFlag = animating ? true : animateOnce ? inViewportOnce : inViewport

    useEffect(() => {
        if (inViewPortFlag) {
            setAnimating(true)
        }
    }, [inViewPortFlag])

    if (testMode) {
        // console.log(inViewportOnce, 'inViewportOnce')
        // console.log(inViewport, 'inViewport')
        // console.log(animating)
    }

    return React.createElement(
        wrapperElement,
        {
            ref,
            style: {
                '--animate-delay': `${delay}ms`,
                '--animate-duration': `${duration}ms`,
                visibility: ready && inViewPortFlag ? 'visible' : 'hidden',
                ...style,
            } as React.CSSProperties,
            className: ready && inViewPortFlag ? `${className} animate__animated ${animateCssClass} animate__delay-1s` : className,
            onAnimationEnd: () => {
                setAnimating(false)
            },
            ...htmlAttributes,
        },
        children
    )
}

export default AnimateInViewport
