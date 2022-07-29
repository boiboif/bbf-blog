import { useRouter } from 'next/router'
import React, { PropsWithChildren, useState } from 'react'
import { Layout, Menu } from 'antd'
import Link from 'next/link'

const { Content, Sider } = Layout

const ManagerLayout = (props: PropsWithChildren) => {
    const router = useRouter()
    console.log(router)
    const [selectedKeys, setSelectedKeys] = useState<string[]>(() => [router.pathname])
    const [openKeys, setOpenKeys] = useState<string[]>([])

    return (
        <Layout className='h-screen overflow-hidden'>
            <div className='h-16 bg-[#1890ff] text-white'>header</div>
            <Layout>
                <Sider theme='light'>
                    <Menu
                        onOpenChange={setOpenKeys}
                        selectedKeys={selectedKeys}
                        openKeys={openKeys}
                        onClick={({ key, keyPath }) => {
                            setSelectedKeys(keyPath)
                            setOpenKeys(keyPath)
                            router.push(key)
                        }}
                        items={[
                            { label: '首页', key: '/manager' },
                            { label: 'cms管理', key: '/manager/cms', children: [{ label: '分类管理', key: '/manager/cms/cate' }] },
                        ]}
                        mode='inline'
                    ></Menu>
                    {/* <Link href="/manager">首页</Link> */}
                    {/* <Link href="/manager/cate">分类</Link> */}
                </Sider>
                <Content className='p-6'>{props.children}</Content>
            </Layout>
        </Layout>
    )
}

export default ManagerLayout
