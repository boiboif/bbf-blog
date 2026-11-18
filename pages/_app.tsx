import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { NextPage } from 'next'
import { ReactElement, ReactNode, useEffect, useState } from 'react'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/lib/locale/zh_CN'
import moment from 'moment'
import 'moment/locale/zh-cn'
import 'antd/dist/antd.min.css'
import '@/components/menuButton/index.scss'
import 'bytemd/dist/index.min.css'
import NProgress from 'nprogress'
import { createStore, RootContext } from '@/store'
import 'nprogress/nprogress.css'
import 'animate.css'

import CustomLayout from '@/components/customLayout'

moment.locale('zh-cn')

type NextPageWithLayout = NextPage & {
    getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout
}

function MyApp({ Component, pageProps, router }: AppPropsWithLayout) {
    const [store] = useState(createStore)
    useEffect(() => {
        const start = () => { NProgress.start() }
        const done = () => { NProgress.done() }
        router.events.on('routeChangeStart', start)
        router.events.on('routeChangeComplete', done)
        router.events.on('routeChangeError', done)
        return () => {
            router.events.off('routeChangeStart', start)
            router.events.off('routeChangeComplete', done)
            router.events.off('routeChangeError', done)
        }
    }, [router.events])

    const getLayout = Component.getLayout ?? ((page) => <CustomLayout>{page}</CustomLayout>)

    return (
        <ConfigProvider locale={zhCN}>
            <RootContext.Provider value={store}>
                {getLayout(<Component {...pageProps} />)}
            </RootContext.Provider>
        </ConfigProvider>
    )
}

export default MyApp
