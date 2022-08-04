import { useDebounceFn, useRequest } from 'ahooks'
import React, { PropsWithChildren, useEffect, useState } from 'react'
import style from './index.module.scss'
import cn from 'classnames'
import variables from '@/styles/variables.module.scss'
import { useSpring, animated } from 'react-spring'
import MenuButton from '../menuButton'
import useRecord from '@/hook/useRecord'
import { getUserInfoById } from '@/clientApi'
import { useStore } from '@/store'
import { isBrowser } from '@/utils/isBrowser'
import { useScrollRestoration } from '@/hook/useScrollRestoration'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'

const LoginModal = dynamic(() => import('../login/loginModal'))
const Menu = dynamic(() => import('../menu'))

const CustomLayout = (props: PropsWithChildren) => {
    const userId = isBrowser() ? localStorage.getItem('userId') : ''
    const userInfoStore = useStore('userInfoStore')
    const [menuVis, setMenuVis] = useState(false)
    const [status, setStatus] = useState<'close' | 'open'>('close')
    const [isHidden, setIsHidden] = useState(false)
    const loginModal = useRecord()
    const router = useRouter()

    useScrollRestoration(router, 'custom-layout')

    const springProps = useSpring({
        from: {
            opacity: 0,
        },
        to: {
            opacity: 1,
        },
        config: { duration: 500 },
    })

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
        <div
            id='custom-layout'
            className={cn([style['layout-container'], 'lg:h-screen lg:overflow-auto lg:mr-20 mr-0'])}
            style={{ '--bg': isHidden ? variables.primaryColor : '#fff' } as React.CSSProperties}
        >
            <LoginModal visible={loginModal.visible} onCancel={loginModal.hide}></LoginModal>
            <Menu
                visible={menuVis}
                onLogin={() => {
                    loginModal.show()
                }}
            />
            <animated.div
                className='menubar fixed right-0 top-0 lg:h-full lg:w-20 h-10 w-12 z-20 cursor-pointer flex justify-center items-center'
                style={{ background: variables.primaryColor, ...springProps }}
                onClick={() => {
                    setMenuVis(!menuVis)
                    setStatus(status === 'open' ? 'close' : 'open')
                }}
            >
                <MenuButton status={status}></MenuButton>
            </animated.div>
            {props.children}
        </div>
    )
}

export default CustomLayout
