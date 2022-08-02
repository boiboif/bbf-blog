import { getUserAll } from '@/service'
import ManagerLayout from '@/components/manager/layout'
import { useRequest } from 'ahooks'
import React from 'react'
import { observer } from 'mobx-react-lite'
import { useStore } from '@/store'

/**
 *
 * @returns 后台管理 - 首页
 */
const ManagerIndex = () => {
    const counterStore = useStore('counterStore')
    useRequest(() => getUserAll())

    return <div onClick={() => counterStore.add(1)}>{counterStore.count}</div>
}

ManagerIndex.getLayout = (page: any) => {
    return <ManagerLayout>{page}</ManagerLayout>
}

export default observer(ManagerIndex)
