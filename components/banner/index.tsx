import React, { useEffect, useRef } from 'react'
import Image, { StaticImageData } from 'next/image'
import styles from './index.module.scss'
import classNames from 'classnames'
import { useControllableValue } from 'ahooks'

interface BannerProps {
    autoPlay?: boolean
    imgList?: (string | StaticImageData)[]
    activeIndex?: number
    onChange?: (activeIndex: number) => void
    onTransitionEnd?: () => void
}

const Banner = (props: BannerProps) => {
    const { autoPlay = true, imgList, onTransitionEnd } = props

    const allowTransition = useRef(true)

    const [activeIndex, setActiveIndex] = useControllableValue<number>(props, {
        valuePropName: 'activeIndex',
        defaultValue: 0,
    })

    useEffect(() => {
        const timer = setInterval(() => {
            if (!allowTransition.current || !autoPlay) return
            allowTransition.current = false
            setActiveIndex((activeIndex + 1) % 3)
        }, 3000)

        return () => {
            clearInterval(timer)
        }
    }, [activeIndex, autoPlay, setActiveIndex])

    return (
        <>
            <div className={styles['banner-wrap']}>
                {imgList?.map((img, index) => {
                    return (
                        <div
                            key={index}
                            className={classNames(styles['img-wrap'], { [styles.active]: activeIndex === index })}
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
                                priority
                            />
                        </div>
                    )
                })}
            </div>
        </>
    )
}

export default Banner
