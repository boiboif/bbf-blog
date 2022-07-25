import Banner from '@/components/banner'
import { Button } from 'antd'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'

const Home: NextPage = () => {
    const router = useRouter()

    return (
        <div style={{ height: '300vh' }}>
            <div>
                <div className='w-full lg:w-[62%] lg:flex lg:flex-row-reverse'>
                    <div className='flex-1'>
                        <Banner />
                    </div>
                    <div className=' w-full lg:w-[11.409%] lg:max-w-[85px]'>123</div>
                </div>

                <div className='w-full lg:w-[38%]'>
                    <Button onClick={() => router.push('/test')}>跳转</Button>
                </div>
            </div>
        </div>
    )
}

export default Home
