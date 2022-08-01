import React, { useState } from 'react'
import { delCate, getArticleAll } from '@/api'
import CustomForm from '@/components/manager/customForm'
import ManagerLayout from '@/components/manager/layout'
import TableMoreAction from '@/components/manager/tableMoreAction'
import { useRequest } from 'ahooks'
import { Button, message, Space, Table } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import ArticleDrawer from '@/components/manager/article/drawer'
import useRecord from '@/hook/useRecord'

const Article = () => {
    const [searchParam, setSearchParams] = useState({ name: '' })
    const { data, refresh, loading } = useRequest(() => getArticleAll(searchParam).then((res) => res?.data), {
        refreshDeps: [searchParam],
    })
    const articleDrawer = useRecord<API.Article>()

    const columns: ColumnsType<API.Article> = [
        { title: '编号', dataIndex: 'id' },
        { title: '文章标题', dataIndex: 'title' },
        {
            title: '操作',
            render: (_, record) => {
                return (
                    <Space>
                        <a onClick={() => articleDrawer.show(record)}>编辑</a>
                        <TableMoreAction
                            record={record}
                            menuList={[
                                {
                                    name: '删除',
                                    className: 'text-red-500',
                                    confirmProps: {
                                        onOk: async () => {
                                            await delCate({ id: record.id })
                                            message.success('删除成功！')
                                            refresh()
                                        },
                                    },
                                },
                            ]}
                        />
                    </Space>
                )
            },
        },
    ]

    return (
        <div className='card'>
            <ArticleDrawer width={1200} visible={articleDrawer.visible} record={articleDrawer.record} onClose={articleDrawer.hide} callback={refresh} />
            <CustomForm items={[{ name: 'title', label: '文章标题' }]} formSearch={setSearchParams}></CustomForm>

            <div className='mb-4'>
                <Button type='primary' onClick={() => articleDrawer.show()}>
                    新增
                </Button>
            </div>

            <Table loading={loading} columns={columns} dataSource={data} rowKey='id' bordered size='middle'></Table>
        </div>
    )
}

Article.getLayout = (page: any) => {
    return <ManagerLayout>{page}</ManagerLayout>
}

export default Article
