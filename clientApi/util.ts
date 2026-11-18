type SkipFunction = (code: string) => boolean

export const skipErrorMessageHandler = (skip: boolean | SkipFunction | undefined, code: string) => {
    return typeof skip === 'function' ? skip(code) : skip ?? false
}
