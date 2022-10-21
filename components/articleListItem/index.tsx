import React from 'react'
import classnames from 'classnames'
import { TagsOutlined } from '@ant-design/icons'
import { Space } from 'antd'
import { useDotColor } from '@/hook/useDotShow'
interface ArticleListItemProps {
    publishDate?: string
    cate?: string
    title?: string
    onClick?: () => void
    onTagClick?: (tagId: string) => void
    size?: 'large' | 'middle'
    tags?: API.Tag[]
}

const ArticleListItem = (props: ArticleListItemProps) => {
    const { publishDate, cate, title, onClick, size, tags = [], onTagClick } = props
    const dotColorProps = useDotColor()

    return (
        <div
            onClick={() => onClick?.()}
            className='group cursor-pointer py-4 lg:py-[30px] flex flex-wrap justify-start items-center lg:flex-nowrap'
            {...dotColorProps}
        >
            <div className='text-teal-500 mr-5 font-lycoReco leading-none group-hover:text-rose-500 transition-colors duration-300 text-xs lg:text-[15px] tracking-wider font-semibold'>
                {publishDate}
            </div>
            <div className='bg-teal-500 py-[2px] lg:py-[3px] text-white px-3 lg:mr-10 group-hover:bg-rose-500 transition-colors duration-300 !leading-none lg:text-base tracking-wider font-medium'>
                {cate}
            </div>
            {tags.length > 0 && (
                <div className='lg:hidden ml-4 flex items-center text-xs text-gray-500 transition-colors'>
                    <TagsOutlined className='mr-1 !text-teal-500' />
                    <Space size='small'>
                        {tags.map((t) => (
                            <span
                                key={t.id}
                                className='hover:text-rose-500 transition-colors'
                                onClick={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    onTagClick?.(t.id.toString())
                                }}
                            >
                                {t.name}
                            </span>
                        ))}
                    </Space>
                </div>
            )}

            <div
                className={classnames([
                    'w-full mt-3 font-sans lg:mt-0 leading-6 text-base lg:w-auto',
                    {
                        'lg:!text-2xl': size === 'large',
                        '!text-xl': size === 'large',
                        'lg:!text-lg': size === 'middle',
                        '!text-md': size === 'middle',
                        'font-bold': size === 'large' || size === 'middle',
                    },
                ])}
            >
                {title}
            </div>
            {tags.length > 0 && (
                <div className='hidden lg:flex items-center ml-4 mt-1 text-gray-500'>
                    <TagsOutlined className='mr-1 !text-teal-500 group-hover:!text-rose-500 transition-colors' />
                    <Space size='small'>
                        {tags.map((t) => (
                            <span
                                key={t.id}
                                className='hover:text-rose-500 transition-colors'
                                onClick={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    onTagClick?.(t.id.toString())
                                }}
                            >
                                {t.name}
                            </span>
                        ))}
                    </Space>
                </div>
            )}
        </div>
    )
}

export default ArticleListItem
