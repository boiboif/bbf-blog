import Image from 'next/image'
import React from 'react'
import btn_prev from '@/public/img/btn_prev.png'

interface BackButtonProps {
    onClick?: () => void
}

const BackButton = (props: BackButtonProps) => {
    return (
        <div className='cursor-pointer relative inline-block pl-7 lg:pl-10' onClick={() => props.onClick?.()}>
            <div className='w-5 lg:w-7 inline-block absolute left-0 top-1/2 -translate-y-1/2'>
                <Image className='w-full h-auto' src={btn_prev} alt='' />
            </div>
            <div className='text-rose-500 font-lycoReco text-2xl lg:text-3xl leading-[1.2] inline-block'>Back</div>
        </div>
    )
}

export default BackButton
