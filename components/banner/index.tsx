import React, { useRef, useState } from 'react'
import img0 from '@/public/img/img_main-00.jpg'
import img1 from '@/public/img/img_main-01.jpg'
import img2 from '@/public/img/img_main-02.jpg'
import Image from 'next/image'
import styles from './index.module.scss'
import classNames from 'classnames'
import { useControllableValue, useInterval } from 'ahooks'

interface BannerProps {
    autoPlay?: boolean
    imgList?: string[]
    activeIndex?: number
    onChange?: (activeIndex: number) => void
}

const Banner = (props: BannerProps) => {
    const { autoPlay = true, imgList = [img0, img1, img2] } = props

    const allowTransition = useRef(true)

    const [activeIndex, setActiveIndex] = useControllableValue<number>(props, {
        valuePropName: 'activeIndex',
        defaultValue: 0,
    })

    useInterval(() => {
        if (!allowTransition.current || !autoPlay) return
        allowTransition.current = false
        setActiveIndex((activeIndex + 1) % 3)
    }, 3000)

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
