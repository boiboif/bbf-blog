import customApiHandler from './customApiHandler'

export const getUserAll = customApiHandler('/api/user', 'GET')

export const getTagAll = customApiHandler<CustomResponse<API.Tag[]>>('/api/tag', 'GET')
export const addTag = customApiHandler('/api/tag', 'POST')
export const putTag = customApiHandler('/api/tag', 'PUT')
export const delTag = customApiHandler('/api/tag', 'DELETE')

export const getCateAll = customApiHandler<CustomResponse<API.Cate[]>>('/api/cate', 'GET')
export const addCate = customApiHandler('/api/cate', 'POST')
export const putCate = customApiHandler('/api/cate', 'PUT')
export const delCate = customApiHandler('/api/cate', 'DELETE')

export const getArticleAll = customApiHandler<CustomResponse<API.Article[]>, { size?: number, name?: string }>('/api/post', 'GET')
export const getArticleById = (id: string) => customApiHandler<CustomResponse<API.Article>>(`/api/post/${id}`, 'GET')
export const addArticle = customApiHandler('/api/post', 'POST')
export const putArticle = customApiHandler('/api/post', 'PUT')
export const delArticle = customApiHandler('/api/post', 'DELETE')

export const login = customApiHandler<CustomResponse<API.User & { token: string }>, { username: string; password: string }>(
    '/api/login',
    'POST'
)
export const getUserInfoById = (id: string) => customApiHandler<CustomResponse<API.User & { token: string }>>(`/api/user/${id}`, 'GET')

export const revalidated = customApiHandler('/api/revalidate', 'GET')
