import type { ModalFuncProps } from 'antd'
import { App, Button, Dropdown } from 'antd'
import { ExclamationCircleOutlined, DownOutlined } from '@ant-design/icons'

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

    const { modal } = App.useApp()
    const items = menuList.map((item, index) => ({
        key: String(index),
        label: typeof item.name === 'function' ? item.name(record) : item.name,
        disabled: item.disabled?.(record) ?? false,
        className: item.className,
    }))

    const handleAction = ({ key }: { key: string }) => {
        const item = menuList[Number(key)]
        if (item.confirmProps) {
            modal.confirm({
                icon: <ExclamationCircleOutlined />,
                content: '确定删除吗？',
                cancelText: '取消',
                okText: '确定',
                okButtonProps: { danger: true, type: 'primary' },
                onOk: () => item.fn?.(record),
                ...item.confirmProps,
            })
        } else {
            item.fn?.(record)
        }
    }

    return (
        <Dropdown menu={{ items, onClick: handleAction }} trigger={['hover', 'click']} disabled={items.every(item => item.disabled)}>
            <Button type='link' size='small'>{moreText}<DownOutlined /></Button>
        </Dropdown>
    )
}

export default TableMoreAction
