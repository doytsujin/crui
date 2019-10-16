import { Unsubscribe } from '@crui/core/types'
import { Action, Driver } from '../../types'
import { action } from '../action'

export const CleanupType = Symbol('cleanup')
export type CleanupDriver<N = any> = {
    [CleanupType]: Driver<N, Cleanup>
}
export type Cleanup = Action<typeof CleanupType, CleanupDriver> & {
    unsub: Unsubscribe,
}

export function cleanup(unsub: Unsubscribe): Cleanup {
    return action({
        type: CleanupType,
        unsub
    })
}