import type { ModalFuncProps } from 'antd'
import { Menu, Modal, Dropdown } from 'antd'
import { ExclamationCircleOutlined, DownOutlined } from '@ant-design/icons'
const { confirm } = Modal

export interface MenuItem<T> {
    name: string | ((arg: T) => string)
    fn?: (record: T) => void
    disabled?: (record: T) => boolean
    confirmProps?: ModalFuncProps
    className?: string
}

interface Props<T> {
    menuList: MenuItem<T>[]
    record: T
    moreText?: string
}

const TableMoreAction = <T extends Record<string, any>>(props: Props<T>) => {
    const { record, menuList, moreText = '更多' } = props

    const moreBtnDisabled = menuList.every((menu) => menu.disabled && menu.disabled(record))

    const menu = (record: T) => (
        <Menu>
            {menuList.map((item) => {
                const { className = 'text-sky-500 cursor-pointer', confirmProps } = item
                const disabled = item.disabled ? item.disabled(record) : false
                const dealName = typeof item.name === 'function' ? item.name(record) : item.name
                return (
                    <Menu.Item key={dealName}>
                        <div
                            className={disabled ? 'text-gray-300' : className}
                            onClick={(e) => {
                                e.stopPropagation()
                                if (disabled) return
                                if (confirmProps) {
                                    const defaultConfirmProps: ModalFuncProps = {
                                        icon: <ExclamationCircleOutlined />,
                                        content: '确 定 删 除 吗  ？',
                                        cancelText: '取消',
                                        okText: '确定',
                                        okButtonProps: {
                                            danger: true,
                                            type: 'primary',
                                        },
                                        onOk() {
                                            item.fn?.(record)
                                        },
                                    }
                                    const mergeConfirmProps = {
                                        ...defaultConfirmProps,
                                        ...confirmProps,
                                    }
                                    return confirm(mergeConfirmProps)
                                }
                                item.fn?.(record)
                            }}
                        >
                            {dealName}
                        </div>
                    </Menu.Item>
                )
            })}
        </Menu>
    )

    return (
        <>
            <Dropdown overlay={menu(record)}>
                <a className={moreBtnDisabled ? 'text-gray-300' : ''}>
                    {moreText}
                    <DownOutlined />
                </a>
            </Dropdown>
        </>
    )
}

export default TableMoreAction
