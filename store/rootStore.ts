import CounterStore from './counterStore'
import UserInfoStore from './userInfoStore'

class RootStore {
    counterStore: CounterStore
    userInfoStore: UserInfoStore
    constructor() {
        this.counterStore = new CounterStore(this)
        this.userInfoStore = new UserInfoStore(this)
    }
}

export default RootStore
