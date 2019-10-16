import { compatibleInputEvent } from '@crui/core/dom/events'
import { apply } from '@crui/reactive/rx/box/apply'
import { DRW$B } from '@crui/reactive/rx/box/types'
import { makeAtomic } from '@crui/reactive/utils/atomic'
import { then } from '../../deferred'
import { Emitter } from '../../emitter'
import { cleanup } from '../cleanup'
import { Cleanup } from '../cleanup/index'
import { EventAction, on } from '../event'
import { getProp, GetProp } from '../getProp'
import { Prop as AProp, prop } from '../prop'
import { BindCheckedDriver, BindCheckedType, BindValueDriver, BindValueType, BVTag } from './index'

export const bindValueDriver: BindValueDriver<any, AReq<'value'>> = {
    [BindValueType]: bind('value')
}

export const bindCheckedDriver: BindCheckedDriver<any, AReq<'checked'>> = {
    [BindCheckedType]: bind('checked')
}

type Props = {
    value: string,
    checked: boolean
}

type AReq<P extends keyof Props> = 
    AProp<P>|GetProp<P>|EventAction<BVTag>|Cleanup

function bind<P extends keyof Props>(name: P) {
    return <N>(
        node: N,
        { stream }: { stream: DRW$B<Props[P]> },
        { emit }: Emitter<N, AReq<P>>,
    ) => {
        const atomic = makeAtomic()
        const event = compatibleInputEvent(node)

        emit(node, cleanup(
            apply(stream, atomic((val: Props[P]) => {
                emit(node, prop(name, val))
            }))
        ))
        emit(node, on(event, atomic(() => {
            then(emit(node, getProp(name)), (val) => {
                stream.set(val)
            })
        })))

        return node
    }
}