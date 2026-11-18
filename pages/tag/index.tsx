import { GetStaticProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import { getPostSummaries, getTagAll } from '@/service'
import Head from 'next/head'
import Link from 'next/link'
import { useDotShow } from '@/hook/useDotShow'

import ArticleLayout from '@/components/articleLayout'
import ArticleListItem from '@/components/articleListItem'

const Tag: NextPage<{ articleList: API.ArticleSummary[]; tagList: API.Tag[] }> = (props) => {
    const { articleList, tagList } = props
    const router = useRouter()
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
        const tags = router.query.tags?.toString().split(',').filter(Boolean) ?? []
        return tags.length > 0 ? articleList.filter((v) => v.tags.some((t) => tags.includes(t.id.toString()))) : articleList
    }, [articleList, router.query.tags])

    return (
        <ArticleLayout tagList={tagList} title='标签'>
            <Head>
                <title>BBF的个人博客 - 标签</title>
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
    const [allPost, tagList] = await Promise.all([getPostSummaries(), getTagAll()])

    return {
        props: {
            articleList: allPost,
            tagList,
        },
        revalidate: 60,
    }
}

export default Tag
