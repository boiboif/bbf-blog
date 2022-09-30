import { GetStaticProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import ArticleListItem from '@/components/articleListItem'
import moment from 'moment'
import { getArticleMany, getCateMany } from '@/service'
import dynamic from 'next/dynamic'
import Head from 'next/head'

const ArticleLayout = dynamic(() => import('@/components/articleLayout'))

const Category: NextPage<{ articleList: API.Article[]; cateList: API.Cate[] }> = (props) => {
    const { articleList, cateList } = props
    const router = useRouter()
    const cateId = router.query.cateId as string

    const toDetail = (id: number) => {
        router.push(`/article/${id}`)
    }

    const filterArticleList = useMemo(() => {
        return cateId ? articleList.filter((v) => v.cateId.toString() === cateId) : articleList
    }, [articleList, cateId])

    return (
        <ArticleLayout cateList={cateList} title='分类'>
            <Head>
                <title>BBF的个人博客 - 分类</title>
            </Head>
            {filterArticleList.map((article) => {
                return (
                    <div key={article.id} onClick={() => toDetail(article.id)}>
                        <ArticleListItem
                            cate={article.cate.name}
                            publishDate={moment(article.createdAt).format('YYYY-MM-DD')}
                            title={article.title}
                        ></ArticleListItem>
                        <div className='h-[1px] bg-gray-300'></div>
                    </div>
                )
            })}
        </ArticleLayout>
    )
}

export const getStaticProps: GetStaticProps = async () => {
    const allPost = await getArticleMany()
    const allCate = await getCateMany()

    return {
        props: {
            articleList: allPost ?? [],
            cateList: allCate ?? [],
        },
        revalidate: 60,
    }
}

// export const getServerSideProps: GetServerSideProps = async (context) => {
//     const { cateId } = context.query

//     const allPost = await getArticleMany({ cateId: cateId as string })
//     const allCate = await getCateMany()
//     return {
//         props: {
//             articleList: allPost ?? [],
//             cateList: allCate ?? [],
//         },
//     }
// }

export default Category
