import { makeAutoObservable } from 'mobx'
import type RootStore from './rootStore'

class UserInfoStore {
    rootStore: RootStore
    userInfo?: API.User

    constructor(rootStore: RootStore) {
        makeAutoObservable(this)
        this.rootStore = rootStore
    }

    async setUserInfo(userInfo?: API.User) {
        this.userInfo = userInfo
    }
}

export default UserInfoStore
