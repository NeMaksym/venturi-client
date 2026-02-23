import { AnyTransaction } from '../types'

export const timeDesc = (a: AnyTransaction, b: AnyTransaction) => {
    return b.time - a.time
}
