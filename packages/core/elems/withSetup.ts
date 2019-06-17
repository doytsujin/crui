import { Component, Setup, Tag } from '../dom';
import { mergeLifecycles, Meta, rendered } from '../dom/rendered';

type SCombinator = <T extends Tag, C, D, M extends Meta<T>>(
    comp: Component<C, M>, setup: Setup<D, M>
) => Component<C & D, M>

/**
 * With Setup
 * Apply a new Setup to a Component
 */
export const ws: SCombinator = (comp, setup) =>
    (dom, ctxt) => {
        const c = comp(dom, ctxt)
        const s = setup(c.meta, dom, c.node, ctxt)
        return rendered(c.node, mergeLifecycles([c.lfc, s.lfc]), s.meta)
    }