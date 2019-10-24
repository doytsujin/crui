import { DRW$B } from '@crui/reactive/rx/box/types'
import { action } from '../action'
import { Action, Driver, AnyAction } from '../../types'
import { TagR } from '../../retrictions/tag'

export type $Value = DRW$B<string>
export const BindValueType = Symbol('bindValue')
export type BVTag = 'input' | 'select' | 'textarea'
export type BindValue = 
    Action<
        typeof BindValueType,
        BindValueDriver,
        TagR<BVTag>
    > & {
        stream: $Value
    }

export type BindValueDriver<N = any, S extends AnyAction = AnyAction> = {
    [BindValueType]: Driver<N, BindValue, S>
}

export function bindValue(stream: DRW$B<string>): BindValue {
    return action({ 
        type: BindValueType,
        stream 
    })
}

export type $Checked = DRW$B<boolean>
export const BindCheckedType = Symbol('bindChecked')
export type BindChecked = 
    Action<
        typeof BindCheckedType,
        BindCheckedDriver,
        TagR<'input'>
    > & {
        stream: $Checked
    }

export type BindCheckedDriver<N = any, S extends AnyAction = AnyAction> = {
    [BindCheckedType]: Driver<N, BindChecked, S>
}

export function bindChecked(stream: DRW$B<boolean>): BindChecked {
    return action({ 
        type: BindCheckedType,
        stream 
    })
}