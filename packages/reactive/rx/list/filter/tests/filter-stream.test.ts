import { $filter$ } from '../$filter$';
import { map } from '../../../box/map';
import { StreamBox } from '../../../box/stream';
import { StreamList } from '../../stream';
import { R$L, RW$L } from '../../types';

const $l = <T>(list: T[]) => new StreamList(list.map($i))
const $i = <T>(val: T) => ({ value: new StreamBox(val) })
type Item<T> = { value: StreamBox<T> }
type $List<T> = R$L<Item<T>>
type W$List<T> = RW$L<Item<T>>

function expectValues<T>(list: $List<T>, expected: T[]) {
    expect(list.map((v) => v.value.get())).toEqual(expected)
}

describe($filter$, () => {
    describe('change depends on stream', () => {
        let list: W$List<number>
        let f: $List<number>

        beforeEach(() => {
            list = $l([1, 10])
            f = $filter$(list, (v) => map(v.value, (s) => s < 10))
        })

        it('properly filter it', () => {
            expectValues(f, [1])
        })

        describe('add a new value', () => {
            describe('when matches', () => {
                it('adds it', () => {
                    list.push($i(2))
                    expectValues(f, [1, 2])
                })
            })

            describe('when it does not match', () => {
                it('ignores it', () => {
                    list.push($i(10))
                    expectValues(f, [1])
                })
            })
        })

        describe('change item', () => {
            describe('new match', () => {
                it('adds it', () => {
                    list.item(1)!.value.set(9)
                    expectValues(f, [1, 9])
                })
            })

            describe('do not match', () => {
                it('removes it', () => {
                    list.item(0)!.value.set(11)
                    expectValues(f, [])
                })
            })
        })
    })

    describe('destroy', () => {
        it('destroys filter streams too', () => {
            let count = 0
            const list = $l([true, false])
            list.forEach((v) => {
                v.value.subscribe(() => ++count)
            })

            $filter$(list, (v) => v.value).destroy()
            list.forEach((v) => {
                v.value.set(false)
            })
            expect(count).toBe(0)
        })
    })
})