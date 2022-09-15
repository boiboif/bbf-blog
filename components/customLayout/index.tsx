import { useDebounceFn, useRequest } from 'ahooks'
import React, { PropsWithChildren, useEffect, useState } from 'react'
import style from './index.module.scss'
import variables from '@/styles/variables.module.scss'
import MenuButton from '../menuButton'
import useRecord from '@/hook/useRecord'
import { getUserInfoById } from '@/clientApi'
import { useStore } from '@/store'
import { isBrowser } from '@/utils/isBrowser'
import { useScrollRestoration } from '@/hook/useScrollRestoration'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import Loader from '../loader'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { BackTop } from 'antd'
import SakanaReact from 'sakana-react'

const LoginModal = dynamic(() => import('../login/loginModal'))
const Menu = dynamic(() => import('../menu'))

const CustomLayout = (props: PropsWithChildren) => {
    const { loading } = useStore('globalStore')
    const userId = isBrowser() ? localStorage.getItem('userId') : ''
    const userInfoStore = useStore('userInfoStore')
    const [menuVis, setMenuVis] = useState(false)
    const [status, setStatus] = useState<'close' | 'open'>('close')
    const [isHidden, setIsHidden] = useState(false)
    const loginModal = useRecord()
    const router = useRouter()

    useScrollRestoration(router, 'custom-layout')

    const setHidden = useDebounceFn(
        () => {
            setIsHidden(false)
        },
        {
            wait: 2000,
        }
    )
    useEffect(() => {
        const routerCompleteFn = () => {
            if (menuVis) {
                setMenuVis(false)
                setStatus((pre) => (pre === 'open' ? 'close' : 'open'))
            }
        }

        router.events.on('routeChangeComplete', routerCompleteFn)

        const scollFn = () => {
            setIsHidden(true)
            // 两秒后隐藏滚动条
            setHidden.run()
        }

        document.addEventListener('wheel', scollFn)

        return () => {
            document.removeEventListener('wheel', scollFn)
            router.events.off('routeChangeComplete', routerCompleteFn)
        }
    }, [setHidden, router, menuVis])

    useRequest(() => getUserInfoById(userId!)(null, { skipHttpErrorMessage: true }).then((res) => res?.data), {
        ready: !!userId,
        onSuccess: (data) => {
            userInfoStore.setUserInfo(data)
        },
    })

    return (
        <>
            <div className={classNames(['fixed left-0 top-0 w-screen h-screen flex justify-center items-center'])}>
                <div
                    className={classNames([
                        'transition-opacity duration-[1200ms]',
                        { 'opacity-0': !loading && router.pathname === '/' },
                        { 'opacity-100': loading && router.pathname === '/' },
                    ])}
                >
                    <Loader></Loader>
                </div>
            </div>

            <div className='fixed right-4 bottom-10 lg:right-28 lg:bottom-28 z-50 w-[100px] h-[100px] lg:w-[200px] lg:h-[200px]'>
                <SakanaReact width="100%" lineWidth={3}></SakanaReact>
            </div>

            <div
                id='custom-layout'
                className={classNames([
                    style['layout-container'],
                    'transition-opacity duration-[1200ms] relative lg:h-screen lg:overflow-auto lg:mr-20 mr-0',
                    { 'opacity-0': loading && router.pathname === '/' },
                    { 'opacity-100': !loading && router.pathname === '/' },
                ])}
                style={{ '--bg': isHidden ? variables.primaryColor : '#fff' } as React.CSSProperties}
            >
                <BackTop target={() => document.getElementById('custom-layout')!}></BackTop>
                <LoginModal visible={loginModal.visible} onCancel={loginModal.hide}></LoginModal>
                <Menu
                    visible={menuVis}
                    onLogin={() => {
                        loginModal.show()
                    }}
                />
                <div
                    className='menubar fixed right-0 top-0 lg:h-full lg:w-20 h-10 w-12 z-20 cursor-pointer flex justify-center items-center'
                    style={{ background: variables.primaryColor }}
                    onClick={() => {
                        setMenuVis(!menuVis)
                        setStatus(status === 'open' ? 'close' : 'open')
                    }}
                >
                    <MenuButton status={status}></MenuButton>
                </div>
                {props.children}
            </div>
        </>
    )
}

export default observer(CustomLayout)
