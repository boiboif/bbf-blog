import React, { useState } from 'react'
import { delCate, getCateAll } from '@/clientApi'
import CustomForm from '@/components/manager/customForm'
import ManagerLayout from '@/components/manager/layout'
import TableMoreAction from '@/components/manager/tableMoreAction'
import { useRequest } from 'ahooks'
import { App, Button, Space, Table } from 'antd'
import type { TableColumnsType } from 'antd'
import CateModal from '@/components/manager/cate/modal'
import useRecord from '@/hook/useRecord'

const Cate = () => {
    const { message } = App.useApp()
    const [searchParam, setSearchParams] = useState({ name: '' })
    const { data, refresh, loading } = useRequest(() => getCateAll(searchParam).then((res) => res?.data), {
        refreshDeps: [searchParam],
    })
    const cateModal = useRecord<API.Cate>()

    const columns: TableColumnsType<API.Cate> = [
        { title: '编号', dataIndex: 'id' },
        { title: '分类名称', dataIndex: 'name' },
        {
            title: '操作',
            render: (_, record) => {
                return (
                    <Space>
                        <Button type='link' onClick={() => cateModal.show(record)}>编辑</Button>
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
            <CateModal visible={cateModal.visible} record={cateModal.record} onCancel={cateModal.hide} callback={refresh} />
            <CustomForm items={[{ name: 'name', label: '分类名称' }]} formSearch={setSearchParams}></CustomForm>

            <div className='mb-4'>
                <Button type='primary' onClick={() => cateModal.show()}>
                    新增
                </Button>
            </div>

            <Table loading={loading} columns={columns} dataSource={data} rowKey='id' bordered size='medium'></Table>
        </div>
    )
}

Cate.getLayout = (page: any) => {
    return <ManagerLayout>{page}</ManagerLayout>
}

export default Cate
