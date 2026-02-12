import { Transaction } from '../types'

function getSourceValue(transaction: Transaction): string {
    if ('card' in transaction) {
        return `**** ${transaction.card.value}`
    }

    if ('account' in transaction) {
        return transaction.account.value
    }

    throw new Error('Each transaction should have account and/or card')
}

const DELIMITER = ':::'

export function getTransactionSourceValue(transaction: Transaction): string {
    return `${transaction.bankId}${DELIMITER}${getSourceValue(transaction)}`
}

export function fromTransactionSourceValue(transactionSourceValue: string): {
    bankId: string
    sourceValue: string
} {
    const [bankId, sourceValue] = transactionSourceValue.split(DELIMITER)

    if (!bankId || !sourceValue) {
        throw new Error('Invalid transaction source value')
    }

    return { bankId, sourceValue }
}
