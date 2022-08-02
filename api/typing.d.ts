declare namespace API {
    type Cate = {
        name: string
        id: number
        createdAt: string
        updatedAt: string
    }

    type Article = {
        id: number
        content: string
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
