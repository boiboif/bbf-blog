import { makeAutoObservable, reaction, runInAction } from 'mobx'
import type RootStore from './rootStore'

// use Demo
// import { observer } from 'mobx-react-lite';
// import { StoreContext } from '@/main';
// const Counter = observer(() => {
//   const { counterStore } = useContext(StoreContext);

//   return (
//     <div>
//       <Button onClick={() => counterStore.add(1)}>加1</Button>
//       <Button onClick={() => counterStore.sub(1)}>减1</Button>
//       <Button onClick={() => counterStore.asyncAdd()}>异步加</Button>
//       <div>count: {counterStore.count}</div>
//       <div>double: {counterStore.double}</div>
//     </div>
//   );
// });

const addApi = () => {
    return new Promise<number>((resolve) => {
        setTimeout(() => {
            resolve(Math.round(Math.random() * 10))
        }, 1000)
    })
}

class CounterStore {
    rootStore: RootStore
    count: number = 0
    data = {
        data: {},
    }

    constructor(rootStore: RootStore) {
        makeAutoObservable(this)
        this.rootStore = rootStore

        reaction(
            () => this.double,
            (double) => {
                console.log(double)
            }
        )
    }

    add(num: number) {
        this.count += num
    }

    sub(num: number) {
        this.count -= num
    }

    get double() {
        return this.count * 2
    }

    async asyncAdd() {
        const res = await addApi()
        runInAction(() => {
            this.count += res
        })
        const res1 = await addApi()
        runInAction(() => {
            this.count += res1
        })
    }
}

export default CounterStore
