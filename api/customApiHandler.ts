import createHandler from './createApiHandler'

const customApiHandler = createHandler({
    adaptor: (resData: any) => ({
        success: resData.success,
        errorMessage: resData.message,
        errCode: resData.errCode,
    }),
    headers: () => ({
        authorization: localStorage.getItem('token') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTY1OTM2NTQ4M30.tjy7pp6UBoDdMsUE8wUKrDcphvF_b9TxtnjA8qRhHq0',
    }),
})

export default customApiHandler
