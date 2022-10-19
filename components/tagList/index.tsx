import React from 'react'
import classnames from 'classnames'
import { useControllableValue } from 'ahooks'

type ListItem = {
    name: string
    key: string
}

interface TagListProps {
    list?: ListItem[]
    activeKeys?: string[]
    onChange?: (activeKey: string[]) => void
}

const TagList = (props: TagListProps) => {
    const { list = [] } = props
    const [activeKeys, onChange] = useControllableValue<string[]>(props, {
        defaultValue: [],
        valuePropName: 'activeKeys',
    })

    const mergeList = [...list]

    return (
        <div className='flex justify-center flex-wrap text-sm lg:text-lg !leading-none lg:!leading-6'>
            {mergeList.map((item) => {
                return (
                    <div
                        onClick={() => {
                            if (activeKeys.includes(item.key)) {
                                onChange([...activeKeys].filter((key) => key !== item.key))
                            } else {
                                onChange([...activeKeys, item.key])
                            }
                        }}
                        key={item.key}
                        className={classnames([
                            'mr-3 mb-2 tracking-wider transition-all duration-200 px-[13px] py-[7px] border-primary border-[2px] text-primary font-semibold cursor-pointer hover:bg-teal-500 hover:border-teal-500 hover:text-white',
                            {
                                'text-primary': activeKeys.includes(item.key),
                                'bg-primary': activeKeys.includes(item.key),
                                '!text-white': activeKeys.includes(item.key),
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

export default TagList
