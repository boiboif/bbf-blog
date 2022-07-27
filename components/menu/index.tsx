import classNames from 'classnames'
import Image from 'next/image'
import React, { useEffect } from 'react'
import { useSpring, animated, easings, useSprings } from 'react-spring'
import style from './index.module.scss'
import logo from '@/public/img/logo.png'

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

    const menuList = ['首页', '分类', '文章', '留言', '关于我', '登录']
    const getDelayMap = (length: number) => {
        let current = 0
        let obj: Record<number, number> = {}

        obj = Array(length)
            .fill(null)
            .reduce((acc, cur, index) => {
                if (index % 2 === 0 && index !== 0) {
                    current += 2
                }
                const delay = current * 100 + 300
                return {
                    ...acc,
                    [index]: delay,
                }
            }, {})

        return obj
    }

    const menuSprings = useSprings(menuList.length, (i) => ({
        opacity: 0,
        x: 50,
        y: 30,
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

            menuSprings[1].set({
                opacity: 0,
                x: 50,
                y: 30,
            })

            menuSprings[1].start((i) => ({
                opacity: 1,
                delay: getDelayMap(menuList.length)[i],
                x: 0,
                y: 0,
            }))
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
    }, [visible, api, menuSprings, menuList.length])

    return (
        <animated.div className={classNames([style['menu-wrap']])} style={{ display: springProps.display, opacity: springProps.opacity }}>
            <animated.div className={classNames([style.bg])} style={{ backgroundPosition: springProps.backgroundPosition }}></animated.div>
            <div className='z-10 relative h-full flex flex-col lg:flex-row items-center lg:justify-center w-[90%] mx-auto my-20 lg:my-0'>
                <div className='mr-0 lg:mr-28 mb-10 lg:mb-0'>
                    <Image src={logo} alt=''></Image>
                </div>
                <div className='lg:flex-1'>
                    <ul className='flex flex-wrap'>
                        {menuSprings[0].map((menu, index) => {
                            return (
                                <animated.li
                                    key={index}
                                    className='font-sans font-bold text-center lg:text-left text-4xl sm:text-6xl w-1/2 lg:w-1/3 mr-0 lg:mr-20 mb-16 cursor-pointer'
                                    style={{
                                        ...menu,
                                    }}
                                >
                                    <span>
                                        <span className='text-teal-500'>{menuList[index][0]}</span>
                                        {menuList[index].slice(1)}
                                    </span>
                                </animated.li>
                            )
                        })}
                    </ul>
                </div>
            </div>
        </animated.div>
    )
}

export default Menu
