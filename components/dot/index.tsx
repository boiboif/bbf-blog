import { useStore } from '@/store'
import { useMouse } from 'ahooks'
import React, { useEffect } from 'react'
import { useSpring, animated } from 'react-spring'

const Dot = () => {
    const { dotShow, dotColor } = useStore('globalStore')
    const mouse = useMouse()

    const [dotSpring, dotSpringApi] = useSpring(() => ({
        x: 0,
        y: 0,
        scale: 0,
    }))

    useEffect(() => {
        if (mouse.clientX) {
            dotSpringApi.start({
                x: mouse.clientX - 24,
                y: mouse.clientY - 24,
                scale: dotShow ? 1 : 0,
            })
        }
    }, [mouse, dotSpringApi, dotShow])

    return (
        <animated.div
            style={{
                ...dotSpring,
                backgroundColor: dotColor.color,
            }}
            className='fixed left-0 top-0 rounded-[50%] cursor-pointer h-12 w-12 pointer-events-none !opacity-50 z-50 transition-colors'
        ></animated.div>
    )
}

export default Dot
