import React, { useState } from 'react'
import styles from './index.module.scss'
import cn from 'classnames'

interface MenuButtonProps {
    size?: 'middle' | 'large' | 'small'
}

const MenuButton = (props: MenuButtonProps) => {
    const [status, setStatue] = useState<'open' | 'close'>('open')

    const handleClick = () => {
        setStatue(status === 'open' ? 'close' : 'open')
    }

    return (
        <div className={styles['button-wrap']}>
            <div className={styles['button-open']} onClick={handleClick}>
                <div className={styles['button-open-item1']}>
                    <div className={cn([styles['button-open-deco'], { [styles.active]: status === 'open' }])}></div>
                </div>
                <div className={styles['button-open-item2']}>
                    <div className={cn([styles['button-open-deco'], { [styles.active]: status === 'open' }])}></div>
                </div>
                <div className={styles['button-open-item3']}>
                    <div className={cn([styles['button-open-deco'], { [styles.active]: status === 'open' }])}></div>
                </div>
            </div>

            {/* <div>close</div> */}
        </div>
    )
}

export default MenuButton
