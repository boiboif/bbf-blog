import { App, Button, Modal, Form, Input, Select, Space } from 'antd'
import { useMemo, useState } from 'react'
import { addArticle, putArticle } from '@/clientApi'
import { Editor } from '@bytemd/react'
import zh from 'bytemd/locales/zh_Hans.json'
import { markdownPlugins } from '@/components/markdown/plugins'
import { useArticleImages } from './images'

interface ModalProps {
    title?: string
    visible: boolean
    onCancel: () => void
    record?: API.Article | null
    callback?: () => void
    cateList?: API.Cate[]
    tagList?: API.Tag[]
}

const ArticleModal = (props: ModalProps) => {
    const { message } = App.useApp()
    const { visible, record, onCancel, title, callback, cateList, tagList } = props
    const [form] = Form.useForm()
    const [value, setValue] = useState(record?.content ?? '')
    const { plugin, uploading, dialog } = useArticleImages()
    const editorPlugins = useMemo(() => [...markdownPlugins, plugin], [plugin])

    const handleSubmit = async () => {
        const vals = await form.validateFields()

        if (!value) {
            return message.error('内容不能为空！')
        }

        const submitApi = record ? putArticle : addArticle

        await submitApi({
            id: record?.id,
            ...vals,
            content: value,
        })

        message.success('提交成功！')
        onCancel()
        callback?.()
    }

    return (
        <Modal
            width={{ xs: 'calc(100% - 32px)', lg: 1500 }}
            title={title ? title : record ? '编辑' : '新增'}
            open={visible}
            onCancel={onCancel}
            footer={
                <div className='flex justify-end'>
                    <Space>
                        <Button disabled={uploading} onClick={() => setValue('')}>重置</Button>
                        <Button onClick={onCancel}>取消</Button>
                        <Button type='primary' disabled={uploading} onClick={handleSubmit}>
                            {uploading ? '图片上传中' : '提交'}
                        </Button>
                    </Space>
                </div>
            }
            destroyOnHidden
        >
            <Form
                name='edit-article'
                form={form}
                initialValues={{
                    title: record?.title,
                    cateId: record?.cateId,
                    tags: record?.tags?.map(tag => tag.id),
                }}
            >
                <Form.Item name='cateId' label='分类' rules={[{ required: true }]}>
                    <Select options={cateList?.map(cate => ({ label: cate.name, value: cate.id }))} />
                </Form.Item>
                <Form.Item name='tags' label='标签'>
                    <Select
                        mode='multiple'
                        allowClear
                        showSearch={{ optionFilterProp: 'label' }}
                        options={tagList?.map(tag => ({ label: tag.name, value: tag.id }))}
                    />
                </Form.Item>
                <Form.Item name='title' label='文章标题' rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
            </Form>

            <Editor
                value={value}
                plugins={editorPlugins}
                onChange={setValue}
                locale={zh}
            />
            {dialog}
        </Modal>
    )
}

export default ArticleModal
