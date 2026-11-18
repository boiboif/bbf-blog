import React, { useState } from 'react'
import { delArticle, getArticleById, getArticleSummaries, getCateAll, getTagAll } from '@/clientApi'
import CustomForm from '@/components/manager/customForm'
import ManagerLayout from '@/components/manager/layout'
import TableMoreAction from '@/components/manager/tableMoreAction'
import { useRequest } from 'ahooks'
import { App, Button, Space, Table } from 'antd'
import type { TableColumnsType } from 'antd'
import ArticleModal from '@/components/manager/article/modal'
import useRecord from '@/hook/useRecord'

const Article = () => {
    const { message } = App.useApp()
    const [searchParam, setSearchParams] = useState({ title: '' })
    const { data, refresh, loading } = useRequest(() => getArticleSummaries(searchParam).then((res) => res?.data), {
        refreshDeps: [searchParam],
    })
    const articleModal = useRecord<API.Article>()
    const detail = useRequest((id: number) => getArticleById(String(id))().then(res => res?.data), {
        manual: true,
        onSuccess: article => { if (article) articleModal.show(article) },
    })
    const { data: cateList } = useRequest(() => getCateAll().then((res) => res?.data))
    const { data: tagList } = useRequest(() => getTagAll().then((res) => res?.data))

    const columns: TableColumnsType<API.ArticleSummary> = [
        { title: '编号', dataIndex: 'id' },
        { title: '文章标题', dataIndex: 'title' },
        {
            title: '操作',
            render: (_, record) => {
                return (
                    <Space>
                        <Button type='link' loading={detail.loading && detail.params[0] === record.id} onClick={() => detail.run(record.id)}>编辑</Button>
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
            {articleModal.visible && <ArticleModal
                cateList={cateList}
                tagList={tagList}
                visible={articleModal.visible}
                record={articleModal.record}
                onCancel={articleModal.hide}
                callback={refresh}
            />}
            <CustomForm items={[{ name: 'title', label: '文章标题' }]} formSearch={setSearchParams}></CustomForm>

            <div className='mb-4'>
                <Button type='primary' onClick={() => { detail.cancel(); articleModal.show() }}>
                    新增
                </Button>
            </div>

            <Table loading={loading} columns={columns} dataSource={data} rowKey='id' bordered size='medium'></Table>
        </div>
    )
}

Article.getLayout = (page: any) => {
    return <ManagerLayout>{page}</ManagerLayout>
}

export default Article
