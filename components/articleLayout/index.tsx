import { useRouter } from 'next/router'
import React, { PropsWithChildren, useEffect, useRef } from 'react'
import style from './index.module.scss'
import logo from '@/public/img/logo.png'
import Image from 'next/image'
import dynamic from 'next/dynamic'

const CateList = dynamic(() => import('@/components/cateList'))
const TagList = dynamic(() => import('@/components/tagList'))

interface Props {
    cateList?: API.Cate[]
    tagList?: API.Tag[]
    title?: string
    activeKey?: string
}

const ArticleLayout = (props: PropsWithChildren<Props>) => {
    const { children, cateList, tagList, title = '文章', activeKey } = props
    const ref = useRef<HTMLDivElement>(null)

    const router = useRouter()
    const tags = router.query.tags ? (router.query.tags as string).split(',') : []

    useEffect(() => {
        ref.current?.scrollIntoView()
    }, [])

    const cateChange = (cateId: string) => {
        router.push({
            pathname: '/category',
            query: {
                cateId,
            },
        })
    }

    const tagChange = (keys: string[]) => {
        router.push({
            pathname: '/tag',
            query: {
                tags: keys.join(','),
            },
        })
    }

    return (
        <div className='relative pb-10' ref={ref}>
            <div className={style.bg}></div>

            <div className='w-[89.3%] max-w-[620px] lg:max-w-[1500px] lg:w-[90%] pt-5 lg:pt-14 mx-auto relative'>
                <div className='mb-10 lg:mb-24 lg:flex lg:items-center lg:flex-row-reverse lg:justify-between'>
                    <div className='w-[165px] mb-6 lg:mb-0 lg:w-[332px]'>
                        <Image priority layout='responsive' src={logo} alt=''></Image>
                    </div>

                    <div className='text-4xl lg:text-5xl font-bold tracking-widest'>
                        <span className='text-teal-500 text-5xl lg:text-6xl'>{title.slice(0, 1)}</span>
                        {title.slice(1)}
                    </div>
                </div>

                <div className='mb-10'>
                    {cateList ? (
                        <CateList
                            activeKey={(router.query.cateId as string) || activeKey || ''}
                            list={cateList.map((item) => ({ key: item.id.toString(), name: item.name }))}
                            onChange={cateChange}
                        ></CateList>
                    ) : tagList ? (
                        <TagList
                            activeKeys={tags}
                            list={tagList.map((item) => ({ key: item.id.toString(), name: item.name }))}
                            onChange={tagChange}
                        />
                    ) : null}
                </div>

                <div className='h-[1px] bg-gray-300'></div>

                {children}
            </div>
        </div>
    )
}

export default ArticleLayout
