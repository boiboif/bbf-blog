import React from 'react'
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
    const { imgList } = props
    const [activeIndex, setActiveIndex] = useControllableValue<number>(props, {
        valuePropName: 'activeIndex',
        defaultValue: 0,
    })

    const handleClick = (index: number) => {
        if (index === activeIndex) return
        setActiveIndex(index)
    }

    return (
        <>
            {imgList?.map((img, index) => {
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
