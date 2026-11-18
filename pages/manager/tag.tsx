import React, { useState } from 'react'
import { delTag, getTagAll } from '@/clientApi'
import CustomForm from '@/components/manager/customForm'
import ManagerLayout from '@/components/manager/layout'
import TableMoreAction from '@/components/manager/tableMoreAction'
import { useRequest } from 'ahooks'
import { App, Button, Space, Table } from 'antd'
import type { TableColumnsType } from 'antd'
import TagModal from '@/components/manager/tag/modal'
import useRecord from '@/hook/useRecord'

const Tag = () => {
    const { message } = App.useApp()
    const [searchParam, setSearchParams] = useState({ name: '' })
    const { data, refresh, loading } = useRequest(() => getTagAll(searchParam).then((res) => res?.data), {
        refreshDeps: [searchParam],
    })
    const tagModal = useRecord<API.Tag>()

    const columns: TableColumnsType<API.Tag> = [
        { title: '编号', dataIndex: 'id' },
        { title: '标签名称', dataIndex: 'name' },
        {
            title: '操作',
            render: (_, record) => {
                return (
                    <Space>
                        <Button type='link' onClick={() => tagModal.show(record)}>编辑</Button>
                        <TableMoreAction
                            record={record}
                            menuList={[
                                {
                                    name: '删除',
                                    className: 'text-red-500',
                                    confirmProps: {
                                        onOk: async () => {
                                            await delTag({ id: record.id })
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
            <TagModal visible={tagModal.visible} record={tagModal.record} onCancel={tagModal.hide} callback={refresh} />
            <CustomForm items={[{ name: 'name', label: '标签名称' }]} formSearch={setSearchParams}></CustomForm>

            <div className='mb-4'>
                <Button type='primary' onClick={() => tagModal.show()}>
                    新增
                </Button>
            </div>

            <Table loading={loading} columns={columns} dataSource={data} rowKey='id' bordered size='medium'></Table>
        </div>
    )
}

Tag.getLayout = (page: any) => {
    return <ManagerLayout>{page}</ManagerLayout>
}

export default Tag
