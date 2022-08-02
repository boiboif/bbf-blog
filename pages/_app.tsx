import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { NextPage } from 'next'
import { ReactElement, ReactNode, useEffect } from 'react'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/lib/locale/zh_CN'
import moment from 'moment'
import 'moment/locale/zh-cn'
import 'antd/dist/antd.min.css'
import '@/components/menuButton/index.scss'
import CustomLayout from '@/components/customLayout'
import 'bytemd/dist/index.min.css'
import NProgress from 'nprogress'
import 'highlight.js/styles/vs.css'
import 'github-markdown-css' // placed after highlight styles to override `code` padding
import { createStore, RootContext } from '@/store'

moment.locale('zh-cn')

type NextPageWithLayout = NextPage & {
    getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout
}

function MyApp({ Component, pageProps, router }: AppPropsWithLayout) {
    useEffect(() => {
        router.events.on('routeChangeStart', () => {
            NProgress.start()
        })
        router.events.on('routeChangeComplete', () => {
            NProgress.done()
        })
        router.events.on('routeChangeError', () => {
            NProgress.done()
        })
    }, [router.events])

    const getLayout = Component.getLayout ?? ((page) => <CustomLayout>{page}</CustomLayout>)

    return getLayout(
        <ConfigProvider locale={zhCN}>
            <RootContext.Provider value={createStore()}>
                <Component {...pageProps} />
            </RootContext.Provider>
        </ConfigProvider>
    )
}

export default MyApp
