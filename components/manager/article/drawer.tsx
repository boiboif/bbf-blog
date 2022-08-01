import { Button, Drawer, Form, Input, message, Space } from 'antd'
import { useEffect, useState } from 'react'
import { addArticle, putArticle } from '@/api'
import { Editor } from '@bytemd/react'
import gfm from '@bytemd/plugin-gfm'
import zh from 'bytemd/locales/zh_Hans.json'
import highlight from '@bytemd/plugin-highlight-ssr'
import 'juejin-markdown-themes/dist/github.min.css'
import 'highlight.js/styles/github-dark.css'
const plugins = [
    gfm(),
    highlight(),
    // Add more plugins here
]

interface APDrawerProps {
    width?: number
    title?: string
    visible: boolean
    onClose: () => void
    record?: API.Article | null
    callback?: () => void
}

const ArticleDrawer = (props: APDrawerProps) => {
    const { visible, record, onClose, title, width = 500, callback } = props
    const [form] = Form.useForm()
    const [value, setValue] = useState('')

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

        const submitApi = record ? putArticle : addArticle

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
                <Form.Item name='name' label='文章标题' rules={[{ required: true }]}>
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
        </Drawer>
    )
}

export default ArticleDrawer
