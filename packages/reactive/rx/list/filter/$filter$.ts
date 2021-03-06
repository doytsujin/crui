import { Cond$B } from '../../box/types';
import { cleanup } from '../cleanup';
import { $map } from '../map';
import { DR$L, R$L } from '../types';
import { setupFilter } from './internals/setupFilter';

export type Predicate$<T> = (v: T) => Cond$B
/**
 * Filter `$source` based on another stream derived from each value.
 * 
 * `$p` will run exactly once per value, so it's ok to generate streams from it.
 * 
 * **Important**: 
 * Streams returned by `p$` will be destroyed once the item associated with it is
 * removed from `$source` OR when the resulting StreamList is destroyed.
 * It's usually less error prone to have `p$` generate new streams.
 */
export function $filter$<T>($source: R$L<T>, p$: Predicate$<T>): DR$L<T> {
    const $predicates = $map($source, (v, i) => {
        const $s = p$(v)
        $s.subscribe(() => {
            refreshItem(i)
        })
        return $s
    })

    const { refreshItem, $list } = setupFilter(
        $source,
        (_, i) => {
            const item = $predicates.item(i)
            if (item == null)
                throw new Error('No predicate stream at index: ' + i)

            return item.get()
        }
    )

    $list.addUnsub(
        cleanup($predicates, (s) => s.destroy())
    )
    $list.addUnsub(() => {
        $predicates.destroy()
        $predicates.forEach((s) => s.destroy())
    })

    return $list
}