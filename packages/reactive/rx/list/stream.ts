import { Stream } from '../stream';
import { Predicate } from './filter/types';
import { RW$L, Update, UpdateType } from './types';

export class StreamList<T> extends Stream<T[], Update<T>> implements RW$L<T>
{
    item(i: number): T | undefined {
        return this.value[i]
    }

    set(newList: T[]): void {
        const oldList = this.value
        this.value = newList
        this.notify({ type: UpdateType.Replace, newList, oldList })
    }

    splice(index: number, delCount: number, added: T[]): T[] {
        if (delCount <= 0 && added.length === 0) {
            return []
        }
        index = Math.min(index, this.value.length)
        const removed = this.value.splice(index, delCount, ...added)
        this.notify({ type: UpdateType.Splice, index, removed, added })
        return removed
    }

    update(index: number, newValue: T): void {
        if (index >= this.value.length) {
            throw new Error(`Invalid index: ${index}, max ${this.value.length - 1}`)
        }
        const oldValue = this.value[index]
        this.value[index] = newValue
        this.notify({ type: UpdateType.Update, index, oldValue, newValue })
    }

    concat(items: T[]): void {
        this.splice(this.value.length, 0, items)
    }

    push(item: T): void {
        this.concat([item])
    }

    insertAt(i: number, item: T): void {
        this.splice(i, 0, [item])
    }

    deleteAt(i: number): T {
        return this.splice(i, 1, [])[0]
    }

    remove(val: T) {
        const i = this.value.lastIndexOf(val)
        if (i !== -1)
            this.splice(i, 1, [])
    }

    filter(p: Predicate<T>): T[] {
        return this.value.filter(p)
    }

    map<P>(f: (v: T, i: number) => P): P[] {
        return this.value.map(f)
    }

    forEach(f: (v: T) => void) {
        this.value.forEach(f)
    }
}