import { useRouter } from 'next/router'
import React, { PropsWithChildren, useState } from 'react'
import { Layout, Menu } from 'antd'
import { findParents } from 'bbf-tree-utils'

const { Content, Sider } = Layout

const routes = [
    { label: '首页', key: '/manager' },
    { label: '分类管理', key: '/manager/cate' },
]

const ManagerLayout = (props: PropsWithChildren) => {
    const router = useRouter()

    const [selectedKeys, setSelectedKeys] = useState<string[]>(() => [router.pathname])
    const [openKeys, setOpenKeys] = useState<string[]>(() => {
        return findParents(routes, router.pathname, 'key').map((item) => item.key)
    })

    return (
        <Layout className='h-screen overflow-hidden'>
            <div className='px-4 flex items-center justify-between h-16 bg-[#1890ff] text-white'>
                <div className='text-2xl font-semibold'>后台管理</div>
                <div className='cursor-pointer' onClick={() => router.push('/')}>
                    返回门户
                </div>
            </div>
            <Layout>
                <Sider theme='light' breakpoint='lg' collapsedWidth={0}>
                    <Menu
                        onOpenChange={setOpenKeys}
                        selectedKeys={selectedKeys}
                        openKeys={openKeys}
                        onClick={({ key, keyPath }) => {
                            setSelectedKeys(keyPath)
                            router.push(key)
                        }}
                        items={routes}
                        mode='inline'
                    ></Menu>
                    {/* <Link href="/manager">首页</Link> */}
                    {/* <Link href="/manager/cate">分类</Link> */}
                </Sider>
                <Content className='p-4'>{props.children}</Content>
            </Layout>
        </Layout>
    )
}

export default ManagerLayout
