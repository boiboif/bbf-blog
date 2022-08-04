import CounterStore from './counterStore'
import UserInfoStore from './userInfoStore'
import GlobalStore from './globalStore'

class RootStore {
    counterStore: CounterStore
    userInfoStore: UserInfoStore
    globalStore: GlobalStore
    constructor() {
        this.counterStore = new CounterStore(this)
        this.userInfoStore = new UserInfoStore(this)
        this.globalStore = new GlobalStore(this)
    }
}

export default RootStore
