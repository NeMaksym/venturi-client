import { SubTransaction, Transaction } from '../types'

export const timeDesc = (
    a: Transaction | SubTransaction,
    b: Transaction | SubTransaction
) => {
    return b.time - a.time
}
