import UserInfoStore from './userInfoStore'
import GlobalStore from './globalStore'

class RootStore {
    userInfoStore: UserInfoStore
    globalStore: GlobalStore
    constructor() {
        this.userInfoStore = new UserInfoStore(this)
        this.globalStore = new GlobalStore(this)
    }
}

export default RootStore
