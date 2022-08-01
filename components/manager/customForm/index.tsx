import type { FC, CSSProperties } from 'react'
import { memo } from 'react'
import { Form, Input, Button } from 'antd'

const formItemStyle: CSSProperties = {
    marginBottom: 15,
}

interface Props {
    formSearch: (vals: any) => void
    items: [{ name: string; label: string }]
}

const CustomForm: FC<Props> = (props) => {
    const { formSearch, items } = props
    const [form] = Form.useForm()

    const onFinish = (vals: any) => {
        formSearch({
            ...vals,
        })
    }

    return (
        <Form form={form} layout='inline' onFinish={onFinish}>
            {items.map((item) => {
                return (
                    <Form.Item key={item.name} name={item.name} label={item.label} style={{ ...formItemStyle }}>
                        <Input></Input>
                    </Form.Item>
                )
            })}
            <Form.Item style={{ ...formItemStyle }}>
                <Button type='primary' htmlType='submit'>
                    查询
                </Button>
                <Button
                    onClick={() => {
                        form.resetFields()
                        onFinish({})
                    }}
                    style={{ marginLeft: 15 }}
                >
                    重置
                </Button>
            </Form.Item>
        </Form>
    )
}

export default memo(CustomForm)
