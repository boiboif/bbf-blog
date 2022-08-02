import { login } from '@/service'
import { useStore } from '@/store'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { useRequest } from 'ahooks'
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

    const { loading, run } = useRequest((val) => login(val).then((res) => res?.data), {
        manual: true,
        onSuccess: (data) => {
            userInfoStore.setUserInfo(data)
            localStorage.setItem('token', data?.token!)
            localStorage.setItem('userId', data?.id.toString()!)
            message.success('登录成功！')
            handleCancel()
        },
    })

    const handleCancel = () => {
        onCancel()
        form.resetFields()
    }

    const onFinish = async (val: any) => {
        run(val)
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
                    <Button loading={loading} type='primary' htmlType='submit' className='login-form-button'>
                        登录
                    </Button>
                    Or <a href=''>register now!</a>
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default observer(LoginModal)
