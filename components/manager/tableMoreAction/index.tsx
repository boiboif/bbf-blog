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
        <Menu
            items={menuList.map((item, index) => ({
                label: (
                    <div
                        className={
                            (item.disabled ? item.disabled(record) : false)
                                ? 'text-gray-300'
                                : item.className ?? 'text-sky-500 cursor-pointer'
                        }
                        onClick={(e) => {
                            e.stopPropagation()
                            if (item.disabled ? item.disabled(record) : false) return
                            if (item.confirmProps) {
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
                                    ...item.confirmProps,
                                }
                                return confirm(mergeConfirmProps)
                            }
                            item.fn?.(record)
                        }}
                    >
                        {typeof item.name === 'function' ? item.name(record) : item.name}
                    </div>
                ),
                key: index,
            }))}
        ></Menu>
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
