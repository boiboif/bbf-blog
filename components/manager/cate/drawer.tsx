import { Button, Drawer, Form, Input, message, Space } from 'antd'
import { useEffect } from 'react'
import { addCate, putCate } from '@/api'

interface APDrawerProps {
    width?: number
    title?: string
    visible: boolean
    onClose: () => void
    record?: API.Cate | null
    callback?: () => void
}

const CateDrawer = (props: APDrawerProps) => {
    const { visible, record, onClose, title, width = 500, callback } = props
    const [form] = Form.useForm()

    useEffect(() => {
        if (record && visible) {
            form.setFieldsValue({
                ...record,
            })
        }
    }, [visible, record, form])

    const handleClose = () => {
        form.resetFields()
        onClose()
    }

    const handleSubmit = async () => {
        const vals = await form.validateFields()

        const submitApi = record ? putCate : addCate

        await submitApi({
            id: record?.id,
            ...vals,
        })

        message.success('提交成功！')
        handleClose()
        callback?.()
    }

    return (
        <Drawer
            width={width}
            title={title ? title : record ? '编辑' : '新增'}
            visible={visible}
            onClose={handleClose}
            footer={
                <div className='flex justify-end'>
                    <Space>
                        <Button>取消</Button>
                        <Button type='primary' onClick={handleSubmit}>
                            提交
                        </Button>
                    </Space>
                </div>
            }
        >
            <Form labelCol={{ span: 5 }} form={form}>
                <Form.Item name='name' label='分类名称' rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
            </Form>
        </Drawer>
    )
}

export default CateDrawer
