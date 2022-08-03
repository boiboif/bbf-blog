import { useRouter } from 'next/router'
import React, { PropsWithChildren, useEffect, useState } from 'react'
import { Layout, Menu, Popconfirm } from 'antd'
import { findParents } from 'bbf-tree-utils'
import { useRequest } from 'ahooks'
import { getUserInfoById } from '@/service'
import { useStore } from '@/store'
import { isBrowser } from '@/utils/isBrowser'

const { Content, Sider, Header } = Layout

const routes = [
    { label: '首页', key: '/manager' },
    { label: '分类管理', key: '/manager/cate' },
    { label: '文章管理', key: '/manager/article' },
]

const ManagerLayout = (props: PropsWithChildren) => {
    const [loading, setLoading] = useState(true)
    const [readyRequest, setReadyRequest] = useState(false)
    const userId = isBrowser() ? localStorage.getItem('userId') : ''
    const router = useRouter()
    const userInfoStore = useStore('userInfoStore')
    const [selectedKeys, setSelectedKeys] = useState<string[]>([])
    const [openKeys, setOpenKeys] = useState<string[]>([])

    useEffect(() => {
        setSelectedKeys([router.pathname])
        setOpenKeys(findParents(routes, router.pathname, 'key').map((item) => item.key))
    }, [router.pathname])

    useEffect(() => {
        setReadyRequest(!!userId)

        if (!userId) {
            router.replace('/')
            userInfoStore.setUserInfo(undefined)
        }
    }, [router, userInfoStore, userId])

    useRequest(() => getUserInfoById(userId!)().then((res) => res?.data), {
        ready: readyRequest,
        onSuccess: (data) => {
            userInfoStore.setUserInfo(data)
            if (!data?.roles.includes('admin')) {
                router.replace('/noPermission')
            }
        },
        onError: () => {
            localStorage.removeItem('userId')
            localStorage.removeItem('token')
            userInfoStore.setUserInfo(undefined)
            router.replace('/')
        },
        onFinally: () => {
            setLoading(false)
        },
    })

    if (loading) {
        return <div>获取用户信息中。。。</div>
    }

    const logout = () => {
        localStorage.removeItem('userId')
        localStorage.removeItem('token')
        userInfoStore.setUserInfo(undefined)
        router.replace('/')
    }

    return (
        <div className='h-screen overflow-hidden flex-col'>
            <Header className='!px-4 flex items-center justify-between !text-white'>
                <div className='text-2xl font-semibold'>后台管理</div>
                <div className='flex gap-4'>
                    <div className='text-md flex-grow-0'>
                        <Popconfirm title='退出登录' onConfirm={logout} okText='确定' cancelText='取消'>
                            <span className='cursor-pointer'>{userInfoStore.userInfo?.nickName ?? userInfoStore.userInfo?.username}</span>
                        </Popconfirm>
                    </div>
                    <div className='text-md cursor-pointer' onClick={() => router.replace('/')}>
                        <span>返回门户</span>
                    </div>
                </div>
            </Header>
            <div className='flex' style={{ background: '#f0f2f5' }}>
                <Sider theme='light' breakpoint='lg' style={{ height: '300vh' }} collapsedWidth={0}>
                    <Menu
                        onOpenChange={setOpenKeys}
                        selectedKeys={selectedKeys}
                        openKeys={openKeys}
                        onClick={({ key }) => {
                            router.push(key)
                        }}
                        items={routes}
                        mode='inline'
                    ></Menu>
                </Sider>
                <Content className='p-4 pb-0 overflow-auto'>{props.children}</Content>
            </div>
        </div>
    )
}

export default ManagerLayout
