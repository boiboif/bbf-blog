import React from 'react'
import classnames from 'classnames'
import { useControllableValue } from 'ahooks'

type ListItem = {
    name: string
    key: string
}

interface CateListProps {
    list?: ListItem[]
    activeKey?: string
    onChange?: (activeKey: string) => void
}

const CateList = (props: CateListProps) => {
    const { list = [] } = props
    const [activeKey, onChange] = useControllableValue<string>(props, {
        defaultValue: '',
        valuePropName: 'activeKey',
    })

    const mergeList = [{ name: 'All', key: '' }, ...list]

    return (
        <div className='flex justify-center flex-wrap text-sm lg:text-lg !leading-none lg:!leading-6'>
            {mergeList.map((item) => {
                return (
                    <div
                        onClick={() => onChange(item.key)}
                        key={item.key}
                        className={classnames([
                            'mr-3 mb-2 tracking-wider transition-all duration-200 px-[13px] py-[5px] border-primary border-[2px] text-primary font-semibold cursor-pointer hover:bg-teal-500 hover:border-teal-500 hover:text-white',
                            {
                                'text-primary': activeKey === item.key,
                                'bg-primary': activeKey === item.key,
                                '!text-white': activeKey === item.key,
                            },
                        ])}
                    >
                        {item.name}
                    </div>
                )
            })}
        </div>
    )
}

export default CateList
