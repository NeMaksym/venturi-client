import { AnyTransaction, SubTransaction } from '../types'

export const timeDesc = (
    a: AnyTransaction | SubTransaction,
    b: AnyTransaction | SubTransaction
) => {
    return b.time - a.time
}
