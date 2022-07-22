import { Button } from 'antd'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'

const Home: NextPage = () => {
    const router = useRouter()
    return (
        <div style={{ height: '300vh' }}>
            <Button style={{ position: 'sticky', top: 0 }} type='primary' onClick={() => router.push('/test')}>
                按钮
            </Button>
        </div>
    )
}

export default Home
