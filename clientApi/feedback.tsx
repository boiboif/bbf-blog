import { App } from 'antd'
import { useEffect } from 'react'

let notifyError: ((text: string) => void) | undefined

export function reportApiError(text: string) {
    notifyError?.(text)
}

export function ApiFeedback() {
    const { message } = App.useApp()
    useEffect(() => {
        notifyError = text => { void message.error(text) }
        return () => { notifyError = undefined }
    }, [message])
    return null
}
