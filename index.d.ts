declare interface CustomResponse<Data = any> {
    data: Data
    success: boolean
    message?: string
}

declare type DateToString<T> = {
    [K in keyof T]: T[K] extends Date ? string : T[K]
}
