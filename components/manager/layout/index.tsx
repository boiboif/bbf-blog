import { useRouter } from 'next/router'
import React, { PropsWithChildren, useEffect, useState } from 'react'
import { Layout, Menu } from 'antd'
import { findParents } from 'bbf-tree-utils'

const { Content, Sider, Header } = Layout

const routes = [
    { label: '首页', key: '/manager' },
    { label: '分类管理', key: '/manager/cate' },
    { label: '文章管理', key: '/manager/article' },
]

const ManagerLayout = (props: PropsWithChildren) => {
    const router = useRouter()

    const [selectedKeys, setSelectedKeys] = useState<string[]>([])
    const [openKeys, setOpenKeys] = useState<string[]>([])

    useEffect(() => {
        setSelectedKeys([router.pathname])
        setOpenKeys(findParents(routes, router.pathname, 'key').map((item) => item.key))
    }, [router.pathname])

    return (
        <div className='h-screen overflow-hidden flex-col'>
            <Header className='!px-4 flex items-center justify-between !bg-[#1890ff] !text-white'>
                <div className='text-2xl font-semibold'>后台管理</div>
                <div className='cursor-pointer' onClick={() => router.push('/')}>
                    返回门户
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
