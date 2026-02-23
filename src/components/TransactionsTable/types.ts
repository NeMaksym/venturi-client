import { AnyTransaction } from '../../types'

export type TransactionActionHandler<T> = (
    transactionId: string,
    value: T
) => void

export type TransactionDeleteHandler = (transactionId: string) => void

export type TransactionRow = AnyTransaction
