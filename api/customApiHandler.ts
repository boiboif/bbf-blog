import createHandler from './createApiHandler'

const customApiHandler = createHandler({
    adaptor: (resData: any) => ({
        success: resData.success,
        errorMessage: resData.message,
        errCode: resData.errCode,
    }),
    headers: () => ({
        authorization: localStorage.getItem('token') ?? '',
    }),
})

export default customApiHandler
