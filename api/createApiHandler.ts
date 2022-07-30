import service, { codeMessage } from '@/utils/request'
import { message } from 'antd'
import type { AxiosRequestConfig, Method } from 'axios'
import { set, merge } from 'lodash'
import { skipErrorMessageHandler } from './util'

type ErrorHandler = (errorInfo: { error: { errorMessage: string; errCode: string }; requestOption: any }) => void

interface CreateHandlerParams {
    baseUrl?: string
    adaptor: (resData: any) => { success: boolean; errorMessage: string; errCode: string }
    headers?: () => Record<string, string>
    errorHandler?: ErrorHandler
    skipErrorMessage?: boolean | ((code: string) => boolean)
    skipHttpErrorMessage?: boolean
}

interface HandlerConfig extends AxiosRequestConfig {
    skipErrorMessage?: boolean | ((code: string) => boolean)
    skipHttpErrorMessage?: boolean
    errorHandler?: ErrorHandler
}

interface InnerConfig extends AxiosRequestConfig {
    skipErrorMessage?: boolean | ((code: string) => boolean)
    skipHttpErrorMessage?: boolean
}

const createHandler = (createHandlerParams: CreateHandlerParams) => {
    return <Res = any, Req = any>(url: string, method: Method = 'post', config?: HandlerConfig) =>
        async (data?: Req, innerConfig?: InnerConfig) => {
            const { baseUrl = '', adaptor, headers, errorHandler } = createHandlerParams

            const requestOption: AxiosRequestConfig = {
                url: baseUrl + url,
                ...config,
                ...innerConfig,
                headers: merge(headers?.(), config?.headers, innerConfig?.headers),
            }

            set(requestOption, 'method', method)
            set(requestOption, method === 'get' || method === 'GET' ? 'params' : 'data', data)

            try {
                const response = await service.request<never, Res>(requestOption)
                const { success, errorMessage, errCode } = adaptor(response ?? {})
                const isSkipErrorMessage =
                    skipErrorMessageHandler(createHandlerParams.skipErrorMessage, errCode) ||
                    skipErrorMessageHandler(config?.skipErrorMessage, errCode)

                if (!success) {
                    if (!isSkipErrorMessage) {
                        message.error(errCode + '：' + errorMessage)
                    }

                    errorHandler?.({ error: { errCode, errorMessage }, requestOption })
                    config?.errorHandler?.({ error: { errCode, errorMessage }, requestOption })
                    throw new Error(errCode)
                }
                return response
            } catch (error: any) {
                if (error?.response?.status) {
                    const isSkipHttpErrorMssage =
                        createHandlerParams.skipHttpErrorMessage || config?.skipHttpErrorMessage || innerConfig?.skipHttpErrorMessage
                    if (isSkipHttpErrorMssage) return
                    const errCode = error?.response?.status
                    const errorMessage = codeMessage[errCode]
                    message.error(`${errCode}: ${errorMessage}`)
                }
                throw error
            }
        }
}

export default createHandler
