import { useStore } from '@/store'
import { isMobile } from '@/utils/isMobile'
import { useCallback } from 'react'

export const useDotShow = () => {
    const { setDotShow } = useStore('globalStore')

    const onMouseOver = useCallback(() => {
        if (isMobile()) return
        setDotShow(true)
    }, [setDotShow])

    const onMouseLeave = useCallback(() => {
        if (isMobile()) return
        setDotShow(false)
    }, [setDotShow])

    return {
        onMouseOver,
        onMouseLeave,
    }
}

export const useDotColor = () => {
    const { setDotColor } = useStore('globalStore')

    const onMouseEnter = useCallback(() => {
        if (isMobile()) return
        setDotColor()
    }, [setDotColor])

    return {
        onMouseEnter,
    }
}
