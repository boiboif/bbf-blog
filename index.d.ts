declare interface CustomResponse<Data = any> {
    data: Data
    success: boolean
    message?: string
}
