import React, { useEffect, useRef } from 'react'
import img0 from '@/public/img/img_main-00.jpg'
import img1 from '@/public/img/img_main-01.jpg'
import img2 from '@/public/img/img_main-02.jpg'
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
    const { autoPlay = true, imgList = [img0, img1, img2], onTransitionEnd } = props

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeIndex, autoPlay, setActiveIndex])

    return (
        <>
            <div className={styles['banner-wrap']}>
                {imgList.map((img, index) => {
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
                            <Image layout='responsive' src={img} alt='' />
                        </div>
                    )
                })}
            </div>
        </>
    )
}

export default Banner
