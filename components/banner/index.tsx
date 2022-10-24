import React, { useEffect, useRef, useState } from 'react'
import Image, { StaticImageData } from 'next/image'
import styles from './index.module.scss'
import classNames from 'classnames'
import { useControllableValue } from 'ahooks'
import { useStore } from '@/store'
import { observer } from 'mobx-react-lite'
import { canCSSPropertiesUsed } from '@/utils/canCSSPropertiesUsed'
import dynamic from 'next/dynamic'

const AnimateInViewport = dynamic(() => import('@/components/animateInViewport'))
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
    const loadedIndex = useRef(0)
    const [imageLayout, setImageLayout] = useState<'fixed' | 'responsive' | 'fill' | 'intrinsic' | undefined>()

    const [activeIndex, setActiveIndex] = useControllableValue<number>(props, {
        valuePropName: 'activeIndex',
        defaultValue: 0,
    })

    useEffect(() => {
        if (!allowBannerAutoPlay) return
        const timer = setInterval(() => {
            if (!allowTransition.current || !autoPlay) return
            allowTransition.current = false
            setActiveIndex((activeIndex + 1) % 3)
        }, 5000)

        return () => {
            clearInterval(timer)
        }
    }, [activeIndex, autoPlay, setActiveIndex, allowBannerAutoPlay])

    useEffect(() => {
        setImageLayout(canCSSPropertiesUsed('aspectRatio') ? 'fill' : 'responsive')
    }, [])

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
            {imageLayout &&
                imgList?.map((img, index) => {
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
                                objectPosition='left top'
                                objectFit='cover'
                                layout={imageLayout}
                                className={classNames([styles['scale']])}
                                src={img}
                                alt=''
                                onLoadingComplete={() => {
                                    loadedIndex.current += 1
                                    if (index === 0) {
                                        setLoading(false)
                                    }
                                    /** 所有图片加载完成后才可以进行轮播 */
                                    if (loadedIndex.current === imgList.length) {
                                        setAllowBannerAutoPlay(true)
                                    }
                                }}
                                priority
                                quality={50}
                            />
                        </div>
                    )
                })}
        </div>
    )
}

export default observer(Banner)
