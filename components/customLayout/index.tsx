import { useDebounceFn, useRequest } from 'ahooks'
import React, { PropsWithChildren, useEffect, useState } from 'react'
import style from './index.module.scss'
import useRecord from '@/hook/useRecord'
import { getUserInfoById } from '@/clientApi'
import { useStore } from '@/store'
import { isBrowser } from '@/utils/isBrowser'
import { useScrollRestoration } from '@/hook/useScrollRestoration'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { FloatButton } from 'antd'

import Menu from '@/components/menu'
import MenuButton from '@/components/menuButton'
import Dot from '@/components/dot'

const LoginModal = dynamic(() => import('@/components/login/loginModal'), { ssr: false })
const Sakana = dynamic(() => import('sakana-react').then(module => module.SakanaReact), { ssr: false })

const CustomLayout = (props: PropsWithChildren) => {
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
            <div className='fixed right-4 bottom-10 lg:right-28 lg:bottom-28 z-50 w-[100px] h-[100px] lg:w-[200px] lg:h-[200px]'>
                <Sakana width='100%' lineWidth={3} />
            </div>

            <div
                id='custom-layout'
                className={classNames([
                    style['layout-container'],
                    'relative lg:h-screen lg:overflow-auto lg:mr-20 mr-0',
                ])}
                style={{ '--bg': isHidden ? 'var(--primary-color)' : '#fff' } as React.CSSProperties}
            >
                <Dot />
                <FloatButton.BackTop
                    aria-label='返回顶部'
                    type='primary'
                    className='!right-5 md:!right-[60px] lg:!right-[100px]'
                    styles={{ root: { background: 'var(--primary-color)' } }}
                    target={() => window.matchMedia('(min-width: 1024px)').matches
                        ? document.getElementById('custom-layout') ?? window
                        : window}
                />
                {loginModal.visible && <LoginModal visible={loginModal.visible} onCancel={loginModal.hide} />}
                <Menu
                    visible={menuVis}
                    onLogin={() => {
                        loginModal.show()
                    }}
                />
                <div
                    className='menubar fixed right-0 top-0 lg:h-full lg:w-20 h-10 w-12 z-20 cursor-pointer flex justify-center items-center'
                    style={{ background: 'var(--primary-color)' }}
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
