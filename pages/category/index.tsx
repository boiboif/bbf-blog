import { GetStaticProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import { getPostSummaries, getCateMany } from '@/service'
import Head from 'next/head'
import Link from 'next/link'
import { useDotShow } from '@/hook/useDotShow'

import ArticleLayout from '@/components/articleLayout'
import ArticleListItem from '@/components/articleListItem'

const Category: NextPage<{ articleList: API.ArticleSummary[]; cateList: API.Cate[] }> = (props) => {
    const { articleList, cateList } = props
    const router = useRouter()
    const cateId = router.query.cateId as string
    const dotShow = useDotShow()

    const toTag = (tagId: string) => {
        router.push({
            pathname: `/tag`,
            query: {
                tags: tagId,
            },
        })
    }

    const filterArticleList = useMemo(() => {
        return cateId ? articleList.filter((v) => v.cateId.toString() === cateId) : articleList
    }, [articleList, cateId])

    return (
        <ArticleLayout cateList={cateList} title='分类'>
            <Head>
                <title>BBF的个人博客 - 分类</title>
            </Head>
            <div {...dotShow}>
                {filterArticleList.map((article) => {
                    return (
                        <Link key={article.id} href={`/article/${article.id}`} className='link'>
                            <ArticleListItem
                                cate={article.cate.name}
                                publishDate={article.createdAt}
                                title={article.title}
                                onTagClick={toTag}
                                tags={article.tags}
                                viewCout={article.viewCount}
                            ></ArticleListItem>
                            <div className='h-[1px] bg-gray-300'></div>
                        </Link>
                    )
                })}
            </div>
        </ArticleLayout>
    )
}

export const getStaticProps: GetStaticProps = async () => {
    const [allPost, cateList] = await Promise.all([getPostSummaries(), getCateMany()])

    return {
        props: {
            articleList: allPost,
            cateList,
        },
        revalidate: 60,
    }
}

export default Category
