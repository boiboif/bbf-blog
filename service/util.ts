type SkipFunction = (code: string) => boolean

export const skipErrorMessageHandler = (skip: boolean | SkipFunction | undefined, code: string) => {
    const type = typeof skip

    const handlerMap = {
        boolean: () => {
            return skip as boolean
        },
        function: () => {
            return (skip as SkipFunction)(code)
        },
        undefined: () => {
            return false
        },
    }

    return handlerMap[type]()
}
