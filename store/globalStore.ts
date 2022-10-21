import { makeAutoObservable } from 'mobx'
import type RootStore from './rootStore'

const colorsList = [
    '#78716c',
    '#f97316',
    '#f59e0b',
    '#eab308',
    '#84cc16',
    '#22c55e',
    '#10b981',
    '#14b8a6',
    '#06b6d4',
    '#0ea5e9',
    '#3b82f6',
    '#6366f1',
    '#8b5cf6',
    '#a855f7',
    '#d946ef',
    '#ec4899',
    '#f43f5e',
]
class UserInfoStore {
    rootStore: RootStore
    loading = true
    allowBannerAutoPlay = false
    dotColor = {
        i: 0,
        color: colorsList[0],
    }
    dotShow: boolean = false

    constructor(rootStore: RootStore) {
        makeAutoObservable(this)
        this.rootStore = rootStore
    }

    async setLoading(loading: boolean) {
        this.loading = loading
    }

    async setAllowBannerAutoPlay(allow: boolean) {
        this.allowBannerAutoPlay = allow
    }

    setDotShow = (show: boolean) => {
        this.dotShow = show
    }

    setDotColor = () => {
        const currentI = this.dotColor.i === colorsList.length - 1 ? 0 : this.dotColor.i + 1
        this.dotColor = {
            i: currentI,
            color: colorsList[currentI],
        }
    }
}

export default UserInfoStore
