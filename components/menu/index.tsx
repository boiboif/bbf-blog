import classNames from 'classnames'
import Image from 'next/image'
import React, { useEffect } from 'react'
import { useSpring, animated, easings } from 'react-spring'
import style from './index.module.scss'
import logo from '@/public/img/logo.png'
import { useRouter } from 'next/router'
import { observer } from 'mobx-react-lite'
import { useStore } from '@/store'
import { useResponsive } from 'ahooks'
import dynamic from 'next/dynamic'

const AnimateInViewport = dynamic(() => import('@/components/animateInViewport'))

interface MenuProps {
    visible?: boolean
    onLogin?: () => void
    onPush?: () => void
}

const getDelayMap = (length: number, baseDelay: number = 200) => {
    let current = 0
    let obj: Record<number, number> = {}

    obj = Array(length)
        .fill(null)
        .reduce((acc, cur, index) => {
            if (index % 2 === 0 && index !== 0) {
                current += 2
            }
            const delay = current * 100 + baseDelay
            return {
                ...acc,
                [index]: delay,
            }
        }, {})

    return obj
}

const Menu = (props: MenuProps) => {
    const { visible, onLogin, onPush } = props
    const router = useRouter()
    const userInfoStore = useStore('userInfoStore')
    const response = useResponsive()

    const [springProps, api] = useSpring(() => ({
        opacity: 0,
        backgroundPosition: '288px 709px',
        display: 'none',
    }))

    let menuList = [
        { name: '首页', path: '/' },
        { name: '分类', path: '/category' },
        { name: '标签', path: '/tag' },
    ]

    menuList = [...menuList, userInfoStore.userInfo ? { name: '后台', path: '/manager' } : { name: '登录', path: '' }]

    const delayMap = getDelayMap(menuList.length)

    useEffect(() => {
        const initBackgroundPosition = response.md ? '288px 709px' : '144px 350px'
        if (visible) {
            api.set({
                backgroundPosition: initBackgroundPosition,
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
                backgroundPosition: initBackgroundPosition,
                delay: (key) => (key !== 'opacity' ? 400 : 0),
                immediate: (key) => key === 'backgroundPosition',
                config: {
                    duration: 400,
                },
            })
        }
    }, [visible, api, response])

    const handleClick = (menu: { name: string; path: string }) => {
        if (menu.path) {
            router.push(menu.path)
            onPush?.()
        }
        if (menu.name === '登录') {
            onLogin?.()
        }
    }

    return (
        <animated.div className={classNames([style['menu-wrap']])} style={{ display: springProps.display, opacity: springProps.opacity }}>
            <animated.div className={classNames([style.bg])} style={{ backgroundPosition: springProps.backgroundPosition }}></animated.div>
            <div className='z-10 relative h-full flex flex-col lg:flex-row items-center lg:justify-center w-[90%] mx-auto my-20 lg:my-0'>
                <div className='mr-0 lg:mr-14 xl:mr-40 mb-10 lg:mb-0'>
                    <Image src={logo} alt=''></Image>
                </div>
                <div className='w-full'>
                    <ul className='flex flex-wrap'>
                        {menuList.map((menu, index) => {
                            return (
                                <li
                                    className='font-sans font-bold text-center lg:text-left text-4xl sm:text-6xl w-1/2 lg:w-1/3 mr-0 lg:mr-16 xl:mr-16 mb-16 cursor-pointer'
                                    key={menu.name + menu.path}
                                >
                                    <AnimateInViewport delay={delayMap[index]} animateCssClass='animate__fadeInBottomRight'>
                                        <span onClick={() => handleClick(menu)}>
                                            <span className='text-teal-500'>{menu.name[0]}</span>
                                            {menu.name.slice(1)}
                                        </span>
                                    </AnimateInViewport>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>
        </animated.div>
    )
}

export default observer(Menu)
