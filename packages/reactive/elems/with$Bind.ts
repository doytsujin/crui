import { Component, DOM, Tag } from '@crui/core/dom';
import { compatibleInputEvent } from '@crui/core/dom/events';
import { defRendered, modRendered, Rendered } from '@crui/core/elems/rendered';
import { combine } from '@crui/core/utils/combine';
import { keys } from '@crui/core/utils/object';
import { Stream, Unsubscribe } from '../rx/stream';

export type Bind = {
    checked?: Stream<boolean>,
    value?: Stream<string>,
}

export function h$b(tag: Tag, bind?: Bind): Component {
    return (dom) => {
        const node = dom.create(tag)
        return with$Bind(dom, node, bind)
    }
}

export function with$Bind<N>(dom: DOM<N>, node: N, bind?: Bind): Rendered<N> {
    if (!bind) {
        return defRendered(node)
    }

    const unsubs: Unsubscribe[] = []
    const event = compatibleInputEvent(node)
    keys(bind).forEach((prop) => {
        const $s: Stream<any> | undefined = bind[prop]
        if ($s == null) {
            return
        }
        const atomic = makeAtomic()
        unsubs.push(
            dom.listen(node, event, atomic(() => {
                $s.set((node as any)[prop])
            })),
            $s.subscribe(atomic((val) => {
                (node as any)[prop] = val
            }))
        )
    })

    return modRendered(node, (r) => {
        r.unsub = combine(unsubs)
    })
}

type Atomic = <E>(f: (val: E) => void) => (val: E) => void
function makeAtomic(): Atomic {
    let running = true
    return (f) => (e) => {
        if (running) {
            return
        }
        running = true
        f(e)
        running = false
    }
}