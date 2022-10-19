import type { GetStaticProps, NextPage } from 'next'
import img0_on from '@/public/img/tab-00_on.jpg'
import img1_on from '@/public/img/tab-01_on.jpg'
import img2_on from '@/public/img/tab-02_on.jpg'
import img0_off from '@/public/img/tab-00_off.jpg'
import img1_off from '@/public/img/tab-01_off.jpg'
import img2_off from '@/public/img/tab-02_off.jpg'
import img0 from '@/public/img/img_main-00.jpg'
import img1 from '@/public/img/img_main-01.jpg'
import img2 from '@/public/img/img_main-02.jpg'
import logo from '@/public/img/logo.png'
import avatar from '@/public/img/avatar.jpg'
import catch02_pc from '@/public/img/catch-02_pc.png'
import bnr_cafe from '@/public/img/bnr_cafe.jpg'
import { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import styles from '@/styles/index.module.scss'
import { getPostMany } from '@/service'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { getPortalStatisticsCount } from '@/service/statistics'
import { Space } from 'antd'

const Banner = dynamic(() => import('@/components/banner'))
const Controller = dynamic(() => import('@/components/banner/controller'))
const ArticleListItem = dynamic(() => import('@/components/articleListItem'))

const Home: NextPage<{ posts: API.Article[]; staticsCount: API.PortalStatisticsCount }> = (props) => {
    const { posts, staticsCount } = props
    const [activeIndex, setActiveIndex] = useState(0)
    const readyChangeCover = useRef(true)

    const router = useRouter()

    const imgList = [
        { on: img0_on, off: img0_off, cover: img0 },
        { on: img1_on, off: img1_off, cover: img1 },
        { on: img2_on, off: img2_off, cover: img2 },
    ]

    return (
        <div>
            <Head>
                <title>BBF的个人博客</title>
            </Head>
            <div className='lg:flex mx-auto max-w-[1600px]'>
                <div className='w-full lg:w-[64%] lg:flex lg:flex-row-reverse lg:mb-12'>
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
                    <div className='relative w-full lg:w-[11.409%] lg:max-w-[85px] lg:flex lg:flex-col-reverse lg:justify-end'>
                        <div className='hidden lg:block w-[70%] mx-auto'>
                            <Image src={catch02_pc} alt='' />
                        </div>
                        <div className='z-[5] relative flex w-full lg:block lg:w-[132%] lg:mb-6'>
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

                <div className='w-[91%] lg:w-auto lg:flex-1 mx-auto pt-5 lg:pt-11 flex lg:items-center lg:flex-col flex-wrap overflow-hidden'>
                    <div className='w-full lg:text-center flex items-center flex-wrap sm:flex-nowrap lg:block'>
                        <div className='w-20 h-20 lg:w-32 lg:h-32 xl:w-40 xl:h-40 relative rounded-[50%] overflow-hidden mb-4 mr-8 sm:mr-4 lg:mx-auto'>
                            <Image layout='fill' src={avatar} alt='' />
                        </div>
                        <div className='text-[#333] mr-6 lg:mr-0 mb-2 lg:mb-4 flex lg:justify-center gap-5 lg:gap-10 items-center'>
                            <div>
                                <div className='lg:font-bold lg:text-xl'>文章</div>
                                <div className='text-center text-gray-500 text-sm lg:text-xl'>{staticsCount.postCount}</div>
                            </div>

                            <div>
                                <div className='lg:font-bold lg:text-xl'>分类</div>
                                <div className='text-center text-gray-500 text-sm lg:text-xl'>{staticsCount.cateCount}</div>
                            </div>

                            <div>
                                <div className='lg:font-bold lg:text-xl'>标签</div>
                                <div className='text-center text-gray-500 text-sm lg:text-xl'>{staticsCount.tagCount}</div>
                            </div>
                        </div>

                        <div className='mx-auto w-1/2 hidden lg:block border-b border-slate-200 mb-6' />

                        <div>
                            <div className='text-md lg:text-lg xl:text-xl font-bold mb-2 lg:mb-0 text-teal-500 truncate'>
                                🍒 A Front-end developer - 前端开发工程师
                            </div>
                            <div className='text-5xl text-rose-500 mb-2 hidden lg:block leading-4 xl:leading-7'>×</div>
                            <div className='text-md lg:text-lg xl:text-xl font-bold mb-2 lg:mb-0 truncate'>
                                🍋 Tech Stack: <span className='text-[#61dafb]'>React</span> <span className='text-[#42b983]'>Vue</span>{' '}
                                <span className='text-[#3178c6]'>TypeScript</span> <span>etc.</span>
                            </div>
                            <div className='text-5xl text-rose-500 mb-2 hidden lg:block leading-4 xl:leading-7'>×</div>
                            <div className='text-md lg:text-lg xl:text-xl font-bold mb-2 lg:mb-0 truncate'>
                                📍 DongGuan - <span className='text-red-500'>China.</span>
                            </div>
                            <div className='text-5xl text-rose-500 mb-2 hidden lg:block leading-4 xl:leading-7'>×</div>
                            <div className='text-md lg:text-lg xl:text-xl font-bold mb-6 truncate flex items-center lg:justify-center'>
                                <div className='w-4 h-4 lg:w-[20px] lg:h-[20px] relative'>
                                    <Image layout='fill' src='https://www.dota2.com.cn/favicon.ico' alt=''></Image>
                                </div>
                                <div className='ml-1 lg:ml-2'>Let&apos;s play some dota!</div>
                            </div>
                        </div>
                    </div>

                    <div className='mx-auto w-1/2 hidden lg:block border-b border-slate-200 mb-6' />

                    <div className='lg:text-center lg:w-full'>
                        {/* <div
                            className='hidden lg:flex items-center justify-center cursor-pointer mb-4'
                            onClick={() => window.open('https://reactjs.org/')}
                        >
                            <div className='relative w-[40px] h-[40px] xl:w-[60px] xl:h-[60px]'>
                                <Image
                                    layout='fill'
                                    src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0xMS41IC0xMC4yMzE3NCAyMyAyMC40NjM0OCI+CiAgPHRpdGxlPlJlYWN0IExvZ288L3RpdGxlPgogIDxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSIyLjA1IiBmaWxsPSIjNjFkYWZiIi8+CiAgPGcgc3Ryb2tlPSIjNjFkYWZiIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIi8+CiAgICA8ZWxsaXBzZSByeD0iMTEiIHJ5PSI0LjIiIHRyYW5zZm9ybT0icm90YXRlKDYwKSIvPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIiB0cmFuc2Zvcm09InJvdGF0ZSgxMjApIi8+CiAgPC9nPgo8L3N2Zz4K'
                                    alt=''
                                />
                            </div>
                            <span className='ml-4 text-3xl text-[#61dafb] font-bold'>React</span>
                        </div> */}

                        <div className='hidden lg:flex justify-center mb-6 xl:mb-8 w-[25%] mx-auto'>
                            <a href='https://nextjs.org/' target='_blank' rel='noreferrer'>
                                <svg version='1.1' viewBox='0 0 148 90' width='100%' xmlnsXlink='http://www.w3.org/1999/xlink'>
                                    <path
                                        d='M34.992 23.495h27.855v2.219H37.546v16.699h23.792v2.219H37.546v18.334h25.591v2.219H34.992v-41.69zm30.35 0h2.96l13.115 18.334 13.405-18.334L113.055.207 83.1 43.756l15.436 21.429H95.46L81.417 45.683 67.316 65.185h-3.018L79.85 43.756 65.343 23.495zm34.297 2.219v-2.219h31.742v2.219h-14.623v39.47h-2.554v-39.47H99.64zM.145 23.495h3.192l44.011 66.003L29.16 65.185 2.814 26.648l-.116 38.537H.145v-41.69zm130.98 38.801c-.523 0-.914-.405-.914-.928 0-.524.391-.929.913-.929.528 0 .913.405.913.929 0 .523-.385.928-.913.928zm2.508-2.443H135c.019.742.56 1.24 1.354 1.24.888 0 1.391-.535 1.391-1.539v-6.356h1.391v6.362c0 1.808-1.043 2.849-2.77 2.849-1.62 0-2.732-1.01-2.732-2.556zm7.322-.08h1.379c.118.853.95 1.395 2.149 1.395 1.117 0 1.937-.58 1.937-1.377 0-.685-.521-1.097-1.708-1.377l-1.155-.28c-1.62-.38-2.36-1.166-2.36-2.487 0-1.602 1.304-2.668 3.26-2.668 1.82 0 3.15 1.066 3.23 2.58h-1.354c-.13-.828-.85-1.346-1.894-1.346-1.1 0-1.832.53-1.832 1.34 0 .642.472 1.01 1.64 1.284l.987.243c1.838.43 2.596 1.178 2.596 2.53 0 1.72-1.33 2.799-3.453 2.799-1.987 0-3.323-1.029-3.422-2.637z'
                                        fill='black'
                                        fillRule='nonzero'
                                    ></path>
                                </svg>
                            </a>
                        </div>

                        <div
                            className='cursor-pointer hidden lg:block mb-6 xl:mb-8 w-[80%] mx-auto'
                            onClick={() => window.open('https://lycoris-recoil.com')}
                        >
                            <Image src={logo} alt='' />
                        </div>

                        <div
                            className='cursor-pointer hidden lg:block mb-6 xl:mb-8 w-[60%] mx-auto'
                            onClick={() => window.open('https://lycoris-recoil.com/cafe_lyco_reco/')}
                        >
                            <Image src={bnr_cafe} alt=''></Image>
                        </div>

                        <div className='hidden lg:flex justify-center w-[80%] mx-auto'>
                            <a
                                className='block w-3/5 shadow-2xl shadow-rose-400'
                                href='//www.dota2.com.cn/main.htm'
                                target='_blank'
                                rel='noreferrer'
                            >
                                <video className='w-full' preload='preload' muted={true} autoPlay loop={true} poster=''>
                                    <source type='video/webm' src='//gamevideo.wmupd.com/dota2media/media/coverlogo180517.webm' />
                                    <source type='video/mp4' src='//gamevideo.wmupd.com/dota2media/media/coverlogo180517.mp4' />
                                </video>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className='w-[91%] mx-auto max-w-[1500px]'>
                <div className='font-mono font-black tracking-wider mb-5 lg:mb-7'>
                    <span className='text-4xl lg:text-7xl text-teal-500 font-serif font-semibold'>N</span>
                    <span className='text-3xl lg:text-6xl font-sans'>ewly</span>
                </div>
                <div className='h-[1px] bg-gray-300'></div>
                {posts?.map((article) => {
                    return (
                        <Link key={article.id} href={{ pathname: `/article/${article.id}` }}>
                            <a className='link'>
                                <ArticleListItem
                                    cate={article.cate.name}
                                    publishDate={article.createdAt}
                                    title={article.title}
                                    onTagClick={(tagId) =>
                                        router.push({
                                            pathname: `/tag`,
                                            query: {
                                                tags: tagId,
                                            },
                                        })
                                    }
                                    tags={article.tags}
                                ></ArticleListItem>
                                <div className='h-[1px] bg-gray-300'></div>
                            </a>
                        </Link>
                    )
                })}
            </div>

            <div className={styles.bg}>
                <div className='w-[91%] mx-auto max-w-[1500px] pt-5 lg:pt-10'>
                    <div className='font-mono font-black tracking-wider pb-5 lg:pb-7 text-right'>
                        <span className='text-4xl lg:text-7xl text-teal-500 font-serif font-semibold'>T</span>
                        <span className='text-3xl lg:text-6xl font-sans'>o Be Continue</span>
                    </div>
                </div>

                <div className='pt-10 pb-5 text-center'>
                    <Space>
                        © 2022 BBF Powered by
                        <a href='https://nextjs.org/' target='_blank' rel='noreferrer'>
                            Next.js
                        </a>
                        &
                        <a href='https://www.prisma.io/' target='_blank' rel='noreferrer' className='text-teal-500'>
                            Prisma
                        </a>
                        &
                        <a href='https://tailwindcss.com/' target='_blank' rel='noreferrer' className='text-rose-500'>
                            tailwindcss.css
                        </a>
                    </Space>
                </div>
            </div>
        </div>
    )
}

export default Home

export const getStaticProps: GetStaticProps = async (context) => {
    const posts = await getPostMany({ take: 8 })
    const staticsCount = await getPortalStatisticsCount()

    return {
        props: {
            posts,
            staticsCount,
        },
        revalidate: 60,
    }
}
