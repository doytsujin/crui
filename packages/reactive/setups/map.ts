import { Component, Setup } from '@crui/core/dom';
import { result } from '@crui/core/dom/rendered';
import { R$L } from '../rx';
import { $map as l$map } from '../rx/list/map';
import { with$Children } from './internals/children';

/**
 * Map a stream of items I into children and setup them in an element
 */
export function s$map<T, C, M>(
    $list: R$L<T>,
    item: (i: T) => Component<C>
): Setup<C, M> {
    return (meta, dom, node, ctxt) => result(meta, with$Children(
        dom,
        node,
        l$map(
            $list,
            (todo: T) => item(todo)(dom, ctxt)
        )
    ))
}