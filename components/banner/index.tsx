import React, { useEffect, useRef } from 'react'
import Image, { StaticImageData } from 'next/image'
import styles from './index.module.scss'
import classNames from 'classnames'
import { useControllableValue } from 'ahooks'
import { useStore } from '@/store'
import { observer } from 'mobx-react-lite'

interface BannerProps {
    autoPlay?: boolean
    imgList?: (string | StaticImageData)[]
    activeIndex?: number
    onChange?: (activeIndex: number) => void
    onTransitionEnd?: () => void
}

const Banner = (props: BannerProps) => {
    const globalStore = useStore('globalStore')
    const { autoPlay = true, imgList, onTransitionEnd } = props
    const allowTransition = useRef(true)
    const loadedIndex = useRef(0)

    const [activeIndex, setActiveIndex] = useControllableValue<number>(props, {
        valuePropName: 'activeIndex',
        defaultValue: 0,
    })

    useEffect(() => {
        if (globalStore.loading) return
        const timer = setInterval(() => {
            if (!allowTransition.current || !autoPlay) return
            allowTransition.current = false
            setActiveIndex((activeIndex + 1) % 3)
        }, 3000)

        return () => {
            clearInterval(timer)
        }
    }, [activeIndex, autoPlay, setActiveIndex, globalStore.loading])

    return (
        <div className={classNames([styles['banner-wrap']])}>
            {imgList?.map((img, index) => {
                return (
                    <div
                        key={index}
                        className={classNames(styles['img-wrap'], 'min-h-[500px] lg:min-h-[712px]', {
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
                            layout='fill'
                            className={classNames([styles['scale']])}
                            src={img}
                            alt=''
                            onLoadingComplete={() => {
                                loadedIndex.current += 1
                                if (loadedIndex.current === imgList.length) {
                                    globalStore.setLoading(false)
                                }
                            }}
                            priority
                        />
                    </div>
                )
            })}
        </div>
    )
}

export default observer(Banner)
