import { makeAutoObservable } from 'mobx'
import type RootStore from './rootStore'

class UserInfoStore {
    rootStore: RootStore
    loading: boolean = true

    constructor(rootStore: RootStore) {
        makeAutoObservable(this)
        this.rootStore = rootStore
    }

    async setLoading(loading: boolean) {
        this.loading = loading
    }
}

export default UserInfoStore
