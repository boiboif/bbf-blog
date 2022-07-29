import ManagerLayout from '@/components/manager/layout'
import Link from 'next/link'
import React from 'react'

const Cate = () => {
    return <div>Cate</div>
}

Cate.getLayout = (page: any) => {
    return <ManagerLayout>{page}</ManagerLayout>
}

export default Cate
