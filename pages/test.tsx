import { Button } from 'antd'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import React from 'react'

const Test: NextPage = () => {
    const router = useRouter()

    return (
        <div>
            <Button onClick={() => router.back()}>返回</Button>
        </div>
    )
}

export default Test
