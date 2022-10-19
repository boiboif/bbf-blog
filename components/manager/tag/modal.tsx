import { Button, Modal, Form, Input, message, Space } from 'antd'
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
            className='!w-full lg:!w-[800px]'
            title={title ? title : record ? '编辑' : '新增'}
            visible={visible}
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
            destroyOnClose
        >
            <Form form={form}>
                <Form.Item name='name' label='分类名称' rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default TagModal
