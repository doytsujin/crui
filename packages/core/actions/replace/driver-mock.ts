import { MockNode } from '../../mocks/mockNode'
import { destroy } from '../destroyable'
import { ReplaceDriver, ReplaceType } from './index'

export const replaceDriver: ReplaceDriver<MockNode> = {
    [ReplaceType]: (parent, { prev, next }, { emit }) => {
        const i = parent.childNodes.indexOf(prev)
        if (i === -1)
            throw Error('Not an child of parent node')

        next.setParent(parent)
        prev.setParent(null)
        parent.childNodes.splice(i, 0, next)

        emit(prev, destroy)
    }
}