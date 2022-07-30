import { getUserAll } from '@/api'
import ManagerLayout from '@/components/manager/layout'
import { useRequest } from 'ahooks'
import React from 'react'

/**
 *
 * @returns 后台管理 - 首页
 */
const ManagerIndex = () => {
    useRequest(() => getUserAll())

    return <div>ManagerIndex</div>
}

ManagerIndex.getLayout = (page: any) => {
    return <ManagerLayout>{page}</ManagerLayout>
}

export default ManagerIndex
