import { App, Button, Modal, Form, Input, Space } from 'antd'
import { useEffect } from 'react'
import { addTag, putTag } from '@/clientApi'

interface ModalProps {
    title?: string
    visible: boolean
    onCancel: () => void
    record?: API.Tag | null
    callback?: () => void
}

const TagModal = (props: ModalProps) => {
    const { message } = App.useApp()
    const { visible, record, onCancel, title, callback } = props
    const [form] = Form.useForm()

    useEffect(() => {
        if (record && visible) {
            form.setFieldsValue({
                ...record,
            })
        }
    }, [visible, record, form])

    const handleCancel = () => {
        form.resetFields()
        onCancel()
    }

    const handleSubmit = async () => {
        const vals = await form.validateFields()

        const submitApi = record ? putTag : addTag

        await submitApi({
            id: record?.id,
            ...vals,
        })

        message.success('提交成功！')
        handleCancel()
        callback?.()
    }

    return (
        <Modal
            width={{ xs: 'calc(100% - 32px)', lg: 800 }}
            title={title ? title : record ? '编辑' : '新增'}
            open={visible}
            onCancel={handleCancel}
            footer={
                <div className='flex justify-end'>
                    <Space>
                        <Button onClick={handleCancel}>取消</Button>
                        <Button type='primary' onClick={handleSubmit}>
                            提交
                        </Button>
                    </Space>
                </div>
            }
            destroyOnHidden
        >
            <Form name='edit-tag' form={form}>
                <Form.Item name='name' label='标签名称' rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default TagModal
