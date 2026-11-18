import { createContext, useContext } from 'react'
import { enableStaticRendering } from 'mobx-react-lite'
import RootStore from './rootStore'

enableStaticRendering(typeof window === 'undefined')

export const createStore = () => new RootStore()

export const RootContext = createContext<RootStore | null>(null)

/**
 * NODE：若使用时，若目标仓库类中的方法不是使用箭头函数的话，使用useStore不能解构赋值，解构赋值会导致方法内部丢失this指向
 * @param key
 * @returns
 */
export const useStore = <T extends keyof RootStore>(key: T): RootStore[T] => {
    const root = useContext(RootContext)
    if (!root) throw new Error('useStore requires a RootContext provider')
    return root[key]
}
