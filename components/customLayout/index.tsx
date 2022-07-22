import React, { PropsWithChildren } from 'react'
import style from './index.module.scss'

const CustomLayout = (props: PropsWithChildren) => {
    return (
        <div className={style['layout-container']}>
            <div className='text-red-500'>头部</div>
            {props.children}
            <div>脚步</div>
        </div>
    )
}

export default CustomLayout
