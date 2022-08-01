import { useState } from 'react'

const useRecord = <T = any>() => {
    const [record, setReocord] = useState<T | null | undefined>(null)
    const [visible, setVisible] = useState(false)

    const show = (recordData?: T | null) => {
        setReocord(recordData)
        setVisible(true)
    }

    const hide = () => {
        setVisible(false)
        setReocord(null)
    }

    return {
        record,
        show,
        hide,
        setReocord,
        visible,
    }
}

export default useRecord
