import customApiHandler from './customApiHandler'

export const getUserAll = customApiHandler('/api/user', 'GET')

export const getCateAll = customApiHandler<CustomResponse<API.Cate[]>>('/api/cate', 'GET')
export const addCate = customApiHandler('/api/cate', 'POST')
export const putCate = customApiHandler('/api/cate', 'PUT')
export const delCate = customApiHandler('/api/cate', 'DELETE')

export const getArticleAll = customApiHandler<CustomResponse<API.Article[]>>('/api/post', 'GET')
export const addArticle = customApiHandler('/api/post', 'POST')
export const putArticle = customApiHandler('/api/post', 'PUT')
export const delArticle = customApiHandler('/api/post', 'DELETE')