import { GetServerSideProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import React from 'react'
import style from '@/styles/article.module.scss'
import logo from '@/public/img/logo.png'
import Image from 'next/image'
import CateList from '@/components/cateList'
import { useRequest } from 'ahooks'
import { getCateAll } from '@/service'
import { PrismaClient } from '@prisma/client'
import ArticleListItem from '@/components/articleListItem'
import moment from 'moment'

const Article: NextPage<{ articleList: API.Article[] }> = (props) => {
    const { articleList } = props

    const router = useRouter()

    const { data: cateList = [] } = useRequest(() =>
        getCateAll().then((res) => res?.data.map((item) => ({ key: item.id.toString(), name: item.name })))
    )

    const cateChange = (cateId: string) => {
        router.push({
            query: {
                cateId,
            },
        })
    }

    return (
        <div className={'w-[89.3%] max-w-[620px] lg:max-w-[1500px] lg:w-[90%] pt-5 lg:pt-14 mx-auto'}>
            <div className={style.bg}></div>

            <div className='relative'>
                <div className='mb-14 lg:mb-24 lg:flex lg:items-center lg:flex-row-reverse lg:justify-between'>
                    <div className='w-[165px] mb-6 lg:mb-0 lg:w-[332px]'>
                        <Image priority layout='responsive' src={logo} alt=''></Image>
                    </div>

                    <div className='text-4xl lg:text-5xl font-bold tracking-widest'>
                        <span className='text-teal-500 text-5xl lg:text-6xl'>文</span>章
                    </div>
                </div>

                <div className='mb-10'>
                    <CateList activeKey={router.query.cateId as string} list={cateList} onChange={cateChange}></CateList>
                </div>

                <div className='h-[1px] bg-gray-300'></div>

                {articleList.map((article) => {
                    return (
                        <div key={article.id}>
                            <ArticleListItem
                                cate={article.cate.name}
                                publishDate={moment(article.createdAt).format('YYYY-MM-DD')}
                                title={article.title}
                            ></ArticleListItem>
                            <div className='h-[1px] bg-gray-300'></div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { cateId } = context.query
    console.log(Number(cateId))
    const prisma = new PrismaClient()
    const allPost = await prisma.post.findMany({
        include: { author: { select: { username: true } }, cate: true },
        where: { cateId: Number(cateId) || undefined },
    })
    prisma.$disconnect()

    return {
        props: {
            articleList: JSON.parse(JSON.stringify(allPost)) ?? [],
        },
    }
}

export default Article
