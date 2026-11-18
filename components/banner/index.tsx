import React, { useEffect, useRef } from 'react'
import Image, { StaticImageData } from 'next/image'
import styles from './index.module.scss'
import classNames from 'classnames'
import { useControllableValue } from 'ahooks'
import { useStore } from '@/store'
import { observer } from 'mobx-react-lite'

import AnimateInViewport from '@/components/animateInViewport'
interface BannerProps {
    autoPlay?: boolean
    imgList?: (string | StaticImageData)[]
    activeIndex?: number
    onChange?: (activeIndex: number) => void
    onTransitionEnd?: () => void
}

const Banner = (props: BannerProps) => {
    const { allowBannerAutoPlay, loading, setLoading, setAllowBannerAutoPlay } = useStore('globalStore')
    const { autoPlay = true, imgList, onTransitionEnd } = props
    const allowTransition = useRef(true)
    const loadedSlides = useRef(new Set<number>())
    const slideCount = imgList?.length ?? 0

    const [activeIndex, setActiveIndex] = useControllableValue<number>(props, {
        valuePropName: 'activeIndex',
        defaultValue: 0,
    })

    useEffect(() => {
        if (!allowBannerAutoPlay || !autoPlay || slideCount < 2) return
        const timer = setInterval(() => {
            if (!allowTransition.current) return
            allowTransition.current = false
            setActiveIndex((activeIndex + 1) % slideCount)
        }, 5000)

        return () => {
            clearInterval(timer)
        }
    }, [activeIndex, autoPlay, setActiveIndex, allowBannerAutoPlay, slideCount])

    return (
        <div className={classNames([styles['banner-wrap']])}>
            <AnimateInViewport
                ready={!loading}
                animateOnce
                animateCssClass='animate__backInDown'
                className='w-full absolute top-1/4 z-[5] text-center text-white text-shadow'
            >
                <div className='text-5xl lg:text-7xl font-bold'>BBF&apos;s Blog</div>
                <div className='text-2xl'>想做的事最优先~</div>
            </AnimateInViewport>
            {imgList?.map((img, index) => {
                return (
                    <div
                        key={index}
                        className={classNames(styles['img-wrap'], {
                            [styles.active]: activeIndex === index,
                        })}
                        onTransitionEnd={() => {
                            if (index === activeIndex) {
                                allowTransition.current = true
                                onTransitionEnd?.()
                            }
                        }}
                    >
                        <Image
                            fill
                            sizes='(min-width: 1024px) 50vw, 100vw'
                            className={classNames(styles.scale, 'object-cover object-left-top')}
                            src={img}
                            alt=''
                            onLoad={() => {
                                loadedSlides.current.add(index)
                                if (index === 0) {
                                    setLoading(false)
                                }
                                /** 所有图片加载完成后才可以进行轮播 */
                                if (loadedSlides.current.size === slideCount) {
                                    setAllowBannerAutoPlay(true)
                                }
                            }}
                            preload={index === 0}
                            loading={index === 0 ? undefined : loading && activeIndex !== index ? 'lazy' : 'eager'}
                            fetchPriority={index === 0 ? undefined : 'low'}
                            quality={50}
                        />
                    </div>
                )
            })}
        </div>
    )
}

export default observer(Banner)
