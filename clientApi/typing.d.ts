import type { post_cate, tag, post, user } from '@/generated/prisma/browser'

declare namespace API {
    type Cate = DateToString<post_cate>

    type Tag = DateToString<tag>

    type ArticleSummary = Pick<Article, 'id' | 'title' | 'createdAt' | 'cateId' | 'viewCount'> & {
        cate: Pick<Cate, 'name'>
        tags: Pick<Tag, 'id' | 'name'>[]
    }

    type Article = DateToString<post> & {
        tags?: Tag[]
        author: {
            username: string
        }
        cate: Cate
    }

    type User = Pick<user, 'id' | 'username' | 'nickName'> & {
        roles: string[]
    }

    type PortalStatisticsCount = {
        tagCount: number
        cateCount: number
        postCount: number
    }
}

export as namespace API
export = API
