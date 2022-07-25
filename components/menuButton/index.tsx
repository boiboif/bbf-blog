import classNames from 'classnames'
import { useControllableValue } from 'ahooks'

type Status = 'open' | 'close'

interface MenuButtonProps {
    status?: Status
    defaultStatus?: Status
    onStatusChange?: (status: Status) => void
    size?: 'middle' | 'large' | 'small'
}

const MenuButton = (props: MenuButtonProps) => {
    const { size = 'middle' } = props

    const [status, setStatus] = useControllableValue(props, {
        valuePropName: 'status',
        defaultValue: 'close',
        defaultValuePropName: 'defaultStatus',
        trigger: 'onStatusChange',
    })

    const handleClick = () => {
        setStatus(status === 'open' ? 'close' : 'open')
    }

    return (
        <div
            className={classNames(['menu-button-wrap'], {
                open: status === 'open',
                close: status === 'close',
                large: size === 'large',
                small: size === 'small',
            })}
            onClick={handleClick}
        >
            <div className='menu-button-open'>
                <div className='menu-button-open-item item1'>
                    <div className='menu-button-open-deco' />
                </div>
                <div className='menu-button-open-item item2'>
                    <div className='menu-button-open-deco' />
                </div>
                <div className='menu-button-open-item item3'>
                    <div className='menu-button-open-deco' />
                </div>
            </div>

            <div className='menu-button-close'>
                <div className='menu-button-close-item item1'>
                    <div className='menu-button-close-deco' />
                </div>
                <div className='menu-button-close-item item2'>
                    <div className='menu-button-close-deco' />
                </div>
            </div>
        </div>
    )
}

export default MenuButton
