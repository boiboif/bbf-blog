import type { GetServerSideProps, NextPage } from 'next'
import img0_on from '@/public/img/tab-00_on.jpg'
import img1_on from '@/public/img/tab-01_on.jpg'
import img2_on from '@/public/img/tab-02_on.jpg'
import img0_off from '@/public/img/tab-00_off.jpg'
import img1_off from '@/public/img/tab-01_off.jpg'
import img2_off from '@/public/img/tab-02_off.jpg'
import img0 from '@/public/img/img_main-00.jpg'
import img1 from '@/public/img/img_main-01.jpg'
import img2 from '@/public/img/img_main-02.jpg'
import { useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { getArticleMany } from '@/service'
import moment from 'moment'
import dynamic from 'next/dynamic'

const Banner = dynamic(() => import('@/components/banner'))
const Controller = dynamic(() => import('@/components/banner/controller'))
const ArticleListItem = dynamic(() => import('@/components/articleListItem'))

const Home: NextPage<{ articleList: API.Article[] }> = (props) => {
    const { articleList } = props
    const router = useRouter()
    const [activeIndex, setActiveIndex] = useState(0)
    const readyChangeCover = useRef(true)

    const imgList = [
        { on: img0_on, off: img0_off, cover: img0 },
        { on: img1_on, off: img1_off, cover: img1 },
        { on: img2_on, off: img2_off, cover: img2 },
    ]

    return (
        <div style={{ height: '200vh' }}>
            <div className='lg:flex mx-auto max-w-[1600px]'>
                <div className='w-full lg:w-[62%] lg:flex lg:flex-row-reverse lg:mb-12'>
                    <div className='flex-1'>
                        <Banner
                            activeIndex={activeIndex}
                            imgList={imgList.map((v) => v.cover)}
                            onChange={(index) => {
                                setActiveIndex(index)
                                readyChangeCover.current = false
                            }}
                            onTransitionEnd={() => (readyChangeCover.current = true)}
                        />
                    </div>
                    <div className='relative w-full lg:w-[11.409%] lg:max-w-[85px]'>
                        <div>123</div>
                        <div className='z-[5] relative flex w-full lg:block lg:absolute lg:top-0 lg:left-4 lg:w-[132%]'>
                            <Controller
                                imgList={imgList}
                                activeIndex={activeIndex}
                                onChange={(index) => {
                                    if (readyChangeCover.current) {
                                        readyChangeCover.current = false
                                        setActiveIndex(index)
                                    }
                                }}
                                className='w-1/4 lg:w-full'
                            />
                        </div>
                    </div>
                </div>

                <div>456</div>
            </div>

            <div className='w-[91%] mx-auto max-w-[1500px] mb-10'>
                <div className='font-mono font-black tracking-wider mb-5 lg:mb-7'>
                    <span className='text-4xl lg:text-8xl text-teal-500 font-serif font-semibold'>N</span>
                    <span className='text-3xl lg:text-7xl font-sans'>ewly</span>
                </div>
                <div className='h-[1px] bg-gray-300'></div>
                {articleList.map((article) => {
                    return (
                        <div key={article.id} onClick={() => router.push(`/article/${article.id}`)}>
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

            <div className='w-[91%] mx-auto max-w-[1500px]'></div>
        </div>
    )
}

export default Home

export const getServerSideProps: GetServerSideProps = async () => {
    const allPost = await getArticleMany({ take: 3 })

    return {
        props: {
            articleList: allPost ?? [],
        },
    }
}
