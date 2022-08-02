import { createContext, useContext } from 'react'
import RootStore from './rootStore'

const rootStore = new RootStore()

export const createStore = () => rootStore

export const RootContext = createContext<RootStore>(createStore())

/**
 * NODE：若使用时，若目标仓库类中的方法不是使用箭头函数的话，使用useStore不能解构赋值，解构赋值会导致方法内部丢失this指向
 * @param key
 * @returns
 */
export const useStore = <T extends keyof RootStore>(key: T): RootStore[T] => {
    const root = useContext(RootContext)

    return root[key]
}
