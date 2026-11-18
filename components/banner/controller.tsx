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
                    <button
                        type='button'
                        className={cn(['relative block', props.className])}
                        key={index}
                        aria-label={`切换到第 ${index + 1} 张封面`}
                        aria-pressed={activeIndex === index}
                        onClick={() => handleClick(index)}
                    >
                        <span
                            className={cn([
                                'absolute inset-0 w-full z-10 transition-opacity',
                                styles['img-on-wrap'],
                                { [styles.active]: activeIndex === index },
                            ])}
                        >
                            <Image
                                quality={50}
                                className='w-full h-auto'
                                src={img.on}
                                alt=''
                                onDragStart={(e) => e.preventDefault()}
                            ></Image>
                        </span>
                        <Image className='w-full h-auto' quality={50} src={img.off} alt='' />
                    </button>
                )
            })}
        </>
    )
}

export default Controller
