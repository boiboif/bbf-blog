import { getPostById, getPostIds, getCateMany, parsePostId } from '@/service'
import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import React, { useEffect, useRef, useState } from 'react'
import { Viewer } from '@bytemd/react'
import { markdownPlugins } from '@/components/markdown/plugins'
import { formatDate } from '@/utils/time'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useDotShow } from '@/hook/useDotShow'

import ArticleLayout from '@/components/articleLayout'
import ArticleListItem from '@/components/articleListItem'
import BackButton from '@/components/backButton'

const ArticleDetail: NextPage<{ article: API.Article; cateList: API.Cate[]; publishDate: string }> = (props) => {
    const { article, cateList, publishDate } = props
    const dotShow = useDotShow()
    const router = useRouter()

    const viewRequest = useRef<{ id: number; promise: Promise<number | undefined> } | null>(null)
    const [view, setView] = useState<{ id: number; count: number } | null>(null)
    useEffect(() => {
        const id = article.id
        // Reuse this visit's request when Strict Mode re-runs the effect.
        if (viewRequest.current?.id !== id) {
            const promise = fetch(`/api/post/${id}/view`, { method: 'POST' })
                .then(async (res) => {
                    if (!res.ok) return
                    const result: CustomResponse<{ viewCount: number }> = await res.json()
                    return result.data.viewCount
                })
            viewRequest.current = { id, promise }
        }
        let current = true
        viewRequest.current.promise.then(count => {
            if (current && typeof count === 'number') setView({ id, count })
        }).catch(() => { /* Keep the static count if reporting fails. */ })
        return () => { current = false }
    }, [article.id])

    const toTag = (tagId: string) => {
        router.push({
            pathname: `/tag`,
            query: {
                tags: tagId,
            },
        })
    }

    return (
        <ArticleLayout cateList={cateList} activeKey={article.cateId.toString()}>
            <Head>
                <title>{'BBF的个人博客 - ' + article.title}</title>
                {article.desc && <meta name='description' content={article.desc} />}
            </Head>
            <div {...dotShow}>
                <ArticleListItem
                    size='large'
                    title={article.title}
                    cate={article.cate.name}
                    publishDate={publishDate}
                    tags={article.tags}
                    onTagClick={toTag}
                    viewCout={view?.id === article.id ? view.count : article.viewCount}
                ></ArticleListItem>
            </div>
            <div className='h-[1px] bg-gray-300'></div>
            <Viewer plugins={markdownPlugins} value={article.content} />
            <div className='text-center'>
                <BackButton onClick={() => router.back()}></BackButton>
            </div>
        </ArticleLayout>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    const posts = await getPostIds()

    return {
        paths: posts.map((item) => ({ params: { id: item.id.toString() } })),
        fallback: 'blocking',
    }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const id = parsePostId(params?.id)
    if (id === null) return { notFound: true }
    const article = await getPostById(id)
    if (!article) return { notFound: true, revalidate: 60 }
    const allCate = await getCateMany()

    return {
        props: {
            article,
            publishDate: formatDate(article.createdAt),
            cateList: allCate ?? [],
        },
        revalidate: 60,
    }
}

export default ArticleDetail
