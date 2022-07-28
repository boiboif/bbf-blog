import React from 'react'

interface ArticleListItemProps {
    publishDate?: string
    cate?: string
    title?: string
}

const ArticleListItem = (props: ArticleListItemProps) => {
    const { publishDate = '2022.07.26', cate = 'Info', title = '#5「So far, so good」予告動画 公開！' } = props

    return (
        <div className='group cursor-pointer py-4 lg:py-[30px] flex flex-wrap justify-start items-center lg:flex-nowrap lg:justify-center'>
            <div className='text-teal-500 mr-5 font-lycoReco leading-none group-hover:text-rose-500 transition-colors duration-300 text-xs lg:text-[15px] tracking-wider font-medium'>
                {publishDate}
            </div>
            <div className='bg-teal-500 py-[2px] text-white px-3 font-lycoReco lg:mr-10 group-hover:bg-rose-500 transition-colors duration-300 text-xs leading-none lg:text-base lg:leading-none tracking-wider font-medium'>
                {cate}
            </div>
            <div className='w-full mt-3 lg:mt-0 font-lycoReco leading-6 lg:text-base'>{title}</div>
        </div>
    )
}

export default ArticleListItem
