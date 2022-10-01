import { getArticleById, getArticleMany, getCateMany } from '@/service'
import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import React from 'react'
import dynamic from 'next/dynamic'
import { Viewer } from '@bytemd/react'
import ArticleListItem from '@/components/articleListItem'
import breaks from '@bytemd/plugin-breaks'
import frontmatter from '@bytemd/plugin-frontmatter'
import gemoji from '@bytemd/plugin-gemoji'
import gfm from '@bytemd/plugin-gfm'
import mediumZoom from '@bytemd/plugin-medium-zoom'
import gfmLocales from '@bytemd/plugin-gfm/locales/zh_Hans.json'
import mermaidLocales from '@bytemd/plugin-mermaid/locales/zh_Hans.json'
import mermaid from '@bytemd/plugin-mermaid'
import highlight from '@bytemd/plugin-highlight-ssr'
import 'highlight.js/styles/vs.css'
import 'github-markdown-css' // placed after highlight styles to override `code` padding
import moment from 'moment'
import { useRouter } from 'next/router'
import Head from 'next/head'

const ArticleLayout = dynamic(() => import('@/components/articleLayout'))
const BackButton = dynamic(() => import('@/components/backButton'))

const plugins = [
    gfm({
        locale: gfmLocales,
    }),
    highlight(),
    frontmatter(),
    mediumZoom(),
    mermaid({ locale: mermaidLocales }),
    gemoji(),
    breaks(),
    // Add more plugins here
]

const ArticleDetail: NextPage<{ article: API.Article | null; cateList: API.Cate[] }> = (props) => {
    const { article, cateList } = props

    const router = useRouter()

    return (
        <ArticleLayout cateList={cateList} activeKey={article?.cateId.toString()}>
            <Head>
                <title></title>
                <title>{'BBF的个人博客 - ' + article?.title}</title>
            </Head>
            <ArticleListItem
                size='large'
                title={article?.title}
                cate={article?.cate.name}
                publishDate={moment(article?.createdAt).format('YYYY-MM-DD')}
            ></ArticleListItem>
            <div className='h-[1px] bg-gray-300'></div>
            <Viewer plugins={plugins} value={article?.content || ''}></Viewer>
            <div className='text-center'>
                <BackButton onClick={() => router.back()}></BackButton>
            </div>
        </ArticleLayout>
    )
}

export const getStaticPaths: GetStaticPaths = async (params) => {
    const posts = await getArticleMany()

    return {
        paths: posts.map((item) => ({ params: { id: item.id.toString() } })),
        fallback: 'blocking',
    }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const article = await getArticleById(params!.id as string)
    const allCate = await getCateMany()

    if (!article) {
        return {
            notFound: true,
        }
    }

    return {
        props: {
            article,
            cateList: allCate ?? [],
        },
        revalidate: 60,
    }
}

// export const getServerSideProps: GetServerSideProps = async (context) => {
//     const { id } = context.query

// const article = await getArticleById(id as string)
// const allCate = await getCateMany()

// return {
//     props: {
//         article,
//         cateList: allCate ?? [],
//     },
// }
// }

export default ArticleDetail
