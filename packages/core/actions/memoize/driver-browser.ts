import { AnyNodeAction } from '../../types'
import { Deferred } from '../../utils/deferred'
import { Memoize, MemoizeDriver, MemoizeType } from './index'

type Cache<E extends AnyNodeAction, N> =
    WeakMap<E, Deferred<N>>

export function makeMemoizeDriver<
    N = any,
    E extends AnyNodeAction = any
>(): MemoizeDriver<E, N> {
    const cache: Cache<E, N> = new WeakMap()

    return {
        [MemoizeType]: (_, { elem }, { emit }) => {
            let node = cache.get(elem)

            if (node === undefined) {
                node = emit(_, elem)
                cache.set(elem, node)
            }
            
            return node
        }
    }
}