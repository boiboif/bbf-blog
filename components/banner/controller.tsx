import React from 'react'
import img0_on from '@/public/img/tab-00_on.jpg'
import img1_on from '@/public/img/tab-01_on.jpg'
import img2_on from '@/public/img/tab-02_on.jpg'
import img0_off from '@/public/img/tab-00_off.jpg'
import img1_off from '@/public/img/tab-01_off.jpg'
import img2_off from '@/public/img/tab-02_off.jpg'
import Image, { StaticImageData } from 'next/image'
import styles from './controller.module.scss'
import cn from 'classnames'
import { useControllableValue } from 'ahooks'

interface ControllerProps {
    imgList?: { on: string | StaticImageData; off: string | StaticImageData }[]
    activeIndex?: number
    onChange?: (activeIndex: number) => void
    className?: string
}

const Controller = (props: ControllerProps) => {
    const {
        imgList = [
            { on: img2_on, off: img2_off },
            { on: img1_on, off: img1_off },
            { on: img0_on, off: img0_off },
        ],
    } = props
    const [activeIndex, setActiveIndex] = useControllableValue<number>(props, {
        valuePropName: 'activeIndex',
        defaultValue: 0,
    })

    const handleClick = (index: number) => {
        setActiveIndex(index)
    }

    return (
        <>
            {imgList.map((img, index) => {
                return (
                    <div className={cn(['relative', props.className])} key={index} onClick={() => handleClick(index)}>
                        <div
                            className={cn([
                                'absolute w-full z-10 transition-opacity',
                                styles['img-on-wrap'],
                                { [styles.active]: activeIndex === index },
                            ])}
                        >
                            <Image src={img.on} alt='' layout='responsive' onDragStart={(e) => e.preventDefault()}></Image>
                        </div>
                        <div>
                            <Image src={img.off} alt='' layout='responsive'></Image>
                        </div>
                    </div>
                )
            })}
        </>
    )
}

export default Controller
