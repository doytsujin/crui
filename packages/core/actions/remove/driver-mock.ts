import { MockNode } from '../../mocks/mockNode'
import { destroy } from '../destroyable'
import { RemoveDriver, RemoveType } from './index'

export const removeDriver: RemoveDriver<MockNode> = {
    [RemoveType]: (_, { node }, { emit }) => {
        node.detach()
        emit(node, destroy)
    }
}