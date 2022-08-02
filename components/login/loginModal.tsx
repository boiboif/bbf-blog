import { login } from '@/service'
import { useStore } from '@/store'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Modal, Form, Input, Button, message } from 'antd'
import { observer } from 'mobx-react-lite'

interface ModalProps {
    visible: boolean
    onCancel: () => void
    callback?: () => void
}

const LoginModal = (props: ModalProps) => {
    const { visible, onCancel } = props
    const [form] = Form.useForm()
    const userInfoStore = useStore('userInfoStore')

    const handleCancel = () => {
        onCancel()
        form.resetFields()
    }

    const onFinish = async () => {
        const vals = await form.validateFields()
        const res = await login(vals)
        if (res?.data) {
            userInfoStore.setUserInfo(res.data)
            localStorage.setItem('token', res.data.token)
            localStorage.setItem('userId', res.data.id.toString())
            message.success('登录成功！')
            handleCancel()
        }
    }

    return (
        <Modal className='!w-full lg:!w-[400px]' title={'登录'} visible={visible} onCancel={handleCancel} footer={false} destroyOnClose>
            <Form form={form} name='normal_login' className='login-form' onFinish={onFinish}>
                <Form.Item name='username' rules={[{ required: true, message: '请输入用户名!' }]}>
                    <Input prefix={<UserOutlined className='site-form-item-icon' />} placeholder='用户名' />
                </Form.Item>
                <Form.Item name='password' rules={[{ required: true, message: '请输入密码!' }]}>
                    <Input.Password prefix={<LockOutlined className='site-form-item-icon' />} type='password' placeholder='密码' />
                </Form.Item>

                <Form.Item>
                    <Button type='primary' htmlType='submit' className='login-form-button'>
                        登录
                    </Button>
                    Or <a href=''>register now!</a>
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default observer(LoginModal)
