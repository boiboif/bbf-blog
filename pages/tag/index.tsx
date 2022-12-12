import { GetStaticProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import moment from 'moment'
import { getPostMany, getTagAll } from '@/service'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import Link from 'next/link'
import { useDotShow } from '@/hook/useDotShow'
import { useRequest } from 'ahooks'
import { getArticleAll } from '@/clientApi'

const ArticleLayout = dynamic(() => import('@/components/articleLayout'))
const ArticleListItem = dynamic(() => import('@/components/articleListItem'))

const Tag: NextPage<{ articleList: API.Article[]; tagList: API.Tag[] }> = (props) => {
    const { articleList, tagList } = props
    const router = useRouter()
    const dotShow = useDotShow()

    const { data = articleList } = useRequest(() => getArticleAll().then((res) => res?.data), {
        cacheKey: 'getArticleAll',
    })

    const toTag = (tagId: string) => {
        router.push({
            pathname: `/tag`,
            query: {
                tags: tagId,
            },
        })
    }

    const filterArticleList = useMemo(() => {
        const tags = router.query.tags ? (router.query.tags as string).split(',') : []
        return tags.length > 0 ? data.filter((v) => v.tags?.some((t) => tags.includes(t.id.toString()))) : data
    }, [data, router.query.tags])

    return (
        <ArticleLayout tagList={tagList} title='标签'>
            <Head>
                <title>BBF的个人博客 - 标签</title>
            </Head>
            <div {...dotShow}>
                {filterArticleList.map((article) => {
                    return (
                        <Link
                            key={article.id}
                            href={{
                                pathname: `/article/${article.id}`,
                            }}
                        >
                            <a className='link'>
                                <ArticleListItem
                                    cate={article.cate.name}
                                    publishDate={moment(article.createdAt).format('YYYY-MM-DD')}
                                    title={article.title}
                                    onTagClick={toTag}
                                    tags={article.tags}
                                    viewCout={article.viewCount}
                                ></ArticleListItem>
                                <div className='h-[1px] bg-gray-300'></div>
                            </a>
                        </Link>
                    )
                })}
            </div>
        </ArticleLayout>
    )
}

export const getStaticProps: GetStaticProps = async () => {
    const allPost = await getPostMany()
    const allTag = await getTagAll()

    return {
        props: {
            articleList: allPost ?? [],
            tagList: allTag ?? [],
        },
        revalidate: 60,
    }
}

// export const getServerSideProps: GetServerSideProps = async (context) => {
//     const { cateId } = context.query

//     const allPost = await getPostMany({ cateId: cateId as string })
//     const allCate = await getCateMany()
//     return {
//         props: {
//             articleList: allPost ?? [],
//             cateList: allCate ?? [],
//         },
//     }
// }

export default Tag
