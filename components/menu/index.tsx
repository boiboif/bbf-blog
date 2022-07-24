import { useDebounceFn } from 'ahooks'
import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import { useSpring, animated, easings } from 'react-spring'
import style from './index.module.scss'

interface MenuProps {
    visible?: boolean
}

const Menu = (props: MenuProps) => {
    const { visible } = props

    const [springProps, api] = useSpring(() => ({
        opacity: 0,
        backgroundPosition: '288px 709px',
        display: 'none',
    }))

    useEffect(() => {
        if (visible) {
            api.set({
                backgroundPosition: '288px 709px',
            })

            api.start({
                display: 'block',
                opacity: 1,
                immediate(key) {
                    return key === 'display'
                },
                config: {
                    duration: 400,
                },
            })

            api.start({
                backgroundPosition: '0 0',
                config: {
                    duration: 2600,
                    easing: easings.easeOutQuart,
                },
                delay: 50,
            })
        } else {
            api.start({
                opacity: 0,
                display: 'none',
                backgroundPosition: '288px 709px',
                delay: (key) => (key !== 'opacity' ? 400 : 0),
                immediate: (key) => key === 'backgroundPosition',
                config: {
                    duration: 400,
                },
            })
        }
    }, [visible, api])

    return (
        <animated.div className={classNames([style['menu-wrap']])} style={{ display: springProps.display, opacity: springProps.opacity }}>
            <animated.div className={classNames([style.bg])} style={{ backgroundPosition: springProps.backgroundPosition }}></animated.div>
        </animated.div>
    )
}

export default Menu
