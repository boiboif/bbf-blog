import classNames from 'classnames'
import Image from 'next/image'
import React, { useEffect } from 'react'
import { useSpring, animated, easings } from 'react-spring'
import style from './index.module.scss'
import logo from '@/public/img/logo.png'
import AnimateInViewport from '../animateInViewport'
import { useRouter } from 'next/router'

interface MenuProps {
    visible?: boolean
}

const getDelayMap = (length: number) => {
    let current = 0
    let obj: Record<number, number> = {}

    obj = Array(length)
        .fill(null)
        .reduce((acc, cur, index) => {
            if (index % 2 === 0 && index !== 0) {
                current += 2
            }
            const delay = current * 100 + 200
            return {
                ...acc,
                [index]: delay,
            }
        }, {})

    return obj
}

const Menu = (props: MenuProps) => {
    const { visible } = props
    const router = useRouter()

    const [springProps, api] = useSpring(() => ({
        opacity: 0,
        backgroundPosition: '288px 709px',
        display: 'none',
    }))

    const menuList = [
        { name: '首页', path: '/' },
        { name: '分类', path: '' },
        { name: '文章', path: '' },
        { name: '留言', path: '' },
        { name: '关于我', path: '' },
        { name: '后台', path: '/manager' },
    ]
    const delayMap = getDelayMap(menuList.length)

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

    const handleClick = (menu: { name: string; path: string }) => {
        if (menu.path) {
            router.push(menu.path)
        }
    }

    return (
        <animated.div className={classNames([style['menu-wrap']])} style={{ display: springProps.display, opacity: springProps.opacity }}>
            <animated.div className={classNames([style.bg])} style={{ backgroundPosition: springProps.backgroundPosition }}></animated.div>
            <div className='z-10 relative h-full flex flex-col lg:flex-row items-center lg:justify-center w-[90%] mx-auto my-20 lg:my-0'>
                <div className='mr-0 lg:mr-14 xl:mr-40 mb-10 lg:mb-0'>
                    <Image src={logo} alt=''></Image>
                </div>
                <div className='lg:flex-1'>
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

export default Menu
