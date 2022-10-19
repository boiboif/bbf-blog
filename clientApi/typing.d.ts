import { post_cate, tag, post, user, contactInfo } from '@prisma/client'

declare namespace API {
    type Cate = DateToString<post_cate>

    type Tag = DateToString<tag>

    type Article = DateToString<post> & {
        tags?: Tag[]
        author: {
            username: string
        }
        cate: {
            name: string
        }
    }

    type User = DateToString<user> & {
        roles: string[]
        contactInfo?: contactInfo
    }

    type PortalStatisticsCount = {
        tagCount: number
        cateCount: number
        postCount: number
    }
}

export as namespace API
export = API
