import { GetServerSideProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import React from 'react'
import ArticleListItem from '@/components/articleListItem'
import moment from 'moment'
import { getArticleMany, getCateMany } from '@/service'
import dynamic from 'next/dynamic'

const ArticleLayout = dynamic(() => import('@/components/articleLayout'))

const Article: NextPage<{ articleList: API.Article[]; cateList: API.Cate[] }> = (props) => {
    const { articleList, cateList } = props

    const router = useRouter()

    const toDetail = (id: number) => {
        router.push(`/article/${id}`)
    }

    return (
        <ArticleLayout cateList={cateList} title="分类">
            {articleList.map((article) => {
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

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { cateId } = context.query

    const allPost = await getArticleMany({ cateId: cateId as string })
    const allCate = await getCateMany()
    return {
        props: {
            articleList: allPost ?? [],
            cateList: allCate ?? [],
        },
    }
}

export default Article
