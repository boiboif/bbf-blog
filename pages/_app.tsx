import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { NextPage } from 'next'
import { ReactElement, ReactNode } from 'react'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/lib/locale/zh_CN'
import moment from 'moment'
import 'moment/locale/zh-cn'
import 'antd/dist/antd.css'
import '@/components/menuButton/index.scss'
import 'animate.css'
import CustomLayout from '@/components/customLayout'
import { useScrollRestoration } from '@/hook/useScrollRestoration'

moment.locale('zh-cn')

type NextPageWithLayout = NextPage & {
    getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout
}

function MyApp({ Component, pageProps, router }: AppPropsWithLayout) {
    useScrollRestoration(router, 'custom-layout')

    const getLayout = Component.getLayout ?? ((page) => <CustomLayout>{page}</CustomLayout>)

    return getLayout(
        <ConfigProvider locale={zhCN}>
            <Component {...pageProps} />
        </ConfigProvider>
    )
}

export default MyApp
