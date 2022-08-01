import React, { useState } from 'react'
import { delArticle, getArticleAll, getCateAll } from '@/api'
import CustomForm from '@/components/manager/customForm'
import ManagerLayout from '@/components/manager/layout'
import TableMoreAction from '@/components/manager/tableMoreAction'
import { useRequest } from 'ahooks'
import { Button, message, Space, Table } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import ArticleModal from '@/components/manager/article/modal'
import useRecord from '@/hook/useRecord'

const Article = () => {
    const [searchParam, setSearchParams] = useState({ name: '' })
    const { data, refresh, loading } = useRequest(() => getArticleAll(searchParam).then((res) => res?.data), {
        refreshDeps: [searchParam],
    })
    const articleModal = useRecord<API.Article>()
    const { data: cateList } = useRequest(() => getCateAll().then((res) => res?.data))

    const columns: ColumnsType<API.Article> = [
        { title: '编号', dataIndex: 'id' },
        { title: '文章标题', dataIndex: 'title' },
        {
            title: '操作',
            render: (_, record) => {
                return (
                    <Space>
                        <a onClick={() => articleModal.show(record)}>编辑</a>
                        <TableMoreAction
                            record={record}
                            menuList={[
                                {
                                    name: '删除',
                                    className: 'text-red-500',
                                    confirmProps: {
                                        onOk: async () => {
                                            await delArticle({ id: record.id })
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
            <ArticleModal
                cateList={cateList}
                visible={articleModal.visible}
                record={articleModal.record}
                onCancel={articleModal.hide}
                callback={refresh}
            />
            <CustomForm items={[{ name: 'title', label: '文章标题' }]} formSearch={setSearchParams}></CustomForm>

            <div className='mb-4'>
                <Button type='primary' onClick={() => articleModal.show()}>
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
