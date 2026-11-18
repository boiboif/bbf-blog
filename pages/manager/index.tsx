import type { GetStaticProps, InferGetStaticPropsType } from 'next'
import Link from 'next/link'
import type { ReactElement } from 'react'
import ManagerLayout from '@/components/manager/layout'
import { getPortalStatisticsCount } from '@/service/statistics'

export const getStaticProps = (async () => ({
    props: { counts: await getPortalStatisticsCount() },
    revalidate: 60,
})) satisfies GetStaticProps

export default function ManagerIndex({ counts }: InferGetStaticPropsType<typeof getStaticProps>) {
    return (
        <div className="card flex flex-wrap gap-6">
            <Link href="/manager/article">文章（{counts.postCount}）</Link>
            <Link href="/manager/cate">分类（{counts.cateCount}）</Link>
            <Link href="/manager/tag">标签（{counts.tagCount}）</Link>
        </div>
    )
}

ManagerIndex.getLayout = (page: ReactElement) => <ManagerLayout>{page}</ManagerLayout>
