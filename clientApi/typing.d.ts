declare namespace API {
    type Cate = {
        name: string
        id: number
        createdAt: string
        updatedAt: string
    }

    type Article = {
        id: number
        createdAt: string
        updatedAt: string
        title: string
        content: string
        authorId: number
        tags?: string[]
        desc?: string
        cover?: string
        viewCount?: string
        enabled: boolean
        cateId: number
        author: {
            username: string
        }
        cate: Cate
        createdAt: string
        updatedAt: string
    }

    type User = {
        id: number
        createdAt: string
        updatedAt: string
        email?: string
        username: string
        nickName?: string
        gender?: string
        introduce?: string
        roles: string[]
        birthDate?: string
        experience?: string
        contactInfo?: {
            tel?: string
            wechat?: string
        }
    }
}
