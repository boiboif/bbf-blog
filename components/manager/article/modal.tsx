import { Button, Modal, Form, Input, message, Select, Space } from 'antd'
import { useEffect, useState } from 'react'
import { addArticle, putArticle, revalidated } from '@/clientApi'
import { Editor } from '@bytemd/react'
import zh from 'bytemd/locales/zh_Hans.json'
import highlight from '@bytemd/plugin-highlight-ssr'
import gfm from '@bytemd/plugin-gfm'
import frontmatter from '@bytemd/plugin-frontmatter'
import mediumZoom from '@bytemd/plugin-medium-zoom'
import mermaid from '@bytemd/plugin-mermaid'
import gemoji from '@bytemd/plugin-gemoji'
import breaks from '@bytemd/plugin-breaks'
import gfmLocales from '@bytemd/plugin-gfm/locales/zh_Hans.json'
import mermaidLocales from '@bytemd/plugin-mermaid/locales/zh_Hans.json'
import 'highlight.js/styles/vs.css'
import 'github-markdown-css' // placed after highlight styles to override `code` padding

const { Option } = Select

const plugins = [
    gfm({
        locale: gfmLocales,
    }),
    highlight(),
    frontmatter(),
    mediumZoom(),
    mermaid({ locale: mermaidLocales }),
    gemoji(),
    breaks(),
    // Add more plugins here
]

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
    const { visible, record, onCancel, title, callback, cateList, tagList } = props
    const [form] = Form.useForm()
    const [value, setValue] = useState('')

    useEffect(() => {
        if (record && visible) {
            form.setFieldsValue({
                ...record,
                tags: record.tags?.map((t) => t.id),
            })
            setValue(record.content)
        }
    }, [visible, record, form])

    const handleCancel = () => {
        if (record) {
            setValue('')
        }
        form.resetFields()
        onCancel()
    }

    const handleSubmit = async () => {
        const vals = await form.validateFields()

        if (!value) {
            return message.error('内容不能为空！')
        }

        const submitApi = record ? putArticle : addArticle

        const res = await submitApi({
            id: record?.id,
            ...vals,
            content: value,
        })

        // revalidated({ path: '/' })
        // revalidated({ path: '/category' })
        // revalidated({ path: `/article/${res.data.id}` })

        message.success('提交成功！')
        setValue('')
        handleCancel()
        callback?.()
    }

    return (
        <Modal
            className='!w-full lg:!w-[1500px]'
            title={title ? title : record ? '编辑' : '新增'}
            visible={visible}
            onCancel={handleCancel}
            footer={
                <div className='flex justify-end'>
                    <Space>
                        <Button onClick={() => setValue('')}>重置</Button>
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
                <Form.Item name='cateId' label='分类' rules={[{ required: true }]}>
                    <Select>
                        {cateList?.map((cate) => {
                            return (
                                <Option key={cate.id} value={cate.id}>
                                    {cate.name}
                                </Option>
                            )
                        })}
                    </Select>
                </Form.Item>
                <Form.Item name='tags' label='标签'>
                    <Select showSearch optionFilterProp='children' mode='multiple' allowClear>
                        {tagList?.map((cate) => {
                            return (
                                <Option key={cate.id} value={cate.id}>
                                    {cate.name}
                                </Option>
                            )
                        })}
                    </Select>
                </Form.Item>
                <Form.Item name='title' label='文章标题' rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
            </Form>

            <Editor
                value={value}
                plugins={plugins}
                onChange={(v) => {
                    setValue(v)
                }}
                locale={zh}
            />
        </Modal>
    )
}

export default ArticleModal
