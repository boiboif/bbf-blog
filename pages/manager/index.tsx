import ManagerLayout from '@/components/manager/layout'
import Link from 'next/link'
import React from 'react'

/**
 *
 * @returns 后台管理 - 首页
 */
const ManagerIndex = () => {
    return <div>ManagerIndex</div>
}

ManagerIndex.getLayout = (page: any) => {
    return <ManagerLayout>{page}</ManagerLayout>
}

export default ManagerIndex
