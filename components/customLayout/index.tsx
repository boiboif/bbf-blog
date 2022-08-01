import { useDebounceFn } from 'ahooks'
import React, { PropsWithChildren, useEffect, useState } from 'react'
import style from './index.module.scss'
import cn from 'classnames'
import variables from '@/styles/variables.module.scss'
import Menu from '../menu'
import { useSpring, animated } from 'react-spring'
import MenuButton from '../menuButton'

const CustomLayout = (props: PropsWithChildren) => {
    const [menuVis, setMenuVis] = useState(false)
    const [status, setStatus] = useState<'close' | 'open'>('close')
    const [isHidden, setIsHidden] = useState(false)
    const springProps = useSpring({
        from: {
            opacity: 0,
        },
        to: {
            opacity: 1,
        },
        config: { duration: 500 },
    })

    const setHidden = useDebounceFn(
        () => {
            setIsHidden(false)
        },
        {
            wait: 2000,
        }
    )
    useEffect(() => {
        const scollFn = () => {
            setIsHidden(true)
            setHidden.run()
        }

        document.addEventListener('wheel', scollFn)

        return () => {
            document.removeEventListener('wheel', scollFn)
        }
    }, [setHidden])

    return (
        <div
            id='custom-layout'
            className={cn([style['layout-container'], 'lg:h-screen lg:overflow-auto lg:mr-20 mr-0'])}
            style={{ '--bg': isHidden ? variables.primaryColor : '#fff' } as React.CSSProperties}
        >
            <Menu visible={menuVis} />
            <animated.div
                className='menubar fixed right-0 top-0 lg:h-full lg:w-20 h-10 w-12 z-20 cursor-pointer flex justify-center items-center'
                style={{ background: variables.primaryColor, ...springProps }}
                onClick={() => {
                    setMenuVis(!menuVis)
                    setStatus(status === 'open' ? 'close' : 'open')
                }}
            >
                <MenuButton status={status}></MenuButton>
            </animated.div>
            {props.children}
        </div>
    )
}

export default CustomLayout
